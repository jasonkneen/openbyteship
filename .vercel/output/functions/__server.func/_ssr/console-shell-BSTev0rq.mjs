import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { b as useNavigate, v as Link, x as useParams, y as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { N as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { b as FolderOpen, d as Menu, g as KeyRound, h as LayoutDashboard, n as Webhook, s as Settings, t as X, u as Play } from "../_libs/lucide-react.mjs";
import { r as cn, t as Button } from "./button-BA6TrrCs.mjs";
import { i as signOut } from "./client-kg1JE--1.mjs";
import { r as useCurrentUserState, t as Logo } from "./use-current-user-EIDr_S1O.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/console-shell-BSTev0rq.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Auth state components — plain wrappers around `useCurrentUserState()`.
*
* Auth is ON by default (including the sandbox live preview, which does real
* sign-in). Visitors are signed out until they authenticate. The shared dev
* user only appears when auth is explicitly disabled (`VITE_AUTH_ENABLED=false`).
* While the session is still resolving, gates that care about signed-out state
* render nothing so there's no signed-out flash on hard reload.
*/
/** Where `RedirectToSignIn` sends signed-out visitors. Create this route. */
var SIGN_IN_PATH = "/login";
/**
* Client-side redirect to the sign-in route (TanStack `<Navigate>` — NOT a full
* `window.location` reload). A hard navigation re-bootstraps the SPA and re-runs
* session loading, which feels like a second "Loading…" on /login.
*
* Guard routes by waiting out `isPending` first (see `use-current-user`), then
* render this.
*/
function RedirectToSignIn({ to = SIGN_IN_PATH }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to });
}
var LINKS = [
	{
		to: "/console/$projectId",
		label: "Overview",
		icon: LayoutDashboard
	},
	{
		to: "/console/$projectId/files",
		label: "Files",
		icon: FolderOpen
	},
	{
		to: "/console/$projectId/playground",
		label: "Playground",
		icon: Play
	},
	{
		to: "/console/$projectId/keys",
		label: "API keys",
		icon: KeyRound
	},
	{
		to: "/console/$projectId/webhooks",
		label: "Webhooks",
		icon: Webhook
	},
	{
		to: "/console/$projectId/settings",
		label: "Settings",
		icon: Settings
	}
];
function ConsoleGate({ children }) {
	const { user, isPending } = useCurrentUserState();
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid min-h-screen place-items-center bg-bg text-muted",
		children: "Loading console"
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, { to: "/login" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
function ConsoleShell({ children, projectName }) {
	const projectId = useParams({ strict: false }).projectId;
	const { user } = useCurrentUserState();
	const [open, setOpen] = (0, import_react.useState)(false);
	const navigate = useNavigate();
	(0, import_react.useEffect)(() => {
		setOpen(false);
	}, [projectId]);
	const nav = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
		className: "space-y-1",
		children: LINKS.map((item) => {
			const Icon = item.icon;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: item.to,
				params: { projectId: projectId ?? "" },
				className: "flex items-center gap-2.5 rounded-sm px-3 py-2 text-sm text-muted hover:bg-elevated hover:text-fg [&.active]:bg-elevated [&.active]:text-fg",
				activeOptions: { exact: item.to === "/console/$projectId" },
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" }), item.label]
			}, item.to);
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-bg text-fg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-bg/90 px-4 backdrop-blur md:hidden",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, { compact: true }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "grid size-11 place-items-center rounded-sm hover:bg-elevated",
				onClick: () => setOpen((v) => !v),
				"aria-label": "Menu",
				children: open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-5" })
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "md:grid md:grid-cols-[240px_1fr]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: cn("border-border bg-bg md:sticky md:top-0 md:flex md:h-screen md:flex-col md:border-r md:px-4 md:py-5", open ? "block border-b px-4 py-4" : "hidden md:flex"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mb-6 hidden md:block",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, {})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "mb-5 flex w-full items-center justify-between rounded-md bg-surface px-3 py-2 text-left text-sm shadow-[var(--shadow-border)]",
						onClick: () => void navigate({ to: "/console" }),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "truncate",
							children: projectName ?? "Projects"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-subtle",
							children: "Switch"
						})]
					}),
					nav,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-auto hidden border-t border-border pt-4 md:block",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-sm",
							children: user?.displayName ?? user?.primaryEmail
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "link",
							size: "sm",
							className: "h-auto px-0",
							onClick: () => void signOut("/"),
							children: "Sign out"
						})]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "min-w-0 px-4 py-6 sm:px-8 sm:py-8",
				children
			})]
		})]
	});
}
//#endregion
export { ConsoleShell as n, ConsoleGate as t };
