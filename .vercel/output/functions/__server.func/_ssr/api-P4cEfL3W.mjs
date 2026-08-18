import { N as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as CodeBlock } from "./code-block-BHp6DUIJ.mjs";
import { n as DocsLayout, t as DocSection } from "./docs-layout-CX0SfAbk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/api-P4cEfL3W.js
var import_jsx_runtime = require_jsx_runtime();
function Page() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DocsLayout, {
		title: "API reference",
		lede: "Base URL is this origin. Every request includes a bearer token.",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DocSection, {
				title: "Authentication",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CodeBlock, {
					label: "http",
					code: `Authorization: Bearer $OPENBYTESHIP_API_KEY`
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "list-disc space-y-2 pl-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
						"Project API key — starts with ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
							className: "text-fg",
							children: "obshp_"
						}),
						"."
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
						"Upload token — starts with ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
							className: "text-fg",
							children: "obut_"
						}),
						"."
					] })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DocSection, {
				title: "Create path upload",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
					className: "text-fg",
					children: "PUT /v1/files/:path"
				}), " — create a session. Path is the key."] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CodeBlock, {
					label: "json",
					code: `{
  "byteSize": 48291,
  "contentType": "application/pdf",
  "method": "auto",
  "visibility": "public",
  "metadata": { "customerId": "cus_123" }
}`
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DocSection, {
				title: "Upload file bytes",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
					className: "text-fg",
					children: "PUT upload.url"
				}), " — send bytes with the exact headers returned by the API. This writes directly to object storage, not the JSON API."] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DocSection, {
				title: "Complete path upload",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
					className: "text-fg",
					children: "POST /v1/files/:path/upload/complete"
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CodeBlock, {
					label: "json",
					code: `{ "uploadId": "<UPLOAD_ID>" }`
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DocSection, {
				title: "Files",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "list-disc space-y-2 pl-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
							className: "text-fg",
							children: "GET /v1/files/:path"
						}), " — JSON metadata when Accept is application/json, otherwise stream bytes."] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
							className: "text-fg",
							children: "POST /v1/files/:path/signed-url"
						}), " — temporary delivery URL."] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
							className: "text-fg",
							children: "DELETE /v1/files/:path"
						}), " — mark deleted and drop the object."] })
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DocSection, {
				title: "Upload tokens",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
					className: "text-fg",
					children: "POST /v1/upload-tokens"
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CodeBlock, {
					label: "json",
					code: `{
  "folder": "uploads",
  "visibility": "public",
  "maxUploadBytes": 10485760,
  "expiresInSeconds": 900
}`
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DocSection, {
				title: "Errors",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
					"Error responses use a stable ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
						className: "text-fg",
						children: "error"
					}),
					" string. Common status codes: 400 invalid, 401 unauthorized, 403 scope or plan, 404 missing, 409 conflict, 410 expired, 413 too large."
				] })
			})
		]
	});
}
//#endregion
export { Page as component };
