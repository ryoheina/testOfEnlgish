"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { CheckCircle, XCircle, Download, Home, Trophy } from "lucide-react";

interface TestResult {
  resultId: string;
  score: number;
  total: number;
  percentage: number;
  passed: boolean;
  studentName: string;
  downloadUrl: string | null;
  downloadFileName: string | null;
}

export default function ResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState<TestResult | null>(null);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("testResult");
    if (!stored) {
      router.push("/");
      return;
    }
    const parsed = JSON.parse(stored) as TestResult;
    setResult(parsed);

    if (parsed.downloadUrl && !downloaded) {
      const link = document.createElement("a");
      link.href = parsed.downloadUrl;
      link.download = parsed.downloadFileName || "download";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setDownloaded(true);
    }
  }, [router, downloaded]);

  if (!result) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference - (result.percentage / 100) * circumference;

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="w-full max-w-lg"
      >
        <GlassCard className="text-center neon-glow">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="mb-6"
          >
            {result.passed ? (
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20">
                <CheckCircle className="w-10 h-10 text-emerald-400" />
              </div>
            ) : (
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20">
                <XCircle className="w-10 h-10 text-red-400" />
              </div>
            )}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-2xl font-bold text-white mb-2"
          >
            {result.passed ? "Congratulations!" : "Test Complete"}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-slate-400 mb-8"
          >
            Thank you, {result.studentName}. Here are your results.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="relative w-48 h-48 mx-auto mb-8"
          >
            <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="8"
              />
              <motion.circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke={result.passed ? "#10b981" : "#ef4444"}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.5, delay: 0.7, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Trophy className="w-6 h-6 text-indigo-400 mb-1" />
              <span className="text-4xl font-bold text-white">
                {result.percentage.toFixed(0)}%
              </span>
              <span className="text-sm text-slate-400">
                {result.score}/{result.total}
       </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="inline-block px-6 py-2 rounded-full mb-8"
            style={{
              background: result.passed
                ? "rgba(16, 185, 129, 0.15)"
                : "rgba(239, 68, 68, 0.15)",
            }}
          >
            <span
              className={`font-semibold ${result.passed ? "text-emerald-400" : "text-red-400"}`}
            >
              {result.passed ? "PASSED" : "FAILED"}
            </span>
          </motion.div>

          {result.downloadUrl && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mb-6"
            >
              <a href={result.downloadUrl} download={result.downloadFileName || undefined}>
                <Button variant="secondary" size="sm">
                  <Download className="w-4 h-4" />
                  {downloaded ? "Download Again" : "Download File"}
                </Button>
              </a>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
          >
            <Link href="/">
              <Button variant="ghost">
                <Home className="w-4 h-4" />
                Return Home
              </Button>
            </Link>
          </motion.div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
