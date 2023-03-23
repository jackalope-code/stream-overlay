import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import http from 'http';
import { typeDefs, resolvers } from './schema.js';
const SERVER_PORT = "4000";
function mockMovingCheck(id) {
    if (id === "1") {
        return false;
    }
    else if (id === "2") {
        return true;
    }
}
// Required logic for integrating with Express
const app = express();
// Our httpServer handles incoming requests to our Express app.
// Below, we tell Apollo Server to "drain" this httpServer,
// enabling our servers to shut down gracefully.
const httpServer = http.createServer(app);
// Same ApolloServer initialization as before, plus the drain plugin
// for our httpServer.
const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});
// Ensure we wait for our server to start
await server.start();
// Set up our Express middleware to handle CORS, body parsing,
// and our expressMiddleware function.
app.use('/', cors({
    origin: "http://localhost:3000"
}), bodyParser.json(), 
// expressMiddleware accepts the same arguments:
// an Apollo Server instance and optional configuration options
expressMiddleware(server, {
    context: async ({ req }) => ({ token: req.headers.token }),
}));
// Modified server startup
await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));
console.log(`🚀 Server ready at http://localhost:4000/`);
app.use(cors());
app.get("/components/:id", (req, res, err) => {
    res.status(200).json({ id: req.params.id, moving: mockMovingCheck(req.params.id) });
});
app.get("/", (req, res, err) => {
    res.send("Hello");
});
app.listen(SERVER_PORT, () => {
    console.log(`Express server listening on port ${SERVER_PORT}`);
});
