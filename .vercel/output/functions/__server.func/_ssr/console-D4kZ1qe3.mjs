import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { b as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { N as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Button } from "./button-BA6TrrCs.mjs";
import { s as listMyProjects, t as createMyProject } from "./actions-C5eGTJR_.mjs";
import { i as signOut } from "./client-kg1JE--1.mjs";
import { n as useCurrentUser, t as Logo } from "./use-current-user-EIDr_S1O.mjs";
import { t as Input } from "./input-1rg6ADoW.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/console-D4kZ1qe3.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Picker() {
	const user = useCurrentUser();
	const navigate = useNavigate();
	const [projects, setProjects] = (0, import_react.useState)(null);
	const [name, setName] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		listMyProjects().then(setProjects).catch(() => setProjects([]));
	}, []);
	async function onCreate(event) {
		event.preventDefault();
		setBusy(true);
		try {
			const project = await createMyProject({ data: { name } });
			toast.success("Project created");
			navigate({
				to: "/console/$projectId",
				params: { projectId: project.id }
			});
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not create project");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-screen bg-bg px-4 py-10",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-3xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "sm",
						onClick: () => void signOut("/"),
						children: "Sign out"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-10 text-xs uppercase tracking-[0.22em] text-subtle",
					children: "Console"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-2 font-display text-4xl tracking-tight md:text-5xl",
					children: "Pick your fighter"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 text-muted",
					children: [user?.displayName ? `${user.displayName}, choose` : "Choose", " a project or stand up a new one."]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-10 grid gap-3",
					children: projects === null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-24 animate-pulse rounded-xl bg-surface" }) : projects.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "rounded-xl bg-surface p-6 text-sm text-muted shadow-[var(--shadow-border)]",
						children: "No projects yet. Create one to get a namespace, API keys, and a file store."
					}) : projects.map((project) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "flex items-center justify-between rounded-xl bg-surface px-5 py-4 text-left shadow-[var(--shadow-border)] transition-shadow hover:shadow-[var(--shadow-border-hover)]",
						onClick: () => void navigate({
							to: "/console/$projectId",
							params: { projectId: project.id }
						}),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-base font-medium",
							children: project.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-xs text-subtle",
							children: project.namespace
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs uppercase tracking-wider text-muted",
							children: project.plan
						})]
					}, project.id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: onCreate,
					className: "mt-10 rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "text-sm text-muted",
						htmlFor: "project-name",
						children: "New project"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 flex flex-col gap-2 sm:flex-row",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "project-name",
							value: name,
							onChange: (e) => setName(e.target.value),
							placeholder: "Launch pad",
							required: true
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							disabled: busy,
							children: busy ? "Creating" : "Create project"
						})]
					})]
				})
			]
		})
	});
}
//#endregion
export { Picker as component };
