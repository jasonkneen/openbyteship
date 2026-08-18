import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/console/$projectId/settings/")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/console/$projectId/settings/usage",
      params,
    });
  },
});
