import { createFileRoute } from "@tanstack/react-router";
import { handleUploadBytes } from "@/lib/obs/api-handlers";

export const Route = createFileRoute("/v1/uploads/$uploadId")({
  server: {
    handlers: {
      PUT: ({ request, params }) => handleUploadBytes(request, params.uploadId),
    },
  },
});
