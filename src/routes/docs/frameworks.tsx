import { createFileRoute } from "@tanstack/react-router";
import { DocsLayout, DocSection } from "@/components/docs/docs-layout";
import { CodeBlock } from "@/components/site/code-block";

export const Route = createFileRoute("/docs/frameworks")({ component: Page });

function Page() {
  return (
    <DocsLayout
      title="Frameworks"
      lede="Mint an upload token on the server, then upload from the browser. Same pattern in every stack."
    >
      <DocSection title="TanStack Start">
        <CodeBlock
          label="tsx"
          code={`export const Route = createFileRoute("/api/obs/upload-token")({
  server: {
    handlers: {
      POST: async () => {
        const { uploadToken } = await obs.createUploadToken({
          folder: "uploads",
          visibility: "public",
          maxUploadBytes: 10 * 1024 * 1024,
        })
        return Response.json({
          token: uploadToken.token,
          expiresAt: uploadToken.expiresAt,
        })
      },
    },
  },
})`}
        />
      </DocSection>
      <DocSection title="Next.js">
        <CodeBlock
          label="ts"
          code={`// app/api/obs/upload-token/route.ts
export async function POST() {
  const { uploadToken } = await obs.createUploadToken({
    folder: "uploads",
    visibility: "public",
    maxUploadBytes: 10 * 1024 * 1024,
  })
  return NextResponse.json({
    token: uploadToken.token,
    expiresAt: uploadToken.expiresAt,
  })
}`}
        />
      </DocSection>
      <DocSection title="Also documented">
        <p>
          Astro, Remix, SvelteKit, Express, Hono, Elysia, and NestJS follow the same split: keep{" "}
          <code className="text-fg">OPENBYTESHIP_API_KEY</code> on the server, return an{" "}
          <code className="text-fg">obut_</code> token to the client, then call{" "}
          <code className="text-fg">upload()</code>.
        </p>
      </DocSection>
    </DocsLayout>
  );
}
