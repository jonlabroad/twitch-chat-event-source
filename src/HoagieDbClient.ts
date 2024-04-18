import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, GetCommandInput, UpdateCommand, UpdateCommandInput } from "@aws-sdk/lib-dynamodb";

export interface AdminData {
    CategoryKey: string
    SubKey: string

    streamers: string[]
}

export default class HoagieDbClient {
    tableName = "HoagieTools-prod";
    dbClient = new DynamoDBClient({ region: "us-east-1" });
    docClient = DynamoDBDocumentClient.from(this.dbClient);

    constructor() {
    }

    public async getConfig() {
        try {
            const key = {
                CategoryKey: `DonoWatch_admin`,
                SubKey: "config",
            };
            const input: GetCommandInput = {
                TableName: this.tableName,
                Key: key,
            }
            const response = await this.docClient.send(new GetCommand(input));
            return response?.Item as AdminData | undefined;
        } catch (err) {
            console.error(err);
        }
    }
}