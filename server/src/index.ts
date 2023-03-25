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
interface ComponentParams {
  url: string;
  width: number;
  height: number;
  x?: number;
  y?: number;
}
interface ComponentData extends ComponentParams{
  id: string;
}
const components: ComponentData[] = [];

// Forward update messages to other connected clients (websocket connection)
app.ws('/', function(ws, req: Request<{}>) {
  clients.push(ws);
  ws.on('message', function(msg) {
    // TODO: vulnerable (naive) re-broadcasting
    for(let client of clients) {
      if(client !== ws) {
        client.send(msg)
      }
    }
  });
});

// REST ROUTES NOT IMPLEMENTED BY THE CLIENT YET

// Get all components for the session
app.get("/components", (req, res) => {
  res.status(200).send(JSON.stringify(components));
});

// Add a new component
app.post("/component/:url/:width/:height/:x?/:y?", (req: Request<ComponentParams>, res) => {
  const id = randomUUID();
  const {url, width, height, x, y} = req.params;
  components.push({id, url, width, height, x, y})
  res.send(200);
})

// Test endpoint
app.get("/", (req, res, err) => {
  res.send("Hello");
})

app.listen(SERVER_PORT, () => {
  console.log(`Express server listening on port ${SERVER_PORT}`);
})