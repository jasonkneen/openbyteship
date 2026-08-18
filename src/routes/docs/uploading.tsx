import { createFileRoute } from "@tanstack/react-router";
import { DocsLayout, DocSection } from "@/components/docs/docs-layout";
import { CodeBlock } from "@/components/site/code-block";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/docs/uploading")({ component: Page });

function Page() {
  return (
    <DocsLayout
      title="Uploading a file"
      lede="Create an upload, send the bytes, and complete the session from a trusted server."
    >
      <DocSection title="Upload flow">
        <p>A normal upload has three steps. Create an upload session, upload the file bytes to the returned URL, then complete the session so OpenByteShip can verify and mark the file ready. Use the SDKs to do this in one step.</p>
        <ul className="list-disc space-y-2 pl-5">
          <li><code className="text-fg">visibility: "public"</code> is the default and is for files that can be delivered directly.</li>
          <li><code className="text-fg">visibility: "private"</code> keeps delivery behind signed URLs.</li>
          <li><code className="text-fg">path</code> is the file key, for example <code className="text-fg">invoices/2026/may/invoice.pdf</code>. Uploading to the same path replaces that file.</li>
          <li>Public delivery URLs include the project's short, immutable namespace before the file path.</li>
        </ul>
      </DocSection>
      <DocSection title="Image metadata">
        <p>
          When an uploaded file is an image, OpenByteShip generates image metadata after the upload completes.
          That metadata includes the original dimensions. React apps can use it to reserve space and show a
          color placeholder before the full image loads.
        </p>
      </DocSection>
      <DocSection title="Examples">
        <Tabs defaultValue="sdk">
          <TabsList>
            <TabsTrigger value="sdk">SDK</TabsTrigger>
            <TabsTrigger value="api">API</TabsTrigger>
          </TabsList>
          <TabsContent value="sdk" className="mt-4">
            <CodeBlock
              label="ts"
              code={`import { OpenByteShipClient } from "@openbyteship/js"

const obs = new OpenByteShipClient({
  apiKey: process.env.OPENBYTESHIP_API_KEY!,
})

const uploaded = await obs.upload(file, {
  path: "invoices/2026/invoice.pdf",
  visibility: "public",
})

console.log(uploaded.id, uploaded.status)`}
            />
          </TabsContent>
          <TabsContent value="api" className="mt-4 space-y-4">
            <CodeBlock
              label="http"
              code={`PUT /v1/files/invoices/2026/invoice.pdf
Authorization: Bearer $OPENBYTESHIP_API_KEY
Content-Type: application/json

{
  "byteSize": 48291,
  "contentType": "application/pdf",
  "method": "auto",
  "visibility": "public"
}`}
            />
            <p>Then PUT the bytes to <code className="text-fg">upload.url</code> and POST <code className="text-fg">/upload/complete</code>.</p>
          </TabsContent>
        </Tabs>
      </DocSection>
    </DocsLayout>
  );
}
