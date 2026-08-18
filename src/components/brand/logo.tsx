import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-7", className)} aria-hidden="true">
      <rect width="32" height="32" rx="7" className="fill-elevated" />
      <path d="M6 20.5 L16 8.5 L26 20.5 H21.2 L16 14.4 L10.8 20.5 Z" className="fill-accent" />
      <rect x="8.5" y="22.2" width="15" height="1.6" rx="0.6" className="fill-accent" />
    </svg>
  );
}

export function Logo({ compact = false, to = "/" }: { compact?: boolean; to?: string }) {
  return (
    <Link to={to} className="flex items-center gap-2.5 text-fg no-underline">
      <Mark />
      {compact ? null : (
        <span className="font-display text-lg tracking-tight">
          OpenByteShip
        </span>
      )}
    </Link>
  );
}
