import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const BRAND = {
  dark:   [15, 23, 42]   as [number, number, number],
  mid:    [30, 41, 59]   as [number, number, number],
  muted:  [100, 116, 139] as [number, number, number],
  light:  [226, 232, 240] as [number, number, number],
  accent: [14, 165, 233] as [number, number, number],
  green:  [34, 197, 94]  as [number, number, number],
  red:    [239, 68, 68]  as [number, number, number],
  orange: [249, 115, 22] as [number, number, number],
  yellow: [234, 179, 8]  as [number, number, number],
  alt:    [241, 245, 249] as [number, number, number],
};

function addHeader(doc: jsPDF, title: string, subtitle: string, orientation: "landscape" | "portrait" = "portrait") {
  const w = doc.internal.pageSize.width;
  doc.setFillColor(...BRAND.dark);
  doc.rect(0, 0, w, 22, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...BRAND.accent);
  doc.text("Q-SECURE", 12, 10);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...BRAND.muted);
  doc.text("QuantumSecure Platform  //  CONFIDENTIAL", 12, 16);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...BRAND.light);
  const titleX = orientation === "landscape" ? w / 2 : w / 2;
  doc.text(title, titleX, 11, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...BRAND.muted);
  doc.text(subtitle, titleX, 17, { align: "center" });

  doc.setDrawColor(...BRAND.accent);
  doc.setLineWidth(0.5);
  doc.line(0, 22, w, 22);

  return 30; // return starting Y position for content
}

function addFooter(doc: jsPDF) {
  const pageCount = (doc as any).internal.getNumberOfPages();
  const w = doc.internal.pageSize.width;
  const h = doc.internal.pageSize.height;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFillColor(...BRAND.dark);
    doc.rect(0, h - 10, w, 10, "F");
    doc.setFontSize(7);
    doc.setTextColor(...BRAND.muted);
    doc.text(`Page ${i} of ${pageCount}`, 12, h - 3.5);
    doc.text(`Generated: ${new Date().toLocaleString()}  |  QuantumSecure Platform — CONFIDENTIAL`, w / 2, h - 3.5, { align: "center" });
    doc.text("DO NOT DISTRIBUTE", w - 12, h - 3.5, { align: "right" });
  }
}

function severityColor(s: string): [number, number, number] {
  switch (s?.toLowerCase()) {
    case "critical": return BRAND.red;
    case "high":     return BRAND.orange;
    case "medium":   return BRAND.yellow;
    default:         return BRAND.green;
  }
}

// ── 1. Vendor Risk Assessment ────────────────────────────────────────────────

export function generateVendorRiskAssessment(vendors: any[]) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const startY = addHeader(doc,
    "Vendor Risk Assessment Report",
    `${vendors.length} vendors assessed  |  ${new Date().toLocaleDateString()}`,
    "landscape"
  );

  const active   = vendors.filter(v => v.status === "active").length;
  const review   = vendors.filter(v => v.status === "under-review").length;
  const avgTrust = vendors.length ? Math.round(vendors.reduce((s, v) => s + v.trustScore, 0) / vendors.length) : 0;
  const avgRisk  = vendors.length ? Math.round(vendors.reduce((s, v) => s + v.quantumRiskScore, 0) / vendors.length) : 0;

  const stats = [
    ["Total Vendors", vendors.length.toString()],
    ["Active",        active.toString()],
    ["Under Review",  review.toString()],
    ["Avg Trust Score", `${avgTrust} / 100`],
    ["Avg Quantum Risk", `${avgRisk} / 100`],
    ["Platinum Cert", vendors.filter(v => v.certificationLevel === "platinum").length.toString()],
  ];

  autoTable(doc, {
    body: stats,
    startY,
    theme: "plain",
    styles: { fontSize: 9, font: "helvetica", cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: "bold", textColor: BRAND.muted, cellWidth: 38 },
      1: { textColor: BRAND.accent, fontStyle: "bold", fontSize: 11 },
    },
    tableWidth: 100,
    margin: { left: 12 },
  });

  const rows = vendors.map(v => [
    v.name,
    v.category,
    v.headquarters,
    v.trustScore,
    v.quantumRiskScore,
    v.status.charAt(0).toUpperCase() + v.status.slice(1),
    v.certificationLevel.charAt(0).toUpperCase() + v.certificationLevel.slice(1),
    v.certValid === true ? "Valid" : v.certValid === false ? "Invalid" : "—",
  ]);

  autoTable(doc, {
    head: [["Vendor", "Category", "Headquarters", "Trust ↑", "Q-Risk ↓", "Status", "Cert Level", "TLS"]],
    body: rows,
    startY: (doc as any).lastAutoTable.finalY + 8,
    styles: { fontSize: 8, cellPadding: 3, font: "helvetica" },
    headStyles: { fillColor: BRAND.dark, textColor: BRAND.light, fontStyle: "bold", fontSize: 8 },
    alternateRowStyles: { fillColor: BRAND.alt },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 42 },
      3: { halign: "center" },
      4: { halign: "center" },
      5: { halign: "center" },
      6: { halign: "center" },
      7: { halign: "center" },
    },
    didParseCell(data) {
      if (data.section === "body" && data.column.index === 3) {
        const v = Number(data.cell.raw);
        data.cell.styles.textColor = v >= 80 ? BRAND.green : v >= 60 ? BRAND.yellow : BRAND.red;
        data.cell.styles.fontStyle = "bold";
      }
      if (data.section === "body" && data.column.index === 4) {
        const v = Number(data.cell.raw);
        data.cell.styles.textColor = v <= 20 ? BRAND.green : v <= 50 ? BRAND.yellow : BRAND.red;
        data.cell.styles.fontStyle = "bold";
      }
      if (data.section === "body" && data.column.index === 5) {
        if (String(data.cell.raw).toLowerCase().includes("review"))
          data.cell.styles.textColor = BRAND.orange;
      }
    },
    margin: { left: 12, right: 12 },
  });

  addFooter(doc);
  doc.save("vendor-risk-assessment.pdf");
}

