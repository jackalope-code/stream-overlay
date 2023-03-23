import redis from 'redis'
import express from 'express';
import {Request} from 'express';

const app = express();
const SERVER_PORT = "4000";

function mockMovingCheck(id: any) {
  if( id === "1") {
    return false;
  } else if (id === "2") {
    return true;
  }
}

app.get("/components/:id", (req: Request<{id: string}>, res, err) => {
  res.status(200).json({id: req.params.id, moving: mockMovingCheck(req.params.id)})
});

app.get("/", (req, res, err) => {
  res.send("Hello");
})

app.listen(SERVER_PORT, () => {
  console.log(`Express server listening on port ${SERVER_PORT}`)
})