import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { N as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as Route$6 } from "./router-DA4Yi6rw.mjs";
import { t as Button } from "./button-BA6TrrCs.mjs";
import { f as revokeProjectKey, l as listProjectKeys, n as createProjectKey } from "./actions-C5eGTJR_.mjs";
import { t as Input } from "./input-1rg6ADoW.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/keys-MXM_qd2X.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var SCOPES = [
	"files:read",
	"files:write",
	"files:delete"
];
function KeysPage() {
	const { projectId } = Route$6.useParams();
	const [keys, setKeys] = (0, import_react.useState)(null);
	const [name, setName] = (0, import_react.useState)("Production");
	const [scopes, setScopes] = (0, import_react.useState)([...SCOPES]);
	const [revealed, setRevealed] = (0, import_react.useState)(null);
	async function reload() {
		setKeys(await listProjectKeys({ data: { projectId } }));
	}
	(0, import_react.useEffect)(() => {
		reload().catch((err) => toast.error(err.message));
	}, [projectId]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-3xl space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs uppercase tracking-[0.22em] text-subtle",
					children: "API keys"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-2 font-display text-4xl tracking-tight",
					children: "Project credentials"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-sm text-muted",
					children: [
						"Keys start with ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
							className: "text-fg",
							children: "obshp_"
						}),
						" and are stored hashed. Copy the secret when it is shown."
					]
				})
			] }),
			revealed ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl bg-elevated p-4 shadow-[var(--shadow-border)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs uppercase tracking-wider text-subtle",
					children: "New key — copy now"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 break-all font-mono text-sm",
					children: revealed
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "space-y-4 rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]",
				onSubmit: async (e) => {
					e.preventDefault();
					try {
						const created = await createProjectKey({ data: {
							projectId,
							name,
							scopes
						} });
						setRevealed(created.token);
						toast.success("API key created");
						await reload();
					} catch (err) {
						toast.error(err instanceof Error ? err.message : "Could not create key");
					}
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
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: SCOPES.map((scope) => {
							const on = scopes.includes(scope);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setScopes((cur) => on ? cur.filter((s) => s !== scope) : [...cur, scope]),
								className: `h-9 rounded-full px-3 font-mono text-xs ${on ? "bg-accent text-accent-fg" : "bg-elevated text-muted"}`,
								children: scope
							}, scope);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						children: "Create key"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-border)]",
				children: keys === null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-24 animate-pulse bg-elevated" }) : keys.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "p-5 text-sm text-muted",
					children: "No keys yet."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { children: keys.map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center justify-between gap-3 border-b border-border px-4 py-3 last:border-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm",
						children: key.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-mono text-xs text-subtle",
						children: [
							key.prefix,
							"… · ",
							key.scopes.join(" ")
						]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "ghost",
						onClick: async () => {
							await revokeProjectKey({ data: {
								projectId,
								keyId: key.id
							} });
							toast.success("Revoked");
							await reload();
						},
						children: "Revoke"
					})]
				}, key.id)) })
			})
		]
	});
}
//#endregion
export { KeysPage as component };
