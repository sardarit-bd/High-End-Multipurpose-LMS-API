"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Unit = void 0;
const mongoose_1 = require("mongoose");
const UnitSchema = new mongoose_1.Schema({
    course: { type: mongoose_1.Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    title: { type: String, required: true },
    orderIndex: { type: Number, required: true, default: 1 },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true, versionKey: false });
UnitSchema.index({ course: 1, orderIndex: 1 });
exports.Unit = mongoose_1.models.Unit || (0, mongoose_1.model)("Unit", UnitSchema);
