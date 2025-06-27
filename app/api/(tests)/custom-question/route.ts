import { handleApiError } from "@/utils/api-error";
import { connectDb } from "@/utils/db";
import { NextRequest, NextResponse } from "next/server";
import { CustomQuestion } from "@/models/customQuestionsModel";
import { CustomQuesschema } from "@/models/customQuesSchema";

/**
 * @swagger
 * /api/custom-question:
 *   post:
 *     tags:
 *       - Tests
 *     summary: Create a new custom question
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fk_test_id
 *               - questionText
 *               - questionType
 *               - answerFormat
 *               - correctAnswer
 *               - created_by
 *             properties:
 *               fk_test_id:
 *                 type: string
 *               questionText:
 *                 type: string
 *               questionDescription:
 *                 type: string
 *               questionType:
 *                 type: string
 *               answerFormat:
 *                 type: string
 *               options:
 *                 type: array
 *               correctAnswer:
 *                 type: string
 *               numericalAnswer:
 *                 type: number
 *               created_by:
 *                 type: string
 *               marks:
 *                 type: number
 *     responses:
 *       201:
 *         description: Custom question created successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */

export async function POST(req: NextRequest) {
  await connectDb();
  try {
    const body = await req.json();

    const validatedBody = CustomQuesschema.safeParse(body);

    if (!validatedBody.success)
      throw new Error("Validation error!", validatedBody.error);

    const customQuestion = await CustomQuestion.create({
      fk_test_id: validatedBody.data.fk_test_id,
      questionText: validatedBody.data.questionText,
      questionDescription: validatedBody.data.questionDescription,
      questionType: validatedBody.data.questionType,
      answerFormat: validatedBody.data.answerFormat,
      options: validatedBody.data.options,
      correctAnswer: validatedBody.data.correctAnswer,
      numericalAnswer: validatedBody.data.numericalAnswer,
      created_by: validatedBody.data.created_by,
      marks: validatedBody.data.marks ?? 1,
    });

    return NextResponse.json(
      { message: "Success", customQuestion },
      {
        status: 201,
      }
    );
  } catch (error) {
    return handleApiError(error instanceof Error ? error.message : error);
  }
}
