export type AssetKind = "image" | "video" | "audio" | "doc";

export const KIND_LABEL: Record<AssetKind, string> = {
  image: "Images",
  video: "Videos",
  audio: "Audio",
  doc: "Docs",
};

export const KIND_BADGE: Record<AssetKind, string> = {
  image: "Image",
  video: "Video",
  audio: "Audio",
  doc: "Doc",
};

const IMAGE_EXT = new Set(["png", "jpg", "jpeg", "gif", "webp", "avif", "svg", "bmp", "heic", "tif", "tiff"]);
const VIDEO_EXT = new Set(["mp4", "webm", "mov", "m4v", "mkv", "avi"]);
const AUDIO_EXT = new Set(["mp3", "wav", "ogg", "m4a", "flac", "aac", "opus"]);

export function extOf(name: string): string {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i + 1).toLowerCase() : "";
}

export function kindOf(contentType: string, filename = ""): AssetKind {
  const type = contentType.toLowerCase();
  if (type.startsWith("image/")) return "image";
  if (type.startsWith("video/")) return "video";
  if (type.startsWith("audio/")) return "audio";
  const ext = extOf(filename);
  if (IMAGE_EXT.has(ext)) return "image";
  if (VIDEO_EXT.has(ext)) return "video";
  if (AUDIO_EXT.has(ext)) return "audio";
  return "doc";
}

export function sanitizeFilename(name: string): string {
  const trimmed = name.trim() || "file";
  const safe = trimmed.replace(/[^A-Za-z0-9._~()-]+/g, "-").replace(/-+/g, "-");
  return safe.replace(/^-+|-+$/g, "").slice(0, 180) || "file";
}

export function sanitizeFolderName(name: string): string {
  const trimmed = name.trim();
  const safe = trimmed.replace(/[^A-Za-z0-9._~()-]+/g, "-").replace(/-+/g, "-");
  return safe.replace(/^-+|-+$/g, "").slice(0, 64);
}

export function joinPath(folder: string, name: string): string {
  const file = sanitizeFilename(name);
  return folder ? `${folder}/${file}` : file;
}

export function parentFolder(path: string): string {
  const i = path.lastIndexOf("/");
  return i > 0 ? path.slice(0, i) : "";
}

export function folderLabel(path: string): string {
  if (!path) return "Root";
  return path.split("/").pop() || path;
}

export type FolderView<T extends { path: string }> = {
  files: T[];
  folders: string[];
};

export function viewInFolder<T extends { path: string }>(
  folder: string,
  files: T[],
  extraFolders: string[],
): FolderView<T> {
  const prefix = folder ? `${folder}/` : "";
  const childFolders = new Set<string>();
  const childFiles: T[] = [];

  for (const file of files) {
    if (folder && !file.path.startsWith(prefix) && file.path !== folder) continue;
    if (!folder && !file.path.includes("/")) {
      childFiles.push(file);
      continue;
    }
    const rest = folder ? file.path.slice(prefix.length) : file.path;
    if (!rest || rest === file.path && folder && file.path !== folder) continue;
    const segs = rest.split("/").filter(Boolean);
    if (segs.length === 1 && file.path !== folder) childFiles.push(file);
    else if (segs.length > 1) childFolders.add(prefix + segs[0]);
  }

  for (const extra of extraFolders) {
    if (extra === folder) continue;
    if (folder) {
      if (!extra.startsWith(prefix)) continue;
      const rest = extra.slice(prefix.length);
      if (rest && !rest.includes("/")) childFolders.add(extra);
    } else if (!extra.includes("/")) {
      childFolders.add(extra);
    }
  }

  return { files: childFiles, folders: [...childFolders].sort() };
}

const FOLDER_KEY = (projectId: string) => `obs:folders:${projectId}`;

export function readStoredFolders(projectId: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(FOLDER_KEY(projectId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is string => typeof v === "string" && v.length > 0);
  } catch {
    return [];
  }
}

export function writeStoredFolders(projectId: string, folders: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(FOLDER_KEY(projectId), JSON.stringify(folders));
}
