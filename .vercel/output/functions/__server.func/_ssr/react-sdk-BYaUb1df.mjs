import { N as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as CodeBlock } from "./code-block-BHp6DUIJ.mjs";
import { n as DocsLayout, t as DocSection } from "./docs-layout-CX0SfAbk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/react-sdk-BYaUb1df.js
var import_jsx_runtime = require_jsx_runtime();
function Page() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DocsLayout, {
		title: "React SDK",
		lede: "Helpers for uploads, progress state, and image placeholders. Built on the JavaScript client.",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DocSection, {
			title: "Single upload",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
				"Mint a token from your server, then pass the client into a hook or call ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
					className: "text-fg",
					children: "upload"
				}),
				" directly."
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CodeBlock, {
				label: "tsx",
				code: `import { OpenByteShipClient } from "@openbyteship/js"
import { useMemo, useState } from "react"

function ReadyUploader({ uploadToken }: { uploadToken: string }) {
  const obs = useMemo(
    () => new OpenByteShipClient({ uploadToken }),
    [uploadToken],
  )
  const [progress, setProgress] = useState(0)

  return (
    <input
      type="file"
      onChange={(event) => {
        const file = event.currentTarget.files?.[0]
        if (file) {
          void obs.upload(file, {
            path: \`avatars/\${file.name}\`,
            onProgress: (p) => setProgress(p.percent),
          })
        }
      }}
    />
  )
}`
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DocSection, {
			title: "Displaying images",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CodeBlock, {
				label: "tsx",
				code: `export function Avatar({ file }: { file: UploadedFile }) {
  const image = file.metadata?.image as { dominantColor?: string } | undefined
  return (
    <img
      alt="User avatar"
      src={file.url ?? undefined}
      width={400}
      height={400}
      style={{ background: image?.dominantColor ?? "#121214" }}
    />
  )
}`
			})
		})]
	});
}
//#endregion
export { Page as component };
