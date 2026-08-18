---
name: multiplayer-p2p
description: >
  Peer-to-peer realtime multiplayer over WebRTC data channels: every user of
  the deployed app connects directly to every other user (full mesh), the
  server only brokers the handshake at /api/rtc. Lowest possible latency, zero
  per-message server cost. Use for 2-8 player co-op/casual realtime: shared
  cursors, drawing, party games, casual action. Triggers: p2p, peer to peer,
  webrtc, low latency multiplayer, direct connection.
metadata:
  short-description: "WebRTC P2P mesh, signaled at /api/rtc"
user-invocable: false
---

# Multiplayer (WebRTC peer-to-peer)

All visitors on the same deployed domain join one default room, opening a
native WebRTC data channel directly to every other visitor — game traffic
itself never touches a server. A tiny relay at `/api/rtc` handles only the
routing of the connection handshake (SDP/ICE) while peers connect. What you
use from the kit is client-side only; the relay is yours — keep it as
drafted below, or serve the same `RtcPollResponse` shape from any store.

Latency is browser↔browser (often 5–40ms) with zero per-tick server cost.

| Piece | Path |
|---|---|
| Mesh primitive (start here) | `P2PRoom` from `@/lib/multiplayer` |
| React room binding (optional, you create) | `src/lib/multiplayer/use-p2p-room.ts` |
| Signaling relay (you create) | `src/lib/multiplayer/signaling.server.ts` |
| HTTP mount (you create) | `src/routes/api/rtc.ts` |

**Trust model — read before choosing P2P.** There is no server authority:
every peer runs its own copy of the rules and can lie (position, score,
anything). Peers also learn each other's IP addresses during ICE. P2P is for
**co-op and casual play among people who choose to play together** — never for
competitive ranking, cheat-sensitive, or anonymous-stranger matchmaking.
Competitive or cheat-sensitive play is not supported in this template: push
back in product terms rather than shipping it on P2P.

Practical limits: a full mesh is O(N²) connections — cap rooms at ~8 peers.
Roughly 10–20% of peer pairs sit behind strict NATs and cannot connect; the
kit surfaces this per peer as `connectionState: "failed"` — show it in the
UI rather than hanging.

## Schema — nothing to do by default

The reference relay above creates its two tables on first use
(`CREATE TABLE IF NOT EXISTS`, once per process) — nothing ships in
`migrations/` and the template itself never touches your database. If you'd rather own or extend the schema (extra columns, your own
migration ordering), copy this into one of your app migrations; `IF NOT
EXISTS` makes the runtime ensure and your migration coexist safely:

```sql
-- CREATE TABLE IF NOT EXISTS webrtc_peers (
--   room TEXT NOT NULL,
--   peer_id TEXT NOT NULL,
--   name TEXT NOT NULL DEFAULT '',
--   last_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
--   PRIMARY KEY (room, peer_id)
-- );
-- CREATE TABLE IF NOT EXISTS webrtc_signals (
--   id BIGSERIAL PRIMARY KEY,
--   room TEXT NOT NULL,
--   to_peer TEXT NOT NULL,
--   from_peer TEXT NOT NULL,
--   kind TEXT NOT NULL,
--   payload JSONB NOT NULL,
--   created_at TIMESTAMPTZ NOT NULL DEFAULT now()
-- );
-- CREATE INDEX IF NOT EXISTS webrtc_signals_inbox
--   ON webrtc_signals (room, to_peer, id);
```

## Setup — create the signaling relay (once)

Copy this file as-is (or adapt it — it is yours, not part of the kit):

