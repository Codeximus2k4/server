import type { WebSocketServer,WebSocket } from "ws";
import { createWorker } from "./worker.js";
import type { Producer, Router, Transport } from "mediasoup/types";
import { createWebRTCTransport } from "./createWebRTCTransport.js";

let mediasoupRouter: Router;
let producerTransport: Transport;
let producer: Producer;
const WebSocketConnection =  async(websock:   WebSocketServer )=>{
    try {
        mediasoupRouter = await createWorker();
    } catch (error) {
        console.error("Failed to create mediasoup worker:", error);
        throw error;
    }
    websock.on('connection', (ws: WebSocket)=>{
        ws.on('message', (message: string) => {
            const jsonValidation  = IsJsonString(message);
            if (!jsonValidation) {
                console.error("Invalid JSON string received:", message);
                return;
            }
            
            const event =  JSON.parse(message);
            switch (event.type){
                case 'getRouterRtpCapabilities':
                    onRouterRtpCapabilities(event,ws);
                    break;
                case 'createProducerTransport':
                    onCreateProducerTransport(event,ws);
                    break;
                case 'connectProducerTransport':
                    onConnectProducerTransport(event,ws);
                    break;
                case 'produce':
                    onProduce(event,ws, websock);
                    break;
                default:
                    break;
            }
        });
    });

    const IsJsonString = (str: string) => {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }
    
    const onRouterRtpCapabilities = (event: string, ws: WebSocket) => {
        send(ws, "routerRtpCapabilities", mediasoupRouter.rtpCapabilities);
    }
    const onCreateProducerTransport = async(event: string, ws: WebSocket) => {
        try{
            const {transport,params} = await createWebRTCTransport(mediasoupRouter);
            producerTransport = transport;
            send(ws, "ProducerTransportCreated", params);
        } catch(error){
            console.error("Error creating producer transport:", error);
            send(ws, "error", error);
        }
    }
        const onConnectProducerTransport = async(event: any, ws: WebSocket) => {
            await producerTransport.connect({
                dtlsParameters: event.dtlsParameters
            })
            send(ws, "ProducerTransportConnected", "");
        }
        const onProduce = async(event: any, ws: WebSocket,websocket: WebSocketServer) => {
            const {kind,rtpParameters} = event;
            producer = await producerTransport.produce({kind, rtpParameters});
            const resp = {
                id: producer.id,
            }
            send(ws, "produced", resp);
            broadcast(websock, "newProducer", 'new user');
    }
    const send = (ws: WebSocket, type: string,msg: any) => {
        const message = {
            type,
            data:msg
        }
        const resp = JSON.stringify(message);
        ws.send(resp);
    }
    const broadcast = (ws: WebSocketServer, type:string, msg:any) => {
        
            const message  ={
                type,
                data:msg
            }
            const resp = JSON.stringify(message);
            ws.clients.forEach((client)=>{
                client.send(resp);
            })
    }

}
export {WebSocketConnection};