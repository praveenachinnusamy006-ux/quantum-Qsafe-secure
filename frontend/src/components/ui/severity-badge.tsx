import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function SeverityBadge({ severity }: { severity: string }) {
  let className = "";
  
  switch (severity.toLowerCase()) {
    case "critical":
      className = "bg-red-500/20 text-red-500 hover:bg-red-500/30 border-red-500/50";
      break;
    case "high":
      className = "bg-orange-500/20 text-orange-500 hover:bg-orange-500/30 border-orange-500/50";
      break;
    case "medium":
      className = "bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30 border-yellow-500/50";
      break;
    case "low":
      className = "bg-green-500/20 text-green-500 hover:bg-green-500/30 border-green-500/50";
      break;
    case "info":
      className = "bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 border-blue-500/50";
      break;
    default:
      className = "";
  }

  return (
    <Badge variant="outline" className={cn("capitalize font-mono", className)}>
      {severity}
    </Badge>
  );
}
