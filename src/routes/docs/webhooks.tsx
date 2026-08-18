import { createFileRoute } from "@tanstack/react-router";
import { DocsLayout, DocSection } from "@/components/docs/docs-layout";
import { CodeBlock } from "@/components/site/code-block";

export const Route = createFileRoute("/docs/webhooks")({ component: Page });

function Page() {
  return (
    <DocsLayout
      title="Webhooks"
      lede="Project-level endpoints. OpenByteShip delivers a signed JSON envelope when files change."
    >
      <DocSection title="Overview">
        <ul className="list-disc space-y-2 pl-5">
          <li>Use HTTPS endpoint URLs in production. Localhost HTTP URLs are allowed in development.</li>
          <li>Store the signing secret when it is shown. It is revealed only on creation.</li>
          <li>Failed deliveries are recorded in the console delivery log.</li>
        </ul>
      </DocSection>
      <DocSection title="Events">
        <ul className="list-disc space-y-2 pl-5">
          <li><code className="text-fg">file.uploaded</code> — file marked ready. Payload includes <code className="text-fg">source</code>.</li>
          <li><code className="text-fg">file.deleted</code> — after a file is marked deleted.</li>
          <li><code className="text-fg">image.metadata.created</code> — image dimensions extracted.</li>
          <li><code className="text-fg">image.transform.created</code> — reserved for image transform jobs.</li>
          <li><code className="text-fg">image.transform.failed</code> — reserved for failed transforms.</li>
        </ul>
      </DocSection>
      <DocSection title="Signatures">
        <CodeBlock
          label="ts"
          code={`const timestamp = request.headers.get("openbyteship-webhook-timestamp")
const signature = request.headers.get("openbyteship-webhook-signature")
const body = await request.text()

const expected = await hmacSha256Hex(
  endpointSecret,
  \`\${timestamp}.\${body}\`,
)

if (signature !== \`v1=\${expected}\`) {
  throw new Error("Invalid webhook signature")
}`}
        />
      </DocSection>
    </DocsLayout>
  );
}
