import {
  authenticateRequest,
  completePathUpload,
  createPathUpload,
  createSignedUrl,
  deleteFileByPath,
  getFileRow,
  mintUploadToken,
  readFileObject,
  requireScope,
  serializeFile,
  storeUploadBytes,
} from "./store";
import { ApiError, jsonError, jsonOk, readJson } from "./http";
import { requestOrigin } from "./paths";

function decodeRest(pathname: string, prefix: string) {
  const raw = pathname.startsWith(prefix) ? pathname.slice(prefix.length) : "";
  return raw
    .split("/")
    .filter(Boolean)
    .map((part) => {
      try {
        return decodeURIComponent(part);
      } catch {
        return part;
      }
    });
}

function splitFileAction(parts: string[]) {
  if (parts.length >= 2 && parts[parts.length - 1] === "complete" && parts[parts.length - 2] === "upload") {
    return { path: parts.slice(0, -2).join("/"), action: "complete" as const };
  }
  if (parts.length >= 2 && parts[parts.length - 1] === "parts" && parts[parts.length - 2] === "upload") {
    return { path: parts.slice(0, -2).join("/"), action: "parts" as const };
  }
  if (parts.length >= 1 && parts[parts.length - 1] === "signed-url") {
    return { path: parts.slice(0, -1).join("/"), action: "signed-url" as const };
  }
  return { path: parts.join("/"), action: "file" as const };
}

export async function handleFilesApi(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const { path, action } = splitFileAction(decodeRest(url.pathname, "/v1/files/"));
    if (!path) throw new ApiError(400, "invalid_path", "File path is required");
    const origin = requestOrigin(request);
    const auth = await authenticateRequest(request);

    if (request.method === "PUT" && action === "file") {
      const body = await readJson<{
        byteSize: number;
        contentType: string;
        method?: string;
        visibility?: "public" | "private";
      }>(request);
      const created = await createPathUpload(auth, path, body, origin);
      return jsonOk(created, created.replacing ? 200 : 201);
    }

    if (request.method === "POST" && action === "complete") {
      const body = await readJson<{ uploadId: string }>(request);
      if (!body.uploadId) throw new ApiError(400, "invalid_request", "uploadId is required");
      return jsonOk(await completePathUpload(auth, path, body.uploadId, origin));
    }

    if (request.method === "POST" && action === "parts") {
      throw new ApiError(
        400,
        "invalid_request",
        "Multipart part signing is not required under the demo size cap. Use method single.",
      );
    }

    if (request.method === "POST" && action === "signed-url") {
      const body = await readJson<{ expiresInSeconds?: number }>(request).catch(() => ({
        expiresInSeconds: 900,
      }));
      return jsonOk(await createSignedUrl(auth, path, body.expiresInSeconds ?? 900, origin));
    }

    if (request.method === "GET" && action === "file") {
      requireScope(auth, "files:read");
      const file = await getFileRow(auth.project.id, path);
      const accept = request.headers.get("accept") ?? "";
      if (accept.includes("application/json")) {
        return jsonOk({ file: serializeFile(file, origin, auth.project.namespace) });
      }
      if (file.status !== "ready") throw new ApiError(409, "conflict", "File is not ready");
      const bytes = await readFileObject(file.id);
      return new Response(Buffer.from(bytes), {
        headers: {
          "content-type": file.content_type,
          "content-length": String(bytes.byteLength),
          etag: file.etag ?? "",
        },
      });
    }

    if (request.method === "DELETE" && action === "file") {
      return jsonOk(await deleteFileByPath(auth, path, origin));
    }

    throw new ApiError(405, "method_not_allowed", "Method not allowed");
  } catch (err) {
    return jsonError(err);
  }
}

export async function handleUploadTokens(request: Request): Promise<Response> {
  try {
    if (request.method !== "POST") throw new ApiError(405, "method_not_allowed", "Method not allowed");
    const auth = await authenticateRequest(request);
    const body = await readJson<{
      folder?: string;
      visibility?: "public" | "private";
      maxUploadBytes?: number;
      expiresInSeconds?: number;
    }>(request);
    const minted = await mintUploadToken(auth, body);
    return jsonOk({
      uploadToken: {
        token: minted.token,
        expiresAt: minted.expiresAt,
      },
    });
  } catch (err) {
    return jsonError(err);
  }
}

export async function handleUploadBytes(request: Request, uploadId: string): Promise<Response> {
  try {
    if (request.method !== "PUT") throw new ApiError(405, "method_not_allowed", "Method not allowed");
    const buf = new Uint8Array(await request.arrayBuffer());
    const result = await storeUploadBytes(uploadId, buf, request.headers.get("content-type"));
    return jsonOk(result);
  } catch (err) {
    return jsonError(err);
  }
}
