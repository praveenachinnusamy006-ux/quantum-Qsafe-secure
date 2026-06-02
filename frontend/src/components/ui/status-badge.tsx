import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: string }) {
  let variant: "default" | "secondary" | "destructive" | "outline" = "default";
  
  switch (status.toLowerCase()) {
    case "active":
      variant = "default";
      break;
    case "under-review":
      variant = "secondary";
      break;
    case "suspended":
      variant = "destructive";
      break;
    default:
      variant = "outline";
  }

  return <Badge variant={variant} className="capitalize">{status.replace("-", " ")}</Badge>;
}