// ── 2. Threat Intelligence Report ───────────────────────────────────────────

export function generateThreatIntelligenceReport(threats: any[]) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const startY = addHeader(doc,
    "Threat Intelligence Report",
    `${threats.length} threats analysed  |  ${new Date().toLocaleDateString()}`,
    "portrait"
  );

  const bySev = (s: string) => threats.filter(t => t.severity === s).length;
  const open  = threats.filter(t => t.status === "open" || t.status === "investigating").length;

  autoTable(doc, {
    body: [
      ["Critical", bySev("critical").toString()],
      ["High",     bySev("high").toString()],
      ["Medium",   bySev("medium").toString()],
      ["Low",      bySev("low").toString()],
      ["Open / Investigating", open.toString()],
      ["Resolved", threats.filter(t => t.status === "resolved").length.toString()],
    ],
    startY,
    theme: "plain",
    styles: { fontSize: 9, font: "helvetica", cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: "bold", textColor: BRAND.muted, cellWidth: 55 },
      1: { fontStyle: "bold", fontSize: 12, textColor: BRAND.accent },
    },
    tableWidth: 90,
    margin: { left: 12 },
  });

  const rows = [...threats]
    .sort((a, b) => {
      const order: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
      return (order[a.severity] ?? 9) - (order[b.severity] ?? 9);
    })
    .map(t => [
      t.title,
      t.severity.toUpperCase(),
      t.category,
      t.status.charAt(0).toUpperCase() + t.status.slice(1),
      t.description,
    ]);

  autoTable(doc, {
    head: [["Title", "Severity", "Category", "Status", "Description"]],
    body: rows,
    startY: (doc as any).lastAutoTable.finalY + 8,
    styles: { fontSize: 8, cellPadding: 3, font: "helvetica", overflow: "linebreak" },
    headStyles: { fillColor: BRAND.dark, textColor: BRAND.light, fontStyle: "bold" },
    alternateRowStyles: { fillColor: BRAND.alt },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 48 },
      1: { halign: "center", cellWidth: 22 },
      2: { cellWidth: 28 },
      3: { halign: "center", cellWidth: 26 },
      4: { cellWidth: 60 },
    },
    didParseCell(data) {
      if (data.section === "body" && data.column.index === 1) {
        data.cell.styles.textColor = severityColor(String(data.cell.raw));
        data.cell.styles.fontStyle = "bold";
      }
    },
    margin: { left: 12, right: 12 },
  });

  addFooter(doc);
  doc.save("threat-intelligence-report.pdf");
}

// ── 3. Executive Security Brief ──────────────────────────────────────────────

