import { createFileRoute } from "@tanstack/react-router";
import { handleUploadTokens } from "@/lib/obs/api-handlers";

export const Route = createFileRoute("/v1/upload-tokens")({
  server: {
    handlers: {
      POST: ({ request }) => handleUploadTokens(request),
    },
  },
});
