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

// Track all connected websocket clients
// TODO: Limits?
const clients: WebSocket[] = [];

// Forward update messages to other connected clients
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

app.get("/", (req, res, err) => {
  res.send("Hello");
})

app.listen(SERVER_PORT, () => {
  console.log(`Express server listening on port ${SERVER_PORT}`);
})