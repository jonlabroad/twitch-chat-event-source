export type StatusType = "connected" | "disconnected" | "status" | "startup" | "error";

export interface StatusEvent {
    type: StatusType;
    timestamp: number;
    data?: any;
}

export class TwitchChatEventSourceStatus {
    public static createEvent(type: StatusType, data?: Object) {
        return {
            type,
            timestamp: Date.now(),
            ...data
        }
    }
}