import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { destroyProject, getProjectOverview, updateProjectSettings } from "@/lib/obs/actions";
import { PLANS } from "@/lib/obs/plans";
import { formatBytes } from "@/lib/utils";

export const Route = createFileRoute("/console/$projectId/settings")({ component: SettingsPage });

function SettingsPage() {
  const { projectId } = Route.useParams();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [plan, setPlan] = useState("free");
  const [namespace, setNamespace] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    void getProjectOverview({ data: { projectId } }).then((data) => {
      setName(data.project.name);
      setPlan(data.project.plan);
      setNamespace(data.project.namespace);
      setLoaded(true);
    });
  }, [projectId]);

  if (!loaded) return <div className="h-40 animate-pulse rounded-xl bg-surface" />;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-subtle">Settings</p>
        <h1 className="mt-2 font-display text-4xl tracking-tight">Project</h1>
      </div>

      <form
        className="space-y-4 rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]"
        onSubmit={async (e) => {
          e.preventDefault();
          await updateProjectSettings({ data: { projectId, name } });
          toast.success("Saved");
        }}
      >
        <label className="block text-sm text-muted">
          Name
          <Input className="mt-1" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <p className="text-sm text-muted">
          Namespace <span className="font-mono text-fg">{namespace}</span> is immutable.
        </p>
        <Button type="submit">Save name</Button>
      </form>

      <div className="space-y-3 rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
        <h2 className="font-display text-2xl">Plan</h2>
        <p className="text-sm text-muted">
          Demo billing — switch plans here to unlock private uploads and higher limits. No card required.
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {PLANS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={async () => {
                setPlan(item.id);
                await updateProjectSettings({ data: { projectId, plan: item.id } });
                toast.success(`Plan set to ${item.name}`);
              }}
              className={`rounded-md p-4 text-left shadow-[var(--shadow-border)] ${
                plan === item.id ? "bg-elevated" : "bg-bg"
              }`}
            >
              <div className="flex items-baseline justify-between">
                <span>{item.name}</span>
                <span className="font-mono text-xs tabular-nums text-muted">
                  {item.price === 0 ? "$0" : `$${item.price}/mo`}
                </span>
              </div>
              <p className="mt-1 text-xs text-subtle">
                {formatBytes(item.storageBytes)} · {item.privateUploads ? "private on" : "public only"}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
        <h2 className="font-display text-2xl">Danger</h2>
        <p className="mt-2 text-sm text-muted">Deletes the project, keys, webhooks, and stored objects.</p>
        <Button
          className="mt-4"
          variant="danger"
          onClick={async () => {
            if (!confirm("Delete this project permanently?")) return;
            await destroyProject({ data: { projectId } });
            toast.success("Project deleted");
            void navigate({ to: "/console" });
          }}
        >
          Delete project
        </Button>
      </div>
    </div>
  );
}
