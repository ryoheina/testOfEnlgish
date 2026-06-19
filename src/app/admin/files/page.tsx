"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Upload, Trash2, FileText, ToggleLeft, ToggleRight } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface DownloadFile {
  id: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
  description: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function AdminFilesPage() {
  const [files, setFiles] = useState<DownloadFile[]>([]);
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = async () => {
    const res = await fetch("/api/admin/files");
    const data = await res.json();
    setFiles(data.files || []);
  };

  useEffect(() => { fetchFiles(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("description", description);

    const res = await fetch("/api/admin/files", { method: "POST", body: formData });
    if (res.ok) {
      setDescription("");
      fetchFiles();
    } else {
      const data = await res.json();
      alert(data.error || "Upload failed");
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const toggleActive = async (file: DownloadFile) => {
    await fetch(`/api/admin/files/${file.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !file.isActive, description: file.description }),
    });
    fetchFiles();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this file?")) return;
    await fetch(`/api/admin/files/${id}`, { method: "DELETE" });
    fetchFiles();
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Downloadable Files</h1>
        <p className="text-slate-400 text-sm mt-1">
          Configure files automatically downloaded after test submission
        </p>
      </div>

      <GlassCard className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Upload New File</h3>
        <div className="space-y-4">
          <Input
            label="Description (optional)"
            placeholder="e.g., Certificate of Completion"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleUpload} />
          <Button onClick={() => fileInputRef.current?.click()} loading={uploading}>
            <Upload className="w-4 h-4" /> Select File to Upload
          </Button>
          <p className="text-xs text-slate-500">
            The most recent active file will be downloaded by students after test submission.
          </p>
        </div>
      </GlassCard>

      <div className="space-y-3">
        {files.length === 0 ? (
          <GlassCard><p className="text-center text-slate-400 py-8">No files uploaded yet.</p></GlassCard>
        ) : (
          files.map((file, i) => (
            <motion.div key={file.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
              <GlassCard>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-medium truncate">{file.fileName}</p>
                      <p className="text-xs text-slate-400">
                        {formatSize(file.fileSize)} &middot; {formatDate(file.createdAt)}
                        {file.description && ` &middot; ${file.description}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => toggleActive(file)} className="cursor-pointer">
                      {file.isActive ? (
                        <ToggleRight className="w-8 h-8 text-emerald-400" />
                      ) : (
                        <ToggleLeft className="w-8 h-8 text-slate-500" />
                      )}
                    </button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(file.id)}>
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
