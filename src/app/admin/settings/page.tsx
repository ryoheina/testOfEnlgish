"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Save } from "lucide-react";

interface TestConfig {
  questionCount: number;
  passPercentage: number;
  timerEnabled: boolean;
  timerMinutes: number;
  randomizeQuestions: boolean;
  randomizeAnswers: boolean;
}

export default function AdminSettingsPage() {
  const [config, setConfig] = useState<TestConfig>({
    questionCount: 20,
    passPercentage: 60,
    timerEnabled: true,
    timerMinutes: 30,
    randomizeQuestions: true,
    randomizeAnswers: true,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/config")
      .then((r) => r.json())
      .then((data) => { if (data.config) setConfig(data.config); })
      .catch(console.error);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    const res = await fetch("/api/admin/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    if (res.ok) setSaved(true);
    setSaving(false);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Test Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Configure test parameters and behavior</p>
      </div>

      <GlassCard>
        <div className="space-y-6 max-w-lg">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Number of Questions (20-100)
            </label>
            <input
              type="number"
              min={20}
              max={100}
              value={config.questionCount}
              onChange={(e) => setConfig({ ...config, questionCount: parseInt(e.target.value) || 20 })}
              className="w-full px-4 py-2.5 rounded-xl glass text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Pass Percentage (%)
            </label>
            <input
              type="number"
              min={0}
              max={100}
              value={config.passPercentage}
              onChange={(e) => setConfig({ ...config, passPercentage: parseInt(e.target.value) || 60 })}
              className="w-full px-4 py-2.5 rounded-xl glass text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-300">Enable Timer</p>
              <p className="text-xs text-slate-500">Limit test duration</p>
            </div>
            <button
              onClick={() => setConfig({ ...config, timerEnabled: !config.timerEnabled })}
              className={`w-12 h-6 rounded-full transition-colors cursor-pointer ${config.timerEnabled ? "bg-indigo-500" : "bg-white/10"}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform mx-0.5 ${config.timerEnabled ? "translate-x-6" : ""}`} />
            </button>
          </div>

          {config.timerEnabled && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Timer Duration (minutes)
              </label>
              <input
                type="number"
                min={5}
                max={180}
                value={config.timerMinutes}
                onChange={(e) => setConfig({ ...config, timerMinutes: parseInt(e.target.value) || 30 })}
                className="w-full px-4 py-2.5 rounded-xl glass text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-300">Randomize Questions</p>
              <p className="text-xs text-slate-500">Shuffle question order per test</p>
            </div>
            <button
              onClick={() => setConfig({ ...config, randomizeQuestions: !config.randomizeQuestions })}
              className={`w-12 h-6 rounded-full transition-colors cursor-pointer ${config.randomizeQuestions ? "bg-indigo-500" : "bg-white/10"}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform mx-0.5 ${config.randomizeQuestions ? "translate-x-6" : ""}`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-300">Randomize Answers</p>
              <p className="text-xs text-slate-500">Shuffle answer options per question</p>
            </div>
            <button
              onClick={() => setConfig({ ...config, randomizeAnswers: !config.randomizeAnswers })}
              className={`w-12 h-6 rounded-full transition-colors cursor-pointer ${config.randomizeAnswers ? "bg-indigo-500" : "bg-white/10"}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform mx-0.5 ${config.randomizeAnswers ? "translate-x-6" : ""}`} />
            </button>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button onClick={handleSave} loading={saving}>
              <Save className="w-4 h-4" /> Save Settings
            </Button>
            {saved && <span className="text-sm text-emerald-400">Settings saved!</span>}
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
