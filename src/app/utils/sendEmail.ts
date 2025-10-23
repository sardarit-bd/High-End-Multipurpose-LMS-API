import { Resend } from "resend";
import { envVars } from "../config/env";
import ejs from "ejs";
import path from "path";
import fs from "fs";
import AppError from "../errorHelpers/AppError";

// initialize Resend client
const resend = new Resend(envVars.EMAIL_SENDER.SMTP_HOST);

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

    // Render EJS template
    const html = await ejs.renderFile(templatePath, templateData);

    // Send email via Resend API
    const response = await resend.emails.send({
      from: envVars.EMAIL_SENDER?.SMTP_FROM || "LMS <sardarit.bd.official@gmail.com>",
      to,
      subject,
      html,
      attachments: attachments?.map(a => ({
        filename: a.filename,
        content: a.content.toString(),
        type: a.contentType,
      })),
    });

    console.log(`✅ Email sent to ${to}`, response);
    return response;
  } catch (error: any) {
    console.error("email sending error:", error);
    throw new AppError(500, error?.message || "Email error");
  }
};
