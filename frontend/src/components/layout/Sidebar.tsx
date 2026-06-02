import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, ShieldAlert, FileText, Settings, Shield, Cpu, Key, BrainCircuit, LogOut, Bug, FileCog } from "lucide-react";

export function Sidebar() {
  const [location, setLocation] = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    setLocation("/login");
  };

  const mainNavItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/vendors", label: "Vendor Directory", icon: Users },
    { href: "/threats", label: "Threat Analytics", icon: ShieldAlert },
    { href: "/documents", label: "Document Vault", icon: FileText },
    { href: "/doc-generator", label: "Document Generator", icon: FileCog },
  ];

  const reportNavItems = [
    { href: "/ai-threats", label: "AI Threat Dashboard", icon: BrainCircuit },
    { href: "/shor", label: "Shor Algorithm", icon: Cpu },
    { href: "/bumblebee", label: "Bumblebee Security", icon: Bug },
    { href: "/simulator", label: "Encryption Simulator", icon: Key },
    { href: "/admin", label: "Admin Panel", icon: Settings },
  ];

  return (
    <div className="w-64 bg-card border-r border-border min-h-screen flex flex-col hidden md:flex relative z-10">
      <div className="h-16 flex items-center px-6 border-b border-border">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Shield className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg tracking-tight font-mono text-primary">Q-SECURE</span>
        </Link>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-6 overflow-y-auto">
        <div className="space-y-1">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">
            Operations
          </div>
          {mainNavItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="space-y-1">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">
            Reports & Tools
          </div>
          {reportNavItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between px-3 py-2 text-sm font-medium text-muted-foreground">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
              <span className="text-xs font-bold text-foreground">OP</span>
            </div>
            <div>
              <div className="text-foreground">Operator Alpha</div>
              <div className="text-xs text-primary font-mono">L4 Clearance</div>
            </div>
          </div>
          <button onClick={handleLogout} className="text-muted-foreground hover:text-destructive transition-colors" title="Log out">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
