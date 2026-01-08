"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResetPasswordEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("../config/env");
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: env_1.envVars.EMAIL_SENDER.SMTP_USER,
        pass: env_1.envVars.EMAIL_SENDER.SMTP_PASS,
    },
});
const generateEmailTemplate = (title, message, extra = "") => {
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
const sendResetPasswordEmail = (email, resetUrl) => __awaiter(void 0, void 0, void 0, function* () {
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
            from: env_1.envVars.EMAIL_SENDER.SMTP_USER, // Use consistent env var
            to: email,
            subject,
            html: generateEmailTemplate(subject, message, button),
        };
        yield transporter.sendMail(mailOptions);
    }
    catch (error) {
        console.error("Password reset email error:", error);
        throw new Error("Failed to send password reset email");
    }
});
exports.sendResetPasswordEmail = sendResetPasswordEmail;
