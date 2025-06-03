import { userRouteConfig } from "@/configs/routes/index.js";
import { Router } from "express";
import { StatusCodes } from "http-status-codes";
import { Request, Response } from "express";
import { userController } from "@/controllers/user.controller.js";
import {
    isVerifiedUserMiddleware,
    verifyTokenMiddleware
} from "@/middlewares/auth.middleware.js";
import { singleFileUpload } from "@/middlewares/index.js";
import { dataValidation } from "@/validations/data.validations.js";
import {
    getUserLikedSongsQuerySchema,
    getUserLikedAlbumsQuerySchema,
    getUsersQuerySchema,
    updateUserProfileSchema
} from "@/schemas/user.shema.js";
const router = Router();

router.get(userRouteConfig.status, (req: Request, res: Response) => {
    res.status(StatusCodes.OK).json({
        message: "Auth api",
        status: "OK"
    });
});

router.put(
    userRouteConfig.updateAvatar,
    verifyTokenMiddleware({ type: "at" }),
    isVerifiedUserMiddleware,
    singleFileUpload({
        fieldName: "avatar",
        allowedExtensions: [".jpg", "jpeg", ".png"]
    }),
    userController.updateAvatar
);

router.patch(
    userRouteConfig.updateProfile,
    verifyTokenMiddleware({ type: "at" }),
    isVerifiedUserMiddleware,
    dataValidation(updateUserProfileSchema, "body"),
    userController.updateProfile
);

router.get(
    userRouteConfig.getUsers,
    dataValidation(getUsersQuerySchema, "query"),
    userController.getUsers
);

router.get(userRouteConfig.getUser, userController.getUser);

router.get(
    userRouteConfig.getUserLikedSongs,
    verifyTokenMiddleware({ type: "at" }),
    isVerifiedUserMiddleware,
    dataValidation(getUserLikedSongsQuerySchema, "query"),
    userController.getLikedSongs
);

router.get(
    userRouteConfig.getUserLikedAlbums,
    verifyTokenMiddleware({ type: "at" }),
    isVerifiedUserMiddleware,
    dataValidation(getUserLikedAlbumsQuerySchema, "query"),
    userController.getLikedAlbums
);

export default router;
