import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PLANS } from "@/lib/obs/plans";
import { formatBytes } from "@/lib/utils";

export const Route = createFileRoute("/pricing")({ component: Pricing });

function Pricing() {
  return (
    <div className="min-h-screen bg-bg">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="text-xs uppercase tracking-[0.22em] text-subtle">Pricing</p>
        <h1 className="mt-3 font-display text-5xl tracking-tight">Plans that scale with your files.</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted">
          Unlimited projects on every plan. Private uploads start on Lite. Switch plans from project settings
          in the console.
        </p>
        <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className="flex flex-col rounded-xl bg-surface p-6 shadow-[var(--shadow-border)]"
            >
              <div className="flex items-center gap-2">
                <h2 className="font-display text-2xl">{plan.name}</h2>
                {plan.recommended ? <Badge tone="accent">Recommended</Badge> : null}
              </div>
              <p className="mt-3 font-mono text-2xl tabular-nums">
                {plan.price === 0 ? "$0" : `$${plan.price}`}
                <span className="text-sm text-muted">{plan.price === 0 ? "" : " / mo"}</span>
              </p>
              <p className="mt-2 min-h-10 text-sm text-muted">{plan.blurb}</p>
              <ul className="mt-5 flex-1 space-y-2 text-sm text-muted">
                <li>{formatBytes(plan.storageBytes)} storage</li>
                <li>{formatBytes(plan.bandwidthBytes)} bandwidth</li>
                <li>{formatBytes(plan.maxUploadBytes)} max upload</li>
                <li>Unlimited projects</li>
                <li>{plan.privateUploads ? "Private uploads" : "No private uploads"}</li>
                <li>{plan.seats === 1 ? "Solo workspace" : `Up to ${plan.seats} team members`}</li>
              </ul>
              <Button asChild className="mt-6 w-full" variant={plan.recommended ? "default" : "secondary"}>
                <Link to="/login">{plan.price === 0 ? "Start free" : `Choose ${plan.name}`}</Link>
              </Button>
            </div>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
