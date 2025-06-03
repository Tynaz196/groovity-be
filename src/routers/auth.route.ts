import { authRouteConfig } from "@/configs/routes/index.js";
import { Request, Response, Router } from "express";
import { StatusCodes } from "http-status-codes";
import { dataValidation } from "@/validations/data.validations.js";
import { signInSchema, signUpSchema } from "@/schemas/index.js";
import { verifyTokenMiddleware } from "@/middlewares/index.js";
import { authController } from "@/controllers/index.js";

const router = Router();

router.get(authRouteConfig.status, (req: Request, res: Response) => {
    res.status(StatusCodes.OK).json({
        message: "Auth api",
        status: "OK"
    });
});

router.post(
    authRouteConfig.signUp,
    dataValidation(signUpSchema, "body"),
    authController.signUp
);

router.post(
    authRouteConfig.signIn,
    dataValidation(signInSchema, "body"),
    authController.signIn
);

router.post(
    authRouteConfig.signOut,
    verifyTokenMiddleware({ type: "both", accessTokenRequired: false }),
    authController.signOut
);

router.post(
    authRouteConfig.refreshToken,
    verifyTokenMiddleware({ type: "rt" }),
    authController.refreshToken
);

router.post(
    authRouteConfig.sendVerification,
    verifyTokenMiddleware({ type: "at" }),
    authController.sendVerification
);

router.post(
    authRouteConfig.verifyCode,
    verifyTokenMiddleware({ type: "at" }),
    authController.verifyCode
);

export default router;
