import { o as __toESM } from "./_runtime.mjs";
import { y as getPlan } from "./_ssr/store-C324kcPI.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { v as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { N as require_jsx_runtime } from "./_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { s as Route$8 } from "./_ssr/router-DA4Yi6rw.mjs";
import { a as formatBytes, t as Button } from "./_ssr/button-BA6TrrCs.mjs";
import { o as getProjectOverview } from "./_ssr/actions-C5eGTJR_.mjs";
import { t as Progress } from "./_ssr/progress-BsDL2Fel.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_projectId-DGY-oues.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Overview() {
	const { projectId } = Route$8.useParams();
	const [data, setData] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		getProjectOverview({ data: { projectId } }).then(setData).catch((err) => setError(err.message));
	}, [projectId]);
	if (error) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-danger",
		children: error
	});
	if (!data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-40 animate-pulse rounded-xl bg-surface" });
	const plan = getPlan(data.project.plan);
	const storagePct = plan.storageBytes ? data.usage.storageBytes / plan.storageBytes * 100 : 0;
	const bandPct = plan.bandwidthBytes ? data.usage.bandwidthBytes / plan.bandwidthBytes * 100 : 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-4xl space-y-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs uppercase tracking-[0.22em] text-subtle",
					children: "Overview"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-2 font-display text-4xl tracking-tight",
					children: data.project.name
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 font-mono text-sm text-muted",
					children: data.project.namespace
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Files",
						value: String(data.usage.fileCount)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Storage",
						value: formatBytes(data.usage.storageBytes),
						hint: `${Math.min(100, Math.round(storagePct))}% of ${formatBytes(plan.storageBytes)}`,
						pct: storagePct
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Bandwidth",
						value: formatBytes(data.usage.bandwidthBytes),
						hint: `${Math.min(100, Math.round(bandPct))}% of ${formatBytes(plan.bandwidthBytes)}`,
						pct: bandPct
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted",
					children: [
						"Plan ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-fg",
							children: plan.name
						}),
						" · ",
						formatBytes(plan.maxUploadBytes),
						" max upload ·",
						" ",
						plan.privateUploads ? "private files enabled" : "public files only"
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						size: "sm",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/console/$projectId/playground",
							params: { projectId },
							children: "Open playground"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						size: "sm",
						variant: "secondary",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/console/$projectId/keys",
							params: { projectId },
							children: "API keys"
						})
					})]
				})]
			})
		]
	});
}
function Stat({ label, value, hint, pct }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs uppercase tracking-wider text-subtle",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 font-mono text-2xl tabular-nums",
				children: value
			}),
			hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-muted",
				children: hint
			}) : null,
			pct != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
				className: "mt-3",
				value: pct
			}) : null
		]
	});
}
//#endregion
export { Overview as component };
