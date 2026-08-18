import { getSql } from "@/lib/db";
import { getPlan, DEMO_HARD_CAP_BYTES, type Plan } from "./plans";
import {
  generateSecretToken,
  hmacSha256Hex,
  randomId,
  randomNamespace,
  sha256Hex,
  timingSafeEqual,
} from "./ids";
import { filenameFromPath, normalizePath, publicUrl } from "./paths";
import { readImageMetadata } from "./image-meta";
import { ApiError } from "./http";
import type { ActivityCategory, ActivityEvent, ActivityStatus, FileMetadata, FileRecord, Visibility } from "./types";

export type ProjectRow = {
  id: string;
  user_id: string;
  name: string;
  namespace: string;
  plan: string;
  signing_secret: string;
  created_at: string;
};

export type FileRow = {
  id: string;
  project_id: string;
  path: string;
  filename: string;
  content_type: string;
  byte_size: number;
  visibility: Visibility;
  status: string;
  etag: string | null;
  metadata: unknown;
  created_at: string;
  updated_at: string;
};

export type AuthContext = {
  project: ProjectRow;
  scopes: Set<string>;
  kind: "api_key" | "upload_token";
  folder?: string | null;
  visibility?: Visibility;
  maxUploadBytes?: number;
};

function asNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  return 0;
}

function parseMetadata(raw: unknown): FileMetadata {
  if (!raw) return {};
  let obj: Record<string, unknown> = {};
  if (typeof raw === "string") {
    try {
      obj = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return {};
    }
  } else if (typeof raw === "object") {
    obj = raw as Record<string, unknown>;
  }
  const image = obj.image;
  if (image && typeof image === "object") {
    const img = image as Record<string, unknown>;
    return {
      image: {
        width: typeof img.width === "number" ? img.width : undefined,
        height: typeof img.height === "number" ? img.height : undefined,
        dominantColor: typeof img.dominantColor === "string" ? img.dominantColor : undefined,
        thumbhash: typeof img.thumbhash === "string" ? img.thumbhash : undefined,
      },
    };
  }
  return {};
}

function toBuffer(bytes: Uint8Array): Buffer {
  return Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength);
}

export function serializeFile(file: FileRow, origin: string, namespace: string): FileRecord {
  const ready = file.status === "ready";
  const url =
    ready && file.visibility === "public" ? publicUrl(origin, namespace, file.path) : null;
  return {
    id: file.id,
    filename: file.filename,
    path: file.path,
    url,
    visibility: file.visibility,
    status: file.status as FileRecord["status"],
    byteSize: asNumber(file.byte_size),
    contentType: file.content_type,
    etag: file.etag,
    metadata: parseMetadata(file.metadata),
    createdAt: file.created_at,
  };
}

export async function listProjectsForUser(userId: string): Promise<ProjectRow[]> {
  const sql = await getSql();
  return sql<ProjectRow>`
    select id, user_id, name, namespace, plan, signing_secret, created_at
    from obs_projects
    where user_id = ${userId}
    order by created_at desc
  `;
}

export async function createProject(userId: string, name: string): Promise<ProjectRow> {
  const sql = await getSql();
  const id = randomId("prj");
  const namespace = randomNamespace();
  const signing = generateSecretToken("sk", 24);
  const rows = await sql<ProjectRow>`
    insert into obs_projects (id, user_id, name, namespace, plan, signing_secret)
    values (${id}, ${userId}, ${name}, ${namespace}, ${"free"}, ${signing})
    returning id, user_id, name, namespace, plan, signing_secret, created_at
  `;
  const project = rows[0]!;
  await sql`insert into obs_usage (project_id, bandwidth_bytes, operations) values (${project.id}, 0, 0)`;
  return project;
}

export async function getProjectForUser(userId: string, projectId: string): Promise<ProjectRow> {
  const sql = await getSql();
  const rows = await sql<ProjectRow>`
    select id, user_id, name, namespace, plan, signing_secret, created_at
    from obs_projects
    where id = ${projectId} and user_id = ${userId}
  `;
  const project = rows[0];
  if (!project) throw new ApiError(404, "not_found", "Project not found");
  return project;
}

export async function getProjectById(projectId: string): Promise<ProjectRow> {
  const sql = await getSql();
  const rows = await sql<ProjectRow>`
    select id, user_id, name, namespace, plan, signing_secret, created_at
    from obs_projects
    where id = ${projectId}
  `;
  const project = rows[0];
  if (!project) throw new ApiError(404, "not_found", "Project not found");
  return project;
}