```ts
// src/lib/multiplayer/signaling.server.ts
/**
 * WebRTC signaling over the app database (Neon deployed, PGLite in preview).
 * Only rendezvous traffic passes through here — roster + SDP/ICE relay while a
 * mesh forms; game data then flows peer-to-peer. DB-backed so any serverless
 * instance can serve any poll. Mount at /api/rtc (see the multiplayer-p2p
 * skill); the client side lives in `@/lib/multiplayer`.
 *
 * The GET poll is the whole peer lifecycle: the first poll (since=0) IS the
 * join — it registers the peer, returns the roster, and prunes stale rows.
 * Peer ids are random per mount, so a fresh inbox never has old signals to
 * skip and no join/cursor handshake is needed.
 */
import { z } from "zod";
import { getSql, type Sql } from "@/lib/db";
import type { PeerRow, RtcPollResponse, SignalRow } from "./p2p";

const ID = z.string().regex(/^[a-zA-Z0-9_-]{1,64}$/);
const signalSchema = z.object({
  op: z.literal("signal"),
  room: ID,
  from: ID,
  to: ID,
  kind: z.enum(["offer", "answer", "ice"]),
  // SDP offers are typically 3–10KB; the cap only blocks abuse (payload is
  // re-serialized at insert — cheap at this size). An absent
  // payload is rejected here (JSON.stringify(undefined) has no .length).
  payload: z.unknown().refine((v) => v !== undefined && JSON.stringify(v).length <= 32_768, {
    message: "payload too large",
  }),
});
const leaveSchema = z.object({ op: z.literal("leave"), room: ID, peer: ID });
const postSchema = z.discriminatedUnion("op", [signalSchema, leaveSchema]);


const PEER_TTL_SECONDS = 30;
const SIGNAL_TTL_SECONDS = 60;

/**
 * The kit ships no migration: tables are created on first use (IF NOT EXISTS)
 * so the app's migrations/ namespace stays fully in the agent's hands. Agents
 * who want to own/extend the schema can copy the DDL from the multiplayer-p2p
 * skill into their own migration — both coexist safely. Memoized on globalThis
 * (the db.ts pattern) so dev HMR never runs two ensures concurrently; a failed
 * ensure clears the slot so the next request retries.
 */
const globalRef = globalThis as typeof globalThis & {
  __rtcSchemaPromise__?: Promise<void>;
};

function ensureSchema(sql: Sql): Promise<void> {
  globalRef.__rtcSchemaPromise__ ??= (async () => {
    await sql.query(
      `CREATE TABLE IF NOT EXISTS webrtc_peers (
         room TEXT NOT NULL,
         peer_id TEXT NOT NULL,
         name TEXT NOT NULL DEFAULT '',
         last_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
         PRIMARY KEY (room, peer_id)
       )`,
    );
    await sql.query(
      `CREATE TABLE IF NOT EXISTS webrtc_signals (
         id BIGSERIAL PRIMARY KEY,
         room TEXT NOT NULL,
         to_peer TEXT NOT NULL,
         from_peer TEXT NOT NULL,
         kind TEXT NOT NULL,
         payload JSONB NOT NULL,
         created_at TIMESTAMPTZ NOT NULL DEFAULT now()
       )`,
    );
    await sql.query(
      `CREATE INDEX IF NOT EXISTS webrtc_signals_inbox
         ON webrtc_signals (room, to_peer, id)`,
    );
  })().catch((err) => {
    globalRef.__rtcSchemaPromise__ = undefined;
    throw err;
  });
  return globalRef.__rtcSchemaPromise__;
}

async function roster(sql: Sql, room: string): Promise<PeerRow[]> {
  // LIMIT bounds the blast radius of room-stuffing; the mesh caps out ~8.
  const rows = await sql.query<{ peer_id: string; name: string }>(
    `SELECT peer_id, name FROM webrtc_peers
     WHERE room = $1 AND last_seen > now() - make_interval(secs => $2)
     ORDER BY peer_id LIMIT 32`,
    [room, PEER_TTL_SECONDS],
  );
  return rows.map((r) => ({ id: r.peer_id, name: r.name }));
}

async function touchPeer(sql: Sql, room: string, peer: string, name: string) {
  await sql.query(
    `INSERT INTO webrtc_peers (room, peer_id, name, last_seen)
     VALUES ($1, $2, $3, now())
     ON CONFLICT (room, peer_id)
     DO UPDATE SET last_seen = now(), name = EXCLUDED.name`,
    [room, peer, name],
  );
}

/**
 * Rows are ephemeral; GC rides the polls instead of a cron: joins (since=0)
 * always prune, and ~2% of all other polls do too — so a busy room whose
 * cursors always advance still gets swept, without every heartbeat paying
 * the two DELETEs.
 */
async function prune(sql: Sql) {
  await Promise.all([
    sql.query(`DELETE FROM webrtc_signals WHERE created_at < now() - make_interval(secs => $1)`, [
      SIGNAL_TTL_SECONDS,
    ]),
    sql.query(`DELETE FROM webrtc_peers WHERE last_seen < now() - make_interval(secs => $1)`, [
      PEER_TTL_SECONDS,
    ]),
  ]);
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

/** GET /api/rtc?room&peer&name&since — join (since=0), heartbeat, and inbox. */
async function handleGet(url: URL): Promise<Response> {
  const parsed = z
    .object({
      room: ID,
      peer: ID,
      name: z.string().max(64).default(""),
      since: z.coerce.number().int().min(0).default(0),
    })
    .safeParse({
      room: url.searchParams.get("room"),
      peer: url.searchParams.get("peer"),
      name: url.searchParams.get("name") ?? "",
      since: url.searchParams.get("since") ?? 0,
    });
  if (!parsed.success) return json({ error: "invalid query" }, 400);
  const { room, peer, name, since } = parsed.data;

  const sql = await getSql();
  await ensureSchema(sql);
  if (since === 0 || Math.random() < 0.02) await prune(sql);
  await touchPeer(sql, room, peer, name);
  const rows = await sql.query<{
    id: number;
    from_peer: string;
    kind: SignalRow["kind"];
    payload: unknown;
  }>(
    `SELECT id, from_peer, kind, payload FROM webrtc_signals
     WHERE room = $1 AND to_peer = $2 AND id > $3
     ORDER BY id LIMIT 200`,
    [room, peer, since],
  );
  const body: RtcPollResponse = {
    peers: await roster(sql, room),
    signals: rows.map((r) => ({
      id: r.id,
      from: r.from_peer,
      kind: r.kind,
      payload: r.payload,
    })),
  };
  return json(body);
}

async function handlePost(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "invalid JSON" }, 400);
  }
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) return json({ error: "invalid request" }, 400);
  const msg = parsed.data;
  const sql = await getSql();
  await ensureSchema(sql);

  if (msg.op === "signal") {
    await sql.query(
      `INSERT INTO webrtc_signals (room, to_peer, from_peer, kind, payload)
       VALUES ($1, $2, $3, $4, $5)`,
      [msg.room, msg.to, msg.from, msg.kind, JSON.stringify(msg.payload)],
    );
  } else {
    await sql.query(`DELETE FROM webrtc_peers WHERE room = $1 AND peer_id = $2`, [
      msg.room,
      msg.peer,
    ]);
  }
  return json({ ok: true });
}

/** Request entrypoint for the /api/rtc route (GET poll, POST signal/leave). */
export async function handleSignaling(request: Request): Promise<Response> {
  try {
    if (request.method === "GET") return await handleGet(new URL(request.url));
    if (request.method === "POST") return await handlePost(request);
    return json({ error: "method not allowed" }, 405);
  } catch (error) {
    console.error("[rtc] signaling error:", error);
    return json({ error: "signaling failed" }, 500);
  }
}
```

