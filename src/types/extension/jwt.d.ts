import { UserPayload } from "../jwt";

declare module "jsonwebtoken" {
    export interface JwtPayload {
        user: UserPayload;
    }
}
