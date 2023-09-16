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

    connected: boolean = false;

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
                channels: [...this.channels]
            });

            setInterval(async () => {
                const streamInfo = await Promise.all(this.channels.map(channel => this.twitchClient.getUserStream(channel)));
                streamInfo.forEach((info, i) => {
                    this.streamInfo[this.channels[i].toLowerCase()] = info;
                    if (info) {
                        const dbClient = new HoagieDbClient(this.channels[i]);
                        this.hoagieDbClients[this.channels[i].toLowerCase()] = dbClient;
                        if (!this.historyWritten.has(info.id)) {
                            this.print({ newStream: info.id });
                            dbClient.setStreamHistory(info.id)
                            this.historyWritten.add(info.id);
                        }
                    }
                });
            }, 5000)

            const self = this;

            setInterval(() => {
                if (!this.connected) {
                    this.print("Trying to reconnect...");
                    client.connect()
                }
            }, 1000);

            client.on("message", (channel, userstate, message, selfBool) => {
                if (userstate.mod) {
                    this.print({ channel, userstate, message });
                    this.publish({ channel, userstate, message, selfBool })
                }
            });

            client.on("roomstate", (channel, state) => {
                this.print({ channel, state });
                this.publish({ channel, state })
            });

            client.on("cheer", (channel, userstate, message) => {
                this.print({ type: "cheer", user: userstate["display-name"], message });
                this.publish({ channel, userstate, message })
            })

            client.on("subscription", (channel, username, methods, message, userstate) => {
                this.print({ type: "subscription", username, message, methods });
                this.publish({ channel, username, methods, message, userstate });
            })

            client.on("resub", (channel, username, method, message, userstate, methods: any) => {
                this.print({ type: "subscription", username, message, method, plan: methods['msg-param-sub-plan'] });
                this.publish({ channel, username, method, message, userstate, methods });
            })

            client.on("subgift", (channel, username, method, message, userstate, methods) => {
                this.print({ type: "subgift", username, message, method, methods, plan: methods['msg-param-sub-plan'] });
                this.publish({ channel, username, method, message, userstate });
            })

            client.on("connected", (address, port) => {
                this.print("connected");
                this.connected = true;
            });
            client.on("disconnected", async (reason) => {
                this.print({ disconnected: reason });
                this.connected = false;
            })
            client.connect();
        } catch (err) {
            console.error(err);
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

    private async publish(msg: any) {
        return this.eventPublisher.send(msg);
    }

    private async sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}