import { cn } from "@/lib/utils";

export function QuantumRiskGauge({ score, className }: { score: number; className?: string }) {
  let colorClass = "text-green-500";
  if (score > 70) colorClass = "text-red-500";
  else if (score > 40) colorClass = "text-yellow-500";

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex justify-between text-xs font-mono text-slate-400">
        <span>Q-Risk</span>
        <span className={colorClass}>{score} / 100</span>
      </div>
      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
        <div 
          className={cn("h-full rounded-full transition-all duration-500", colorClass.replace("text-", "bg-"))}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
