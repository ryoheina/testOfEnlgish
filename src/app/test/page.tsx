"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { GlassCard } from "@/components/ui/GlassCard";
import { BookOpen, ArrowLeft } from "lucide-react";

export default function TestStartPage() {
  const router = useRouter();
  const [form, setForm] = useState({ fullName: "", studentId: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.fullName.trim() || form.fullName.trim().length < 2) {
      newErrors.fullName = "Full name is required (min 2 characters)";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/test/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrors({ form: data.error || "Failed to start test" });
        return;
      }

      sessionStorage.setItem("testSession", JSON.stringify(data));
      router.push("/test/take");
    } catch {
      setErrors({ form: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex flex-col">
      <nav className="glass border-b border-white/5">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <span className="font-medium text-white">Student Information</span>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <GlassCard className="neon-glow">
            <h1 className="text-2xl font-bold text-white mb-2">
              Before You Begin
            </h1>
            <p className="text-slate-400 text-sm mb-6">
              Please provide your information to start the English proficiency test.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Full Name *"
                placeholder="Enter your full name"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                error={errors.fullName}
              />
              <Input
                label="Student ID (Optional)"
                placeholder="Enter your student ID"
                value={form.studentId}
                onChange={(e) => setForm({ ...form, studentId: e.target.value })}
              />

              {errors.form && (
                <p className="text-sm text-red-400 text-center">{errors.form}</p>
              )}

              <Button type="submit" className="w-full" size="lg" loading={loading}>
                Start Test
              </Button>
            </form>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
