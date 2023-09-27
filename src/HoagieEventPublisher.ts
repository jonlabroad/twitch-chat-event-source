import { EventBridge } from "aws-sdk";
import { PutEventsRequest, PutEventsRequestEntry } from "aws-sdk/clients/eventbridge";

export class HoagieEventPublisher {
    private static topic = "chateventsource.status";

    public static async publishToTopic<T = any>(detail: T) {
        const eventBridge = new EventBridge();
        const source = "hoagie.topic";
        const detailType = HoagieEventPublisher.topic;
        const event: PutEventsRequestEntry = {
            Source: source,
            DetailType: detailType,
            Detail: JSON.stringify({
                ...detail,
                topic: HoagieEventPublisher.topic,
            })
        }

        const params: PutEventsRequest = {
            Entries: [
                event
            ]
        }

        try {
            console.log(`Publishing to topic '${HoagieEventPublisher.topic}'`);
            console.log(params);
            await eventBridge.putEvents(params).promise();
        } catch(err: any) {
            console.error(`Failed to publish a topic '${HoagieEventPublisher.topic}' event: ${err.message}`)
        }
    }
}