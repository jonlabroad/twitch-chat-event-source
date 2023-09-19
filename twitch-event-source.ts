"use strict";

import { DescribeTasksCommand, DescribeTasksCommandOutput, ECSClient, ListTaskDefinitionsCommand, ListTasksCommand, RunTaskCommand, StopTaskCommand } from "@aws-sdk/client-ecs";
import { APIGatewayProxyEvent } from "aws-lambda";

const ecs = new ECSClient({ region: "us-east-1" });
const clusterName = "arn:aws:ecs:us-east-1:796987500533:cluster/TwitchChatEventSource";
const serviceName = "TwitchChatEventSource";
const taskDefinition = "arn:aws:ecs:us-east-1:796987500533:task-definition/TwitchChatEventSource:7"; // auto revision?

interface TaskRequest {
    operation: "start" | "stop";
    channel: string;
    streamId: string;
}

module.exports.controltask = async (event: TaskRequest) => {
    const listTasksResult = await ecs.send(new ListTasksCommand({
        cluster: clusterName,
    }));
    console.log(JSON.stringify(listTasksResult, null, 2));

    let describeTasksResponse: DescribeTasksCommandOutput | undefined = undefined;
    if (listTasksResult.taskArns && listTasksResult.taskArns.length > 0) {
        describeTasksResponse = await ecs.send(new DescribeTasksCommand({
            cluster: clusterName,
            include: ["TAGS"],
            tasks: listTasksResult.taskArns || [],
        }));
        console.log(JSON.stringify(describeTasksResponse, null, 2));
    }

    if (event.operation === "start") {
        // Is there an existing one?
        const existingTask = findStreamTask(event, describeTasksResponse);
        if (existingTask) {
            console.error("Cannot start task: task already exists");
            return;
        }

        const runTaskCommand = await ecs.send(new RunTaskCommand({
            cluster: clusterName,
            taskDefinition: taskDefinition,
            count: 1,
            launchType: "FARGATE",
            networkConfiguration: {
                awsvpcConfiguration: {
                    assignPublicIp: "ENABLED",
                    subnets: [
                        "subnet-180f4541",
                        "subnet-6388ee06",
                        "subnet-1e98e735",
                        "subnet-299eae5e",
                        "subnet-270cec1a",
                        "subnet-672fad6b"
                    ],
                    securityGroups: [
                        "sg-90b33ef7",
                    ],
                },
            },
            tags: [
                {
                    key: "twitch-channel",
                    value: event.channel,
                },
                {
                    key: "stream-id",
                    value: event.streamId,
                }
            ],
            overrides: {
                containerOverrides: [
                    {
                        name: "twitch-chat-event-source",
                        environment: [
                            {
                                name: "TWITCH_CHANNEL",
                                value: event.channel,
                            },
                            {
                                name: "TWITCH_STREAM_ID",
                                value: event.streamId
                            }
                        ],
                    },
                ],
            }
        }));
        console.log({ runTaskCommand });
    } else if (event.operation === "stop") {
        if (listTasksResult.taskArns) {
            const existingTask = findStreamTask(event, describeTasksResponse);
            if (!existingTask) {
                console.error("Cannot stop task: No task is currently running");
                return;
            }

            const listTasksResponse = await ecs.send(new StopTaskCommand({
                cluster: clusterName,
                task: listTasksResult.taskArns[0]
            }));
            console.log({ listTasksResponse });
        } else {
            console.warn("No tasks to stop");
        }
    }

    const listTasksResultEnd = await ecs.send(new ListTasksCommand({
        cluster: clusterName,
    }));
    console.log({ listTasksResultEnd });
};

function findStreamTask(event: TaskRequest, describeTasksResponse: DescribeTasksCommandOutput | undefined) {
    const task = describeTasksResponse?.tasks?.find(task => (
        task.tags?.find(tag => tag.key === "twitch-channel" && tag.value === event.channel) &&
        task.tags?.find(tag => tag.key === "stream-id" && tag.value === event.streamId)
    ));
    return task;
}
