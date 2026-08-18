import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, ChevronRight, Copy, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { WEBHOOK_EVENTS } from "@/lib/obs/types";
import {
  createProjectWebhook,
  listProjectWebhooks,
} from "@/lib/obs/actions";
import { cn, copyText, formatCompactAgo } from "@/lib/utils";

export const Route = createFileRoute("/console/$projectId/webhooks")({ component: WebhooksPage });

type Hook = {
  id: string;
  name: string;
  url: string;
  events: string[];
  enabled: boolean;
  createdAt: string;
  lastTriggeredAt: string | null;
};

function WebhooksPage() {
  const { projectId } = Route.useParams();
  const [hooks, setHooks] = useState<Hook[] | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("Webhook");
  const [url, setUrl] = useState("");
  const [events, setEvents] = useState<string[]>(["file.uploaded"]);
  const [busy, setBusy] = useState(false);
  const [secret, setSecret] = useState<string | null>(null);

  async function reload() {
    const data = await listProjectWebhooks({ data: { projectId } });
    setHooks(data.hooks);
  }

  useEffect(() => {
    setCreateOpen(false);
    setSecret(null);
    void reload().catch((err: Error) => {
      toast.error(err.message);
      setHooks([]);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const allSelected = WEBHOOK_EVENTS.every((event) => events.includes(event));

  async function onCreate(event: React.FormEvent) {
    event.preventDefault();
    if (!url.trim()) {
      toast.error("Enter an endpoint URL");
      return;
    }
    if (!events.length) {
      toast.error("Select at least one event");
      return;
    }
    setBusy(true);
    try {
      const created = await createProjectWebhook({
        data: { projectId, name: name.trim() || "Webhook", url: url.trim(), events },
      });
      setSecret(created.secret);
      setCreateOpen(false);
      setName("Webhook");
      setUrl("");
      setEvents(["file.uploaded"]);
      toast.success("Webhook created.");
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create webhook");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-4xl tracking-tight">Webhooks</h1>
        <Button type="button" onClick={() => setCreateOpen(true)}>
          <Plus />
          Create webhook
        </Button>
      </div>

      {secret ? (
        <div className="flex flex-col gap-3 rounded-lg bg-ok/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-ok">Signing secret</p>
            <p className="text-xs text-muted">Store it now. It will not be shown again.</p>
          </div>
          <div className="flex min-w-0 items-center gap-2">
            <code className="min-w-0 truncate rounded-md bg-bg/50 px-3 py-2 font-mono text-xs">
              {secret}
            </code>
            <Button
              type="button"
              size="icon"
              variant="secondary"
              className="size-9 shrink-0"
              onClick={() => void copyText(secret).then(() => toast.success("Secret copied"))}
              aria-label="Copy signing secret"
            >
              <Copy />
            </Button>
          </div>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-border)]">
        {hooks === null ? (
          <div className="h-32 animate-pulse bg-elevated" />
        ) : hooks.length === 0 ? (
          <div className="grid place-items-center px-4 py-16 text-center">
            <p className="text-sm font-medium">No webhooks yet</p>
            <p className="mt-1 max-w-sm text-sm text-muted">
              Create an endpoint to start receiving project events.
            </p>
            <Button type="button" className="mt-4" onClick={() => setCreateOpen(true)}>
              <Plus />
              Create webhook
            </Button>
          </div>
        ) : (
          <>
            <div className="hidden grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_140px_36px] gap-3 border-b border-border px-4 py-3 text-xs font-medium uppercase tracking-wider text-subtle md:grid">
              <span>Name</span>
              <span>URL</span>
              <span>Last triggered</span>
              <span className="sr-only">Open</span>
            </div>
            <ul className="divide-y divide-border">
              {hooks.map((hook) => (
                <li key={hook.id}>
                  <Link
                    to="/console/$projectId/webhooks/$webhookId"
                    params={{ projectId, webhookId: hook.id }}
                    className="grid w-full grid-cols-1 items-center gap-1 px-4 py-3 text-left hover:bg-elevated/60 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_140px_36px] md:gap-3"
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      <span className="size-2 shrink-0 rounded-full bg-ok" />
                      <span className="truncate text-sm font-medium">{hook.name}</span>
                    </span>
                    <span className="truncate pl-4 font-mono text-xs text-muted md:pl-0">{hook.url}</span>
                    <span className="pl-4 text-sm text-muted md:pl-0">
                      {hook.lastTriggeredAt ? formatCompactAgo(hook.lastTriggeredAt) : "—"}
                    </span>
                    <span className="hidden justify-end text-subtle md:flex">
                      <ChevronRight className="size-4" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <Sheet
        open={createOpen}
        onOpenChange={(open) => {
          if (busy) return;
          setCreateOpen(open);
        }}
      >
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Create webhook</SheetTitle>
            <SheetDescription>Add a destination and choose which events it receives.</SheetDescription>
          </SheetHeader>
          <form className="flex min-h-0 flex-1 flex-col" onSubmit={(event) => void onCreate(event)}>
            <SheetBody className="space-y-5">
              <label className="block">
                <span className="text-xs font-medium uppercase tracking-wider text-subtle">Name</span>
                <Input className="mt-1.5" value={name} onChange={(e) => setName(e.target.value)} />
              </label>
              <label className="block">
                <span className="text-xs font-medium uppercase tracking-wider text-subtle">Endpoint URL</span>
                <Input
                  className="mt-1.5 font-mono"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/webhooks/obs"
                />
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
                      <button
                        key={event}
                        type="button"
                        onClick={() =>
                          setEvents((cur) => (on ? cur.filter((item) => item !== event) : [...cur, event]))
                        }
                        className={cn(
                          "flex h-11 w-full items-center justify-between rounded-md px-3 font-mono text-sm transition-[box-shadow,background-color] duration-150",
                          on
                            ? "bg-ok/10 text-fg ring-1 ring-ok"
                            : "bg-elevated text-muted shadow-[var(--shadow-border)] hover:text-fg",
                        )}
                      >
                        {event}
                        <span
                          className={cn(
                            "grid size-4 place-items-center rounded-xs",
                            on ? "bg-ok text-bg" : "bg-bg shadow-[var(--shadow-border)]",
                          )}
                        >
                          {on ? <Check className="size-3" /> : null}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </SheetBody>
            <SheetFooter>
              <Button type="button" variant="secondary" size="sm" disabled={busy} onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={busy || !events.length}>
                <Plus />
                {busy ? "Creating…" : "Create webhook"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
