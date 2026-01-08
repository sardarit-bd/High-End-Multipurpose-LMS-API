"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResponse = void 0;
const sendResponse = (res, data) => {
    res.status(data.statusCode).json({
        statusCode: data.statusCode,
        success: data.success,
        meta: data.meta,
        data: data.data,
        message: data.message
    });
};
exports.sendResponse = sendResponse;