export async function getProjectByNamespace(namespace: string): Promise<ProjectRow> {
  const sql = await getSql();
  const rows = await sql<ProjectRow>`
    select id, user_id, name, namespace, plan, signing_secret, created_at
    from obs_projects
    where namespace = ${namespace}
  `;
  const project = rows[0];
  if (!project) throw new ApiError(404, "not_found", "Project not found");
  return project;
}

export async function renameProject(userId: string, projectId: string, name: string): Promise<ProjectRow> {
  const project = await getProjectForUser(userId, projectId);
  const sql = await getSql();
  const rows = await sql<ProjectRow>`
    update obs_projects set name = ${name} where id = ${project.id}
    returning id, user_id, name, namespace, plan, signing_secret, created_at
  `;
  return rows[0]!;
}

export async function setProjectPlan(userId: string, projectId: string, plan: string): Promise<ProjectRow> {
  const project = await getProjectForUser(userId, projectId);
  getPlan(plan);
  const sql = await getSql();
  const rows = await sql<ProjectRow>`
    update obs_projects set plan = ${plan} where id = ${project.id}
    returning id, user_id, name, namespace, plan, signing_secret, created_at
  `;
  return rows[0]!;
}

export async function deleteProject(userId: string, projectId: string): Promise<void> {
  const project = await getProjectForUser(userId, projectId);
  const sql = await getSql();
  await sql`delete from obs_projects where id = ${project.id}`;
}

export async function authenticateRequest(request: Request): Promise<AuthContext> {
  const { bearerToken } = await import("./http");
  const token = bearerToken(request);
  if (!token) throw new ApiError(401, "unauthorized", "Missing bearer token");
  return authenticateToken(token);
}

export async function authenticateToken(token: string): Promise<AuthContext> {
  const sql = await getSql();
  const hash = await sha256Hex(token);
  if (token.startsWith("obut_")) {
    const rows = await sql<{
      id: string;
      project_id: string;
      folder: string | null;
      visibility: Visibility;
      max_upload_bytes: number;
      expires_at: string;
    }>`
      select id, project_id, folder, visibility, max_upload_bytes, expires_at
      from obs_upload_tokens
      where token_hash = ${hash}
    `;
    const row = rows[0];
    if (!row) throw new ApiError(401, "unauthorized", "Invalid upload token");
    if (new Date(row.expires_at).getTime() < Date.now()) {
      throw new ApiError(401, "unauthorized", "Upload token expired");
    }
    const project = await getProjectById(row.project_id);
    return {
      project,
      scopes: new Set(["files:write"]),
      kind: "upload_token",
      folder: row.folder,
      visibility: row.visibility,
      maxUploadBytes: asNumber(row.max_upload_bytes),
    };
  }
  if (token.startsWith("obshp_")) {
    const rows = await sql<{
      id: string;
      project_id: string;
      scopes: string;
    }>`
      select id, project_id, scopes from obs_api_keys where key_hash = ${hash}
    `;
    const row = rows[0];
    if (!row) throw new ApiError(401, "unauthorized", "Invalid API key");
    await sql`update obs_api_keys set last_used_at = now() where id = ${row.id}`;
    const project = await getProjectById(row.project_id);
    return {
      project,
      scopes: new Set(row.scopes.split(",").filter(Boolean)),
      kind: "api_key",
    };
  }
  throw new ApiError(401, "unauthorized", "Malformed bearer token");
}

export function requireScope(auth: AuthContext, scope: string) {
  if (!auth.scopes.has(scope)) {
    throw new ApiError(403, "forbidden", "Insufficient scope", { required: scope });
  }
}

export async function createApiKey(
  userId: string,
  projectId: string,
  name: string,
  scopes: string[],
) {
  const project = await getProjectForUser(userId, projectId);
  const raw = generateSecretToken("obshp", 24);
  const hash = await sha256Hex(raw);
  const prefix = raw.slice(0, 12);
  const id = randomId("key");
  const sql = await getSql();
  await sql`
    insert into obs_api_keys (id, project_id, name, prefix, key_hash, scopes)
    values (${id}, ${project.id}, ${name}, ${prefix}, ${hash}, ${scopes.join(",")})
  `;
  await recordActivity(project.id, {
    category: "keys",
    title: "API key created",
    detail: `${name} / ${prefix}`,
    status: "created",
    sourceId: id,
  });
  return { id, name, prefix, scopes, token: raw, createdAt: new Date().toISOString() };
}

