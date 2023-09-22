import { EventPublisher } from "./EventPublisher";
import { CheerEvent, ResubEvent, SubEvent } from "./EventTypes";
import { resubEvent } from "./testData";

async function run() {
    const eventPublisher = new EventPublisher();
    const streamId = "test-stream-id";
    await eventPublisher.send(streamId, "resub", resubEvent);
}

run();