## Setup — mount the API route (once)

```ts
// src/routes/api/rtc.ts
import { createFileRoute } from "@tanstack/react-router";
import { handleSignaling } from "@/lib/multiplayer/signaling.server";

const handle = ({ request }: { request: Request }) => handleSignaling(request);

export const Route = createFileRoute("/api/rtc")({
  server: { handlers: { GET: handle, POST: handle } },
});
```

## Using the primitive

`P2PRoom` is framework-free, and a "room" is just a rendezvous key — a lobby
code, a 1:1 call id, a shared-document id, any string (≤64 chars). Any
architecture sits on top of the same three calls:

```ts
import { P2PRoom } from "@/lib/multiplayer";

const p2p = new P2PRoom({
  room: "doc-42",
  selfId: myId,
  name: "ani",
  onPeersChanged: (peers) => render(peers),
  onMessage: (from, data, channel) => apply(from, data, channel),
});
await p2p.join();
p2p.broadcast(state); // unreliable "state" channel — game-rate, stale drops
p2p.send(event, to); // reliable channel — exactly-once events (to optional)
p2p.close();
```

## React room binding (optional — copy if it fits your app)

For the common "everyone on this app plays together" shape, copy this hook to
`src/lib/multiplayer/use-p2p-room.ts` and adapt it freely — it is yours, not
part of the kit:

