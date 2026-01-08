"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleValidationError = void 0;
const handleValidationError = (err) => {
    const errors = Object.values(err.errors);
    const errorSources = [];
    errors.forEach((errorObject) => errorSources.push({
        path: errorObject.path,
        message: errorObject.message,
    }));
    return {
        statusCode: 400,
        message: "Validation Error",
        errorSources
    };
};
exports.handleValidationError = handleValidationError;
