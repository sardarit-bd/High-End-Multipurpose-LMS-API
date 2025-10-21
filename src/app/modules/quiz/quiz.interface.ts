import { Types } from "mongoose";

export type QuizQuestionType = "mcq" | "short";


export interface IQuizQuestion {
  type: QuizQuestionType;
  prompt: string;
  // MCQ
  options?: { text:string; isCorrect: boolean }[];
  // Scoring
  perCorrectPoint?: number;  // for MCQ (optional override; falls back to Task.perCorrectPoint)
  maxPoints?: number;        // for SHORT (required)
}


export interface IQuiz {
  _id?: Types.ObjectId;
  unit: Types.ObjectId;
  course: Types.ObjectId;
  task?: Types.ObjectId;               // <-- link to Task(type="quiz")
  title: string;                  // optional (%)
  questions: IQuizQuestion[];
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
