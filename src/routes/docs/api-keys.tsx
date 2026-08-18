import { createFileRoute } from "@tanstack/react-router";
import { DocsLayout, DocSection } from "@/components/docs/docs-layout";
import { CodeBlock } from "@/components/site/code-block";

export const Route = createFileRoute("/docs/api-keys")({ component: Page });

function Page() {
  return (
    <DocsLayout
      title="API keys"
      lede="API keys belong to projects and control what a trusted server can do."
    >
      <DocSection title="Project API keys">
        <p>
          Project keys start with <code className="text-fg">obshp_</code> and are created in the console. Use them
          only from trusted server code. Keys are stored hashed. OpenByteShip only keeps a short prefix for
          identification after creation.
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li><code className="text-fg">files:read</code> — read metadata, stream bytes, create signed URLs.</li>
          <li><code className="text-fg">files:write</code> — create upload tokens, create sessions, complete uploads.</li>
          <li><code className="text-fg">files:delete</code> — delete stored files and their backing objects.</li>
        </ul>
      </DocSection>
      <DocSection title="Upload tokens">
        <p>
          Upload tokens start with <code className="text-fg">obut_</code>. Mint them on the server and pass them to
          the browser. They always behave like scoped upload-only credentials and expire.
        </p>
        <CodeBlock
          label="ts"
          code={`const { uploadToken } = await obs.createUploadToken({
  folder: "uploads",
  visibility: "public",
  maxUploadBytes: 10 * 1024 * 1024,
  expiresInSeconds: 900,
})`}
        />
      </DocSection>
    </DocsLayout>
  );
}