export function generateExecutiveBrief(summary: any, vendors: any[], threats: any[]) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const startY = addHeader(doc,
    "Executive Security Brief",
    `Prepared for leadership  |  ${new Date().toLocaleDateString()}`,
    "portrait"
  );
  const w = doc.internal.pageSize.width;

  // KPI tiles row
  const kpis = [
    { label: "Total Vendors",    value: summary.totalVendors ?? 0,    note: `${summary.activeVendors ?? 0} active` },
    { label: "Avg Trust Score",  value: `${summary.avgTrustScore ?? 0}%`, note: "vendor posture" },
    { label: "Open Threats",     value: summary.openThreats ?? 0,     note: `${summary.criticalThreats ?? 0} critical` },
    { label: "Quantum Risk",     value: `${summary.avgQuantumRisk ?? 0}%`, note: "avg across fleet" },
  ];
  const tileW = (w - 24) / kpis.length;
  kpis.forEach((k, i) => {
    const x = 12 + i * tileW;
    doc.setFillColor(...BRAND.mid);
    doc.roundedRect(x, startY, tileW - 3, 22, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...BRAND.accent);
    doc.text(String(k.value), x + (tileW - 3) / 2, startY + 10, { align: "center" });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...BRAND.light);
    doc.text(k.label.toUpperCase(), x + (tileW - 3) / 2, startY + 16, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...BRAND.muted);
    doc.text(k.note, x + (tileW - 3) / 2, startY + 20, { align: "center" });
  });

  let y = startY + 28;

  // Section: Top vendors
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.accent);
  doc.text("TOP-PERFORMING VENDORS", 12, y);
  y += 3;
  doc.setDrawColor(...BRAND.mid);
  doc.setLineWidth(0.3);
  doc.line(12, y, w - 12, y);
  y += 4;

  const topVendors = [...vendors].sort((a, b) => b.trustScore - a.trustScore).slice(0, 8);
  autoTable(doc, {
    head: [["Vendor", "Category", "Trust", "Q-Risk", "Cert Level"]],
    body: topVendors.map(v => [v.name, v.category, v.trustScore, v.quantumRiskScore, v.certificationLevel]),
    startY: y,
    styles: { fontSize: 8, cellPadding: 2.5, font: "helvetica" },
    headStyles: { fillColor: BRAND.dark, textColor: BRAND.light, fontStyle: "bold", fontSize: 8 },
    alternateRowStyles: { fillColor: BRAND.alt },
    columnStyles: {
      0: { fontStyle: "bold" },
      2: { halign: "center" },
      3: { halign: "center" },
      4: { halign: "center" },
    },
    didParseCell(data) {
      if (data.section === "body" && data.column.index === 2) {
        const v = Number(data.cell.raw);
        data.cell.styles.textColor = v >= 80 ? BRAND.green : v >= 60 ? BRAND.yellow : BRAND.red;
        data.cell.styles.fontStyle = "bold";
      }
    },
    margin: { left: 12, right: 12 },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  // Section: Critical threats
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.accent);
  doc.text("CRITICAL & HIGH-SEVERITY THREATS", 12, y);
  y += 3;
  doc.line(12, y, w - 12, y);
  y += 4;

  const highThreats = threats.filter(t => t.severity === "critical" || t.severity === "high").slice(0, 6);
  if (highThreats.length > 0) {
    autoTable(doc, {
      head: [["Title", "Severity", "Category", "Status"]],
      body: highThreats.map(t => [t.title, t.severity.toUpperCase(), t.category, t.status]),
      startY: y,
      styles: { fontSize: 8, cellPadding: 2.5, font: "helvetica" },
      headStyles: { fillColor: BRAND.dark, textColor: BRAND.light, fontStyle: "bold", fontSize: 8 },
      alternateRowStyles: { fillColor: BRAND.alt },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 70 },
        1: { halign: "center", cellWidth: 25 },
        2: { cellWidth: 35 },
        3: { halign: "center" },
      },
      didParseCell(data) {
        if (data.section === "body" && data.column.index === 1) {
          data.cell.styles.textColor = severityColor(String(data.cell.raw));
          data.cell.styles.fontStyle = "bold";
        }
      },
      margin: { left: 12, right: 12 },
    });
  } else {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...BRAND.green);
    doc.text("✓  No critical or high-severity threats currently active.", 12, y + 6);
  }

  addFooter(doc);
  doc.save("executive-security-brief.pdf");
}

// ── 4. PKI / Certificate Audit ───────────────────────────────────────────────

