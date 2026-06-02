export function downloadThreatReport(threats: any[]) {
  const lines = ["QuantumSecure — Threat Report", `Generated: ${new Date().toISOString()}`, ""];
  threats.forEach(t => {
    lines.push(`[${t.severity.toUpperCase()}] ${t.title}`);
    lines.push(`Category: ${t.category} | Status: ${t.status}`);
    lines.push(`Detected: ${t.detectedAt}`);
    lines.push(t.description);
    lines.push("");
  });
  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = "threat-report.txt"; a.click();
  URL.revokeObjectURL(url);
}

export function downloadSecurityAnalysis(summary: any) {
  const content = `QuantumSecure — Security Analysis\nGenerated: ${new Date().toISOString()}\n\n${JSON.stringify(summary, null, 2)}`;
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = "security-analysis.txt"; a.click();
  URL.revokeObjectURL(url);
}
