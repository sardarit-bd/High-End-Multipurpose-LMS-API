/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { Event } from "./event.model";
import { IEvent, EventStatus } from "./event.interface";
import { GamificationServices } from "../gamification/gamification.service"; // optional if already exists
import { BadgeServices } from "../badge/badge.service";

const create = async (payload: Partial<IEvent>, userId: string) => {
  const now = new Date(payload.startDate ?? Date.now());
  const status = now > new Date() ? EventStatus.UPCOMING : EventStatus.ONGOING;

  const event = await Event.create({
    ...payload,
    organizer: userId,
    status,
  });
  return event;
};

const update = async (eventId: string, payload: Partial<IEvent>) => {
  const event = await Event.findByIdAndUpdate(eventId, payload, { new: true });
  if (!event) throw new AppError(httpStatus.NOT_FOUND, "Event not found");
  return event;
};

const remove = async (eventId: string) => {
  const event = await Event.findByIdAndUpdate(eventId, { isDeleted: true }, { new: true });
  if (!event) throw new AppError(httpStatus.NOT_FOUND, "Event not found");
  return event;
};

const listPublic = async () => {
  return Event.find({ isDeleted: false }).sort({ startDate: 1 });
};

const get = async (eventId: string) => {
  const event = await Event.findOne({ _id: eventId, isDeleted: false });
  if (!event) throw new AppError(httpStatus.NOT_FOUND, "Event not found");
  return event;
};

const register = async (eventId: string, userId: string) => {
  const event = await Event.findOne({ _id: eventId, isDeleted: false });
  if (!event) throw new AppError(httpStatus.NOT_FOUND, "Event not found");

  if (event.attendees?.includes(userId as any))
    throw new AppError(httpStatus.BAD_REQUEST, "Already registered");

  event.attendees?.push(userId as any);
  await event.save();

  return event;
};

const markAttendance = async (eventId: string, userId: string) => {
  const event = await Event.findById(eventId);
  if (!event) throw new AppError(httpStatus.NOT_FOUND, "Event not found");

  if (!event.attendees?.includes(userId as any))
    throw new AppError(httpStatus.BAD_REQUEST, "User not registered for this event");

  // Give points or badge (future integration)
  if (event.pointsReward > 0) {
    await GamificationServices.addPoints({
      userId,
      points: event.pointsReward,
      sourceType: "event",
      eventId: String(event._id),
      reason: `Attended event: ${(event.title as any).en || "Event"}`
    });

  }

  await BadgeServices.autoIssueBadge({ userId, eventId: String(event._id) });


  return { message: "Attendance confirmed and points added", event };
};

export const EventServices = {
  create,
  update,
  remove,
  listPublic,
  get,
  register,
  markAttendance,
};