export async function listApiKeys(userId: string, projectId: string) {
  const project = await getProjectForUser(userId, projectId);
  const sql = await getSql();
  return sql<{
    id: string;
    name: string;
    prefix: string;
    scopes: string;
    created_at: string;
    last_used_at: string | null;
  }>`
    select id, name, prefix, scopes, created_at, last_used_at
    from obs_api_keys
    where project_id = ${project.id}
    order by created_at desc
  `;
}

export async function deleteApiKey(userId: string, projectId: string, keyId: string) {
  const project = await getProjectForUser(userId, projectId);
  const sql = await getSql();
  const existing = await sql<{ name: string; prefix: string }>`
    select name, prefix from obs_api_keys where id = ${keyId} and project_id = ${project.id}
  `;
  await sql`delete from obs_api_keys where id = ${keyId} and project_id = ${project.id}`;
  const key = existing[0];
  if (key) {
    await recordActivity(project.id, {
      category: "keys",
      title: "API key revoked",
      detail: `${key.name} / ${key.prefix}`,
      status: "revoked",
      sourceId: keyId,
    });
  }
}

export async function mintUploadToken(
  authOrUser: AuthContext | { userId: string; projectId: string },
  input: {
    folder?: string;
    visibility?: Visibility;
    maxUploadBytes?: number;
    expiresInSeconds?: number;
  },
) {
  let project: ProjectRow;
  if ("project" in authOrUser) {
    requireScope(authOrUser, "files:write");
    project = authOrUser.project;
  } else {
    project = await getProjectForUser(authOrUser.userId, authOrUser.projectId);
  }
  const plan = getPlan(project.plan);
  const visibility = input.visibility ?? "public";
  if (visibility === "private" && !plan.privateUploads) {
    throw new ApiError(403, "private_uploads_unavailable", "Private uploads require a paid plan");
  }
  const expiresIn = Math.min(3600, Math.max(60, input.expiresInSeconds ?? 900));
  const maxBytes = Math.min(
    plan.maxUploadBytes,
    DEMO_HARD_CAP_BYTES,
    input.maxUploadBytes ?? plan.maxUploadBytes,
  );
  const folder = input.folder ? normalizePath(input.folder) : null;
  const raw = generateSecretToken("obut", 24);
  const hash = await sha256Hex(raw);
  const id = randomId("ut");
  const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();
  const sql = await getSql();
  await sql`
    insert into obs_upload_tokens (id, project_id, token_hash, folder, visibility, max_upload_bytes, expires_at)
    values (${id}, ${project.id}, ${hash}, ${folder}, ${visibility}, ${maxBytes}, ${expiresAt})
  `;
  return { token: raw, expiresAt, folder, visibility, maxUploadBytes: maxBytes };
}

export async function usageForProject(projectId: string) {
  const sql = await getSql();
  const usage = await sql<{ bandwidth_bytes: number; operations: number }>`
    select bandwidth_bytes, operations from obs_usage where project_id = ${projectId}
  `;
  const storage = await sql<{ total: number }>`
    select coalesce(sum(byte_size), 0)::bigint as total
    from obs_files
    where project_id = ${projectId} and status = 'ready'
  `;
  const counts = await sql<{ total: number }>`
    select count(*)::int as total from obs_files
    where project_id = ${projectId} and status = 'ready'
  `;
  return {
    storageBytes: asNumber(storage[0]?.total),
    bandwidthBytes: asNumber(usage[0]?.bandwidth_bytes),
    operations: asNumber(usage[0]?.operations),
    fileCount: asNumber(counts[0]?.total),
  };
}

export async function bumpUsage(projectId: string, ops = 1, bandwidth = 0) {
  const sql = await getSql();
  await sql`
    update obs_usage
    set operations = operations + ${ops},
        bandwidth_bytes = bandwidth_bytes + ${bandwidth}
    where project_id = ${projectId}
  `;
}

export async function listFiles(userId: string, projectId: string, prefix?: string) {
  const project = await getProjectForUser(userId, projectId);
  const sql = await getSql();
  const rows = prefix
    ? await sql<FileRow>`
        select id, project_id, path, filename, content_type, byte_size, visibility, status, etag, metadata, created_at, updated_at
        from obs_files
        where project_id = ${project.id} and status <> 'deleted' and path like ${`${prefix}%`}
        order by path asc
      `
    : await sql<FileRow>`
        select id, project_id, path, filename, content_type, byte_size, visibility, status, etag, metadata, created_at, updated_at
        from obs_files
        where project_id = ${project.id} and status <> 'deleted'
        order by created_at desc
      `;
  return { project, files: rows };
}

