import { createFileRoute } from "@tanstack/react-router";
import { DocsLayout, DocSection } from "@/components/docs/docs-layout";
import { CodeBlock } from "@/components/site/code-block";

export const Route = createFileRoute("/docs/go-sdk")({ component: Page });

function Page() {
  return (
    <DocsLayout
      title="Go SDK"
      lede="Use from trusted backend services to upload files, mint browser upload tokens, and create signed URLs."
    >
      <DocSection title="Install">
        <CodeBlock label="bash" code={`go get github.com/openbyteship/openbyteship-go`} />
      </DocSection>
      <DocSection title="Upload route">
        <CodeBlock
          label="go"
          code={`uploaded, err := client.Upload(r.Context(), openbyteship.UploadInput{
  Reader:      file,
  Filename:    header.Filename,
  ContentType: header.Header.Get("Content-Type"),
  Path:        "uploads/" + header.Filename,
  Visibility:  openbyteship.VisibilityPublic,
})`}
        />
      </DocSection>
    </DocsLayout>
  );
}
