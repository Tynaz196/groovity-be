import { OpenAPIV3 } from "openapi-types";
import { songRouteConfig } from "../routes/index.js";
import { songExample } from "./schemas/song.js";
import { userExample } from "./schemas/user.js";
import { convertToOpenApiRoute } from "@/utils/swagger.js";

export const songRouteDoc: OpenAPIV3.PathsObject = {
    [`${songRouteConfig.index}${songRouteConfig.uploadSong}`]: {
        post: {
            summary: "Upload music",
            security: [
                {
                    bearerAuth: []
                }
            ],
            requestBody: {
                required: true,
                content: {
                    "multipart/form-data": {
                        schema: {
                            type: "object",
                            required: ["name", "audioFile", "coverImage"],
                            properties: {
                                name: {
                                    type: "string"
                                },
                                lyric: {
                                    type: "string"
                                },
                                audioFile: {
                                    description: "Accept .mp3, .wav",
                                    type: "string",
                                    format: "base64"
                                },
                                coverImage: {
                                    description:
                                        "Accept .jpg, .jpeg, .png images",
                                    type: "string",
                                    format: "base64"
                                }
                            }
                        }
                    }
                }
            },
            responses: {
                "201": {
                    description: "Upload song successfully",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    status: {
                                        type: "string",
                                        example: "success"
                                    },
                                    message: { type: "string" },
                                    data: {
                                        type: "object",
                                        properties: {
                                            song: {
                                                $ref: "#/components/schemas/song"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                "40x": {
                    description: "Error"
                }
            },
            tags: ["songs"]
        }
    },

    [`${songRouteConfig.index}${convertToOpenApiRoute(songRouteConfig.getSong)}`]:
        {
            get: {
                summary: "Get a song",
                parameters: [
                    {
                        in: "path",
                        name: "id",
                        description: "Id of the song",
                        schema: {
                            type: "string"
                        },
                        required: true
                    },
                    {
                        in: "query",
                        name: "userProfile",
                        description: "Optional fetching user profile",
                        schema: {
                            type: "boolean"
                        }
                    }
                ],
                responses: {
                    "200": {
                        description: "Get song successfully",
                        content: {
                            "application/json": {
                                example: {
                                    status: "success",
                                    message: "string",
                                    data: {
                                        song: {
                                            ...songExample,
                                            user: userExample
                                        }
                                    }
                                }
                            }
                        }
                    },
                    "404": {
                        description: "song not found"
                    }
                },
                tags: ["songs"]
            }
        },
    [`${songRouteConfig.index}${songRouteConfig.getSongs}`]: {
        get: {
            summary: "Search songs by name and userId",
            parameters: [
                {
                    in: "query",
                    name: "name",
                    schema: {
                        type: "string"
                    }
                },
                {
                    in: "query",
                    name: "userId",
                    schema: {
                        type: "string"
                    }
                },
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
                    description: "Get songs successfully",
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
            tags: ["songs"]
        }
    },
    [`${songRouteConfig.index}${convertToOpenApiRoute(songRouteConfig.streamSong)}`]:
        {
            get: {
                security: [
                    {
                        bearerAuth: []
                    }
                ],
                summary: "Stream a song",
                parameters: [
                    {
                        in: "path",
                        name: "id",
                        description: "Id of the song to play",
                        schema: {
                            type: "string"
                        },
                        required: true
                    }
                ],
                responses: {
                    "206": {
                        description:
                            "Stream song successfully, the content is returned as partial content"
                    }
                },
                tags: ["songs"]
            }
        },
    [`${songRouteConfig.index}${convertToOpenApiRoute(songRouteConfig.likeSong)}`]:
        {
            post: {
                security: [
                    {
                        bearerAuth: []
                    }
                ],
                parameters: [
                    {
                        in: "path",
                        name: "id",
                        description: "Id of the song",
                        schema: {
                            type: "string"
                        },
                        required: true
                    }
                ],
                responses: {
                    "200": {
                        description: "Like song successfully"
                    }
                },
                tags: ["songs"]
            }
        },
    [`${songRouteConfig.index}${convertToOpenApiRoute(songRouteConfig.unlikeSong)}`]:
        {
            post: {
                security: [
                    {
                        bearerAuth: []
                    }
                ],
                parameters: [
                    {
                        in: "path",
                        name: "id",
                        description: "Id of the song",
                        schema: {
                            type: "string"
                        },
                        required: true
                    }
                ],
                responses: {
                    "200": {
                        description: "Unlike song successfully"
                    }
                },
                tags: ["songs"]
            }
        },
    [`${songRouteConfig.index}${convertToOpenApiRoute(songRouteConfig.likeStatus)}`]:
        {
            get: {
                security: [
                    {
                        bearerAuth: []
                    }
                ],
                parameters: [
                    {
                        in: "path",
                        name: "id",
                        description: "Id of the song",
                        schema: {
                            type: "string"
                        },
                        required: true
                    }
                ],
                responses: {
                    "200": {
                        description: "Get song like status successfully",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: {
                                            type: "string",
                                            example: "success"
                                        },
                                        message: {
                                            type: "string",
                                            example:
                                                "Get song like status successfully"
                                        },
                                        data: {
                                            type: "object",
                                            properties: {
                                                likeStatus: {
                                                    type: "boolean",
                                                    example: true
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                tags: ["songs"]
            }
        }
};
