import { createFileRoute } from "@tanstack/react-router";
import { DocsLayout, DocSection } from "@/components/docs/docs-layout";
import { CodeBlock } from "@/components/site/code-block";

export const Route = createFileRoute("/docs/api")({ component: Page });

function Page() {
  return (
    <DocsLayout title="API reference" lede="Base URL is this origin. Every request includes a bearer token.">
      <DocSection title="Authentication">
        <CodeBlock label="http" code={`Authorization: Bearer $OPENBYTESHIP_API_KEY`} />
        <ul className="list-disc space-y-2 pl-5">
          <li>Project API key — starts with <code className="text-fg">obshp_</code>.</li>
          <li>Upload token — starts with <code className="text-fg">obut_</code>.</li>
        </ul>
      </DocSection>
      <DocSection title="Create path upload">
        <p><code className="text-fg">PUT /v1/files/:path</code> — create a session. Path is the key.</p>
        <CodeBlock
          label="json"
          code={`{
  "byteSize": 48291,
  "contentType": "application/pdf",
  "method": "auto",
  "visibility": "public",
  "metadata": { "customerId": "cus_123" }
}`}
        />
      </DocSection>
      <DocSection title="Upload file bytes">
        <p>
          <code className="text-fg">PUT upload.url</code> — send bytes with the exact headers returned by the
          API. This writes directly to object storage, not the JSON API.
        </p>
      </DocSection>
      <DocSection title="Complete path upload">
        <p><code className="text-fg">POST /v1/files/:path/upload/complete</code></p>
        <CodeBlock label="json" code={`{ "uploadId": "<UPLOAD_ID>" }`} />
      </DocSection>
      <DocSection title="Files">
        <ul className="list-disc space-y-2 pl-5">
          <li><code className="text-fg">GET /v1/files/:path</code> — JSON metadata when Accept is application/json, otherwise stream bytes.</li>
          <li><code className="text-fg">POST /v1/files/:path/signed-url</code> — temporary delivery URL.</li>
          <li><code className="text-fg">DELETE /v1/files/:path</code> — mark deleted and drop the object.</li>
        </ul>
      </DocSection>
      <DocSection title="Upload tokens">
        <p><code className="text-fg">POST /v1/upload-tokens</code></p>
        <CodeBlock
          label="json"
          code={`{
  "folder": "uploads",
  "visibility": "public",
  "maxUploadBytes": 10485760,
  "expiresInSeconds": 900
}`}
        />
      </DocSection>
      <DocSection title="Errors">
        <p>Error responses use a stable <code className="text-fg">error</code> string. Common status codes: 400 invalid, 401 unauthorized, 403 scope or plan, 404 missing, 409 conflict, 410 expired, 413 too large.</p>
      </DocSection>
    </DocsLayout>
  );
}
