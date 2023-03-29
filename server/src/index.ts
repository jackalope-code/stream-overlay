import WebSocket from 'ws';
import express, {Request, Response, NextFunction} from 'express';
import cors from 'cors';
import expressWs from "express-ws";
import {randomUUID} from "crypto";

const SERVER_PORT = "4000";

let appBase = express();
let wsInstance = expressWs(appBase);
let { app } = wsInstance;

app.use(cors<cors.CorsRequest>(
  {
    origin: ["http://localhost:3000"]
  })
)

// TODO: AUTH LAYER HERE

// TODO: There is one session. Session management is not implemented.

interface ComponentUpdateParams {
  componentId: string;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
}

interface ComponentParams {
  url: string;
  width: number;
  height: number;
  x: number;
  y: number
}

interface ComponentAllParams extends ComponentParams{
  componentId: string;
}

interface OverlayDimensions {
  width: number;
  height: number;
}

interface ComponentMap {
  [key: string]: ComponentParams;
}
interface ClientMap {
  [key: string]: WebSocket
}

// Track all connected websocket clients
// TODO: Limits?
let clients: ClientMap = {};

// Track all networked components
// TODO: There is no expectation of persistance
const components: ComponentMap = {};

// Default to 1920x1080 for now
let overlayDimensions: OverlayDimensions = {
  width: 1920,
  height: 1080
}
function broadcastAll(msg: string) {
  for(let client of Object.values(clients)) {
    client.send(msg)
  }
}

function broadcastExcludeId(msg: string, ignoreId: string) {
  for(let id of Object.keys(clients)) {
    if(id !== ignoreId) {
      clients[id].send(msg)
    }
  }
}

function broadcastExcludeClient(msg: string, ignoreClient: WebSocket) {
  for(let client of Object.values(clients)) {
    if(client !== ignoreClient) {
      client.send(msg)
    }
  }
}

// Once a websocket connection is established, clients will receive other
// client updates and broadcast updates made from REST through websockets
// until the client is disconnected.
app.ws('/', function(ws, req: Request<{}>) {
  // Assign client ID on connection
  const clientId = randomUUID();
  clients[clientId] = ws;
  // Forward update messages to other connected clients (websocket connection)
  ws.on('message', function(msg) {
    console.log("connection opened")
    // TODO: Validate parameters 
    const data = JSON.parse(msg.toString());
    const {x, y} = data;
    broadcastExcludeClient(JSON.stringify({x, y}), ws);
  });
  // Remove tracked client on disconnect
  ws.on('close', function(msg) {
    for(let id of Object.keys(clients)) {
      if(clients[id] === ws) {
        delete clients[id];
        console.log("remove", id);
        break;
      }
    }
  })
});

// ==== REST ROUTES ====
// TODO: Validation and error handling

// Test endpoint
app.get("/", (req, res, err) => {
  res.send("Hello");
})

// Get all components for the session
app.get("/components", (req, res) => {
  const allComponents: ComponentAllParams[] = Object.entries(components).reduce(
    (res, [key, componentData]) => {
      res.push(Object.assign({componentId: key}, componentData));
      return res;
  }, [] as ComponentAllParams[])
  res.status(200).send(JSON.stringify(allComponents));
});

// Get overlay dimensions
app.get("/overlay", (req, res, err) => {
  res.send(overlayDimensions)
})

// Express middleware.
// Following routes require a client ID generated from the server on
// a new websocket connection. It is expected that the client holds
// onto its ID and sends it with REST POST/PUT update messages.
app.use((req: Request, res: any, next: any, err: any) => {
  const {clientId} = req.params;
  res.locals = {clientId};
  console.log("set client id " + clientId + " to locals.")
  next();
});

// Add a new component
app.post("/component/:url/:width/:height/:x/:y", (req: Request<ComponentParams>, res) => {
  const componentId = randomUUID();
  const {url, width, height, x, y} = req.params;
  const data = {componentId, url, width, height, x, y};
  components[componentId] = data;
  console.log("local sanity check", res.locals);
  broadcastExcludeId(JSON.stringify(data), res.locals.clientId)
  res.send(data);
});

// Edit component fields except for url
app.put("/component/:componentId/:width?/:height?/:x?/:y?", (req: Request<ComponentUpdateParams>, res) => {
  const {componentId, width, height, x, y} = req.params;
  if(componentId in components) {
    // Extract and rename fields from existing object
    const {
      width: componentWidth,
      height: componentHeight,
      x: componentX,
      y: componentY
    } = components[componentId];
    // Create transformed data structure from PUT updates
    const data: ComponentAllParams = {
      componentId,
      url: components[componentId].url, // Should not be editable once created
      width: width || componentWidth,
      height: height || componentHeight,
      x: x || componentX,
      y: y || componentY
    }
    // Update server component
    components[componentId] = data;
    // Send network updates
    broadcastExcludeId(JSON.stringify(data), res.locals.clientId);
    res.send(data);
  }
});

// Resize overlay
// Lower bound is 100x100
// TODO: Upper bounds
// TODO: Implement sessions after storage
app.put("/overlay/:width/:height", (req: Request<{width: number, height: number}>, res) => {
  const {width, height} = req.params;
  if(width <= 100 || height <= 100) {
    res.status(400).send("Minimum overlay size is 100x100");
  }
  overlayDimensions = {width, height};
  broadcastExcludeId(JSON.stringify(overlayDimensions), res.locals.clientId)
  res.sendStatus(200);
})

app.listen(SERVER_PORT, () => {
  console.log(`Express server listening on port ${SERVER_PORT}`);
})