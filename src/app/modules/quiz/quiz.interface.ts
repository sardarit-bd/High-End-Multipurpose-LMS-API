import { Types } from "mongoose";

export type QuizQuestionType = "mcq" | "short";


export interface IQuizQuestion {
  type: QuizQuestionType;
  prompt: string;
  // MCQ
  options?: { text:string; isCorrect: boolean }[];
  // Scoring - both MCQ and Short questions use perCorrectPoint
  perCorrectPoint?: number;  // points awarded for correct answer (MCQ) or max points (Short)
}


export interface IQuiz {
  _id?: Types.ObjectId;
  unit: Types.ObjectId;
  course: Types.ObjectId;
  task?: Types.ObjectId;               // <-- link to Task(type="quiz")
  title: string;                  // optional (%)
  questions: IQuizQuestion[];
  passMark?: number;              // passing percentage (default 50)
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
