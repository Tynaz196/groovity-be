import { OpenAPIV3 } from "openapi-types";
import { userRouteConfig } from "../routes/index.js";
import { userExample, userProfileExample } from "./schemas/user.js";
import { songExample } from "./schemas/song.js";
import { albumExample } from "./schemas/album.js";

export const userRouteDoc: OpenAPIV3.PathsObject = {
    [`${userRouteConfig.index}${userRouteConfig.updateAvatar}`]: {
        put: {
            summary: "Update avatar",
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
                            required: ["avatar"],
                            properties: {
                                avatar: {
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
                "200": {
                    description: "Update avatar successfully"
                }
            },
            tags: ["users"]
        }
    },
    [`${userRouteConfig.index}${userRouteConfig.updateProfile}`]: {
        patch: {
            summary: "Update profile",
            security: [
                {
                    bearerAuth: []
                }
            ],
            requestBody: {
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                name: {
                                    type: "string",
                                    example: "John Doe"
                                },
                                birth: {
                                    type: "string",
                                    format: "date",
                                    example: "1990-05-15"
                                },
                                gender: {
                                    type: "string",
                                    example: "male"
                                },
                                phone: {
                                    type: "string",
                                    example: "+1234567890"
                                }
                            }
                        }
                    }
                }
            },
            responses: {
                "200": {
                    description: "Update profile successfully",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    status: {
                                        type: "string",
                                        example: "success"
                                    },
                                    messgae: {
                                        type: "string",
                                        example: "Update profile successfully"
                                    },
                                    data: {
                                        type: "object",
                                        properties: {
                                            user: {
                                                allOf: [
                                                    {
                                                        $ref: "#/components/schemas/user"
                                                    },
                                                    {
                                                        type: "object",
                                                        properties: {
                                                            userProfile: {
                                                                $ref: "#/components/schemas/userProfile"
                                                            }
                                                        }
                                                    }
                                                ],
                                                example: {
                                                    ...userExample,
                                                    userProfile: {
                                                        ...userProfileExample
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            tags: ["users"]
        }
    },

    [`${userRouteConfig.index}${userRouteConfig.getUser}`]: {
        get: {
            summary: "Get a user",
            parameters: [
                {
                    in: "path",
                    name: "id",
                    description: "Id of the user",
                    schema: {
                        type: "string"
                    },
                    required: true
                }
            ],
            responses: {
                "200": {
                    description: "Get user successfully",
                    content: {
                        "application/json": {
                            example: {
                                status: "success",
                                message: "string",
                                data: {
                                    user: {
                                        ...userExample,
                                        userProfile: userProfileExample
                                    }
                                }
                            }
                        }
                    }
                },
                "404": {
                    description: "User not found"
                }
            },
            tags: ["users"]
        }
    },

    [`${userRouteConfig.index}${userRouteConfig.getUsers}`]: {
        get: {
            summary: "Search a user by name",
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
                }
            ],
            responses: {
                "200": {
                    description: "Get users successfully",
                    content: {
                        "application/json": {
                            example: {
                                status: "success",
                                message: "string",
                                data: [
                                    {
                                        ...userExample,
                                        userProfile: userProfileExample
                                    }
                                ],
                                count: 1
                            }
                        }
                    }
                }
            },
            tags: ["users"]
        }
    },

    [`${userRouteConfig.index}${userRouteConfig.getUserLikedSongs}`]: {
        get: {
            summary: "Get user like songs",
            security: [
                {
                    bearerAuth: []
                }
            ],
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
                    description: "Get user like songs successfully",
                    content: {
                        "application/json": {
                            example: {
                                status: "success",
                                message: "Get user like songs successfully",
                                data: [songExample],
                                count: 1
                            }
                        }
                    }
                }
            },
            tags: ["users"]
        }
    },

    [`${userRouteConfig.index}${userRouteConfig.getUserLikedAlbums}`]: {
        get: {
            summary: "Get user like albums",
            security: [
                {
                    bearerAuth: []
                }
            ],
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
                    description: "Get user like albums successfully",
                    content: {
                        "application/json": {
                            example: {
                                status: "success",
                                message: "Get user like albums successfully",
                                data: [albumExample],
                                count: 1
                            }
                        }
                    }
                }
            },
            tags: ["users"]
        }
    }
};
