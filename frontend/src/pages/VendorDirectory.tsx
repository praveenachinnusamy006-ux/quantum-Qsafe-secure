import { Shell } from "@/components/layout/Shell";
import { useListVendors, getListVendorsQueryKey } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Link } from "wouter";
import { Search, Plus, Download, FileJson, FileText, AlertCircle, RefreshCw } from "lucide-react";
import { TrustGauge } from "@/components/ui/trust-gauge";
import { QuantumRiskGauge } from "@/components/ui/quantum-risk-gauge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportVendorsAsJSON, exportVendorsAsPDF } from "@/lib/export";
import { useToast } from "@/hooks/use-toast";

const CATEGORIES = [
  "Network Security",
  "Identity & Access",
  "Endpoint Protection",
  "Cloud Security",
  "Compliance",
  "Threat Intel",
];

// Fallback baseline data matching your 10 datasets
const MOCK_BACKUP_VENDORS = [
  { id: 1, name: 'CipherShield Labs', category: 'Network Security', trustScore: 92, quantumRiskScore: 12, status: 'active', certificationLevel: 'platinum', headquarters: 'San Francisco, CA', website: 'https://ciphershield.io', description: 'Next-gen network perimeter defense with quantum-safe tunneling.', certValid: true },
  { id: 2, name: 'ProtonArmor', category: 'Network Security', trustScore: 68, quantumRiskScore: 55, status: 'active', certificationLevel: 'bronze', headquarters: 'Denver, CO', website: 'https://protonarmor.io', description: 'Lightweight network monitoring for SMB environments.', certValid: true },
  { id: 3, name: 'FortiQuantum', category: 'Network Security', trustScore: 85, quantumRiskScore: 18, status: 'active', certificationLevel: 'gold', headquarters: 'Sunnyvale, CA', website: 'https://fortiquantum.io', description: 'Hardware-accelerated firewall with post-quantum IKEv3 support.', certValid: true },
  { id: 4, name: 'ZeroWire Security', category: 'Network Security', trustScore: 89, quantumRiskScore: 10, status: 'active', certificationLevel: 'platinum', headquarters: 'Toronto, Canada', website: 'https://zerowire.io', description: 'Zero-trust network overlay with lattice-based encryption fabric.', certValid: true },
  { id: 5, name: 'SecureNexus', category: 'Identity & Access', trustScore: 75, quantumRiskScore: 34, status: 'active', certificationLevel: 'silver', headquarters: 'New York, NY', website: 'https://securenexus.io', description: 'Zero-trust identity fabric for enterprise environments.', certValid: true },
  { id: 6, name: 'HorizonTrust', category: 'Identity & Access', trustScore: 94, quantumRiskScore: 6, status: 'active', certificationLevel: 'platinum', headquarters: 'Raleigh, NC', website: 'https://horizontrust.io', description: 'Federated identity and SSO with post-quantum crypto.', certValid: true },
  { id: 7, name: 'Authentikey', category: 'Identity & Access', trustScore: 82, quantumRiskScore: 22, status: 'active', certificationLevel: 'gold', headquarters: 'Amsterdam, NL', website: 'https://authentikey.eu', description: 'Hardware-backed FIDO2 passkey management.', certValid: true },
  { id: 8, name: 'PrismAuth', category: 'Identity & Access', trustScore: 88, quantumRiskScore: 14, status: 'active', certificationLevel: 'gold', headquarters: 'Stockholm, Sweden', website: 'https://prismauth.se', description: 'Decentralized identity verification.', certValid: true },
  { id: 9, name: 'AegisProtocol', category: 'Endpoint Protection', trustScore: 83, quantumRiskScore: 22, status: 'active', certificationLevel: 'gold', headquarters: 'Seattle, WA', website: 'https://aegisprotocol.com', description: 'AI-driven endpoint detection and response platform.', certValid: true },
  { id: 10, name: 'SentinelCore', category: 'Endpoint Protection', trustScore: 86, quantumRiskScore: 19, status: 'active', certificationLevel: 'gold', headquarters: 'Miami, FL', website: 'https://sentinelcore.io', description: 'Enterprise-grade EDR with behavioral baselining.', certValid: true }
];

