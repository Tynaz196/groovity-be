import { UserPayload } from "../jwt.ts";

declare global {
    namespace Express {
        interface Request {
            user?: UserPayload;
        }
    }
}
