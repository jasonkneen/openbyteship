import { N as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { r as cn } from "./button-BA6TrrCs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/progress-BsDL2Fel.js
var import_jsx_runtime = require_jsx_runtime();
function Progress({ value, className }) {
	const clamped = Math.max(0, Math.min(100, value));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("h-1.5 overflow-hidden rounded-full bg-elevated", className),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "h-full rounded-full bg-accent transition-[width] duration-200 ease-[var(--ease-out)]",
			style: { width: `${clamped}%` }
		})
	});
}
//#endregion
export { Progress as t };