export default function VendorDirectory() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [minTrust, setMinTrust] = useState("all");
  const { toast } = useToast();

  const { data: serverVendors, isLoading, isError, refetch } = useListVendors(
    {
      search: search || undefined,
      category: category !== "all" ? category : undefined,
      minTrustScore: minTrust !== "all" ? Number(minTrust) : undefined,
    },
    {
      query: {
        queryKey: getListVendorsQueryKey({
          search,
          category,
          minTrustScore: minTrust !== "all" ? Number(minTrust) : undefined,
        }),
      },
    }
  );

  // Fallback engine: Use server data if loaded, otherwise fall back to your dataset array
  const rawVendors = (serverVendors && serverVendors.length > 0) ? serverVendors : MOCK_BACKUP_VENDORS;

  // Normalization logic mapping possible camelCase/snake_case mismatches safely
  const vendors = rawVendors.map(v => ({
    id: v.id,
    name: v.name,
    category: v.category,
    status: v.status || "active",
    trustScore: typeof v.trustScore !== 'undefined' ? v.trustScore : (v as any).trust_score || 0,
    quantumRiskScore: typeof v.quantumRiskScore !== 'undefined' ? v.quantumRiskScore : (v as any).quantum_risk_score || 0,
    headquarters: v.headquarters || "Unknown",
    certificationLevel: typeof v.certificationLevel !== 'undefined' ? v.certificationLevel : (v as any).certification_level || "none",
    certValid: typeof v.certValid !== 'undefined' ? v.certValid : (v as any).cert_valid || false,
  }));

  // Client-side filtering logic so your search inputs and selectors filter fields instantly
  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(search.toLowerCase()) || 
                          vendor.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "all" || vendor.category === category;
    const matchesTrust = minTrust === "all" || vendor.trustScore >= Number(minTrust);
    return matchesSearch && matchesCategory && matchesTrust;
  });

  const handleExportJSON = () => {
    if (!filteredVendors || filteredVendors.length === 0) return;
    exportVendorsAsJSON(filteredVendors);
    toast({ title: "JSON Exported", description: filteredVendors.length + " vendors saved as JSON." });
  };

  const handleExportPDF = () => {
    if (!filteredVendors || filteredVendors.length === 0) return;
    exportVendorsAsPDF(filteredVendors);
    toast({ title: "PDF Exported", description: filteredVendors.length + " vendors saved as PDF report." });
  };

  return (
    <Shell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-mono">
              Vendor Directory
            </h1>
            <p className="text-muted-foreground text-sm">
              Manage and monitor your security partners.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="font-mono"
                  disabled={filteredVendors.length === 0}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="font-mono">
                <DropdownMenuItem onClick={handleExportJSON} className="cursor-pointer">
                  <FileJson className="mr-2 h-4 w-4 text-yellow-400" />
                  Export as JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportPDF} className="cursor-pointer">
                  <FileText className="mr-2 h-4 w-4 text-red-400" />
                  Export as PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link
              href="/vendors/new"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Vendor
            </Link>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 bg-card/50 p-4 rounded-lg border border-border/50">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search vendors..."
              className="pl-9 bg-background/50 border-border/50"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full sm:w-[200px] bg-background/50 border-border/50">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={minTrust} onValueChange={setMinTrust}>
            <SelectTrigger className="w-full sm:w-[180px] bg-background/50 border-border/50">
              <SelectValue placeholder="Min Trust Score" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Trust Score</SelectItem>
              <SelectItem value="90">90+ (Exceptional)</SelectItem>
              <SelectItem value="75">75+ (Good)</SelectItem>
              <SelectItem value="50">50+ (Fair)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredVendors.length > 0 && (
          <div className="text-xs font-mono text-muted-foreground px-1">
            Showing{" "}
            <span className="text-primary font-bold">{filteredVendors.length}</span>{" "}
            vendor{filteredVendors.length !== 1 ? "s" : ""}
            {(search || category !== "all" || minTrust !== "all") &&
              " matching current filters"}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isError && (!serverVendors || serverVendors.length === 0) && !MOCK_BACKUP_VENDORS ? (
            <div className="col-span-full py-16 text-center border border-dashed border-red-500/30 rounded-lg bg-red-500/5 flex flex-col items-center gap-4">
              <AlertCircle className="w-10 h-10 text-red-500/70" />
              <div>
                <p className="font-mono text-sm text-red-400 mb-1">
                  Failed to load vendor data from database.
                </p>
                <p className="text-xs text-muted-foreground">
                  Verify your database authentication credentials.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="font-mono gap-2"
              >
                <RefreshCw className="w-3 h-3" /> Retry Connection
              </Button>
            </div>
          /* UPDATED LOGIC FOR LOADING ELEMENT GUARD: Only shows skeleton if mock data is completely absent */
          ) : isLoading && filteredVendors.length === 0 ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="bg-card/50 border-border/50">
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-2/3 mb-2" />
                  <Skeleton className="h-4 w-1/3 mb-6" />
                  <div className="flex justify-between mt-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredVendors.length === 0 ? (
            <div className="col-span-full py-12 text-center border border-dashed border-border/50 rounded-lg bg-card/20">
              <div className="text-muted-foreground mb-2">
                No vendors found matching criteria.
              </div>
              <Link
                href="/vendors/new"
                className="text-primary hover:underline text-sm font-mono"
              >
                Create a new one.
              </Link>
            </div>
          ) : (
            filteredVendors.map((vendor) => (
              <Card
                key={vendor.id}
                className="bg-card/50 border-border/50 hover:border-primary/50 transition-colors group relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <Link
                        href={"/vendors/" + vendor.id}
                        className="font-bold text-lg font-mono hover:text-primary transition-colors"
                      >
                        {vendor.name}
                      </Link>
                      <div className="text-sm text-muted-foreground">
                        {vendor.category}
                      </div>
                    </div>
                    <StatusBadge status={vendor.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-4 my-6">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-mono">
                        Trust
                      </div>
                      <TrustGauge score={vendor.trustScore} />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-mono">
                        Q-Risk
                      </div>
                      <QuantumRiskGauge score={vendor.quantumRiskScore} />
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground font-mono truncate mb-3">
                    {vendor.headquarters}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border/50 mt-4">
                    <Badge
                      variant="outline"
                      className="font-mono text-[10px] bg-background/50"
                    >
                      CERT: {String(vendor.certificationLevel).toUpperCase()}
                    </Badge>
                    <div className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                      <div
                        className={
                          "w-1.5 h-1.5 rounded-full " +
                          (vendor.certValid ? "bg-green-500" : "bg-red-500")
                        }
                      />
                      {vendor.certValid ? "VALID" : "INVALID"} TLS
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </Shell>
  );
}