import { createFileRoute, Link } from "@tanstack/react-router";
import { DocsLayout, DocSection } from "@/components/docs/docs-layout";
import { CodeBlock } from "@/components/site/code-block";

export const Route = createFileRoute("/docs/")({ component: Page });

function Page() {
  return (
    <DocsLayout
      title="Overview"
      lede="The short version of how OpenByteShip fits into your app: create uploads, stream files, and deliver them from one API."
    >
      <DocSection title="What it does">
        <p>
          OpenByteShip gives every project one place for upload sessions, object storage, delivery URLs, API
          keys, and usage limits. Your app asks OpenByteShip for an upload, sends bytes directly to storage,
          then completes the upload so the file can be delivered.
        </p>
      </DocSection>
      <DocSection title="Model">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-fg">Uploads.</strong> Create a session, upload to the returned URL, then
            complete it.
          </li>
          <li>
            <strong className="text-fg">Files.</strong> Store public and private files with stable file paths
            and metadata.
          </li>
          <li>
            <strong className="text-fg">Delivery.</strong> Public files get stable delivery URLs; private files
            use signed URLs.
          </li>
        </ul>
      </DocSection>
      <DocSection title="Quick start">
        <p>
          Sign in to the <Link to="/console" className="text-fg underline underline-offset-4">console</Link>,
          create a project, mint an API key with <code className="text-fg">files:write</code>, then upload:
        </p>
        <CodeBlock
          label="ts"
          code={`import { OpenByteShipClient } from "@openbyteship/js"

const obs = new OpenByteShipClient({
  apiKey: process.env.OPENBYTESHIP_API_KEY!,
})

const uploaded = await obs.upload(file, {
  path: "avatars/me.jpg",
  visibility: "public",
})`}
        />
      </DocSection>
    </DocsLayout>
  );
}
