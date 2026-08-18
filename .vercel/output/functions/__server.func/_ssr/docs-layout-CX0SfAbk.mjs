import { d as useRouterState, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { N as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { r as cn } from "./button-BA6TrrCs.mjs";
import { n as SiteHeader, t as SiteFooter } from "./site-footer-j8xfBH0v.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/docs-layout-CX0SfAbk.js
var import_jsx_runtime = require_jsx_runtime();
var NAV = [
	{
		href: "/docs",
		label: "Overview"
	},
	{
		href: "/docs/uploading",
		label: "Uploading a file"
	},
	{
		href: "/docs/delivery",
		label: "Delivery & signed URLs"
	},
	{
		href: "/docs/api-keys",
		label: "API keys"
	},
	{
		href: "/docs/webhooks",
		label: "Webhooks"
	},
	{
		href: "/docs/api",
		label: "API reference"
	},
	{
		href: "/docs/javascript-sdk",
		label: "JavaScript SDK"
	},
	{
		href: "/docs/react-sdk",
		label: "React SDK"
	},
	{
		href: "/docs/python-sdk",
		label: "Python SDK"
	},
	{
		href: "/docs/go-sdk",
		label: "Go SDK"
	},
	{
		href: "/docs/frameworks",
		label: "Frameworks"
	}
];
function DocsLayout({ title, lede, children }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen overflow-x-hidden bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[220px_1fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "min-w-0 lg:sticky lg:top-24 lg:self-start",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-3 text-xs uppercase tracking-wider text-subtle",
						children: "Documentation"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
						className: "flex min-w-0 gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0",
						children: NAV.map((item) => {
							const active = pathname === item.href;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: item.href,
								className: cn("shrink-0 rounded-sm px-3 py-2 text-sm", active ? "bg-elevated text-fg" : "text-muted hover:text-fg"),
								children: item.label
							}, item.href);
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "min-w-0 pb-16",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-display text-4xl tracking-tight md:text-5xl",
							children: title
						}),
						lede ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 max-w-2xl text-lg text-muted",
							children: lede
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-10 space-y-10",
							children
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
function DocSection({ title, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "font-display text-2xl tracking-tight",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-3 text-[15px] leading-relaxed text-muted",
			children
		})]
	});
}
//#endregion
export { DocsLayout as n, DocSection as t };
