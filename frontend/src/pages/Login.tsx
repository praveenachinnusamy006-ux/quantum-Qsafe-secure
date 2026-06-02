import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      localStorage.setItem("auth_token", "simulated-token-" + Date.now());
      setLocation("/");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="z-10 w-full max-w-md bg-card/50 backdrop-blur-xl border border-border p-8 rounded-2xl shadow-2xl"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold font-mono text-foreground tracking-tight">Q-SECURE ACCESS</h1>
          <p className="text-muted-foreground text-sm mt-2 text-center">Authenticate to access the platform</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Operator ID (Email)</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="operator@q-secure.net" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="bg-background/50 border-border font-mono h-12"
              data-testid="input-email"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Passcode</Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="bg-background/50 border-border font-mono h-12"
              data-testid="input-password"
              required
            />
          </div>
          
          <Button type="submit" className="w-full h-12 font-mono tracking-widest" data-testid="button-login">
            INITIALIZE UPLINK
          </Button>
        </form>
        
        <div className="mt-8 text-center text-xs font-mono text-muted-foreground">
          Any credential combination is valid for simulation.
        </div>
      </motion.div>
    </div>
  );
}
