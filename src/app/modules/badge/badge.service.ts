/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { Badge, UserBadge } from "./badge.model";
import { IBadge } from "./badge.interface";

const create = async (payload: Partial<IBadge>) => {
  const badge = await Badge.create(payload);
  return badge;
};

const update = async (badgeId: string, payload: Partial<IBadge>) => {
  const badge = await Badge.findByIdAndUpdate(badgeId, payload, { new: true });
  if (!badge) throw new AppError(httpStatus.NOT_FOUND, "Badge not found");
  return badge;
};

const remove = async (badgeId: string) => {
  const badge = await Badge.findByIdAndDelete(badgeId);
  if (!badge) throw new AppError(httpStatus.NOT_FOUND, "Badge not found");
  return badge;
};

const listAll = async (query: any = {}) => {
  const {
    q = "",
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
    isActive,
    ...otherFilters
  } = query;

  // Build search query
  const searchQuery: any = {};

  // Search in title and description
  if (q && q.trim()) {
    searchQuery.$or = [
      { title: { $regex: q.trim(), $options: "i" } },
      { description: { $regex: q.trim(), $options: "i" } },
    ];
  }

  // Filter by isActive status if provided
  if (isActive !== undefined && isActive !== "") {
    searchQuery.isActive = isActive === "true" || isActive === true;
  }

  // Apply other filters
  Object.keys(otherFilters).forEach((key) => {
    if (otherFilters[key] !== undefined && otherFilters[key] !== "") {
      searchQuery[key] = otherFilters[key];
    }
  });

  // Convert page and limit to numbers
  const pageNumber = parseInt(String(page), 10) || 1;
  const limitNumber = parseInt(String(limit), 10) || 10;
  
  // Ensure valid values
  const validPage = Math.max(1, pageNumber);
  const validLimit = Math.max(1, Math.min(limitNumber, 100)); // Max limit 100

  // Calculate pagination
  const skip = (validPage - 1) * validLimit;

  // Get total count
  const total = await Badge.countDocuments(searchQuery);
  const totalPages = Math.ceil(total / validLimit);

  // Validate page number
  if (validPage > totalPages && total > 0) {
    throw new AppError(httpStatus.BAD_REQUEST, "Page number exceeds total pages");
  }

  // Determine sort order
  const sortDirection = sortOrder === "asc" ? 1 : -1;
  const sortOptions: any = {};
  sortOptions[sortBy] = sortDirection;

  // Fetch badges with pagination and sorting
  const badges = await Badge.find(searchQuery)
    .sort(sortOptions)
    .skip(skip)
    .limit(validLimit)
    .lean();

  return {
    data: badges,
    meta: {
      page: validPage,
      limit: validLimit,
      total,
      totalPages,
    },
  };
};

const getById = async (badgeId: string) => {
  const badge = await Badge.findById(badgeId);
  if (!badge) throw new AppError(httpStatus.NOT_FOUND, "Badge not found");
  return badge;
};

const toggleStatus = async (badgeId: string) => {
  const badge = await Badge.findById(badgeId);
  if (!badge) throw new AppError(httpStatus.NOT_FOUND, "Badge not found");

  badge.isActive = !badge.isActive;
  await badge.save();

  return badge;
};

const issueBadge = async (userId: string, badgeId: string, reason?: string) => {
  const badge = await Badge.findById(badgeId);
  if (!badge || !badge.isActive) throw new AppError(httpStatus.NOT_FOUND, "Badge not found");

  const existing = await UserBadge.findOne({ user: userId, badge: badgeId });
  if (existing) return existing;

  const ub = await UserBadge.create({
    user: userId,
    badge: badgeId,
    reason,
  });
  return ub;
};

const listUserBadges = async (userId: string) => {
  return UserBadge.find({ user: userId })
    .populate("badge")
    .sort({ issuedAt: -1 })
    .populate('')
};

/** helper: auto-issue by course/event **/
const autoIssueBadge = async (context: { userId: string; totalPoints: number, courseId?: string; eventId?: string }) => {
  // let badge;
  // if (context.courseId)
  //   badge = await Badge.findOne({ courseId: context.courseId, type: "course", isActive: true });
  // else if (context.eventId)
  //   badge = await Badge.findOne({ eventId: context.eventId, type: "event", isActive: true });
  const badge: any = await getBadgeByPoints(context.totalPoints)
  if (badge) {
    await issueBadge(context.userId, String(badge?._id), "Auto-issued for completion");
  }
};

const getBadgeByPoints = async (studentPoints: number) => {
  console.log("total points", studentPoints)
  const badge = await Badge.findOne({
    isActive: true,
    pointsRequired: { $lte: studentPoints }
  })
  .sort({ pointsRequired: -1 })
  .lean();

  return badge;
}
export const BadgeServices = {
  create,
  update,
  remove,
  listAll,
  getById,
  toggleStatus,
  issueBadge,
  listUserBadges,
  autoIssueBadge,
  getBadgeByPoints
};