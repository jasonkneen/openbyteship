//#region node_modules/.nitro/vite/services/ssr/assets/sdk-CfZxGCEV.js
var OpenByteShipError = class extends Error {
	code;
	status;
	details;
	constructor(code, status, message, details) {
		super(message ?? code);
		this.name = "OpenByteShipError";
		this.code = code;
		this.status = status;
		this.details = details;
	}
};
var OpenByteShipClient = class {
	#apiKey;
	#uploadToken;
	#baseUrl;
	constructor(opts = {}) {
		this.#apiKey = opts.apiKey;
		this.#uploadToken = opts.uploadToken;
		this.#baseUrl = (opts.baseUrl ?? (typeof window !== "undefined" ? window.location.origin : "")).replace(/\/$/, "");
	}
	get #token() {
		const token = this.#apiKey ?? this.#uploadToken;
		if (!token) throw new OpenByteShipError("missing_credentials", 401, "API key or upload token required");
		return token;
	}
	async upload(file, options) {
		const filename = "name" in file && file.name ? file.name : options.path.split("/").pop() || "file";
		const contentType = file.type || "application/octet-stream";
		const created = await this.createFileUpload(options.path, {
			byteSize: file.size,
			contentType,
			method: options.method === "multipart" ? "multipart" : "single",
			visibility: options.visibility,
			metadata: options.metadata
		});
		if (!created.upload.url) throw new OpenByteShipError("missing_upload_url", 500, "Upload URL missing");
		await putBytes(created.upload.url, file, created.upload.headers ?? {}, options.onProgress, options.signal);
		const completed = await this.completePathUpload(options.path, { uploadId: created.upload.id });
		return {
			...completed.file,
			filename: completed.file.filename ?? filename
		};
	}
	async uploadMany(files, options = {}) {
		const list = Array.from(files);
		const prefix = options.pathPrefix ? options.pathPrefix.replace(/\/$/, "") : "";
		const concurrency = Math.max(1, options.concurrency ?? 3);
		const results = new Array(list.length);
		let cursor = 0;
		const workers = Array.from({ length: Math.min(concurrency, list.length) }, async () => {
			while (cursor < list.length) {
				const index = cursor++;
				const file = list[index];
				const path = prefix ? `${prefix}/${file.name}` : file.name;
				try {
					const result = await this.upload(file, {
						path,
						visibility: options.visibility,
						onProgress: (progress) => options.onFileProgress?.({
							...progress,
							index
						})
					});
					results[index] = {
						status: "fulfilled",
						file,
						result
					};
				} catch (error) {
					results[index] = {
						status: "rejected",
						file,
						error: error instanceof OpenByteShipError ? error : new OpenByteShipError("upload_failed", 500, String(error))
					};
				}
			}
		});
		await Promise.all(workers);
		return results;
	}
	async createFileUpload(path, input) {
		return this.#json(`/v1/files/${encodePath(path)}`, {
			method: "PUT",
			body: JSON.stringify(input)
		});
	}
	async completePathUpload(path, input) {
		return this.#json(`/v1/files/${encodePath(path)}/upload/complete`, {
			method: "POST",
			body: JSON.stringify(input)
		});
	}
	async getFile(path) {
		return this.#json(`/v1/files/${encodePath(path)}`, {
			method: "GET",
			headers: { accept: "application/json" }
		});
	}
	async deleteFile(path) {
		return this.#json(`/v1/files/${encodePath(path)}`, { method: "DELETE" });
	}
	async createSignedUrl(path, input = {}) {
		return this.#json(`/v1/files/${encodePath(path)}/signed-url`, {
			method: "POST",
			body: JSON.stringify(input)
		});
	}
	async createUploadToken(input = {}) {
		return this.#json(`/v1/upload-tokens`, {
			method: "POST",
			body: JSON.stringify(input)
		});
	}
	async #json(path, init) {
		const headers = new Headers(init.headers);
		headers.set("authorization", `Bearer ${this.#token}`);
		if (init.body && !headers.has("content-type")) headers.set("content-type", "application/json");
		const res = await fetch(`${this.#baseUrl}${path}`, {
			...init,
			headers
		});
		const data = await res.json().catch(() => ({}));
		if (!res.ok) throw new OpenByteShipError(data.error ?? "request_failed", res.status, data.message, data);
		return data;
	}
};
function encodePath(path) {
	return path.replace(/^\/+/, "").split("/").map(encodeURIComponent).join("/");
}
function putBytes(url, body, headers, onProgress, signal) {
	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		xhr.open("PUT", url);
		for (const [key, value] of Object.entries(headers)) xhr.setRequestHeader(key, value);
		xhr.upload.onprogress = (event) => {
			if (!event.lengthComputable) return;
			onProgress?.({
				loaded: event.loaded,
				total: event.total,
				percent: event.total ? event.loaded / event.total * 100 : 0
			});
		};
		xhr.onload = () => {
			if (xhr.status >= 200 && xhr.status < 300) resolve();
			else try {
				const data = JSON.parse(xhr.responseText);
				reject(new OpenByteShipError(data.error ?? "upload_failed", xhr.status, data.message, data));
			} catch {
				reject(new OpenByteShipError("upload_failed", xhr.status, xhr.statusText));
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
//#endregion
export { OpenByteShipClient as t };
