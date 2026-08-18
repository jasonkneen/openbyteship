import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import {
  createApiKey,
  createProject,
  createWebhook,
  deleteApiKey,
  deleteFileForUser,
  deleteProject,
  deleteWebhook,
  getProjectForUser,
  getWebhookForUser,
  listApiKeys,
  listFiles,
  listActivityForUser,
  listProjectsForUser,
  listWebhookDeliveries,
  listDeliveriesForWebhook,
  listWebhooks,
  mintUploadToken,
  renameProject,
  resetWebhookSecret,
  serializeFile,
  setProjectPlan,
  signUrlForUser,
  updateWebhook,
  usageForProject,
} from "./store";
import { PLANS } from "./plans";

export const listMyProjects = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const rows = await listProjectsForUser(context.userId);
    return rows.map((p) => ({
      id: p.id,
      name: p.name,
      namespace: p.namespace,
      plan: p.plan,
      createdAt: p.created_at,
    }));
  });

export const createMyProject = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { name: string }) => ({ name: data.name.trim().slice(0, 60) || "Untitled project" }))
  .handler(async ({ context, data }) => {
    const project = await createProject(context.userId, data.name);
    return { id: project.id, name: project.name, namespace: project.namespace, plan: project.plan };
  });

export const getProjectOverview = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((data: { projectId: string }) => data)
  .handler(async ({ context, data }) => {
    const project = await getProjectForUser(context.userId, data.projectId);
    const usage = await usageForProject(project.id);
    return {
      project: {
        id: project.id,
        name: project.name,
        namespace: project.namespace,
        plan: project.plan,
        createdAt: project.created_at,
      },
      usage,
      plans: PLANS,
    };
  });

export const listProjectFiles = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((data: { projectId: string; prefix?: string }) => data)
  .handler(async ({ context, data }) => {
    const { project, files } = await listFiles(context.userId, data.projectId, data.prefix);
    return {
      namespace: project.namespace,
      files: files.map((file) => serializeFile(file, "", project.namespace)),
    };
  });

export const listProjectActivity = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((data: { projectId: string }) => data)
  .handler(async ({ context, data }) => {
    return listActivityForUser(context.userId, data.projectId);
  });

export const listProjectKeys = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((data: { projectId: string }) => data)
  .handler(async ({ context, data }) => {
    const keys = await listApiKeys(context.userId, data.projectId);
    return keys.map((k) => ({
      id: k.id,
      name: k.name,
      prefix: k.prefix,
      scopes: k.scopes.split(","),
      createdAt: k.created_at,
      lastUsedAt: k.last_used_at,
    }));
  });

export const createProjectKey = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { projectId: string; name: string; scopes: string[] }) => data)
  .handler(async ({ context, data }) => {
    const scopes = data.scopes.length ? data.scopes : ["files:read", "files:write", "files:delete"];
    return createApiKey(context.userId, data.projectId, data.name.trim() || "Default", scopes);
  });

export const revokeProjectKey = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { projectId: string; keyId: string }) => data)
  .handler(async ({ context, data }) => {
    await deleteApiKey(context.userId, data.projectId, data.keyId);
    return { ok: true };
  });

export const mintProjectUploadToken = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (data: {
      projectId: string;
      folder?: string;
      visibility?: "public" | "private";
      maxUploadBytes?: number;
      expiresInSeconds?: number;
    }) => data,
  )
  .handler(async ({ context, data }) => {
    return mintUploadToken(
      { userId: context.userId, projectId: data.projectId },
      {
        folder: data.folder,
        visibility: data.visibility,
        maxUploadBytes: data.maxUploadBytes,
        expiresInSeconds: data.expiresInSeconds,
      },
    );
  });

