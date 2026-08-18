import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, LoaderCircle, Upload as UploadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { mintProjectUploadToken } from "@/lib/obs/actions";
import { folderLabel, joinPath, kindOf } from "@/lib/obs/file-kinds";
import { OpenByteShipClient } from "@/lib/obs/sdk";
import { cn, formatBytes } from "@/lib/utils";

type QueueItem = {
  id: string;
  file: File;
  status: "queued" | "uploading" | "done" | "error";
  progress: number;
  error?: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectName: string;
  folder: string;
  onComplete: () => void;
};

export function UploadDialog({ open, onOpenChange, projectId, projectName, folder, onComplete }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<QueueItem[]>([]);
  const [dragging, setDragging] = useState(false);
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [busy, setBusy] = useState(false);

  const queued = items.filter((item) => item.status !== "done");
  const destination = folderLabel(folder);

  function addFiles(list: FileList | File[] | null) {
    if (!list) return;
    const next = Array.from(list).map((file) => ({
      id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 7)}`,
      file,
      status: "queued" as const,
      progress: 0,
    }));
    setItems((cur) => [...cur, ...next]);
  }

  function reset() {
    setItems([]);
    setDragging(false);
    setBusy(false);
    setVisibility("public");
  }

  async function startUpload() {
    if (!items.length || busy) return;
    setBusy(true);
    try {
      const token = await mintProjectUploadToken({
        data: {
          projectId,
          folder: folder || undefined,
          visibility,
          expiresInSeconds: 900,
        },
      });
      const client = new OpenByteShipClient({ uploadToken: token.token });
      let ok = 0;
      let failed = 0;
      for (const item of items) {
        if (item.status === "done") {
          ok += 1;
          continue;
        }
        setItems((cur) =>
          cur.map((row) => (row.id === item.id ? { ...row, status: "uploading", progress: 0, error: undefined } : row)),
        );
        try {
          await client.upload(item.file, {
            path: joinPath(folder, item.file.name),
            visibility,
            onProgress: (progress) => {
              setItems((cur) =>
                cur.map((row) => (row.id === item.id ? { ...row, progress: progress.percent } : row)),
              );
            },
          });
          ok += 1;
          setItems((cur) =>
            cur.map((row) => (row.id === item.id ? { ...row, status: "done", progress: 100 } : row)),
          );
        } catch (err) {
          failed += 1;
          setItems((cur) =>
            cur.map((row) =>
              row.id === item.id
                ? {
                    ...row,
                    status: "error",
                    error: err instanceof Error ? err.message : "Upload failed",
                  }
                : row,
            ),
          );
        }
      }
      if (failed === 0) {
        toast.success(ok === 1 ? "File uploaded" : `${ok} files uploaded`);
        reset();
        onOpenChange(false);
        onComplete();
      } else {
        toast.error(failed === 1 ? "1 file failed" : `${failed} files failed`);
        onComplete();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not start upload");
    } finally {
      setBusy(false);
    }
  }

  const kindsPreview = useMemo(
    () => items.slice(0, 4).map((item) => kindOf(item.file.type, item.file.name)),
    [items],
  );
  void kindsPreview;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (busy) return;
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-md p-6">
        <DialogHeader>
          <DialogTitle>Upload files</DialogTitle>
          <DialogDescription>
            Drop files here or click to browse, then upload them into {projectName}.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-5 space-y-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-subtle">Destination</p>
            <p className="mt-1 text-sm">{destination}</p>
          </div>

          <div className="flex gap-2">
            {(["public", "private"] as const).map((value) => (
              <button
                key={value}
                type="button"
                disabled={busy}
                onClick={() => setVisibility(value)}
                className={cn(
                  "h-9 rounded-full px-3 text-xs font-medium capitalize transition-colors",
                  visibility === value ? "bg-accent text-accent-fg" : "bg-elevated text-muted hover:text-fg",
                )}
              >
                {value}
              </button>
            ))}
          </div>

          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            onDragEnter={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              if (e.currentTarget.contains(e.relatedTarget as Node)) return;
              setDragging(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              addFiles(e.dataTransfer.files);
            }}
            className={cn(
              "flex w-full flex-col items-center justify-center rounded-lg border border-dashed px-4 py-10 text-center transition-[border-color,background-color] duration-150",
              dragging ? "border-accent bg-elevated" : "border-border-strong bg-bg/40 hover:bg-elevated/60",
            )}
          >
            <span className="grid size-11 place-items-center rounded-md bg-ok/15 text-ok">
              <UploadIcon className="size-5" />
            </span>
            <p className="mt-4 text-sm font-medium">Click to choose files or drop them here</p>
            <p className="mt-1 max-w-xs text-xs text-subtle">
              Any selected files will be uploaded straight into this project.
            </p>
          </button>
          <input
            ref={inputRef}
            type="file"
            multiple
            className="sr-only"
            onChange={(e) => {
              addFiles(e.currentTarget.files);
              e.currentTarget.value = "";
            }}
          />

          {items.length > 0 ? (
            <div className="overflow-hidden rounded-lg bg-bg/50 shadow-[var(--shadow-border)]">
              <div className="flex items-center justify-between px-3 py-2">
                <p className="text-xs font-medium uppercase tracking-wider text-subtle">Upload queue</p>
                <p className="text-xs uppercase tracking-wider text-subtle">
                  {items.length} {items.length === 1 ? "file" : "files"}
                </p>
              </div>
              <ul className="divide-y divide-border">
                {items.map((item) => (
                  <li key={item.id} className="flex items-start justify-between gap-3 px-3 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm">{item.file.name}</p>
                      <p className="text-xs text-subtle">{formatBytes(item.file.size)}</p>
                      {item.status === "uploading" ? <Progress className="mt-2" value={item.progress} /> : null}
                      {item.error ? <p className="mt-1 text-xs text-danger">{item.error}</p> : null}
                    </div>
                    <StatusLabel item={item} />
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={busy}
            onClick={() => {
              reset();
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button type="button" size="sm" disabled={!queued.length || busy} onClick={() => void startUpload()}>
            {busy ? "Uploading…" : queued.length ? `Upload ${queued.length}` : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function StatusLabel({ item }: { item: QueueItem }) {
  if (item.status === "done") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-ok">
        <CheckCircle2 className="size-3.5" />
        Done
      </span>
    );
  }
  if (item.status === "uploading") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted">
        <LoaderCircle className="size-3.5 animate-spin" />
        {Math.round(item.progress)}%
      </span>
    );
  }
  if (item.status === "error") {
    return <span className="text-xs text-danger">Failed</span>;
  }
  return <span className="text-xs text-muted">Queued</span>;
}
