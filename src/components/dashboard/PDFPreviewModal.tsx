"use client";

import { X, Download, Eye } from "lucide-react";
import Button from "@/components/ui/Button";

interface PDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfBlobUrl: string | null;
  onDownload: () => void;
}

export default function PDFPreviewModal({
  isOpen,
  onClose,
  pdfBlobUrl,
  onDownload,
}: PDFPreviewModalProps) {
  if (!isOpen || !pdfBlobUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-4xl h-[85vh] flex flex-col rounded-2xl border border-border shadow-2xl overflow-hidden glass-card"
        style={{ 
          background: "rgba(17, 24, 39, 0.95)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
        }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-surface/50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary-glow">
              <Eye size={16} className="text-primary" style={{ color: "var(--primary)" }} />
            </div>
            <div>
              <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
                Pratinjau Laporan Keuangan
              </h3>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                Silakan periksa laporan dan hasil analisis AI sebelum diunduh
              </p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface-hover text-text-secondary hover:text-text-primary transition-all"
            style={{ color: "var(--text-secondary)" }}
            aria-label="Tutup"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body (PDF Viewer) */}
        <div className="flex-1 p-5 bg-[#090d16]/30">
          <iframe 
            src={pdfBlobUrl} 
            className="w-full h-full border-none rounded-xl bg-white"
            title="Pratinjau PDF"
          />
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-border bg-surface/50">
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={onClose}
            style={{ minWidth: "100px" }}
          >
            Batal
          </Button>
          <Button 
            size="sm" 
            onClick={onDownload}
            className="flex items-center gap-2"
            style={{ minWidth: "140px" }}
          >
            <Download size={14} />
            Unduh Laporan PDF
          </Button>
        </div>
      </div>
    </div>
  );
}
