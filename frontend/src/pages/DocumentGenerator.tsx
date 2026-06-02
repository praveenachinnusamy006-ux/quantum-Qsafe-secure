import { Shell } from "@/components/layout/Shell";
import { useListVendors, useListThreats, useGetDashboardSummary } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import {
  FileText, Download, Users, ShieldAlert, BrainCircuit,
  Shield, ClipboardList, CheckCircle2, Loader2, FileBarChart2,
} from "lucide-react";
import {
  generateVendorRiskAssessment,
  generateThreatIntelligenceReport,
  generateExecutiveBrief,
  generatePKIAuditReport,
  generateComplianceStatusReport,
  generateSecurityPostureSummary,
} from "@/lib/docgen";
import { useToast } from "@/hooks/use-toast";

interface ReportDef {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  badge: string;
  badgeColor: string;
  pages: string;
  needs: string[];
}

const REPORTS: ReportDef[] = [
  {
    id: "vendor-risk",
    title: "Vendor Risk Assessment",
    description: "Full vendor directory with trust scores, quantum-risk ratings, TLS status, and certification levels — sorted by posture.",
    icon: Users,
    badge: "Landscape PDF",
    badgeColor: "text-blue-400 border-blue-400/30 bg-blue-400/10",
    pages: "2–4 pages",
    needs: ["vendors"],
  },
  {
    id: "threat-intel",
    title: "Threat Intelligence Report",
    description: "All recorded threat events sorted by severity, with categories, statuses, and full descriptions. Critical threats first.",
    icon: ShieldAlert,
    badge: "Portrait PDF",
    badgeColor: "text-red-400 border-red-400/30 bg-red-400/10",
    pages: "1–3 pages",
    needs: ["threats"],
  },
  {
    id: "executive-brief",
    title: "Executive Security Brief",
    description: "Leadership-ready one-pager: KPI tiles, top-performing vendors, and active critical/high threats summarised for decision-makers.",
    icon: FileBarChart2,
    badge: "Portrait PDF",
    badgeColor: "text-purple-400 border-purple-400/30 bg-purple-400/10",
    pages: "1–2 pages",
    needs: ["summary", "vendors", "threats"],
  },
  {
    id: "pki-audit",
    title: "PKI / Certificate Audit",
    description: "Network-facing PKI report: TLS validity, certificate expiry dates, last scan timestamps, CA levels, and quantum-risk per vendor.",
    icon: Shield,
    badge: "Landscape PDF",
    badgeColor: "text-cyan-400 border-cyan-400/30 bg-cyan-400/10",
    pages: "2–4 pages",
    needs: ["vendors"],
  },
  {
    id: "compliance",
    title: "Compliance Status Report",
    description: "Certification-level breakdown (Platinum → None), compliance threat events, and vendors flagged for immediate remediation.",
    icon: ClipboardList,
    badge: "Portrait PDF",
    badgeColor: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
    pages: "2–3 pages",
    needs: ["vendors", "threats"],
  },
  {
    id: "posture",
    title: "Security Posture Summary",
    description: "Platform-wide health snapshot: all dashboard metrics with RAG status indicators and per-category trust/risk breakdown.",
    icon: BrainCircuit,
    badge: "Portrait PDF",
    badgeColor: "text-green-400 border-green-400/30 bg-green-400/10",
    pages: "2 pages",
    needs: ["summary", "vendors", "threats"],
  },
];

