import { z } from "zod";

export const booleanSchema = z.preprocess((val) => {
    if (typeof val === "string") {
        if (val.toLowerCase() === "true" || val === "1") return true;
        if (val.toLowerCase() === "false" || val === "0") return false;
    }
    return val;
}, z.boolean());
