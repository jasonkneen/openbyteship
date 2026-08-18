import { N as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { r as cn } from "./button-BA6TrrCs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/input-1rg6ADoW.js
var import_jsx_runtime = require_jsx_runtime();
function Input({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		className: cn("flex h-11 w-full rounded-sm bg-elevated px-3 text-sm text-fg shadow-[var(--shadow-border)] placeholder:text-subtle", "focus-visible:outline-none focus-visible:shadow-[var(--shadow-border-hover)]", "disabled:opacity-50", className),
		...props
	});
}
//#endregion
export { Input as t };
