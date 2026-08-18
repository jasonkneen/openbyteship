import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/docs", label: "Overview" },
  { href: "/docs/uploading", label: "Uploading a file" },
  { href: "/docs/delivery", label: "Delivery & signed URLs" },
  { href: "/docs/api-keys", label: "API keys" },
  { href: "/docs/webhooks", label: "Webhooks" },
  { href: "/docs/api", label: "API reference" },
  { href: "/docs/javascript-sdk", label: "JavaScript SDK" },
  { href: "/docs/react-sdk", label: "React SDK" },
  { href: "/docs/python-sdk", label: "Python SDK" },
  { href: "/docs/go-sdk", label: "Go SDK" },
  { href: "/docs/frameworks", label: "Frameworks" },
];

export function DocsLayout({ title, lede, children }: { title: string; lede?: string; children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="min-h-screen overflow-x-hidden bg-bg text-fg">
      <SiteHeader />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[220px_1fr]">
        <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
          <p className="mb-3 text-xs uppercase tracking-wider text-subtle">Documentation</p>
          <nav className="flex min-w-0 gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
            {NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "shrink-0 rounded-sm px-3 py-2 text-sm",
                    active ? "bg-elevated text-fg" : "text-muted hover:text-fg",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <article className="min-w-0 pb-16">
          <h1 className="font-display text-4xl tracking-tight md:text-5xl">{title}</h1>
          {lede ? <p className="mt-4 max-w-2xl text-lg text-muted">{lede}</p> : null}
          <div className="mt-10 space-y-10">{children}</div>
        </article>
      </div>
      <SiteFooter />
    </div>
  );
}

export function DocSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="font-display text-2xl tracking-tight">{title}</h2>
      <div className="space-y-3 text-[15px] leading-relaxed text-muted">{children}</div>
    </section>
  );
}
