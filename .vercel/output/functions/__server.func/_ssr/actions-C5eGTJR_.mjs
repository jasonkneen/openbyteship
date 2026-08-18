import { a as getServerFnById, r as createServerFn, t as TSS_SERVER_FUNCTION } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-CLikvkWD.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/actions-C5eGTJR_.js
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var listMyProjects = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("5add01780ad9c00cb2b6764d082f7c63d152fb3374ab8e9a8d768c57c5c68b3d"));
var createMyProject = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => ({ name: data.name.trim().slice(0, 60) || "Untitled project" })).handler(createSsrRpc("2194d87d4e616944e149c2ea1c6fab0ef25affdd26f61a4a2b20fca87fafe0ad"));
var getProjectOverview = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("67724aeab29cc6a742ed1c95eed16caca9ffb31b5d38d30ff4431cbc9f8e4b77"));
var listProjectFiles = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("61700d3fe0ca4d2c65e05cb691e2fd3f76ab7c962feeb01b14643d0c6bf72054"));
var listProjectKeys = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("d5d175688d3313a4539e4d5687d9a9f869ed8d531bcd2ea8a46a543a99cbf0bc"));
var createProjectKey = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("a3ff22894432ae75e602e1b9923cc84a724eaaaf66344c26fcb5939e25fb72b7"));
var revokeProjectKey = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("e6f77c31431943b92b08fe4a474c5f8ddc98192d01a6572df85819e903ae4533"));
var mintProjectUploadToken = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("d24987677366b9d9431e6e96781c4791d8ec31ed928f3282a2d0e7e3845b6925"));
var updateProjectSettings = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("bac1a5d74f7c72987915d2cb2ae4b1a3e5fb50870598e4703bc87ae10d69e62c"));
var destroyProject = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("af9ebe018987cd2bd3453bf6154b8838dfc706f44733f1fb051801249f1ef9f6"));
var listProjectWebhooks = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("cccdef202b141b10a2d1bffcac5398ffedfe48a9edefe23054311da3ed89e195"));
var createProjectWebhook = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("3e61997d56a821a610ca3d9829b3a4b2bbf8c90b8c58bf91d920f3e0e706c9a1"));
var revokeProjectWebhook = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("f91da6043c439d7927b64e064930caf2e1d8476faff35088fd1b2564e44e381f"));
var deleteProjectFile = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("169f5b4258df47cf7e294a2173f073852fa594a157899643a0d6df857431e1df"));
var signProjectFile = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("28f961c658b2cfdd4263f29627d8dca145ba7123e571a46ecf1c34f1e46a0673"));
//#endregion
export { destroyProject as a, listProjectFiles as c, mintProjectUploadToken as d, revokeProjectKey as f, updateProjectSettings as h, deleteProjectFile as i, listProjectKeys as l, signProjectFile as m, createProjectKey as n, getProjectOverview as o, revokeProjectWebhook as p, createProjectWebhook as r, listMyProjects as s, createMyProject as t, listProjectWebhooks as u };
