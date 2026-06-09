// filename: server/src/models/QuizAttempt.ts
import { Schema, model, type HydratedDocument, type Model, Types } from 'mongoose';

export interface ICandidateAnswer {
  questionId: string; // references question ID in Quiz questions
  selectedOptionIds: string[];
}

export interface IQuizAttempt {
  quizId: Types.ObjectId;
  candidateId: Types.ObjectId;
  startedAt: Date;
  submittedAt?: Date;
  answers: ICandidateAnswer[];
  score: number;
  status: 'started' | 'submitted' | 'auto-submitted';
  createdAt: Date;
  updatedAt: Date;
}

export type QuizAttemptDocument = HydratedDocument<IQuizAttempt>;

const answerSchema = new Schema<ICandidateAnswer>({
  questionId: { type: String, required: true },
  selectedOptionIds: { type: [String], required: true },
});

const quizAttemptSchema = new Schema<IQuizAttempt>(
  {
    quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true, index: true },
    candidateId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    startedAt: { type: Date, required: true, default: Date.now },
    submittedAt: { type: Date },
    answers: { type: [answerSchema], default: [] },
    score: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: ['started', 'submitted', 'auto-submitted'],
      default: 'started',
      index: true,
    },
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

// Compound unique index to guarantee one attempt per candidate per quiz
quizAttemptSchema.index({ quizId: 1, candidateId: 1 }, { unique: true });

export const QuizAttempt: Model<IQuizAttempt> = model<IQuizAttempt>('QuizAttempt', quizAttemptSchema);
