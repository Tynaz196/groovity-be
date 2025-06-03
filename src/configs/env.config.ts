import dotenv from "dotenv";

dotenv.config();

export const envConfig = {
    PORT: process.env.PORT || 3000,

    //logger
    LOG_LEVEL: process.env.LOG_LEVEL || "info",

    //Supabase
    SUPABASE_PROJECT_URL: process.env.SUPABASE_PROJECT_URL!,
    SUPABASE_API_KEY: process.env.SUPABASE_API_KEY!,
    IMAGE_URL_EXP: Number(process.env.IMAGE_URL_EXP) || 900,
    MUCSIC_URL_EXP: Number(process.env.MUSIC_URL_EXP) || 900,

    //Redis
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: Number(process.env.REDIS_PORT) || 17064,
    REDIS_CACHING_EXP: Number(process.env.REDIS_CACHING_EXP) || 600,

    //JWT
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    JWT_ACCESS_EXP: process.env.JWT_ACCESS_EXP || "15m",
    JWT_REFRESH_EXP: process.env.JWT_REFRESH_EXP || "30d",

    //MAILER
    MAIL_HOST: process.env.MAIL_HOST,
    MAIL_PORT: Number(process.env.MAIL_PORT),
    MAIL_USER: process.env.MAIL_USER,
    MAIL_PASSWORD: process.env.MAIL_PASSWORD
};
