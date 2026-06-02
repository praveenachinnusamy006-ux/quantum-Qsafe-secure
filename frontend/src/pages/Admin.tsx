import { Shell } from "@/components/layout/Shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Server, Shield, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Admin() {
  const mockUsers = [
    { id: 1, name: "Operator Alpha", email: "alpha@q-secure.net", role: "Superadmin", status: "active" },
    { id: 2, name: "Analyst Beta", email: "beta@q-secure.net", role: "Analyst", status: "active" },
    { id: 3, name: "Agent Gamma", email: "gamma@q-secure.net", role: "Viewer", status: "offline" },
  ];

  const metrics = [
    { label: "API Latency", value: "24ms", status: "optimal" },
    { label: "Database Load", value: "14%", status: "optimal" },
    { label: "Active Connections", value: "842", status: "warning" },
  ];

  return (
    <Shell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-mono">Admin Panel</h1>
          <p className="text-muted-foreground text-sm mt-1">System configuration and operator management.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-card/50 border-border/50 md:col-span-2">
            <CardHeader>
              <CardTitle className="font-mono text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" /> Operator Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-border/50 overflow-hidden">
                <table className="w-full text-sm font-mono text-left">
                  <thead className="bg-secondary/30 text-muted-foreground border-b border-border/50">
                    <tr>
                      <th className="p-3 font-medium">Operator</th>
                      <th className="p-3 font-medium">Role</th>
                      <th className="p-3 font-medium">Status</th>
                      <th className="p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {mockUsers.map(user => (
                      <tr key={user.id} className="hover:bg-secondary/10">
                        <td className="p-3">
                          <div className="font-bold">{user.name}</div>
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                        </td>
                        <td className="p-3">{user.role}</td>
                        <td className="p-3">
                          <Badge variant={user.status === 'active' ? 'default' : 'secondary'} className="text-[10px]">
                            {user.status}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <button className="text-primary hover:underline text-xs" data-testid={`button-edit-user-${user.id}`}>Edit</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="font-mono text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" /> System Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {metrics.map((metric, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{metric.label}</span>
                    <span className={`font-mono font-bold ${metric.status === 'warning' ? 'text-orange-400' : 'text-green-400'}`}>
                      {metric.value}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="font-mono text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" /> Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Auth Enforced</span>
                  <Badge variant="outline" className="border-green-500/50 text-green-500">True</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Quantum Simulation</span>
                  <Badge variant="outline" className="border-green-500/50 text-green-500">Active</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">API Environment</span>
                  <span className="font-mono text-xs">Production</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Shell>
  );
}
