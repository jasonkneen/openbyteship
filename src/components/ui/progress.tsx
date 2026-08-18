import { cn } from "@/lib/utils";

export function Progress({ value, className }: { value: number; className?: string }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("h-1.5 overflow-hidden rounded-full bg-elevated", className)}>
      <div
        className="h-full rounded-full bg-accent transition-[width] duration-200 ease-[var(--ease-out)]"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
