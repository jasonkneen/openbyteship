import { N as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as CodeBlock } from "./code-block-BHp6DUIJ.mjs";
import { n as DocsLayout, t as DocSection } from "./docs-layout-CX0SfAbk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/frameworks-HK8YjpTX.js
var import_jsx_runtime = require_jsx_runtime();
function Page() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DocsLayout, {
		title: "Frameworks",
		lede: "Mint an upload token on the server, then upload from the browser. Same pattern in every stack.",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DocSection, {
				title: "TanStack Start",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CodeBlock, {
					label: "tsx",
					code: `export const Route = createFileRoute("/api/obs/upload-token")({
  server: {
    handlers: {
      POST: async () => {
        const { uploadToken } = await obs.createUploadToken({
          folder: "uploads",
          visibility: "public",
          maxUploadBytes: 10 * 1024 * 1024,
        })
        return Response.json({
          token: uploadToken.token,
          expiresAt: uploadToken.expiresAt,
        })
      },
    },
  },
})`
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DocSection, {
				title: "Next.js",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CodeBlock, {
					label: "ts",
					code: `// app/api/obs/upload-token/route.ts
export async function POST() {
  const { uploadToken } = await obs.createUploadToken({
    folder: "uploads",
    visibility: "public",
    maxUploadBytes: 10 * 1024 * 1024,
  })
  return NextResponse.json({
    token: uploadToken.token,
    expiresAt: uploadToken.expiresAt,
  })
}`
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DocSection, {
				title: "Also documented",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
					"Astro, Remix, SvelteKit, Express, Hono, Elysia, and NestJS follow the same split: keep",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
						className: "text-fg",
						children: "OPENBYTESHIP_API_KEY"
					}),
					" on the server, return an",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
						className: "text-fg",
						children: "obut_"
					}),
					" token to the client, then call",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
						className: "text-fg",
						children: "upload()"
					}),
					"."
				] })
			})
		]
	});
}
//#endregion
export { Page as component };
