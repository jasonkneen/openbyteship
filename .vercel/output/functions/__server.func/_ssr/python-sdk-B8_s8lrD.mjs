import { N as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as CodeBlock } from "./code-block-BHp6DUIJ.mjs";
import { n as DocsLayout, t as DocSection } from "./docs-layout-CX0SfAbk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/python-sdk-B8_s8lrD.js
var import_jsx_runtime = require_jsx_runtime();
function Page() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DocsLayout, {
		title: "Python SDK",
		lede: "Use from backend services to upload files, create browser upload tokens, and generate signed URLs.",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DocSection, {
				title: "Install",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CodeBlock, {
					label: "bash",
					code: `pip install openbyteship`
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DocSection, {
				title: "Upload a file",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CodeBlock, {
					label: "python",
					code: `import os
from openbyteship import OpenByteShipClient, Visibility

client = OpenByteShipClient(api_key=os.environ["OPENBYTESHIP_API_KEY"])

with open("photo.jpg", "rb") as photo:
    uploaded = client.upload(
        photo,
        filename="photo.jpg",
        content_type="image/jpeg",
        path="uploads/photo.jpg",
        visibility=Visibility.PUBLIC,
    )

print(uploaded.id, uploaded.url)`
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DocSection, {
				title: "Private files",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CodeBlock, {
					label: "python",
					code: `signed = client.create_signed_url(
    private_file.path,
    expires_in_seconds=15 * 60,
)
download_url = signed.signed_url.url`
				})
			})
		]
	});
}
//#endregion
export { Page as component };
