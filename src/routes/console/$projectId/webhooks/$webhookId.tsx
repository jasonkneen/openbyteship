import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { WEBHOOK_EVENTS } from "@/lib/obs/types";
import {
  getProjectWebhook,
  resetProjectWebhookSecret,
  revokeProjectWebhook,
  updateProjectWebhook,
} from "@/lib/obs/actions";
import { cn, copyText, formatCompactAgo, formatShortDateTime } from "@/lib/utils";

export const Route = createFileRoute("/console/$projectId/webhooks/$webhookId")({
  component: WebhookDetailPage,
});

type Delivery = {
  id: string;
  webhookId: string;
  eventType: string;
  statusCode: number | null;
  success: boolean;
  createdAt: string;
  payload: string;
};

function WebhookDetailPage() {
  const { projectId, webhookId } = Route.useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("Webhook");
  const [name, setName] = useState("Webhook");
  const [url, setUrl] = useState("");
  const [events, setEvents] = useState<string[]>(["file.uploaded"]);
  const [enabled, setEnabled] = useState(true);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [lastTriggeredAt, setLastTriggeredAt] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "success" | "failed">("all");
  const [httpFilter, setHttpFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [detail, setDetail] = useState<Delivery | null>(null);

  async function reload() {
    const data = await getProjectWebhook({ data: { projectId, webhookId } });
    setTitle(data.hook.name);
    setName(data.hook.name);
    setUrl(data.hook.url);
    setEvents(data.hook.events);
    setEnabled(data.hook.enabled);
    setCreatedAt(data.hook.createdAt);
    setLastTriggeredAt(data.hook.lastTriggeredAt);
    setDeliveries(data.deliveries);
  }

  useEffect(() => {
    setLoading(true);
    setSecret(null);
    void reload()
      .catch((err: Error) => toast.error(err.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, webhookId]);

  const allSelected = WEBHOOK_EVENTS.every((event) => events.includes(event));
  const httpOptions = useMemo(() => {
    const codes = new Set<string>();
    for (const item of deliveries) {
      codes.add(item.statusCode == null ? "none" : String(item.statusCode));
    }
    return [...codes];
  }, [deliveries]);
  const typeOptions = useMemo(
    () => [...new Set(deliveries.map((item) => item.eventType))],
    [deliveries],
  );

  const filtered = deliveries.filter((item) => {
    if (statusFilter === "success" && !item.success) return false;
    if (statusFilter === "failed" && item.success) return false;
    if (httpFilter !== "all") {
      const code = item.statusCode == null ? "none" : String(item.statusCode);
      if (code !== httpFilter) return false;
    }
    if (typeFilter !== "all" && item.eventType !== typeFilter) return false;
    if (query.trim()) {
      const hay = `${item.eventType} ${item.statusCode ?? ""} ${item.payload}`.toLowerCase();
      if (!hay.includes(query.trim().toLowerCase())) return false;
    }
    return true;
  });

  async function onSave() {
    setBusy(true);
    try {
      const updated = await updateProjectWebhook({
        data: { projectId, webhookId, name, url, events, enabled },
      });
      setTitle(updated.name);
      toast.success("Changes saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save webhook");
    } finally {
      setBusy(false);
    }
  }

  async function onReset() {
    try {
      const result = await resetProjectWebhookSecret({ data: { projectId, webhookId } });
      setSecret(result.secret);
      setConfirmReset(false);
      toast.success("New signing secret generated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not reset secret");
    }
  }

  async function onDelete() {
    try {
      await revokeProjectWebhook({ data: { projectId, webhookId } });
      toast.success("Webhook deleted");
      await navigate({ to: "/console/$projectId/webhooks", params: { projectId } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete webhook");
    }
  }

  if (loading) {
    return <div className="h-64 animate-pulse rounded-xl bg-elevated" />;
  }

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
      <div className="min-w-0 space-y-6 lg:pr-8">
        <div>
          <Link
            to="/console/$projectId/webhooks"
            params={{ projectId }}
            className="inline-flex items-center gap-1 text-sm text-ok hover:underline"
          >
            <ChevronLeft className="size-4" />
            Webhooks
          </Link>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <h1 className="font-display text-4xl tracking-tight">{title}</h1>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => setConfirmReset(true)}>
                Reset Secret
              </Button>
              <Button type="button" variant="danger" size="sm" onClick={() => setConfirmDelete(true)}>
                Delete
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium">{title}</p>
            <p className="truncate font-mono text-sm text-muted">{url}</p>
          </div>
          <label className="flex items-center gap-2 text-sm text-muted">
            Enabled
            <button
              type="button"
              role="switch"
              aria-checked={enabled}
              onClick={() => setEnabled((value) => !value)}
              className={cn(
                "relative h-6 w-11 rounded-full transition-colors",
                enabled ? "bg-ok" : "bg-elevated shadow-[var(--shadow-border)]",
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 size-5 rounded-full bg-fg transition-[left]",
                  enabled ? "left-5" : "left-0.5",
                )}
              />
            </button>
          </label>
        </div>

        <div className="flex flex-col gap-2 overflow-hidden rounded-md bg-elevated shadow-[var(--shadow-border)] sm:flex-row sm:items-center">
          <p className="min-w-0 flex-1 truncate px-3 py-2.5 font-mono text-xs text-muted">
            {secret ?? "Secret is hidden. Reset to reveal a new secret."}
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="shrink-0"
            onClick={() => {
              if (!secret) {
                toast.message("Secret is hidden. Reset to reveal a new secret.");
                return;
              }
              void copyText(secret).then(() => toast.success("Secret copied"));
            }}
          >
            Copy Secret
          </Button>
        </div>

        <section className="space-y-3">
          <h2 className="font-display text-2xl tracking-tight">Deliveries</h2>
          <div className="flex flex-wrap gap-2">
            <FilterPill
              label={statusFilter === "all" ? "All statuses" : statusFilter === "success" ? "Success" : "Failed"}
              options={[
                { value: "all", label: "All statuses" },
                { value: "success", label: "Success" },
                { value: "failed", label: "Failed" },
              ]}
              onSelect={(value) => setStatusFilter(value as typeof statusFilter)}
            />
            <FilterPill
              label={httpFilter === "all" ? "All HTTP responses" : httpFilter === "none" ? "No response" : httpFilter}
              options={[
                { value: "all", label: "All HTTP responses" },
                ...httpOptions.map((code) => ({
                  value: code,
                  label: code === "none" ? "No response" : code,
                })),
              ]}
              onSelect={setHttpFilter}
            />
            <FilterPill
              label={typeFilter === "all" ? "All event types" : typeFilter}
              options={[
                { value: "all", label: "All event types" },
                ...typeOptions.map((type) => ({ value: type, label: type })),
              ]}
              onSelect={setTypeFilter}
            />
            <Input
              className="h-9 max-w-56"
              placeholder="Search deliveries"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-border)]">
            <div className="hidden grid-cols-[88px_72px_minmax(0,1.4fr)_140px_72px] gap-3 border-b border-border px-4 py-3 text-xs font-medium uppercase tracking-wider text-subtle md:grid">
              <span>Status</span>
              <span>HTTP</span>
              <span>Type</span>
              <span>Sent at</span>
              <span>Details</span>
            </div>
            {filtered.length === 0 ? (
              <p className="px-4 py-12 text-center text-sm text-muted">No Results</p>
            ) : (
              <ul className="divide-y divide-border">
                {filtered.map((item) => (
                  <li
                    key={item.id}
                    className="grid gap-1 px-4 py-3 md:grid-cols-[88px_72px_minmax(0,1.4fr)_140px_72px] md:items-center md:gap-3"
                  >
                    <Badge tone={item.success ? "ok" : "danger"}>{item.success ? "ok" : "failed"}</Badge>
                    <span className="font-mono text-xs text-muted">{item.statusCode ?? "—"}</span>
                    <span className="truncate font-mono text-xs">{item.eventType}</span>
                    <span className="text-xs text-muted">{formatCompactAgo(item.createdAt)}</span>
                    <button
                      type="button"
                      className="justify-self-start text-xs text-ok hover:underline md:justify-self-auto"
                      onClick={() => setDetail(item)}
                    >
                      View
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>

      <aside className="mt-8 space-y-5 border-t border-border pt-6 lg:sticky lg:top-6 lg:mt-0 lg:border-l lg:border-t-0 lg:pl-6">
        <h2 className="font-display text-2xl tracking-tight">Webhooks</h2>
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wider text-subtle">Name</span>
          <Input className="mt-1.5" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wider text-subtle">URL</span>
          <Input className="mt-1.5 font-mono" value={url} onChange={(e) => setUrl(e.target.value)} />
        </label>
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-subtle">Events</span>
            <button
              type="button"
              className="text-xs text-muted hover:text-fg"
              onClick={() => setEvents(allSelected ? [] : [...WEBHOOK_EVENTS])}
            >
              {allSelected ? "Clear all" : "Select all"}
            </button>
          </div>
          <div className="mt-2 space-y-2">
            {WEBHOOK_EVENTS.map((event) => {
              const on = events.includes(event);
              return (
                <label key={event} className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={() =>
                      setEvents((cur) => (on ? cur.filter((item) => item !== event) : [...cur, event]))
                    }
                    className="size-4 accent-[var(--color-ok)]"
                  />
                  <span className="font-mono text-xs">{event}</span>
                </label>
              );
            })}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 border-t border-border pt-4 text-xs text-subtle">
          <div>
            <p className="uppercase tracking-wider">Created</p>
            <p className="mt-1 text-muted">{createdAt ? formatShortDateTime(createdAt) : "—"}</p>
          </div>
          <div>
            <p className="uppercase tracking-wider">Last triggered</p>
            <p className="mt-1 text-muted">
              {lastTriggeredAt ? formatShortDateTime(lastTriggeredAt) : "—"}
            </p>
          </div>
        </div>
        <Button type="button" className="w-full" disabled={busy || !events.length} onClick={() => void onSave()}>
          {busy ? "Saving…" : "Save changes"}
        </Button>
      </aside>

      <Dialog open={Boolean(detail)} onOpenChange={(open) => !open && setDetail(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delivery</DialogTitle>
            <DialogDescription>{detail?.eventType}</DialogDescription>
          </DialogHeader>
          <pre className="mt-4 max-h-80 overflow-auto rounded-md bg-elevated p-3 font-mono text-xs leading-relaxed">
            {prettyPayload(detail?.payload)}
          </pre>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmReset} onOpenChange={setConfirmReset}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset signing secret?</AlertDialogTitle>
            <AlertDialogDescription>
              The current secret will stop working immediately. The new secret is shown once.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void onReset()}>Reset secret</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this webhook?</AlertDialogTitle>
            <AlertDialogDescription>
              Deliveries will stop immediately. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-danger text-fg hover:opacity-90" onClick={() => void onDelete()}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function FilterPill({
  label,
  options,
  onSelect,
}: {
  label: string;
  options: Array<{ value: string; label: string }>;
  onSelect: (value: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex h-9 items-center gap-1 rounded-full bg-elevated px-3 text-xs text-muted shadow-[var(--shadow-border)] hover:text-fg"
        >
          {label}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {options.map((option) => (
          <DropdownMenuItem key={option.value} onSelect={() => onSelect(option.value)}>
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function prettyPayload(raw?: string | null) {
  if (!raw) return "No payload";
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
}
