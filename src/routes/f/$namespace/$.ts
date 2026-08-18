import { createFileRoute } from "@tanstack/react-router";
import { bumpUsage, getFileRow, getProjectByNamespace, readFileObject, verifySignedToken } from "@/lib/obs/store";
import { jsonError } from "@/lib/obs/http";
import { ApiError } from "@/lib/obs/http";

export const Route = createFileRoute("/f/$namespace/$")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        try {
          const url = new URL(request.url);
          const rest = url.pathname.replace(`/f/${params.namespace}/`, "");
          const path = rest
            .split("/")
            .filter(Boolean)
            .map((part) => {
              try {
                return decodeURIComponent(part);
              } catch {
                return part;
              }
            })
            .join("/");
          if (!path) throw new ApiError(404, "not_found", "File not found");
          const project = await getProjectByNamespace(params.namespace);
          const file = await getFileRow(project.id, path);
          if (file.status !== "ready") throw new ApiError(404, "not_found", "File not found");
          if (file.visibility === "private") {
            const ok = await verifySignedToken(project, path, url.searchParams.get("token"));
            if (!ok) throw new ApiError(403, "forbidden", "Signed URL required");
          }
          const bytes = await readFileObject(file.id);
          await bumpUsage(project.id, 0, bytes.byteLength);
          return new Response(Buffer.from(bytes), {
            headers: {
              "content-type": file.content_type || "application/octet-stream",
              "content-length": String(bytes.byteLength),
              "cache-control":
                file.visibility === "public"
                  ? "public, max-age=31536000, immutable"
                  : "private, max-age=60",
              etag: file.etag ?? "",
            },
          });
        } catch (err) {
          return jsonError(err);
        }
      },
    },
  },
});