export async function getFileRow(projectId: string, path: string): Promise<FileRow> {
  const sql = await getSql();
  const rows = await sql<FileRow>`
    select id, project_id, path, filename, content_type, byte_size, visibility, status, etag, metadata, created_at, updated_at
    from obs_files
    where project_id = ${projectId} and path = ${path}
  `;
  const file = rows[0];
  if (!file || file.status === "deleted") throw new ApiError(404, "not_found", "File not found");
  return file;
}

function assertTokenPath(auth: AuthContext, path: string) {
  if (auth.kind === "upload_token" && auth.folder && !path.startsWith(`${auth.folder}/`) && path !== auth.folder) {
    throw new ApiError(403, "forbidden", "Path is outside the upload token folder");
  }
}

export async function createPathUpload(
  auth: AuthContext,
  pathInput: string,
  input: {
    byteSize: number;
    contentType: string;
    method?: string;
    visibility?: Visibility;
    metadata?: Record<string, string>;
  },
  origin: string,
) {
  requireScope(auth, "files:write");
  const path = normalizePath(pathInput);
  assertTokenPath(auth, path);
  const plan = getPlan(auth.project.plan);
  const visibility = auth.kind === "upload_token" ? (auth.visibility ?? "public") : (input.visibility ?? "public");
  if (visibility === "private" && !plan.privateUploads) {
    throw new ApiError(403, "private_uploads_unavailable", "Private uploads require a paid plan");
  }
  const maxBytes = Math.min(
    plan.maxUploadBytes,
    DEMO_HARD_CAP_BYTES,
    auth.maxUploadBytes ?? DEMO_HARD_CAP_BYTES,
  );
  if (!Number.isFinite(input.byteSize) || input.byteSize <= 0) {
    throw new ApiError(400, "invalid_request", "byteSize is required");
  }
  if (input.byteSize > maxBytes) {
    throw new ApiError(413, "upload_too_large", "Upload is larger than the plan or token allows", {
      maxUploadBytes: maxBytes,
    });
  }
  const usage = await usageForProject(auth.project.id);
  if (usage.storageBytes + input.byteSize > plan.storageBytes) {
    throw new ApiError(403, "storage_limit", "Project storage limit exceeded");
  }

  const sql = await getSql();
  const existing = await sql<FileRow>`
    select id, project_id, path, filename, content_type, byte_size, visibility, status, etag, metadata, created_at, updated_at
    from obs_files where project_id = ${auth.project.id} and path = ${path}
  `;
  const replacing = Boolean(existing[0]);
  const fileId = existing[0]?.id ?? crypto.randomUUID();
  const filename = filenameFromPath(path);
  const contentType = input.contentType || "application/octet-stream";
  const metadata = JSON.stringify(input.metadata ?? {});

  if (existing[0]) {
    await sql`delete from obs_objects where file_id = ${fileId}`;
    await sql`update obs_uploads set status = 'aborted' where file_id = ${fileId} and status = 'pending'`;
    await sql`
      update obs_files
      set filename = ${filename},
          content_type = ${contentType},
          byte_size = ${input.byteSize},
          visibility = ${visibility},
          status = 'pending',
          etag = null,
          metadata = ${metadata}::jsonb,
          updated_at = now()
      where id = ${fileId}
    `;
  } else {
    await sql`
      insert into obs_files (id, project_id, path, filename, content_type, byte_size, visibility, status, metadata)
      values (${fileId}, ${auth.project.id}, ${path}, ${filename}, ${contentType}, ${input.byteSize}, ${visibility}, 'pending', ${metadata}::jsonb)
    `;
  }

  const uploadId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
  const method = input.method === "multipart" ? "multipart" : "single";
  await sql`
    insert into obs_uploads (id, project_id, file_id, method, expected_bytes, content_type, status, expires_at)
    values (${uploadId}, ${auth.project.id}, ${fileId}, ${method}, ${input.byteSize}, ${contentType}, 'pending', ${expiresAt})
  `;

  const file = await getFileRow(auth.project.id, path);
  return {
    replacing,
    file: serializeFile(file, origin, auth.project.namespace),
    upload: {
      id: uploadId,
      fileId,
      method,
      url: `${origin}/v1/uploads/${uploadId}`,
      headers: { "content-type": contentType },
      expiresAt,
    },
  };
}

