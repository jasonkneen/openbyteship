import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { N as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as Route$3 } from "./router-DA4Yi6rw.mjs";
import { t as Button } from "./button-BA6TrrCs.mjs";
import { p as revokeProjectWebhook, r as createProjectWebhook, u as listProjectWebhooks } from "./actions-C5eGTJR_.mjs";
import { t as Input } from "./input-1rg6ADoW.mjs";
import { t as Badge } from "./badge-06aK1Ojp.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/webhooks-BcBtgTC4.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var WEBHOOK_EVENTS = [
	"file.uploaded",
	"file.deleted",
	"image.metadata.created"
];
function WebhooksPage() {
	const { projectId } = Route$3.useParams();
	const [data, setData] = (0, import_react.useState)(null);
	const [url, setUrl] = (0, import_react.useState)("https://example.com/webhooks/obs");
	const [events, setEvents] = (0, import_react.useState)(["file.uploaded", "file.deleted"]);
	const [secret, setSecret] = (0, import_react.useState)(null);
	async function reload() {
		setData(await listProjectWebhooks({ data: { projectId } }));
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
					children: "Webhooks"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-2 font-display text-4xl tracking-tight",
					children: "Event delivery"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: "Signed JSON envelopes on upload, delete, and image metadata. Store the secret when it is shown."
				})
			] }),
			secret ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl bg-elevated p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs uppercase tracking-wider text-subtle",
					children: "Signing secret"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 break-all font-mono text-sm",
					children: secret
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "space-y-4 rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]",
				onSubmit: async (e) => {
					e.preventDefault();
					try {
						const created = await createProjectWebhook({ data: {
							projectId,
							url,
							events
						} });
						setSecret(created.secret);
						toast.success("Endpoint created");
						await reload();
					} catch (err) {
						toast.error(err instanceof Error ? err.message : "Could not create webhook");
					}
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block text-sm text-muted",
						children: ["Endpoint URL", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							className: "mt-1 font-mono",
							value: url,
							onChange: (e) => setUrl(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: WEBHOOK_EVENTS.map((event) => {
							const on = events.includes(event);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: `h-9 rounded-full px-3 font-mono text-xs ${on ? "bg-accent text-accent-fg" : "bg-elevated text-muted"}`,
								onClick: () => setEvents((cur) => on ? cur.filter((x) => x !== event) : [...cur, event]),
								children: event
							}, event);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						children: "Add endpoint"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-border)]",
				children: [data?.hooks.map((hook) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-3 border-b border-border px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate font-mono text-sm",
							children: hook.url
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-subtle",
							children: hook.events.join(", ")
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "ghost",
						onClick: async () => {
							await revokeProjectWebhook({ data: {
								projectId,
								webhookId: hook.id
							} });
							await reload();
						},
						children: "Remove"
					})]
				}, hook.id)), data && data.hooks.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "p-5 text-sm text-muted",
					children: "No endpoints yet."
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl",
				children: "Recent deliveries"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-border)]",
				children: data?.deliveries.length ? data.deliveries.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-3 border-b border-border px-4 py-3 last:border-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-sm",
						children: d.eventType
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate text-xs text-subtle",
						children: d.url
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: d.success ? "ok" : "danger",
						children: d.success ? d.statusCode ?? "ok" : "failed"
					})]
				}, d.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "p-5 text-sm text-muted",
					children: "No deliveries yet."
				})
			})] })
		]
	});
}
//#endregion
export { WebhooksPage as component };
