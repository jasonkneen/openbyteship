import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createMyProject, listMyProjects } from "@/lib/obs/actions";
import { signOut } from "@/lib/auth/client";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { toast } from "sonner";

export const Route = createFileRoute("/console/")({ component: Picker });

type Project = { id: string; name: string; namespace: string; plan: string };

function Picker() {
  const user = useCurrentUser();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void listMyProjects()
      .then(setProjects)
      .catch(() => setProjects([]));
  }, []);

  async function onCreate(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      const project = await createMyProject({ data: { name } });
      toast.success("Project created");
      void navigate({ to: "/console/$projectId", params: { projectId: project.id } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create project");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between">
          <Logo />
          <Button variant="ghost" size="sm" onClick={() => void signOut("/")}>
            Sign out
          </Button>
        </div>
        <p className="mt-10 text-xs uppercase tracking-[0.22em] text-subtle">Console</p>
        <h1 className="mt-2 font-display text-4xl tracking-tight md:text-5xl">Pick your fighter</h1>
        <p className="mt-3 text-muted">
          {user?.displayName ? `${user.displayName}, choose` : "Choose"} a project or stand up a new one.
        </p>

        <div className="mt-10 grid gap-3">
          {projects === null ? (
            <div className="h-24 animate-pulse rounded-xl bg-surface" />
          ) : projects.length === 0 ? (
            <div className="rounded-xl bg-surface p-6 text-sm text-muted shadow-[var(--shadow-border)]">
              No projects yet. Create one to get a namespace, API keys, and a file store.
            </div>
          ) : (
            projects.map((project) => (
              <button
                key={project.id}
                type="button"
                className="flex items-center justify-between rounded-xl bg-surface px-5 py-4 text-left shadow-[var(--shadow-border)] transition-shadow hover:shadow-[var(--shadow-border-hover)]"
                onClick={() =>
                  void navigate({ to: "/console/$projectId", params: { projectId: project.id } })
                }
              >
                <div>
                  <p className="text-base font-medium">{project.name}</p>
                  <p className="font-mono text-xs text-subtle">{project.namespace}</p>
                </div>
                <span className="text-xs uppercase tracking-wider text-muted">{project.plan}</span>
              </button>
            ))
          )}
        </div>

        <form onSubmit={onCreate} className="mt-10 rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
          <label className="text-sm text-muted" htmlFor="project-name">
            New project
          </label>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <Input
              id="project-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Launch pad"
              required
            />
            <Button type="submit" disabled={busy}>
              {busy ? "Creating" : "Create project"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
