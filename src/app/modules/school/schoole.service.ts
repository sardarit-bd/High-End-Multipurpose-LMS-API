// app/modules/school/school.service.ts
import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import School from "./school.model";
import { ISchool } from "./school.interface";

const create = async (payload: Partial<ISchool>) => {
  const school = await School.create(payload);
  return await school.populate('city', 'name country');
};

const update = async (schoolId: string, payload: Partial<ISchool>) => {
  const school = await School.findByIdAndUpdate(
    schoolId, 
    payload, 
    { new: true }
  ).populate('city', 'name country');
  
  if (!school) throw new AppError(httpStatus.NOT_FOUND, "School not found");
  return school;
};

const remove = async (schoolId: string) => {
  const school = await School.findByIdAndDelete(schoolId);
  if (!school) throw new AppError(httpStatus.NOT_FOUND, "School not found");
  return school;
};

const listAll = async (query: any = {}) => {
  const {
    q = "",
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
    cityId,
    isActive,
    ...otherFilters
  } = query;

  // Build search query
  const searchQuery: any = {};

  // Search in name and code
  if (q && q.trim()) {
    searchQuery.$or = [
      { name: { $regex: q.trim(), $options: "i" } },
      { code: { $regex: q.trim(), $options: "i" } },
      { address: { $regex: q.trim(), $options: "i" } },
    ];
  }

  // Filter by city
  if (cityId && cityId.trim()) {
    searchQuery.city = cityId;
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
  
  const validPage = Math.max(1, pageNumber);
  const validLimit = Math.max(1, Math.min(limitNumber, 100));

  // Calculate pagination
  const skip = (validPage - 1) * validLimit;

  // Get total count
  const total = await School.countDocuments(searchQuery);
  const totalPages = Math.ceil(total / validLimit);

  // Validate page number
  if (validPage > totalPages && total > 0) {
    throw new AppError(httpStatus.BAD_REQUEST, "Page number exceeds total pages");
  }

  // Determine sort order
  const sortDirection = sortOrder === "asc" ? 1 : -1;
  const sortOptions: any = {};
  sortOptions[sortBy] = sortDirection;

  // Fetch schools with pagination and sorting
  const schools = await School.find(searchQuery)
    .populate('city', 'name country')
    .sort(sortOptions)
    .skip(skip)
    .limit(validLimit)
    .lean();

  return {
    data: schools,
    meta: {
      page: validPage,
      limit: validLimit,
      total,
      totalPages,
    },
  };
};

const getById = async (schoolId: string) => {
  const school = await School.findById(schoolId).populate('city', 'name country');
  if (!school) throw new AppError(httpStatus.NOT_FOUND, "School not found");
  return school;
};

const toggleStatus = async (schoolId: string) => {
  const school = await School.findById(schoolId);
  if (!school) throw new AppError(httpStatus.NOT_FOUND, "School not found");

  school.isActive = !school.isActive;
  await school.save();
  await school.populate('city', 'name country');

  return school;
};

export const SchoolServices = {
  create,
  update,
  remove,
  listAll,
  getById,
  toggleStatus,
};