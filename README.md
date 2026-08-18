# OpenByteShip

Ship uploads, not infrastructure.

OpenByteShip is an open-source file platform: create an upload session, PUT the
bytes, complete the session, and deliver the file from a stable CDN-style URL.
Projects get a console for files, API keys, activity, webhooks, and usage.

## Features

- **Path-keyed files** — every object lives at `/v1/files/:path`
- **3-step uploads** — create session → PUT bytes → complete
- **Public + private files** — public URLs at `/f/:namespace/:path`, private files via signed URLs
- **API keys** — scoped `files:read`, `files:write`, `files:delete` (`obshp_…`)
- **Upload tokens** — short-lived browser uploads without exposing a secret key
- **Webhooks** — signed JSON on `file.uploaded`, `file.deleted`, `image.metadata.created`
- **Image metadata** — dimensions and dominant color after complete
- **JS client** — `OpenByteShipClient` in [`src/lib/obs/sdk.ts`](src/lib/obs/sdk.ts)

## Stack

- [TanStack Start](https://tanstack.com/start) + React 19
- Postgres (Neon in production, [PGLite](https://pglite.dev) in local preview)
- Better Auth
- Tailwind CSS 4

## Quick start

```bash
npm install
npm run dev
```

App: [http://127.0.0.1:8080](http://127.0.0.1:8080)

Leave `DATABASE_URL` unset locally — the app uses embedded PGLite. Migrations in
[`migrations/`](migrations/) apply on startup.

```bash
npm run typecheck
npm run build
```

## Upload from the SDK

```ts
import { OpenByteShipClient } from "@openbyteship/js"

const obs = new OpenByteShipClient({
  apiKey: process.env.OPENBYTESHIP_API_KEY!,
})

const uploaded = await obs.upload(file, {
  path: "avatars/me.jpg",
  visibility: "public",
})

console.log(uploaded.url)
```

The in-repo client lives at `src/lib/obs/sdk.ts`. Point `baseUrl` at this origin
when you are not importing a published package.

## HTTP API

Authenticate with `Authorization: Bearer $OPENBYTESHIP_API_KEY`.

| Method | Path | Purpose |
| --- | --- | --- |
| `PUT` | `/v1/files/:path` | Create an upload session |
| `PUT` | upload URL from the session | Stream file bytes |
| `POST` | `/v1/files/:path/upload/complete` | Mark the file ready |
| `GET` | `/v1/files/:path` | Metadata (`Accept: application/json`) or bytes |
| `POST` | `/v1/files/:path/signed-url` | Temporary private URL |
| `DELETE` | `/v1/files/:path` | Delete the object |
| `POST` | `/v1/upload-tokens` | Mint a scoped upload token |
| `GET` | `/f/:namespace/:path` | Public (or signed) delivery |

Docs: [`/docs`](src/routes/docs/index.tsx)

## Console

Sign in, create a project, then:

- **Files** — upload, folders, visibility, signed URLs
- **API keys** — create, reveal once, revoke
- **Activity** — key, upload, and delete events
- **Webhooks** — endpoints, secrets, delivery log
- **Settings** — project name, plan, delete

## License

[MIT](LICENSE)
