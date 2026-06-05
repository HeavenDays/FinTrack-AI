"use client";

import { useState, useRef } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Upload, FileText, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

interface ImportPDFProps {
  onImportSuccess: () => void;
}

export default function ImportPDF({ onImportSuccess }: ImportPDFProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== "application/pdf") {
        setStatus({
          type: "error",
          message: "Format file harus berupa PDF.",
        });
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setStatus(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsLoading(true);
    setStatus(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/expenses/import-pdf", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Gagal memproses PDF.");
      }

      setStatus({
        type: "success",
        message: result.message || `Berhasil mengimpor transaksi.`,
      });
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      
      // Trigger table refresh
      onImportSuccess();
    } catch (error: any) {
      setStatus({
        type: "error",
        message: error.message || "Terjadi kesalahan koneksi saat mengimpor.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card>
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 rounded-lg" style={{ background: "var(--primary-glow)" }}>
          <FileText size={16} style={{ color: "var(--primary)" }} />
        </div>
        <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          Import via PDF (AI Extract)
        </h3>
      </div>
      
      <p className="text-xs mb-4 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
        Unggah file PDF mutasi bank, struk belanja, atau invoice. AI akan otomatis mendeteksi dan menginput transaksi pengeluaran Anda.
      </p>

      <div 
        onClick={!isLoading ? triggerFileInput : undefined}
        className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all mb-3 ${
          file ? 'border-primary bg-primary/5' : 'border-border hover:border-border-focus bg-transparent'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf"
          className="hidden"
          disabled={isLoading}
        />
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-2 py-2">
            <RefreshCw size={24} className="animate-spin" style={{ color: "var(--primary)" }} />
            <span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
              AI sedang menganalisis & mengekstrak PDF...
            </span>
          </div>
        ) : file ? (
          <div className="flex flex-col items-center justify-center gap-1 py-1">
            <FileText size={24} style={{ color: "var(--primary)" }} />
            <span className="text-xs font-semibold truncate max-w-[200px]" style={{ color: "var(--text-primary)" }}>
              {file.name}
            </span>
            <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
              {(file.size / 1024).toFixed(1)} KB
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-1.5">
            <Upload size={20} style={{ color: "var(--text-muted)" }} />
            <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
              Klik atau seret file PDF ke sini
            </span>
            <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
              Maksimal 5MB (Hanya PDF)
            </span>
          </div>
        )}
      </div>

      {status && (
        <div 
          className={`flex items-start gap-2 p-3 rounded-xl mb-3 text-xs leading-relaxed border`}
          style={{
            background: status.type === "success" ? "rgba(16, 185, 129, 0.08)" : "rgba(239, 68, 68, 0.08)",
            borderColor: status.type === "success" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
            color: status.type === "success" ? "var(--success)" : "var(--danger)"
          }}
        >
          {status.type === "success" ? (
            <CheckCircle2 size={14} className="flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
          )}
          <span>{status.message}</span>
        </div>
      )}

      {file && !isLoading && (
        <div className="flex gap-2">
          <Button 
            onClick={handleUpload} 
            className="w-full text-xs py-2" 
            size="sm"
          >
            Mulai Ekstraksi AI
          </Button>
          <Button 
            variant="secondary" 
            onClick={() => setFile(null)} 
            className="text-xs py-2"
            size="sm"
          >
            Batal
          </Button>
        </div>
      )}
    </Card>
  );
}
