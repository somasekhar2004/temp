// filename: server/src/models/Quiz.ts
import { Schema, model, type HydratedDocument, type Model, Types } from 'mongoose';

export interface IQuizQuestion {
  text: string;
  options: { id: string; text: string }[];
  correctOptionIds: string[];
  type: 'single-choice' | 'multi-select' | 'true/false';
}

export interface IQuizParticipant {
  userId: Types.ObjectId;
  addedAt: Date;
}

export interface IQuiz {
  title: string;
  description: string;
  duration: number; // in minutes
  startTime: Date;
  endTime: Date;
  status: 'Draft' | 'Scheduled' | 'Live' | 'Completed' | 'Cancelled';
  instructor: Types.ObjectId;
  questions: IQuizQuestion[];
  participants: IQuizParticipant[];
  cancellationTimestamp?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type QuizDocument = HydratedDocument<IQuiz>;

const questionSchema = new Schema<IQuizQuestion>({
  text: { type: String, required: true, trim: true },
  options: [
    {
      id: { type: String, required: true },
      text: { type: String, required: true, trim: true },
    },
  ],
  correctOptionIds: { type: [String], required: true },
  type: {
    type: String,
    enum: ['single-choice', 'multi-select', 'true/false'],
    required: true,
  },
});

const participantSchema = new Schema<IQuizParticipant>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  addedAt: { type: Date, default: Date.now },
});

const quizSchema = new Schema<IQuiz>(
  {
    title: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    description: { type: String, required: true, trim: true },
    duration: { type: Number, required: true, min: 1 },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: {
      type: String,
      enum: ['Draft', 'Scheduled', 'Live', 'Completed', 'Cancelled'],
      default: 'Draft',
      index: true,
    },
    instructor: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    questions: { type: [questionSchema], default: [] },
    participants: { type: [participantSchema], default: [] },
    cancellationTimestamp: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound index on instructor + status for quick queries
quizSchema.index({ instructor: 1, status: 1 });

export const Quiz: Model<IQuiz> = model<IQuiz>('Quiz', quizSchema);
