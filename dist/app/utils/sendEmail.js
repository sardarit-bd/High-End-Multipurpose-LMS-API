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
exports.sendEmail = exports.sendResetPasswordEmail = void 0;
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
const sendEmailTemplate = (name, email, phone, message) => {
    return `
  <div style="font-family: Arial, Helvetica, sans-serif; max-width: 620px; margin: 0 auto; padding: 24px; background-color: #f4f6f8;">
    
    <div style="background-color: #ffffff; border-radius: 10px; padding: 28px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
      
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #0b5ed7; margin: 0;">New Message from LMS Platform</h2>
        <p style="margin: 6px 0 0; color: #777; font-size: 14px;">
          Contact Request Details
        </p>
      </div>

      <hr style="border: none; border-top: 1px solid #e6e6e6; margin: 20px 0;" />

      <!-- User Info -->
      <table width="100%" cellpadding="6" cellspacing="0" style="margin-bottom: 18px;">
        <tr>
          <td style="font-size: 14px; color: #555; width: 140px;"><strong>Name:</strong></td>
          <td style="font-size: 14px; color: #222;">${name}</td>
        </tr>
        <tr>
          <td style="font-size: 14px; color: #555;"><strong>Email:</strong></td>
          <td style="font-size: 14px; color: #222;">${email}</td>
        </tr>
        <tr>
          <td style="font-size: 14px; color: #555;"><strong>Phone:</strong></td>
          <td style="font-size: 14px; color: #222;">${phone}</td>
        </tr>
      </table>

      <!-- Message -->
      <div style="margin-top: 16px;">
        <p style="font-size: 15px; color: #333; line-height: 1.7; margin-bottom: 6px;">
          <strong>Message:</strong>
        </p>
        <p style="font-size: 15px; color: #444; line-height: 1.7; background: #f8fafc; padding: 14px; border-radius: 6px;">
          ${message}
        </p>
      </div>

      <!-- Footer -->
      <div style="margin-top: 26px; text-align: center;">
        <p style="font-size: 13px; color: #888;">
          Best regards,<br />
          <strong>Your LMS Team</strong>
        </p>
      </div>

    </div>
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
            from: email, // Use consistent env var
            to: env_1.envVars.EMAIL_SENDER.SMTP_USER,
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
const sendEmail = (name, phone, email, subject, message) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mailOptions = {
            from: email,
            to: env_1.envVars.EMAIL_SENDER.SMTP_USER,
            subject,
            html: sendEmailTemplate(name, email, phone, message),
        };
        yield transporter.sendMail(mailOptions);
    }
    catch (error) {
        console.error("Contact email error:", error);
        throw new Error("Failed to send contact email");
    }
});
exports.sendEmail = sendEmail;
