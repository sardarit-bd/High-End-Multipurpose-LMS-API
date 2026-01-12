import { Schema, model, models } from "mongoose";
import { ITaskSubmission } from "./submission.interface";

const SubmissionSchema = new Schema<ITaskSubmission>(
  {
    task:   { type: Schema.Types.ObjectId, ref: "Task", required: true, index: true },
    unit:   { type: Schema.Types.ObjectId, ref: "Unit", required: true, index: true },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    user:   { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    quiz:   { type: Schema.Types.ObjectId, ref: "Quiz" },
    type:   { type: String, enum: ["quiz", "task"], required: true },
    instructor: { type: Schema.Types.ObjectId, ref: "User", required: true },

    artifactUrl: { type: String },
    note: { type: String },

    quizAttemptId: { type: Schema.Types.ObjectId, ref: "QuizAttempt" },
    correctAnswers: { type: Number },

    pointsAwarded: { type: Number, required: true, default: 0 },
    breakdown: { type: Array }, // per-question breakdown for quizzes
    status: { type: String, enum: ["auto_scored" , "pending_review", "reviewed"], required: true, default: "pending_review" },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" }, // instructor who reviewed
    reviewedAt: { type: Date }, // review timestamp
    reviewNote: { type: String }, // instructor feedback/comments
  },
  { timestamps: true, versionKey: false }
);

SubmissionSchema.index({ course: 1, user: 1 });

export const TaskSubmission = models.TaskSubmission || model<ITaskSubmission>("TaskSubmission", SubmissionSchema);
