import { N as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as CodeBlock } from "./code-block-BHp6DUIJ.mjs";
import { n as DocsLayout, t as DocSection } from "./docs-layout-CX0SfAbk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/go-sdk-wmKBHMXC.js
var import_jsx_runtime = require_jsx_runtime();
function Page() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DocsLayout, {
		title: "Go SDK",
		lede: "Use from trusted backend services to upload files, mint browser upload tokens, and create signed URLs.",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DocSection, {
			title: "Install",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CodeBlock, {
				label: "bash",
				code: `go get github.com/openbyteship/openbyteship-go`
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DocSection, {
			title: "Upload route",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CodeBlock, {
				label: "go",
				code: `uploaded, err := client.Upload(r.Context(), openbyteship.UploadInput{
  Reader:      file,
  Filename:    header.Filename,
  ContentType: header.Header.Get("Content-Type"),
  Path:        "uploads/" + header.Filename,
  Visibility:  openbyteship.VisibilityPublic,
})`
			})
		})]
	});
}
//#endregion
export { Page as component };
