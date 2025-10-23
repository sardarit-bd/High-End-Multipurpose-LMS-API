/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { Package } from "./package.model";
import { Course } from "../course/course.model";
import { OrderServices } from "../order/order.services";

const assertCourses = async (ids: string[]) => {
  const count = await Course.countDocuments({ _id: { $in: ids }, isDeleted: { $ne: true } });
  if (count !== ids.length) throw new AppError(httpStatus.BAD_REQUEST, "Some courses not found or deleted");
};

const packageCreate = async (payload: any) => {
  await assertCourses(payload.courseIds);
  return Package.create(payload);
};

const packageUpdate = async (packageId: string, payload: any) => {
  if (payload?.courseIds) await assertCourses(payload.courseIds);
  const pkg = await Package.findByIdAndUpdate(packageId, payload, { new: true });
  if (!pkg) throw new AppError(httpStatus.NOT_FOUND, "Package not found");
  return pkg;
};

const packageSoftDelete = async (packageId: string) => {
  const pkg = await Package.findByIdAndUpdate(packageId, { isDeleted: true, isActive: false }, { new: true });
  if (!pkg) throw new AppError(httpStatus.NOT_FOUND, "Package not found");
  return pkg;
};

const packageGet = async (packageId: string) => {
  const pkg = await Package.findOne({ _id: packageId, isDeleted: { $ne: true } }).populate("courseIds", "title price currency");
  if (!pkg) throw new AppError(httpStatus.NOT_FOUND, "Package not found");
  return pkg;
};

const packageListPublic = async () =>
  Package.find({ isDeleted: { $ne: true }, isActive: true }).sort({ createdAt: -1 });

/** Reuse order system to create a checkout for a package */
const createCheckout = async (packageId: string, userId: string) => {
  const pkg = await Package.findOne({ _id: packageId, isDeleted: { $ne: true }, isActive: true });
  if (!pkg) throw new AppError(httpStatus.NOT_FOUND, "Package not found");

  const amount = typeof pkg.offerPrice === "number" ? pkg.offerPrice : pkg.price;

  // Reuse OrderServices but for itemType "package"
  return OrderServices.createCheckoutForPackage({
    packageId: String(pkg._id),
    userId,
    amount,
    currency: pkg.currency,
    courseIds: pkg.courseIds.map(String),
    name: pkg.name
  });
};

export const PackageServices = { packageCreate, packageUpdate, packageGet,packageListPublic ,packageSoftDelete, createCheckout };
