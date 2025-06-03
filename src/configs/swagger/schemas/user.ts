import { OpenAPIV3 } from "openapi-types";

export const userExample = {
    id: "1245f04e-6a73-4af2-a9ad-87fwn428xefa",
    username: "john_doe",
    email: "john@example.com",
    createdAt: "2025-02-25T14:30:00.660Z",
    updatedAt: "2025-02-26T10:15:45.235Z",
    isVerified: true
};

export const userSchema: OpenAPIV3.SchemaObject = {
    type: "object",
    properties: {
        id: { type: "string" },
        username: { type: "string" },
        email: { type: "string" },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
        isVerified: { type: "boolean" }
    },
    example: userExample
};

export const userProfileExample = {
    id: "1245f04e-6a73-4582-a9ad-87da3bf81efa",
    userId: "8f0ac25c-4c88-4c8d-b0c2-b5a17f79c713",
    name: "John Doe",
    gender: "male",
    phone: "+1234567890",
    birth: "1990-05-15T00:00:00.000Z",
    avatarImageUrl: "avatarUrl"
};

export const userProfileSchema: OpenAPIV3.SchemaObject = {
    type: "object",
    properties: {
        id: { type: "string", format: "uuid" },
        userId: { type: "string", format: "uuid" },
        name: { type: "string" },
        gender: { type: "string" },
        phone: { type: "string" },
        birth: { type: "string", format: "date-time" },
        avatarImageUrl: { type: "string", format: "uri" }
    },
    example: userProfileExample
};
