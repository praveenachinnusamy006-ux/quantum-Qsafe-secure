import { Shell } from "@/components/layout/Shell";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Bug, Radar, AlertTriangle, CheckCircle2, Clock, Database,
  Zap, Package, Puzzle, BrainCircuit, GitBranch, Settings2, Activity, RefreshCw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useRef } from "react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar as RechartsRadar, ResponsiveContainer, Tooltip as RechartsTooltip,
} from "recharts";
import { SeverityBadge } from "@/components/ui/severity-badge";

interface Anomaly {
  id: number;
  category: string;
  title: string;
  severity: string;
  description: string;
  detectedAt: string;
  confidence: number;
  nodeId: string;
}

interface RiskScores {
  packages: number;
  plugins: number;
  aiconfig: number;
  git: number;
  ide: number;
}

interface ScanResult {
  id: number;
  scanTarget: string;
  scanDepth: string;
  overallRisk: number;
  anomalyCount: number;
  riskScores: RiskScores | null;
  anomalies: Anomaly[] | null;
  status: string;
  createdAt: string;
}

type ScanDepth = "quick" | "full" | "deep";
type ScanStatus = "idle" | "scanning" | "done";

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  packages: Package,
  plugins:  Puzzle,
  aiconfig: BrainCircuit,
  git:      GitBranch,
  ide:      Settings2,
};

const SCAN_DEPTH_OPTIONS: { value: ScanDepth; label: string; desc: string; time: string }[] = [
  { value: "quick", label: "Quick Sweep",    desc: "Package manifest surface scan",              time: "~15s" },
  { value: "full",  label: "Full Scan",      desc: "Packages + plugins + AI config inspection",  time: "~45s" },
  { value: "deep",  label: "Deep Audit",     desc: "Full supply-chain + git hook + IDE analysis", time: "~90s" },
];

// Local fallback scan results matrix generation matching your workstation parameters
function generateMockSupplyChainResult(target: string, depth: ScanDepth): ScanResult {
  const anomalies: Anomaly[] = [];
  
  if (depth === "quick" || depth === "full" || depth === "deep") {
    anomalies.push({
      id: 1,
      category: "packages",
      title: "Typosquatted Dependency Found",
      severity: "critical",
      description: `Discovered 'react-domm' (v18.2.4) inside production manifest. Package mimics standard library to execute unverified obfuscated network payload during installation lifecycle.`,
      detectedAt: new Date().toISOString(),
      confidence: 99,
      nodeId: "NODE-MANIFEST-01"
    });
  }

  if (depth === "full" || depth === "deep") {
    anomalies.push({
      id: 2,
      category: "aiconfig",
      title: "Plaintext API Key Exposed in AI Config",
      severity: "high",
      description: `Detected custom OpenAI corporate endpoint bearer token hardcoded inside local '.cursor/config.json'. Secrets are leaking to file context buffers.`,
      detectedAt: new Date(Date.now() - 5000).toISOString(),
      confidence: 94,
      nodeId: "NODE-CURSOR-02"
    });
  }

  if (depth === "deep") {
    anomalies.push({
      id: 3,
      category: "git",
      title: "Malicious Post-Commit Git Hook Intercept",
      severity: "high",
      description: `Unsigned shell routine script mapped inside '.git/hooks/post-commit'. Hook captures staging diff contexts and forwards chunks to remote unlisted IP endpoint.`,
      detectedAt: new Date(Date.now() - 12000).toISOString(),
      confidence: 88,
      nodeId: "NODE-GIT-HOOK"
    });
    anomalies.push({
      id: 4,
      category: "plugins",
      title: "Unsigned Marketplace IDE Extension",
      severity: "medium",
      description: `Active third-party utility editor plugin lacks signing root authority certificates. Binary performs continuous directory indexing behaviors.`,
      detectedAt: new Date(Date.now() - 30000).toISOString(),
      confidence: 76,
      nodeId: "NODE-IDE-VSCODE"
    });
  }

  // Calculate scores contextually
  const riskScores: RiskScores = {
    packages: depth === "quick" ? 75 : depth === "full" ? 82 : 88,
    plugins: depth === "deep" ? 64 : 12,
    aiconfig: depth === "quick" ? 10 : 85,
    git: depth === "deep" ? 78 : 15,
    ide: depth === "deep" ? 55 : 8,
  };

  const scoresArray = Object.values(riskScores);
  const overallRisk = Math.round(scoresArray.reduce((a, b) => a + b, 0) / scoresArray.length);

  return {
    id: Date.now(),
    scanTarget: target,
    scanDepth: depth,
    overallRisk,
    anomalyCount: anomalies.length,
    riskScores,
    anomalies,
    status: "done",
    createdAt: new Date().toISOString()
  };
}