export async function storeUploadBytes(uploadId: string, bytes: Uint8Array, contentTypeHeader?: string | null) {
  const sql = await getSql();
  const rows = await sql<{
    id: string;
    project_id: string;
    file_id: string;
    expected_bytes: number;
    content_type: string;
    status: string;
    expires_at: string;
  }>`
    select id, project_id, file_id, expected_bytes, content_type, status, expires_at
    from obs_uploads where id = ${uploadId}
  `;
  const upload = rows[0];
  if (!upload) throw new ApiError(404, "not_found", "Upload not found");
  if (upload.status === "completed") throw new ApiError(409, "conflict", "Upload already completed");
  if (upload.status === "aborted") throw new ApiError(409, "conflict", "Upload aborted");
  if (new Date(upload.expires_at).getTime() < Date.now()) {
    throw new ApiError(410, "expired", "Upload session expired");
  }
  void contentTypeHeader;
  const expected = asNumber(upload.expected_bytes);
  if (bytes.byteLength !== expected) {
    throw new ApiError(400, "invalid_request", "Uploaded byte size does not match the session", {
      expectedBytes: expected,
      receivedBytes: bytes.byteLength,
    });
  }
  const buf = toBuffer(bytes);
  await sql`delete from obs_blobs where upload_id = ${uploadId}`;
  await sql`insert into obs_blobs (upload_id, bytes) values (${uploadId}, ${buf})`;
  return { uploadId, receivedBytes: bytes.byteLength };
}

export async function completePathUpload(auth: AuthContext, pathInput: string, uploadId: string, origin: string) {
  requireScope(auth, "files:write");
  const path = normalizePath(pathInput);
  assertTokenPath(auth, path);
  const sql = await getSql();
  const uploads = await sql<{
    id: string;
    project_id: string;
    file_id: string;
    expected_bytes: number;
    content_type: string;
    status: string;
    expires_at: string;
    method: string;
  }>`
    select id, project_id, file_id, expected_bytes, content_type, status, expires_at, method
    from obs_uploads where id = ${uploadId}
  `;
  const upload = uploads[0];
  if (!upload) throw new ApiError(404, "not_found", "Upload not found");
  if (upload.project_id !== auth.project.id) throw new ApiError(404, "not_found", "Upload not found");
  if (upload.status === "completed") throw new ApiError(409, "conflict", "Upload already completed");
  if (upload.status === "aborted") throw new ApiError(409, "conflict", "Upload aborted");
  if (new Date(upload.expires_at).getTime() < Date.now()) {
    throw new ApiError(410, "expired", "Upload session expired");
  }

  const file = await getFileRow(auth.project.id, path);
  if (file.id !== upload.file_id) throw new ApiError(409, "conflict", "Upload does not match this file");

  const blobs = await sql<{ bytes: Uint8Array | Buffer }>`
    select bytes from obs_blobs where upload_id = ${uploadId}
  `;
  const blob = blobs[0]?.bytes;
  if (!blob) throw new ApiError(409, "conflict", "Upload bytes are missing");
  const bytes = blob instanceof Uint8Array ? blob : new Uint8Array(blob);

  const etag = `"${await sha256Hex(String(bytes.byteLength) + ":" + file.path + ":" + uploadId.slice(0, 8))}"`;
  const image = readImageMetadata(bytes, file.content_type);
  const metadata = parseMetadata(file.metadata);
  if (image) metadata.image = image;

  await sql`delete from obs_objects where file_id = ${file.id}`;
  await sql`insert into obs_objects (file_id, bytes) values (${file.id}, ${toBuffer(bytes)})`;
  await sql`
    update obs_files
    set status = 'ready',
        byte_size = ${bytes.byteLength},
        etag = ${etag},
        metadata = ${JSON.stringify(metadata)}::jsonb,
        updated_at = now()
    where id = ${file.id}
  `;
  await sql`update obs_uploads set status = 'completed' where id = ${uploadId}`;
  await sql`delete from obs_blobs where upload_id = ${uploadId}`;
  await bumpUsage(auth.project.id, 1, 0);

  const ready = await getFileRow(auth.project.id, path);
  const serialized = serializeFile(ready, origin, auth.project.namespace);
  void dispatchWebhooks(auth.project.id, "file.uploaded", {
    source: auth.kind === "upload_token" ? "upload_token" : "api",
    file: serialized,
  });
  if (image) {
    void dispatchWebhooks(auth.project.id, "image.metadata.created", { file: serialized });
  }
  await recordActivity(auth.project.id, {
    category: "uploads",
    title: "Upload session completed",
    detail: `${upload.method || "single"} / ${uploadId}/${ready.id}-${ready.filename}`,
    status: "completed",
    sourceId: uploadId,
  });
  return { file: serialized, upload: { id: uploadId, status: "completed" as const } };
}

