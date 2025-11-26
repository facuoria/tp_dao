import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

const sanitizeFileName = text => {
  return (text || "reporte")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

export const downloadReportPdf = async ({ element, fileName, title, subtitle }) => {
  if (!element) return;

  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: "#ffffff",
    useCORS: true,
  });

  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 32;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  let cursorY = margin;
  const safeFileName = sanitizeFileName(fileName);

  pdf.setTextColor(33, 37, 41);
  pdf.setFontSize(16);
  pdf.text(title || "Reporte", margin, cursorY);
  cursorY += 18;

  if (subtitle) {
    pdf.setTextColor(108, 117, 125);
    pdf.setFontSize(11);
    const subtitleLines = pdf.splitTextToSize(subtitle, pageWidth - margin * 2);
    pdf.text(subtitleLines, margin, cursorY);
    cursorY += subtitleLines.length * 14;
  }

  cursorY += 8;

  const usableHeight = pageHeight - cursorY - margin;
  const imgWidth = pageWidth - margin * 2;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  const imgData = canvas.toDataURL("image/png", 1.0);

  pdf.addImage(imgData, "PNG", margin, cursorY, imgWidth, imgHeight);

  let heightLeft = imgHeight - usableHeight;
  let position = cursorY - imgHeight + usableHeight;

  while (heightLeft > 0) {
    pdf.addPage();
    position = margin - (imgHeight - heightLeft);
    pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
    heightLeft -= pageHeight - margin * 2;
  }

  pdf.save(`${safeFileName || "reporte"}.pdf`);
};
