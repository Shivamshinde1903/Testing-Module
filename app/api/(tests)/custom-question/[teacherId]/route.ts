import { CustomQuestion } from "@/models/customQuestionsModel";
import { handleApiError } from "@/utils/api-error";
import { connectDb } from "@/utils/db";
import { NextRequest, NextResponse } from "next/server";

/**
 * @swagger
 * /api/custom-question/{teacherId}:
 *   get:
 *     tags:
 *       - Tests
 *     summary: Get custom questions for a teacher
 *     parameters:
 *       - in: query
 *         name: teacherId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the teacher
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 questions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CustomQuestion'
 *       500:
 *         description: Server error
 */

export async function GET(req: NextRequest) {
  await connectDb();

  try {
    const search = new URL(req.url).searchParams;
    const teacher_id = search.get("teacherId");

    const questions = await CustomQuestion.find({
      created_by: teacher_id,
    });

    return NextResponse.json(
      {
        message: "Success",
        questions,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return handleApiError(error instanceof Error ? error.message : error);
  }
}
