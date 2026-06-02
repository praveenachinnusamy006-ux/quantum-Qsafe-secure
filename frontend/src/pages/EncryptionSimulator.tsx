import { Shell } from "@/components/layout/Shell";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Unlock, Shield, AlertTriangle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";

export default function EncryptionSimulator() {
  const [text, setText] = useState("Confidential Data");
  const [cipher, setCipher] = useState<string | null>(null);
  const [mode, setMode] = useState<"RSA" | "Kyber">("RSA");
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [quantumAttack, setQuantumAttack] = useState(false);
  
  const handleEncrypt = () => {
    setIsEncrypting(true);
    setTimeout(() => {
      setCipher(btoa(text + Date.now()).slice(0, 32));
      setIsEncrypting(false);
    }, 800);
  };

  const chartData = [
    { name: "Classical Attack", rsa: 100, kyber: 100 },
    { name: "Quantum Attack", rsa: 5, kyber: 100 }
  ];

  return (
    <Shell>
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-mono">Quantum-Safe Simulator</h1>
          <p className="text-muted-foreground text-sm mt-1">Compare classical RSA encryption against quantum-resistant Kyber.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-secondary/10 pb-4">
                <CardTitle className="font-mono text-base flex items-center gap-2">
                  <Lock className="w-4 h-4 text-primary" /> Encryption Engine
                </CardTitle>
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className={mode === "RSA" ? "text-red-400 font-bold" : "text-muted-foreground"}>RSA-2048</span>
                  <Switch 
                    checked={mode === "Kyber"} 
                    onCheckedChange={(c) => { setMode(c ? "Kyber" : "RSA"); setCipher(null); }} 
                    className="data-[state=checked]:bg-primary"
                  />
                  <span className={mode === "Kyber" ? "text-primary font-bold" : "text-muted-foreground"}>Kyber-768</span>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label className="font-mono text-xs text-muted-foreground">Input Data</Label>
                  <Input 
                    value={text} 
                    onChange={e => setText(e.target.value)} 
                    className="font-mono bg-background/50 border-border/50"
                  />
                </div>
                
                <div className="flex gap-4">
                  <Button onClick={handleEncrypt} disabled={isEncrypting || !text} className="font-mono w-32" data-testid="button-encrypt">
                    {isEncrypting ? "Processing..." : "Encrypt"}
                  </Button>
                  <Button onClick={() => setCipher(null)} variant="outline" className="font-mono w-32" disabled={!cipher} data-testid="button-decrypt">
                    Decrypt
                  </Button>
                </div>

                <div className="space-y-2 pt-4">
                  <Label className="font-mono text-xs text-muted-foreground">Ciphertext Output</Label>
                  <div className="h-24 bg-background border border-border/50 rounded-md p-4 font-mono text-sm break-all overflow-hidden relative">
                    <AnimatePresence mode="popLayout">
                      {cipher ? (
                        <motion.div 
                          key="cipher"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          className={`text-primary ${mode === "RSA" ? "text-orange-400" : "text-primary"}`}
                        >
                          {mode === "RSA" ? "0x" : "pq_"}
                          {cipher}
                          {mode === "Kyber" ? "..." : ""}
                        </motion.div>
                      ) : (
                        <motion.div key="empty" className="text-muted-foreground opacity-50">
                          Awaiting input...
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-secondary/10 pb-4">
                <CardTitle className="font-mono text-base flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-destructive" /> Threat Simulation
                </CardTitle>
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="text-muted-foreground">Enable Quantum Attack</span>
                  <Switch checked={quantumAttack} onCheckedChange={setQuantumAttack} data-testid="switch-quantum-attack" />
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-center justify-between p-4 rounded-lg bg-background border border-border/50">
                  <div className="space-y-1">
                    <div className="font-mono text-sm font-bold">Current State</div>
                    <div className="text-xs text-muted-foreground">
                      {quantumAttack ? "Quantum adversary active (Shor's Algorithm)" : "Classical adversary active"}
                    </div>
                  </div>
                  <div>
                    {mode === "RSA" && quantumAttack ? (
                      <div className="px-3 py-1 bg-red-500/20 text-red-500 rounded text-xs font-mono font-bold animate-pulse border border-red-500/30">
                        COMPROMISED
                      </div>
                    ) : (
                      <div className="px-3 py-1 bg-green-500/20 text-green-500 rounded text-xs font-mono font-bold border border-green-500/30">
                        SECURE
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-card/50 border-border/50 h-full">
              <CardHeader>
                <CardTitle className="font-mono text-sm">Security Level Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={val => `${val}%`} />
                      <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} />
                      <Bar dataKey="rsa" name="RSA-2048" fill="#f97316" radius={[4, 4, 0, 0]} barSize={30} />
                      <Bar dataKey="kyber" name="Kyber-768" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-8 text-xs text-muted-foreground space-y-4">
                  <p>
                    <strong className="text-orange-400">RSA-2048</strong> is secure against classical computers but fundamentally broken by quantum computers.
                  </p>
                  <p>
                    <strong className="text-primary">Kyber-768</strong> uses lattice-based cryptography, resisting both classical and quantum attacks.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Shell>
  );
}
