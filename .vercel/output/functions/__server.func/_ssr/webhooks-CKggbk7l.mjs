import { N as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as CodeBlock } from "./code-block-BHp6DUIJ.mjs";
import { n as DocsLayout, t as DocSection } from "./docs-layout-CX0SfAbk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/webhooks-CKggbk7l.js
var import_jsx_runtime = require_jsx_runtime();
function Page() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DocsLayout, {
		title: "Webhooks",
		lede: "Project-level endpoints. OpenByteShip delivers a signed JSON envelope when files change.",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DocSection, {
				title: "Overview",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "list-disc space-y-2 pl-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Use HTTPS endpoint URLs in production. Localhost HTTP URLs are allowed in development." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Store the signing secret when it is shown. It is revealed only on creation." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Failed deliveries are recorded in the console delivery log." })
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DocSection, {
				title: "Events",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "list-disc space-y-2 pl-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
								className: "text-fg",
								children: "file.uploaded"
							}),
							" — file marked ready. Payload includes ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
								className: "text-fg",
								children: "source"
							}),
							"."
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
							className: "text-fg",
							children: "file.deleted"
						}), " — after a file is marked deleted."] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
							className: "text-fg",
							children: "image.metadata.created"
						}), " — image dimensions extracted."] })
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DocSection, {
				title: "Signatures",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CodeBlock, {
					label: "ts",
					code: `const timestamp = request.headers.get("openbyteship-webhook-timestamp")
const signature = request.headers.get("openbyteship-webhook-signature")
const body = await request.text()

const expected = await hmacSha256Hex(
  endpointSecret,
  \`\${timestamp}.\${body}\`,
)

if (signature !== \`v1=\${expected}\`) {
  throw new Error("Invalid webhook signature")
}`
				})
			})
		]
	});
}
//#endregion
export { Page as component };