export async function readFileObject(fileId: string): Promise<Uint8Array> {
  const sql = await getSql();
  const rows = await sql<{ bytes: Uint8Array | Buffer }>`
    select bytes from obs_objects where file_id = ${fileId}
  `;
  const blob = rows[0]?.bytes;
  if (!blob) throw new ApiError(404, "not_found", "Object not found");
  return blob instanceof Uint8Array ? blob : new Uint8Array(blob);
}

export async function deleteFileByPath(auth: AuthContext, pathInput: string, origin: string) {
  requireScope(auth, "files:delete");
  if (auth.kind === "upload_token") throw new ApiError(403, "forbidden", "Upload tokens cannot delete files");
  const path = normalizePath(pathInput);
  const file = await getFileRow(auth.project.id, path);
  const sql = await getSql();
  await sql`delete from obs_objects where file_id = ${file.id}`;
  await sql`update obs_files set status = 'deleted', updated_at = now() where id = ${file.id}`;
  const deleted = { id: file.id, path: file.path, status: "deleted" as const };
  void dispatchWebhooks(auth.project.id, "file.deleted", {
    file: serializeFile({ ...file, status: "deleted" }, origin, auth.project.namespace),
  });
  await recordActivity(auth.project.id, {
    category: "files",
    title: "File deleted",
    detail: file.path,
    status: "deleted",
    sourceId: file.id,
  });
  return { file: deleted };
}

export async function createSignedUrl(
  auth: AuthContext,
  pathInput: string,
  expiresInSeconds: number,
  origin: string,
) {
  requireScope(auth, "files:read");
  if (auth.kind === "upload_token") throw new ApiError(403, "forbidden", "Upload tokens cannot sign URLs");
  const path = normalizePath(pathInput);
  const file = await getFileRow(auth.project.id, path);
  if (file.status !== "ready") throw new ApiError(409, "conflict", "File is not ready");
  const expires = Math.min(3600, Math.max(30, expiresInSeconds || 900));
  const expiresAt = Math.floor(Date.now() / 1000) + expires;
  const sig = await hmacSha256Hex(
    auth.project.signing_secret,
    `${auth.project.namespace}\n${path}\n${expiresAt}`,
  );
  const url = `${publicUrl(origin, auth.project.namespace, path)}?token=${expiresAt}.${sig}`;
  return {
    signedUrl: {
      fileId: file.id,
      path,
      url,
      expiresAt: new Date(expiresAt * 1000).toISOString(),
    },
  };
}

export async function deleteFileForUser(userId: string, projectId: string, path: string, origin: string) {
  const project = await getProjectForUser(userId, projectId);
  return deleteFileByPath({ project, scopes: new Set(["files:delete"]), kind: "api_key" }, path, origin);
}

export async function signUrlForUser(
  userId: string,
  projectId: string,
  path: string,
  expiresInSeconds: number,
  origin: string,
) {
  const project = await getProjectForUser(userId, projectId);
  return createSignedUrl(
    { project, scopes: new Set(["files:read"]), kind: "api_key" },
    path,
    expiresInSeconds,
    origin,
  );
}

export async function verifySignedToken(project: ProjectRow, path: string, token: string | null) {
  if (!token) return false;
  const [expRaw, sig] = token.split(".");
  const exp = Number(expRaw);
  if (!exp || !sig || exp * 1000 < Date.now()) return false;
  const expected = await hmacSha256Hex(project.signing_secret, `${project.namespace}\n${path}\n${exp}`);
  return timingSafeEqual(expected, sig);
}

export async function listWebhooks(userId: string, projectId: string) {
  const project = await getProjectForUser(userId, projectId);
  const sql = await getSql();
  return sql<{
    id: string;
    name: string;
    url: string;
    events: string;
    enabled: boolean;
    created_at: string;
    last_triggered_at: string | null;
  }>`
    select
      w.id,
      w.name,
      w.url,
      w.events,
      w.enabled,
      w.created_at,
      (
        select max(d.created_at)
        from obs_webhook_deliveries d
        where d.webhook_id = w.id
      ) as last_triggered_at
    from obs_webhooks w
    where w.project_id = ${project.id}
    order by w.created_at desc
  `;
}

