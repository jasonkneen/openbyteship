import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { N as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { i as Route$5 } from "./router-DA4Yi6rw.mjs";
import { t as Button } from "./button-BA6TrrCs.mjs";
import { d as mintProjectUploadToken } from "./actions-C5eGTJR_.mjs";
import { t as Progress } from "./progress-BsDL2Fel.mjs";
import { t as CodeBlock } from "./code-block-BHp6DUIJ.mjs";
import { t as Input } from "./input-1rg6ADoW.mjs";
import { t as OpenByteShipClient } from "./sdk-CfZxGCEV.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/playground-BoupKYL-.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Playground() {
	const { projectId } = Route$5.useParams();
	const [path, setPath] = (0, import_react.useState)("playground/hello.txt");
	const [visibility, setVisibility] = (0, import_react.useState)("public");
	const [progress, setProgress] = (0, import_react.useState)(0);
	const [status, setStatus] = (0, import_react.useState)("idle");
	const [file, setFile] = (0, import_react.useState)(null);
	async function upload(selected) {
		setStatus("uploading");
		setProgress(0);
		setFile(null);
		try {
			const token = await mintProjectUploadToken({ data: {
				projectId,
				folder: path.includes("/") ? path.split("/").slice(0, -1).join("/") : void 0,
				visibility
			} });
			const uploaded = await new OpenByteShipClient({ uploadToken: token.token }).upload(selected, {
				path,
				visibility,
				onProgress: (p) => setProgress(p.percent)
			});
			setFile(uploaded);
			setStatus("ready");
			toast.success("Upload complete");
		} catch (err) {
			setStatus("error");
			toast.error(err instanceof Error ? err.message : "Upload failed");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-3xl space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs uppercase tracking-[0.22em] text-subtle",
					children: "Playground"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-2 font-display text-4xl tracking-tight",
					children: "Try the upload flow"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-sm text-muted",
					children: [
						"Mints a short-lived ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
							className: "text-fg",
							children: "obut_"
						}),
						" token, then runs create → PUT bytes → complete."
					]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4 rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block text-sm text-muted",
						children: ["Path", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							className: "mt-1 font-mono",
							value: path,
							onChange: (e) => setPath(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex gap-2",
						children: ["public", "private"].map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setVisibility(value),
							className: `h-11 rounded-sm px-4 text-sm ${visibility === value ? "bg-accent text-accent-fg" : "bg-elevated text-muted"}`,
							children: value
						}, value))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "file",
						className: "block w-full text-sm text-muted file:mr-3 file:h-11 file:rounded-sm file:border-0 file:bg-elevated file:px-4 file:text-fg",
						onChange: (e) => {
							const selected = e.currentTarget.files?.[0];
							if (selected) upload(selected);
						}
					}),
					status === "uploading" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, { value: progress }) : null,
					file ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-ok",
							children: ["Ready · ", file.path]
						}), file.url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: file.url,
							className: "break-all font-mono text-xs text-fg underline",
							target: "_blank",
							rel: "noreferrer",
							children: file.url
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-muted",
							children: "Private file — no public URL."
						})]
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CodeBlock, {
				label: "ts",
				code: `const obs = new OpenByteShipClient({ uploadToken })
await obs.upload(file, {
  path: "${path}",
  visibility: "${visibility}",
})`
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				variant: "outline",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					href: "/docs/javascript-sdk",
					children: "Read the SDK"
				})
			})
		]
	});
}
//#endregion
export { Playground as component };
