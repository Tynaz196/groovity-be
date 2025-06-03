import { SwaggerUiOptions } from "swagger-ui-express";
import { OpenAPIV3 } from "openapi-types";
import { apiConfig } from "../routes/index.js";
import { envConfig } from "../env.config.js";
import { userProfileSchema, userSchema } from "./schemas/user.js";
import { authRouteDoc } from "./swagger.auth.js";
import { userRouteDoc } from "./swagger.user.js";
import { songSchema } from "./schemas/song.js";
import { songRouteDoc } from "./swagger.song.js";
import { albumSchema } from "./schemas/album.js";
import { albumRouteDoc } from "./swagger.album.js";
import { feedRoutedoc } from "./swagger.feed.js";

export const swaggerOptions: SwaggerUiOptions = {
    swaggerOptions: {
        defaultModelsExpandDepth: -1
    }
};

const document: OpenAPIV3.Document = {
    openapi: "3.0.0",
    info: {
        title: "Music Streaming API",
        description: "A complete APIs for a music streaming web app",
        version: "0.0.0"
    },    servers: [
        {
            url: `http://localhost:${envConfig.PORT}${apiConfig.api}`,
            description: 'Local Development'
        },
        {
            url: 'https://be-groovity-5w4zzkxcn-thuans-projects-a25aed65.vercel.app/api/v1',
            description: 'Production'
        }
    ],
    paths: {
        ...authRouteDoc,
        ...userRouteDoc,
        ...songRouteDoc,
        ...albumRouteDoc,
        ...feedRoutedoc
    },
    components: {
        schemas: {
            user: userSchema,
            userProfile: userProfileSchema,
            song: songSchema,
            album: albumSchema
        },
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT"
            },
            refreshTokenCookieAuth: {
                type: "apiKey",
                in: "cookie",
                name: "refreshToken"
            }
        }
    }
};

export default document;
