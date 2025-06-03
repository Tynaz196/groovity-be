import nodemailer from "nodemailer";
import { envConfig } from "./env.config.js";
import hbs, {
    NodemailerExpressHandlebarsOptions
} from "nodemailer-express-handlebars";

export const transporter = nodemailer.createTransport({
    host: envConfig.MAIL_HOST,
    port: envConfig.MAIL_PORT,
    secure: true,
    auth: {
        user: envConfig.MAIL_USER,
        pass: envConfig.MAIL_PASSWORD
    }
});

const handlebarOptions: NodemailerExpressHandlebarsOptions = {
    viewEngine: {
        defaultLayout: false
    },
    viewPath: "src/views",
    extName: ".hbs"
};

transporter.use("compile", hbs(handlebarOptions));
