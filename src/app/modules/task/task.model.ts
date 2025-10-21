import { Schema, model, models } from "mongoose";
import { ITask } from "./task.interface";

const TaskSchema = new Schema<ITask>(
  {
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    unit:   { type: Schema.Types.ObjectId, ref: "Unit", required: true, index: true },
    title:  { type: String, required: true },
    description: { type: String, default: "" },
    type:   { type: String, enum: ["quiz","video","pdf"], required: true },

    perCorrectPoint: { type: Number },          // quiz
    maxPoints:       { type: Number },          // cap for any type

    quizId: { type: Schema.Types.ObjectId, ref: "Quiz" }, // when type === "quiz"

    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);

TaskSchema.index({ unit: 1, createdAt: 1 });

export const Task = models.Task || model<ITask>("Task", TaskSchema);
