import { N as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as CodeBlock } from "./code-block-BHp6DUIJ.mjs";
import { n as DocsLayout, t as DocSection } from "./docs-layout-CX0SfAbk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/delivery-CSEGfqY1.js
var import_jsx_runtime = require_jsx_runtime();
function Page() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DocsLayout, {
		title: "Delivery & signed URLs",
		lede: "Public files get a stable CDN-style URL. Private files stay dark until your app issues a signed link.",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DocSection, {
				title: "Public URLs",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Public delivery URLs are constructed as:" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CodeBlock, {
						label: "url",
						code: `https://your-host/f/<project-namespace>/<path>`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
						"Example: ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
							className: "text-fg",
							children: "/f/p_x7K9mQ/invoices/2026/may/invoice.pdf"
						}),
						". The namespace is short and immutable. File IDs are still returned for auditing, but new code should use paths as the primary identifier."
					] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DocSection, {
				title: "Private files",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
					"Private uploads return ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
						className: "text-fg",
						children: "null"
					}),
					" for the public URL. Create a signed URL from server code only after your app has authorized the viewer."
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CodeBlock, {
					label: "ts",
					code: `const { signedUrl } = await obs.createSignedUrl(file.path, {
  expiresInSeconds: 10 * 60,
})

download.href = signedUrl.url`
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DocSection, {
				title: "Image transforms",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
					"Image delivery URLs accept a ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
						className: "text-fg",
						children: "tr"
					}),
					" query, the same idea as Byteship's CDN: ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
						className: "text-fg",
						children: "?tr=w-640,h-360,fit-cover,f-webp"
					}),
					". The React ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
						className: "text-fg",
						children: "Image"
					}),
					" helper maps transform objects onto that query and can show a dominant-color placeholder while the file loads."
				] })
			})
		]
	});
}
//#endregion
export { Page as component };
