import { o as __toESM } from "../_runtime.mjs";
import { n as PLANS } from "./store-C324kcPI.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { b as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { N as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { r as Route$4 } from "./router-DA4Yi6rw.mjs";
import { a as formatBytes, t as Button } from "./button-BA6TrrCs.mjs";
import { a as destroyProject, h as updateProjectSettings, o as getProjectOverview } from "./actions-C5eGTJR_.mjs";
import { t as Input } from "./input-1rg6ADoW.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings-DEGo3x_E.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SettingsPage() {
	const { projectId } = Route$4.useParams();
	const navigate = useNavigate();
	const [name, setName] = (0, import_react.useState)("");
	const [plan, setPlan] = (0, import_react.useState)("free");
	const [namespace, setNamespace] = (0, import_react.useState)("");
	const [loaded, setLoaded] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		getProjectOverview({ data: { projectId } }).then((data) => {
			setName(data.project.name);
			setPlan(data.project.plan);
			setNamespace(data.project.namespace);
			setLoaded(true);
		});
	}, [projectId]);
	if (!loaded) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-40 animate-pulse rounded-xl bg-surface" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-3xl space-y-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs uppercase tracking-[0.22em] text-subtle",
				children: "Settings"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 font-display text-4xl tracking-tight",
				children: "Project"
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "space-y-4 rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]",
				onSubmit: async (e) => {
					e.preventDefault();
					await updateProjectSettings({ data: {
						projectId,
						name
					} });
					toast.success("Saved");
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block text-sm text-muted",
						children: ["Name", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							className: "mt-1",
							value: name,
							onChange: (e) => setName(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted",
						children: [
							"Namespace ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-fg",
								children: namespace
							}),
							" is immutable."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						children: "Save name"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3 rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl",
						children: "Plan"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "Demo billing — switch plans here to unlock private uploads and higher limits. No card required."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-2 sm:grid-cols-2",
						children: PLANS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: async () => {
								setPlan(item.id);
								await updateProjectSettings({ data: {
									projectId,
									plan: item.id
								} });
								toast.success(`Plan set to ${item.name}`);
							},
							className: `rounded-md p-4 text-left shadow-[var(--shadow-border)] ${plan === item.id ? "bg-elevated" : "bg-bg"}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-baseline justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item.name }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono text-xs tabular-nums text-muted",
									children: item.price === 0 ? "$0" : `$${item.price}/mo`
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-xs text-subtle",
								children: [
									formatBytes(item.storageBytes),
									" · ",
									item.privateUploads ? "private on" : "public only"
								]
							})]
						}, item.id))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl",
						children: "Danger"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: "Deletes the project, keys, webhooks, and stored objects."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "mt-4",
						variant: "danger",
						onClick: async () => {
							if (!confirm("Delete this project permanently?")) return;
							await destroyProject({ data: { projectId } });
							toast.success("Project deleted");
							navigate({ to: "/console" });
						},
						children: "Delete project"
					})
				]
			})
		]
	});
}
//#endregion
export { SettingsPage as component };
