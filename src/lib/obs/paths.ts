const PATH_MAX = 512;
const SEGMENT = /^[A-Za-z0-9._~()-]+$/;

export function normalizePath(raw: string): string {
  const trimmed = raw.trim().replace(/^\/+/, "").replace(/\/+/g, "/");
  if (!trimmed) throw badPath("File path is required");
  if (trimmed.length > PATH_MAX) throw badPath("File path is too long");
  const parts = trimmed.split("/");
  if (parts.some((p) => !p || p === "." || p === ".." || !SEGMENT.test(p))) {
    throw badPath("Invalid file path");
  }
  return trimmed;
}

export function filenameFromPath(path: string): string {
  return path.split("/").pop() || path;
}

export function publicUrl(origin: string, namespace: string, path: string): string {
  return `${origin}/f/${namespace}/${path}`;
}

export function requestOrigin(request: Request): string {
  const url = new URL(request.url);
  const proto = request.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? url.host;
  return `${proto}://${host}`;
}

export function encodePath(path: string): string {
  return path.split("/").map(encodeURIComponent).join("/");
}

function badPath(message: string) {
  const err = new Error(message) as Error & { status: number; code: string };
  err.status = 400;
  err.code = "invalid_path";
  return err;
}
