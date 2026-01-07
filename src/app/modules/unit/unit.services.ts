/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { Unit } from "./unit.model";
import { IUnit } from "./unit.interface";
import { Course } from "../course/course.model"; // adjust if your Course model path differs

const createUnit = async (
    payload: IUnit,
    actor: { userId: string; role: string }
) => {
    const { course: courseId } = payload;
    console.log("Creating unit for courseId:", payload);
    const course = await Course.findById(courseId);
    if (!course || course.isDeleted) throw new AppError(httpStatus.NOT_FOUND, "Course Not Found");

    const isOwner = String(course.instructor) === String(actor.userId);
    const isAdmin = actor.role === "ADMIN";
    if (!isOwner && !isAdmin) throw new AppError(httpStatus.FORBIDDEN, "Forbidden");

    const doc = await Unit.create({
        course: course._id,
        title: payload.title,
        orderIndex: payload.orderIndex ?? 1,
    });

    return doc;
};

const listUnits = async (courseId: string) => {
    const course = await Course.findById(courseId);
    if (!course || course.isDeleted) throw new AppError(httpStatus.NOT_FOUND, "Course Not Found");

    return Unit.find({ course: courseId, isDeleted: false })
        .sort({ orderIndex: 1, createdAt: 1 });
};

const updateUnit = async (
    unitId: string,
    payload: Partial<IUnit>,
    actor: { userId: string; role: string }
) => {
    const unit = await Unit.findById(unitId);
    if (!unit || unit.isDeleted) throw new AppError(httpStatus.NOT_FOUND, "Unit Not Found");

    const course = await Course.findById(unit.course);
    if (!course || course.isDeleted) throw new AppError(httpStatus.NOT_FOUND, "Course Not Found");

    const isOwner = String(course.instructor) === String(actor.userId);
    const isAdmin = actor.role === "ADMIN";
    if (!isOwner && !isAdmin) throw new AppError(httpStatus.FORBIDDEN, "Forbidden");

    const updated = await Unit.findByIdAndUpdate(
        unitId,
        { ...payload, updatedAt: new Date() },
        { new: true }
    );

    return updated;
};

export const UnitServices = { createUnit, listUnits, updateUnit };
