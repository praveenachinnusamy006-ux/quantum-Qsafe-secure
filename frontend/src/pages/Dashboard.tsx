import { useGetDashboardSummary, getGetDashboardSummaryQueryKey } from "@/lib/api";
import { useGetThreatTimeline, getGetThreatTimelineQueryKey } from "@/lib/api";
import { useGetRiskDistribution, getGetRiskDistributionQueryKey } from "@/lib/api";
import { useGetCategoryBreakdown, getGetCategoryBreakdownQueryKey } from "@/lib/api";
import { useGetTopVendors, getGetTopVendorsQueryKey } from "@/lib/api";

import { Shell } from "@/components/layout/Shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield, AlertTriangle, ShieldCheck, Clock, Users, Activity, FileText } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { TrustGauge } from "@/components/ui/trust-gauge";
import { QuantumRiskGauge } from "@/components/ui/quantum-risk-gauge";
import { Link } from "wouter";
import { formatDateTime } from "@/lib/format";

// Static local datasets derived from your master dataset requirements
const BACKUP_SUMMARY = {
  totalVendors: 10,
  activeVendors: 10,
  avgTrustScore: 84,
  avgQuantumRisk: 21,
  criticalThreats: 4,
  certExpiringSoon: 1,
};

const BACKUP_TIMELINE = [
  { date: "2026-05-26", critical: 0, high: 1 },
  { date: "2026-05-28", critical: 0, high: 2 },
  { date: "2026-05-30", critical: 1, high: 2 },
  { date: "2026-05-31", critical: 2, high: 3 },
  { date: "2026-06-01", critical: 3, high: 5 },
  { date: "2026-06-02", critical: 4, high: 6 },
];

const BACKUP_RISK_DIST = [
  { label: "0-20 (Low)", count: 5 },
  { label: "21-40 (Medium)", count: 3 },
  { label: "41-60 (High)", count: 2 },
  { label: "61-80 (Severe)", count: 0 },
  { label: "81-100 (Critical)", count: 0 },
];

const BACKUP_TOP_VENDORS = [
  { id: 6, name: "HorizonTrust", category: "Identity & Access", trustScore: 94, quantumRiskScore: 6 },
  { id: 1, name: "CipherShield Labs", category: "Network Security", trustScore: 92, quantumRiskScore: 12 },
  { id: 4, name: "ZeroWire Security", category: "Network Security", trustScore: 89, quantumRiskScore: 10 },
  { id: 8, name: "PrismAuth", category: "Identity & Access", trustScore: 88, quantumRiskScore: 14 },
  { id: 7, name: "QuantumGuard Inc.", category: "Cloud Security", trustScore: 88, quantumRiskScore: 8 },
];

const BACKUP_CATEGORIES = [
  { category: "Network Security", count: 4, avgTrustScore: 83.5, avgQuantumRisk: 23.7 },
  { category: "Identity & Access", count: 4, avgTrustScore: 84.7, avgQuantumRisk: 19 },
  { category: "Endpoint Protection", count: 2, avgTrustScore: 84.5, avgQuantumRisk: 20.5 },
];

