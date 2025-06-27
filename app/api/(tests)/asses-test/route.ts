import { TestModel } from "@/models/testModel";
import { handleApiError } from "@/utils/api-error";
import { connectDb } from "@/utils/db";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

/**
 * @swagger
 * /api/asses-test:
 *   get:
 *     tags:
 *       - Tests
 *     summary: Get tests that need evaluation
 *     description: Retrieves tests where students have attempted but not been evaluated
 *     parameters:
 *       - in: query
 *         name: teacher_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the teacher
 *     responses:
 *       200:
 *         description: Tests retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 tests:
 *                   type: array
 *       400:
 *         description: Invalid or missing teacher ID
 *       500:
 *         description: Server error
 */

export async function GET(req: NextRequest) {
  await connectDb();

  try {
    const { searchParams } = new URL(req.url);
    const teacher_id = searchParams.get("teacher_id");

    if (!teacher_id || !mongoose.Types.ObjectId.isValid(teacher_id)) {
      return NextResponse.json(
        { message: "Invalid or missing teacher ID" },
        { status: 400 }
      );
    }

    const tests = await TestModel.find({
      attempted_students: {
        $elemMatch: {
          is_evaluated: false,
          student: { $exists: true },
        },
      },
    })
      .populate({
        path: "attempted_students.student",
        select: "name email",
      })
      .select("test_title marks valid_upto attempted_students")
      .lean();

    const testsToEvaluate = tests
      .map((test) => ({
        ...test,
        unevaluated_attempts: test.attempted_students.filter(
          (attempt) => !attempt.is_evaluated
        ),
      }))
      .filter((test) => test.unevaluated_attempts.length > 0);

    return NextResponse.json(
      {
        message: "Tests retrieved successfully",
        tests: testsToEvaluate,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error instanceof Error ? error.message : error);
  }
}
