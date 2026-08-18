import { N as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { r as cn } from "./button-BA6TrrCs.mjs";
import { t as CodeBlock } from "./code-block-BHp6DUIJ.mjs";
import { n as DocsLayout, t as DocSection } from "./docs-layout-CX0SfAbk.mjs";
import { i as Trigger, n as List, r as Root2, t as Content } from "../_libs/radix-ui__react-tabs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/uploading-BpkKIyav.js
var import_jsx_runtime = require_jsx_runtime();
var Tabs = Root2;
function TabsList({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, {
		className: cn("inline-flex gap-1 rounded-md bg-surface p-1 shadow-[var(--shadow-border)]", className),
		...props
	});
}
function TabsTrigger({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trigger, {
		className: cn("rounded-sm px-3 py-1.5 text-sm text-muted transition-colors", "data-[state=active]:bg-elevated data-[state=active]:text-fg", className),
		...props
	});
}
var TabsContent = Content;
function Page() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DocsLayout, {
		title: "Uploading a file",
		lede: "Create an upload, send the bytes, and complete the session from a trusted server.",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DocSection, {
				title: "Upload flow",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "A normal upload has three steps. Create an upload session, upload the file bytes to the returned URL, then complete the session so OpenByteShip can verify and mark the file ready. Use the SDKs to do this in one step." }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "list-disc space-y-2 pl-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
							className: "text-fg",
							children: "visibility: \"public\""
						}), " is the default and is for files that can be delivered directly."] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
							className: "text-fg",
							children: "visibility: \"private\""
						}), " keeps delivery behind signed URLs."] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
								className: "text-fg",
								children: "path"
							}),
							" is the file key, for example ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
								className: "text-fg",
								children: "invoices/2026/may/invoice.pdf"
							}),
							". Uploading to the same path replaces that file."
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Public delivery URLs include the project's short, immutable namespace before the file path." })
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DocSection, {
				title: "Image metadata",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "When an uploaded file is an image, OpenByteShip generates image metadata after the upload completes. That metadata includes the original dimensions. React apps can use it to reserve space and show a color placeholder before the full image loads." })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DocSection, {
				title: "Examples",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
					defaultValue: "sdk",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "sdk",
							children: "SDK"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "api",
							children: "API"
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
							value: "sdk",
							className: "mt-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CodeBlock, {
								label: "ts",
								code: `import { OpenByteShipClient } from "@openbyteship/js"

const obs = new OpenByteShipClient({
  apiKey: process.env.OPENBYTESHIP_API_KEY!,
})

const uploaded = await obs.upload(file, {
  path: "invoices/2026/invoice.pdf",
  visibility: "public",
})

console.log(uploaded.id, uploaded.status)`
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
							value: "api",
							className: "mt-4 space-y-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CodeBlock, {
								label: "http",
								code: `PUT /v1/files/invoices/2026/invoice.pdf
Authorization: Bearer $OPENBYTESHIP_API_KEY
Content-Type: application/json

{
  "byteSize": 48291,
  "contentType": "application/pdf",
  "method": "auto",
  "visibility": "public"
}`
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
								"Then PUT the bytes to ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
									className: "text-fg",
									children: "upload.url"
								}),
								" and POST ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
									className: "text-fg",
									children: "/upload/complete"
								}),
								"."
							] })]
						})
					]
				})
			})
		]
	});
}
//#endregion
export { Page as component };