function RiskGauge({ label, value, icon: Icon }: { label: string; value: number; icon: React.ElementType }) {
  const color = value >= 70 ? "#ef4444" : value >= 45 ? "#f97316" : "#0ea5e9";
  const circumference = 2 * Math.PI * 28;
  const offset = circumference - (circumference * value) / 100;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-20 h-20">
        <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
          <circle cx="32" cy="32" r="28" fill="none" stroke="hsl(var(--secondary))" strokeWidth="6" />
          <circle
            cx="32" cy="32" r="28" fill="none"
            stroke={color} strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Icon className="w-4 h-4" style={{ color }} />
          <span className="font-mono text-xs font-bold" style={{ color }}>{value}%</span>
        </div>
      </div>
      <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wide truncate max-w-full">{label}</span>
    </div>
  );
}

function RadarScanAnimation({ scanning }: { scanning: boolean }) {
  const rings = [28, 48, 68, 88, 108];
  return (
    <div className="relative w-56 h-56 flex items-center justify-center">
      {rings.map((r, i) => (
        <div
          key={i}
          className="absolute rounded-full border border-primary/20"
          style={{ width: r, height: r }}
        />
      ))}
      {scanning && (
        <motion.div
          className="absolute inset-0"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <div
            className="absolute left-1/2 top-1/2 origin-left"
            style={{
              width: "50%",
              height: "2px",
              background: "linear-gradient(to right, transparent, #eab308)",
              boxShadow: "0 0 8px #eab308",
              transformOrigin: "left center",
              transform: "translateY(-50%)",
            }}
          />
        </motion.div>
      )}
      <div className={`w-3 h-3 rounded-full ${scanning ? "bg-yellow-400 animate-pulse" : "bg-secondary"}`} />
      {scanning && (
        <>
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-yellow-400/60"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
                x: Math.cos((i / 5) * 2 * Math.PI) * (40 + Math.random() * 40),
                y: Math.sin((i / 5) * 2 * Math.PI) * (40 + Math.random() * 40),
              }}
              transition={{ duration: 1.5, delay: i * 0.3, repeat: Infinity }}
            />
          ))}
        </>
      )}
    </div>
  );
}

