"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Timer } from "@/components/ui/Timer";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Send } from "lucide-react";

interface Question {
  id: string;
  questionText: string;
  options: { key: string; text: string }[];
  category?: string | null;
  difficulty?: string;
}

interface TestSession {
  sessionId: string;
  csrfToken: string;
  questions: Question[];
  config: {
    questionCount: number;
    passPercentage: number;
    timerEnabled: boolean;
    timerMinutes: number;
  };
}

export default function TakeTestPage() {
  const router = useRouter();
  const [session, setSession] = useState<TestSession | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [startTime] = useState(Date.now());
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("testSession");
    if (!stored) {
      router.push("/test");
      return;
    }
    const parsed = JSON.parse(stored) as TestSession;
    setSession(parsed);

    const savedProgress = sessionStorage.getItem(`progress_${parsed.sessionId}`);
    if (savedProgress) {
      const progress = JSON.parse(savedProgress);
      setAnswers(progress.answers || {});
      setCurrentIndex(progress.currentIndex || 0);
    }
  }, [router]);

  const saveProgress = useCallback(
    (newAnswers: Record<string, string>, newIndex: number) => {
      if (!session) return;

      sessionStorage.setItem(
        `progress_${session.sessionId}`,
        JSON.stringify({ answers: newAnswers, currentIndex: newIndex })
      );

      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        fetch("/api/test/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: session.sessionId,
            answers: newAnswers,
            currentIndex: newIndex,
          }),
        }).catch(() => {});
      }, 2000);
    },
    [session]
  );

  const selectAnswer = (questionId: string, answer: string) => {
    const newAnswers = { ...answers, [questionId]: answer };
    setAnswers(newAnswers);
    saveProgress(newAnswers, currentIndex);
  };

  const goToQuestion = (index: number) => {
    if (!session) return;
    if (index >= 0 && index < session.questions.length) {
      setCurrentIndex(index);
      saveProgress(answers, index);
    }
  };

  const handleSubmit = async () => {
    if (!session) return;

    const unanswered = session.questions.filter((q) => !answers[q.id]);
    if (unanswered.length > 0) {
      alert(`Please answer all questions. ${unanswered.length} remaining.`);
      const firstUnanswered = session.questions.findIndex((q) => !answers[q.id]);
      if (firstUnanswered >= 0) setCurrentIndex(firstUnanswered);
      return;
    }

    setSubmitting(true);
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);

    try {
      const res = await fetch("/api/test/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.sessionId,
          answers,
          timeTaken,
          csrfToken: session.csrfToken,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Submission failed");
        setSubmitting(false);
        return;
      }

      sessionStorage.removeItem("testSession");
      sessionStorage.removeItem(`progress_${session.sessionId}`);
      sessionStorage.setItem("testResult", JSON.stringify(data));
      router.push("/results");
    } catch {
      alert("Network error. Please try again.");
      setSubmitting(false);
    }
  };

  const handleTimerExpire = () => {
    if (!submitting) handleSubmit();
  };

  if (!session) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const question = session.questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const isLastQuestion = currentIndex === session.questions.length - 1;

  return (
    <div className="min-h-screen gradient-bg">
      <header className="sticky top-0 z-50 glass border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-slate-400">
              Question {currentIndex + 1} of {session.questions.length}
            </span>
            {session.config.timerEnabled && (
              <Timer
                minutes={session.config.timerMinutes}
                onExpire={handleTimerExpire}
                isRunning={!submitting}
              />
            )}
          </div>
          <ProgressBar
            value={answeredCount}
            max={session.questions.length}
          />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={question.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <GlassCard className="mb-6">
              {question.category && (
                <span className="inline-block px-2 py-0.5 rounded-md text-xs bg-indigo-500/20 text-indigo-300 mb-3">
                  {question.category}
                </span>
              )}
              <h2 className="text-xl font-semibold text-white leading-relaxed">
                {question.questionText}
              </h2>
            </GlassCard>

            <div className="space-y-3">
              {question.options.map((option, idx) => {
                const isSelected = answers[question.id] === option.key;
                return (
                  <motion.button
                    key={option.key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => selectAnswer(question.id, option.key)}
                    className={cn(
                      "w-full text-left p-4 rounded-xl glass transition-all duration-200 cursor-pointer",
                      isSelected
                        ? "border-indigo-500/50 bg-indigo-500/10 ring-2 ring-indigo-500/30"
                        : "hover:bg-white/5 border border-transparent"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium shrink-0",
                          isSelected
                            ? "bg-indigo-500 text-white"
                            : "bg-white/5 text-slate-400"
                        )}
                      >
                        {option.key}
                      </span>
                      <span className="text-slate-200">{option.text}</span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between mt-8">
          <Button
            variant="secondary"
            onClick={() => goToQuestion(currentIndex - 1)}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          {isLastQuestion ? (
            <Button onClick={handleSubmit} loading={submitting}>
              Submit Test
              <Send className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={() => {
                if (!answers[question.id]) {
                  alert("Please select an answer before proceeding.");
                  return;
                }
                goToQuestion(currentIndex + 1);
              }}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>

        <div className="mt-8 flex flex-wrap gap-2 justify-center">
          {session.questions.map((q, idx) => (
            <button
              key={q.id}
              onClick={() => goToQuestion(idx)}
              className={cn(
                "w-8 h-8 rounded-lg text-xs font-medium transition-all cursor-pointer",
                idx === currentIndex
                  ? "bg-indigo-500 text-white"
                  : answers[q.id]
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-white/5 text-slate-500 hover:bg-white/10"
              )}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
