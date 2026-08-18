import { createFileRoute, Outlet } from "@tanstack/react-router";
import { ConsoleGate } from "@/components/console/console-shell";

export const Route = createFileRoute("/console")({
  component: () => (
    <ConsoleGate>
      <Outlet />
    </ConsoleGate>
  ),
});
