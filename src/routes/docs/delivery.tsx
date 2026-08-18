import { createFileRoute } from "@tanstack/react-router";
import { DocsLayout, DocSection } from "@/components/docs/docs-layout";
import { CodeBlock } from "@/components/site/code-block";

export const Route = createFileRoute("/docs/delivery")({ component: Page });

function Page() {
  return (
    <DocsLayout
      title="Delivery & signed URLs"
      lede="Public files get a stable CDN-style URL. Private files stay dark until your app issues a signed link."
    >
      <DocSection title="Public URLs">
        <p>Public delivery URLs are constructed as:</p>
        <CodeBlock label="url" code={`https://your-host/f/<project-namespace>/<path>`} />
        <p>
          Example: <code className="text-fg">/f/p_x7K9mQ/invoices/2026/may/invoice.pdf</code>. The namespace is
          short and immutable. File IDs are still returned for auditing, but new code should use paths as the
          primary identifier.
        </p>
      </DocSection>
      <DocSection title="Private files">
        <p>
          Private uploads return <code className="text-fg">null</code> for the public URL. Create a signed URL
          from server code only after your app has authorized the viewer.
        </p>
        <CodeBlock
          label="ts"
          code={`const { signedUrl } = await obs.createSignedUrl(file.path, {
  expiresInSeconds: 10 * 60,
})

download.href = signedUrl.url`}
        />
      </DocSection>
      <DocSection title="Image transforms">
        <p>
          Image delivery URLs accept a <code className="text-fg">tr</code> query, the same idea as Byteship's
          CDN: <code className="text-fg">?tr=w-640,h-360,fit-cover,f-webp</code>. The React <code className="text-fg">Image</code> helper
          maps transform objects onto that query and can show a dominant-color placeholder while the file loads.
        </p>
      </DocSection>
    </DocsLayout>
  );
}
