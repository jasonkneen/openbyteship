export class ApiError extends Error {
  status: number;
  code: string;
  details?: Record<string, unknown>;

  constructor(status: number, code: string, message?: string, details?: Record<string, unknown>) {
    super(message ?? code);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function jsonError(err: unknown): Response {
  if (err instanceof ApiError) {
    return Response.json(
      { error: err.code, message: err.message, ...err.details },
      { status: err.status },
    );
  }
  const maybe = err as { status?: number; code?: string; message?: string };
  if (typeof maybe?.status === "number" && maybe.code) {
    return Response.json({ error: maybe.code, message: maybe.message }, { status: maybe.status });
  }
  console.error(err);
  return Response.json({ error: "internal_error" }, { status: 500 });
}

export function jsonOk(body: unknown, status = 200): Response {
  return Response.json(body, { status });
}

export async function readJson<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new ApiError(400, "invalid_json", "Invalid JSON");
  }
}

export function bearerToken(request: Request): string | null {
  const header = request.headers.get("authorization") ?? "";
  const match = /^Bearer\s+(.+)$/i.exec(header);
  return match?.[1]?.trim() || null;
}
