import { EventBridgeClient, PutEventsCommand, PutEventsRequestEntry } from "@aws-sdk/client-eventbridge";

export class EventPublisher {
    //private busName: string;
    private client: EventBridgeClient;

    constructor(/*busName: string*/) {
        //this.busName = busName;
        this.client = new EventBridgeClient({
            region: "us-east-1",
        });
    }

    public async send(msg: Object | string) {
        try {
            const entries: PutEventsRequestEntry[] = [
                {
                    Source: 'hoagie.twitch-chat',
                    DetailType: 'Message',
                    Detail: (typeof msg === "string") ? msg : JSON.stringify(msg)
                }
            ];
            const command = new PutEventsCommand({
                Entries: entries,
            });
            await this.client.send(command);
        } catch (err) {
            console.error(err);
        }
    }
}