import { Shell } from "@/components/layout/Shell";
import { useGetVendor, getGetVendorQueryKey, useGetVendorTrustScore, getGetVendorTrustScoreQueryKey, useScanVendorCertificate, useListVendorDocuments, getListVendorDocumentsQueryKey, useListThreats, getListThreatsQueryKey } from "@/lib/api";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { TrustGauge } from "@/components/ui/trust-gauge";
import { QuantumRiskGauge } from "@/components/ui/quantum-risk-gauge";
import { SeverityBadge } from "@/components/ui/severity-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { ShieldCheck, ShieldAlert, FileText, Activity, Server, MapPin, Globe, Calendar, AlertTriangle } from "lucide-react";
import { formatDate, formatBytes } from "@/lib/format";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import { useQueryClient } from "@tanstack/react-query";

export default function VendorDetail() {
  const [, params] = useRoute("/vendors/:id");
  const id = Number(params?.id);
  const queryClient = useQueryClient();

  const { data: vendor, isLoading: loadingVendor } = useGetVendor(id, { query: { enabled: !!id, queryKey: getGetVendorQueryKey(id) } });
  const { data: trustScore, isLoading: loadingTrust } = useGetVendorTrustScore(id, { query: { enabled: !!id, queryKey: getGetVendorTrustScoreQueryKey(id) } });
  const { data: documents, isLoading: loadingDocs } = useListVendorDocuments(id, { query: { enabled: !!id, queryKey: getListVendorDocumentsQueryKey(id) } });
  const { data: threats, isLoading: loadingThreats } = useListThreats({ vendorId: id }, { query: { enabled: !!id, queryKey: getListThreatsQueryKey({ vendorId: id }) } });

  const scanCert = useScanVendorCertificate();
  const [domainToScan, setDomainToScan] = useState("");

  const handleScan = () => {
    if (!domainToScan) return;
    scanCert.mutate({ id, domain: domainToScan }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetVendorQueryKey(id) });
      }
    });
  };

  const trustChartData = trustScore ? [
    { name: "Cert Health", score: trustScore.components.certHealth },
    { name: "Compliance", score: trustScore.components.complianceScore },
    { name: "Incidents", score: trustScore.components.incidentHistory },
    { name: "Q-Ready", score: trustScore.components.quantumReadiness },
    { name: "Docs", score: trustScore.components.documentationScore },
  ] : [];

  if (loadingVendor) {
    return <Shell><div className="p-8"><Skeleton className="h-12 w-1/3 mb-8" /><Skeleton className="h-64 w-full" /></div></Shell>;
  }

  if (!vendor) return <Shell><div className="p-8 text-red-500 font-mono">Vendor not found</div></Shell>;

  return (
    <Shell>
      <div className="space-y-6 pb-12">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight text-foreground font-mono">{vendor.name}</h1>
              <StatusBadge status={vendor.status} />
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-mono">
                {vendor.certificationLevel.toUpperCase()}
              </Badge>
            </div>
            <p className="text-muted-foreground max-w-2xl">{vendor.description}</p>
            
            <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground font-mono">
              <div className="flex items-center gap-2"><Server className="w-4 h-4" /> {vendor.category}</div>
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {vendor.headquarters}</div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" /> 
                <a href={vendor.website} target="_blank" rel="noreferrer" className="text-primary hover:underline">{vendor.website.replace('https://', '')}</a>
              </div>
            </div>
          </div>
          
          <div className="flex gap-6 bg-card/50 p-4 rounded-lg border border-border/50">
            <div className="flex flex-col items-center">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 font-mono">Trust Score</div>
              <TrustGauge score={vendor.trustScore} className="scale-110" />
            </div>
            <div className="w-px bg-border/50" />
            <div className="flex flex-col justify-center min-w-[120px]">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 font-mono">Quantum Risk</div>
              <QuantumRiskGauge score={vendor.quantumRiskScore} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="font-mono text-lg flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                Trust Component Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingTrust ? <Skeleton className="h-[250px] w-full" /> : (
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trustChartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                      <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" fontSize={12} />
                      <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} width={80} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }}
                        cursor={{fill: '#1e293b'}}
                      />
                      <Bar dataKey="score" fill="#0ea5e9" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="font-mono text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                TLS/SSL Certificate Scanner
              </CardTitle>
              <CardDescription>Verify domain cryptographic integrity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input 
                  placeholder="example.com" 
                  value={domainToScan}
                  onChange={e => setDomainToScan(e.target.value)}
                  className="bg-background/50 font-mono text-sm"
                />
                <Button onClick={handleScan} disabled={scanCert.isPending || !domainToScan} className="font-mono">
                  {scanCert.isPending ? "Scanning..." : "Scan"}
                </Button>
              </div>

              {scanCert.data ? (
                <div className="mt-4 p-4 bg-secondary/30 rounded-lg border border-border/50 space-y-3 font-mono text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Grade</span>
                    <span className={`font-bold ${['A+', 'A'].includes(scanCert.data.grade) ? 'text-green-500' : 'text-yellow-500'}`}>
                      {scanCert.data.grade}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Status</span>
                    <span className={scanCert.data.valid ? 'text-green-500' : 'text-red-500'}>
                      {scanCert.data.valid ? 'VALID' : 'INVALID'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Q-Safe</span>
                    <span className={scanCert.data.quantumSafe ? 'text-green-500' : 'text-red-500'}>
                      {scanCert.data.quantumSafe ? 'YES' : 'NO'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Expires</span>
                    <span>{formatDate(scanCert.data.expiresAt)}</span>
                  </div>
                </div>
              ) : vendor.lastCertScan ? (
                <div className="mt-4 p-4 bg-secondary/30 rounded-lg border border-border/50 font-mono text-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2 h-2 rounded-full ${vendor.certValid ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span>Last scanned: {formatDate(vendor.lastCertScan)}</span>
                  </div>
                  <div className="text-muted-foreground">Expires: {formatDate(vendor.certExpiresAt)}</div>
                </div>
              ) : (
                <div className="mt-4 p-4 bg-secondary/30 rounded-lg border border-dashed border-border/50 text-center text-muted-foreground text-sm font-mono">
                  No certificate scans on record.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-card/50 border-border/50 flex flex-col">
            <CardHeader>
              <CardTitle className="font-mono text-lg flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-primary" />
                Active Threat Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto max-h-[400px]">
              {loadingThreats ? <Skeleton className="h-32 w-full" /> : threats?.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <ShieldCheck className="w-12 h-12 mb-4 text-green-500/50" />
                  <p className="font-mono text-sm">No active threats detected for this vendor.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {threats?.map(threat => (
                    <div key={threat.id} className="p-4 rounded-lg bg-secondary/30 border border-border/50 relative overflow-hidden group">
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                        threat.severity === 'critical' ? 'bg-red-500' : 
                        threat.severity === 'high' ? 'bg-orange-500' : 'bg-yellow-500'
                      }`} />
                      <div className="flex justify-between items-start mb-2 pl-2">
                        <div className="font-medium">{threat.title}</div>
                        <SeverityBadge severity={threat.severity} />
                      </div>
                      <p className="text-sm text-muted-foreground pl-2 mb-3">{threat.description}</p>
                      <div className="flex items-center justify-between text-xs font-mono text-muted-foreground pl-2 pt-3 border-t border-border/50">
                        <span>{threat.category}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(threat.detectedAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50 flex flex-col">
            <CardHeader>
              <CardTitle className="font-mono text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Verified Documentation
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto max-h-[400px]">
              {loadingDocs ? <Skeleton className="h-32 w-full" /> : documents?.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <FileText className="w-12 h-12 mb-4 text-slate-700" />
                  <p className="font-mono text-sm">No documents uploaded.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {documents?.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/50 hover:bg-secondary/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center text-primary font-mono text-xs font-bold">
                          {doc.type.substring(0, 3)}
                        </div>
                        <div>
                          <a href={doc.url} target="_blank" rel="noreferrer" className="font-medium text-sm hover:text-primary hover:underline">
                            {doc.name}
                          </a>
                          <div className="text-xs text-muted-foreground font-mono flex items-center gap-2 mt-1">
                            <span>{formatBytes(doc.size)}</span>
                            <span>•</span>
                            <span>{formatDate(doc.uploadedAt)}</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="font-mono text-[10px]">{doc.type}</Badge>
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
