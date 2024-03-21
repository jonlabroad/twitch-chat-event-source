import io from 'socket.io-client';
import { StreamerSongListApiClient } from "./StreamerSongListApiClient";

const allEvents = [
    'join-room',
    'leave-room',
    'new-song',
    'reload-song-list',
    'update-song',
    'update-songs',
    'delete-song',
    'queue-update',
    'reload-saved-queue',
    'queue-event',
    'new-playhistory',
    'update-playhistory',
    'delete-playhistory',
    'update-streamer',
    'update-attributes',  
];

interface ConnectionInfo {
    sslId: string;
    connected: boolean;
}

export class StreamerSongListEventClient {
    private eventHandler: (eventName: string, eventData: any) => void;
    private connectionInfo: Record<string, ConnectionInfo> = {};
    private broadcasterUsernames: string[] = [];
    private static baseUrl = "https://api.streamersonglist.com";
    private sslToStreamerName: Record<string, string> = {};

    constructor(broadcasterUsernames: string[], eventHandler: (eventName: string, eventData: any) => void) {
        this.eventHandler = eventHandler;
        this.broadcasterUsernames = broadcasterUsernames.map((username) => username.toLowerCase());
    }

    public async connectAll() {
        const sslIds = (await Promise.all(this.broadcasterUsernames.map(async (broadcasterUsername) => {
            const sslClient = new StreamerSongListApiClient();
            try {
                const streamer = await sslClient.getTwitchStreamer(broadcasterUsername);
                this.sslToStreamerName[streamer.id.toString()] = broadcasterUsername;
                this.connectionInfo[broadcasterUsername] = {
                    sslId: streamer.id.toString(),
                    connected: false
                };
                return streamer.id.toString();
            } catch (err) {
                return undefined;
            }
        }))).filter((id) => !!id) as string[];
        console.log({ sslIds });

        const ioClient = io(StreamerSongListEventClient.baseUrl, { transports: ["websocket"] });
        console.log("Connecting to SSL");
        
        ioClient.on('connect', () => {
            // streamerId is the numeric `id` from `/streamers/<streamer-name` endpoint
            // but needs to be cast as a string for the socket event
            console.log("SSL connected");
            sslIds.forEach((streamerId) => {
                console.log(`Joining SSL room ${streamerId}`);
                ioClient.emit('join-room', `${streamerId}`);
            });
        });

        allEvents.forEach((eventName) => {
            ioClient.on(eventName, (data) => {
                this.eventHandler(eventName, data);
            });
        });
    }
}