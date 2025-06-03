import { envConfig } from "@/configs/env.config.js";
import { createClient } from "@supabase/supabase-js";

const client = createClient(
    envConfig.SUPABASE_PROJECT_URL,
    envConfig.SUPABASE_API_KEY
);

export default client;

/* -------------------------------------------------------------------------- */
/*                                    TO DO                                   */
/* ----- SCRIPT TO CREATE BUCKETS IF THERE ISN'T BEFRORE STARTING SERVER ---- */

/* -------------------------------------------------------------------------- */
