import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { N as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as CodeBlock } from "./code-block-BHp6DUIJ.mjs";
import { n as DocsLayout, t as DocSection } from "./docs-layout-CX0SfAbk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/docs-DY2yHS3x.js
var import_jsx_runtime = require_jsx_runtime();
function Page() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DocsLayout, {
		title: "Overview",
		lede: "The short version of how OpenByteShip fits into your app: create uploads, stream files, and deliver them from one API.",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DocSection, {
				title: "What it does",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "OpenByteShip gives every project one place for upload sessions, object storage, delivery URLs, API keys, and usage limits. Your app asks OpenByteShip for an upload, sends bytes directly to storage, then completes the upload so the file can be delivered." })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DocSection, {
				title: "Model",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "list-disc space-y-2 pl-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
							className: "text-fg",
							children: "Uploads."
						}), " Create a session, upload to the returned URL, then complete it."] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
							className: "text-fg",
							children: "Files."
						}), " Store public and private files with stable file paths and metadata."] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
							className: "text-fg",
							children: "Delivery."
						}), " Public files get stable delivery URLs; private files use signed URLs."] })
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DocSection, {
				title: "Quick start",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
					"Sign in to the ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/console",
						className: "text-fg underline underline-offset-4",
						children: "console"
					}),
					", create a project, mint an API key with ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
						className: "text-fg",
						children: "files:write"
					}),
					", then upload:"
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CodeBlock, {
					label: "ts",
					code: `import { OpenByteShipClient } from "@openbyteship/js"

const obs = new OpenByteShipClient({
  apiKey: process.env.OPENBYTESHIP_API_KEY!,
})

const uploaded = await obs.upload(file, {
  path: "avatars/me.jpg",
  visibility: "public",
})`
				})]
			})
		]
	});
}
//#endregion
export { Page as component };
