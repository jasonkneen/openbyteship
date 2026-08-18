import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { mintProjectUploadToken } from "@/lib/obs/actions";
import { OpenByteShipClient, type UploadedFile } from "@/lib/obs/sdk";
import { CodeBlock } from "@/components/site/code-block";

export const Route = createFileRoute("/console/$projectId/playground")({ component: Playground });

function Playground() {
  const { projectId } = Route.useParams();
  const [path, setPath] = useState("playground/hello.txt");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "uploading" | "ready" | "error">("idle");
  const [file, setFile] = useState<UploadedFile | null>(null);

  async function upload(selected: File) {
    setStatus("uploading");
    setProgress(0);
    setFile(null);
    try {
      const token = await mintProjectUploadToken({
        data: { projectId, folder: path.includes("/") ? path.split("/").slice(0, -1).join("/") : undefined, visibility },
      });
      const client = new OpenByteShipClient({ uploadToken: token.token });
      const uploaded = await client.upload(selected, {
        path,
        visibility,
        onProgress: (p) => setProgress(p.percent),
      });
      setFile(uploaded);
      setStatus("ready");
      toast.success("Upload complete");
    } catch (err) {
      setStatus("error");
      toast.error(err instanceof Error ? err.message : "Upload failed");
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-subtle">Playground</p>
        <h1 className="mt-2 font-display text-4xl tracking-tight">Try the upload flow</h1>
        <p className="mt-2 text-sm text-muted">
          Mints a short-lived <code className="text-fg">obut_</code> token, then runs create → PUT bytes → complete.
        </p>
      </div>
      <div className="space-y-4 rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
        <label className="block text-sm text-muted">
          Path
          <Input className="mt-1 font-mono" value={path} onChange={(e) => setPath(e.target.value)} />
        </label>
        <div className="flex gap-2">
          {(["public", "private"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setVisibility(value)}
              className={`h-11 rounded-sm px-4 text-sm ${
                visibility === value ? "bg-accent text-accent-fg" : "bg-elevated text-muted"
              }`}
            >
              {value}
            </button>
          ))}
        </div>
        <input
          type="file"
          className="block w-full text-sm text-muted file:mr-3 file:h-11 file:rounded-sm file:border-0 file:bg-elevated file:px-4 file:text-fg"
          onChange={(e) => {
            const selected = e.currentTarget.files?.[0];
            if (selected) void upload(selected);
          }}
        />
        {status === "uploading" ? <Progress value={progress} /> : null}
        {file ? (
          <div className="space-y-2 text-sm">
            <p className="text-ok">Ready · {file.path}</p>
            {file.url ? (
              <a href={file.url} className="break-all font-mono text-xs text-fg underline" target="_blank" rel="noreferrer">
                {file.url}
              </a>
            ) : (
              <p className="text-muted">Private file — no public URL.</p>
            )}
          </div>
        ) : null}
      </div>
      <CodeBlock
        label="ts"
        code={`const obs = new OpenByteShipClient({ uploadToken })
await obs.upload(file, {
  path: "${path}",
  visibility: "${visibility}",
})`}
      />
      <Button asChild variant="outline">
        <a href="/docs/javascript-sdk">Read the SDK</a>
      </Button>
    </div>
  );
}
