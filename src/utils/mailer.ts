import { envConfig, transporter } from "@/configs/index.js";
import logger from "./logger.js";

export const sendMail = async ({
    receiverEmail = "",
    subject = "Testing nodemailer",
    template = "test-email",
    context = {
        name: "testing"
    }
}) => {
    const mailOptions = {
        from: `"No Reply" <${envConfig.MAIL_USER}>`,
        to: receiverEmail,
        subject: subject,
        template: template,
        context: context
    };
    await transporter.sendMail(mailOptions);
    logger.info(`Mail sent successfully to ${mailOptions.to}`);
};
