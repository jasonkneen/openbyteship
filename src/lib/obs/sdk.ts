export type Visibility = "public" | "private";

export type OpenByteShipClientOptions = {
  apiKey?: string;
  uploadToken?: string;
  baseUrl?: string;
};

export type UploadProgress = {
  loaded: number;
  total: number;
  percent: number;
};

export type UploadedFile = {
  id: string;
  filename: string;
  path: string;
  url: string | null;
  visibility: Visibility;
  status: string;
  byteSize: number;
  contentType?: string;
  etag?: string | null;
  metadata?: Record<string, unknown>;
  createdAt?: string;
};

export class OpenByteShipError extends Error {
  code: string;
  status: number;
  details?: unknown;
  constructor(code: string, status: number, message?: string, details?: unknown) {
    super(message ?? code);
    this.name = "OpenByteShipError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export class OpenByteShipClient {
  #apiKey?: string;
  #uploadToken?: string;
  #baseUrl: string;

  constructor(opts: OpenByteShipClientOptions = {}) {
    this.#apiKey = opts.apiKey;
    this.#uploadToken = opts.uploadToken;
    this.#baseUrl = (opts.baseUrl ?? (typeof window !== "undefined" ? window.location.origin : "")).replace(/\/$/, "");
  }

  get #token() {
    const token = this.#apiKey ?? this.#uploadToken;
    if (!token) throw new OpenByteShipError("missing_credentials", 401, "API key or upload token required");
    return token;
  }

  async upload(
    file: File | Blob,
    options: {
      path: string;
      visibility?: Visibility;
      metadata?: Record<string, unknown>;
      method?: "auto" | "single" | "multipart";
      onProgress?: (progress: UploadProgress) => void;
      signal?: AbortSignal;
    },
  ): Promise<UploadedFile> {
    const filename = "name" in file && file.name ? file.name : options.path.split("/").pop() || "file";
    const contentType = file.type || "application/octet-stream";
    const created = await this.createFileUpload(options.path, {
      byteSize: file.size,
      contentType,
      method: options.method === "multipart" ? "multipart" : "single",
      visibility: options.visibility,
      metadata: options.metadata,
    });
    if (!created.upload.url) throw new OpenByteShipError("missing_upload_url", 500, "Upload URL missing");
    await putBytes(created.upload.url, file, created.upload.headers ?? {}, options.onProgress, options.signal);
    const completed = await this.completePathUpload(options.path, { uploadId: created.upload.id });
    return { ...completed.file, filename: completed.file.filename ?? filename };
  }

  async uploadMany(
    files: ArrayLike<File> | File[],
    options: {
      concurrency?: number;
      pathPrefix?: string;
      visibility?: Visibility;
      onFileProgress?: (progress: UploadProgress & { index: number }) => void;
    } = {},
  ) {
    const list = Array.from(files);
    const prefix = options.pathPrefix ? options.pathPrefix.replace(/\/$/, "") : "";
    const concurrency = Math.max(1, options.concurrency ?? 3);
    const results: Array<
      | { status: "fulfilled"; file: File; result: UploadedFile }
      | { status: "rejected"; file: File; error: OpenByteShipError }
    > = new Array(list.length);
    let cursor = 0;
    const workers = Array.from({ length: Math.min(concurrency, list.length) }, async () => {
      while (cursor < list.length) {
        const index = cursor++;
        const file = list[index]!;
        const path = prefix ? `${prefix}/${file.name}` : file.name;
        try {
          const result = await this.upload(file, {
            path,
            visibility: options.visibility,
            onProgress: (progress) => options.onFileProgress?.({ ...progress, index }),
          });
          results[index] = { status: "fulfilled", file, result };
        } catch (error) {
          results[index] = {
            status: "rejected",
            file,
            error: error instanceof OpenByteShipError ? error : new OpenByteShipError("upload_failed", 500, String(error)),
          };
        }
      }
    });
    await Promise.all(workers);
    return results;
  }

  async createFileUpload(
    path: string,
    input: {
      byteSize: number;
      contentType: string;
      method?: string;
      visibility?: Visibility;
      metadata?: Record<string, unknown>;
    },
  ) {
    return this.#json<{
      file: UploadedFile;
      upload: { id: string; fileId: string; method: string; url: string; headers: Record<string, string>; expiresAt: string };
    }>(`/v1/files/${encodePath(path)}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
  }

  async completePathUpload(path: string, input: { uploadId: string }) {
    return this.#json<{ file: UploadedFile; upload: { id: string; status: string } }>(
      `/v1/files/${encodePath(path)}/upload/complete`,
      { method: "POST", body: JSON.stringify(input) },
    );
  }

  async getFile(path: string) {
    return this.#json<{ file: UploadedFile }>(`/v1/files/${encodePath(path)}`, {
      method: "GET",
      headers: { accept: "application/json" },
    });
  }

  async deleteFile(path: string) {
    return this.#json<{ file: { id: string; path: string; status: string } }>(`/v1/files/${encodePath(path)}`, {
      method: "DELETE",
    });
  }

  async createSignedUrl(path: string, input: { expiresInSeconds?: number } = {}) {
    return this.#json<{ signedUrl: { fileId: string; path: string; url: string; expiresAt: string } }>(
      `/v1/files/${encodePath(path)}/signed-url`,
      { method: "POST", body: JSON.stringify(input) },
    );
  }

  async createUploadToken(input: {
    folder?: string;
    visibility?: Visibility;
    maxUploadBytes?: number;
    expiresInSeconds?: number;
  } = {}) {
    return this.#json<{ uploadToken: { token: string; expiresAt: string } }>(`/v1/upload-tokens`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  async #json<T>(path: string, init: RequestInit): Promise<T> {
    const headers = new Headers(init.headers);
    headers.set("authorization", `Bearer ${this.#token}`);
    if (init.body && !headers.has("content-type")) headers.set("content-type", "application/json");
    const res = await fetch(`${this.#baseUrl}${path}`, { ...init, headers });
    const data = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
    if (!res.ok) {
      throw new OpenByteShipError(data.error ?? "request_failed", res.status, data.message, data);
    }
    return data as T;
  }
}

function encodePath(path: string) {
  return path.replace(/^\/+/, "").split("/").map(encodeURIComponent).join("/");
}

function putBytes(
  url: string,
  body: Blob,
  headers: Record<string, string>,
  onProgress?: (progress: UploadProgress) => void,
  signal?: AbortSignal,
) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    for (const [key, value] of Object.entries(headers)) xhr.setRequestHeader(key, value);
    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      onProgress?.({
        loaded: event.loaded,
        total: event.total,
        percent: event.total ? (event.loaded / event.total) * 100 : 0,
      });
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else {
        try {
          const data = JSON.parse(xhr.responseText) as { error?: string; message?: string };
          reject(new OpenByteShipError(data.error ?? "upload_failed", xhr.status, data.message, data));
        } catch {
          reject(new OpenByteShipError("upload_failed", xhr.status, xhr.statusText));
        }
      }
    };
    xhr.onerror = () => reject(new OpenByteShipError("upload_failed", 0, "Network error"));
    xhr.onabort = () => reject(new OpenByteShipError("aborted", 0, "Upload aborted"));
    if (signal) {
      if (signal.aborted) {
        xhr.abort();
        return;
      }
      signal.addEventListener("abort", () => xhr.abort(), { once: true });
    }
    xhr.send(body);
  });
}
