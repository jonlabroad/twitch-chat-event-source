import { EventBridgeClient, PutEventsCommand, PutEventsRequestEntry } from "@aws-sdk/client-eventbridge";

export class EventPublisher {
    private client: EventBridgeClient;
    private baseType: string;

    constructor(baseType: string) {
        this.baseType = baseType;
        this.client = new EventBridgeClient({
            region: "us-east-1",
        });
    }

    public async send(type: string, msg: Object | string) {
        const isDev = process.env.NODE_ENV !== "production";
        try {
            const entries: PutEventsRequestEntry[] = [
                {
                    Source: `${this.baseType}${isDev ? "-dev" : ""}`,
                    DetailType: type,
                    Detail: (typeof msg === "string") ? msg : JSON.stringify({
                        ...msg,
                    })
                }
            ];
            const command = new PutEventsCommand({
                Entries: entries,
            });
            const response = await this.client.send(command);
            if (!!response?.FailedEntryCount) {
                console.error(response);
            }
        } catch (err) {
            console.error(err);
        }
    }
}