export const updateProjectSettings = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { projectId: string; name?: string; plan?: string }) => data)
  .handler(async ({ context, data }) => {
    if (data.name) await renameProject(context.userId, data.projectId, data.name.trim().slice(0, 60));
    if (data.plan) await setProjectPlan(context.userId, data.projectId, data.plan);
    const project = await getProjectForUser(context.userId, data.projectId);
    return { id: project.id, name: project.name, namespace: project.namespace, plan: project.plan };
  });

export const destroyProject = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { projectId: string }) => data)
  .handler(async ({ context, data }) => {
    await deleteProject(context.userId, data.projectId);
    return { ok: true };
  });

export const listProjectWebhooks = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((data: { projectId: string }) => data)
  .handler(async ({ context, data }) => {
    const [hooks, deliveries] = await Promise.all([
      listWebhooks(context.userId, data.projectId),
      listWebhookDeliveries(context.userId, data.projectId),
    ]);
    return {
      hooks: hooks.map((h) => ({
        id: h.id,
        name: h.name,
        url: h.url,
        events: h.events.split(","),
        enabled: h.enabled,
        createdAt: h.created_at,
        lastTriggeredAt: h.last_triggered_at,
      })),
      deliveries: deliveries.map((d) => ({
        id: d.id,
        webhookId: d.webhook_id,
        eventType: d.event_type,
        statusCode: d.status_code,
        success: d.success,
        createdAt: d.created_at,
        url: d.url,
      })),
    };
  });

export const createProjectWebhook = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { projectId: string; url: string; events: string[]; name?: string }) => data)
  .handler(async ({ context, data }) => {
    return createWebhook(context.userId, data.projectId, data);
  });

export const revokeProjectWebhook = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { projectId: string; webhookId: string }) => data)
  .handler(async ({ context, data }) => {
    await deleteWebhook(context.userId, data.projectId, data.webhookId);
    return { ok: true };
  });

export const getProjectWebhook = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((data: { projectId: string; webhookId: string }) => data)
  .handler(async ({ context, data }) => {
    const [hook, deliveries] = await Promise.all([
      getWebhookForUser(context.userId, data.projectId, data.webhookId),
      listDeliveriesForWebhook(context.userId, data.projectId, data.webhookId),
    ]);
    return {
      hook: {
        id: hook.id,
        name: hook.name,
        url: hook.url,
        events: hook.events.split(",").filter(Boolean),
        enabled: hook.enabled,
        createdAt: hook.created_at,
        lastTriggeredAt: hook.last_triggered_at,
      },
      deliveries: deliveries.map((d) => ({
        id: d.id,
        webhookId: d.webhook_id,
        eventType: d.event_type,
        statusCode: d.status_code,
        success: d.success,
        createdAt: d.created_at,
        payload: d.payload,
      })),
    };
  });

export const updateProjectWebhook = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (data: {
      projectId: string;
      webhookId: string;
      name: string;
      url: string;
      events: string[];
      enabled: boolean;
    }) => data,
  )
  .handler(async ({ context, data }) => {
    const hook = await updateWebhook(context.userId, data.projectId, data.webhookId, {
      name: data.name,
      url: data.url,
      events: data.events,
      enabled: data.enabled,
    });
    return {
      id: hook.id,
      name: hook.name,
      url: hook.url,
      events: hook.events.split(",").filter(Boolean),
      enabled: hook.enabled,
      createdAt: hook.created_at,
      lastTriggeredAt: hook.last_triggered_at,
    };
  });

export const resetProjectWebhookSecret = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { projectId: string; webhookId: string }) => data)
  .handler(async ({ context, data }) => {
    return resetWebhookSecret(context.userId, data.projectId, data.webhookId);
  });

export const deleteProjectFile = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { projectId: string; path: string }) => data)
  .handler(async ({ context, data }) => {
    return deleteFileForUser(context.userId, data.projectId, data.path, "");
  });

export const signProjectFile = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { projectId: string; path: string }) => data)
  .handler(async ({ context, data }) => {
    return signUrlForUser(context.userId, data.projectId, data.path, 900, "");
  });
