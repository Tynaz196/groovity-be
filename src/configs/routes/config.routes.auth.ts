import { defaultRoutesConfigProps } from "./config.routes.default.js";

interface authRouteConfigProps extends defaultRoutesConfigProps {
    signUp: string;
    signIn: string;
    signOut: string;
    refreshToken: string;
    sendVerification: string;
    verifyCode: string;
}

export const authRouteConfig: authRouteConfigProps = {
    index: "/auth",
    status: "/status",
    signUp: "/signup",
    signIn: "/signin",
    signOut: "/signout",
    refreshToken: "/refresh-token",
    sendVerification: "/send-verification",
    verifyCode: "/verify"
};
