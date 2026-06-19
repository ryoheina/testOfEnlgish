import { z } from "zod";

export const studentInfoSchema = z.object({
  fullName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "Name contains invalid characters"),
  studentId: z.string().max(50).optional().nullable(),
});

export const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(50),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const questionSchema = z.object({
  questionText: z.string().min(5, "Question must be at least 5 characters"),
  optionA: z.string().min(1, "Option A is required"),
  optionB: z.string().min(1, "Option B is required"),
  optionC: z.string().min(1, "Option C is required"),
  optionD: z.string().min(1, "Option D is required"),
  correctAnswer: z.enum(["A", "B", "C", "D"]),
  category: z.string().optional().nullable(),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
  isActive: z.boolean().default(true),
});

export const submitTestSchema = z.object({
  sessionId: z.string().uuid(),
  answers: z.record(z.string(), z.string()),
  timeTaken: z.number().int().min(0).optional(),
  csrfToken: z.string().min(1),
});

export const testConfigSchema = z.object({
  questionCount: z.number().int().min(20).max(100),
  passPercentage: z.number().int().min(0).max(100),
  timerEnabled: z.boolean(),
  timerMinutes: z.number().int().min(5).max(180),
  randomizeQuestions: z.boolean(),
  randomizeAnswers: z.boolean(),
});

export const progressSaveSchema = z.object({
  sessionId: z.string().uuid(),
  answers: z.record(z.string(), z.string()),
  currentIndex: z.number().int().min(0),
});

export type StudentInfo = z.infer<typeof studentInfoSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type QuestionInput = z.infer<typeof questionSchema>;
export type SubmitTestInput = z.infer<typeof submitTestSchema>;
export type TestConfigInput = z.infer<typeof testConfigSchema>;
