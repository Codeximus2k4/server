import express from 'express';
import * as http from 'http';
import {WebSocketServer} from 'ws';
import { WebSocketConnection } from './lib/ws';
const main = () => {
   const app = express();
   const server = http.createServer(app);
   const websocket = new WebSocketServer({ server ,path: '/ws'});
   const port = 8000;
   WebSocketConnection(websocket);
   server.listen(port, () => {
     console.log(`Server started at http://localhost:${port}`);
   });

}
export {main}