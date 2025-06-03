import { albumRouteConfig } from "@/configs/routes/index.js";
import { albumController } from "@/controllers/album.controller.js";
import {
    isVerifiedUserMiddleware,
    singleFileUpload,
    verifyTokenMiddleware
} from "@/middlewares/index.js";
import {
    addSongSchema,
    addSongsSchema,
    createAlbumSchema,
    deleteSongsSchema,
    getAlbumQuerySchema,
    getAlbumsQuerySchema,
    setSongsSchema,
    updateAlbumSchema
} from "@/schemas/album.schema.js";
import { dataValidation } from "@/validations/data.validations.js";
import { Router, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

const router = Router();

router.get(albumRouteConfig.status, (req: Request, res: Response) => {
    res.status(StatusCodes.OK).json({
        message: "Album api",
        status: "OK"
    });
});

router.post(
    albumRouteConfig.createAlbum,
    verifyTokenMiddleware({ type: "at" }),
    isVerifiedUserMiddleware,
    singleFileUpload({
        fieldName: "coverImage",
        allowedExtensions: [".jpg", "jpeg", ".png"]
    }),
    dataValidation(createAlbumSchema, "body"),
    albumController.createAlbum
);

router.patch(
    albumRouteConfig.updateAlbum,
    verifyTokenMiddleware({ type: "at" }),
    isVerifiedUserMiddleware,
    dataValidation(updateAlbumSchema, "body"),
    albumController.updateAlbum
);

router.put(
    albumRouteConfig.updateCoverImage,
    verifyTokenMiddleware({ type: "at" }),
    isVerifiedUserMiddleware,
    singleFileUpload({
        fieldName: "coverImage",
        allowedExtensions: [".jpg", "jpeg", ".png"]
    }),
    albumController.updateCoverImage
);

router.patch(
    albumRouteConfig.addSong,
    verifyTokenMiddleware({ type: "at" }),
    isVerifiedUserMiddleware,
    dataValidation(addSongSchema, "body"),
    albumController.addSong
);

router.patch(
    albumRouteConfig.addSongs,
    verifyTokenMiddleware({ type: "at" }),
    isVerifiedUserMiddleware,
    dataValidation(addSongsSchema, "body"),
    albumController.addSongs
);

router.put(
    albumRouteConfig.setSongs,
    verifyTokenMiddleware({ type: "at" }),
    isVerifiedUserMiddleware,
    dataValidation(setSongsSchema, "body"),
    albumController.setSongs
);

router.delete(
    albumRouteConfig.deleteSongs,
    verifyTokenMiddleware({ type: "at" }),
    isVerifiedUserMiddleware,
    dataValidation(deleteSongsSchema, "body"),
    albumController.deleteSongs
);

router.patch(
    albumRouteConfig.publicAlbum,
    verifyTokenMiddleware({ type: "at" }),
    isVerifiedUserMiddleware,
    albumController.publicAlbum
);

router.post(
    albumRouteConfig.likeAlbum,
    verifyTokenMiddleware({ type: "at" }),
    albumController.likeAlbum
);

router.post(
    albumRouteConfig.unlikeAlbum,
    verifyTokenMiddleware({ type: "at" }),
    albumController.unlikeAlbum
);

router.get(
    albumRouteConfig.likeStatus,
    verifyTokenMiddleware({ type: "at" }),
    albumController.getLikeStatus
);

router.get(
    albumRouteConfig.getAlbums,
    verifyTokenMiddleware({ type: "at", required: false }),
    dataValidation(getAlbumsQuerySchema, "query"),
    albumController.getAlbums
);

router.get(
    albumRouteConfig.getAlbum,
    verifyTokenMiddleware({ type: "at", required: false }),
    dataValidation(getAlbumQuerySchema, "query"),
    albumController.getAlbum
);

export default router;
