import { createFileRoute } from "@tanstack/react-router";
import { DocsLayout, DocSection } from "@/components/docs/docs-layout";
import { CodeBlock } from "@/components/site/code-block";

export const Route = createFileRoute("/docs/javascript-sdk")({ component: Page });

function Page() {
  return (
    <DocsLayout
      title="JavaScript SDK"
      lede="Wraps upload sessions, direct file uploads, upload tokens, signed URLs, file lookup, and deletes."
    >
      <DocSection title="Install">
        <CodeBlock label="bash" code={`npm add @openbyteship/js`} />
        <p>The in-product playground uses the same client against this origin — copy the API, not a published package name, if you are running OpenByteShip itself.</p>
      </DocSection>
      <DocSection title="Create a client">
        <CodeBlock
          label="ts"
          code={`import { OpenByteShipClient } from "@openbyteship/js"

const obs = new OpenByteShipClient({
  apiKey: process.env.OPENBYTESHIP_API_KEY!,
})

// Browser
const browser = new OpenByteShipClient({ uploadToken: token })`}
        />
        <p>Never ship an <code className="text-fg">obshp_...</code> project API key to the browser.</p>
      </DocSection>
      <DocSection title="Upload a file">
        <CodeBlock
          label="ts"
          code={`const uploaded = await obs.upload(file, {
  path: "invoices/2026/invoice.pdf",
  metadata: { customerId: "cus_123" },
  visibility: "public",
  onProgress: (progress) => {
    console.log(Math.round(progress.percent))
  },
})`}
        />
      </DocSection>
      <DocSection title="Multiple files">
        <CodeBlock
          label="ts"
          code={`const results = await obs.uploadMany(files, {
  concurrency: 3,
  pathPrefix: "gallery",
  visibility: "public",
})

const uploaded = results
  .filter((item) => item.status === "fulfilled")
  .map((item) => item.result)`}
        />
      </DocSection>
      <DocSection title="File methods">
        <CodeBlock
          label="ts"
          code={`const { file } = await obs.getFile("invoices/2026/invoice.pdf")
const { signedUrl } = await obs.createSignedUrl(file.path, {
  expiresInSeconds: 10 * 60,
})
const deleted = await obs.deleteFile(file.path)`}
        />
      </DocSection>
      <DocSection title="Manual flow">
        <CodeBlock
          label="ts"
          code={`const created = await obs.createFileUpload("manual/invoice.pdf", {
  byteSize: file.size,
  contentType: file.type || "application/octet-stream",
  method: "single",
})

await fetch(created.upload.url, {
  method: "PUT",
  headers: created.upload.headers,
  body: file,
})

const completed = await obs.completePathUpload(created.file.path, {
  uploadId: created.upload.id,
})`}
        />
      </DocSection>
    </DocsLayout>
  );
}
