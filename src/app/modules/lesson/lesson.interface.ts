import { Types } from "mongoose";

export type LessonContentType = "video" | "article" | "pdf" | "audio" | "link";

export interface ILesson {
  _id?: Types.ObjectId;
  unit: Types.ObjectId;                 
//   course: Types.ObjectId;               
  title:string;        
  contentType: LessonContentType;
  contentUrl: string;  
  durationSec?: number;
                   
  orderIndex: number;                   
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
