import axios from "axios";

export interface GetStreamerResponse {
    id: number
    userId: number
    name: string
}

export interface SongListSong {
        id: number
        note: string
        botRequestBy: string
        nonlistSong: string
        donationAmount: number
        createdAt: string
        playedAt: string
        songId: number
        streamerId: number
        position: number
        song: {
            artist: string
            attributeIds: any[]
            createdAt: string
            id: number
            title: string
        }
        requests: {
            id: number
            name: string
        }[]
}

export interface GetQueueResponse {
    list: SongListSong[],
    status: {
        string: number
    },
}

export interface GetHistoryResponse {
    items: SongListSong[],
}

export class StreamerSongListApiClient {
    private static baseUrl = "https://api.streamersonglist.com";

    public async getTwitchStreamer(username: string): Promise<GetStreamerResponse> {
        const response = await axios.get(`${StreamerSongListApiClient.baseUrl}/v1/streamers/${username}?platform=twitch`);
        return response.data;
    }

    public async getQueue(streamerId: number): Promise<GetQueueResponse> {
        const response = await axios.get(`${StreamerSongListApiClient.baseUrl}/v1/streamers/${streamerId}/queue`);
        return response.data;
    }

    public async getStreamHistory(streamerId: number): Promise<GetHistoryResponse> {
        const response = await axios.get(`${StreamerSongListApiClient.baseUrl}/v1/streamers/${streamerId}/playHistory?size=100&current=0&type=playedAt&order=desc&period=stream`);
        return response.data;
    }
}