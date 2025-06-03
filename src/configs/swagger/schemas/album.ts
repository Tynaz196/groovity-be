import { OpenAPIV3 } from "openapi-types";

export const albumExample = {
    id: "b875c6a1-14d1-4826-ba06-56051de7e3e",
    name: "Test name",
    isPublic: false,
    userId: "6f322c31-142c-454e-d216fj3eb934e",
    coverImageUrl: "imageUrl",
    likesCount: 300
};

export const albumSchema: OpenAPIV3.SchemaObject = {
    type: "object",
    properties: {
        id: {
            type: "string",
            format: "uuid"
        },
        name: {
            type: "string"
        },
        isPublic: {
            type: "boolean"
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
    example: albumExample
};