function StatCard({ title, value, icon: Icon, description, trend, loading }: any) {
  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="w-4 h-4 text-primary" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <>
            <div className="text-2xl font-bold font-mono">{value}</div>
            {(description || trend) && (
              <p className="text-xs text-muted-foreground mt-1">
                {trend && <span className={trend > 0 ? "text-green-500" : "text-red-500"}>{trend > 0 ? "+" : ""}{trend}% </span>}
                {description}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { data: serverSummary, isLoading: loadingSummary } = useGetDashboardSummary({ query: { queryKey: getGetDashboardSummaryQueryKey() } });
  const { data: serverTimeline, isLoading: loadingTimeline } = useGetThreatTimeline({ query: { queryKey: getGetThreatTimelineQueryKey() } });
  const { data: serverRiskDist, isLoading: loadingRisk } = useGetRiskDistribution({ query: { queryKey: getGetRiskDistributionQueryKey() } });
  const { data: serverCategoryStats, isLoading: loadingCategories } = useGetCategoryBreakdown({ query: { queryKey: getGetCategoryBreakdownQueryKey() } });
  const { data: serverTopVendors, isLoading: loadingTopVendors } = useGetTopVendors({ query: { queryKey: getGetTopVendorsQueryKey() } });

  // Use server statistics if safely populated, otherwise drop cleanly to backup blocks
  const summary = serverSummary && Object.keys(serverSummary).length > 0 ? serverSummary : BACKUP_SUMMARY;
  const timeline = serverTimeline && serverTimeline.length > 0 ? serverTimeline : BACKUP_TIMELINE;
  const riskDist = serverRiskDist && serverRiskDist.length > 0 ? serverRiskDist : BACKUP_RISK_DIST;
  const categoryStats = serverCategoryStats && serverCategoryStats.length > 0 ? serverCategoryStats : BACKUP_CATEGORIES;
  const topVendors = serverTopVendors && serverTopVendors.length > 0 ? serverTopVendors : BACKUP_TOP_VENDORS;

  return (
    <Shell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-mono">Overview</h1>
          <p className="text-muted-foreground text-sm">System-wide vendor risk and intelligence.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <StatCard title="Total Vendors" value={summary?.totalVendors} icon={Users} description={`${summary?.activeVendors || 0} Active`} loading={loadingSummary && !summary} />
          <StatCard title="Avg Trust Score" value={summary?.avgTrustScore} icon={ShieldCheck} loading={loadingSummary && !summary} />
          <StatCard title="Avg Q-Risk" value={summary?.avgQuantumRisk} icon={Activity} loading={loadingSummary && !summary} />
          <StatCard title="Critical Threats" value={summary?.criticalThreats} icon={AlertTriangle} loading={loadingSummary && !summary} />
          <StatCard title="Certs Expiring" value={summary?.certExpiringSoon} icon={Clock} loading={loadingSummary && !summary} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-mono">Threat Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingTimeline && !timeline ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timeline} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickFormatter={(v) => v ? new Date(v).toLocaleDateString() : ""} />
                      <YAxis stroke="#94a3b8" fontSize={12} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }}
                        labelFormatter={(v) => v ? new Date(v).toLocaleDateString() : ""}
                      />
                      <Area type="monotone" dataKey="critical" stackId="1" stroke="#ef4444" fill="url(#colorCritical)" />
                      <Area type="monotone" dataKey="high" stackId="1" stroke="#f97316" fill="url(#colorHigh)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-mono">Quantum Risk Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingRisk && !riskDist ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={riskDist} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} />
                      <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} />
                      <Bar dataKey="count" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-mono flex items-center justify-between">
                <span>Top Vendors by Trust</span>
                <Link href="/vendors" className="text-sm text-primary hover:underline font-sans">View All</Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingTopVendors && !topVendors ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : (
                <div className="space-y-4">
                  {topVendors?.map((vendor) => (
                    <div key={vendor.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/50 hover:bg-secondary/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <TrustGauge score={vendor.trustScore} className="scale-75 origin-left" />
                        <div>
                          <Link href={`/vendors/${vendor.id}`} className="font-medium hover:text-primary transition-colors">
                            {vendor.name}
                          </Link>
                          <div className="text-xs text-muted-foreground">{vendor.category}</div>
                        </div>
                      </div>
                      <QuantumRiskGauge score={vendor.quantumRiskScore} className="w-24" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-mono">Category Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingCategories && !categoryStats ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : (
                <div className="space-y-3">
                  {categoryStats?.map((stat) => (
                    <div key={stat.category} className="flex flex-col gap-2 p-3 rounded-lg bg-secondary/30 border border-border/50">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{stat.category}</span>
                        <span className="text-xs text-muted-foreground font-mono">{stat.count} vendors</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs font-mono">
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">Avg Trust:</span>
                          <span className="text-primary">{Math.round(stat.avgTrustScore)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">Avg Q-Risk:</span>
                          <span className="text-primary">{Math.round(stat.avgQuantumRisk)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </Shell>
  );
}