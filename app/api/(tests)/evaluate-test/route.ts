import { handleApiError } from "@/utils/api-error";
import { connectDb } from "@/utils/db";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { TestModel } from "@/models/testModel";
import userModel from "@/models/user.model";
import { ROLE } from "@/utils/types";

/**
 * @swagger
 * /api/evaluate-test:
 *   post:
 *     tags:
 *       - Tests
 *     summary: Evaluate a student's test
 *     description: Updates the score and evaluation status of a student's test attempt
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - test_id
 *               - student_id
 *               - teacher_id
 *               - score
 *             properties:
 *               test_id:
 *                 type: string
 *                 description: ID of the test
 *               student_id:
 *                 type: string
 *                 description: ID of the student being evaluated
 *               teacher_id:
 *                 type: string
 *                 description: ID of the teacher evaluating the test
 *               score:
 *                 type: number
 *                 description: Score awarded to the student
 *     responses:
 *       200:
 *         description: Test evaluation completed successfully
 *       400:
 *         description: Missing required evaluation parameters
 *       404:
 *         description: Test or student attempt not found
 */

export async function POST(req: NextRequest) {
  await connectDb();
  try {
    const { test_id, student_id, teacher_id, score } = await req.json();

    if (!test_id || !student_id || !teacher_id || score === undefined) {
      return NextResponse.json(
        { message: "Missing required evaluation parameters" },
        { status: 400 }
      );
    }

    const student = await userModel.findById(student_id);

    if (!student) throw new Error("Invalid student id");

    if (student.role != ROLE.Student) throw new Error("Not a student Id");

    const updatedTest = await TestModel.findOneAndUpdate(
      {
        _id: mongoose.Types.ObjectId.createFromHexString(test_id),
        "attempted_students.student":
          mongoose.Types.ObjectId.createFromHexString(student_id),
      },
      {
        $set: {
          "attempted_students.$.score": score,
          "attempted_students.$.evaluated_by":
            mongoose.Types.ObjectId.createFromHexString(teacher_id),
          "attempted_students.$.is_evaluated": true,
        },
      },
      { new: true }
    );

    if (!updatedTest) {
      return NextResponse.json(
        { message: "Test or student attempt not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Evaluation completed successfully",
        test: updatedTest,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error instanceof Error ? error.message : error);
  }
}
