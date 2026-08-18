import { createFileRoute } from "@tanstack/react-router";
import { DocsLayout, DocSection } from "@/components/docs/docs-layout";
import { CodeBlock } from "@/components/site/code-block";

export const Route = createFileRoute("/docs/python-sdk")({ component: Page });

function Page() {
  return (
    <DocsLayout
      title="Python SDK"
      lede="Use from backend services to upload files, create browser upload tokens, and generate signed URLs."
    >
      <DocSection title="Install">
        <CodeBlock label="bash" code={`pip install openbyteship`} />
      </DocSection>
      <DocSection title="Upload a file">
        <CodeBlock
          label="python"
          code={`import os
from openbyteship import OpenByteShipClient, Visibility

client = OpenByteShipClient(api_key=os.environ["OPENBYTESHIP_API_KEY"])

with open("photo.jpg", "rb") as photo:
    uploaded = client.upload(
        photo,
        filename="photo.jpg",
        content_type="image/jpeg",
        path="uploads/photo.jpg",
        visibility=Visibility.PUBLIC,
    )

print(uploaded.id, uploaded.url)`}
        />
      </DocSection>
      <DocSection title="Private files">
        <CodeBlock
          label="python"
          code={`signed = client.create_signed_url(
    private_file.path,
    expires_in_seconds=15 * 60,
)
download_url = signed.signed_url.url`}
        />
      </DocSection>
    </DocsLayout>
  );
}
