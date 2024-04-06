import { EventPublisher } from "./EventPublisher";
import HoagieDbClient from "./HoagieDbClient";
import Secrets from "./Secrets";
import { StreamerSongListEventClient } from "./StreamerSongListEventClient";

export class StreamerSongListWatcher {   
    public async run() {
        const eventPublisher = new EventPublisher("hoagie.streamersonglist");
        await Secrets.init();
        const config = await (new HoagieDbClient().getConfig());
        const channels = Array.from(config?.streamers.values() ?? []);

        console.log("StreamerSongListWatcher.run");
        channels.forEach((channel) => {
            const eventClient = new StreamerSongListEventClient([channel], async (eventName: string, eventData: any) => {
               console.log({eventName, eventData});
                eventPublisher.send(eventName, {
                    channel,
                    eventData,
                });
            });
            eventClient.connectAll();
        });
    }
}