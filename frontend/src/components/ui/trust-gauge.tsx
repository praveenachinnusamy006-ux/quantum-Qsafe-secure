import { cn } from "@/lib/utils";

export function TrustGauge({ score, className }: { score: number; className?: string }) {
  let colorClass = "text-green-500";
  if (score < 50) colorClass = "text-red-500";
  else if (score < 80) colorClass = "text-yellow-500";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative h-12 w-12 flex items-center justify-center rounded-full bg-slate-800 border border-slate-700">
        <svg className="absolute inset-0 h-full w-full -rotate-90 transform" viewBox="0 0 36 36">
          <path
            className="text-slate-700"
            strokeDasharray="100, 100"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            strokeWidth="3"
            stroke="currentColor"
          />
          <path
            className={colorClass}
            strokeDasharray={`${score}, 100`}
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            strokeWidth="3"
            stroke="currentColor"
          />
        </svg>
        <span className={cn("text-xs font-bold font-mono", colorClass)}>{score}</span>
      </div>
    </div>
  );
}
