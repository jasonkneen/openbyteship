import { FileAudio, FileImage, FileText, Film, Folder, Globe, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { KIND_BADGE, kindOf, type AssetKind } from "@/lib/obs/file-kinds";
import type { FileRecord } from "@/lib/obs/types";
import { cn, formatBytes, formatTimeAgo } from "@/lib/utils";

type Props = {
  file: FileRecord;
  selected: boolean;
  checked: boolean;
  onOpen: () => void;
  onCheck: (next: boolean) => void;
};

const KIND_ICON: Record<AssetKind, typeof FileText> = {
  image: FileImage,
  video: Film,
  audio: FileAudio,
  doc: FileText,
};

export function AssetCard({ file, selected, checked, onOpen, onCheck }: Props) {
  const kind = kindOf(file.contentType, file.filename);
  const Icon = KIND_ICON[kind];
  const preview = kind === "image" ? file.url : null;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-lg bg-bg/40 text-left shadow-[var(--shadow-border)] transition-[box-shadow,transform] duration-150 ease-[var(--ease-out)]",
        "hover:shadow-[var(--shadow-border-hover)]",
        selected && "ring-1 ring-ok",
      )}
    >
      <button type="button" onClick={onOpen} className="block w-full text-left">
        <div className="relative aspect-video overflow-hidden bg-elevated">
          {preview ? (
            <img
              src={preview}
              alt=""
              className="size-full object-cover outline outline-1 -outline-offset-1 outline-fg/10"
            />
          ) : (
            <div className="grid size-full place-items-center text-subtle">
              <Icon className="size-8" strokeWidth={1.25} />
            </div>
          )}
          <span className="absolute left-8 top-2">
            <Badge tone="neutral" className="bg-bg/80 backdrop-blur-sm">
              {KIND_BADGE[kind]}
            </Badge>
          </span>
        </div>
        <div className="space-y-1.5 p-3">
          <div className="flex items-start justify-between gap-2">
            <p className="min-w-0 truncate text-sm font-medium">{file.filename}</p>
            <Badge
              tone={file.visibility === "public" ? "ok" : "neutral"}
              className="shrink-0 normal-case tracking-normal"
            >
              {file.visibility === "public" ? <Globe className="mr-1 size-3" /> : <Lock className="mr-1 size-3" />}
              {file.visibility}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-xs text-subtle">
            <span>{formatBytes(file.byteSize)}</span>
            <span>{formatTimeAgo(file.createdAt)}</span>
          </div>
        </div>
      </button>
      <label className="absolute left-2 top-2 z-10">
        <span className="sr-only">Select {file.filename}</span>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => {
            e.stopPropagation();
            onCheck(e.currentTarget.checked);
          }}
          onClick={(e) => e.stopPropagation()}
          className="size-4 rounded-xs border-border bg-bg/80 accent-ok"
        />
      </label>
    </div>
  );
}

export function FolderCard({ name, onOpen }: { name: string; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex items-center gap-3 rounded-lg bg-bg/40 px-3 py-3 text-left shadow-[var(--shadow-border)] transition-shadow hover:shadow-[var(--shadow-border-hover)]"
    >
      <span className="grid size-10 place-items-center rounded-md bg-elevated text-muted">
        <Folder className="size-5" />
      </span>
      <span className="min-w-0 truncate text-sm font-medium">{name}</span>
    </button>
  );
}
