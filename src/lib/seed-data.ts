import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

export const sampleQuestions = [
  {
    questionText: "Choose the correct form: She _____ to the store every morning.",
    optionA: "go",
    optionB: "goes",
    optionC: "going",
    optionD: "gone",
    correctAnswer: "B",
    category: "Grammar",
    difficulty: "easy",
  },
  {
    questionText: "What is the synonym of 'abundant'?",
    optionA: "Scarce",
    optionB: "Plentiful",
    optionC: "Limited",
    optionD: "Rare",
    correctAnswer: "B",
    category: "Vocabulary",
    difficulty: "medium",
  },
  {
    questionText: "Identify the error: 'Neither of the boys have finished their homework.'",
    optionA: "Neither",
    optionB: "have",
    optionC: "their",
    optionD: "homework",
    correctAnswer: "B",
    category: "Grammar",
    difficulty: "hard",
  },
  {
    questionText: "Which sentence is in the passive voice?",
    optionA: "The cat chased the mouse.",
    optionB: "The mouse was chased by the cat.",
    optionC: "The cat is chasing the mouse.",
    optionD: "The cat will chase the mouse.",
    correctAnswer: "B",
    category: "Grammar",
    difficulty: "medium",
  },
  {
    questionText: "What does the idiom 'break the ice' mean?",
    optionA: "To destroy something frozen",
    optionB: "To start a conversation in a social setting",
    optionC: "To end a relationship",
    optionD: "To cool down a room",
    correctAnswer: "B",
    category: "Idioms",
    difficulty: "easy",
  },
  {
    questionText: "Choose the correct preposition: The book is _____ the table.",
    optionA: "in",
    optionB: "at",
    optionC: "on",
    optionD: "by",
    correctAnswer: "C",
    category: "Grammar",
    difficulty: "easy",
  },
  {
    questionText: "Which word is an adverb?",
    optionA: "Quick",
    optionB: "Quickly",
    optionC: "Quicken",
    optionD: "Quickness",
    correctAnswer: "B",
    category: "Grammar",
    difficulty: "easy",
  },
  {
    questionText: "What is the past participle of 'write'?",
    optionA: "Wrote",
    optionB: "Written",
    optionC: "Writed",
    optionD: "Writing",
    correctAnswer: "B",
    category: "Grammar",
    difficulty: "medium",
  },
  {
    questionText: "Choose the correct sentence:",
    optionA: "Me and him went to the park.",
    optionB: "Him and I went to the park.",
    optionC: "He and I went to the park.",
    optionD: "I and he went to the park.",
    correctAnswer: "C",
    category: "Grammar",
    difficulty: "medium",
  },
  {
    questionText: "What is the antonym of 'generous'?",
    optionA: "Kind",
    optionB: "Stingy",
    optionC: "Wealthy",
    optionD: "Happy",
    correctAnswer: "B",
    category: "Vocabulary",
    difficulty: "easy",
  },
  {
    questionText: "Which sentence uses the subjunctive mood correctly?",
    optionA: "If I was rich, I would travel.",
    optionB: "If I were rich, I would travel.",
    optionC: "If I am rich, I would travel.",
    optionD: "If I be rich, I would travel.",
    correctAnswer: "B",
    category: "Grammar",
    difficulty: "hard",
  },
  {
    questionText: "What type of clause is underlined: 'The man who lives next door is a doctor.'",
    optionA: "Noun clause",
    optionB: "Adverb clause",
    optionC: "Relative clause",
    optionD: "Independent clause",
    correctAnswer: "C",
    category: "Grammar",
    difficulty: "hard",
  },
  {
    questionText: "Choose the word that best completes the sentence: The evidence was _____ to prove his innocence.",
    optionA: "insufficient",
    optionB: "insufficing",
    optionC: "unsufficient",
    optionD: "disufficient",
    correctAnswer: "A",
    category: "Vocabulary",
    difficulty: "medium",
  },
  {
    questionText: "Which is the correct plural form of 'analysis'?",
    optionA: "Analysises",
    optionB: "Analyses",
    optionC: "Analysises",
    optionD: "Analysis",
    correctAnswer: "B",
    category: "Grammar",
    difficulty: "medium",
  },
  {
    questionText: "What figure of speech is used in 'The stars danced in the sky'?",
    optionA: "Simile",
    optionB: "Metaphor",
    optionC: "Personification",
    optionD: "Hyperbole",
    correctAnswer: "C",
    category: "Literature",
    difficulty: "medium",
  },
  {
    questionText: "Choose the correct comparative form: This book is _____ than that one.",
    optionA: "more interesting",
    optionB: "interestinger",
    optionC: "most interesting",
    optionD: "more interestinger",
    correctAnswer: "A",
    category: "Grammar",
    difficulty: "easy",
  },
  {
    questionText: "What is a homophone pair?",
    optionA: "Words with similar meanings",
    optionB: "Words that sound alike but have different meanings",
    optionC: "Words with opposite meanings",
    optionD: "Words borrowed from other languages",
    correctAnswer: "B",
    category: "Vocabulary",
    difficulty: "easy",
  },
  {
    questionText: "Identify the conjunction: 'She studied hard, but she still failed the exam.'",
    optionA: "She",
    optionB: "hard",
    optionC: "but",
    optionD: "still",
    correctAnswer: "C",
    category: "Grammar",
    difficulty: "easy",
  },
  {
    questionText: "Which sentence contains a dangling modifier?",
    optionA: "Running quickly, the finish line approached.",
    optionB: "She ran quickly toward the finish line.",
    optionC: "The finish line was reached quickly.",
    optionD: "Quickly, she reached the finish line.",
    correctAnswer: "A",
    category: "Grammar",
    difficulty: "hard",
  },
  {
    questionText: "What is the meaning of 'ephemeral'?",
    optionA: "Lasting forever",
    optionB: "Lasting for a very short time",
    optionC: "Extremely large",
    optionD: "Very important",
    correctAnswer: "B",
    category: "Vocabulary",
    difficulty: "hard",
  },
  {
    questionText: "Choose the correct article: She is _____ honest person.",
    optionA: "a",
    optionB: "an",
    optionC: "the",
    optionD: "no article needed",
    correctAnswer: "B",
    category: "Grammar",
    difficulty: "easy",
  },
  {
    questionText: "Which tense is used in 'I have been studying for three hours'?",
    optionA: "Present simple",
    optionB: "Present continuous",
    optionC: "Present perfect continuous",
    optionD: "Past perfect",
    correctAnswer: "C",
    category: "Grammar",
    difficulty: "medium",
  },
  {
    questionText: "What is the root word of 'unhappiness'?",
    optionA: "un",
    optionB: "happy",
    optionC: "ness",
    optionD: "unhappy",
    correctAnswer: "B",
    category: "Vocabulary",
    difficulty: "medium",
  },
  {
    questionText: "Select the correctly punctuated sentence:",
    optionA: "Its a beautiful day.",
    optionB: "It's a beautiful day.",
    optionC: "Its' a beautiful day.",
    optionD: "It`s a beautiful day.",
    correctAnswer: "B",
    category: "Grammar",
    difficulty: "easy",
  },
  {
    questionText: "What literary device compares two things using 'like' or 'as'?",
    optionA: "Metaphor",
    optionB: "Simile",
    optionC: "Alliteration",
    optionD: "Irony",
    correctAnswer: "B",
    category: "Literature",
    difficulty: "easy",
  },
] as const;

export async function seedDatabase(client: PrismaClient): Promise<void> {
  const adminUsername = process.env.ADMIN_USERNAME || "admin";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123456";

  const existingAdmin = await client.admin.findUnique({
    where: { username: adminUsername },
  });

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  if (!existingAdmin) {
    await client.admin.create({
      data: {
        username: adminUsername,
        passwordHash,
        name: "Administrator",
      },
    });
    console.log(`[seed] Admin created: ${adminUsername}`);
  } else if (process.env.RUN_SEED === "true") {
    await client.admin.update({
      where: { username: adminUsername },
      data: { passwordHash },
    });
    console.log(`[seed] Admin password updated: ${adminUsername}`);
  }

  const questionCount = await client.question.count();
  if (questionCount === 0) {
    await client.question.createMany({ data: [...sampleQuestions] });
    console.log(`[seed] Created ${sampleQuestions.length} sample questions.`);
  }

  const config = await client.testConfig.findFirst();
  if (!config) {
    await client.testConfig.create({
      data: {
        questionCount: 20,
        passPercentage: 60,
        timerEnabled: true,
        timerMinutes: 30,
        randomizeQuestions: true,
        randomizeAnswers: true,
      },
    });
    console.log("[seed] Test config created.");
  }
}
