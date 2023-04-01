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
    origin: ["http://localhost:3000", "http://frontend:3000"]
  })
)

app.use(express.json());

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

interface WSComponentUpdateMessage { 
  type: 'update';
  componentId: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface WSConnectMessage {
  type: 'connect';
  clientId: string;
}

interface WSComponentAddMessage {
  type: 'add';
  componentId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  url: string;
}

interface WSOverlayUpdateMessage {
  type: 'overlay';
  width: number;
  height: number;
}

type BroadcastMessage =
  WSConnectMessage |
  WSComponentAddMessage |
  WSComponentUpdateMessage |
  WSOverlayUpdateMessage;


function broadcastAll(msg: BroadcastMessage) {
  for(let client of Object.values(clients)) {
    client.send(JSON.stringify(msg));
  }
}

function broadcastExcludeId(msg: BroadcastMessage, ignoreId: string) {
  for(let id of Object.keys(clients)) {
    if(id !== ignoreId) {
      clients[id].send(JSON.stringify(msg));
    }
  }
}

function broadcastExcludeClient(msg: BroadcastMessage, ignoreClient: WebSocket) {
  for(let client of Object.values(clients)) {
    if(client !== ignoreClient) {
      client.send(JSON.stringify(msg));
    }
  }
}

// Once a websocket connection is established, clients will receive other
// client updates and broadcast updates made from REST through websockets
// until the client is disconnected.
// TODO: Connection limiting?
// TODO: Update limiting from client?
// TODO: Just move routes into here? What was I thinking? WS is always used anyways.
app.ws('/', function(ws, req: Request<{}>) {
  // Assign client ID on connection
  const clientId = randomUUID();
  clients[clientId] = ws;
  ws.send(JSON.stringify({type: 'connect', clientId}));
  // Forward update messages to other connected clients (websocket connection)
  // Requires these parameters from the client or the client breaks:
  // type:  event
  // x
  // y
  // componentId
  // On connect:
  // type: connect
  // clientId: number
  // TODO: Type security on WS message shape
  ws.on('message', function(msg) {
    // TODO: Validate parameters
    const rawData = JSON.parse(msg.toString());
    const {componentId, x, y, width, height} = rawData;
    const updatedObject = {...components[componentId], x, y, width, height}
    components[componentId] = updatedObject;
    broadcastExcludeClient({...updatedObject, componentId, type: 'update'}, ws);
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
  res.status(200).json(allComponents);
});

// Get overlay dimensions
app.get("/overlay", (req, res, err) => {
  res.send(overlayDimensions)
})

// Resize overlay
// Lower bound is 100x100
// TODO: Upper bounds (on screen and off screen)
// TODO: Implement sessions after storage
app.put("/overlay", (req: Request<{width: number, height: number}>, res) => {
  const {width, height} = req.body;
  if(width <= 100 || height <= 100) {
    throw new Error("Minimum overlay size is 100x100");
  }
  // TODO: why is this received as a string? Converting this is annoying
  const numericWidth = parseInt(width);
  const numericHeight = parseInt(height);
  // Update what the server stores
  overlayDimensions = {width: numericWidth, height: numericHeight};
  console.log(overlayDimensions)
  // Network updates
  broadcastAll({...overlayDimensions, type: 'overlay'});
  res.sendStatus(200);
})

// Express middleware.
// Following routes require a client ID generated from the server on
// a new websocket connection. It is expected that the client holds
// onto its ID and sends it with REST POST/PUT update messages.
app.use((req: Request, res: any, next: any) => {
  const {clientId} = req.body;
  if(!clientId) {
    throw new Error("Missing clientId from request body.");
  }
  res.locals.clientId = clientId;
  next();
});

// Add a new component
// TODO: Validation and number truncation w/ POST and PUT.
//       This accepts strings rn and should not.
app.post("/component", (req, res) => {
  const componentId = randomUUID();
  const {url, width, height, x, y} = req.body;
  const data = {componentId, url, width, height, x, y};
  components[componentId] = data;
  broadcastExcludeId({...data, type: 'add'}, res.locals.clientId);
  res.send(data);
});

// Edit component fields except for url
app.put("/component/:componentId", (req, res) => {
  const {componentId} = req.params;
  const {width, height, x, y} = req.body;
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
    broadcastExcludeId({...data, type: 'update'}, res.locals.clientId);
    res.send(data);
  }
});

// Error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const status = err.status || 400;
  res.status(status).send(err.message);
});

app.listen(SERVER_PORT, () => {
  console.log(`Express server listening on port ${SERVER_PORT}`);
})