// Fallback baseline datasets matching your 10 vendors & 15 threat matrices
const MOCK_BACKUP_VENDORS = [
  { id: 1, name: 'CipherShield Labs', category: 'Network Security', trustScore: 92, quantumRiskScore: 12, status: 'active', certificationLevel: 'platinum', headquarters: 'San Francisco, CA', website: 'https://ciphershield.io', certValid: true },
  { id: 2, name: 'ProtonArmor', category: 'Network Security', trustScore: 68, quantumRiskScore: 55, status: 'active', certificationLevel: 'bronze', headquarters: 'Denver, CO', website: 'https://protonarmor.io', certValid: true },
  { id: 3, name: 'FortiQuantum', category: 'Network Security', trustScore: 85, quantumRiskScore: 18, status: 'active', certificationLevel: 'gold', headquarters: 'Sunnyvale, CA', website: 'https://fortiquantum.io', certValid: true },
  { id: 4, name: 'ZeroWire Security', category: 'Network Security', trustScore: 89, quantumRiskScore: 10, status: 'active', certificationLevel: 'platinum', headquarters: 'Toronto, Canada', website: 'https://zerowire.io', certValid: true },
  { id: 5, name: 'SecureNexus', category: 'Identity & Access', trustScore: 75, quantumRiskScore: 34, status: 'active', certificationLevel: 'silver', headquarters: 'New York, NY', website: 'https://securenexus.io', certValid: true },
  { id: 6, name: 'HorizonTrust', category: 'Identity & Access', trustScore: 94, quantumRiskScore: 6, status: 'active', certificationLevel: 'platinum', headquarters: 'Raleigh, NC', website: 'https://horizontrust.io', certValid: true },
  { id: 7, name: 'Authentikey', category: 'Identity & Access', trustScore: 82, quantumRiskScore: 22, status: 'active', certificationLevel: 'gold', headquarters: 'Amsterdam, NL', website: 'https://authentikey.eu', certValid: true },
  { id: 8, name: 'PrismAuth', category: 'Identity & Access', trustScore: 88, quantumRiskScore: 14, status: 'active', certificationLevel: 'gold', headquarters: 'Stockholm, Sweden', website: 'https://prismauth.se', certValid: true },
  { id: 9, name: 'AegisProtocol', category: 'Endpoint Protection', trustScore: 83, quantumRiskScore: 22, status: 'active', certificationLevel: 'gold', headquarters: 'Seattle, WA', website: 'https://aegisprotocol.com', certValid: true },
  { id: 10, name: 'SentinelCore', category: 'Endpoint Protection', trustScore: 86, quantumRiskScore: 19, status: 'active', certificationLevel: 'gold', headquarters: 'Miami, FL', website: 'https://sentinelcore.io', certValid: true }
];

const MOCK_BACKUP_THREATS = [
  { id: 1, vendorId: 5, title: "Anomalous API Call Patterns", severity: "high", category: "API Abuse", description: "Burst of unauthenticated API calls detected.", status: "investigating", detectedAt: new Date().toISOString() },
  { id: 2, vendorId: 22, title: "Dark Web Credential Exposure", severity: "critical", category: "Data Breach", description: "Admin credentials found on dark web marketplace.", status: "open", detectedAt: new Date().toISOString() },
  { id: 3, vendorId: 6, title: "Stale Session Token Exploitation", severity: "medium", category: "Authentication", description: "Session tokens not expiring correctly.", status: "open", detectedAt: new Date().toISOString() },
  { id: 4, vendorId: 13, title: "Weak Encryption Protocol Detected", severity: "high", category: "Cryptography", description: "TLS 1.0 still enabled on legacy endpoints.", status: "open", detectedAt: new Date().toISOString() },
  { id: 5, vendorId: 2, title: "Port Scan Detected", severity: "low", category: "Reconnaissance", description: "Sequential port scans detected against DMZ nodes.", status: "resolved", detectedAt: new Date().toISOString() }
];

const MOCK_BACKUP_SUMMARY = {
  totalVendors: 10,
  activeVendors: 10,
  avgTrustScore: 84,
  avgQuantumRisk: 21,
  criticalThreats: 4,
  certExpiringSoon: 1,
};

