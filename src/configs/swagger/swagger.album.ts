import { OpenAPIV3 } from "openapi-types";
import { albumRouteConfig } from "../routes/index.js";
import { userExample } from "./schemas/user.js";
import { convertToOpenApiRoute } from "@/utils/swagger.js";
import { albumExample } from "./schemas/album.js";

export const albumRouteDoc: OpenAPIV3.PathsObject = {
    [`${albumRouteConfig.index}${albumRouteConfig.createAlbum}`]: {
        post: {
            summary: "Create an album",
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
                            required: ["name", "coverImage"],
                            properties: {
                                name: {
                                    type: "string"
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
                    description: "Create album successfully",
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
                                            album: {
                                                $ref: "#/components/schemas/album"
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
            tags: ["albums"]
        }
    },
    [`${albumRouteConfig.index}${convertToOpenApiRoute(albumRouteConfig.addSong)}`]:
        {
            patch: {
                summary: "Insert a song to an album at index",
                security: [
                    {
                        bearerAuth: []
                    }
                ],
                parameters: [
                    {
                        in: "path",
                        name: "albumId",
                        description: "Id of the album",
                        schema: {
                            type: "string"
                        },
                        required: true
                    },
                    {
                        in: "path",
                        name: "songId",
                        description: "Id of the song",
                        schema: {
                            type: "string"
                        },
                        required: true
                    }
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["index"],
                                properties: {
                                    index: {
                                        type: "number",
                                        description:
                                            "Index to add the song to album, must be nonnegative, if larger than length of album, the song will be add at last postion",
                                        example: 1
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    "200": {
                        description: "Add song to album successfully"
                    },
                    "40x": {
                        description: "Error"
                    }
                },
                tags: ["albums"]
            }
        },
    [`${albumRouteConfig.index}${convertToOpenApiRoute(albumRouteConfig.addSongs)}`]:
        {
            patch: {
                summary: "Add a list of songs to the end of an album",
                security: [
                    {
                        bearerAuth: []
                    }
                ],
                parameters: [
                    {
                        in: "path",
                        name: "albumId",
                        description: "Id of the album",
                        schema: {
                            type: "string"
                        },
                        required: true
                    }
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "array",
                                items: {
                                    type: "string",
                                    title: "songIds"
                                }
                            }
                        }
                    }
                },
                responses: {
                    "200": {
                        description: "Add songs to album successfully"
                    },
                    "40x": {
                        description: "Error"
                    }
                },
                tags: ["albums"]
            }
        },
    [`${albumRouteConfig.index}${convertToOpenApiRoute(albumRouteConfig.setSongs)}`]:
        {
            put: {
                summary: "Set songs for an album",
                security: [
                    {
                        bearerAuth: []
                    }
                ],
                parameters: [
                    {
                        in: "path",
                        name: "albumId",
                        description: "Id of the album",
                        schema: {
                            type: "string"
                        },
                        required: true
                    }
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "array",
                                items: {
                                    type: "string",
                                    title: "songIds"
                                }
                            }
                        }
                    }
                },
                responses: {
                    "200": {
                        description: "Set songs for album successfully"
                    },
                    "40x": {
                        description: "Error"
                    }
                },
                tags: ["albums"]
            }
        },
    [`${albumRouteConfig.index}${convertToOpenApiRoute(albumRouteConfig.deleteSongs)}`]:
        {
            delete: {
                summary: "Delete songs from an album",
                security: [
                    {
                        bearerAuth: []
                    }
                ],
                parameters: [
                    {
                        in: "path",
                        name: "albumId",
                        description: "Id of the album",
                        schema: {
                            type: "string"
                        },
                        required: true
                    }
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "array",
                                items: {
                                    type: "string",
                                    title: "songIds"
                                }
                            }
                        }
                    }
                },
                responses: {
                    "200": {
                        description: "Delete songs from album successfully"
                    },
                    "40x": {
                        description: "Error"
                    }
                },
                tags: ["albums"]
            }
        },
    [`${albumRouteConfig.index}${convertToOpenApiRoute(albumRouteConfig.updateCoverImage)}`]:
        {
            put: {
                summary: "Update album cover image",
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        in: "path",
                        name: "id",
                        description: "Id of the album",
                        schema: {
                            type: "string"
                        },
                        required: true
                    }
                ],
                requestBody: {
                    required: true,
                    content: {
                        "multipart/form-data": {
                            schema: {
                                type: "object",
                                required: ["coverImage"],
                                properties: {
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
                    "200": {
                        description: "Update album cover successfully",
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
                                                album: {
                                                    $ref: "#/components/schemas/album"
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
                tags: ["albums"]
            }
        },
    [`${albumRouteConfig.index}${convertToOpenApiRoute(albumRouteConfig.publicAlbum)}`]:
        {
            patch: {
                summary: "Public an album",
                security: [
                    {
                        bearerAuth: []
                    }
                ],
                parameters: [
                    {
                        in: "path",
                        name: "albumId",
                        description: "Id of the album",
                        schema: {
                            type: "string"
                        },
                        required: true
                    }
                ],
                responses: {
                    "200": {
                        description: "Album is set to public"
                    },
                    "40x": {
                        description: "Error"
                    }
                },
                tags: ["albums"]
            }
        },
    [`${albumRouteConfig.index}/{id}`]: {
        get: {
            summary: "Get an album",
            security: [
                {
                    bearerAuth: []
                }
            ],
            description:
                "Fetch data of an public album, optionally login to see private album of that user",
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
                },
                {
                    in: "query",
                    name: "songs",
                    description: "Optional fetching songs",
                    schema: {
                        type: "boolean"
                    }
                }
            ],
            responses: {
                "200": {
                    description: "Get album successfully",
                    content: {
                        "application/json": {
                            example: {
                                status: "success",
                                message: "string",
                                data: {
                                    album: {
                                        ...albumExample,
                                        user: userExample
                                    }
                                }
                            }
                        }
                    }
                },
                "404": {
                    description: "Album not found, or not visible to this user"
                }
            },
            tags: ["albums"]
        },
        patch: {
            summary: "Update an album",
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
                                    type: "string"
                                }
                            }
                        }
                    }
                }
            },
            responses: {
                "200": {
                    description: "Update album successfully",
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
                                            album: {
                                                $ref: "#/components/schemas/album"
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
            tags: ["albums"]
        }
    },
    [`${albumRouteConfig.index}${albumRouteConfig.getAlbums}`]: {
        get: {
            summary: "Search albums by name and userId",
            description:
                "Search for public album, optionally login to see private albums of that user",
            security: [
                {
                    bearerAuth: []
                }
            ],
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
                    description: "Get albums successfully",
                    content: {
                        "application/json": {
                            example: {
                                status: "success",
                                message: "string",
                                data: [
                                    {
                                        ...albumExample,
                                        user: userExample
                                    }
                                ],
                                count: 1
                            }
                        }
                    }
                }
            },
            tags: ["albums"]
        }
    },
    [`${albumRouteConfig.index}${convertToOpenApiRoute(albumRouteConfig.likeAlbum)}`]:
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
                        description: "Id of the album",
                        schema: {
                            type: "string"
                        },
                        required: true
                    }
                ],
                responses: {
                    "200": {
                        description: "Like album successfully"
                    }
                },
                tags: ["albums"]
            }
        },
    [`${albumRouteConfig.index}${convertToOpenApiRoute(albumRouteConfig.unlikeAlbum)}`]:
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
                        description: "Id of the album",
                        schema: {
                            type: "string"
                        },
                        required: true
                    }
                ],
                responses: {
                    "200": {
                        description: "Unlike album successfully"
                    }
                },
                tags: ["albums"]
            }
        },
    [`${albumRouteConfig.index}${convertToOpenApiRoute(albumRouteConfig.likeStatus)}`]:
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
                        description: "Id of the album",
                        schema: {
                            type: "string"
                        },
                        required: true
                    }
                ],
                responses: {
                    "200": {
                        description: "Get album like status successfully",
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
                tags: ["albums"]
            }
        }
};
