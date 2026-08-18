/**
 * Single source of truth for the platform PWA chrome, shared by the dev/preview
 * Vite plugin (scripts/grok-pwa-plugin.mjs) and the deployed-app Nitro
 * middleware (server/middleware/grok-pwa.ts). Plain ESM so `node --test` and
 * the Nitro bundler can both consume it.
 */

export const DEFAULT_APP_NAME = "Grok App";

export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/**
 * "wild-race.grok.me" → "Wild Race". Host headers are attacker-controlled, so
 * anything outside a plain [a-z0-9-] slug falls back to the default name.
 */
export function appNameFromHost(hostHeader) {
  const host = String(hostHeader ?? "")
    .split(",")[0]
    .trim()
    .split(":")[0]
    .toLowerCase();
  if (
    !host ||
    host === "localhost" ||
    host.endsWith(".local") ||
    /^\d{1,3}(?:\.\d{1,3}){3}$/.test(host)
  ) {
    return DEFAULT_APP_NAME;
  }
  const slug = host.split(".")[0] ?? "";
  if (!slug || slug === "www" || !/^[a-z0-9-]{1,63}$/.test(slug)) {
    return DEFAULT_APP_NAME;
  }
  return (
    slug
      .split("-")
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ") || DEFAULT_APP_NAME
  );
}

export function isInstallQuery(url) {
  const query = String(url ?? "").split("?", 2)[1] ?? "";
  const params = new URLSearchParams(query);
  const install = params.get("install");
  const platform = (params.get("platform") ?? "").toLowerCase();
  return (install === "1" || install === "true") && platform === "ios";
}

/** Paths that can carry an app document (vs assets / API / internals). */
export function isDocumentPath(pathname) {
  const path = String(pathname ?? "");
  return (
    !path.startsWith("/__grok/") &&
    !path.startsWith("/api/") &&
    !path.startsWith("/@") &&
    !path.startsWith("/node_modules") &&
    !/\.[a-z0-9]+$/i.test(path)
  );
}

export function acceptsHtml(accept) {
  const value = String(accept ?? "");
  return value === "" || value.includes("text/html") || value.includes("*/*");
}

/** The same URL without the install-tutorial params (used as the app link). */
export function stripInstallParams(url) {
  const [path = "/", query = ""] = String(url ?? "/").split("?", 2);
  const params = new URLSearchParams(query);
  params.delete("install");
  params.delete("platform");
  const rest = params.toString();
  return rest ? `${path}?${rest}` : path;
}

export function renderInstallPageHtml(template, { host, url } = {}) {
  return String(template)
    .replaceAll("{{APP_NAME}}", escapeHtml(appNameFromHost(host)))
    .replaceAll("{{APP_URL}}", escapeHtml(stripInstallParams(url)));
}

export function renderWebManifest(hostHeader) {
  const name = appNameFromHost(hostHeader);
  return JSON.stringify(
    {
      name,
      short_name: name,
      id: "/",
      start_url: "/",
      scope: "/",
      display: "standalone",
      background_color: "#000000",
      theme_color: "#000000",
      icons: [
        {
          src: "/__grok/icon-180.png",
          sizes: "180x180",
          type: "image/png",
        },
      ],
    },
    null,
    2,
  );
}

export function grokPwaHeadTags(appName = DEFAULT_APP_NAME) {
  return [
    // Standalone display comes from the manifest ("display": "standalone");
    // the legacy *-web-app-capable metas it replaces are deliberately absent.
    ["manifest", '<link rel="manifest" href="/__grok/manifest.webmanifest">'],
    ["apple-touch-icon", '<link rel="apple-touch-icon" href="/__grok/icon-180.png">'],
    [
      "apple-mobile-web-app-title",
      `<meta name="apple-mobile-web-app-title" content="${escapeHtml(appName)}">`,
    ],
    [
      "apple-mobile-web-app-status-bar-style",
      '<meta name="apple-mobile-web-app-status-bar-style" content="black">',
    ],
    ["theme-color", '<meta name="theme-color" content="#000000">'],
    ["twitter:card", '<meta name="twitter:card" content="summary_large_image">'],
  ];
}

export const GROK_EXTENSIONS_SCRIPT_SRC = "https://grok.com/grok-app-builder/extensions.js";

export function readGrokProjectId() {
  const fromProcess = typeof process !== "undefined" ? process.env?.VITE_PROJECT_ID : "";
  return String(fromProcess ?? "").trim();
}

export function readXCreator() {
  const fromProcess = typeof process !== "undefined" ? process.env?.X_CREATOR : "";
  return String(fromProcess ?? "").trim();
}

export function readXCreatorId() {
  const fromProcess = typeof process !== "undefined" ? process.env?.X_CREATOR_ID : "";
  return String(fromProcess ?? "").trim();
}