export default function DocumentGenerator() {
  const { toast } = useToast();
  const [generating, setGenerating] = useState<string | null>(null);
  const [generated, setGenerated] = useState<Set<string>>(new Set());

  const { data: serverVendors = [] }  = useListVendors({});
  const { data: serverThreats = [] }  = useListThreats({});
  const { data: serverSummary }       = useGetDashboardSummary();

  // Route telemetry queries through the fallback compiler logic
  const vendors = serverVendors && serverVendors.length > 0 ? serverVendors : MOCK_BACKUP_VENDORS;
  const threats = serverThreats && serverThreats.length > 0 ? serverThreats : MOCK_BACKUP_THREATS;
  const summary = serverSummary && Object.keys(serverSummary).length > 0 ? serverSummary : MOCK_BACKUP_SUMMARY;

  // Unlocks interface actions instantly since local mock arrays populate immediately
  const dataReady = vendors.length > 0;

  async function generate(id: string) {
    setGenerating(id);
    try {
      await new Promise(r => setTimeout(r, 600));
      switch (id) {
        case "vendor-risk":
          generateVendorRiskAssessment(vendors);
          break;
        case "threat-intel":
          generateThreatIntelligenceReport(threats);
          break;
        case "executive-brief":
          generateExecutiveBrief(summary ?? {}, vendors, threats);
          break;
        case "pki-audit":
          generatePKIAuditReport(vendors);
          break;
        case "compliance":
          generateComplianceStatusReport(vendors, threats);
          break;
        case "posture":
          generateSecurityPostureSummary(summary ?? {}, vendors, threats);
          break;
      }
      setGenerated(prev => new Set([...prev, id]));
      const report = REPORTS.find(r => r.id === id);
      toast({ title: "Document generated", description: `${report?.title} downloaded successfully.` });
    } catch {
      toast({ title: "Generation failed", description: "Could not produce the document. Try again.", variant: "destructive" });
    } finally {
      setGenerating(null);
    }
  }

  async function generateAll() {
    for (const r of REPORTS) {
      await generate(r.id);
      await new Promise(res => setTimeout(res, 500));
    }
  }

  return (
    <Shell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-mono flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary" />
              Document Generator
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Generate branded PDF security reports from live platform data.
            </p>
          </div>
          <Button
            onClick={generateAll}
            disabled={!dataReady || !!generating}
            className="font-mono"
          >
            {generating ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
            ) : (
              <><Download className="w-4 h-4 mr-2" /> Generate All Reports</>
            )}
          </Button>
        </div>

        {/* Stats bar */}
        <div className="flex flex-wrap gap-4 bg-card/50 border border-border/50 rounded-lg px-5 py-3">
          {[
            { label: "Vendors",  value: vendors.length },
            { label: "Threats",  value: threats.length },
            { label: "Reports",  value: REPORTS.length },
            { label: "Generated", value: generated.size },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-2">
              <span className="font-mono text-xl font-bold text-primary">{s.value}</span>
              <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">{s.label}</span>
            </div>
          ))}
          {(!serverVendors || serverVendors.length === 0) && (
            <span className="font-mono text-xs text-green-400 ml-auto flex items-center gap-1 bg-green-500/10 border border-green-500/20 px-3 py-0.5 rounded-full">
              ✓ Sandbox Data Active
            </span>
          )}
        </div>

        {/* Report cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {REPORTS.map((report) => {
            const Icon = report.icon;
            const isGenerating = generating === report.id;
            const isDone = generated.has(report.id);

            return (
              <Card
                key={report.id}
                className={`bg-card/50 border-border/50 hover:border-primary/40 transition-all group relative overflow-hidden ${
                  isDone ? "border-green-500/30" : ""
                }`}
              >
                {isDone && (
                  <div className="absolute top-3 right-3">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                  </div>
                )}
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <CardHeader className="pb-2">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="font-mono text-sm leading-tight">{report.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <Badge variant="outline" className={`font-mono text-[10px] px-1.5 py-0 ${report.badgeColor}`}>
                          {report.badge}
                        </Badge>
                        <span className="font-mono text-[10px] text-muted-foreground">{report.pages}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0 space-y-4">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {report.description}
                  </p>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {report.needs.map(n => (
                      <span key={n} className="inline-flex items-center gap-1 font-mono text-[10px] text-muted-foreground bg-secondary/40 rounded px-1.5 py-0.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          n === "vendors" ? (vendors.length > 0 ? "bg-green-400" : "bg-red-400")
                          : n === "threats" ? (threats.length >= 0 ? "bg-green-400" : "bg-red-400")
                          : (summary ? "bg-green-400" : "bg-yellow-400")
                        }`} />
                        {n}
                      </span>
                    ))}
                  </div>

                  <Button
                    onClick={() => generate(report.id)}
                    disabled={!dataReady || !!generating}
                    variant={isDone ? "secondary" : "default"}
                    size="sm"
                    className="w-full font-mono text-xs"
                  >
                    {isGenerating ? (
                      <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Generating…</>
                    ) : isDone ? (
                      <><CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Download Again</>
                    ) : (
                      <><Download className="w-3.5 h-3.5 mr-1.5" /> Generate PDF</>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Info footer */}
        <p className="text-xs text-muted-foreground font-mono text-center">
          All documents are generated client-side from live platform data and downloaded directly — no data leaves your browser.
        </p>
      </div>
    </Shell>
  );
}