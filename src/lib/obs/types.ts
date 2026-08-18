export type Visibility = "public" | "private";
export type FileStatus = "pending" | "ready" | "deleted";
export type UploadMethod = "auto" | "single" | "multipart";
export type ApiScope = "files:read" | "files:write" | "files:delete";

export type ImageMetadata = {
  width?: number;
  height?: number;
  dominantColor?: string;
  thumbhash?: string;
};

export type FileMetadata = {
  image?: ImageMetadata;
};

export type FileRecord = {
  id: string;
  filename: string;
  path: string;
  url: string | null;
  visibility: Visibility;
  status: FileStatus;
  byteSize: number;
  contentType: string;
  etag: string | null;
  metadata: FileMetadata;
  createdAt: string;
};

export type ProjectRecord = {
  id: string;
  name: string;
  namespace: string;
  plan: string;
  createdAt: string;
};

export const WEBHOOK_EVENTS = [
  "file.uploaded",
  "file.deleted",
  "image.metadata.created",
  "image.transform.created",
  "image.transform.failed",
] as const;

export type WebhookEvent = (typeof WEBHOOK_EVENTS)[number];

export const ACTIVITY_CATEGORIES = ["keys", "uploads", "files", "webhooks"] as const;
export type ActivityCategory = (typeof ACTIVITY_CATEGORIES)[number];
export type ActivityStatus = "created" | "completed" | "deleted" | "revoked";

export type ActivityEvent = {
  id: string;
  category: ActivityCategory;
  title: string;
  detail: string;
  status: ActivityStatus;
  createdAt: string;
};
