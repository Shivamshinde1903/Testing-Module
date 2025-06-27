import { CustomQuestion } from "@/models/customQuestionsModel";
import { handleApiError } from "@/utils/api-error";
import { connectDb } from "@/utils/db";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/custom-question/bulk:
 *   get:
 *     tags:
 *       - Tests
 *     summary: Get all custom questions
 *     responses:
 *       201:
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

export async function GET() {
  await connectDb();

  try {
    const questions = await CustomQuestion.find();

    return NextResponse.json(
      {
        message: "Success",
        questions,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    return handleApiError(error instanceof Error ? error.message : error);
  }
}
