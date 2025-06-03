import { feedRouteConfig } from "@/configs/routes/index.js";
import { feedController } from "@/controllers/index.js";
import { getMostLikedSongsSchema } from "@/schemas/feed.schema.js";
import { dataValidation } from "@/validations/data.validations.js";
import { Router } from "express";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

const router = Router();

router.get(feedRouteConfig.status, (req: Request, res: Response) => {
    res.status(StatusCodes.OK).json({
        message: "Feed api",
        status: "OK"
    });
});

router.get(
    feedRouteConfig.getMostLikedSongs,
    dataValidation(getMostLikedSongsSchema, "query"),
    feedController.getMostLikedSongs
);

router.get(
    feedRouteConfig.getRecentlyLikedSongs,
    dataValidation(getMostLikedSongsSchema, "query"),
    feedController.getRecentlyLikedSongs
);

export default router;