export function generatePKIAuditReport(vendors: any[]) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const startY = addHeader(doc,
    "PKI & Certificate Audit Report",
    `Network-facing TLS / CA / Key-Algorithm assessment  |  ${new Date().toLocaleDateString()}`,
    "landscape"
  );

  const valid   = vendors.filter(v => v.certValid === true).length;
  const invalid = vendors.filter(v => v.certValid === false).length;
  const noScan  = vendors.filter(v => v.certValid === null).length;
  const expiring = vendors.filter(v => {
    if (!v.certExpiresAt) return false;
    const d = new Date(v.certExpiresAt);
    const soon = new Date();
    soon.setDate(soon.getDate() + 30);
    return d > new Date() && d <= soon;
  }).length;

  autoTable(doc, {
    body: [
      ["Valid TLS", valid.toString()],
      ["Invalid / Failed", invalid.toString()],
      ["Not Yet Scanned", noScan.toString()],
      ["Expiring ≤30 days", expiring.toString()],
    ],
    startY,
    theme: "plain",
    styles: { fontSize: 9, font: "helvetica", cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: "bold", textColor: BRAND.muted, cellWidth: 42 },
      1: { fontStyle: "bold", fontSize: 12, textColor: BRAND.accent },
    },
    tableWidth: 80,
    margin: { left: 12 },
  });

  const rows = vendors.map(v => [
    v.name,
    v.category,
    v.website,
    v.certValid === true ? "✓ VALID" : v.certValid === false ? "✗ INVALID" : "NOT SCANNED",
    v.certExpiresAt ? new Date(v.certExpiresAt).toLocaleDateString() : "—",
    v.lastCertScan ? new Date(v.lastCertScan).toLocaleDateString() : "Never",
    v.certificationLevel.charAt(0).toUpperCase() + v.certificationLevel.slice(1),
    v.quantumRiskScore,
  ]);

  autoTable(doc, {
    head: [["Vendor", "Category", "Domain", "TLS Status", "Expires", "Last Scan", "Cert Level", "Q-Risk"]],
    body: rows,
    startY: (doc as any).lastAutoTable.finalY + 8,
    styles: { fontSize: 8, cellPadding: 3, font: "helvetica" },
    headStyles: { fillColor: BRAND.dark, textColor: BRAND.light, fontStyle: "bold", fontSize: 8 },
    alternateRowStyles: { fillColor: BRAND.alt },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 38 },
      2: { cellWidth: 44 },
      3: { halign: "center", cellWidth: 26 },
      4: { halign: "center" },
      5: { halign: "center" },
      6: { halign: "center" },
      7: { halign: "center" },
    },
    didParseCell(data) {
      if (data.section === "body" && data.column.index === 3) {
        const v = String(data.cell.raw);
        data.cell.styles.textColor = v.includes("VALID") && !v.includes("IN") ? BRAND.green : v.includes("INVALID") ? BRAND.red : BRAND.muted;
        data.cell.styles.fontStyle = "bold";
      }
      if (data.section === "body" && data.column.index === 7) {
        const v = Number(data.cell.raw);
        data.cell.styles.textColor = v <= 20 ? BRAND.green : v <= 50 ? BRAND.yellow : BRAND.red;
        data.cell.styles.fontStyle = "bold";
      }
    },
    margin: { left: 12, right: 12 },
  });

  addFooter(doc);
  doc.save("pki-certificate-audit.pdf");
}

// ── 5. Compliance Status Report ──────────────────────────────────────────────

