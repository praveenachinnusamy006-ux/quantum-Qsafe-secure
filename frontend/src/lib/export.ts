import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface VendorExportRow {
  id: number;
  name: string;
  category: string;
  headquarters: string;
  website: string;
  trustScore: number;
  quantumRiskScore: number;
  status: string;
  certificationLevel: string;
  certValid: boolean | null;
  description: string;
  createdAt: string;
}

export function exportVendorsAsJSON(vendors: VendorExportRow[], filename = "vendors-export") {
  const json = JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      source: "QuantumSecure Platform",
      totalVendors: vendors.length,
      vendors,
    },
    null,
    2
  );
  const blob = new Blob([json], { type: "application/json" });
  triggerDownload(blob, `${filename}.json`);
}

export function exportVendorsAsPDF(vendors: VendorExportRow[], filename = "vendors-export") {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(30, 41, 59);
  doc.text("QuantumSecure — Vendor Directory Report", 14, 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated: ${new Date().toLocaleString()}  |  Total Vendors: ${vendors.length}`, 14, 25);

  const rows = vendors.map((v) => [
    v.name,
    v.category,
    v.headquarters,
    v.trustScore.toString(),
    v.quantumRiskScore.toString(),
    v.status.charAt(0).toUpperCase() + v.status.slice(1),
    v.certificationLevel.charAt(0).toUpperCase() + v.certificationLevel.slice(1),
    v.certValid === true ? "Valid" : v.certValid === false ? "Invalid" : "—",
    v.website,
  ]);

  autoTable(doc, {
    head: [["Vendor", "Category", "HQ", "Trust", "Q-Risk", "Status", "Cert Level", "TLS", "Website"]],
    body: rows,
    startY: 30,
    styles: { fontSize: 8, cellPadding: 3, font: "helvetica" },
    headStyles: { fillColor: [15, 23, 42], textColor: [226, 232, 240], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [241, 245, 249] },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 38 },
      3: { halign: "center" },
      4: { halign: "center" },
      5: { halign: "center" },
      6: { halign: "center" },
      7: { halign: "center" },
      8: { cellWidth: 46 },
    },
  });

  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Page ${i} of ${pageCount}  |  QuantumSecure Platform — Confidential`,
      14,
      doc.internal.pageSize.height - 6
    );
  }

  doc.save(`${filename}.pdf`);
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
