import { n as PLANS } from "./store-C324kcPI.mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { N as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { a as formatBytes, t as Button } from "./button-BA6TrrCs.mjs";
import { n as SiteHeader, t as SiteFooter } from "./site-footer-j8xfBH0v.mjs";
import { t as Badge } from "./badge-06aK1Ojp.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/pricing-C7-l49cL.js
var import_jsx_runtime = require_jsx_runtime();
function Pricing() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-bg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto max-w-6xl px-4 py-16 sm:px-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs uppercase tracking-[0.22em] text-subtle",
						children: "Pricing"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-3 font-display text-5xl tracking-tight",
						children: "Plans that scale with your files."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 max-w-2xl text-lg text-muted",
						children: "Unlimited projects on every plan. Private uploads start on Lite. Switch plans from project settings in the console."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3",
						children: PLANS.map((plan) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col rounded-xl bg-surface p-6 shadow-[var(--shadow-border)]",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "font-display text-2xl",
										children: plan.name
									}), plan.recommended ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										tone: "accent",
										children: "Recommended"
									}) : null]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-3 font-mono text-2xl tabular-nums",
									children: [plan.price === 0 ? "$0" : `$${plan.price}`, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-sm text-muted",
										children: plan.price === 0 ? "" : " / mo"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 min-h-10 text-sm text-muted",
									children: plan.blurb
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
									className: "mt-5 flex-1 space-y-2 text-sm text-muted",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [formatBytes(plan.storageBytes), " storage"] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [formatBytes(plan.bandwidthBytes), " bandwidth"] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [formatBytes(plan.maxUploadBytes), " max upload"] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Unlimited projects" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: plan.privateUploads ? "Private uploads" : "No private uploads" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: plan.seats === 1 ? "Solo workspace" : `Up to ${plan.seats} team members` })
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									asChild: true,
									className: "mt-6 w-full",
									variant: plan.recommended ? "default" : "secondary",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/login",
										children: plan.price === 0 ? "Start free" : `Choose ${plan.name}`
									})
								})
							]
						}, plan.id))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
//#endregion
export { Pricing as component };
