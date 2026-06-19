"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Plus, Upload, Pencil, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Question {
  id: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  category: string | null;
  difficulty: string;
  isActive: boolean;
}

const emptyQuestion = {
  questionText: "",
  optionA: "",
  optionB: "",
  optionC: "",
  optionD: "",
  correctAnswer: "A",
  category: "",
  difficulty: "medium",
  isActive: true,
};

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [editing, setEditing] = useState<Question | null>(null);
  const [form, setForm] = useState(emptyQuestion);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchQuestions = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/questions");
    const data = await res.json();
    setQuestions(data.questions || []);
    setLoading(false);
  };

  useEffect(() => { fetchQuestions(); }, []);

  const handleSave = async () => {
    const url = editing ? `/api/admin/questions/${editing.id}` : "/api/admin/questions";
    const method = editing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setShowForm(false);
      setEditing(null);
      setForm(emptyQuestion);
      fetchQuestions();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this question?")) return;
    await fetch(`/api/admin/questions/${id}`, { method: "DELETE" });
    fetchQuestions();
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/admin/questions/import", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (res.ok) {
      alert(`Imported ${data.imported} questions${data.errors ? `. ${data.errors.length} errors.` : ""}`);
      fetchQuestions();
    } else {
      alert(data.error || "Import failed");
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const openEdit = (q: Question) => {
    setEditing(q);
    setForm({
      questionText: q.questionText,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      correctAnswer: q.correctAnswer,
      category: q.category || "",
      difficulty: q.difficulty,
      isActive: q.isActive,
    });
    setShowForm(true);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Questions</h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage test questions ({questions.length} total)
          </p>
        </div>
        <div className="flex gap-2">
          <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleImport} />
          <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-4 h-4" /> Import CSV
          </Button>
          <Button size="sm" onClick={() => { setEditing(null); setForm(emptyQuestion); setShowForm(true); }}>
            <Plus className="w-4 h-4" /> Add Question
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <GlassCard>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  {editing ? "Edit Question" : "New Question"}
                </h3>
                <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); setEditing(null); }}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-4">
                <Input
                  label="Question"
                  value={form.questionText}
                  onChange={(e) => setForm({ ...form, questionText: e.target.value })}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Option A" value={form.optionA} onChange={(e) => setForm({ ...form, optionA: e.target.value })} />
                  <Input label="Option B" value={form.optionB} onChange={(e) => setForm({ ...form, optionB: e.target.value })} />
                  <Input label="Option C" value={form.optionC} onChange={(e) => setForm({ ...form, optionC: e.target.value })} />
                  <Input label="Option D" value={form.optionD} onChange={(e) => setForm({ ...form, optionD: e.target.value })} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Correct Answer</label>
                    <select
                      value={form.correctAnswer}
                      onChange={(e) => setForm({ ...form, correctAnswer: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl glass text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    >
                      {["A", "B", "C", "D"].map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  </div>
                  <Input label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Difficulty</label>
                    <select
                      value={form.difficulty}
                      onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl glass text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>
                <Button onClick={handleSave}>{editing ? "Update" : "Create"} Question</Button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {loading ? (
          <GlassCard><p className="text-center text-slate-400 py-8">Loading...</p></GlassCard>
        ) : questions.length === 0 ? (
          <GlassCard><p className="text-center text-slate-400 py-8">No questions yet. Add or import some.</p></GlassCard>
        ) : (
          questions.map((q, i) => (
            <GlassCard key={q.id} delay={i * 0.02}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    {q.category && (
                      <span className="px-2 py-0.5 rounded-md text-xs bg-indigo-500/20 text-indigo-300">{q.category}</span>
                    )}
                    <span className={cn(
                      "px-2 py-0.5 rounded-md text-xs",
                      q.difficulty === "easy" ? "bg-emerald-500/20 text-emerald-300" :
                      q.difficulty === "hard" ? "bg-red-500/20 text-red-300" :
                      "bg-amber-500/20 text-amber-300"
                    )}>{q.difficulty}</span>
                    {!q.isActive && (
                      <span className="px-2 py-0.5 rounded-md text-xs bg-slate-500/20 text-slate-400">Inactive</span>
                    )}
                  </div>
                  <p className="text-white font-medium mb-2">{q.questionText}</p>
                  <div className="grid grid-cols-2 gap-1 text-sm">
                    {(["A", "B", "C", "D"] as const).map((key) => (
                      <span key={key} className={cn(
                        "text-slate-400",
                        q.correctAnswer === key && "text-emerald-400 font-medium"
                      )}>
                        {key}: {q[`option${key}` as keyof Question] as string}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(q)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(q.id)}>
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </Button>
                </div>
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
}
