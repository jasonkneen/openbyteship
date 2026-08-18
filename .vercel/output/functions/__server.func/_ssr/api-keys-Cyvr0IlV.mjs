import { N as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as CodeBlock } from "./code-block-BHp6DUIJ.mjs";
import { n as DocsLayout, t as DocSection } from "./docs-layout-CX0SfAbk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/api-keys-Cyvr0IlV.js
var import_jsx_runtime = require_jsx_runtime();
function Page() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DocsLayout, {
		title: "API keys",
		lede: "API keys belong to projects and control what a trusted server can do.",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DocSection, {
			title: "Project API keys",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
				"Project keys start with ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
					className: "text-fg",
					children: "obshp_"
				}),
				" and are created in the console. Use them only from trusted server code. Keys are stored hashed. OpenByteShip only keeps a short prefix for identification after creation."
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "list-disc space-y-2 pl-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
						className: "text-fg",
						children: "files:read"
					}), " — read metadata, stream bytes, create signed URLs."] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
						className: "text-fg",
						children: "files:write"
					}), " — create upload tokens, create sessions, complete uploads."] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
						className: "text-fg",
						children: "files:delete"
					}), " — delete stored files and their backing objects."] })
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DocSection, {
			title: "Upload tokens",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
				"Upload tokens start with ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
					className: "text-fg",
					children: "obut_"
				}),
				". Mint them on the server and pass them to the browser. They always behave like scoped upload-only credentials and expire."
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CodeBlock, {
				label: "ts",
				code: `const { uploadToken } = await obs.createUploadToken({
  folder: "uploads",
  visibility: "public",
  maxUploadBytes: 10 * 1024 * 1024,
  expiresInSeconds: 900,
})`
			})]
		})]
	});
}
//#endregion
export { Page as component };
