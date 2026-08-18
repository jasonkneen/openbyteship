import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Activity, KeyRound, Trash2, Upload, Webhook } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { listProjectActivity } from "@/lib/obs/actions";
import type { ActivityCategory, ActivityEvent, ActivityStatus } from "@/lib/obs/types";
import { cn, formatCompactAgo } from "@/lib/utils";

export const Route = createFileRoute("/console/$projectId/activity")({ component: ActivityPage });

const ICONS: Record<ActivityCategory, typeof KeyRound> = {
  keys: KeyRound,
  uploads: Upload,
  files: Trash2,
  webhooks: Webhook,
};

const STATUS_LABEL: Record<ActivityStatus, string> = {
  created: "Created",
  completed: "Completed",
  deleted: "Deleted",
  revoked: "Revoked",
};

function ActivityPage() {
  const { projectId } = Route.useParams();
  const [events, setEvents] = useState<ActivityEvent[] | null>(null);

  useEffect(() => {
    void listProjectActivity({ data: { projectId } })
      .then(setEvents)
      .catch((err: Error) => {
        toast.error(err.message);
        setEvents([]);
      });
  }, [projectId]);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-4xl tracking-tight">Activity</h1>

      <section className="overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-border)]">
        <div className="flex items-center gap-2 px-4 py-3">
          <Activity className="size-4 text-ok" />
          <h2 className="text-sm font-medium">Recent events</h2>
        </div>

        {events === null ? (
          <div className="h-28 animate-pulse bg-elevated" />
        ) : events.length === 0 ? (
          <p className="px-4 py-10 text-sm text-muted">No activity yet for this project.</p>
        ) : (
          <ul className="divide-y divide-border">
            {events.map((event) => {
              const Icon = ICONS[event.category] ?? Activity;
              const done = event.status === "completed";
              return (
                <li key={event.id} className="flex items-start gap-3 px-4 py-3 sm:items-center">
                  <span className="grid size-10 shrink-0 place-items-center rounded-md bg-ok/15 text-ok">
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium">{event.title}</p>
                      <Badge tone="neutral">{event.category}</Badge>
                    </div>
                    <p className="mt-0.5 truncate font-mono text-xs text-subtle">{event.detail}</p>
                  </div>
                  <p
                    className={cn(
                      "shrink-0 whitespace-nowrap pt-1 text-xs sm:pt-0",
                      done ? "text-ok" : "text-muted",
                    )}
                  >
                    {STATUS_LABEL[event.status]} {formatCompactAgo(event.createdAt)}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
