"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GamificationRoutes = void 0;
const express_1 = require("express");
const checkAuth_1 = require("../../middlewares/checkAuth");
const user_interface_1 = require("../user/user.interface");
const gamification_controller_1 = require("./gamification.controller");
const router = (0, express_1.Router)();
router.get("/me", (0, checkAuth_1.checkAuth)(user_interface_1.Role.STUDENT, user_interface_1.Role.INSTRUCTOR, user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), gamification_controller_1.gamificationController.getMyPoints);
router.get("/leaderboard", gamification_controller_1.gamificationController.getLeaderboard); // public/global
router.get("/leaderboard/schools", gamification_controller_1.gamificationController.getSchoolsLeaderboard); // schools ranking
router.get("/leaderboard/cities", gamification_controller_1.gamificationController.getCitiesLeaderboard); // cities ranking
router.get("/rank", (0, checkAuth_1.checkAuth)(user_interface_1.Role.STUDENT, user_interface_1.Role.INSTRUCTOR, user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), gamification_controller_1.gamificationController.getMyRank);
// optional manual award
router.post("/award", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.INSTRUCTOR), gamification_controller_1.gamificationController.award);
exports.GamificationRoutes = router;
