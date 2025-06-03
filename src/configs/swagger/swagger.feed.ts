import { OpenAPIV3 } from "openapi-types";
import { feedRouteConfig } from "../routes/config.routes.feed.js";
import { songExample } from "./schemas/song.js";
import { userExample } from "./schemas/user.js";

export const feedRoutedoc: OpenAPIV3.PathsObject = {
    [`${feedRouteConfig.index}/most-liked-songs`]: {
        get: {
            summary: "Get songs with most likesCount",
            parameters: [
                {
                    in: "query",
                    name: "limit",
                    description: "Number of results",
                    schema: {
                        type: "integer"
                    }
                },
                {
                    in: "query",
                    name: "offset",
                    description: "Offset of the results",
                    schema: {
                        type: "integer"
                    }
                },
                {
                    in: "query",
                    name: "userProfiles",
                    description: "Optional fetching user profile",
                    schema: {
                        type: "boolean"
                    }
                }
            ],
            responses: {
                "200": {
                    description: "Get most liked songs successfully",
                    content: {
                        "application/json": {
                            example: {
                                status: "success",
                                message: "string",
                                data: [
                                    {
                                        ...songExample,
                                        user: userExample
                                    }
                                ],
                                count: 1
                            }
                        }
                    }
                }
            },
            tags: ["feeds"]
        }
    },
    [`${feedRouteConfig.index}/recently-liked-songs`]: {
        get: {
            summary: "Get most recently liked songs",
            parameters: [
                {
                    in: "query",
                    name: "limit",
                    description: "Number of results",
                    schema: {
                        type: "integer"
                    }
                },
                {
                    in: "query",
                    name: "offset",
                    description: "Offset of the results",
                    schema: {
                        type: "integer"
                    }
                },
                {
                    in: "query",
                    name: "userProfiles",
                    description: "Optional fetching user profile",
                    schema: {
                        type: "boolean"
                    }
                }
            ],
            responses: {
                "200": {
                    description: "Get recently liked songs successfully",
                    content: {
                        "application/json": {
                            example: {
                                status: "success",
                                message: "string",
                                data: [
                                    {
                                        ...songExample,
                                        user: userExample
                                    }
                                ],
                                count: 1
                            }
                        }
                    }
                }
            },
            tags: ["feeds"]
        }
    }
};
