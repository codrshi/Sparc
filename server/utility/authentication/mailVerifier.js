import dotenv from "dotenv";
import nodemailer from "nodemailer";
import generateVerificationCode from "../builder/verificationCodeGenerator.js";

dotenv.config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.SPARC_MAIL_ID,
        pass: process.env.SPARC_MAIL_PASSWORD,
    },
});

async function sendVerificationCode(username, email, message) {

    const code = generateVerificationCode();

    await transporter.sendMail({
        from: `${process.env.SPARC_MAIL_ID}`,
        to: email,
        subject: `E-mail Verification`,
        text: `Hi ${username},\n\nYour 6-digit PIN is ${code}.\n\nUse it to verify your e-mail and ${message} successfully on Sparc.`
    });

    return code;
}

export default sendVerificationCode;