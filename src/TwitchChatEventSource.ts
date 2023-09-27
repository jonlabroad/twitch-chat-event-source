import * as tmi from "tmi.js"
import HoagieDbClient from "./HoagieDbClient";
import Secrets from "./Secrets";
import TwitchClient from "./TwitchClient";
import { EventPublisher } from "./EventPublisher";
import { HoagieEventPublisher } from "./HoagieEventPublisher";
import { TwitchChatEventSourceStatus } from "./TwitchChatEventSourceStatus";
const fs = require('fs');

export default class TwitchDonoWatcher {
    channels: string[] = [];
    streamInfo: Record<string, any> = {};
    twitchClient = new TwitchClient();
    hoagieDbClients: Record<string, HoagieDbClient> = {};
    historyWritten = new Set<string>();
    eventPublisher = new EventPublisher();

    printToFile: boolean = false; // DON'T COMMIT true!

    constructor() {
    }

    public async run() {
        try {
            HoagieEventPublisher.publishToTopic(TwitchChatEventSourceStatus.createEvent("startup"));
            await Secrets.init();
            const config = await (new HoagieDbClient().getConfig());
            this.channels = Array.from(config?.streamers.values() ?? []);
            this.print(this.channels);
            const client = new tmi.Client({
                options: {
                    debug: true,
                },
                connection: {
                    reconnect: true,
                },
                channels: [...this.channels]
            });

            const self = this;

            client.on("message", (channel, userstate, message, selfBool) => {
                const channelName = channel.replace("#", "").toLowerCase();
                const isBroadcaster = channelName === userstate.username?.toLowerCase();
                if (userstate.mod || isBroadcaster) {
                    // this.print({ channel, userstate, message });
                    this.publish("message", { channel, userstate, message, selfBool })
                }
            });

            client.on("roomstate", (channel, state) => {
                //this.print({ channel, state });
                //this.publish(this.getStreamId(channel), "roomstate", { channel, state })
            });

            client.on("cheer", (channel, userstate, message) => {
                this.print({ type: "cheer", user: userstate["display-name"], message });
                this.publish("cheer", { channel, userstate, message })
            })

            client.on("subscription", (channel, username, methods, message, userstate) => {
                this.print({ type: "subscription", username, message, methods });
                this.publish("subscription",  { channel, username, methods, message, userstate });
            })

            client.on("resub", (channel, username, months, message, userstate, methods) => {
                this.print({ type: "resub", channel, username, months, message, userstate, methods });
                this.publish("resub", { channel, username, months, message, userstate, methods });
            })

            client.on("subgift", (channel, username, streakMonths, recipient, methods, userstate) => {
                this.print({ type: "subgift", channel, username, recipient, streakMonths, methods });
                this.publish("subgift", { channel, username, streakMonths, recipient, methods, userstate });
            })

            client.on("connected", (address, port) => {
                this.print("connected");
                HoagieEventPublisher.publishToTopic(TwitchChatEventSourceStatus.createEvent("connected"));
            });
            client.on("disconnected", async (reason) => {
                this.print({ disconnected: reason });
                HoagieEventPublisher.publishToTopic(TwitchChatEventSourceStatus.createEvent("disconnected"));
            })
            client.connect();
        } catch (err: any) {
            console.error(err);
            HoagieEventPublisher.publishToTopic(TwitchChatEventSourceStatus.createEvent("error", { message: err?.message }));
            throw err
        }
    }

    private print(msg: any) {
        console.log(msg);
        if (this.printToFile) {
            fs.appendFile("messages.json", JSON.stringify(msg, undefined, 2), () => {});
            fs.appendFile("messages.json", "\n", () => {});
        }
    }

    private async publish(type: string, msg: any) {
        return this.eventPublisher.send(type, msg);
    }

    private async sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}