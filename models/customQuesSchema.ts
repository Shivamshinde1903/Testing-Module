import { z } from "zod";

export const CustomQuesschema = z.object({
  fk_test_id: z.string(),
  questionText: z.string(),
  questionDescription: z.string().optional(),
  questionType: z.string(),
  answerFormat: z.string(),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string().optional(),
  numericalAnswer: z.number().optional(),
  created_by: z.string(),
  marks: z.number().optional().default(1),
});
