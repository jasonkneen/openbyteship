import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ConsoleShell } from "@/components/console/console-shell";
import { getProjectOverview } from "@/lib/obs/actions";

export const Route = createFileRoute("/console/$projectId")({
  component: ProjectLayout,
});

function ProjectLayout() {
  const { projectId } = Route.useParams();
  const [name, setName] = useState<string>();

  useEffect(() => {
    void getProjectOverview({ data: { projectId } })
      .then((data) => setName(data.project.name))
      .catch(() => setName("Project"));
  }, [projectId]);

  return (
    <ConsoleShell projectName={name}>
      <Outlet />
    </ConsoleShell>
  );
}
