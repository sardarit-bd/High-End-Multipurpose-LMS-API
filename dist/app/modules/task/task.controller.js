"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskController = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const task_services_1 = require("./task.services");
const createTask = (0, catchAsync_1.catchAsync)((req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    const { unitId } = req.body;
    const token = req.user;
    const created = yield task_services_1.TaskServices.create(unitId, req.body, { userId: token.userId, role: token.role });
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.CREATED,
        success: true,
        message: "Task created",
        data: created,
    });
}));
const listTasks = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { unitId } = req.params;
    const items = yield task_services_1.TaskServices.listByUnit(unitId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Tasks fetched",
        data: items,
    });
}));
const updateTask = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const token = req.user;
    const updated = yield task_services_1.TaskServices.update(id, req.body, { userId: token.userId, role: token.role });
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Task updated",
        data: updated,
    });
}));
const deleteTask = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const token = req.user;
    yield task_services_1.TaskServices.remove(id, { userId: token.userId, role: token.role });
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Task deleted",
        data: null,
    });
}));
exports.taskController = { createTask, listTasks, updateTask, deleteTask };
