import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/console/$projectId/settings")({
  component: SettingsLayout,
});

const TABS = [
  { to: "/console/$projectId/settings/usage", label: "Usage" },
  { to: "/console/$projectId/settings/billing", label: "Billing" },
  { to: "/console/$projectId/settings/team", label: "Team" },
] as const;

function SettingsLayout() {
  const { projectId } = Route.useParams();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <nav className="flex flex-wrap gap-1 border-b border-border pb-3">
        {TABS.map((tab) => (
          <Link
            key={tab.to}
            to={tab.to}
            params={{ projectId }}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm text-muted hover:text-fg",
              "[&.active]:bg-ok/15 [&.active]:text-ok",
            )}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
      <Outlet />
    </div>
  );
}
