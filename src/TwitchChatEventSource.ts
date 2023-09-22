import * as tmi from "tmi.js"
import HoagieDbClient from "./HoagieDbClient";
import Secrets from "./Secrets";
import TwitchClient from "./TwitchClient";
import { EventPublisher } from "./EventPublisher";
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
            await Secrets.init();
            const config = await (new HoagieDbClient("n/a").getConfig());
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
                if (userstate.mod) {
                    this.print({ channel, userstate, message });
                    this.publish(this.getStreamId(channel), "message", { channel, userstate, message, selfBool })
                }
            });

            client.on("roomstate", (channel, state) => {
                //this.print({ channel, state });
                //this.publish(this.getStreamId(channel), "roomstate", { channel, state })
            });

            client.on("cheer", (channel, userstate, message) => {
                this.print({ type: "cheer", user: userstate["display-name"], message });
                this.publish(this.getStreamId(channel), "cheer", { channel, userstate, message })
            })

            client.on("subscription", (channel, username, methods, message, userstate) => {
                this.print({ type: "subscription", username, message, methods });
                this.publish(this.getStreamId(channel), "subscription",  { channel, username, methods, message, userstate });
            })

            client.on("resub", (channel, username, months, message, userstate, methods: any) => {
                this.print({ type: "resub", username, message, months, plan: methods['msg-param-sub-plan'] });
                this.publish(this.getStreamId(channel), "resub", { channel, username, months, message, userstate, methods });
            })

            client.on("subgift", (channel, username, streakMonths, recipient, methods, userstate) => {
                this.print({ type: "subgift", username, recipient, streakMonths, methods, plan: methods['msg-param-sub-plan'] });
                this.publish(this.getStreamId(channel), "subgift", { channel, username, streakMonths, recipient, userstate });
            })

            client.on("connected", (address, port) => {
                this.print("connected");
            });
            client.on("disconnected", async (reason) => {
                this.print({ disconnected: reason });
            })
            client.connect();
        } catch (err) {
            console.error(err);
            throw err
        }
    }

    private getStreamId(channel: string) {
        return this.streamInfo[channel.replace("#", "").toLowerCase()]?.id;
    }

    private print(msg: any) {
        console.log(msg);
        if (this.printToFile) {
            fs.appendFile("messages.json", JSON.stringify(msg, undefined, 2), () => {});
            fs.appendFile("messages.json", "\n", () => {});
        }
    }

    private async publish(streamId: string, type: string, msg: any) {
        return this.eventPublisher.send(streamId, type, msg);
    }

    private async sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}