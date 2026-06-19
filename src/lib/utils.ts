import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function getClientIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? null;
  }
  const realIp = request.headers.get("x-real-ip");
  return realIp ?? null;
}

export function calculateScore(
  answers: Record<string, string>,
  questions: { id: string; correctAnswer: string }[]
): { score: number; total: number; percentage: number; passed: boolean } {
  let score = 0;
  const total = questions.length;

  for (const question of questions) {
    if (answers[question.id] === question.correctAnswer) {
      score++;
    }
  }

  const percentage = total > 0 ? (score / total) * 100 : 0;
  const passPercentage = parseInt(
    process.env.NEXT_PUBLIC_PASS_PERCENTAGE || "60",
    10
  );

  return {
    score,
    total,
    percentage,
    passed: percentage >= passPercentage,
  };
}
