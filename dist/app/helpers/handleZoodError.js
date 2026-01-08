"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleZodError = void 0;
const handleZodError = (err) => {
    const errorSources = [];
    err.issues.forEach((issue) => {
        errorSources.push({
            path: issue.path[issue.path.length - 1],
            message: issue.message,
        });
    });
    return {
        message: 'Zod Error',
        statusCode: 400,
        errorSources
    };
};
exports.handleZodError = handleZodError;
