import { Schema, model, models } from "mongoose";
import { IUnit } from "./unit.interface";

const UnitSchema = new Schema<IUnit>(
    {
        course: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
        title: { type: String, required: true },
        orderIndex: { type: Number, required: true, default: 1 },
        isDeleted: { type: Boolean, default: false },
    },
    { timestamps: true, versionKey: false }
);

UnitSchema.index({ course: 1, orderIndex: 1 });

export const Unit = models.Unit || model<IUnit>("Unit", UnitSchema);
