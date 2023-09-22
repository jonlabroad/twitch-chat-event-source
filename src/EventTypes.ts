import * as tmi from "tmi.js";

export interface ChatEventType {
  version: string;
  id: string;
  "detail-type": "message" | "cheer" | "subscription" | "resub" | "subgift";
  source: string;
  account: string;
  time: string;
  region: string;
  resources: any[];
}

export interface SubGiftEvent extends ChatEventType {
  "detail-type": "subgift";
  detail: {
    streamId: string;
    channel: string;
    username: string;
    streakMonths: number;
    recipient: string;
    methods: tmi.SubMethods;
    userstate: tmi.SubGiftUserstate;
  };
}

export interface SubEvent extends ChatEventType {
  "detail-type": "subscription";
  detail: {
    streamId: string;
    channel: string;
    username: string;
    methods: tmi.SubMethods;
    message: string;
    userstate: tmi.SubUserstate;
  };
}

export interface ResubEvent extends ChatEventType {
  "detail-type": "resub";
  detail: {
    streamId: string;
    channel: string;
    username: string;
    months: number;
    userstate: tmi.SubUserstate;
    message: string;
    methods: tmi.SubMethods;
  };
}

export interface CheerEvent extends ChatEventType {
  "detail-type": "cheer";
  detail: {
    streamId: string;
    channel: string;
    userstate: tmi.ChatUserstate;
    message: string;
  };
}

export interface MessageEvent extends ChatEventType {
  "detail-type": "message";
  detail: {
    streamId: string;
    channel: string;
    userstate: tmi.ChatUserstate;
    message: string;
  };
}
