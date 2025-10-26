/* eslint-disable @typescript-eslint/no-unused-vars */
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";
import { PointLog, PointWallet } from "./gamification.model";
import { Types } from "mongoose";

type AwardInput = {
  userId: string;
  points: number;                         // >= 0 for awards
  sourceType: "event" | "quiz" | "task" | "manual" | "package" | "purchase" | "enrollment" | "course";
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

const getLeaderboard = async (
  limit = 20,
  scope: "global" | "region" | "school" = "global",
  filterValue?: string,    // e.g., "Malaysia" or "Edufest University"
  courseId?: string
) => {
  let sortField = "totalPoints";
  const match: any = {};
  const addFields: any = {};

  if (courseId) {
    addFields.coursePoints = { $ifNull: [`$byCourse.${courseId}`, 0] };
    sortField = "coursePoints";
  }

  // Build pipeline
  const pipeline: any[] = [];

  if (Object.keys(addFields).length) {
    pipeline.push({ $addFields: addFields });
  }

  // Join user info
  pipeline.push({
    $lookup: {
      from: "users",
      localField: "user",
      foreignField: "_id",
      as: "user",
    },
  });
  pipeline.push({ $unwind: "$user" });

  // Apply scope filter
  if (scope === "region" && filterValue) {
    pipeline.push({ $match: { "user.region": filterValue } });
  }
  if (scope === "school" && filterValue) {
    pipeline.push({ $match: { "user.organization": filterValue } });
  }

  // Sort and limit
  pipeline.push({ $sort: { [sortField]: -1, updatedAt: -1 } });
  pipeline.push({ $limit: limit });

  // Project final leaderboard
  pipeline.push({
    $project: {
      _id: 0,
      userId: "$user._id",
      name: "$user.name",
      email: "$user.email",
      region: "$user.region",
      organization: "$user.organization",
      totalPoints: 1,
      [sortField]: 1,
      updatedAt: 1,
    },
  });

  const result = await PointWallet.aggregate(pipeline);
  return result;
};

export const GamificationServices = { addPoints, getMyPoints, getLeaderboard };
