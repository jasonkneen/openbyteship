import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/brand/logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs text-sm text-muted">
            Upload, store, and deliver files from one API. The open take on Byteship.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-10 text-sm">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wider text-subtle">Product</p>
            <Link to="/docs" className="block text-muted hover:text-fg">
              Documentation
            </Link>
            <Link to="/docs/api" className="block text-muted hover:text-fg">
              API reference
            </Link>
            <Link to="/pricing" className="block text-muted hover:text-fg">
              Pricing
            </Link>
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wider text-subtle">Developers</p>
            <Link to="/docs/javascript-sdk" className="block text-muted hover:text-fg">
              JavaScript SDK
            </Link>
            <Link to="/docs/frameworks" className="block text-muted hover:text-fg">
              Frameworks
            </Link>
            <Link to="/console" className="block text-muted hover:text-fg">
              Console
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
