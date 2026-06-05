import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { formatRupiah, formatTanggal } from "./utils";
import type { Expense, AIPredictionResponse, DashboardStats } from "@/types";

export function generatePDF(
  expenses: Expense[],
  stats: DashboardStats | undefined,
  prediction: AIPredictionResponse | undefined
): jsPDF {
  // Create document (portrait, points, a4)
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Helper: Header background banner (Obsidian Navy color)
  doc.setFillColor(9, 13, 22);
  doc.rect(0, 0, pageWidth, 45, "F");

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("FINTRACK AI REPORT", 14, 18);

  // Subtitle
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(156, 163, 175);
  doc.text("Laporan Ringkasan Pengeluaran & Analisis Prediksi Cerdas", 14, 25);

  // Metadata (Date generated)
  const todayStr = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  doc.setFontSize(9);
  doc.setTextColor(156, 163, 175);
  doc.text(`Tanggal Cetak: ${todayStr}`, 14, 32);

  // Line separator
  doc.setDrawColor(31, 41, 55);
  doc.setLineWidth(0.5);
  doc.line(14, 40, pageWidth - 14, 40);

  // --- SECTION 1: RINGKASAN FINANSIAL ---
  doc.setTextColor(17, 24, 39); // Dark grey/black for print text body
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("1. Ringkasan Finansial", 14, 55);

  // Stats boxes background / borders
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.2);
  
  // Box 1: Total Bulan Ini
  doc.setFillColor(249, 250, 251);
  doc.rect(14, 60, 58, 22, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.text("TOTAL BULAN INI", 18, 66);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(99, 102, 241); // Indigo Primary
  doc.text(stats ? formatRupiah(stats.monthTotal) : "Rp0", 18, 74);

  // Box 2: Total Hari Ini
  doc.setFillColor(249, 250, 251);
  doc.rect(76, 60, 58, 22, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.text("PENGELUARAN HARI INI", 80, 66);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(16, 185, 129); // Success green
  doc.text(stats ? formatRupiah(stats.todayTotal) : "Rp0", 80, 74);

  // Box 3: Rata-rata Harian
  doc.setFillColor(249, 250, 251);
  doc.rect(138, 60, 58, 22, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.text("RATA-RATA HARIAN", 142, 66);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(245, 158, 11); // Warning amber
  doc.text(stats ? formatRupiah(stats.avgDaily) : "Rp0", 142, 74);

  // --- SECTION 2: PREDIKSI & ANALISIS AI ---
  let yPos = 92;
  doc.setTextColor(17, 24, 39);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("2. Prediksi & Rekomendasi AI", 14, yPos);

  yPos += 6;
  if (prediction) {
    // Tomorrow prediction
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(31, 41, 55);
    doc.text("• Prediksi Harian Esok:", 14, yPos);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(99, 102, 241);
    doc.text(formatRupiah(prediction.prediksiHarianEsok.nominal), 58, yPos);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(75, 85, 99);
    doc.text(`(${prediction.prediksiHarianEsok.alasan})`, 14, yPos + 4.5);

    // Monthly prediction
    yPos += 11;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(31, 41, 55);
    doc.text("• Prediksi Bulanan Depan:", 14, yPos);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(16, 185, 129);
    doc.text(formatRupiah(prediction.prediksiBulananDepan.nominal), 62, yPos);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(75, 85, 99);
    doc.text(`(${prediction.prediksiBulananDepan.alasan})`, 14, yPos + 4.5);
    
    // Top category warning
    doc.setFont("helvetica", "bold");
    doc.text(`Kategori Terboros Terprediksi: ${prediction.prediksiBulananDepan.kategoriPrediksiTinggi}`, 14, yPos + 9);

    // Tips
    yPos += 16;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(31, 41, 55);
    doc.text("• Rekomendasi Tips Hemat AI:", 14, yPos);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(75, 85, 99);
    prediction.rekomendasiHemat.forEach((tip, idx) => {
      doc.text(`- ${tip}`, 18, yPos + 5 + (idx * 4.5));
    });

    yPos += 5 + (prediction.rekomendasiHemat.length * 4.5) + 3;

    // Anomalies if present
    if (prediction.anomaliPengeluaran) {
      doc.setFillColor(254, 243, 199); // Light yellow box for anomaly warning
      doc.rect(14, yPos, pageWidth - 28, 11, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(180, 83, 9);
      doc.text("Peringatan Anomali Pengeluaran:", 18, yPos + 4.5);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(prediction.anomaliPengeluaran, 18, yPos + 8.5);
      yPos += 16;
    } else {
      yPos += 4;
    }
  } else {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    doc.text("Prediksi AI belum dimuat atau tidak tersedia. Masukkan minimal 3 data pengeluaran.", 14, yPos);
    yPos += 10;
  }

  // --- SECTION 3: RINCIAN TRANSAKSI ---
  doc.setTextColor(17, 24, 39);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("3. Rincian Pengeluaran", 14, yPos);

  const tableData = expenses.map((e, index) => [
    index + 1,
    formatTanggal(e.createdAt.toString()),
    e.category,
    e.description || "—",
    formatRupiah(e.amount),
  ]);

  // Generate Table using autoTable plugin function
  autoTable(doc, {
    startY: yPos + 4,
    head: [["No", "Tanggal", "Kategori", "Deskripsi", "Jumlah"]],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: [17, 24, 37],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [75, 85, 99],
    },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 35 },
      2: { cellWidth: 45 },
      3: { cellWidth: 65 },
      4: { cellWidth: 35, halign: "right", fontStyle: "bold" },
    },
    margin: { left: 14, right: 14 },
    styles: {
      overflow: "linebreak",
    },
  });

  // Footer page numbers automatically handled by jsPDF or simple save
  const totalPages = doc.internal.pages.length;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text(
      `Halaman ${i} dari ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );
  }

  return doc;
}
