import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import City from "./city.model";
import { ICity } from "./city.interface";

const create = async (payload: Partial<ICity>) => {
  const city = await City.create(payload);
  return city;
};

const update = async (cityId: string, payload: Partial<ICity>) => {
  const city = await City.findByIdAndUpdate(cityId, payload, { new: true });
  if (!city) throw new AppError(httpStatus.NOT_FOUND, "City not found");
  return city;
};

const remove = async (cityId: string) => {
  const city = await City.findByIdAndDelete(cityId);
  if (!city) throw new AppError(httpStatus.NOT_FOUND, "City not found");
  return city;
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

  // Search in name and country
  if (q && q.trim()) {
    searchQuery.$or = [
      { name: { $regex: q.trim(), $options: "i" } },
      { country: { $regex: q.trim(), $options: "i" } },
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
  
  const validPage = Math.max(1, pageNumber);
  const validLimit = Math.max(1, Math.min(limitNumber, 100));

  // Calculate pagination
  const skip = (validPage - 1) * validLimit;

  // Get total count
  const total = await City.countDocuments(searchQuery);
  const totalPages = Math.ceil(total / validLimit);

  // Validate page number
  if (validPage > totalPages && total > 0) {
    throw new AppError(httpStatus.BAD_REQUEST, "Page number exceeds total pages");
  }

  // Determine sort order
  const sortDirection = sortOrder === "asc" ? 1 : -1;
  const sortOptions: any = {};
  sortOptions[sortBy] = sortDirection;

  // Fetch cities with pagination and sorting
  const cities = await City.find(searchQuery)
    .sort(sortOptions)
    .skip(skip)
    .limit(validLimit)
    .lean();

  return {
    data: cities,
    meta: {
      page: validPage,
      limit: validLimit,
      total,
      totalPages,
    },
  };
};

const getById = async (cityId: string) => {
  const city = await City.findById(cityId);
  if (!city) throw new AppError(httpStatus.NOT_FOUND, "City not found");
  return city;
};

const toggleStatus = async (cityId: string) => {
  const city = await City.findById(cityId);
  if (!city) throw new AppError(httpStatus.NOT_FOUND, "City not found");

  city.isActive = !city.isActive;
  await city.save();

  return city;
};

export const CityServices = {
  create,
  update,
  remove,
  listAll,
  getById,
  toggleStatus,
};