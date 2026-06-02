import { Sidebar } from "./Sidebar";
import { ReactNode, useEffect, useState } from "react";
import { Bell, Moon, Sun } from "lucide-react";

export function Shell({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      setTheme("dark");
    }
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === "dark" ? "light" : "dark");
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col relative">
        <header className="h-16 border-b border-border flex items-center justify-between px-8 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
              System Online // Secure Connection
            </span>
          </div>
          <div className="flex items-center gap-4 text-muted-foreground">
            <button onClick={toggleTheme} className="hover:text-foreground transition-colors p-2" data-testid="button-theme-toggle">
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button className="hover:text-foreground transition-colors p-2 relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-2 w-2 h-2 bg-primary rounded-full"></span>
            </button>
          </div>
        </header>
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