export async function createWebhook(
  userId: string,
  projectId: string,
  input: { url: string; events: string[]; name?: string },
) {
  const project = await getProjectForUser(userId, projectId);
  if (!/^https?:\/\//i.test(input.url)) {
    throw new ApiError(400, "invalid_request", "Webhook URL must be http(s)");
  }
  const name = input.name?.trim() || "Webhook";
  const events = input.events.length ? input.events.join(",") : "file.uploaded";
  const secret = generateSecretToken("obswsec", 18);
  const id = randomId("wh");
  const sql = await getSql();
  await sql`
    insert into obs_webhooks (id, project_id, name, url, secret, events, enabled)
    values (${id}, ${project.id}, ${name}, ${input.url.trim()}, ${secret}, ${events}, true)
  `;
  await recordActivity(project.id, {
    category: "webhooks",
    title: "Webhook created",
    detail: `${name} / ${input.url.trim()}`,
    status: "created",
    sourceId: id,
  });
  return { id, name, url: input.url.trim(), events: events.split(","), secret, enabled: true };
}

export async function deleteWebhook(userId: string, projectId: string, webhookId: string) {
  const project = await getProjectForUser(userId, projectId);
  const sql = await getSql();
  const existing = await sql<{ name: string; url: string }>`
    select name, url from obs_webhooks where id = ${webhookId} and project_id = ${project.id}
  `;
  await sql`delete from obs_webhooks where id = ${webhookId} and project_id = ${project.id}`;
  const hook = existing[0];
  if (hook) {
    await recordActivity(project.id, {
      category: "webhooks",
      title: "Webhook deleted",
      detail: `${hook.name} / ${hook.url}`,
      status: "deleted",
      sourceId: webhookId,
    });
  }
}

export async function getWebhookForUser(userId: string, projectId: string, webhookId: string) {
  const project = await getProjectForUser(userId, projectId);
  const sql = await getSql();
  const rows = await sql<{
    id: string;
    name: string;
    url: string;
    events: string;
    enabled: boolean;
    created_at: string;
    last_triggered_at: string | null;
  }>`
    select
      w.id,
      w.name,
      w.url,
      w.events,
      w.enabled,
      w.created_at,
      (
        select max(d.created_at)
        from obs_webhook_deliveries d
        where d.webhook_id = w.id
      ) as last_triggered_at
    from obs_webhooks w
    where w.id = ${webhookId} and w.project_id = ${project.id}
  `;
  const hook = rows[0];
  if (!hook) throw new ApiError(404, "not_found", "Webhook not found");
  return hook;
}

export async function updateWebhook(
  userId: string,
  projectId: string,
  webhookId: string,
  input: { name: string; url: string; events: string[]; enabled: boolean },
) {
  const hook = await getWebhookForUser(userId, projectId, webhookId);
  if (!/^https?:\/\//i.test(input.url)) {
    throw new ApiError(400, "invalid_request", "Webhook URL must be http(s)");
  }
  if (!input.events.length) {
    throw new ApiError(400, "invalid_request", "Select at least one event");
  }
  const name = input.name.trim() || "Webhook";
  const url = input.url.trim();
  const sql = await getSql();
  await sql`
    update obs_webhooks
    set name = ${name},
        url = ${url},
        events = ${input.events.join(",")},
        enabled = ${input.enabled}
    where id = ${hook.id}
  `;
  return getWebhookForUser(userId, projectId, webhookId);
}

export async function resetWebhookSecret(userId: string, projectId: string, webhookId: string) {
  const hook = await getWebhookForUser(userId, projectId, webhookId);
  const secret = generateSecretToken("obswsec", 18);
  const sql = await getSql();
  await sql`update obs_webhooks set secret = ${secret} where id = ${hook.id}`;
  return { secret };
}

export async function listDeliveriesForWebhook(userId: string, projectId: string, webhookId: string) {
  await getWebhookForUser(userId, projectId, webhookId);
  const sql = await getSql();
  return sql<{
    id: string;
    webhook_id: string;
    event_type: string;
    status_code: number | null;
    success: boolean;
    created_at: string;
    payload: string;
  }>`
    select id, webhook_id, event_type, status_code, success, created_at, payload::text as payload
    from obs_webhook_deliveries
    where webhook_id = ${webhookId}
    order by created_at desc
    limit 80
  `;
}

export async function listWebhookDeliveries(userId: string, projectId: string) {
  const project = await getProjectForUser(userId, projectId);
  const sql = await getSql();
  return sql<{
    id: string;
    webhook_id: string;
    event_type: string;
    status_code: number | null;
    success: boolean;
    created_at: string;
    url: string;
  }>`
    select d.id, d.webhook_id, d.event_type, d.status_code, d.success, d.created_at, w.url
    from obs_webhook_deliveries d
    join obs_webhooks w on w.id = d.webhook_id
    where w.project_id = ${project.id}
    order by d.created_at desc
    limit 40
  `;
}