export function grokXCreatorHeadTags(creator = readXCreator(), creatorId = readXCreatorId()) {
  const name = String(creator ?? "").trim();
  const id = String(creatorId ?? "").trim();
  if (!name || !id) return [];
  return [
    `<meta property="x:creator" content="${escapeHtml(name)}">`,
    `<meta property="x:creator:id" content="${escapeHtml(id)}">`,
  ];
}

/** Platform "Created with Grok" banner — injected into every HTML document. */
export function grokExtensionsHeadTags(projectId = readGrokProjectId()) {
  const id = escapeHtml(projectId);
  const tags = [];
  if (projectId) {
    tags.push(`<meta name="grok-project-id" content="${id}">`);
  }
  tags.push(
    `<script src="${GROK_EXTENSIONS_SCRIPT_SRC}"${
      projectId ? ` data-project-id="${id}"` : ""
    } defer></script>`,
  );
  return tags;
}

export function injectGrokPwaHead(
  html,
  appName = DEFAULT_APP_NAME,
  projectId = readGrokProjectId(),
  creator = readXCreator(),
  creatorId = readXCreatorId(),
) {
  if (typeof html !== "string") return html;
  const missing = grokPwaHeadTags(appName)
    .filter(([key]) => {
      if (key === "manifest") return !html.includes('href="/__grok/manifest.webmanifest"');
      if (key === "apple-touch-icon") return !html.includes('href="/__grok/icon-180.png"');
      if (key === "twitter:card") {
        return (
          !html.includes('name="twitter:card"') &&
          !html.includes("name='twitter:card'") &&
          !html.includes('property="twitter:card"')
        );
      }
      return !html.includes(`name="${key}"`);
    })
    .map(([, tag]) => tag);
  if (!html.includes("/grok-app-builder/extensions.js")) {
    missing.push(...grokExtensionsHeadTags(projectId));
  } else if (projectId && !html.includes('name="grok-project-id"')) {
    missing.push(`<meta name="grok-project-id" content="${escapeHtml(projectId)}">`);
  }
  if (
    projectId &&
    !html.includes('property="grok:app_id"') &&
    !html.includes("property='grok:app_id'")
  ) {
    missing.push(`<meta property="grok:app_id" content="${escapeHtml(projectId)}">`);
  }
  const creatorTags = grokXCreatorHeadTags(creator, creatorId);
  if (creatorTags.length > 0) {
    const hasCreator =
      html.includes('property="x:creator" content=') ||
      html.includes("property='x:creator' content=");
    if (!hasCreator) {
      missing.push(creatorTags[0]);
    }
    if (!html.includes('property="x:creator:id"')) {
      missing.push(creatorTags[1]);
    }
  }
  if (missing.length === 0) return html;
  const snippet = missing.join("");
  if (html.includes("</head>")) return html.replace("</head>", `${snippet}</head>`);
  if (html.includes("<head>")) return html.replace("<head>", `<head>${snippet}`);
  return html;
}

const HEAD_CLOSE = Buffer.from("</head>");

/**
 * Streaming head injector: buffers only until `</head>` (multi-byte safe — the
 * marker is pure ASCII, which never appears inside a UTF-8 continuation byte),
 * injects any missing tags there, then passes every later chunk through
 * untouched so streaming SSR keeps streaming.
 */
export function createHeadInjector(
  appName = DEFAULT_APP_NAME,
  projectId = readGrokProjectId(),
  creator = readXCreator(),
  creatorId = readXCreatorId(),
) {
  /** @type {Buffer[]} */
  let pending = [];
  let done = false;

  return {
    /** @param {Uint8Array | string} chunk @returns {Buffer[]} chunks ready to emit */
    push(chunk) {
      const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      if (done) return [buf];
      pending.push(buf);
      const joined = Buffer.concat(pending);
      const at = joined.indexOf(HEAD_CLOSE);
      if (at === -1) return [];
      done = true;
      pending = [];
      const head = injectGrokPwaHead(
        joined.subarray(0, at).toString("utf8") + "</head>",
        appName,
        projectId,
        creator,
        creatorId,
      );
      return [Buffer.concat([Buffer.from(head, "utf8"), joined.subarray(at + HEAD_CLOSE.length)])];
    },
    /** @returns {Buffer[]} whatever is still buffered (no `</head>` seen) */
    flush() {
      if (done || pending.length === 0) return [];
      const rest = Buffer.concat(pending);
      pending = [];
      done = true;
      return [
        Buffer.from(
          injectGrokPwaHead(rest.toString("utf8"), appName, projectId, creator, creatorId),
          "utf8",
        ),
      ];
    },
  };
}
