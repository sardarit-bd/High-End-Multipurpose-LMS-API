import { Router } from "express"
import { OtpController } from "./otp.controller"

const routes = Router()

routes.post('/send', OtpController.sendOtp)
routes.post('/verify', OtpController.verifyOtp)

export const OtpRoutes = routes