async function dispatchWebhooks(projectId: string, type: string, data: unknown) {
  try {
    const sql = await getSql();
    const hooks = await sql<{ id: string; url: string; secret: string; events: string; enabled: boolean }>`
      select id, url, secret, events, enabled from obs_webhooks where project_id = ${projectId} and enabled = true
    `;
    const envelope = {
      id: randomId("evt"),
      type,
      createdAt: new Date().toISOString(),
      projectId,
      data,
    };
    const body = JSON.stringify(envelope);
    for (const hook of hooks) {
      if (!hook.events.split(",").includes(type)) continue;
      const timestamp = String(Math.floor(Date.now() / 1000));
      const signature = `v1=${await hmacSha256Hex(hook.secret, `${timestamp}.${body}`)}`;
      let statusCode: number | null = null;
      let success = false;
      try {
        const res = await fetch(hook.url, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "openbyteship-webhook-id": envelope.id,
            "openbyteship-webhook-timestamp": timestamp,
            "openbyteship-webhook-signature": signature,
            "openbyteship-webhook-event": type,
          },
          body,
        });
        statusCode = res.status;
        success = res.ok;
      } catch {
        success = false;
      }
      await sql`
        insert into obs_webhook_deliveries (id, webhook_id, event_type, payload, status_code, success)
        values (${randomId("del")}, ${hook.id}, ${type}, ${body}::jsonb, ${statusCode}, ${success})
      `;
    }
  } catch (err) {
    console.error("[webhooks]", err);
  }
}

export function planFor(project: ProjectRow): Plan {
  return getPlan(project.plan);
}

export async function recordActivity(
  projectId: string,
  input: {
    category: ActivityCategory;
    title: string;
    detail: string;
    status: ActivityStatus;
    sourceId?: string;
  },
) {
  try {
    const sql = await getSql();
    await sql`
      insert into obs_activity (id, project_id, category, title, detail, status, source_id)
      values (
        ${randomId("act")},
        ${projectId},
        ${input.category},
        ${input.title},
        ${input.detail},
        ${input.status},
        ${input.sourceId ?? null}
      )
    `;
  } catch (err) {
    console.error("[activity]", err);
  }
}

export async function listActivityForUser(userId: string, projectId: string): Promise<ActivityEvent[]> {
  const project = await getProjectForUser(userId, projectId);
  const sql = await getSql();
  const rows = await sql<{
    id: string;
    category: string;
    title: string;
    detail: string;
    status: string;
    source_id: string | null;
    created_at: string;
  }>`
    select id, category, title, detail, status, source_id, created_at
    from obs_activity
    where project_id = ${project.id}
    order by created_at desc
    limit 80
  `;

  const seen = new Set(rows.map((row) => `${row.category}:${row.source_id ?? row.id}`));
  const events: ActivityEvent[] = rows.map((row) => ({
    id: row.id,
    category: row.category as ActivityCategory,
    title: row.title,
    detail: row.detail,
    status: row.status as ActivityStatus,
    createdAt: row.created_at,
  }));

  const keys = await sql<{ id: string; name: string; prefix: string; created_at: string }>`
    select id, name, prefix, created_at from obs_api_keys where project_id = ${project.id}
  `;
  for (const key of keys) {
    const stamp = `keys:${key.id}`;
    if (seen.has(stamp)) continue;
    events.push({
      id: `synth-${key.id}`,
      category: "keys",
      title: "API key created",
      detail: `${key.name} / ${key.prefix}`,
      status: "created",
      createdAt: key.created_at,
    });
  }

  const uploads = await sql<{
    id: string;
    method: string;
    file_id: string;
    filename: string;
    created_at: string;
  }>`
    select u.id, u.method, u.file_id, f.filename, u.created_at
    from obs_uploads u
    join obs_files f on f.id = u.file_id
    where u.project_id = ${project.id} and u.status = 'completed'
  `;
  for (const upload of uploads) {
    const stamp = `uploads:${upload.id}`;
    if (seen.has(stamp)) continue;
    events.push({
      id: `synth-${upload.id}`,
      category: "uploads",
      title: "Upload session completed",
      detail: `${upload.method || "single"} / ${upload.id}/${upload.file_id}-${upload.filename}`,
      status: "completed",
      createdAt: upload.created_at,
    });
  }

  return events.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 80);
}
