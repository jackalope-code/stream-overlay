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
    origin: "http://localhost:3000"
  })
)

// TODO: AUTH LAYER HERE

// TODO: There is one session. Session management is not implemented

// Track all connected websocket clients
// TODO: Limits?
const clients: WebSocket[] = [];

// Track all networked components
// TODO: There is no expectation of persistance
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
const components: ComponentMap = {};

function broadcast(msg: WebSocket.RawData, ignoreClient?: WebSocket) {
  if(ignoreClient !== undefined) {
    for(let client of clients) {
      if(client !== ignoreClient) {
        client.send(msg)
      }
    }
  } else {
    for(let client of clients) {
      client.send(msg)
    }
  }
}
// Forward update messages to other connected clients (websocket connection)
app.ws('/', function(ws, req: Request<{}>) {
  clients.push(ws);
  ws.on('message', function(msg) {
    // TODO: vulnerable (naive) re-broadcasting
    broadcast(msg, ws);
  });
});

// UNTESTED REST ROUTES NOT IMPLEMENTED BY THE CLIENT YET
// TODO: NONE OF THESE ARE BROADCASTING UPDATES AKA THEYRE BROKEN FOR NOW
//    The client would get confused by receiving its own broadcast events and
//    there's no ws variable scope here to filter that client out
//    AAAUUUUUUUUGGGHH

// Get all components for the session
app.get("/components", (req, res) => {
  res.status(200).send(JSON.stringify(components));
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

// Test endpoint
app.get("/", (req, res, err) => {
  res.send("Hello");
})

app.listen(SERVER_PORT, () => {
  console.log(`Express server listening on port ${SERVER_PORT}`);
})