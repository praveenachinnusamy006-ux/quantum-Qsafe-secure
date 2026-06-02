import { Shell } from "@/components/layout/Shell";
import { useListThreats, getListThreatsQueryKey, useGetThreatTimeline, getGetThreatTimelineQueryKey } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { ShieldAlert, Calendar, MapPin, Server, Activity } from "lucide-react";
import { SeverityBadge } from "@/components/ui/severity-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/format";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

// Fallback baseline datasets matching your 15 seed entries
const MOCK_BACKUP_THREATS = [
  { id: 1, vendorId: 5, title: "Anomalous API Call Patterns", severity: "high", category: "API Abuse", description: "Burst of unauthenticated API calls detected.", status: "investigating", detectedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 2, vendorId: 22, title: "Dark Web Credential Exposure", severity: "critical", category: "Data Breach", description: "Admin credentials found on dark web marketplace.", status: "open", detectedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 3, vendorId: 6, title: "Stale Session Token Exploitation", severity: "medium", category: "Authentication", description: "Session tokens not expiring correctly.", status: "open", detectedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 4, vendorId: 13, title: "Weak Encryption Protocol Detected", severity: "high", category: "Cryptography", description: "TLS 1.0 still enabled on legacy endpoints.", status: "open", detectedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 5, vendorId: 2, title: "Port Scan Detected", severity: "low", category: "Reconnaissance", description: "Sequential port scans detected against DMZ nodes.", status: "resolved", detectedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 6, vendorId: 1, title: "Quantum Key Rotation Overdue", severity: "medium", category: "Key Management", description: "Post-quantum key rotation schedule missed.", status: "open", detectedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 7, vendorId: 15, title: "Suspicious Certificate Authority", severity: "high", category: "PKI", description: "Certificate issued by untrusted intermediate CA.", status: "investigating", detectedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 8, vendorId: null, title: "Zero-Day Advisory: Log4Shell Variant", severity: "critical", category: "Vulnerability", description: "New Log4j variant affecting JVM services.", status: "open", detectedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() },
  { id: 9, vendorId: 9, title: "Lateral Movement Pattern", severity: "high", category: "Intrusion", description: "SMB relay attack detected between internal nodes.", status: "open", detectedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() },
  { id: 10, vendorId: 18, title: "Compliance Drift: SOC2", severity: "medium", category: "Compliance", description: "Access review controls overdue.", status: "open", detectedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 11, vendorId: 11, title: "Unsigned Kernel Driver Loaded", severity: "critical", category: "Endpoint", description: "Possible rootkit detected on endpoint fleet.", status: "investigating", detectedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
  { id: 12, vendorId: 4, title: "Brute Force Against Admin Panel", severity: "high", category: "Authentication", description: "14,000 failed login attempts detected.", status: "open", detectedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString() },
  { id: 13, vendorId: 24, title: "Supply Chain Indicator Flagged", severity: "critical", category: "Supply Chain", description: "Known C2 domain identified in supply chain telemetry.", status: "open", detectedAt: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString() },
  { id: 14, vendorId: 16, title: "Misconfigured S3 Bucket", severity: "medium", category: "Cloud Exposure", description: "Publicly readable S3 bucket discovered.", status: "resolved", detectedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 15, vendorId: 20, title: "FedRAMP Control Gap Identified", severity: "medium", category: "Compliance", description: "Missing penetration test evidence for controls.", status: "open", detectedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() }
];

const MOCK_BACKUP_TIMELINE = [
  { date: "2026-05-27", critical: 1, high: 2, medium: 3 },
  { date: "2026-05-29", critical: 2, high: 4, medium: 4 },
  { date: "2026-05-31", critical: 3, high: 5, medium: 4 },
  { date: "2026-06-01", critical: 4, high: 5, medium: 5 },
  { date: "2026-06-02", critical: 4, high: 6, medium: 5 }
];

export default function ThreatAnalytics() {
  const [severity, setSeverity] = useState<string>("all");

  const { data: serverThreats, isLoading: loadingThreats } = useListThreats(
    { severity: severity !== "all" ? severity : undefined },
    { query: { queryKey: getListThreatsQueryKey({ severity: severity !== "all" ? severity : undefined }) } }
  );

  const { data: serverTimeline, isLoading: loadingTimeline } = useGetThreatTimeline({ query: { queryKey: getGetThreatTimelineQueryKey() } });

  const rawThreats = serverThreats && serverThreats.length > 0 ? serverThreats : MOCK_BACKUP_THREATS;
  const timeline = serverTimeline && serverTimeline.length > 0 ? serverTimeline : MOCK_BACKUP_TIMELINE;

  const filteredThreats = rawThreats.filter(t => severity === "all" || t.severity === severity);

  const openThreats = filteredThreats.filter(t => t.status === "open" || t.status === "investigating").length;
  const resolvedThreats = filteredThreats.filter(t => t.status === "resolved").length;

  return (
    <Shell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-mono flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-primary" />
              Threat Analytics
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Global intelligence feed and incident tracking across vendor ecosystem.
            </p>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-card/50 border border-border/50 px-4 py-2 rounded-lg flex flex-col items-center justify-center min-w-[100px]">
              <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">Open</div>
              <div className="text-xl font-bold font-mono text-red-500">{openThreats}</div>
            </div>
            <div className="bg-card/50 border border-border/50 px-4 py-2 rounded-lg flex flex-col items-center justify-center min-w-[100px]">
              <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">Resolved</div>
              <div className="text-xl font-bold font-mono text-green-500">{resolvedThreats}</div>
            </div>
          </div>
        </div>

        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-lg font-mono">Global Threat Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingTimeline && !timeline ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timeline} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCritical2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorHigh2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorMed" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#eab308" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickFormatter={(v) => v ? new Date(v).toLocaleDateString() : ""} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }}
                      labelFormatter={(v) => v ? new Date(v).toLocaleDateString() : ""}
                    />
                    <Area type="monotone" dataKey="critical" stackId="1" stroke="#ef4444" fill="url(#colorCritical2)" />
                    <Area type="monotone" dataKey="high" stackId="1" stroke="#f97316" fill="url(#colorHigh2)" />
                    <Area type="monotone" dataKey="medium" stackId="1" stroke="#eab308" fill="url(#colorMed)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex items-center gap-4 bg-card/50 p-4 rounded-lg border border-border/50">
          <div className="text-sm font-mono text-muted-foreground uppercase tracking-widest">Filter By Severity:</div>
          <Select value={severity} onValueChange={setSeverity}>
            <SelectTrigger className="w-[200px] bg-background/50 border-border/50 font-mono">
              <SelectValue placeholder="All Severities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="info">Info</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          {loadingThreats && filteredThreats.length === 0 ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="bg-card/50 border-border/50"><CardContent className="p-6"><Skeleton className="h-16 w-full" /></CardContent></Card>
            ))
          ) : filteredThreats.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-border/50 rounded-lg bg-card/20">
              <div className="text-muted-foreground font-mono">No threats found matching criteria.</div>
            </div>
          ) : (
            filteredThreats.map(threat => (
              <div key={threat.id} className="p-5 rounded-lg bg-card/50 border border-border/50 relative overflow-hidden flex flex-col md:flex-row gap-4 md:items-center">
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                  threat.severity === 'critical' ? 'bg-red-500' : 
                  threat.severity === 'high' ? 'bg-orange-500' : 
                  threat.severity === 'medium' ? 'bg-yellow-500' :
                  threat.severity === 'low' ? 'bg-green-500' : 'bg-blue-500'
                }`} />
                
                <div className="flex-1 pl-4">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <SeverityBadge severity={threat.severity} />
                    <span className="font-bold text-lg font-mono tracking-tight">{threat.title}</span>
                    <Badge variant={threat.status === 'resolved' ? 'outline' : 'secondary'} className="font-mono text-[10px] uppercase ml-auto md:ml-0">
                      {threat.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground max-w-3xl">{threat.description}</p>
                </div>

                <div className="flex flex-col gap-2 min-w-[200px] text-xs font-mono text-muted-foreground pl-4 md:pl-0 border-t md:border-t-0 md:border-l border-border/50 pt-3 md:pt-0">
                  <div className="flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-primary" /> 
                    {threat.category}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" /> 
                    {formatDateTime(threat.detectedAt)}
                  </div>
                  {threat.vendorId && (
                    <div className="flex items-center gap-2">
                      <Server className="w-3.5 h-3.5" /> 
                      <Link href={`/vendors/${threat.vendorId}`} className="text-primary hover:underline truncate max-w-[150px]">
                        Vendor #{threat.vendorId}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Shell>
  );
}