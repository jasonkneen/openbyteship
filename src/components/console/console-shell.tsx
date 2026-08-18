import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { Activity, FolderOpen, KeyRound, LayoutDashboard, Play, Settings, Webhook, Menu, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { cn } from "@/lib/utils";

const LINKS = [
  { to: "/console/$projectId", label: "Overview", icon: LayoutDashboard },
  { to: "/console/$projectId/files", label: "Files", icon: FolderOpen },
  { to: "/console/$projectId/keys", label: "API keys", icon: KeyRound },
  { to: "/console/$projectId/activity", label: "Activity", icon: Activity },
  { to: "/console/$projectId/playground", label: "Playground", icon: Play },
  { to: "/console/$projectId/webhooks", label: "Webhooks", icon: Webhook },
  { to: "/console/$projectId/settings", label: "Settings", icon: Settings },
] as const;

export function ConsoleGate({ children }: { children: ReactNode }) {
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return (
      <div className="grid min-h-screen place-items-center bg-bg text-muted">
        Loading console
      </div>
    );
  }
  if (!user) return <RedirectToSignIn to="/login" />;
  return <>{children}</>;
}

export function ConsoleShell({
  children,
  projectName,
}: {
  children: ReactNode;
  projectName?: string;
}) {
  const params = useParams({ strict: false }) as { projectId?: string };
  const projectId = params.projectId;
  const { user } = useCurrentUserState();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setOpen(false);
  }, [projectId]);

  const nav = (
    <nav className="space-y-1">
      {LINKS.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            params={{ projectId: projectId ?? "" }}
            className="flex items-center gap-2.5 rounded-sm px-3 py-2 text-sm text-muted hover:bg-elevated hover:text-fg [&.active]:bg-elevated [&.active]:text-fg"
            activeOptions={{ exact: item.to === "/console/$projectId" }}
          >
            <Icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-bg text-fg">
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-bg/90 px-4 backdrop-blur md:hidden">
        <Logo compact />
        <button
          type="button"
          className="grid size-11 place-items-center rounded-sm hover:bg-elevated"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </header>
      <div className="md:grid md:grid-cols-[240px_1fr]">
        <aside
          className={cn(
            "border-border bg-bg md:sticky md:top-0 md:flex md:h-screen md:flex-col md:border-r md:px-4 md:py-5",
            open ? "block border-b px-4 py-4" : "hidden md:flex",
          )}
        >
          <div className="mb-6 hidden md:block">
            <Logo />
          </div>
          <button
            type="button"
            className="mb-5 flex w-full items-center justify-between rounded-md bg-surface px-3 py-2 text-left text-sm shadow-[var(--shadow-border)]"
            onClick={() => void navigate({ to: "/console" })}
          >
            <span className="truncate">{projectName ?? "Projects"}</span>
            <span className="text-subtle">Switch</span>
          </button>
          {nav}
          <div className="mt-auto hidden border-t border-border pt-4 md:block">
            <p className="truncate text-sm">{user?.displayName ?? user?.primaryEmail}</p>
            <Button variant="link" size="sm" className="h-auto px-0" onClick={() => void signOut("/")}>
              Sign out
            </Button>
          </div>
        </aside>
        <main className="min-w-0 px-4 py-6 sm:px-8 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
