import { Schema, model, models } from "mongoose";
import { IQuiz, IQuizQuestion } from "./quiz.interface";

const OptionSchema = new Schema(
  {
    text: { type: String, required: true },
    isCorrect: { type: Boolean, required: true, default: false },
  },
  { _id: false }
);

const QuestionSchema = new Schema<IQuizQuestion>(
  {
    type: { type: String, enum: ["mcq", 'short'], required: true },
    prompt: { type: String, required: true },
    options: { type: [OptionSchema] },
    maxPoints: { type: Number },
    perCorrectPoint: { type: Number },
  },
  { _id: false }
);

const QuizSchema = new Schema<IQuiz>(
  {
    unit:   { type: Schema.Types.ObjectId, ref: "Unit", required: true, index: true },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    task:   { type: Schema.Types.ObjectId, ref: "Task", index: true }, // 1-1 with Task(type=quiz)

    title:    { type: String, required: true },
    questions: { type: [QuestionSchema], required: true },

    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);

QuizSchema.index({ unit: 1, createdAt: 1 });

export const Quiz = models.Quiz || model<IQuiz>("Quiz", QuizSchema);