export function generateComplianceStatusReport(vendors: any[], threats: any[]) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const startY = addHeader(doc,
    "Compliance Status Report",
    `Certification levels & control gaps  |  ${new Date().toLocaleDateString()}`,
    "portrait"
  );
  const w = doc.internal.pageSize.width;

  const levels = ["platinum", "gold", "silver", "bronze", "none"];
  const certBreakdown = levels.map(l => ({
    level: l.charAt(0).toUpperCase() + l.slice(1),
    count: vendors.filter(v => v.certificationLevel === l).length,
    avgTrust: vendors.filter(v => v.certificationLevel === l).length > 0
      ? Math.round(vendors.filter(v => v.certificationLevel === l).reduce((s, v) => s + v.trustScore, 0) / vendors.filter(v => v.certificationLevel === l).length)
      : 0,
  }));

  autoTable(doc, {
    head: [["Certification Level", "Vendor Count", "Avg Trust Score"]],
    body: certBreakdown.map(c => [c.level, c.count, `${c.avgTrust} / 100`]),
    startY,
    styles: { fontSize: 9, cellPadding: 3, font: "helvetica" },
    headStyles: { fillColor: BRAND.dark, textColor: BRAND.light, fontStyle: "bold" },
    alternateRowStyles: { fillColor: BRAND.alt },
    columnStyles: {
      0: { fontStyle: "bold" },
      1: { halign: "center" },
      2: { halign: "center" },
    },
    margin: { left: 12, right: 12 },
  });

  let y = (doc as any).lastAutoTable.finalY + 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.accent);
  doc.text("COMPLIANCE THREAT CATEGORIES", 12, y);
  y += 3;
  doc.setDrawColor(...BRAND.mid);
  doc.setLineWidth(0.3);
  doc.line(12, y, w - 12, y);
  y += 4;

  const complianceThreats = threats.filter(t => t.category === "Compliance" || t.category === "compliance");
  if (complianceThreats.length > 0) {
    autoTable(doc, {
      head: [["Title", "Severity", "Status", "Description"]],
      body: complianceThreats.map(t => [t.title, t.severity.toUpperCase(), t.status, t.description]),
      startY: y,
      styles: { fontSize: 8, cellPadding: 2.5, font: "helvetica", overflow: "linebreak" },
      headStyles: { fillColor: BRAND.dark, textColor: BRAND.light, fontStyle: "bold" },
      alternateRowStyles: { fillColor: BRAND.alt },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 50 },
        1: { halign: "center", cellWidth: 22 },
        2: { halign: "center", cellWidth: 26 },
        3: { cellWidth: 80 },
      },
      didParseCell(data) {
        if (data.section === "body" && data.column.index === 1) {
          data.cell.styles.textColor = severityColor(String(data.cell.raw));
          data.cell.styles.fontStyle = "bold";
        }
      },
      margin: { left: 12, right: 12 },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  } else {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...BRAND.green);
    doc.text("✓  No active compliance threats.", 12, y + 6);
    y += 16;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.accent);
  doc.text("VENDORS REQUIRING IMMEDIATE REVIEW", 12, y);
  y += 3;
  doc.line(12, y, w - 12, y);
  y += 4;

  const atRisk = vendors.filter(v => v.status === "under-review" || v.certificationLevel === "none" || v.trustScore < 65);
  if (atRisk.length > 0) {
    autoTable(doc, {
      head: [["Vendor", "Trust Score", "Cert Level", "Status", "Issue"]],
      body: atRisk.map(v => [
        v.name,
        v.trustScore,
        v.certificationLevel,
        v.status,
        v.status === "under-review" ? "Under Review" : v.certificationLevel === "none" ? "No Certification" : "Low Trust Score",
      ]),
      startY: y,
      styles: { fontSize: 8, cellPadding: 2.5, font: "helvetica" },
      headStyles: { fillColor: BRAND.dark, textColor: BRAND.light, fontStyle: "bold" },
      alternateRowStyles: { fillColor: BRAND.alt },
      columnStyles: {
        0: { fontStyle: "bold" },
        1: { halign: "center" },
        2: { halign: "center" },
        3: { halign: "center" },
      },
      didParseCell(data) {
        if (data.section === "body" && data.column.index === 1) {
          const v = Number(data.cell.raw);
          data.cell.styles.textColor = v >= 80 ? BRAND.green : v >= 65 ? BRAND.yellow : BRAND.red;
          data.cell.styles.fontStyle = "bold";
        }
      },
      margin: { left: 12, right: 12 },
    });
  }

  addFooter(doc);
  doc.save("compliance-status-report.pdf");
}

// ── 6. Security Posture Summary ──────────────────────────────────────────────

