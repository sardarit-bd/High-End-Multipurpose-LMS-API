"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtpRoutes = void 0;
const express_1 = require("express");
const otp_controller_1 = require("./otp.controller");
const routes = (0, express_1.Router)();
routes.post('/send', otp_controller_1.OtpController.sendOtp);
routes.post('/verify', otp_controller_1.OtpController.verifyOtp);
exports.OtpRoutes = routes;
