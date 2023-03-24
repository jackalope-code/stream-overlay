import WebSocket, { WebSocketServer } from 'ws';
import redis from 'redis'
import express from 'express';
import {Request} from 'express';
import cors from 'cors';
import expressWs from "express-ws";
import {randomUUID} from "crypto";

const SERVER_PORT = "4000";

function mockMovingCheck(id: any) {
  if( id === "1") {
    return true;
  } else if (id === "2") {
    return true;
  }
}

let appBase = express();
let wsInstance = expressWs(appBase);
let { app } = wsInstance;


app.use(cors<cors.CorsRequest>(
  {
    origin: "http://localhost:3000"
  })
)

// TODO: AUTH LAYER HERE

interface WebSocketClient {
  id: string;
  ws: WebSocket;
};

// TODO: CL
const clients: WebSocket[] = [];

app.ws('/', function(ws, req: Request<{}>) {
  const id = randomUUID();
  clients.push(ws);
  ws.on('message', function(msg) {
    // TODO: vulnerable (naive) broadcasting
    for(let client of clients) {
      // TODO: Normally an ok check for client side updates but this is a workaround bc nothing is moved without it rn
      // if(client !== ws) {
        client.send(msg)
      // }
    }
  });
});

app.get("/components/:id", (req: Request<{id: string}>, res, err) => {
  res.status(200).json({id: req.params.id, moving: mockMovingCheck(req.params.id)})
});

app.get("/", (req, res, err) => {
  res.send("Hello");
})

app.listen(SERVER_PORT, () => {
  console.log(`Express server listening on port ${SERVER_PORT}`);
})