import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Copy, Globe, Trash2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { KIND_BADGE, folderLabel, kindOf, parentFolder } from "@/lib/obs/file-kinds";
import { deleteProjectFile, signProjectFile } from "@/lib/obs/actions";
import type { FileRecord } from "@/lib/obs/types";
import { copyText, formatBytes, formatTimestamp } from "@/lib/utils";

type Props = {
  file: FileRecord;
  projectId: string;
  onClose: () => void;
  onDeleted: () => void;
};

export function AssetDetails({ file, projectId, onClose, onDeleted }: Props) {
  const [signed, setSigned] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const kind = kindOf(file.contentType, file.filename);
  const preview = file.url ?? signed;
  const folder = parentFolder(file.path);

  useEffect(() => {
    setSigned(null);
    if (file.url || !file.contentType.startsWith("image/")) return;
    void signProjectFile({ data: { projectId, path: file.path } })
      .then((result) => setSigned(result.signedUrl.url))
      .catch(() => undefined);
  }, [file.path, file.url, file.contentType, projectId]);

  async function copyUrl() {
    try {
      if (file.url) {
        await copyText(new URL(file.url, window.location.origin).toString());
        toast.success("URL copied");
        return;
      }
      const result = signed
        ? { signedUrl: { url: signed } }
        : await signProjectFile({ data: { projectId, path: file.path } });
      if (!file.url) setSigned(result.signedUrl.url);
      await copyText(new URL(result.signedUrl.url, window.location.origin).toString());
      toast.success(file.visibility === "private" ? "Signed URL copied" : "URL copied");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not copy URL");
    }
  }

  async function onDelete() {
    setBusy(true);
    try {
      await deleteProjectFile({ data: { projectId, path: file.path } });
      toast.success("Deleted");
      setConfirm(false);
      onDeleted();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <aside className="flex h-full flex-col overflow-y-auto border-border bg-surface md:border-l">
      <div className="flex items-start justify-between gap-3 px-4 pt-4">
        <div>
          <p className="text-sm font-medium">Asset details</p>
          <p className="text-xs text-subtle">Selected file</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="grid size-9 place-items-center rounded-sm text-muted hover:bg-elevated hover:text-fg"
          aria-label="Close details"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="space-y-5 p-4">
        <div className="overflow-hidden rounded-md bg-elevated">
          {preview && kind === "image" ? (
            <img
              src={preview}
              alt={file.filename}
              className="max-h-64 w-full object-contain outline outline-1 -outline-offset-1 outline-fg/10"
            />
          ) : preview && kind === "video" ? (
            <video src={preview} controls className="max-h-64 w-full" />
          ) : preview && kind === "audio" ? (
            <div className="p-4">
              <audio src={preview} controls className="w-full" />
            </div>
          ) : (
            <div className="grid h-36 place-items-center text-sm text-subtle">No preview</div>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Badge tone={file.visibility === "public" ? "ok" : "neutral"} className="gap-1 normal-case tracking-normal">
            {file.visibility === "public" ? <Globe className="size-3" /> : null}
            {file.visibility}
          </Badge>
          <Badge tone="neutral">{KIND_BADGE[kind]}</Badge>
        </div>

        <h2 className="truncate font-display text-2xl tracking-tight">{file.filename}</h2>

        <dl className="space-y-3 text-sm">
          <Row label="Size" value={formatBytes(file.byteSize)} />
          <Row label="Uploaded" value={formatTimestamp(file.createdAt)} />
          <Row label="Folder" value={folderLabel(folder)} />
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-subtle">File ID</dt>
            <dd className="mt-1 flex items-center gap-1">
              <code className="min-w-0 flex-1 truncate rounded-sm bg-elevated px-2 py-1.5 font-mono text-xs">
                {file.id}
              </code>
              <button
                type="button"
                className="grid size-9 shrink-0 place-items-center rounded-sm text-muted hover:bg-elevated hover:text-fg"
                aria-label="Copy file ID"
                onClick={() => {
                  void copyText(file.id).then(() => toast.success("File ID copied"));
                }}
              >
                <Copy className="size-3.5" />
              </button>
            </dd>
          </div>
        </dl>

        <div className="rounded-sm bg-elevated px-3 py-2 font-mono text-xs text-muted">{file.filename}</div>

        <div className="space-y-2">
          <Button type="button" variant="secondary" className="w-full" onClick={() => void copyUrl()}>
            <Copy />
            Copy URL
          </Button>
          <Button type="button" variant="danger" className="w-full" onClick={() => setConfirm(true)}>
            <Trash2 />
            Delete
          </Button>
        </div>
      </div>

      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this file?</AlertDialogTitle>
            <AlertDialogDescription>
              {file.filename} will be removed from this project. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-danger text-fg hover:opacity-90"
              disabled={busy}
              onClick={(e) => {
                e.preventDefault();
                void onDelete();
              }}
            >
              {busy ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </aside>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wider text-subtle">{label}</dt>
      <dd className="mt-0.5">{value}</dd>
    </div>
  );
}
