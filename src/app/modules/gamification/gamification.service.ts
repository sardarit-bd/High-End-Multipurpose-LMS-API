/* eslint-disable @typescript-eslint/no-unused-vars */
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";
import { PointLog, PointWallet } from "./gamification.model";
import { Types } from "mongoose";

type AwardInput = {
  userId: string;
  points: number;                         // >= 0 for awards
  sourceType: "event" | "quiz" | "task" | "manual";
  reason?: string;
  courseId?: string;
  eventId?: string;
  taskId?: string;
};

const addPoints = async (input: AwardInput) => {
  if (input.points <= 0) throw new AppError(httpStatus.BAD_REQUEST, "points must be > 0");

  // 1) Write log (immutable)
  await PointLog.create({
    user: new Types.ObjectId(input.userId),
    points: input.points,
    sourceType: input.sourceType,
    course: input.courseId ? new Types.ObjectId(input.courseId) : undefined,
    event: input.eventId ? new Types.ObjectId(input.eventId) : undefined,
    task: input.taskId ? new Types.ObjectId(input.taskId) : undefined,
    reason: input.reason
  });

  // 2) Upsert wallet
  const wallet = await PointWallet.findOneAndUpdate(
    { user: input.userId },
    {
      $inc: {
        totalPoints: input.points,
        ...(input.courseId ? { [`byCourse.${input.courseId}`]: input.points } : {})
      }
    },
    { new: true, upsert: true }
  );

  return wallet;
};

const getMyPoints = async (userId: string) => {
  const wallet = await PointWallet.findOne({ user: userId });
  const logs = await PointLog.find({ user: userId }).sort({ createdAt: -1 }).limit(50);
  return { wallet: wallet ?? { totalPoints: 0, byCourse: {} }, logs };
};

const getLeaderboard = async (limit = 20, courseId?: string) => {
  if (courseId) {
    // rank by per-course points (from denormalized wallet)
    const rows = await PointWallet.aggregate([
      { $addFields: { coursePoints: { $ifNull: [ `$byCourse.${courseId}`, 0 ] } } },
      { $sort: { coursePoints: -1, updatedAt: -1 } },
      { $limit: limit }
    ]);
    return rows;
  }
  // global leaderboard
  return PointWallet.find().sort({ totalPoints: -1, updatedAt: -1 }).limit(limit);
};

export const GamificationServices = { addPoints, getMyPoints, getLeaderboard };
