import { n as PLANS } from "./store-C324kcPI.mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { N as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { A as ArrowRight, _ as Globe, c as Server, f as Lock } from "../_libs/lucide-react.mjs";
import { a as formatBytes, t as Button } from "./button-BA6TrrCs.mjs";
import { t as CodeBlock } from "./code-block-BHp6DUIJ.mjs";
import { n as SiteHeader, t as SiteFooter } from "./site-footer-j8xfBH0v.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CSVF0Z_e.js
var import_jsx_runtime = require_jsx_runtime();
var SAMPLE = `import { OpenByteShipClient } from "@openbyteship/js"

const obs = new OpenByteShipClient({
  apiKey: process.env.OPENBYTESHIP_API_KEY!,
})

const uploaded = await obs.upload(file, {
  path: "invoices/2026/invoice.pdf",
  visibility: "public",
})

console.log(uploaded.url)`;
var FRAMEWORKS = [
	"Next.js",
	"TanStack Start",
	"Astro",
	"Remix",
	"SvelteKit",
	"Express",
	"Hono",
	"Elysia",
	"NestJS"
];
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-bg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "relative overflow-hidden",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgb(18_18_20/0.55),transparent_42%)]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs uppercase tracking-[0.22em] text-subtle",
								children: "Upload · Store · Deliver"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "mt-4 max-w-3xl font-display text-5xl leading-[1.05] tracking-tight sm:text-6xl md:text-7xl",
								children: "Ship uploads, not infrastructure."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-6 max-w-xl text-lg text-muted",
								children: "Handle uploads, storage, and delivery with a single API. No buckets, no edge configs, no headaches."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-8 flex flex-wrap gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									asChild: true,
									size: "lg",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: "/login",
										children: ["Start uploading", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {})]
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									asChild: true,
									variant: "secondary",
									size: "lg",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/docs",
										children: "Read docs"
									})
								})]
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
					className: "border-t border-border",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mx-auto grid max-w-6xl gap-px bg-border px-0 sm:grid-cols-3",
						children: [
							{
								icon: Server,
								title: "Uploads",
								body: "Create a session, stream bytes to storage, complete. The SDK does it in one call."
							},
							{
								icon: Globe,
								title: "Public files",
								body: "Stable delivery URLs with an immutable project namespace in front of every path."
							},
							{
								icon: Lock,
								title: "Private files",
								body: "No public URL. Issue short-lived signed links only after your app approves access."
							}
						].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "bg-bg px-6 py-10 sm:px-8",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, { className: "size-5 text-accent" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "mt-4 font-display text-2xl",
									children: item.title
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm leading-relaxed text-muted",
									children: item.body
								})
							]
						}, item.title))
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mx-auto grid max-w-6xl items-start gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs uppercase tracking-[0.22em] text-subtle",
							children: "JavaScript SDK"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-3 font-display text-4xl tracking-tight",
							children: "One client. Path as the key."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 text-muted",
							children: "Keep the project API key on the server. Mint a short-lived upload token for the browser. Paths replace opaque IDs — uploading to the same path replaces the file."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "outline",
							className: "mt-6",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/docs/javascript-sdk",
								children: "JavaScript SDK"
							})
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CodeBlock, {
						code: SAMPLE,
						label: "typescript"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
					className: "border-y border-border",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mx-auto max-w-6xl px-4 py-16 sm:px-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs uppercase tracking-[0.22em] text-subtle",
								children: "Works with your stack"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-6 flex flex-wrap gap-2",
								children: FRAMEWORKS.map((name) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "rounded-full bg-surface px-4 py-2 text-sm text-muted shadow-[var(--shadow-border)]",
									children: name
								}, name))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/docs/frameworks",
								className: "mt-6 inline-flex items-center gap-1 text-sm text-fg hover:underline",
								children: ["Learn more about frameworks", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })]
							})
						]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mx-auto max-w-6xl px-4 py-20 sm:px-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col justify-between gap-6 md:flex-row md:items-end",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-4xl tracking-tight",
							children: "Plans that scale with your files."
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 max-w-xl text-muted",
							children: "Start free. Private uploads unlock on Lite. Upgrade in the console as traffic grows."
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "secondary",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/pricing",
								children: "See pricing"
							})
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-10 grid gap-4 md:grid-cols-3",
						children: PLANS.slice(0, 3).map((plan) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl bg-surface p-6 shadow-[var(--shadow-border)]",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-baseline justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "font-display text-2xl",
										children: plan.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-mono text-sm tabular-nums text-muted",
										children: plan.price === 0 ? "$0" : `$${plan.price}/mo`
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm text-muted",
									children: plan.blurb
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
									className: "mt-5 space-y-2 text-sm text-muted",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [formatBytes(plan.storageBytes), " storage"] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [formatBytes(plan.bandwidthBytes), " bandwidth"] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [formatBytes(plan.maxUploadBytes), " max upload"] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: plan.privateUploads ? "Private uploads" : "Public uploads only" })
									]
								})
							]
						}, plan.id))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
					className: "border-t border-border",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mx-auto max-w-6xl px-4 py-20 sm:px-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-mono text-sm text-subtle",
								children: "99.999999999% uptime"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-3 max-w-3xl font-display text-4xl tracking-tight md:text-5xl",
								children: "File uploads should be intuitive, fast, secure and reliable."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-5 max-w-2xl text-muted",
								children: "OpenByteShip gives your app scalable file handling without the infra complexity. Ready to ship? Storage, private access, and fast delivery as your app grows."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								size: "lg",
								className: "mt-8",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/login",
									children: ["Start uploading", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {})]
								})
							})
						]
					})
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
//#endregion
export { Home as component };
