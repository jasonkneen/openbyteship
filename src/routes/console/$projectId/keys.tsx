import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, ChevronUp, Copy, KeyRound, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { createProjectKey, getProjectOverview, listProjectKeys, revokeProjectKey } from "@/lib/obs/actions";
import { cn, copyText, formatDate } from "@/lib/utils";

export const Route = createFileRoute("/console/$projectId/keys")({ component: KeysPage });

const SCOPES = ["files:read", "files:write", "files:delete"] as const;

type KeyRow = {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  createdAt: string;
  lastUsedAt: string | null;
};

function KeysPage() {
  const { projectId } = Route.useParams();
  const [keys, setKeys] = useState<KeyRow[] | null>(null);
  const [projectName, setProjectName] = useState("this project");
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("Server key");
  const [scopes, setScopes] = useState<string[]>(["files:read", "files:write"]);
  const [busy, setBusy] = useState(false);
  const [revealed, setRevealed] = useState<string | null>(null);
  const [revokeId, setRevokeId] = useState<string | null>(null);

  async function reload() {
    const [list, overview] = await Promise.all([
      listProjectKeys({ data: { projectId } }),
      getProjectOverview({ data: { projectId } }),
    ]);
    setKeys(list);
    setProjectName(overview.project.name);
  }

  useEffect(() => {
    setCreateOpen(false);
    setRevealed(null);
    setRevokeId(null);
    void reload().catch((err: Error) => toast.error(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  async function onCreate(event: React.FormEvent) {
    event.preventDefault();
    if (!scopes.length) {
      toast.error("Select at least one scope");
      return;
    }
    setBusy(true);
    try {
      const created = await createProjectKey({
        data: { projectId, name: name.trim() || "Server key", scopes },
      });
      setRevealed(created.token);
      setCreateOpen(false);
      setName("Server key");
      setScopes(["files:read", "files:write"]);
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create key");
    } finally {
      setBusy(false);
    }
  }

  async function onRevoke() {
    if (!revokeId) return;
    try {
      await revokeProjectKey({ data: { projectId, keyId: revokeId } });
      toast.success("Key revoked");
      setRevokeId(null);
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not revoke key");
    }
  }

  const allSelected = SCOPES.every((scope) => scopes.includes(scope));
  const revokeTarget = keys?.find((key) => key.id === revokeId) ?? null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-4xl tracking-tight">API Keys</h1>
        <Button type="button" onClick={() => setCreateOpen(true)}>
          <KeyRound />
          Create key
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-border)]">
        <div className="hidden grid-cols-[minmax(0,1.4fr)_140px_88px_120px_40px] gap-3 border-b border-border px-4 py-3 text-xs font-medium uppercase tracking-wider text-subtle md:grid">
          <span>Key</span>
          <span>Created</span>
          <span>Scopes</span>
          <span>Last used</span>
          <span className="sr-only">Actions</span>
        </div>
        {keys === null ? (
          <div className="h-24 animate-pulse bg-elevated" />
        ) : keys.length === 0 ? (
          <p className="px-4 py-8 text-sm text-muted">No keys yet for {projectName}.</p>
        ) : (
          <ul className="divide-y divide-border">
            {keys.map((key) => (
              <li
                key={key.id}
                className="grid gap-2 px-4 py-3 md:grid-cols-[minmax(0,1.4fr)_140px_88px_120px_40px] md:items-center md:gap-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{key.name}</p>
                  <p className="truncate font-mono text-xs text-subtle">{key.prefix}</p>
                </div>
                <p className="text-sm text-muted">
                  <span className="mr-2 text-xs uppercase tracking-wider text-subtle md:hidden">Created</span>
                  {formatDate(key.createdAt)}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-wider text-subtle md:hidden">Scopes</span>
                  <span className="inline-flex size-7 items-center justify-center rounded-full bg-ok/15 text-xs font-medium text-ok">
                    {key.scopes.filter(Boolean).length}
                  </span>
                </div>
                <p className="text-sm text-muted">
                  <span className="mr-2 text-xs uppercase tracking-wider text-subtle md:hidden">Last used</span>
                  {key.lastUsedAt ? formatDate(key.lastUsedAt) : "Never"}
                </p>
                <div className="flex justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="grid size-9 place-items-center rounded-sm text-muted hover:bg-elevated hover:text-fg"
                        aria-label={`Actions for ${key.name}`}
                      >
                        <MoreHorizontal className="size-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="text-danger focus:bg-danger/10"
                        onSelect={() => setRevokeId(key.id)}
                      >
                        Revoke
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          if (busy) return;
          setCreateOpen(open);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New API key</DialogTitle>
            <DialogDescription>
              Create a project-scoped key for {projectName} with only the permissions this client needs.
            </DialogDescription>
          </DialogHeader>
          <form className="mt-5 space-y-4" onSubmit={(event) => void onCreate(event)}>
            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wider text-subtle">Key name</span>
              <Input
                className="mt-1.5"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Server key"
                autoFocus
              />
            </label>

            <div className="rounded-lg bg-bg/40 p-3 shadow-[var(--shadow-border)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Scopes</p>
                  <p className="text-xs text-subtle">
                    {scopes.length} selected
                  </p>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-xs text-muted hover:text-fg"
                  onClick={() => setScopes(allSelected ? [] : [...SCOPES])}
                >
                  {allSelected ? "Clear all" : "Select all"}
                  <ChevronUp className="size-3.5" />
                </button>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {SCOPES.map((scope) => {
                  const on = scopes.includes(scope);
                  return (
                    <button
                      key={scope}
                      type="button"
                      onClick={() =>
                        setScopes((cur) => (on ? cur.filter((item) => item !== scope) : [...cur, scope]))
                      }
                      className={cn(
                        "flex h-11 items-center justify-between rounded-md px-3 font-mono text-xs transition-[box-shadow,background-color] duration-150",
                        on
                          ? "bg-ok/10 text-fg ring-1 ring-ok"
                          : "bg-elevated text-muted shadow-[var(--shadow-border)] hover:text-fg",
                      )}
                    >
                      {scope}
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

            <DialogFooter>
              <Button type="button" variant="secondary" size="sm" disabled={busy} onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={busy || !scopes.length}>
                {busy ? "Creating…" : "Create key"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(revealed)} onOpenChange={(open) => !open && setRevealed(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-ok">API key created</p>
            <DialogTitle className="mt-2">Save this key now</DialogTitle>
            <DialogDescription>
              OpenByteShip only stores the key prefix and hash after creation. You will not be able to view the
              full key again.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-5 rounded-lg bg-bg/50 px-4 py-3 shadow-[var(--shadow-border)]">
            <p className="text-xs font-medium uppercase tracking-wider text-subtle">Secret key</p>
            <p className="mt-1 break-all font-mono text-sm">{revealed}</p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                if (!revealed) return;
                void copyText(revealed).then(() => toast.success("Key copied"));
              }}
            >
              <Copy />
              Copy key
            </Button>
            <Button type="button" size="sm" onClick={() => setRevealed(null)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(revokeId)} onOpenChange={(open) => !open && setRevokeId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke this key?</AlertDialogTitle>
            <AlertDialogDescription>
              {revokeTarget
                ? `${revokeTarget.name} (${revokeTarget.prefix}) will stop working immediately.`
                : "This key will stop working immediately."}{" "}
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-danger text-fg hover:opacity-90" onClick={() => void onRevoke()}>
              Revoke
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
