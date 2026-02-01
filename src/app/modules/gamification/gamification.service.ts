/* eslint-disable @typescript-eslint/no-unused-vars */
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";
import { PointLog, PointWallet } from "./gamification.model";
import { Types } from "mongoose";

type AwardInput = {
  userId: string;
  points: number;                         // >= 0 for awards
  sourceType: "event" | "quiz" | "task" | "manual" | "package" | "purchase" | "enrollment" | "course" | "lesson";
  reason?: string;
  courseId?: string;
  eventId?: string;
  taskId?: string;
  lessonId?: string;
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
    lesson: input.lessonId ? new Types.ObjectId(input.lessonId) : undefined,
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
  { limit = 20,
    scope,
    filterValue,
    courseId,
    schoolId,
    cityId }: any
) => {
  console.log(cityId)
  let sortField = "totalPoints";
  const match: any = {};
  const addFields: any = {};

  // Add student filter
  // match["user.role"] = "student";
  // match["user.isDeleted"] = false;
  // match["user.isActive"] = "active";

  if (courseId) {
    addFields.coursePoints = { $ifNull: [`$byCourse.${courseId}`, 0] };
    sortField = "coursePoints";
  }

  // Build pipeline
  const pipeline: any[] = [
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    { $match: match }
  ];

  // Add course points if needed
  if (Object.keys(addFields).length) {
    pipeline.push({ $addFields: addFields });
  }

  // Apply scope filters
  if (scope === "region" && filterValue) {
    pipeline.push({ $match: { "user.region": filterValue } });
  }

  if (scope === "school" && filterValue) {
    pipeline.push({ $match: { "user.school": filterValue } });
  }

  if (scope === "city" && cityId) {
    pipeline.push({ $match: { "user.city": new Types.ObjectId(cityId) } });
  }

  if (schoolId) {
    pipeline.push({ $match: { "user.school": new Types.ObjectId(schoolId) } });
  }

  // Join school and city info
  pipeline.push({
    $lookup: {
      from: "schools",
      localField: "user.school",
      foreignField: "_id",
      as: "schoolInfo",
    },
  });

  pipeline.push({
    $lookup: {
      from: "cities",
      localField: "user.city",
      foreignField: "_id",
      as: "cityInfo",
    },
  });

  pipeline.push({
    $addFields: {
      schoolInfo: { $arrayElemAt: ["$schoolInfo", 0] },
      cityInfo: { $arrayElemAt: ["$cityInfo", 0] },
    },
  });

  // Join user badges from UserBadge collection
  pipeline.push({
    $lookup: {
      from: "userbadges", // Collection name for UserBadge model
      let: { userId: "$user._id" },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ["$user", "$$userId"] }
          }
        },
        {
          $lookup: {
            from: "badges",
            localField: "badge",
            foreignField: "_id",
            as: "badgeDetails"
          }
        },
        { $unwind: { path: "$badgeDetails", preserveNullAndEmptyArrays: true } },
        {
          $match: {
            "badgeDetails.isActive": true
          }
        },
        {
          $project: {
            _id: 0,
            badgeId: "$badgeDetails._id",
            title: "$badgeDetails.title",
            description: "$badgeDetails.description",
            image: "$badgeDetails.image",
            pointsRequired: "$badgeDetails.pointsRequired",
            issuedAt: "$issuedAt",
            reason: "$reason",
            category: "$badgeDetails.category"
          }
        },
        { $sort: { issuedAt: -1 } }
      ],
      as: "userBadges"
    }
  });

  // Calculate badge stats
  pipeline.push({
    $addFields: {
      badgeCount: { $size: "$userBadges" },
      badgeTypes: {
        $cond: {
          if: { $gt: [{ $size: "$userBadges" }, 0] },
          then: {
            $map: {
              input: "$userBadges",
              as: "badge",
              in: "$$badge.title"
            }
          },
          else: []
        }
      },
      badgeCategories: {
        $cond: {
          if: { $gt: [{ $size: "$userBadges" }, 0] },
          then: {
            $reduce: {
              input: "$userBadges",
              initialValue: [],
              in: {
                $cond: {
                  if: { $in: ["$$this.category", "$$value"] },
                  then: "$$value",
                  else: { $concatArrays: ["$$value", ["$$this.category"]] }
                }
              }
            }
          },
          else: []
        }
      }
    }
  });

  // Sort and rank
  pipeline.push({ $sort: { [sortField]: -1, "user.createdAt": 1 } });

  // Add rank
  pipeline.push({
    $setWindowFields: {
      sortBy: { [sortField]: -1 },
      output: {
        rank: { $rank: {} }
      }
    }
  });

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
      school: "$schoolInfo.name",
      city: "$cityInfo.name",
      totalPoints: 1,
      [sortField]: 1,
      rank: 1,
      updatedAt: 1,
      // Badge information - only from UserBadges collection
      badges: "$userBadges",
      badgeCount: 1,
      badgeTypes: 1,
      badgeCategories: 1,
      // Achievement level based on points (no system badges)
      achievementLevel: {
        $switch: {
          branches: [
            { case: { $gte: ["$totalPoints", 10000] }, then: "elite" },
            { case: { $gte: ["$totalPoints", 5000] }, then: "master" },
            { case: { $gte: ["$totalPoints", 1000] }, then: "advanced" },
            { case: { $gte: ["$totalPoints", 100] }, then: "intermediate" }
          ],
          default: "beginner"
        }
      }
    },
  });

  const result = await PointWallet.aggregate(pipeline);
  console.log(result)
  return result;
};

