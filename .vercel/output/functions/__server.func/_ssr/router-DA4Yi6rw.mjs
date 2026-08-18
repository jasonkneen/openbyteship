import { o as __toESM } from "../_runtime.mjs";
import { t as __exportAll } from "./rolldown-runtime-D7D4PA-g.mjs";
import { A as readFileObject, B as verifySignedToken, C as jsonOk, F as serializeFile, N as requestOrigin, P as requireScope, R as storeUploadBytes, S as jsonError, _ as getFileRow, a as completePathUpload, b as getProjectByNamespace, f as deleteFileByPath, i as bumpUsage, j as readJson, k as mintUploadToken, l as createSignedUrl, r as authenticateRequest, s as createPathUpload, t as ApiError } from "./store-C324kcPI.mjs";
import { L as string, N as number, P as object, R as union, j as literal } from "../_libs/@better-auth/core+[...].mjs";
import { n as auth } from "./server-b42yeywX.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { S as useRouter, _ as createRootRoute, g as createFileRoute, h as lazyRouteComponent, l as Scripts, m as Outlet, p as createRouter, u as HeadContent } from "../_libs/@tanstack/react-router+[...].mjs";
import { N as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { i as TriangleAlert } from "../_libs/lucide-react.mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-DA4Yi6rw.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 bg-bg px-6 text-center text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-danger",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 1.75
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-2xl",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-muted",
				children: error.message || "An unexpected error occurred. Try reloading the page."
			})
		]
	});
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
/**
* Whether `origin` is a known Grok embedder. Exported for tests.
* Do not list internal staging hosts here — this file ships in download/export.
*/
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
/** Public preview zone. Staging embedders frame this host via the proxy CSP. */
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
/** Resolve the parent origin to post to, or null when the bridge must noop. */
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	const candidates = [referrer, ancestorOrigin ?? ""].filter(Boolean);
	for (const candidate of candidates) try {
		const origin = candidate.includes("://") ? new URL(candidate).origin : candidate;
		if (isGrokEmbedderOrigin(origin)) return origin;
		if (!isSandboxPreviewGuestHost(guestHostname)) continue;
		const parsed = new URL(origin.includes("://") ? origin : `https://${origin}`);
		if (parsed.protocol === "https:" || parsed.protocol === "http:") return parsed.origin;
	} catch {}
	return null;
}
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	if (typeof window === "undefined") return () => {};
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	const parentOrigin = resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		if (envelope.data.type === "hello") {
			if (!HelloSchema.safeParse(event.data).success) return;
			announce();
			return;
		}
		if (envelope.data.type === "navigate") {
			const parsed = NavigateSchema.safeParse(event.data);
			if (!parsed.success) return;
			navigate(parsed.data.path);
			queueMicrotask(reportLocation);
			return;
		}
		if (envelope.data.type === "history") {
			const parsed = HistorySchema.safeParse(event.data);
			if (!parsed.success) return;
			if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
			window.history.go(parsed.data.delta);
		}
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
var styles_default = "/assets/styles-CA-A5ga6.css";
var APP_NAME = "OpenByteShip";
var Route$28 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: APP_NAME },
			{
				name: "description",
				content: "Ship uploads, not infrastructure. Handle uploads, storage, and delivery with a single API."
			},
			{
				name: "apple-mobile-web-app-title",
				content: APP_NAME
			},
			{
				name: "theme-color",
				content: "#09090b"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				property: "og:title",
				content: APP_NAME
			},
			{
				property: "og:description",
				content: "Ship uploads, not infrastructure."
			},
			...[]
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/__grok/icon-180.png"
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&family=Newsreader:opsz,wght@6..72,500;6..72,600&display=swap"
			}
		]
	}),
	component: () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		className: "antialiased",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", {
			className: "bg-bg text-fg",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
					theme: "dark",
					position: "bottom-right",
					toastOptions: { style: {
						background: "#121214",
						border: "1px solid rgb(244 241 234 / 0.1)",
						color: "#f4f1ea"
					} }
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
			]
		})]
	})
});
var $$splitComponentImporter$22 = () => import("./routes-CSVF0Z_e.mjs");
var Route$27 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter$22, "component") });
var $$splitComponentImporter$21 = () => import("./route-ZicPoLdm.mjs");
var Route$26 = createFileRoute("/console")({ component: lazyRouteComponent($$splitComponentImporter$21, "component") });
var $$splitComponentImporter$20 = () => import("./login-DyhP42I9.mjs");
var Route$25 = createFileRoute("/login")({ component: lazyRouteComponent($$splitComponentImporter$20, "component") });
var $$splitComponentImporter$19 = () => import("./pricing-C7-l49cL.mjs");
var Route$24 = createFileRoute("/pricing")({ component: lazyRouteComponent($$splitComponentImporter$19, "component") });
var $$splitComponentImporter$18 = () => import("./console-D4kZ1qe3.mjs");
var Route$23 = createFileRoute("/console/")({ component: lazyRouteComponent($$splitComponentImporter$18, "component") });
var $$splitComponentImporter$17 = () => import("./route-BiwerPKf.mjs");
var Route$22 = createFileRoute("/console/$projectId")({ component: lazyRouteComponent($$splitComponentImporter$17, "component") });
var $$splitComponentImporter$16 = () => import("./docs-DY2yHS3x.mjs");
var Route$21 = createFileRoute("/docs/")({ component: lazyRouteComponent($$splitComponentImporter$16, "component") });
var $$splitComponentImporter$15 = () => import("./api-P4cEfL3W.mjs");
var Route$20 = createFileRoute("/docs/api")({ component: lazyRouteComponent($$splitComponentImporter$15, "component") });
var $$splitComponentImporter$14 = () => import("./api-keys-Cyvr0IlV.mjs");
var Route$19 = createFileRoute("/docs/api-keys")({ component: lazyRouteComponent($$splitComponentImporter$14, "component") });
var $$splitComponentImporter$13 = () => import("./delivery-CSEGfqY1.mjs");
var Route$18 = createFileRoute("/docs/delivery")({ component: lazyRouteComponent($$splitComponentImporter$13, "component") });
var $$splitComponentImporter$12 = () => import("./frameworks-HK8YjpTX.mjs");
var Route$17 = createFileRoute("/docs/frameworks")({ component: lazyRouteComponent($$splitComponentImporter$12, "component") });
var $$splitComponentImporter$11 = () => import("./go-sdk-wmKBHMXC.mjs");
var Route$16 = createFileRoute("/docs/go-sdk")({ component: lazyRouteComponent($$splitComponentImporter$11, "component") });
var $$splitComponentImporter$10 = () => import("./javascript-sdk-epXc5LuZ.mjs");
var Route$15 = createFileRoute("/docs/javascript-sdk")({ component: lazyRouteComponent($$splitComponentImporter$10, "component") });
var $$splitComponentImporter$9 = () => import("./python-sdk-B8_s8lrD.mjs");
var Route$14 = createFileRoute("/docs/python-sdk")({ component: lazyRouteComponent($$splitComponentImporter$9, "component") });
var $$splitComponentImporter$8 = () => import("./react-sdk-BYaUb1df.mjs");
var Route$13 = createFileRoute("/docs/react-sdk")({ component: lazyRouteComponent($$splitComponentImporter$8, "component") });
var $$splitComponentImporter$7 = () => import("./uploading-BpkKIyav.mjs");
var Route$12 = createFileRoute("/docs/uploading")({ component: lazyRouteComponent($$splitComponentImporter$7, "component") });
var $$splitComponentImporter$6 = () => import("./webhooks-CKggbk7l.mjs");
var Route$11 = createFileRoute("/docs/webhooks")({ component: lazyRouteComponent($$splitComponentImporter$6, "component") });
function decodeRest(pathname, prefix) {
	return (pathname.startsWith(prefix) ? pathname.slice(prefix.length) : "").split("/").filter(Boolean).map((part) => {
		try {
			return decodeURIComponent(part);
		} catch {
			return part;
		}
	});
}
function splitFileAction(parts) {
	if (parts.length >= 2 && parts[parts.length - 1] === "complete" && parts[parts.length - 2] === "upload") return {
		path: parts.slice(0, -2).join("/"),
		action: "complete"
	};
	if (parts.length >= 2 && parts[parts.length - 1] === "parts" && parts[parts.length - 2] === "upload") return {
		path: parts.slice(0, -2).join("/"),
		action: "parts"
	};
	if (parts.length >= 1 && parts[parts.length - 1] === "signed-url") return {
		path: parts.slice(0, -1).join("/"),
		action: "signed-url"
	};
	return {
		path: parts.join("/"),
		action: "file"
	};
}
async function handleFilesApi(request) {
	try {
		const { path, action } = splitFileAction(decodeRest(new URL(request.url).pathname, "/v1/files/"));
		if (!path) throw new ApiError(400, "invalid_path", "File path is required");
		const origin = requestOrigin(request);
		const auth = await authenticateRequest(request);
		if (request.method === "PUT" && action === "file") {
			const body = await readJson(request);
			const created = await createPathUpload(auth, path, body, origin);
			return jsonOk(created, created.replacing ? 200 : 201);
		}
		if (request.method === "POST" && action === "complete") {
			const body = await readJson(request);
			if (!body.uploadId) throw new ApiError(400, "invalid_request", "uploadId is required");
			return jsonOk(await completePathUpload(auth, path, body.uploadId, origin));
		}
		if (request.method === "POST" && action === "parts") throw new ApiError(400, "invalid_request", "Multipart part signing is not required under the demo size cap. Use method single.");
		if (request.method === "POST" && action === "signed-url") {
			const body = await readJson(request).catch(() => ({ expiresInSeconds: 900 }));
			return jsonOk(await createSignedUrl(auth, path, body.expiresInSeconds ?? 900, origin));
		}
		if (request.method === "GET" && action === "file") {
			requireScope(auth, "files:read");
			const file = await getFileRow(auth.project.id, path);
			if ((request.headers.get("accept") ?? "").includes("application/json")) return jsonOk({ file: serializeFile(file, origin, auth.project.namespace) });
			if (file.status !== "ready") throw new ApiError(409, "conflict", "File is not ready");
			const bytes = await readFileObject(file.id);
			return new Response(Buffer.from(bytes), { headers: {
				"content-type": file.content_type,
				"content-length": String(bytes.byteLength),
				etag: file.etag ?? ""
			} });
		}
		if (request.method === "DELETE" && action === "file") return jsonOk(await deleteFileByPath(auth, path, origin));
		throw new ApiError(405, "method_not_allowed", "Method not allowed");
	} catch (err) {
		return jsonError(err);
	}
}
async function handleUploadTokens(request) {
	try {
		if (request.method !== "POST") throw new ApiError(405, "method_not_allowed", "Method not allowed");
		const auth = await authenticateRequest(request);
		const body = await readJson(request);
		const minted = await mintUploadToken(auth, body);
		return jsonOk({ uploadToken: {
			token: minted.token,
			expiresAt: minted.expiresAt
		} });
	} catch (err) {
		return jsonError(err);
	}
}
async function handleUploadBytes(request, uploadId) {
	try {
		if (request.method !== "PUT") throw new ApiError(405, "method_not_allowed", "Method not allowed");
		const buf = new Uint8Array(await request.arrayBuffer());
		const result = await storeUploadBytes(uploadId, buf, request.headers.get("content-type"));
		return jsonOk(result);
	} catch (err) {
		return jsonError(err);
	}
}
var Route$10 = createFileRoute("/v1/upload-tokens")({ server: { handlers: { POST: ({ request }) => handleUploadTokens(request) } } });
var Route$9 = createFileRoute("/api/auth/$")({ server: { handlers: {
	GET: ({ request }) => auth.handler(request),
	POST: ({ request }) => auth.handler(request)
} } });
var $$splitComponentImporter$5 = () => import("../_projectId-DGY-oues.mjs");
var Route$8 = createFileRoute("/console/$projectId/")({ component: lazyRouteComponent($$splitComponentImporter$5, "component") });
var $$splitComponentImporter$4 = () => import("./files-6R6H4OP9.mjs");
var Route$7 = createFileRoute("/console/$projectId/files")({ component: lazyRouteComponent($$splitComponentImporter$4, "component") });
var $$splitComponentImporter$3 = () => import("./keys-MXM_qd2X.mjs");
var Route$6 = createFileRoute("/console/$projectId/keys")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
var $$splitComponentImporter$2 = () => import("./playground-BoupKYL-.mjs");
var Route$5 = createFileRoute("/console/$projectId/playground")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
var $$splitComponentImporter$1 = () => import("./settings-DEGo3x_E.mjs");
var Route$4 = createFileRoute("/console/$projectId/settings")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var $$splitComponentImporter = () => import("./webhooks-BcBtgTC4.mjs");
var Route$3 = createFileRoute("/console/$projectId/webhooks")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var Route$2 = createFileRoute("/f/$namespace/$")({ server: { handlers: { GET: async ({ request, params }) => {
	try {
		const url = new URL(request.url);
		const path = url.pathname.replace(`/f/${params.namespace}/`, "").split("/").filter(Boolean).map((part) => {
			try {
				return decodeURIComponent(part);
			} catch {
				return part;
			}
		}).join("/");
		if (!path) throw new ApiError(404, "not_found", "File not found");
		const project = await getProjectByNamespace(params.namespace);
		const file = await getFileRow(project.id, path);
		if (file.status !== "ready") throw new ApiError(404, "not_found", "File not found");
		if (file.visibility === "private") {
			if (!await verifySignedToken(project, path, url.searchParams.get("token"))) throw new ApiError(403, "forbidden", "Signed URL required");
		}
		const bytes = await readFileObject(file.id);
		await bumpUsage(project.id, 0, bytes.byteLength);
		return new Response(Buffer.from(bytes), { headers: {
			"content-type": file.content_type || "application/octet-stream",
			"content-length": String(bytes.byteLength),
			"cache-control": file.visibility === "public" ? "public, max-age=31536000, immutable" : "private, max-age=60",
			etag: file.etag ?? ""
		} });
	} catch (err) {
		return jsonError(err);
	}
} } } });
var Route$1 = createFileRoute("/v1/files/$")({ server: { handlers: {
	GET: ({ request }) => handleFilesApi(request),
	PUT: ({ request }) => handleFilesApi(request),
	POST: ({ request }) => handleFilesApi(request),
	DELETE: ({ request }) => handleFilesApi(request)
} } });
var Route = createFileRoute("/v1/uploads/$uploadId")({ server: { handlers: { PUT: ({ request, params }) => handleUploadBytes(request, params.uploadId) } } });
var IndexRoute = Route$27.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$28
});
var ConsoleRouteRoute = Route$26.update({
	id: "/console",
	path: "/console",
	getParentRoute: () => Route$28
});
var LoginRoute = Route$25.update({
	id: "/login",
	path: "/login",
	getParentRoute: () => Route$28
});
var PricingRoute = Route$24.update({
	id: "/pricing",
	path: "/pricing",
	getParentRoute: () => Route$28
});
var ConsoleIndexRoute = Route$23.update({
	id: "/",
	path: "/",
	getParentRoute: () => ConsoleRouteRoute
});
var ConsoleProjectIdRouteRoute = Route$22.update({
	id: "/$projectId",
	path: "/$projectId",
	getParentRoute: () => ConsoleRouteRoute
});
var DocsIndexRoute = Route$21.update({
	id: "/docs/",
	path: "/docs/",
	getParentRoute: () => Route$28
});
var DocsApiRoute = Route$20.update({
	id: "/docs/api",
	path: "/docs/api",
	getParentRoute: () => Route$28
});
var DocsApiKeysRoute = Route$19.update({
	id: "/docs/api-keys",
	path: "/docs/api-keys",
	getParentRoute: () => Route$28
});
var DocsDeliveryRoute = Route$18.update({
	id: "/docs/delivery",
	path: "/docs/delivery",
	getParentRoute: () => Route$28
});
var DocsFrameworksRoute = Route$17.update({
	id: "/docs/frameworks",
	path: "/docs/frameworks",
	getParentRoute: () => Route$28
});
var DocsGoSdkRoute = Route$16.update({
	id: "/docs/go-sdk",
	path: "/docs/go-sdk",
	getParentRoute: () => Route$28
});
var DocsJavascriptSdkRoute = Route$15.update({
	id: "/docs/javascript-sdk",
	path: "/docs/javascript-sdk",
	getParentRoute: () => Route$28
});
var DocsPythonSdkRoute = Route$14.update({
	id: "/docs/python-sdk",
	path: "/docs/python-sdk",
	getParentRoute: () => Route$28
});
var DocsReactSdkRoute = Route$13.update({
	id: "/docs/react-sdk",
	path: "/docs/react-sdk",
	getParentRoute: () => Route$28
});
var DocsUploadingRoute = Route$12.update({
	id: "/docs/uploading",
	path: "/docs/uploading",
	getParentRoute: () => Route$28
});
var DocsWebhooksRoute = Route$11.update({
	id: "/docs/webhooks",
	path: "/docs/webhooks",
	getParentRoute: () => Route$28
});
var V1UploadTokensRoute = Route$10.update({
	id: "/v1/upload-tokens",
	path: "/v1/upload-tokens",
	getParentRoute: () => Route$28
});
var ApiAuthSplatRoute = Route$9.update({
	id: "/api/auth/$",
	path: "/api/auth/$",
	getParentRoute: () => Route$28
});
var ConsoleProjectIdIndexRoute = Route$8.update({
	id: "/",
	path: "/",
	getParentRoute: () => ConsoleProjectIdRouteRoute
});
var ConsoleProjectIdFilesRoute = Route$7.update({
	id: "/files",
	path: "/files",
	getParentRoute: () => ConsoleProjectIdRouteRoute
});
var ConsoleProjectIdKeysRoute = Route$6.update({
	id: "/keys",
	path: "/keys",
	getParentRoute: () => ConsoleProjectIdRouteRoute
});
var ConsoleProjectIdPlaygroundRoute = Route$5.update({
	id: "/playground",
	path: "/playground",
	getParentRoute: () => ConsoleProjectIdRouteRoute
});
var ConsoleProjectIdSettingsRoute = Route$4.update({
	id: "/settings",
	path: "/settings",
	getParentRoute: () => ConsoleProjectIdRouteRoute
});
var ConsoleProjectIdWebhooksRoute = Route$3.update({
	id: "/webhooks",
	path: "/webhooks",
	getParentRoute: () => ConsoleProjectIdRouteRoute
});
var FNamespaceSplatRoute = Route$2.update({
	id: "/f/$namespace/$",
	path: "/f/$namespace/$",
	getParentRoute: () => Route$28
});
var V1FilesSplatRoute = Route$1.update({
	id: "/v1/files/$",
	path: "/v1/files/$",
	getParentRoute: () => Route$28
});
var V1UploadsUploadIdRoute = Route.update({
	id: "/v1/uploads/$uploadId",
	path: "/v1/uploads/$uploadId",
	getParentRoute: () => Route$28
});
var ConsoleProjectIdRouteRouteChildren = {
	ConsoleProjectIdFilesRoute,
	ConsoleProjectIdKeysRoute,
	ConsoleProjectIdPlaygroundRoute,
	ConsoleProjectIdSettingsRoute,
	ConsoleProjectIdWebhooksRoute,
	ConsoleProjectIdIndexRoute
};
var ConsoleRouteRouteChildren = {
	ConsoleProjectIdRouteRoute: ConsoleProjectIdRouteRoute._addFileChildren(ConsoleProjectIdRouteRouteChildren),
	ConsoleIndexRoute
};
var rootRouteChildren = {
	IndexRoute,
	ConsoleRouteRoute: ConsoleRouteRoute._addFileChildren(ConsoleRouteRouteChildren),
	LoginRoute,
	PricingRoute,
	DocsApiRoute,
	DocsApiKeysRoute,
	DocsDeliveryRoute,
	DocsFrameworksRoute,
	DocsGoSdkRoute,
	DocsJavascriptSdkRoute,
	DocsPythonSdkRoute,
	DocsReactSdkRoute,
	DocsUploadingRoute,
	DocsWebhooksRoute,
	V1UploadTokensRoute,
	DocsIndexRoute,
	ApiAuthSplatRoute,
	FNamespaceSplatRoute,
	V1FilesSplatRoute,
	V1UploadsUploadIdRoute
};
var routeTree = Route$28._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { Route$6 as a, Route$22 as c, Route$5 as i, Route$3 as n, Route$7 as o, Route$4 as r, Route$8 as s, router_exports as t };
