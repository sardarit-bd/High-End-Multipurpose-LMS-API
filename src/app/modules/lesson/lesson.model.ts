import { Schema, model, models } from "mongoose";
import { ILesson } from "./lesson.interface";

const LessonSchema = new Schema<ILesson>(
    {
        unit: { type: Schema.Types.ObjectId, ref: "Unit", required: true, index: true },
        // course: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },

        title: { type: String, required: true },

        contentType: {
            type: String,
            enum: ["video", "article", "pdf", "audio", "link"],
            required: true,
        },
        contentUrl: { type: String, required: true },
        durationSec: { type: Number },
        orderIndex: { type: Number, required: true, default: 1 },
        isDeleted: { type: Boolean, default: false },
    },
    { timestamps: true, versionKey: false }
);

LessonSchema.index({ unit: 1, orderIndex: 1 });

export const Lesson = models.Lesson || model<ILesson>("Lesson", LessonSchema);

const CompletedLessonSchema = new Schema({
  user:   { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  lesson: { type: Schema.Types.ObjectId, ref: "Lesson", required: true, index: true },
  course: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
  completedAt: { type: Date, default: Date.now }
}, { versionKey: false });

CompletedLessonSchema.index({ user: 1, lesson: 1 }, { unique: true });

export const CompletedLesson = models.CompletedLesson || model("CompletedLesson", CompletedLessonSchema);