```ts
/**
 * React binding for P2PRoom. Identity and room id are captured once on mount
 * (useState initializers) so re-renders never tear down the mesh: the P2PRoom
 * instance lives exactly as long as the component that mounted it, and
 * changing `room`/`name` requires a remount (key the component on them).
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { P2PRoom, type PeerInfo } from "./p2p";

export interface UseP2PRoomOptions {
  /** Defaults to a per-deployment room derived from the hostname. */
  room?: string;
  name?: string;
}

export interface P2PRoomHandle {
  selfId: string;
  room: string;
  /** Remote peers only (self excluded), with live connection diagnostics. */
  peers: PeerInfo[];
  joined: boolean;
  /** Unreliable game-state fanout to every connected peer. */
  broadcast: (data: unknown) => void;
  /** Reliable ordered send to one peer (or all when peerId is omitted). */
  send: (data: unknown, peerId?: string) => void;
  /** Subscribe to incoming messages; returns an unsubscribe function. */
  onMessage: (
    fn: (from: string, data: unknown, channel: "state" | "reliable") => void,
  ) => () => void;
}

function defaultRoom(): string {
  if (typeof window === "undefined") return "room-ssr";
  // DNS labels can be 63 chars; the signaling ID regex caps room ids at 64 —
  // truncate so `room-` + label always fits.
  return `room-${window.location.hostname.split(".")[0]}`.slice(0, 64);
}

export function useP2PRoom(options: UseP2PRoomOptions = {}): P2PRoomHandle {
  const [selfId] = useState(() => `p-${Math.random().toString(36).slice(2, 10)}`);
  const [room] = useState(() => options.room ?? defaultRoom());
  const [name] = useState(() => options.name ?? selfId);
  const [peers, setPeers] = useState<PeerInfo[]>([]);
  const [joined, setJoined] = useState(false);
  const roomRef = useRef<P2PRoom | null>(null);
  const listeners = useRef(
    new Set<(from: string, data: unknown, channel: "state" | "reliable") => void>(),
  );

  useEffect(() => {
    const p2p = new P2PRoom({
      room,
      selfId,
      name,
      onPeersChanged: setPeers,
      onMessage: (from, data, channel) => {
        for (const fn of listeners.current) fn(from, data, channel);
      },
      // `joined` flips on the FIRST successful poll — join() itself resolves
      // even when the first poll fails (the loop keeps retrying).
      onConnected: () => setJoined(true),
    });
    roomRef.current = p2p;
    void p2p.join();
    return () => {
      roomRef.current = null;
      p2p.close();
    };
  }, [room, selfId, name]);

  // Stable identities (both close over refs) so consumers can safely list
  // these in effect deps without re-subscribing every render.
  const broadcast = useCallback((data: unknown) => roomRef.current?.broadcast(data), []);
  const send = useCallback(
    (data: unknown, peerId?: string) => roomRef.current?.send(data, peerId),
    [],
  );
  const onMessage = useCallback(
    (fn: (from: string, data: unknown, channel: "state" | "reliable") => void) => {
      listeners.current.add(fn);
      return () => {
        listeners.current.delete(fn);
      };
    },
    [],
  );

  return { selfId, room, peers, joined, broadcast, send, onMessage };
}
```

Used in a component:

```tsx
import { useP2PRoom } from "@/lib/multiplayer";

function Game() {
  const p2p = useP2PRoom({ name: "ani" }); // room defaults per deployment
  const [positions, setPositions] = useState<Record<string, Pos>>({});

  useEffect(
    () =>
      p2p.onMessage((from, data, channel) => {
        if (channel === "state") {
          setPositions((p) => ({ ...p, [from]: data as Pos }));
        }
      }),
    [p2p.onMessage],
  );

  // Game-rate state: broadcast on the unreliable channel (stale packets drop).
  // 20-30 sends/s is plenty; interpolate between updates for smooth motion.
  useEffect(() => {
    let raf = 0;
    let lastSent = 0;
    const loop = (now: number) => {
      if (now - lastSent >= 50) {
        // ~20 sends/s
        p2p.broadcast(myPositionRef.current);
        lastSent = now;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [p2p.broadcast]);

  // One-shot actions (chat, "start game"): reliable + ordered.
  const sendChat = (text: string) => p2p.send({ chat: text });

  return <Board peers={p2p.peers} positions={positions} />;
}
```

Patterns:

1. `broadcast()` = unreliable/unordered, for continuously-refreshed state
   (positions, cursors). `send()` = reliable/ordered, for events that must
   arrive exactly once. Never stream game-rate state on `send()`.
2. Late joiners know nothing: on a new peer appearing in `p2p.peers`, an
   existing peer should `send()` it the current shared state. Exactly one
   peer must answer: compare ids among the peers that were ALREADY in the
   room (your `selfId` plus `p2p.peers` minus the newcomer) and answer only
   if your `selfId` is the smallest — so two simultaneous joiners neither
   double-answer nor go unanswered.
3. Room ids: omit for "everyone on this app plays together"; pass
   `room: code` for private lobbies (generate a short code, put it in the URL).
4. Peers disappear without goodbye (tab close, sleep): treat a peer missing
   from `p2p.peers` as gone and drop its entities.
5. The React binding above captures `room`/`name` on first render — changing
   them later requires remounting the component (key it on the room code).

## Diagnostics

Each entry in `p2p.peers` carries `connectionState`, `rttMs` (data-channel
ping), and `candidateType` (`host`/`srflx` = direct). Optional env (set in
`.env`): `VITE_STUN_URLS` (comma-separated) to override STUN.
