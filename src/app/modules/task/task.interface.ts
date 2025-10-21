import { Types } from "mongoose";

export type TaskType = "quiz" | "video" | "pdf";

export interface ITask {
    _id?: Types.ObjectId;
    course: Types.ObjectId;         // denormalized for quick queries/leaderboard
    unit: Types.ObjectId;           // parent unit
    title: String;
    description?: String;
    type: TaskType;

    // Scoring config by type
    perCorrectPoint?: number;       // quiz only
    maxPoints?: number;             // optional caps (quiz/video/pdf)

    // Link to quiz (if you keep quizzes in separate module)
    quizId?: Types.ObjectId;        // required when type === "quiz"

    isDeleted?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
