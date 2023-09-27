"use strict";

import { DescribeServicesCommand, DescribeTasksCommand, DescribeTasksCommandOutput, ECSClient, ListServicesCommand, ListTaskDefinitionsCommand, ListTasksCommand, RunTaskCommand, StopTaskCommand, UpdateServiceCommand } from "@aws-sdk/client-ecs";
import { EventBridgeEvent } from "aws-lambda";
import HoagieDbClient from "./src/HoagieDbClient";
import TwitchClient from "./src/TwitchClient";
import Secrets from "./src/Secrets";

const ecs = new ECSClient({ region: "us-east-1" });
const clusterName = "arn:aws:ecs:us-east-1:796987500533:cluster/TwitchChatEventSource";
const serviceName = "TwitchChatEventSource";

module.exports.handleStreamStart = async (event: EventBridgeEvent<any, any>) => {
    console.log({ event });
    await startServiceIfNotRunning();
}

module.exports.handleStreamStop = async (event: EventBridgeEvent<any, any>) => {
    await Secrets.init(); // TODO start using SSM
    console.log({ event });
    const streams = await getCurrentLiveStreams();
    if (streams && streams.length <= 0) {
        const serviceDescription = await getServiceDescription();
        if (!serviceDescription) {
            throw new Error(`Cannot find service description for ${serviceName} in cluster ${clusterName}`);
        }

        if ((serviceDescription.desiredCount ?? 0) >= 1) {
            console.log(`No streams are live, stopping service`);
            await setServiceDesiredCount(0);
        }
    }
}

module.exports.scheduledShutdown = async (event: any) => {
    console.log({ event });
    const serviceDescription = await getServiceDescription();
    if (!serviceDescription) {
        throw new Error(`Cannot find service description for ${serviceName} in cluster ${clusterName}`);
    }

    if ((serviceDescription.desiredCount ?? 0) >= 1) {
        console.log(`Stopping service`);
        await setServiceDesiredCount(0);
    }
}

async function startServiceIfNotRunning() {
    const serviceDescription = await getServiceDescription();
    if (!serviceDescription) {
        throw new Error(`Cannot find service description for ${serviceName} in cluster ${clusterName}`);
    }

    if ((serviceDescription.desiredCount ?? 0) <= 0) {
        console.log(`Starting service`);
        await setServiceDesiredCount(1);
    }
}

async function getServiceDescription() {
    const describeServices = await ecs.send(new DescribeServicesCommand({
        cluster: clusterName,
        services: [serviceName],
    }));
    console.log({ describeServices});

    const serviceDescription = describeServices?.services?.[0];
    return serviceDescription;
}

async function setServiceDesiredCount(desiredCount: number) {
    const runTask = await ecs.send(new UpdateServiceCommand({
        cluster: clusterName,
        service: "TwitchChatEventSource",
        desiredCount: desiredCount,            
    }));
    console.log({ runTask });
    return runTask;
}

async function getCurrentLiveStreams() {
    const config = await new HoagieDbClient().getConfig();
    if (!config) {
        throw new Error(`Cannot find config`);
    }

    console.log({ config });
    const twitchClient = new TwitchClient();
    const streamerStreams = await twitchClient.getStreamsByUsernames([...config.streamers], "live");
    console.log(`Current live streams: ${JSON.stringify(streamerStreams)}`);
    return streamerStreams;
}
