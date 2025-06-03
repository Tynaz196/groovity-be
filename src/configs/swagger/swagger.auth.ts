import { OpenAPIV3 } from "openapi-types";
import { authRouteConfig } from "../routes/index.js";
import { userExample, userProfileExample } from "./schemas/user.js";

export const authRouteDoc: OpenAPIV3.PathsObject = {
    [`${authRouteConfig.index}${authRouteConfig.signUp}`]: {
        post: {
            summary: "Sign up",
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            required: [
                                "username",
                                "email",
                                "password",
                                "userProfile"
                            ],
                            properties: {
                                username: {
                                    type: "string",
                                    example: "john_doe"
                                },
                                email: {
                                    type: "string",
                                    format: "email",
                                    example: "johndoe@example.com"
                                },
                                password: {
                                    type: "string",
                                    format: "password",
                                    example: "SecurePass123!"
                                },
                                userProfile: {
                                    type: "object",
                                    required: [
                                        "name",
                                        "birth",
                                        "gender",
                                        "phone"
                                    ],
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
                    }
                }
            },
            responses: {
                "201": {
                    description: "Successful sign up",
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
                                        example: "User sign up successfully"
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
                                    },
                                    accessToken: {
                                        type: "string",
                                        example: "eyJ1c2VyIjp7ImlkIjoiMjQ1MG"
                                    },
                                    refreshToken: {
                                        type: "string",
                                        example: "e57fhsbB35hjBDw2rfdws123SDb"
                                    }
                                }
                            }
                        }
                    }
                }
            },
            tags: ["auth"]
        }
    },
    [`${authRouteConfig.index}${authRouteConfig.signIn}`]: {
        post: {
            summary: "Sign in",
            description: "Sign in using user name and password",
            requestBody: {
                description: "User name and password",
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                username: {
                                    type: "string",
                                    example: "john_doe"
                                },
                                password: {
                                    type: "string",
                                    format: "password",
                                    example: "securePass123"
                                }
                            },
                            required: ["username", "password"]
                        }
                    }
                }
            },
            responses: {
                "200": {
                    description: "Successful sign in",
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
                                        example: "User sign in successfully"
                                    },
                                    data: {
                                        type: "object",
                                        properties: {
                                            user: {
                                                $ref: "#/components/schemas/user"
                                            }
                                        }
                                    },
                                    accessToken: {
                                        type: "string",
                                        example: "eyJ1c2VyIjp7ImlkIjoiMjQ1MG"
                                    },
                                    refreshToken: {
                                        type: "string",
                                        example: "e57fhsbB35hjBDw2rfdws123SDb"
                                    }
                                }
                            }
                        }
                    }
                },
                "401": {
                    description: "Unauthorized"
                }
            },
            tags: ["auth"]
        }
    },
    [`${authRouteConfig.index}${authRouteConfig.sendVerification}`]: {
        post: {
            summary: "Send the verification to email",
            security: [
                {
                    bearerAuth: []
                }
            ],
            responses: {
                "200": {
                    description: "Send code to email successfully"
                },
                "401": {
                    description: "Unauthorized"
                },
                "400": {
                    description: "User is already verified"
                }
            },
            tags: ["auth"]
        }
    },
    [`${authRouteConfig.index}${authRouteConfig.verifyCode}`]: {
        post: {
            summary: "Verify verification code",
            security: [
                {
                    bearerAuth: []
                }
            ],
            requestBody: {
                description: "The 6-digit verification code",
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            required: ["code"],
                            properties: {
                                code: {
                                    type: "string",
                                    example: "185217"
                                }
                            }
                        }
                    }
                }
            },
            responses: {
                "200": {
                    description: "User verified successfully"
                },
                "401": {
                    description: "Unauthorized"
                },
                "400": {
                    description:
                        "User is already verified, or verification code is not found or has expired"
                }
            },
            tags: ["auth"]
        }
    },
    [`${authRouteConfig.index}${authRouteConfig.refreshToken}`]: {
        post: {
            summary: "Refresh token",
            security: [
                {
                    refreshTokenCookieAuth: []
                }
            ],
            responses: {
                "200": {
                    description: "Refresh tokens successfully",
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
                                            accessToken: {
                                                type: "string",
                                                example:
                                                    "eyJ1c2VyIjp7ImlkIjoiMjQ1MG"
                                            },
                                            refreshToken: {
                                                type: "string",
                                                example:
                                                    "e57fhsbB35hjBDw2rfdws123SDb"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                "401": {
                    description: "Unauthorized"
                }
            },
            tags: ["auth"]
        }
    },
    [`${authRouteConfig.index}${authRouteConfig.signOut}`]: {
        post: {
            summary:
                "Sign out, must include a refresh token in cookies, can include a access token to be revoked",
            security: [
                {
                    refreshTokenCookieAuth: []
                },
                {
                    bearerAuth: []
                }
            ],
            responses: {
                "200": {
                    description: "Sign out successfully"
                }
            },
            tags: ["auth"]
        }
    }
};
