"use strict";

import { APIGatewayProxyEvent } from "aws-lambda";

module.exports.hello = async (event: APIGatewayProxyEvent) => {
    return {
        statusCode: 200,
        body: "hi",
    };
};