const getSchoolsLeaderboard = async (
  limit = 20,
  schoolId?: string
) => {
  const match: any = {
    // "user.role": "student",
    // "user.isDeleted": false,
    // "user.isActive": "active",
  };

  if (schoolId) {
    match["user.school"] = new Types.ObjectId(schoolId);
  }

  const pipeline: any[] = [
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $lookup: {
        from: "schools",
        localField: "user.school",
        foreignField: "_id",
        as: "schoolInfo",
      },
    },
    { $unwind: { path: "$schoolInfo", preserveNullAndEmptyArrays: true } },
    { $match: match },
    {
      $group: {
        _id: "$user.school",
        schoolName: { $first: "$schoolInfo.name" },
        totalPoints: { $sum: "$totalPoints" },
        studentCount: { $sum: 1 },
        averagePoints: { $avg: "$totalPoints" },
      },
    },
    {
      $project: {
        _id: 0,
        schoolId: "$_id",
        schoolName: 1,
        totalPoints: 1,
        studentCount: 1,
        averagePoints: { $round: ["$averagePoints", 2] },
      },
    },
    { $sort: { totalPoints: -1 } },
    {
      $setWindowFields: {
        sortBy: { totalPoints: -1 },
        output: {
          rank: { $rank: {} }
        }
      }
    },
    { $limit: limit },
  ];

  return await PointWallet.aggregate(pipeline);
};

const getCitiesLeaderboard = async (
  limit = 20,
  cityId?: string
) => {
  const match: any = {
    // "user.role": "student",
    // "user.isDeleted": false,
    // "user.isActive": "active",
  };

  if (cityId) {
    match["user.city"] = new Types.ObjectId(cityId);
  }

  const pipeline: any[] = [
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $lookup: {
        from: "cities",
        localField: "user.city",
        foreignField: "_id",
        as: "cityInfo",
      },
    },
    { $unwind: { path: "$cityInfo", preserveNullAndEmptyArrays: true } },
    { $match: match },
    {
      $group: {
        _id: "$user.city",
        cityName: { $first: "$cityInfo.name" },
        totalPoints: { $sum: "$totalPoints" },
        studentCount: { $sum: 1 },
        averagePoints: { $avg: "$totalPoints" },
      },
    },
    {
      $project: {
        _id: 0,
        cityId: "$_id",
        cityName: 1,
        totalPoints: 1,
        studentCount: 1,
        averagePoints: { $round: ["$averagePoints", 2] },
      },
    },
    { $sort: { totalPoints: -1 } },
    {
      $setWindowFields: {
        sortBy: { totalPoints: -1 },
        output: {
          rank: { $rank: {} }
        }
      }
    },
    { $limit: limit },
  ];

  return await PointWallet.aggregate(pipeline);
};

const getStudentRank = async (
  userId: string,
  scope: "global" | "school" | "city" = "global",
  scopeId?: string,
  courseId?: string
) => {
  let sortField = "totalPoints";
  const addFields: any = {};
  const match: any = {
    "user.role": "student",
    "user.isDeleted": false,
    "user.isActive": "active",
  };

  // Apply scope filters
  if (scope === "school" && scopeId) {
    match["user.school"] = new Types.ObjectId(scopeId);
  } else if (scope === "city" && scopeId) {
    match["user.city"] = new Types.ObjectId(scopeId);
  }

  if (courseId) {
    addFields.coursePoints = { $ifNull: [`$byCourse.${courseId}`, 0] };
    sortField = "coursePoints";
  }

  const pipeline: any[] = [
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    { $match: match },
    ...(Object.keys(addFields).length ? [{ $addFields: addFields }] : []),
    {
      $setWindowFields: {
        sortBy: { [sortField]: -1, "user.createdAt": 1 },
        output: {
          rank: { $rank: {} }
        }
      }
    },
    {
      $match: {
        "user._id": new Types.ObjectId(userId),
      },
    },
    {
      $group: {
        _id: null,
        rank: { $first: "$rank" },
        totalPoints: { $first: `$${sortField}` },
        userId: { $first: "$user._id" },
        name: { $first: "$user.name" },
      },
    },
    {
      $lookup: {
        from: "pointwallets",
        let: { matchCriteria: match },
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "user",
              foreignField: "_id",
              as: "user",
            },
          },
          { $unwind: "$user" },
          {
            $match: {
              "user.role": "student",
              "user.isDeleted": false,
              "user.isActive": "active",
              ...(scope === "school" && scopeId ?
                { "user.school": new Types.ObjectId(scopeId) } : {}),
              ...(scope === "city" && scopeId ?
                { "user.city": new Types.ObjectId(scopeId) } : {}),
            },
          },
          { $count: "total" },
        ],
        as: "totalStudentsInfo",
      },
    },
    { $unwind: { path: "$totalStudentsInfo", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        userId: 1,
        name: 1,
        rank: { $ifNull: ["$rank", 0] },
        totalPoints: { $ifNull: ["$totalPoints", 0] },
        totalStudents: { $ifNull: ["$totalStudentsInfo.total", 0] },
      },
    },
  ];

  const result = await PointWallet.aggregate(pipeline);
  return result[0] || { rank: 0, totalPoints: 0, totalStudents: 0 };
};

export const GamificationServices = {
  addPoints,
  getMyPoints,
  getLeaderboard,
  getSchoolsLeaderboard,
  getCitiesLeaderboard,
  getStudentRank
};