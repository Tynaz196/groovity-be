import { OpenAPIV3 } from "openapi-types";

export const songExample = {
    id: "b875c6a1-14d1-4826-ba06-56051de7e3e",
    name: "Test name",
    lyric: "Test Lyrics",
    userId: "6f322c31-142c-454e-d216fj3eb934e",
    albumId: "c4ej6n1-1vc56c-12qs-d2t4858934e",
    coverImageUrl: "imageUrl",
    likesCount: 300
};

export const songSchema: OpenAPIV3.SchemaObject = {
    type: "object",
    properties: {
        id: {
            type: "string",
            format: "uuid"
        },
        name: {
            type: "string"
        },
        lyric: {
            type: "string"
        },
        userId: {
            type: "string",
            format: "uuid"
        },
        coverImageUrl: {
            type: "string",
            format: "uri"
        },
        likesCount: {
            type: "integer"
        }
    },
    example: songExample
};
