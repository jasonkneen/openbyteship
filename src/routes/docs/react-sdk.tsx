import { createFileRoute } from "@tanstack/react-router";
import { DocsLayout, DocSection } from "@/components/docs/docs-layout";
import { CodeBlock } from "@/components/site/code-block";

export const Route = createFileRoute("/docs/react-sdk")({ component: Page });

function Page() {
  return (
    <DocsLayout
      title="React SDK"
      lede="Helpers for uploads, progress state, and image placeholders. Built on the JavaScript client."
    >
      <DocSection title="Single upload">
        <p>Mint a token from your server, then pass the client into a hook or call <code className="text-fg">upload</code> directly.</p>
        <CodeBlock
          label="tsx"
          code={`import { OpenByteShipClient } from "@openbyteship/js"
import { useMemo, useState } from "react"

function ReadyUploader({ uploadToken }: { uploadToken: string }) {
  const obs = useMemo(
    () => new OpenByteShipClient({ uploadToken }),
    [uploadToken],
  )
  const [progress, setProgress] = useState(0)

  return (
    <input
      type="file"
      onChange={(event) => {
        const file = event.currentTarget.files?.[0]
        if (file) {
          void obs.upload(file, {
            path: \`avatars/\${file.name}\`,
            onProgress: (p) => setProgress(p.percent),
          })
        }
      }}
    />
  )
}`}
        />
      </DocSection>
      <DocSection title="Displaying images">
        <CodeBlock
          label="tsx"
          code={`export function Avatar({ file }: { file: UploadedFile }) {
  const image = file.metadata?.image as { dominantColor?: string } | undefined
  return (
    <img
      alt="User avatar"
      src={file.url ?? undefined}
      width={400}
      height={400}
      style={{ background: image?.dominantColor ?? "#121214" }}
    />
  )
}`}
        />
      </DocSection>
    </DocsLayout>
  );
}
