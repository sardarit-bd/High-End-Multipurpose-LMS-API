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

const listAll = async () => {
  return Badge.find({ isActive: true }).sort({ createdAt: -1 });
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
  return UserBadge.find({ user: userId }).populate("badge").sort({ issuedAt: -1 });
};

/** helper: auto-issue by course/event **/
const autoIssueBadge = async (context: { userId: string; courseId?: string; eventId?: string }) => {
  let badge;
  if (context.courseId)
    badge = await Badge.findOne({ courseId: context.courseId, type: "course", isActive: true });
  else if (context.eventId)
    badge = await Badge.findOne({ eventId: context.eventId, type: "event", isActive: true });

  if (badge) {
    await issueBadge(context.userId, String(badge._id), "Auto-issued for completion");
  }
};

export const BadgeServices = {
  create,
  update,
  remove,
  listAll,
  issueBadge,
  listUserBadges,
  autoIssueBadge,
};
