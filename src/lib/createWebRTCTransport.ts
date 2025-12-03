import type { Router } from "mediasoup/types";
import {config} from '../config.js';

const createWebRTCTransport = async(mediasoupRouter: Router) => {
    // Placeholder for creating a WebRTC transport
    const {
        maxIncomingBitrate,
        initialAvailableOutgoingBitrate
    } =  config.mediasoup.WebRtcTransport;
    const transport = await mediasoupRouter.createWebRtcTransport({
        listenIps: config.mediasoup.WebRtcTransport.listenIps,
        enableUdp: true,
        enableTcp: true,
        preferUdp: true,
        initialAvailableOutgoingBitrate 
    });

    if (maxIncomingBitrate){
        try{
            await transport.setMaxIncomingBitrate(maxIncomingBitrate);
        } catch (error){
            console.error("Error setting max incoming bitrate:", error);
        }
    }
    
    return {
        transport,
        params: {
            id: transport.id,
            iceParameters: transport.iceParameters,
            iceCandidates: transport.iceCandidates,
            dtlsParameters: transport.dtlsParameters,
            iceServers: [
        {
            // FREE TURN SERVER provided by third party for testing purposes: 
            // turn:openrelay.metered.ca:80 , 
            // turn:numb.viagenie.ca:3478 (this one need an username that is like an email)
            // check out free tire from twilio too
            urls: 'turn:openrelay.metered.ca:80',
            username: 'openrelayproject',
            credential: 'openrelayproject'
        }
    ]
            
        }
    }
}


export {createWebRTCTransport};
