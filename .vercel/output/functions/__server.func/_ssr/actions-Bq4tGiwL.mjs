import { D as listWebhookDeliveries, E as listProjectsForUser, F as serializeFile, I as setProjectPlan, L as signUrlForUser, M as renameProject, O as listWebhooks, T as listFiles, c as createProject, d as deleteApiKey, h as deleteWebhook, k as mintUploadToken, m as deleteProject, n as PLANS, o as createApiKey, p as deleteFileForUser, u as createWebhook, w as listApiKeys, x as getProjectForUser, z as usageForProject } from "./store-C324kcPI.mjs";
import { r as createServerFn, t as TSS_SERVER_FUNCTION } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-CLikvkWD.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/actions-Bq4tGiwL.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var listMyProjects_createServerFn_handler = createServerRpc({
	id: "5add01780ad9c00cb2b6764d082f7c63d152fb3374ab8e9a8d768c57c5c68b3d",
	name: "listMyProjects",
	filename: "src/lib/obs/actions.ts"
}, (opts) => listMyProjects.__executeServer(opts));
var listMyProjects = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listMyProjects_createServerFn_handler, async ({ context }) => {
	return (await listProjectsForUser(context.userId)).map((p) => ({
		id: p.id,
		name: p.name,
		namespace: p.namespace,
		plan: p.plan,
		createdAt: p.created_at
	}));
});
var createMyProject_createServerFn_handler = createServerRpc({
	id: "2194d87d4e616944e149c2ea1c6fab0ef25affdd26f61a4a2b20fca87fafe0ad",
	name: "createMyProject",
	filename: "src/lib/obs/actions.ts"
}, (opts) => createMyProject.__executeServer(opts));
var createMyProject = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => ({ name: data.name.trim().slice(0, 60) || "Untitled project" })).handler(createMyProject_createServerFn_handler, async ({ context, data }) => {
	const project = await createProject(context.userId, data.name);
	return {
		id: project.id,
		name: project.name,
		namespace: project.namespace,
		plan: project.plan
	};
});
var getProjectOverview_createServerFn_handler = createServerRpc({
	id: "67724aeab29cc6a742ed1c95eed16caca9ffb31b5d38d30ff4431cbc9f8e4b77",
	name: "getProjectOverview",
	filename: "src/lib/obs/actions.ts"
}, (opts) => getProjectOverview.__executeServer(opts));
var getProjectOverview = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((data) => data).handler(getProjectOverview_createServerFn_handler, async ({ context, data }) => {
	const project = await getProjectForUser(context.userId, data.projectId);
	const usage = await usageForProject(project.id);
	return {
		project: {
			id: project.id,
			name: project.name,
			namespace: project.namespace,
			plan: project.plan,
			createdAt: project.created_at
		},
		usage,
		plans: PLANS
	};
});
var listProjectFiles_createServerFn_handler = createServerRpc({
	id: "61700d3fe0ca4d2c65e05cb691e2fd3f76ab7c962feeb01b14643d0c6bf72054",
	name: "listProjectFiles",
	filename: "src/lib/obs/actions.ts"
}, (opts) => listProjectFiles.__executeServer(opts));
var listProjectFiles = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((data) => data).handler(listProjectFiles_createServerFn_handler, async ({ context, data }) => {
	const { project, files } = await listFiles(context.userId, data.projectId, data.prefix);
	return {
		namespace: project.namespace,
		files: files.map((file) => serializeFile(file, "", project.namespace))
	};
});
var listProjectKeys_createServerFn_handler = createServerRpc({
	id: "d5d175688d3313a4539e4d5687d9a9f869ed8d531bcd2ea8a46a543a99cbf0bc",
	name: "listProjectKeys",
	filename: "src/lib/obs/actions.ts"
}, (opts) => listProjectKeys.__executeServer(opts));
var listProjectKeys = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((data) => data).handler(listProjectKeys_createServerFn_handler, async ({ context, data }) => {
	return (await listApiKeys(context.userId, data.projectId)).map((k) => ({
		id: k.id,
		name: k.name,
		prefix: k.prefix,
		scopes: k.scopes.split(","),
		createdAt: k.created_at,
		lastUsedAt: k.last_used_at
	}));
});
var createProjectKey_createServerFn_handler = createServerRpc({
	id: "a3ff22894432ae75e602e1b9923cc84a724eaaaf66344c26fcb5939e25fb72b7",
	name: "createProjectKey",
	filename: "src/lib/obs/actions.ts"
}, (opts) => createProjectKey.__executeServer(opts));
var createProjectKey = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createProjectKey_createServerFn_handler, async ({ context, data }) => {
	const scopes = data.scopes.length ? data.scopes : [
		"files:read",
		"files:write",
		"files:delete"
	];
	return createApiKey(context.userId, data.projectId, data.name.trim() || "Default", scopes);
});
var revokeProjectKey_createServerFn_handler = createServerRpc({
	id: "e6f77c31431943b92b08fe4a474c5f8ddc98192d01a6572df85819e903ae4533",
	name: "revokeProjectKey",
	filename: "src/lib/obs/actions.ts"
}, (opts) => revokeProjectKey.__executeServer(opts));
var revokeProjectKey = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(revokeProjectKey_createServerFn_handler, async ({ context, data }) => {
	await deleteApiKey(context.userId, data.projectId, data.keyId);
	return { ok: true };
});
var mintProjectUploadToken_createServerFn_handler = createServerRpc({
	id: "d24987677366b9d9431e6e96781c4791d8ec31ed928f3282a2d0e7e3845b6925",
	name: "mintProjectUploadToken",
	filename: "src/lib/obs/actions.ts"
}, (opts) => mintProjectUploadToken.__executeServer(opts));
var mintProjectUploadToken = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(mintProjectUploadToken_createServerFn_handler, async ({ context, data }) => {
	return mintUploadToken({
		userId: context.userId,
		projectId: data.projectId
	}, {
		folder: data.folder,
		visibility: data.visibility,
		maxUploadBytes: data.maxUploadBytes,
		expiresInSeconds: data.expiresInSeconds
	});
});
var updateProjectSettings_createServerFn_handler = createServerRpc({
	id: "bac1a5d74f7c72987915d2cb2ae4b1a3e5fb50870598e4703bc87ae10d69e62c",
	name: "updateProjectSettings",
	filename: "src/lib/obs/actions.ts"
}, (opts) => updateProjectSettings.__executeServer(opts));
var updateProjectSettings = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(updateProjectSettings_createServerFn_handler, async ({ context, data }) => {
	if (data.name) await renameProject(context.userId, data.projectId, data.name.trim().slice(0, 60));
	if (data.plan) await setProjectPlan(context.userId, data.projectId, data.plan);
	const project = await getProjectForUser(context.userId, data.projectId);
	return {
		id: project.id,
		name: project.name,
		namespace: project.namespace,
		plan: project.plan
	};
});
var destroyProject_createServerFn_handler = createServerRpc({
	id: "af9ebe018987cd2bd3453bf6154b8838dfc706f44733f1fb051801249f1ef9f6",
	name: "destroyProject",
	filename: "src/lib/obs/actions.ts"
}, (opts) => destroyProject.__executeServer(opts));
var destroyProject = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(destroyProject_createServerFn_handler, async ({ context, data }) => {
	await deleteProject(context.userId, data.projectId);
	return { ok: true };
});
var listProjectWebhooks_createServerFn_handler = createServerRpc({
	id: "cccdef202b141b10a2d1bffcac5398ffedfe48a9edefe23054311da3ed89e195",
	name: "listProjectWebhooks",
	filename: "src/lib/obs/actions.ts"
}, (opts) => listProjectWebhooks.__executeServer(opts));
var listProjectWebhooks = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((data) => data).handler(listProjectWebhooks_createServerFn_handler, async ({ context, data }) => {
	const [hooks, deliveries] = await Promise.all([listWebhooks(context.userId, data.projectId), listWebhookDeliveries(context.userId, data.projectId)]);
	return {
		hooks: hooks.map((h) => ({
			id: h.id,
			url: h.url,
			events: h.events.split(","),
			enabled: h.enabled,
			createdAt: h.created_at
		})),
		deliveries: deliveries.map((d) => ({
			id: d.id,
			webhookId: d.webhook_id,
			eventType: d.event_type,
			statusCode: d.status_code,
			success: d.success,
			createdAt: d.created_at,
			url: d.url
		}))
	};
});
var createProjectWebhook_createServerFn_handler = createServerRpc({
	id: "3e61997d56a821a610ca3d9829b3a4b2bbf8c90b8c58bf91d920f3e0e706c9a1",
	name: "createProjectWebhook",
	filename: "src/lib/obs/actions.ts"
}, (opts) => createProjectWebhook.__executeServer(opts));
var createProjectWebhook = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createProjectWebhook_createServerFn_handler, async ({ context, data }) => {
	return createWebhook(context.userId, data.projectId, data);
});
var revokeProjectWebhook_createServerFn_handler = createServerRpc({
	id: "f91da6043c439d7927b64e064930caf2e1d8476faff35088fd1b2564e44e381f",
	name: "revokeProjectWebhook",
	filename: "src/lib/obs/actions.ts"
}, (opts) => revokeProjectWebhook.__executeServer(opts));
var revokeProjectWebhook = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(revokeProjectWebhook_createServerFn_handler, async ({ context, data }) => {
	await deleteWebhook(context.userId, data.projectId, data.webhookId);
	return { ok: true };
});
var deleteProjectFile_createServerFn_handler = createServerRpc({
	id: "169f5b4258df47cf7e294a2173f073852fa594a157899643a0d6df857431e1df",
	name: "deleteProjectFile",
	filename: "src/lib/obs/actions.ts"
}, (opts) => deleteProjectFile.__executeServer(opts));
var deleteProjectFile = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(deleteProjectFile_createServerFn_handler, async ({ context, data }) => {
	return deleteFileForUser(context.userId, data.projectId, data.path, "");
});
var signProjectFile_createServerFn_handler = createServerRpc({
	id: "28f961c658b2cfdd4263f29627d8dca145ba7123e571a46ecf1c34f1e46a0673",
	name: "signProjectFile",
	filename: "src/lib/obs/actions.ts"
}, (opts) => signProjectFile.__executeServer(opts));
var signProjectFile = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(signProjectFile_createServerFn_handler, async ({ context, data }) => {
	return signUrlForUser(context.userId, data.projectId, data.path, 900, "");
});
//#endregion
export { createMyProject_createServerFn_handler, createProjectKey_createServerFn_handler, createProjectWebhook_createServerFn_handler, deleteProjectFile_createServerFn_handler, destroyProject_createServerFn_handler, getProjectOverview_createServerFn_handler, listMyProjects_createServerFn_handler, listProjectFiles_createServerFn_handler, listProjectKeys_createServerFn_handler, listProjectWebhooks_createServerFn_handler, mintProjectUploadToken_createServerFn_handler, revokeProjectKey_createServerFn_handler, revokeProjectWebhook_createServerFn_handler, signProjectFile_createServerFn_handler, updateProjectSettings_createServerFn_handler };
