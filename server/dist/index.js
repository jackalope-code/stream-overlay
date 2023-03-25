import express from 'express';
import cors from 'cors';
import expressWs from "express-ws";
import { randomUUID } from "crypto";
const SERVER_PORT = "4000";
function mockMovingCheck(id) {
    if (id === "1") {
        return true;
    }
    else if (id === "2") {
        return true;
    }
}
let appBase = express();
let wsInstance = expressWs(appBase);
let { app } = wsInstance;
app.use(cors({
    origin: "http://localhost:3000"
}));
;
// TODO: CL
const clients = [];
app.ws('/', function (ws, req) {
    const id = randomUUID();
    clients.push(ws);
    ws.on('message', function (msg) {
        // TODO: vulnerable (naive) broadcasting
        for (let client of clients) {
            if (client !== ws) {
                client.send(msg);
            }
        }
    });
});
app.get("/components/:id", (req, res, err) => {
    res.status(200).json({ id: req.params.id, moving: mockMovingCheck(req.params.id) });
});
app.get("/", (req, res, err) => {
    res.send("Hello");
});
app.listen(SERVER_PORT, () => {
    console.log(`Express server listening on port ${SERVER_PORT}`);
});
