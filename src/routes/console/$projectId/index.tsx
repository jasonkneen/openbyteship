import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getProjectOverview } from "@/lib/obs/actions";
import { getPlan } from "@/lib/obs/plans";
import { formatBytes } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/console/$projectId/")({ component: Overview });

function Overview() {
  const { projectId } = Route.useParams();
  const [data, setData] = useState<Awaited<ReturnType<typeof getProjectOverview>> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void getProjectOverview({ data: { projectId } })
      .then(setData)
      .catch((err: Error) => setError(err.message));
  }, [projectId]);

  if (error) return <p className="text-danger">{error}</p>;
  if (!data) return <div className="h-40 animate-pulse rounded-xl bg-surface" />;

  const plan = getPlan(data.project.plan);
  const storagePct = plan.storageBytes ? (data.usage.storageBytes / plan.storageBytes) * 100 : 0;
  const bandPct = plan.bandwidthBytes ? (data.usage.bandwidthBytes / plan.bandwidthBytes) * 100 : 0;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-subtle">Overview</p>
        <h1 className="mt-2 font-display text-4xl tracking-tight">{data.project.name}</h1>
        <p className="mt-2 font-mono text-sm text-muted">{data.project.namespace}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Files" value={String(data.usage.fileCount)} />
        <Stat
          label="Storage"
          value={formatBytes(data.usage.storageBytes)}
          hint={`${Math.min(100, Math.round(storagePct))}% of ${formatBytes(plan.storageBytes)}`}
          pct={storagePct}
        />
        <Stat
          label="Bandwidth"
          value={formatBytes(data.usage.bandwidthBytes)}
          hint={`${Math.min(100, Math.round(bandPct))}% of ${formatBytes(plan.bandwidthBytes)}`}
          pct={bandPct}
        />
      </div>
      <div className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
        <p className="text-sm text-muted">
          Plan <span className="text-fg">{plan.name}</span> · {formatBytes(plan.maxUploadBytes)} max upload ·{" "}
          {plan.privateUploads ? "private files enabled" : "public files only"}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild size="sm">
            <Link to="/console/$projectId/playground" params={{ projectId }}>
              Open playground
            </Link>
          </Button>
          <Button asChild size="sm" variant="secondary">
            <Link to="/console/$projectId/keys" params={{ projectId }}>
              API keys
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  pct,
}: {
  label: string;
  value: string;
  hint?: string;
  pct?: number;
}) {
  return (
    <div className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
      <p className="text-xs uppercase tracking-wider text-subtle">{label}</p>
      <p className="mt-2 font-mono text-2xl tabular-nums">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
      {pct != null ? <Progress className="mt-3" value={pct} /> : null}
    </div>
  );
}
