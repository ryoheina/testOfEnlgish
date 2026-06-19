"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatDate, formatPercentage } from "@/lib/utils";
import { Search, Trash2, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Result {
  id: string;
  score: number;
  total: number;
  percentage: number;
  passed: boolean;
  timeTaken: number | null;
  ipAddress: string | null;
  createdAt: string;
  student: {
    fullName: string;
    studentId: string | null;
  };
}

export default function AdminResultsPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchResults = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      search,
      sortBy,
      sortOrder,
      page: String(page),
      limit: "20",
    });
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);

    const res = await fetch(`/api/admin/results?${params}`);
    const data = await res.json();
    setResults(data.results || []);
    setTotalPages(data.pagination?.totalPages || 1);
    setLoading(false);
  }, [search, sortBy, sortOrder, dateFrom, dateTo, page]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const toggleSelectAll = () => {
    if (selected.size === results.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(results.map((r) => r.id)));
    }
  };

  const deleteSelected = async () => {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} result(s)?`)) return;

    await fetch("/api/admin/results", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: Array.from(selected) }),
    });
    setSelected(new Set());
    fetchResults();
  };

  const exportResults = (format: string) => {
    const params = new URLSearchParams({ format });
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    window.open(`/api/admin/export?${params}`, "_blank");
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Test Results</h1>
          <p className="text-slate-400 text-sm mt-1">View and manage student submissions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => exportResults("csv")}>
            <Download className="w-4 h-4" /> CSV
          </Button>
          <Button variant="secondary" size="sm" onClick={() => exportResults("xlsx")}>
            <Download className="w-4 h-4" /> Excel
          </Button>
        </div>
      </div>

      <GlassCard className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              placeholder="Search name or student ID..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 rounded-xl glass text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
          <Input type="date" label="From" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} />
          <Input type="date" label="To" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} />
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Sort By</label>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [by, order] = e.target.value.split("-");
                setSortBy(by);
                setSortOrder(order);
              }}
              className="w-full px-4 py-2.5 rounded-xl glass text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="percentage-desc">Highest Score</option>
              <option value="percentage-asc">Lowest Score</option>
              <option value="name-asc">Name A-Z</option>
            </select>
          </div>
        </div>
      </GlassCard>

      {selected.size > 0 && (
        <div className="mb-4 flex items-center gap-3">
          <span className="text-sm text-slate-400">{selected.size} selected</span>
          <Button variant="danger" size="sm" onClick={deleteSelected}>
            <Trash2 className="w-4 h-4" /> Delete Selected
          </Button>
        </div>
      )}

      <GlassCard className="overflow-hidden !p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="p-4 text-left">
                  <input
                    type="checkbox"
                    checked={selected.size === results.length && results.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded"
                  />
                </th>
                <th className="p-4 text-left text-slate-400 font-medium">Name</th>
                <th className="p-4 text-left text-slate-400 font-medium hidden lg:table-cell">Student ID</th>
                <th className="p-4 text-left text-slate-400 font-medium">Score</th>
                <th className="p-4 text-left text-slate-400 font-medium">Status</th>
                <th className="p-4 text-left text-slate-400 font-medium hidden sm:table-cell">Date</th>
                <th className="p-4 text-left text-slate-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">Loading...</td>
                </tr>
              ) : results.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">No results found</td>
                </tr>
              ) : (
                results.map((result, i) => (
                  <motion.tr
                    key={result.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-white/5 hover:bg-white/[0.02]"
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selected.has(result.id)}
                        onChange={() => toggleSelect(result.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="p-4 text-white font-medium">{result.student.fullName}</td>
                    <td className="p-4 text-slate-400 hidden lg:table-cell">{result.student.studentId || "—"}</td>
                    <td className="p-4 text-white">{result.score}/{result.total} ({formatPercentage(result.percentage)})</td>
                    <td className="p-4">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-medium",
                        result.passed ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                      )}>
                        {result.passed ? "Pass" : "Fail"}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 hidden sm:table-cell text-xs">{formatDate(result.createdAt)}</td>
                    <td className="p-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          if (!confirm("Delete this result?")) return;
                          await fetch("/api/admin/results", {
                            method: "DELETE",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ ids: [result.id] }),
                          });
                          fetchResults();
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </Button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 p-4 border-t border-white/5">
            <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-slate-400">Page {page} of {totalPages}</span>
            <Button variant="ghost" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
