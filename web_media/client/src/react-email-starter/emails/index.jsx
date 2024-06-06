import { render } from "@react-email/components";
import nodemailer from "nodemailer";
import { Email } from "./email";
export const verifyEmail = (toEmail) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.forwardemail.net",
        port: 465,
        secure: true,
        auth: {
            user: "my_user",
            pass: "my_password",
        },
    });

    const emailHtml = render(<Email url="https://example.com" />);

    const options = {
        from: "you@example.com",
        to: toEmail,
        subject: "hello world",
        html: emailHtml,
    };

    transporter.sendMail(options, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log("Email sent: " + info.response);
        }
    });
}
