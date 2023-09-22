import { ResubEvent } from "./EventTypes";

export const resubEvent: ResubEvent = {
    version: '0',
    id: '204bd497-5b80-3ed6-8a6c-b17796d80ff1',
    'detail-type': 'resub',
    source: 'hoagie.twitch-chat',
    account: '796987500533',
    time: '2023-09-22T18:19:23Z',
    region: 'us-east-1',
    resources: [],
    detail: {
        streamId: '42801090955',
        channel: '#test-channel',
        username: 'testuser',
        message: "thanks for the streams!",
        userstate: {
            'badge-info': {},
            badges: {},
            color: '#F2F800',
            'display-name': 'testuser',
            emotes: {},
            flags: "",
            id: '1b4fc742-9520-4022-a24a-897bec8aa57e',
            login: 'testuser',
            mod: false,
            'msg-id': 'resub',
            'msg-param-cumulative-months': '6',
            'msg-param-months': false,
            'msg-param-multimonth-duration': false,
            'msg-param-multimonth-tenure': false,
            'msg-param-should-share-streak': false,
            'msg-param-sub-plan-name': 'Channel Subscription (joplaysviolin)',
            'msg-param-sub-plan': 'Prime',
            'msg-param-was-gifted': 'false',
            'room-id': '272628458',
            subscriber: true,
            'system-msg': "testuser subscribed with Prime. They've subscribed for 6 months!",
            'tmi-sent-ts': '1695406763764',
            'user-id': '104585960',
            'user-type': undefined,
            vip: false,
            'badge-info-raw': 'subscriber/6',
            'badges-raw': 'subscriber/6',
            'message-type': 'resub'
        },
        methods: {
            prime: false,
            plan: '1000',
            planName: 'Channel Subscription (joplaysviolin)'
        },
        months: 0
    }
};
