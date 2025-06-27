import mongoose, { Document, Schema } from "mongoose";

interface ITest extends Document {
  test_title: string;
  created_at: Date;
  created_by: string;
  valid_upto: string;
  marks: number;
  questions: mongoose.Types.ObjectId[];
  custom_questions: mongoose.Types.ObjectId[];
  attempted_students: {
    student: mongoose.Types.ObjectId;
    attempted_at: Date;
    evaluated_by?: mongoose.Types.ObjectId;
    score?: number;
    is_evaluated: boolean;
  }[];
}

const testSchema: Schema = new Schema(
  {
    test_title: {
      type: String,
      required: [true, "Required Field"],
      trim: true,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    created_by: {
      type: String,
      required: [true, "Required Field"],
      trim: true,
    },
    valid_upto: {
      type: String,
      required: [true, "Required Field"],
      trim: true,
    },
    marks: {
      type: Number,
      required: [true, "Required Field"],
    },
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
        required: [true, "Required Field"],
      },
    ],
    attempted_students: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Student",
          required: true,
        },
        attempted_at: {
          type: Date,
          default: Date.now,
        },
        evaluated_by: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Teacher",
        },
        score: {
          type: Number,
        },
        is_evaluated: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  { timestamps: true }
);

export const TestModel: mongoose.Model<ITest> =
  mongoose.models.Test || mongoose.model<ITest>("Test", testSchema);
