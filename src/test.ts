import { EventPublisher } from "./EventPublisher";
import { CheerEvent, ResubEvent, SubEvent } from "./EventTypes";
import { resubEvent } from "./testData";

async function run() {
    const eventPublisher = new EventPublisher();
    await eventPublisher.send("resub", resubEvent);
}

run();
