import { N as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { r as cn } from "./button-BA6TrrCs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/badge-06aK1Ojp.js
var import_jsx_runtime = require_jsx_runtime();
function Badge({ className, tone = "neutral", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide uppercase", tone === "neutral" && "bg-elevated text-muted", tone === "ok" && "bg-ok/15 text-ok", tone === "danger" && "bg-danger/15 text-danger", tone === "accent" && "bg-accent text-accent-fg", className),
		...props
	});
}
//#endregion
export { Badge as t };