export function generateSecurityPostureSummary(summary: any, vendors: any[], threats: any[]) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const startY = addHeader(doc,
    "Security Posture Summary",
    `Platform-wide health snapshot  |  ${new Date().toLocaleDateString()}`,
    "portrait"
  );
  const w = doc.internal.pageSize.width;

  // Narrative intro
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...BRAND.muted);
  const intro = `This report provides a comprehensive health snapshot of the QuantumSecure platform as of ${new Date().toLocaleDateString()}. ` +
    `It covers ${summary.totalVendors ?? 0} monitored vendors, ${threats.length} recorded threat events, ` +
    `and overall platform quantum-risk posture.`;
  const lines = doc.splitTextToSize(intro, w - 24);
  doc.text(lines, 12, startY);
  let y = startY + lines.length * 5 + 4;

  // Full metrics table
  autoTable(doc, {
    head: [["Metric", "Value", "Status"]],
    body: [
      ["Total Vendors",       summary.totalVendors ?? 0,    "—"],
      ["Active Vendors",      summary.activeVendors ?? 0,   summary.activeVendors === summary.totalVendors ? "✓ All active" : "⚠ Some inactive"],
      ["Under Review",        summary.underReview ?? 0,     summary.underReview > 0 ? "⚠ Action needed" : "✓ Clear"],
      ["Avg Trust Score",     `${summary.avgTrustScore ?? 0} / 100`, summary.avgTrustScore >= 75 ? "✓ Good" : "⚠ Below target"],
      ["Avg Quantum Risk",    `${summary.avgQuantumRisk ?? 0} / 100`, summary.avgQuantumRisk <= 30 ? "✓ Low" : summary.avgQuantumRisk <= 60 ? "⚠ Moderate" : "✗ High"],
      ["Open Threats",        summary.openThreats ?? 0,     summary.openThreats === 0 ? "✓ Clear" : "⚠ Needs attention"],
      ["Critical Threats",    summary.criticalThreats ?? 0, summary.criticalThreats === 0 ? "✓ None" : "✗ Immediate action"],
      ["Cert Expiring Soon",  summary.certExpiringSoon ?? 0, summary.certExpiringSoon === 0 ? "✓ None" : "⚠ Renew soon"],
      ["Total Documents",     summary.totalDocuments ?? 0,  "—"],
    ],
    startY: y,
    styles: { fontSize: 9, cellPadding: 3, font: "helvetica" },
    headStyles: { fillColor: BRAND.dark, textColor: BRAND.light, fontStyle: "bold" },
    alternateRowStyles: { fillColor: BRAND.alt },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 55 },
      1: { halign: "center", cellWidth: 35 },
      2: { cellWidth: 80 },
    },
    didParseCell(data) {
      if (data.section === "body" && data.column.index === 2) {
        const v = String(data.cell.raw);
        if (v.startsWith("✓")) data.cell.styles.textColor = BRAND.green;
        if (v.startsWith("⚠")) data.cell.styles.textColor = BRAND.yellow;
        if (v.startsWith("✗")) data.cell.styles.textColor = BRAND.red;
      }
    },
    margin: { left: 12, right: 12 },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.accent);
  doc.text("CATEGORY BREAKDOWN", 12, y);
  y += 3;
  doc.setDrawColor(...BRAND.mid);
  doc.setLineWidth(0.3);
  doc.line(12, y, w - 12, y);
  y += 4;

  const categories = [...new Set(vendors.map(v => v.category))].sort();
  const catRows = categories.map(cat => {
    const vs = vendors.filter(v => v.category === cat);
    const avgT = Math.round(vs.reduce((s, v) => s + v.trustScore, 0) / vs.length);
    const avgR = Math.round(vs.reduce((s, v) => s + v.quantumRiskScore, 0) / vs.length);
    return [cat, vs.length, avgT, avgR];
  });

  autoTable(doc, {
    head: [["Category", "Vendors", "Avg Trust", "Avg Q-Risk"]],
    body: catRows,
    startY: y,
    styles: { fontSize: 8.5, cellPadding: 3, font: "helvetica" },
    headStyles: { fillColor: BRAND.dark, textColor: BRAND.light, fontStyle: "bold" },
    alternateRowStyles: { fillColor: BRAND.alt },
    columnStyles: {
      0: { fontStyle: "bold" },
      1: { halign: "center" },
      2: { halign: "center" },
      3: { halign: "center" },
    },
    didParseCell(data) {
      if (data.section === "body" && data.column.index === 2) {
        const v = Number(data.cell.raw);
        data.cell.styles.textColor = v >= 80 ? BRAND.green : v >= 65 ? BRAND.yellow : BRAND.red;
        data.cell.styles.fontStyle = "bold";
      }
      if (data.section === "body" && data.column.index === 3) {
        const v = Number(data.cell.raw);
        data.cell.styles.textColor = v <= 20 ? BRAND.green : v <= 50 ? BRAND.yellow : BRAND.red;
        data.cell.styles.fontStyle = "bold";
      }
    },
    margin: { left: 12, right: 12 },
  });

  addFooter(doc);
  doc.save("security-posture-summary.pdf");
}
