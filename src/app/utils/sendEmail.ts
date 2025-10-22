import nodemailer from "nodemailer";
import { envVars } from "../config/env";
import ejs from "ejs";
import path from "path";
import fs from "fs";
import AppError from "../errorHelpers/AppError";

const transporter = nodemailer.createTransport({
  port: Number(envVars.EMAIL_SENDER.SMTP_PORT), // 587 for STARTTLS, 465 for SSL
  host: envVars.EMAIL_SENDER.SMTP_HOST,
  secure: Number(envVars.EMAIL_SENDER.SMTP_PORT) === 465, // true for 465, false for 587  
  auth: {
    user: envVars.EMAIL_SENDER.SMTP_USER,
    pass: envVars.EMAIL_SENDER.SMTP_PASS,
  }
});

function resolveTemplatePath(name: string) {
  const prodPath = path.join(__dirname, "template", `${name}.ejs`);
  const devPath = path.join(process.cwd(), "src", "app", "utils", "template", `${name}.ejs`);
  return fs.existsSync(prodPath) ? prodPath : devPath;
}

interface ISendEmailOptions {
  to: string;
  subject: string;
  templateName: string;
  templateData?: Record<string, any>;
  attachments?: {
    filename: string;
    content: Buffer | string;
    contentType: string;
  }[];
}

export const sendEmail = async ({
  to,
  subject,
  attachments,
  templateName,
  templateData = {},
}: ISendEmailOptions) => {
  try {
    const templatePath = resolveTemplatePath(templateName);
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template not found at ${templatePath}`);
    }

    const html = await ejs.renderFile(templatePath, templateData);

    const info = await transporter.sendMail({
      from: envVars.EMAIL_SENDER.SMTP_FROM,
      to,
      subject,
      html,
      attachments: attachments?.map(a => ({
        filename: a.filename,
        content: a.content,
        contentType: a.contentType,
      })),
    });

    console.log(`✉️ Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error: any) {
    console.error("email sending error:", error);
    throw new AppError(500, error?.message || "Email error");
  }
};
