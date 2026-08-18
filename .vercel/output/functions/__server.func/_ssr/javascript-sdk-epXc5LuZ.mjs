import { N as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as CodeBlock } from "./code-block-BHp6DUIJ.mjs";
import { n as DocsLayout, t as DocSection } from "./docs-layout-CX0SfAbk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/javascript-sdk-epXc5LuZ.js
var import_jsx_runtime = require_jsx_runtime();
function Page() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DocsLayout, {
		title: "JavaScript SDK",
		lede: "Wraps upload sessions, direct file uploads, upload tokens, signed URLs, file lookup, and deletes.",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DocSection, {
				title: "Install",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CodeBlock, {
					label: "bash",
					code: `npm add @openbyteship/js`
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "The in-product playground uses the same client against this origin — copy the API, not a published package name, if you are running OpenByteShip itself." })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DocSection, {
				title: "Create a client",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CodeBlock, {
					label: "ts",
					code: `import { OpenByteShipClient } from "@openbyteship/js"

const obs = new OpenByteShipClient({
  apiKey: process.env.OPENBYTESHIP_API_KEY!,
})

// Browser
const browser = new OpenByteShipClient({ uploadToken: token })`
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
					"Never ship an ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
						className: "text-fg",
						children: "obshp_..."
					}),
					" project API key to the browser."
				] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DocSection, {
				title: "Upload a file",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CodeBlock, {
					label: "ts",
					code: `const uploaded = await obs.upload(file, {
  path: "invoices/2026/invoice.pdf",
  metadata: { customerId: "cus_123" },
  visibility: "public",
  onProgress: (progress) => {
    console.log(Math.round(progress.percent))
  },
})`
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DocSection, {
				title: "Multiple files",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CodeBlock, {
					label: "ts",
					code: `const results = await obs.uploadMany(files, {
  concurrency: 3,
  pathPrefix: "gallery",
  visibility: "public",
})

const uploaded = results
  .filter((item) => item.status === "fulfilled")
  .map((item) => item.result)`
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DocSection, {
				title: "File methods",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CodeBlock, {
					label: "ts",
					code: `const { file } = await obs.getFile("invoices/2026/invoice.pdf")
const { signedUrl } = await obs.createSignedUrl(file.path, {
  expiresInSeconds: 10 * 60,
})
const deleted = await obs.deleteFile(file.path)`
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DocSection, {
				title: "Manual flow",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CodeBlock, {
					label: "ts",
					code: `const created = await obs.createFileUpload("manual/invoice.pdf", {
  byteSize: file.size,
  contentType: file.type || "application/octet-stream",
  method: "single",
})

await fetch(created.upload.url, {
  method: "PUT",
  headers: created.upload.headers,
  body: file,
})

const completed = await obs.completePathUpload(created.file.path, {
  uploadId: created.upload.id,
})`
				})
			})
		]
	});
}
//#endregion
export { Page as component };
