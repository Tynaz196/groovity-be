import { Router } from "express";
import authRouter from "./auth.route.js";
import userRouter from "./user.route.js";
import songRouter from "./song.route.js";
import albumRouter from "./album.route.js";
import feedRouter from "./feed.route.js";
import {
    albumRouteConfig,
    authRouteConfig,
    songRouteConfig,
    userRouteConfig,
    feedRouteConfig
} from "@/configs/routes/index.js";
import { requestLogger } from "@/utils/logger.js";

export const rootRouter: Router = Router();
rootRouter.use(requestLogger);

interface configProps {
    index: string;
    router: Router;
}
const apisConfigs: configProps[] = [
    {
        index: authRouteConfig.index,
        router: authRouter
    },
    {
        index: userRouteConfig.index,
        router: userRouter
    },
    {
        index: songRouteConfig.index,
        router: songRouter
    },
    {
        index: albumRouteConfig.index,
        router: albumRouter
    },
    {
        index: feedRouteConfig.index,
        router: feedRouter
    }
];

apisConfigs.forEach((config) => {
    rootRouter.use(config.index, config.router);
});