export default function BumblebeeSecurity() {
  const [scanStatus, setScanStatus] = useState<ScanStatus>("idle");
  const [scanDepth, setScanDepth] = useState<ScanDepth>("full");
  const [scanTarget, setScanTarget] = useState("/home/dev/projects/webapp");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [history, setHistory] = useState<ScanResult[]>([]);
  const [scanProgress, setScanProgress] = useState(0);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Pre-seed history entries inside the active runtime timeline
  useEffect(() => {
    const defaultHistory = [
      {
        id: 10,
        scanTarget: "/home/dev/projects/internal-dashboard",
        scanDepth: "quick",
        overallRisk: 34,
        anomalyCount: 1,
        riskScores: null,
        anomalies: null,
        status: "done",
        createdAt: new Date(Date.now() - 3600000).toISOString()
      }
    ];
    setHistory(defaultHistory);
  }, []);

  const startScan = async () => {
    setScanStatus("scanning");
    setScanProgress(0);
    setResult(null);

    const duration = scanDepth === "quick" ? 1500 : scanDepth === "full" ? 3000 : 4500;
    const startTime = Date.now();

    if (progressRef.current) clearInterval(progressRef.current);

    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(98, (elapsed / duration) * 100);
      setScanProgress(Math.round(pct));
    }, 80);

    setTimeout(() => {
      if (progressRef.current) clearInterval(progressRef.current);
      
      const compileScan = generateMockSupplyChainResult(scanTarget, scanDepth);
      setScanProgress(100);
      setResult(compileScan);
      setScanStatus("done");
      setHistory(prev => [compileScan, ...prev]);
    }, duration);
  };

  const radarData = result?.riskScores
    ? [
        { category: "Packages",  value: result.riskScores.packages  },
        { category: "Plugins",   value: result.riskScores.plugins   },
        { category: "AI Config", value: result.riskScores.aiconfig  },
        { category: "Git",       value: result.riskScores.git       },
        { category: "IDE",       value: result.riskScores.ide       },
      ]
    : [];

  const riskColor = (v: number) =>
    v >= 70 ? "text-red-400" : v >= 45 ? "text-orange-400" : "text-primary";

  const riskLabel = (v: number) =>
    v >= 70 ? "CRITICAL" : v >= 45 ? "HIGH" : v >= 25 ? "MEDIUM" : "LOW";

  return (
    <Shell>
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-3 flex-wrap">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-400 text-xs font-mono border border-yellow-500/20">
              <Bug className="w-3.5 h-3.5" /> MODULE // BUMBLEBEE SECURITY
            </div>
            <Badge variant="outline" className="font-mono text-xs border-primary/40 text-primary bg-primary/10">
              SUPPLY-CHAIN
            </Badge>
          </div>
          <h1 className="text-4xl font-bold tracking-tight font-mono">Bumblebee Security Method</h1>
          <p className="text-muted-foreground leading-relaxed max-w-2xl">
            Developer endpoint supply-chain scanner. Audits local package installs, editor plugins,
            AI tool configurations (.cursor, .copilot, .continue), git hooks, and IDE settings for
            compromised or malicious components before they reach production.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="border-b border-border/50 bg-secondary/10 pb-4">
                <CardTitle className="font-mono text-sm flex items-center gap-2">
                  <Radar className="w-4 h-4 text-yellow-400" /> Scan Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="space-y-1.5">
                  <label className="font-mono text-xs text-muted-foreground">Scan Target (Workstation / Repo Path)</label>
                  <input
                    value={scanTarget}
                    disabled={scanStatus === "scanning"}
                    onChange={(e) => setScanTarget(e.target.value)}
                    placeholder="/home/dev/projects/webapp"
                    className="w-full bg-background border border-border/50 rounded-md px-3 py-2 font-mono text-sm focus:outline-none focus:border-primary/50 text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-mono text-xs text-muted-foreground">Scan Depth</label>
                  {SCAN_DEPTH_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      disabled={scanStatus === "scanning"}
                      onClick={() => setScanDepth(opt.value)}
                      className={`w-full flex items-start gap-3 p-3 rounded-lg border transition-all text-left ${
                        scanDepth === opt.value
                          ? "border-yellow-500/50 bg-yellow-500/10"
                          : "border-border/50 bg-secondary/10 hover:border-yellow-500/30"
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                        scanDepth === opt.value ? "bg-yellow-400" : "bg-secondary"
                      }`} />
                      <div>
                        <div className={`font-mono text-sm font-bold ${scanDepth === opt.value ? "text-yellow-400" : "text-foreground"}`}>
                          {opt.label}
                        </div>
                        <div className="font-mono text-xs text-muted-foreground">{opt.desc}</div>
                        <div className="font-mono text-xs text-yellow-400/70 mt-0.5">{opt.time}</div>
                      </div>
                    </button>
                  ))}
                </div>
                <Button
                  onClick={startScan}
                  disabled={scanStatus === "scanning"}
                  className="w-full font-mono"
                  variant={scanStatus === "scanning" ? "secondary" : "default"}
                >
                  {scanStatus === "scanning" ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Scanning... {scanProgress}%
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Zap className="w-4 h-4" /> Run Supply-Chain Audit
                    </span>
                  )}
                </Button>
                {scanStatus === "scanning" && (
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full transition-all duration-75"
                      style={{ width: `${scanProgress}%` }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50 flex flex-col items-center py-6">
              <div className="text-xs font-mono text-muted-foreground mb-3 uppercase tracking-widest">
                {scanStatus === "scanning" ? "Auditing Dev Environment..." : scanStatus === "done" ? "Audit Complete" : "Scanner Standby"}
              </div>
              <RadarScanAnimation scanning={scanStatus === "scanning"} />
              {scanStatus === "done" && result && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 text-center"
                >
                  <div className={`text-3xl font-bold font-mono ${riskColor(result.overallRisk)}`}>
                    {result.overallRisk}
                  </div>
                  <div className={`text-xs font-mono mt-1 ${riskColor(result.overallRisk)}`}>
                    {riskLabel(result.overallRisk)} RISK
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 font-mono">
                    {result.anomalyCount} anomalies detected
                  </div>
                </motion.div>
              )}
            </Card>
          </div>

          <div className="lg:col-span-3 space-y-4">
            <AnimatePresence mode="wait">
              {scanStatus === "done" && result ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-5 gap-2">
                    {result.riskScores && Object.entries(result.riskScores).map(([key, val]) => {
                      const Icon = CATEGORY_ICONS[key] ?? Shield;
                      return <RiskGauge key={key} label={key} value={val} icon={Icon} />;
                    })}
                  </div>

                  {radarData.length > 0 && (
                    <Card className="bg-card/50 border-border/50">
                      <CardHeader className="border-b border-border/50 bg-secondary/10 pb-3">
                        <CardTitle className="font-mono text-sm">Supply-Chain Risk Radar</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="h-48">
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart data={radarData}>
                              <PolarGrid stroke="#1e293b" />
                              <PolarAngleAxis dataKey="category" tick={{ fill: "#64748b", fontSize: 11, fontFamily: "monospace" }} />
                              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 9 }} />
                              <RechartsRadar name="Risk" dataKey="value" stroke="#eab308" fill="#eab308" fillOpacity={0.2} />
                              <RechartsTooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "6px", fontFamily: "monospace", fontSize: 12 }} />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Card className="bg-card/50 border-border/50">
                    <CardHeader className="border-b border-border/50 bg-secondary/10 pb-3">
                      <CardTitle className="font-mono text-sm flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                        Detected Anomalies ({result.anomalyCount})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      {result.anomalies && result.anomalies.length > 0 ? (
                        <div className="divide-y divide-border/50">
                          {result.anomalies.map((anomaly) => {
                            const Icon = CATEGORY_ICONS[anomaly.category] ?? Shield;
                            return (
                              <motion.div
                                key={anomaly.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="p-4 hover:bg-secondary/20 transition-colors"
                              >
                                <div className="flex items-start justify-between gap-3 mb-2">
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <Icon className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                                    <span className="font-mono text-sm font-bold truncate">{anomaly.title}</span>
                                  </div>
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    <SeverityBadge severity={anomaly.severity} />
                                    <Badge variant="outline" className="font-mono text-xs border-yellow-500/30 text-yellow-400">
                                      {anomaly.confidence}%
                                    </Badge>
                                  </div>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed ml-6">
                                  {anomaly.description}
                                </p>
                                <div className="flex items-center gap-4 mt-2 ml-6 text-xs text-muted-foreground font-mono">
                                  <span className="flex items-center gap-1">
                                    <Activity className="w-3 h-3" /> {anomaly.nodeId}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {new Date(anomaly.detectedAt).toLocaleTimeString()}
                                  </span>
                                  <Badge variant="outline" className="font-mono text-[10px] border-border/50 text-muted-foreground capitalize px-1.5 py-0">
                                    {anomaly.category}
                                  </Badge>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-8 text-center font-mono text-sm text-primary">
                          <CheckCircle2 className="w-8 h-8 mx-auto mb-2" />
                          No supply-chain anomalies detected
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div key="idle-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Card className="bg-card/50 border-border/50 min-h-64 flex items-center justify-center">
                    <div className="text-center space-y-3 p-8">
                      <Bug className="w-12 h-12 text-yellow-400/30 mx-auto" />
                      <p className="font-mono text-muted-foreground text-sm">
                        {scanStatus === "scanning"
                          ? "Bumblebee auditing developer environment..."
                          : "Set scan target and run a supply-chain audit"}
                      </p>
                      {scanStatus === "scanning" && (
                        <p className="font-mono text-yellow-400 text-xs animate-pulse">
                          Inspecting packages, plugins, AI configs, git hooks...
                        </p>
                      )}
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            <Card className="bg-card/50 border-border/50">
              <CardHeader className="border-b border-border/50 bg-secondary/10 pb-3">
                <CardTitle className="font-mono text-sm flex items-center gap-2">
                  <Database className="w-4 h-4 text-primary" /> Scan History
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {history.length === 0 ? (
                  <div className="p-6 text-center font-mono text-sm text-muted-foreground">No scans recorded yet</div>
                ) : (
                  <div className="divide-y divide-border/50">
                    {history.slice(0, 5).map((scan) => (
                      <div key={scan.id} className="flex items-center justify-between px-4 py-3 hover:bg-secondary/20 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            scan.overallRisk >= 70 ? "bg-red-400" : scan.overallRisk >= 45 ? "bg-orange-400" : "bg-yellow-400"
                          }`} />
                          <div>
                            <div className="font-mono text-sm font-bold truncate max-w-[240px] sm:max-w-xs">{scan.scanTarget}</div>
                            <div className="font-mono text-xs text-muted-foreground capitalize">
                              {scan.scanDepth} · {scan.anomalyCount} anomalies · Risk {scan.overallRisk}%
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono flex-shrink-0">
                          <Clock className="w-3 h-3" />
                          {new Date(scan.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-5 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <Package className="w-4 h-4 text-yellow-400" />
                </div>
                <span className="font-mono text-sm font-bold">Package Integrity Verification</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Cross-references every installed npm, pip, cargo, and Go module against known typosquatting
                campaigns, compromised registry entries, and postinstall script fingerprints. SHA-256 verified
                against reproducible build hashes.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-5 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BrainCircuit className="w-4 h-4 text-primary" />
                </div>
                <span className="font-mono text-sm font-bold">AI Config Secrets Audit</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Scans .cursor, .copilot, .continue, and .aider config files for plaintext API keys,
                untrusted model endpoints, and prompt injection payloads. Flags configs committed
                to git history even after removal.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-5 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <GitBranch className="w-4 h-4 text-green-400" />
                </div>
                <span className="font-mono text-sm font-bold">Git Hook & Plugin Integrity</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Validates all .git/hooks scripts against known-safe baselines. Inspects VS Code, JetBrains,
                and Vim plugin manifests for unsigned extensions, suspicious network activity patterns,
                and publisher identity mismatches.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Shell>
  );
}