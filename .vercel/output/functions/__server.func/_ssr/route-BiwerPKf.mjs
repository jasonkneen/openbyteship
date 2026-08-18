import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { m as Outlet } from "../_libs/@tanstack/react-router+[...].mjs";
import { N as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { c as Route$22 } from "./router-DA4Yi6rw.mjs";
import { o as getProjectOverview } from "./actions-C5eGTJR_.mjs";
import { n as ConsoleShell } from "./console-shell-BSTev0rq.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/route-BiwerPKf.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ProjectLayout() {
	const { projectId } = Route$22.useParams();
	const [name, setName] = (0, import_react.useState)();
	(0, import_react.useEffect)(() => {
		getProjectOverview({ data: { projectId } }).then((data) => setName(data.project.name)).catch(() => setName("Project"));
	}, [projectId]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConsoleShell, {
		projectName: name,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
	});
}
//#endregion
export { ProjectLayout as component };
