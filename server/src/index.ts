import WebSocket from 'ws';
import express from 'express';
import {Request} from 'express';
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

// TODO: There is one session. Session management is not implemented

interface ComponentCommonParams {
  width: number;
  height: number;
  x?: number;
  y?: number;
}
interface ComponentUpdateParams extends ComponentCommonParams {
  id: number;
}
interface ComponentAllParams extends ComponentCommonParams {
  url: string;
};
interface ComponentMap {
  [key: string]: ComponentAllParams;
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

function filterID(id: string) {

}

function filterWSClient(ws: WebSocket) {

}

function broadcast(msg: string, ignoreClient?: WebSocket) {
  if(ignoreClient !== undefined) {
    for(let client of Object.values(clients)) {
      if(client !== ignoreClient) {
        client.send(msg)
      }
    }
  } else {
    for(let client of Object.values(clients)) {
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
    broadcast(JSON.stringify({x, y}), ws);
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

// UNTESTED REST ROUTES NOT IMPLEMENTED BY THE CLIENT YET
// TODO: NONE OF THESE ARE BROADCASTING UPDATES AKA THEYRE BROKEN FOR NOW
//    The client would get confused by receiving its own broadcast events and
//    there's no ws variable scope here to filter that client out
//    AAAUUUUUUUUGGGHH

// TODO: implement a generated client id for each ws client session and use this for tracking

// Get all components for the session
app.get("/components", (req, res) => {
  res.status(200).send(JSON.stringify(Object.entries(components));
});

// Add a new component
app.post("/component/:url/:width/:height/:x?/:y?", (req: Request<ComponentAllParams>, res) => {
  const id = randomUUID();
  const {url, width, height, x, y} = req.params;
  components[id] = {url, width, height, x, y};
  res.send(200);
});

// Edit component fields except for url
app.put("/component/:id/:width?/:height?/:x?/:y?", (req: Request<ComponentUpdateParams>, res) => {
  const {id, width, height, x, y} = req.params;
  if(id in components) {
    const {
      width: componentWidth,
      height: componentHeight,
      x: componentX,
      y: componentY
    } = components[id];
    components[id].width = width || componentWidth;
    components[id].height = height || componentHeight;
    components[id].x = x || componentX;
    components[id].y = y || componentY;
  }
});

// Resize overlay
app.put("/overlay/:width/:height", (req: Request<{width: number, height: number}>, res) => {
  const {width, height} = req.params;

})

// Test endpoint
app.get("/", (req, res, err) => {
  res.send("Hello");
})

app.listen(SERVER_PORT, () => {
  console.log(`Express server listening on port ${SERVER_PORT}`);
})