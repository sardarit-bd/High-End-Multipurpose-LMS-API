import nodemailer from "nodemailer";
import { envVars } from "../config/env";

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: envVars.EMAIL_SENDER.SMTP_USER,
        pass: envVars.EMAIL_SENDER.SMTP_PASS,
    },
});

const generateEmailTemplate = (title: string, message: string, extra = "") => {
    return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border-radius: 10px; background: #f8f9fa;">
    
    <div style="text-align: center; margin-bottom: 20px;">
      <h2 style="color: #005f99; margin: 0;">${title}</h2>
    </div>

    <p style="font-size: 15px; color: #333; line-height: 1.6;">
      ${message}
    </p>

    ${extra}

    <br><br>
    <p style="font-size: 13px; color: #666;">
      Best regards,<br>
      <strong>Your LMS Team</strong><br>
    </p>
  </div>
  `;
};

export const sendResetPasswordEmail = async (email: string, resetUrl: string) => {
    try {
        const subject = "Password Reset Request";
        const message = `
      We received a request to reset the password for your 
      <strong>LMS</strong> account.

      <br><br>
      Click the button below to reset your password. This link will expire in 
      <strong>15 minutes</strong> for security reasons.
    `;

        const button = `
      <div style="margin-top: 20px;">
        <a href="${resetUrl}" target="_blank" 
          style="display: inline-block; padding: 12px 20px; background: #005F99; color: #fff;
          text-decoration: none; border-radius: 5px; font-weight: bold;">
          Reset Password
        </a>
      </div>

      <p style="margin-top: 10px; font-size: 13px; color: #777;">
        If the button doesn't work, you can use this link:<br>
        <a href="${resetUrl}">${resetUrl}</a>
      </p>

      <p style="margin-top: 20px; font-size: 13px; color: #444;">
        If you did not request a password reset, please ignore this email.
      </p>
    `;

        const mailOptions = {
            from: envVars.EMAIL_SENDER.SMTP_USER, // Use consistent env var
            to: email,
            subject,
            html: generateEmailTemplate(subject, message, button),
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Password reset email error:", error);
        throw new Error("Failed to send password reset email");
    }
};