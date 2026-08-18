---
name: auth
description: >
  Add user accounts and sign-in to this TanStack Start app. Use when the app
  needs authentication, sign-in, user accounts, protected routes, or per-user
  data. Triggers on "auth", "login", "log in", "sign in", "sign up", "account",
  "users", "authentication", "protected", "who is logged in", "current user",
  "per-user".
metadata:
  short-description: "Auth via the Grok broker (Google, X) or local email/password — no other methods supported"
user-invocable: false
---

# Auth

This app authenticates users by running its **own**
[Better Auth](https://better-auth.com) at `/api/auth/*` and federating to the
shared **Grok auth broker** (`auth.grok.me`) via the `genericOAuth` plugin. The
broker offers the upstream sign-in methods and holds their shared secrets; this
app only holds its own per-app client id/secret and names the upstream it wants
via each provider's `idp` hint. This template wires **Google** and **X**; the
broker handles the actual login, so the app just renders the provider buttons.

**Supported sign-in methods — use ONLY these three; nothing else is supported:
Google, X, and email/password** (see "Supported sign-in methods" below).

**Sign-in is ON by default and REAL — including in the sandbox live preview.**
Build real sign-in; do **NOT** scaffold demo/mock/hardcoded users.

- **Live preview** (`*.grok-sandbox.com`): the app is an embedded iframe, so
  sign-in opens a **popup** (a top-level redirect to the broker can't work inside
  the iframe) and federates via a baked shared **preview client**
  (`src/lib/auth/preview.ts`). **`/auth/popup` is already handled by the template
  Vite plugin** (`vite.config.ts` → `popup.server.ts`) — it 302s straight to the
  broker/upstream login (never paints the React app) and, on return, posts the
  session bearer back in a tiny HTML page. **Do NOT create
  `src/routes/auth/popup.tsx`** (a React page there shows the full app in the
  popup — the common failure mode). Sessions (and email/password users) persist
  in the app's embedded PGLite DB — the SAME DB as app data — and, since the
  iframe's cookies are partitioned, ride a bearer token the popup hands back;
  all of that lives in `src/lib/auth`. Restarting the preview resets the DB.
- **Deployed**: the deployer injects a per-app client + `DATABASE_URL`, so
  sign-in persists identities in Postgres.
- **Off**: only when `VITE_AUTH_ENABLED=false` — then a **dev user** is returned
  (for building non-auth apps without a signed-in visitor).

Everything is **preinstalled and pre-wired in `src/lib/auth/`** — do not
`npm install` anything or reach for another auth library. `better-auth` is the
only auth package; do NOT use `@neondatabase/*`, `@stackframe/*`, or `@clerk/*`.

## What's pre-wired (`src/lib/auth/`)

| File | Use it for |
|---|---|
| `client.ts` | Browser client. `signIn(providerId)`, `signOut()`, `authEnabled`, `GROK_PROVIDERS`. |
| `server.ts` | The Better Auth instance (server-only). **Do not edit or rewrite.** Import only from `/api/auth/$`. |
| `email-password.ts` | **Only** place to enable local email/password (`emailAndPasswordEnabled = true`). |
| `popup.server.ts` | Live-preview popup handler (server-only). Already wired by the Vite plugin — do not create a route for it. |
| `providers.ts` | `GROK_PROVIDERS` — the fixed broker upstream list (Google and X only; don't add others). |
| `use-current-user.ts` | `useCurrentUser()` / `useCurrentUserState()` React hooks. |
| `gates.tsx` | `SignedIn`, `SignedOut`, `RedirectToSignIn`, `UserButton`. |
| `middleware.ts` | `authMiddleware` for server functions → verified `context.userId`. |
| `verify.server.ts` | `requireUserId()` / `getSessionUser()` (server-only) for manual wiring. |

`migrations/0001_auth.sql` is the Better Auth schema — **pre-applied, do not
edit**.

## Env vars — do **not** create a `.env` file

**Never write a `.env` / `.env.local` / `.env.example` for auth (or anything
else) in this sandbox.** Live preview sign-in works out of the box with **zero**
env configuration: the server falls back to the baked preview client in
`src/lib/auth/preview.ts`, derives the `*.grok-sandbox.com` origin per-request,
mints a process-stable session secret, and persists sessions in embedded
PGLite. Deployed apps get `GROK_AUTH_*` / `BETTER_AUTH_*` / `DATABASE_URL`
injected by the platform — still not something you write into a file.

Optional process-env knobs (platform / rare overrides only — **do not** put
these in a file you create):

| Var | Where | Purpose |
|---|---|---|
| `VITE_AUTH_ENABLED` | client | on by default; set `"false"` to turn sign-in OFF (dev user). Only client-visible auth flag |
| `BETTER_AUTH_URL` | server | app's own public origin; unset in preview (origin is derived per-request) |
| `BETTER_AUTH_SECRET` | server | signs this app's own sessions (process-stable fallback in preview; survives HMR) |
| `GROK_AUTH_ISSUER` | server | the shared broker (defaults to `https://auth.grok.me`) |
| `GROK_AUTH_CLIENT_ID` / `GROK_AUTH_CLIENT_SECRET` | server | per-app client (falls back to the preview client) |
| `DATABASE_URL` | server | when deployed, Better Auth persists here (preview persists to the embedded PGLite — same DB as app data) |

Never expose a non-`VITE_` var to the client. The preview client id/secret live
server-only in `src/lib/auth/preview.ts`.

## Wiring (do this once)

**Live-preview popup is PRE-WIRED — do not create it.**
`signIn` opens `/auth/popup`; the template Vite plugin
(`authPopupPlugin` in `vite.config.ts`) serves it via `popup.server.ts`.
**Never** add `src/routes/auth/popup.tsx` (or any React page / client OAuth at
that path). Doing so loads the full app shell in the popup ("the app opened
instead of Google") — that is always wrong.

**1. Mount Better Auth** — create the catch-all API route (this is what makes
`/api/auth/*` work; the broker's OAuth callback lands here):

```ts
// src/routes/api/auth/$.ts
import { createFileRoute } from "@tanstack/react-router";
import { auth } from "@/lib/auth/server";

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: ({ request }) => auth.handler(request),
      POST: ({ request }) => auth.handler(request),
    },
  },
});
```

**2. Add a sign-in page** — buttons that kick off the broker flow. Import from
`@/lib/auth/client`. `authEnabled` is true by default (preview + deployed),
so the buttons show and work in the live preview; the `else` branch only shows
when auth is explicitly disabled (`VITE_AUTH_ENABLED=false`):

```tsx
// src/routes/login.tsx
import { createFileRoute } from "@tanstack/react-router";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  return (
    <main className="grid min-h-screen place-items-center p-6">
      <div className="w-full max-w-sm space-y-3">
        <h1 className="text-xl font-semibold">Sign in</h1>
        {authEnabled ? (
          GROK_PROVIDERS.map((p) => (
            <button
              key={p.providerId}
              type="button"
              onClick={() => signIn(p.providerId, { callbackURL: "/" })}
              className="w-full cursor-pointer rounded-md border border-neutral-300 px-4 py-2 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900"
            >
              Continue with {p.label}
            </button>
          ))
        ) : (
          <p className="text-sm text-neutral-500">Sign-in is disabled.</p>
        )}
      </div>
    </main>
  );
}
```

`RedirectToSignIn` sends signed-out users to `/login` by default (override with
`<RedirectToSignIn to="/somewhere" />`). Style the page however you like — see
the `design-ui` skill.

That's it — call `signIn(providerId)` from your sign-in buttons. The popup,
bearer-token hand-off, and request attachment are all inside `src/lib/auth` +
the Vite plugin; leave them alone.

## Reading the user / protecting routes

`@/lib/auth/use-current-user` (with auth on — the default — these reflect the
REAL session, so a preview visitor is signed out until they sign in):

- `useCurrentUser()` → `AppUser | null` — for display. `null` means *loading OR
  signed out*, so never redirect on it alone.
- `useCurrentUserState()` → `{ user, isPending }` — for guards: wait for
  `isPending` to clear before treating `user: null` as signed out, or a hard
  reload bounces signed-in users to sign-in.

**State components** from `@/lib/auth/gates`: `SignedIn`, `SignedOut`,
`RedirectToSignIn`, `UserButton`. (When auth is disabled via
`VITE_AUTH_ENABLED=false` they apply dev-user semantics so a non-auth app still
renders.)

```tsx
import { useCurrentUser, useCurrentUserState } from "@/lib/auth/use-current-user";
import { RedirectToSignIn, SignedIn, SignedOut, UserButton } from "@/lib/auth/gates";

function Navbar() {
  const user = useCurrentUser(); // display only — null may just mean "loading"
  return (
    <>
      <span>{user?.displayName ?? "Guest"}</span>
      <SignedOut><a href="/login">Sign in</a></SignedOut>
      <SignedIn><UserButton /></SignedIn>
    </>
  );
}

function AccountPage() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) return null;             // session still resolving
  if (!user) return <RedirectToSignIn />; // client-side Navigate — not window.location
  return <h1>Welcome, {user.displayName}</h1>;
}
```

Sign out with `<UserButton />` or `signOut()` from `@/lib/auth/client`.

Session loading is the **same in live preview and when deployed**: wait for
`isPending` from `useCurrentUserState()` (backed by `/api/auth/get-session`).
The only live-preview difference is **how sign-in starts** (popup + bearer hand-off
instead of a full-page OAuth redirect) — not how guests vs signed-in users are
detected. Prefer `<RedirectToSignIn />` (TanStack `<Navigate>`) over
`window.location.href = "/login"` so a signed-out redirect does not full-reload
the SPA.

## Preventing auth flicker

`useSession()` resolves on the client, so a naive UI flashes signed-out →
signed-in on load. Rules:

1. **Gate on `isPending`, not `user` alone — and render a same-sized skeleton.**
   Showing the SAME placeholder while `isPending` (server render + first client
   paint) makes it one clean swap (skeleton → content) with no flash and no SSR
   hydration mismatch. Don't return `null` in a slot that then grows — reserve the
   space:

   ```tsx
   import { useCurrentUserState } from "@/lib/auth/use-current-user";
   import { UserButton } from "@/lib/auth/gates";

   function AuthSlot() {
     const { user, isPending } = useCurrentUserState();
     if (isPending) return <div className="h-8 w-8 animate-pulse rounded-full bg-black/10" />;
     return user ? <UserButton /> : <a href="/login">Sign in</a>;
   }
   ```

2. **Guard at a layout boundary** (nav / page shell), not in leaf components that
   mount/unmount — `useSession` is one shared store, so keep one stable consumer
   per region instead of re-gating everywhere.

3. **Zero-flash when deployed: SSR the session from the cookie.** On a deployed
   app (and top-level navigations) the session cookie is same-origin, so the server
   already knows the user on the first request — resolve it in the root route and
   render the authed shell immediately:

   ```tsx
   // src/routes/__root.tsx (excerpt)
   import { createServerFn } from "@tanstack/react-start";
   import { createRootRoute } from "@tanstack/react-router";

   const fetchSessionUser = createServerFn({ method: "GET" }).handler(async () => {
     // Cookie path only — works when deployed / on top-level loads.
     const { getSessionUser } = await import("@/lib/auth/verify.server");
     const u = await getSessionUser();
     return u ? { id: u.id, email: u.email } : null;
   });

   export const Route = createRootRoute({
     beforeLoad: async () => ({ sessionUser: await fetchSessionUser() }),
     // Merge into the existing root — keep head() / og:image from first scaffold.
     // component: prefer `sessionUser` for the FIRST paint when deployed, then
     // `useCurrentUserState()` for live in-page updates.
   });
   ```

   Sign-in/out navigate, so `beforeLoad` re-runs and the context stays fresh; call
   `router.invalidate()` if you change auth state without navigating.

   In live preview the session often rides a bearer after popup sign-in, so cookie
   SSR may still return null until the client `useSession()` runs with the bearer
   attached — still gate on `isPending`, same as when deployed.

The template already enables Better Auth's `session.cookieCache`, so `/get-session`
answers from a cookie when one is present (no DB round-trip).

## Per-user data (server-side — mandatory)

Pair auth with the DB (see the `neon` skill). A regular Postgres driver has full
DB access, so **every** server function that touches per-user data must verify
the caller and scope rows to them. Use the prewired **`authMiddleware`**: it
resolves the same-origin session to a verified `context.userId` (and rejects
scripted cross-site/sibling requests) — no token threading:

```ts
import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";

export const listTodos = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    // Type the row shape — a server fn's return must be provably serializable.
    return sql<{ id: number; title: string; done: boolean }>`select id, title, done from todos where user_id = ${context.userId} order by id desc`;
  });

// Inputs go through `.validator()` (the current API); the client passes `{ data }`:
export const addTodo = createServerFn({ method: "POST" })
  .validator((title: string) => title.trim())
  .middleware([authMiddleware])
  .handler(async ({ context, data: title }) => {
    if (!title) return;
    const sql = await getSql();
    await sql`insert into todos (user_id, title) values (${context.userId}, ${title})`;
  });
// mutations must scope writes too: `... where id = ${id} and user_id = ${context.userId}`
```

Call these from **client code** (effects, event handlers, React Query) — that's
where `Sec-Fetch-Site: same-origin` holds:

```ts
useEffect(() => { listTodos().then(setTodos).catch(() => setTodos([])); }, []);
```

Semantics: signed out → the middleware throws `UnauthorizedError` (message
`"Unauthorized"`, `status` 401 — match it to send the visitor to sign-in), in the
live preview too (real auth). Only when auth is disabled
(`VITE_AUTH_ENABLED=false`) does it resolve the dev user (`"dev-user"`) and never
throw. Keep `user_id` columns `TEXT` (Better Auth uses text ids; the disabled dev
user is `'dev-user'`). Never trust a client-supplied user id — only the
middleware / `requireUserId()` result.

## Supported sign-in methods

Use **only** these three — no other method is supported:

- **Google** and **X** — federated through the Grok broker (pre-wired here). The
  broker federates these two upstreams and nothing else, so do **not** add entries
  to `GROK_PROVIDERS` beyond them (the broker rejects an unknown `idp`).
- **Email + password** — this app's OWN Better Auth, persisted in your database
  (never the broker, never mocked). Better Auth is DB-backed in BOTH modes — real
  Postgres when deployed and the embedded PGLite in the sandbox preview — so
  email/password accounts are stored and survive across requests, **in preview
  too**. It's off by default. Enable it by editing **only**
  `src/lib/auth/email-password.ts`:

  ```ts
  // src/lib/auth/email-password.ts
  export const emailAndPasswordEnabled = true; // was false
  ```

  **Do not edit or rewrite `src/lib/auth/server.ts`** (or any other file under
  `src/lib/auth/` except `email-password.ts` for this flag). That file is
  pre-wired; "fixing" it by regenerating Better Auth config breaks live-preview
  sign-in.

  The pre-applied schema already has the `account.password` column — no migration
  needed. Then build sign-up / sign-in forms with `authClient.signUp.email(...)`
  and `authClient.signIn.email(...)` from `@/lib/auth/client`.

  **Do not** add `emailAndPassword` as a plugin entry (that is a syntax/type
  error). **Do not** invent a new Better Auth config.

  If sign-up/sign-in returns **"Invalid origin"**, do **not** disable CSRF and
  do **not** edit `server.ts`. The template's `trustedOrigins` already covers
  `*.grok-sandbox.com` and local loopback on port 8080 (`localhost` /
  `127.0.0.1` / `[::1]`). Open the app at one of those origins (not a random
  host/port).

Do **NOT** add or use anything else: no other social / OAuth providers (GitHub,
Apple, Discord, Microsoft, Facebook, …), and no magic links, passkeys, one-time
codes / OTP, phone / SMS, or anonymous sign-in.

## Security model (already handled — don't undo it)

- **Headless broker**: the app names the upstream (`idp`); the broker forwards
  straight to Google/X. Users never see the broker.
- **`__Host-` cookies + `trustedOrigins`**: a sibling `*.grok.me` app can't toss a
  `Domain=.grok.me` cookie, and Better Auth rejects cross-origin `/api/auth`
  calls.
- **Sibling isolation**: `authMiddleware` rejects scripted cross-site/same-site
  requests (Fetch-Metadata), so a sibling can't ride this app's session cookie
  into its server functions.
- The upstream Google/X tokens live only on the broker; this app only ever gets a
  broker-issued identity and mints its own local session.
