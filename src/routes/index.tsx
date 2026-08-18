import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Lock, Globe, Server } from "lucide-react";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/site/code-block";
import { PLANS } from "@/lib/obs/plans";
import { formatBytes } from "@/lib/utils";

export const Route = createFileRoute("/")({ component: Home });

const SAMPLE = `import { OpenByteShipClient } from "@openbyteship/js"

const obs = new OpenByteShipClient({
  apiKey: process.env.OPENBYTESHIP_API_KEY!,
})

const uploaded = await obs.upload(file, {
  path: "invoices/2026/invoice.pdf",
  visibility: "public",
})

console.log(uploaded.url)`;

const FRAMEWORKS = [
  "Next.js",
  "TanStack Start",
  "Astro",
  "Remix",
  "SvelteKit",
  "Express",
  "Hono",
  "Elysia",
  "NestJS",
];

function Home() {
  return (
    <div className="min-h-screen bg-bg">
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgb(18_18_20/0.55),transparent_42%)]" />
          <div className="mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
            <p className="text-xs uppercase tracking-[0.22em] text-subtle">Upload · Store · Deliver</p>
            <h1 className="mt-4 max-w-3xl font-display text-5xl leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
              Ship uploads, not infrastructure.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted">
              Handle uploads, storage, and delivery with a single API. No buckets, no edge configs, no
              headaches.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/login">
                  Start uploading
                  <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link to="/docs">Read docs</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="border-t border-border">
          <div className="mx-auto grid max-w-6xl gap-px bg-border px-0 sm:grid-cols-3">
            {[
              {
                icon: Server,
                title: "Uploads",
                body: "Create a session, stream bytes to storage, complete. The SDK does it in one call.",
              },
              {
                icon: Globe,
                title: "Public files",
                body: "Stable delivery URLs with an immutable project namespace in front of every path.",
              },
              {
                icon: Lock,
                title: "Private files",
                body: "No public URL. Issue short-lived signed links only after your app approves access.",
              },
            ].map((item) => (
              <div key={item.title} className="bg-bg px-6 py-10 sm:px-8">
                <item.icon className="size-5 text-accent" />
                <h2 className="mt-4 font-display text-2xl">{item.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl items-start gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-subtle">JavaScript SDK</p>
            <h2 className="mt-3 font-display text-4xl tracking-tight">One client. Path as the key.</h2>
            <p className="mt-4 text-muted">
              Keep the project API key on the server. Mint a short-lived upload token for the browser. Paths
              replace opaque IDs — uploading to the same path replaces the file.
            </p>
            <Button asChild variant="outline" className="mt-6">
              <Link to="/docs/javascript-sdk">JavaScript SDK</Link>
            </Button>
          </div>
          <CodeBlock code={SAMPLE} label="typescript" />
        </section>

        <section className="border-y border-border">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <p className="text-xs uppercase tracking-[0.22em] text-subtle">Works with your stack</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {FRAMEWORKS.map((name) => (
                <span
                  key={name}
                  className="rounded-full bg-surface px-4 py-2 text-sm text-muted shadow-[var(--shadow-border)]"
                >
                  {name}
                </span>
              ))}
            </div>
            <Link to="/docs/frameworks" className="mt-6 inline-flex items-center gap-1 text-sm text-fg hover:underline">
              Learn more about frameworks
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <h2 className="font-display text-4xl tracking-tight">Plans that scale with your files.</h2>
              <p className="mt-3 max-w-xl text-muted">
                Start free. Private uploads unlock on Lite. Upgrade in the console as traffic grows.
              </p>
            </div>
            <Button asChild variant="secondary">
              <Link to="/pricing">See pricing</Link>
            </Button>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {PLANS.slice(0, 3).map((plan) => (
              <div key={plan.id} className="rounded-xl bg-surface p-6 shadow-[var(--shadow-border)]">
                <div className="flex items-baseline justify-between">
                  <h3 className="font-display text-2xl">{plan.name}</h3>
                  <p className="font-mono text-sm tabular-nums text-muted">
                    {plan.price === 0 ? "$0" : `$${plan.price}/mo`}
                  </p>
                </div>
                <p className="mt-2 text-sm text-muted">{plan.blurb}</p>
                <ul className="mt-5 space-y-2 text-sm text-muted">
                  <li>{formatBytes(plan.storageBytes)} storage</li>
                  <li>{formatBytes(plan.bandwidthBytes)} bandwidth</li>
                  <li>{formatBytes(plan.maxUploadBytes)} max upload</li>
                  <li>{plan.privateUploads ? "Private uploads" : "Public uploads only"}</li>
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-border">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <p className="font-mono text-sm text-subtle">99.999999999% uptime</p>
            <h2 className="mt-3 max-w-3xl font-display text-4xl tracking-tight md:text-5xl">
              File uploads should be intuitive, fast, secure and reliable.
            </h2>
            <p className="mt-5 max-w-2xl text-muted">
              OpenByteShip gives your app scalable file handling without the infra complexity. Ready to ship?
              Storage, private access, and fast delivery as your app grows.
            </p>
            <Button asChild size="lg" className="mt-8">
              <Link to="/login">
                Start uploading
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
