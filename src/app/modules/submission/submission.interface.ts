import { Types } from "mongoose";

export type SubmissionStatus = "auto_scored" | "pending_review";

export interface IAnsweredItem {
    qIndex: number;
    type: "mcq" | "short";
    selected?: number[];   // for mcq
    text?: string;         // for short
    autoPoints?: number;   // computed for mcq
    reviewPoints?: number; // set by instructor for short
    maxPoints?: number;    // short question cap (for UI/reference)
}
export interface ITaskSubmission {
    _id?: Types.ObjectId;
    task: Types.ObjectId;
    unit: Types.ObjectId;
    course: Types.ObjectId;
    user: Types.ObjectId;

    // For file/video tasks
    artifactUrl?: string;         // uploaded file/video link
    note?: string;

    // For quiz tasks
    quizAttemptId?: Types.ObjectId;
    correctAnswers?: number;
    breakdown?: IAnsweredItem[];
    pointsAwarded: number;        // final awarded (0..maxPoints or computed for quiz)
    status: SubmissionStatus;     // pending/approved/rejected/auto_scored
    createdAt?: Date;
    updatedAt?: Date;
}
