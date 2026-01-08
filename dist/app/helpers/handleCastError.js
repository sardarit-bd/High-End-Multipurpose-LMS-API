"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCastError = void 0;
const handleCastError = (err) => {
    console.log(err);
    return {
        statusCode: 400,
        message: "Invalid MongoDB Object Id",
    };
};
exports.handleCastError = handleCastError;
