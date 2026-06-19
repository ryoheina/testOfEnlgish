"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface TimerProps {
  minutes: number;
  onExpire: () => void;
  isRunning: boolean;
}

export function Timer({ minutes, onExpire, isRunning }: TimerProps) {
  const totalSeconds = minutes * 60;

  return (
    <TimerInner
      key={totalSeconds}
      totalSeconds={totalSeconds}
      onExpire={onExpire}
      isRunning={isRunning}
    />
  );
}

function TimerInner({
  totalSeconds,
  onExpire,
  isRunning,
}: {
  totalSeconds: number;
  onExpire: () => void;
  isRunning: boolean;
}) {
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);

  useEffect(() => {
    if (!isRunning) return;
    if (secondsLeft <= 0) {
      onExpire();
      return;
    }
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isRunning, secondsLeft, onExpire]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const isLow = secondsLeft < 300;

  return (
    <motion.div
      animate={isLow ? { scale: [1, 1.05, 1] } : {}}
      transition={{ repeat: isLow ? Infinity : 0, duration: 1 }}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-xl glass font-mono text-lg",
        isLow ? "text-red-400 border border-red-500/30" : "text-cyan-400"
      )}
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
    </motion.div>
  );
}
