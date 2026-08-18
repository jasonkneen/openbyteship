import { Link } from "@tanstack/react-router";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const { user, isPending } = useCurrentUserState();
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-6 text-sm text-muted md:flex">
          <Link to="/docs" className="hover:text-fg">
            Docs
          </Link>
          <Link to="/pricing" className="hover:text-fg">
            Pricing
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          {isPending ? (
            <div className="h-11 w-24 animate-pulse rounded-sm bg-elevated" />
          ) : user ? (
            <Button asChild size="sm">
              <Link to="/console">Console</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link to="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/login">Start uploading</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
