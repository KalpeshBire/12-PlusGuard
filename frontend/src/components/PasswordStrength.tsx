import { cn } from "@/lib/utils";

interface PasswordStrengthProps {
  strength: "weak" | "medium" | "strong" | "";
}

export default function PasswordStrength({ strength }: PasswordStrengthProps) {
  const getLabel = () => {
    switch (strength) {
      case "weak": return "Weak";
      case "medium": return "Medium";
      case "strong": return "Strong";
      default: return "";
    }
  };

  const getColor = (index: number) => {
    if (!strength) return "bg-border/30";
    if (strength === "weak") return index === 0 ? "bg-destructive" : "bg-border/30";
    if (strength === "medium") return index <= 1 ? "bg-warning" : "bg-border/30";
    if (strength === "strong") return index <= 2 ? "bg-primary" : "bg-border/30";
    return "bg-border/30";
  };

  return (
    <div className="space-y-1.5 pt-1 animate-fade-in">
      <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
        <span>Password Strength</span>
        <span>{getLabel()}</span>
      </div>
      <div className="flex gap-1.5 h-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              "h-full flex-1 rounded-full transition-all duration-500",
              getColor(i)
            )}
          />
        ))}
      </div>
    </div>
  );
}
