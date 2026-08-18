import { createFileRoute } from "@tanstack/react-router";
import { handleFilesApi } from "@/lib/obs/api-handlers";

export const Route = createFileRoute("/v1/files/$")({
  server: {
    handlers: {
      GET: ({ request }) => handleFilesApi(request),
      PUT: ({ request }) => handleFilesApi(request),
      POST: ({ request }) => handleFilesApi(request),
      DELETE: ({ request }) => handleFilesApi(request),
    },
  },
});
