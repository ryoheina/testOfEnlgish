"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  BookOpen,
  Clock,
  Shield,
  BarChart3,
  Award,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Comprehensive Assessment",
    description:
      "Multiple-choice questions covering grammar, vocabulary, reading comprehension, and more.",
  },
  {
    icon: Clock,
    title: "Timed Evaluation",
    description:
      "Optional timer ensures fair and standardized testing conditions for all participants.",
  },
  {
    icon: Shield,
    title: "Secure Platform",
    description:
      "Enterprise-grade security with encrypted data storage and protected admin access.",
  },
  {
    icon: BarChart3,
    title: "Instant Results",
    description:
      "Automatic score calculation with detailed pass/fail status upon completion.",
  },
  {
    icon: Award,
    title: "Certificate Ready",
    description:
      "Receive your results and downloadable materials immediately after submission.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen gradient-bg">
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-white">English Test</span>
          </div>
          <Link href="/admin/login">
            <Button variant="ghost" size="sm">
              Admin
            </Button>
          </Link>
        </div>
      </nav>

      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-float" />
          <div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl animate-float"
            style={{ animationDelay: "3s" }}
          />
        </div>

        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full glass text-sm text-indigo-300 mb-6">
              Professional English Assessment
            </span>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
              Test Your{" "}
              <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent neon-text">
                English
              </span>{" "}
              Proficiency
            </h1>
            <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              A comprehensive, professionally designed English proficiency test.
              Evaluate your language skills with our modern assessment platform.
            </p>
            <Link href="/test">
              <Button size="lg" className="animate-pulse-glow">
                Start English Test
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Why Choose Our Platform
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Built for educational institutions and organizations requiring reliable
              English proficiency assessments.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <GlassCard key={feature.title} hover delay={index * 0.1}>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <GlassCard className="text-center neon-glow">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Ready to Begin?
            </h2>
            <p className="text-slate-400 mb-8">
              Complete the assessment at your own pace. Your results will be
              calculated automatically upon submission.
            </p>
            <Link href="/test">
              <Button size="lg">
                Start English Test
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </GlassCard>
        </div>
      </section>

      <footer className="py-8 px-4 border-t border-white/5">
        <div className="max-w-7xl mx-auto text-center text-sm text-slate-500">
          English Test Platform &mdash; Professional Language Assessment
        </div>
      </footer>
    </div>
  );
}
