/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { EnrollmentServices } from "./enrollment.services";
import { Course } from "../course/course.model";

const enrollSelf = catchAsync(async (req, res) => {
  const token = req.user as JwtPayload;
  const { courseId } = req.params;
  const course = await Course.findById(courseId)
  const doc = await EnrollmentServices.enrollSelf(courseId, token.userId, course?.instructor);
  sendResponse(res, { statusCode: httpStatus.CREATED, success: true, message: "Enrolled", data: doc });
});

const getMyEnrollment = catchAsync(async (req, res) => {
  const token = req.user as JwtPayload;
  const { courseId } = req.params;
  const doc = await EnrollmentServices.getMyEnrollment(courseId, token.userId);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "My enrollment", data: doc });
});

const listMyEnrollments = catchAsync(async (req, res) => {
  const token = req.user as JwtPayload;
  const rows = await EnrollmentServices.listMyEnrollments(token.userId);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "My enrollments", data: rows });
});

const listCourseEnrollments = catchAsync(async (req, res) => {
  const token = req.user as JwtPayload;
  const { courseId } = req.params;
  const rows = await EnrollmentServices.listCourseEnrollments(courseId, { userId: token.userId, role: token.role });
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Course enrollments", data: rows });
});

const updateStatus = catchAsync(async (req, res) => {
  const token = req.user as JwtPayload;
  const doc = await EnrollmentServices.updateStatus({ userId: token.userId, role: token.role }, req.body);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Status updated", data: doc });
});

const updateProgress = catchAsync(async (req, res) => {
  const token = req.user as JwtPayload;
  const { courseId, enrollmentId } = req.params;
  const doc = await EnrollmentServices.updateProgress(courseId, enrollmentId, { userId: token.userId, role: token.role }, req.body.progress);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Progress updated", data: doc });
});

const completeLesson = catchAsync(async (req, res) => {
  const token = req.user as JwtPayload;
  const { courseId, enrollmentId } = req.params;
  const { lessonId } = req.body;
  const doc = await EnrollmentServices.completeLesson(courseId, enrollmentId, { userId: token.userId, role: token.role }, lessonId);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Lesson completed", data: doc });
});

const updateTimeSpent = catchAsync(async (req, res) => {
  const token = req.user as JwtPayload;
  const { courseId, enrollmentId } = req.params;
  const { timeSpent } = req.body;
  const doc = await EnrollmentServices.updateTimeSpent(courseId, enrollmentId, { userId: token.userId, role: token.role }, timeSpent);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Time spent updated", data: doc });
});

const getUserCoursePoints = catchAsync(async (req, res) => {
  const token = req.user as JwtPayload;
  const { courseId } = req.params;
  const points = await EnrollmentServices.getUserCoursePoints(courseId, token.userId);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "User course points", data: { points } });
});

const getEnrolledStudentsByInstructor = catchAsync(async (req, res) => {
  const token = req.user as JwtPayload;
  const students = await EnrollmentServices.getEnrolledStudentsByInstructor(token.userId);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "User course points", data: students});
});
export const enrollmentController = { enrollSelf, getMyEnrollment, listMyEnrollments, listCourseEnrollments, updateStatus, updateProgress, completeLesson, updateTimeSpent, getUserCoursePoints, getEnrolledStudentsByInstructor };
