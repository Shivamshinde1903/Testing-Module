import mongoose, { Document, Model, Schema } from "mongoose";
import { QuestionTypeEnum, AnswerFormatEnum } from "../models/questionsSchema"; // Assuming you've exported these from your original question model

interface ICustomQuestion extends Document {
  fk_test_id: mongoose.Types.ObjectId;
  questionText: string;
  questionDescription?: string;
  questionType: QuestionTypeEnum;
  answerFormat: AnswerFormatEnum;
  options?: string[];
  correctAnswer: string;
  numericalAnswer?: number;
  created_by: mongoose.Types.ObjectId;
  marks?: number;
}

const customQuestionSchema: Schema = new mongoose.Schema(
  {
    fk_test_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Test",
      required: true,
      index: true,
    },
    questionText: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    questionDescription: {
      type: String,
      trim: true,
    },
    questionType: {
      type: String,
      required: true,
      enum: Object.values(QuestionTypeEnum),
    },
    answerFormat: {
      type: String,
      required: true,
      enum: Object.values(AnswerFormatEnum),
    },
    options: {
      type: [String],
      default: [],
      validate: {
        validator: function (this: ICustomQuestion, value: string[]) {
          return this.questionType === QuestionTypeEnum.MCQ
            ? value && value.length > 0
            : true;
        },
        message: "Options must contain at least one item for MCQ.",
      },
    },
    correctAnswer: {
      type: String,
      required: function (this: ICustomQuestion) {
        return this.questionType === QuestionTypeEnum.MCQ;
      },
    },
    numericalAnswer: {
      type: Number,
      required: function (this: ICustomQuestion) {
        return this.questionType === QuestionTypeEnum.NUMERICAL;
      },
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    marks: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

export const CustomQuestion: Model<ICustomQuestion> =
  mongoose.models.CustomQuestion ||
  mongoose.model<ICustomQuestion>("CustomQuestion", customQuestionSchema);
