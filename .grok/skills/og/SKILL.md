---
name: og
description: >
  Share-link previews and app identity for apps on *.grok.me: the og:image
  card in the root head, the SVG favicon, and PWA icons for installable apps.
  Use when scaffolding, renaming, or restyling the app — and for share /
  unfurl / OG / Twitter card questions. A custom 1200×630 card from the app's
  own art is the default — games of every kind (DOM board/word games
  included), whimsical apps, creative tools, and brand-forward pages; only
  plain utilities keep the placeholder. By default run the whole brand-asset
  pass in a parallel background task (the `task` tool) while the app builds.
  Triggers on "share", "rename", "app name", "OG", "Open Graph",
  "twitter card", "unfurl", "og:image", "og:type", "x:game:image",
  "x-banner", "link preview", "social card", "thumbnail", "preview image",
  "favicon", "app icon", "PWA", "manifest", "installable", "home screen",
  "SEO", "meta description".
metadata:
  short-description: "Brand assets: og.jpg card, X feed banner, SVG favicon, PWA icons — parallel task by default"
user-invocable: false
---

# Share cards, favicon, and app icons

A deployed app (`https://{name}.grok.me`) unfurls with a 1200×630 card, and
every app (preview included) shows a favicon in the browser tab. Both are
wired in the root `head()` — AGENTS.md § "First scaffold" is the source of
truth for `src/routes/__root.tsx`. **Extend `__root.tsx`; never replace it
wholesale** (auth SSR, redesign, another skill's excerpt). Dropping `og:image`
or the favicon link ships a broken card / blank tab icon, and `npm run dev` /
`build` will not catch it.

## `og:type` for games (X game-card presentation)

**When the app is a game of any kind** (Canvas/WebGL *and* DOM board/word/
puzzle/quiz games), set this meta tag in the root `head()` **always** — it
does not need `VITE_PUBLIC_HOSTNAME` and must not be gated on `ogImage`:

```tsx
{ property: "og:type", content: "x:game" },
```

**Why this exists:** X (Twitter) uses `og:type="x:game"` when unfurling
`*.grok.me` links to present the card as a **game** rather than a generic
website. This is a product contract with X's card pipeline — keep the tag,
and do not "correct" it to `website` during refactors. Non-games should omit
`og:type` or use `website` (scraper default).

### Why `og:type` content `x:game` (and not the alternatives)

This will live forever in every shipped game; pick the stable channel:

| Option | Verdict |
| --- | --- |
| **`<meta property="og:type" content="x:game">`** | **Chosen.** Stays on the standard OG content-type property; value is a **namespaced type** (`x:game`) so it cannot be confused with a future global OGP `game` type or bare `website`. X's card pipeline keys off this exact value to present the unfurl as a game. Do not shorten to bare `game`. |
| **`og:type="game"` (no `x:`)** | **Rejected.** Looks like a global OGP type that does not exist on [ogp.me](https://ogp.me/#types); the product contract is the namespaced `x:game` string. |
| **`twitter:card`** | **Wrong layer for the game signal.** Layout only (`summary_large_image`). It lives in the first-scaffold `__root.tsx` and PWA chrome (AGENTS.md) so every app gets it — do not treat this skill as the place that adds it. Never use it as the game type. |
| **Separate `x:type` / `x:card` meta properties** | **Do not invent.** Extra properties double surface area (agents forget one of two tags). Namespacing inside `og:type`'s content (`x:game`) is enough. |

Example root `meta` slice for a game (with a custom card once published):

```tsx
meta: [
  { charSet: "utf-8" },
  { name: "viewport", content: "width=device-width, initial-scale=1" },
  { title: APP_NAME },
  // twitter:card=summary_large_image is first-scaffold / PWA chrome (every app).
  // X uses og:type=x:game to present the unfurl as a game card (not a website).
  { property: "og:type", content: "x:game" },
  ...(ogImage
    ? [
        { property: "og:image", content: ogImage },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
      ]
    : []),
  // Games: 50:11 X feed card. Same host guard as og:image. Add only during
  // the brand pass, once public/x-banner.jpg exists — never in the first
  // scaffold, where the URL would 404.
  ...(xBanner
    ? [
        { property: "x:game:image", content: xBanner },
        { property: "x:game:image:width", content: "1200" },
        { property: "x:game:image:height", content: "264" },
      ]
    : []),
],
```

`browser-smoke.mjs` / `brand-check.mjs` emit a **BRAND WARNING** when a
canvas app is missing `og:type="x:game"` or (once the custom link card is
wired) missing `x:game:image` / `public/x-banner.jpg` — treat that as not
done, same as a missing custom card.

## Parallelize the brand-asset pass (default)

The identity bundle — `public/og.jpg`, `public/favicon.svg`, PWA icons when
installable — needs only the app's name, theme, and palette, and writes only
`public/` plus a few `head()` / manifest lines. **Start it as a background
task with the `task` tool early in the build** (AGENTS.md § "Parallel work"),
right after the name and palette are settled: give the task this skill and
sole ownership of `public/` brand assets, keep building the app, and
integrate its `head()` edits at the end (`wait_tasks` before the final
verify). Image generation is pure waiting — a build that runs the card pass
inline at the end serializes minutes of model latency behind an already
finished app.

Pass the task this skill plus the 16:9 canvas contract below, so the card it
generates crops to 1200×630 without clipping the title.

A default, not a hard rule: stay sequential when the user is art-directing
the card, when the app art the card should reuse doesn't exist yet, or when
the `task` tool isn't available.

## Which card an app gets

**Default: generate a custom card.** Any app with a face of its own gets one
built from its own art (below):

- **Games — every kind and rendering tech.** Canvas and WebGL, but equally
  DOM-rendered board, card, word, puzzle, and quiz games. A tic-tac-toe grid
  made of divs is still a game and still ships a custom card.
- **Whimsical, playful, and toy apps** — generators, virtual pets, screensavers.
- **Creative tools** — drawing, music, photo, design, anything whose output is
  visual or expressive.
- **Content- and brand-forward apps** — landing pages, portfolios,
  storefronts, anything presenting an identity to visitors.

**When in doubt, make the custom card** — a themed card is the better unfurl
for anything a user would *show someone*.

- **Plain utility apps only** (converters, invoice/CRUD trackers, internal
  dashboards, minimal notes/admin tools — apps whose face is the data, not a
  theme) → keep the default `og.grok.me` card:

  ```
  https://og.grok.me/v1/card.png?host={VITE_PUBLIC_HOSTNAME}&title={APP_NAME}
  ```

  Optional theme colour: append `&color={RRGGBB}` (6-digit hex, no `#` — e.g.
  `FF4D2E`). The service paints it as the card background under the platform
  art, and flips the title and the "Built with Grok" subtitle dark when the
  colour is light. Pick the app's primary/brand colour; omit it to keep the
  default charcoal card.

  plus `og:image:width` / `og:image:height` of `1200` / `630`. When the user
  renames the app, update `APP_NAME` — it is both the document title and the
  painted card title.

Either way: **live preview has no `VITE_PUBLIC_HOSTNAME`, so emit no
`og:image` at all** (text-only unfurl is expected). On publish the platform
injects the hostname — do **not** write a `.env` for it. Card pixels update on
the **next deploy** (the URL is baked into HTML at build time).

## Custom card: generate `public/og.jpg`

For prompt-craft, composition, and blind read-back verification, follow the
`imagine` and `game-asset-core` skills — this skill owns the **card-specific**
contract only (size, lockup, wiring).

1. **Set the canvas with `aspect_ratio: "16:9"`.** The call looks like
   `{ "prompt": "…", "aspect_ratio": "16:9" }` — ratio words in the prompt do
   **not** set the canvas. At 2mp, 16:9 renders 1792×1008, so the normalize
   below cover-crops to 1200×630 trimming only ~3% vertically, which a
   centered title survives. A narrower canvas is what kills titles: from 3:2
   the same crop takes **~21% vertically**, straight through the lockup.
   Paths:

   - **Default — one call with `aspect_ratio: "16:9"`:** `imagine_text_to_image`
     with the art + baked title. **Check the output dimensions** via
     `read_file` / Pillow on the returned `file_path`; if the ratio missed, reframe or use
     the API path.
   - **Reframe if needed:** pass the prior `file_path` into `imagine_image_to_image`
     with **`aspect_ratio: "16:9"`** and a prompt like "extend the scenery
     left and right into a wider frame; keep the title lettering and
     central subject exactly as they are".
   - **Optional — true 2:1 via the xAI Images API:** `POST
     https://api.x.ai/v1/images/generations` with `"aspect_ratio": "2:1"`
     and `response_format: "b64_json"` using the injected `XAI_API_KEY`
     (see the `xai-api` skill). 2mp 2:1 is 1984×992; normalize then trims
     only ~2.4% per side and nothing vertical.

   Build the prompt from the app's theme, palette, and characters. If the
   app already has a key generated asset (hero sprite, title scene), pass
   its `file_path` into `imagine_image_to_image` so the card matches in-game art —
   same 16:9 + check-the-output rule applies.
   **Last resort only** (no `imagine_text_to_image` and no xAI Images API): stay
   on whatever canvas you have and keep the entire title block inside the
   **middle half** of the frame height, with the crop-clipping check in
   step 6 as the gate.
2. **Bake the title in like a game cover.** Store-page covers (Stardew Valley,
   Cuphead) lead with a short stylized logo-type title. Put the exact app name
   in quotes in the prompt; 1–3 strong words; optional short tagline under the
   title in smaller lettering (exact words in quotes).
   - **Stack multi-word titles** into a two-line lockup ("SKY" over "STRIKE").
   - **Center the block both ways** with generous margins — avoid "upper third"
     / percentage placement (models hug the edge).
   - **Bound the width**: lettering spans roughly half to two-thirds of the
     frame, never border to border.
   - **Keep comfortable margins anyway.** From a 16:9 canvas the normalize
     below trims only ~3% vertically; from a 2:1 API canvas it trims
     nothing vertical and ~2.4% per side. The crop turns destructive when
     the canvas comes back off-ratio — an edit that pinned to its input's
     ratio, or a model miss — so **check the raw canvas dimensions before
     cropping**, and re-ratio first if it isn't ~16:9 or 2:1.
3. **Verify glyphs *and* layout on read-back** (see `imagine` / `game-asset-core`
   for the blind-describe loop). On a garble or layout miss, **regenerate with a
   corrected prompt** — never try to move a logo with `imagine_image_to_image` (frame
   translation / seams). After two failed attempts, ship the card **artwork-only**
   (titleless).

   **Intentional exception vs `imagine`'s "rebuild text with code" rule:** the
   share card is a single static PNG; there is no reliable in-sandbox path to
   composite crisp code-drawn lettering onto generative art for this asset, so
   a clean titleless card is the correct fallback after two glyph failures.
4. **Normalize to exactly 1200×630 JPEG** with the baked-in ffmpeg (cover-crop —
   from 16:9 this shaves ~3% top/bottom; from 2:1 ~2.4% per side and
   nothing vertical). **JPEG, not PNG**: the card is
   photographic generative art, and a PNG of it lands at 1–2 MB — heavy
   enough that link scrapers (X card previews included) time out or skip the
   image, so the card silently fails to unfurl. JPEG at this quality is
   ~150–300 KB with no visible loss at unfurl size:

   ```sh
   ffmpeg -y -i card-raw.jpg \
     -vf "scale=1200:630:force_original_aspect_ratio=increase,crop=1200:630" \
     -q:v 4 public/og.jpg
   ```

5. **Point `og:image` at the app's own asset** — absolute URL, scrapers do not
   resolve relative paths — keeping the no-host guard:

   ```tsx
   const ogImage = host ? `https://${host}/og.jpg` : undefined;
   ```

   Keep `og:image:width` / `og:image:height` at `1200` / `630`.
6. **Verify before finishing** (Pillow is installed; `ffprobe` is **not**):

   ```sh
   python3 -c "
   from PIL import Image; import os
   im = Image.open('public/og.jpg')
   kb = os.path.getsize('public/og.jpg') // 1024
   print(im.size, f'{kb} KB')"
   # expect: (1200, 630) and under 600 KB (keeps X and other scrapers
   # reliable; target <= 300 KB — if over, bump -q:v up a step and re-encode)
   ```

   **Read back the final `public/og.jpg`, not the pre-crop raw** — the crop
   is where clipping happens. This is a **hard gate, not an impression**:
   if any title glyph touches a frame edge or is visibly cut, the card is
   **rejected** — do not ship it, whatever else is right about it. Fix the
   ratio (step 1) or regenerate with the width bound restated; a shipped
   decapitated title is worse than the placeholder. Then confirm the card
   reads like *this* app at thumbnail size — clear subject, correctly
   spelled title (if any), comfortable margins.

If neither `imagine_text_to_image` nor the xAI Images API is available,
fall back to the `og.grok.me` card — never ship a missing or broken
`og:image` URL.

Regenerate the card when the app's visual identity materially changes (theme
overhaul, new hero art) — and on rename: the title is baked into the pixels,
so update `APP_NAME` *and* regenerate the card with the new name. (A titleless
fallback card survives a rename without regeneration.)

## X feed card: `public/x-banner.jpg` (`x:game:image`, 50:11)

**Games also ship a second, much wider card** that X uses in the feed (the
link-preview `og.jpg` is still required — this does not replace it). Write
`public/x-banner.jpg` at **exactly 50:11** (1200×264 — 1200 is the standard
max card width on the web, same as `og.jpg`) and declare it with the
namespaced property — do **not** invent `x:game:og` or overload `og:image`:

```tsx
const xBanner = host ? `https://${host}/x-banner.jpg` : undefined;
// …
...(xBanner
  ? [
      { property: "x:game:image", content: xBanner },
      { property: "x:game:image:width", content: "1200" },
      { property: "x:game:image:height", content: "264" },
    ]
  : []),
```

Same no-host guard as `og:image`: live preview has no hostname, so emit no
`x:game:image` at all. Same JPEG / size discipline (keep it well under
600 KB). Keep `x:game:image:width` / `x:game:image:height` at `1200` / `264`
the same way `og:image` keeps `1200` / `630`. Generate the art at 50:11
(`aspect_ratio: "50:11"` on `imagine_text_to_image`). If the tool schema
does not offer `50:11`, generate at the widest offered ratio and cover-crop
— then the vertical crop is severe (16:9 → 50:11 keeps only the middle ~39%
of the height), so the lockup must sit inside that middle band. Either way,
normalize:

```sh
ffmpeg -y -i banner-raw.jpg \
  -vf "scale=1200:264:force_original_aspect_ratio=increase,crop=1200:264" \
  -q:v 4 public/x-banner.jpg
```

**Left-align the content.** Unlike the centered `og.jpg` lockup, compose the
banner with the title lockup in the **left half** — vertically centered, with
a comfortable left margin — and let the scenery/characters extend to the
right, so the card still reads when feed layouts crop or overlay its right
side. Never edge-hug: a 50:11 frame decapitates edge-hugging lettering even
faster than the 1200×630 card. Reuse the link-cover art when you can
(reframe the same scene wider rather than inventing a second identity).
Verify the 1200×264 JPEG the same way as `og.jpg` (dimensions + under
600 KB + no clipped title, lockup left of center).

Add the tags to the game `meta` slice next to `og:image` — gated on the same
hostname check — **only at this point**, once `public/x-banner.jpg` exists.
The first scaffold ships without them; declaring the tag before the file
exists publishes a 404ing image URL.

## Favicon: hand-author `public/favicon.svg`

Every app gets one, and it works in live preview immediately (no host needed).

- **Write the SVG by hand — never `imagine_text_to_image`.** It must stay crisp at 16px:
  one bold glyph or shape, flat fills from the app's design tokens, a square
  `viewBox`, a handful of elements at most. For whimsical apps an emoji-text
  SVG is a fine quick win:

  ```svg
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect width="100" height="100" rx="20" fill="#1a1b26"/>
    <text x="50" y="50" font-size="62" text-anchor="middle"
      dominant-baseline="central">🥕</text>
  </svg>
  ```

- Wire it in the root `head()`:

  ```tsx
  links: [
    { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
    { rel: "stylesheet", href: appCss },
  ],
  ```

- Verify it renders non-blank and legible small (browser tab in a preview
  screenshot, or read back a rasterized copy). Update it when the app's theme
  or name changes meaning — it is part of the app's identity, not a set-and-forget.

## PWA icons: only for installable apps

When the app ships a web manifest (the user asked for installable / PWA /
home-screen behavior — do **not** invent a manifest just to have icons), add
raster icons derived from the favicon artwork so the identity stays
consistent:

- `public/icon-192.png` and `public/icon-512.png` — the favicon's glyph on
  its tile, rasterized at size. Playwright (baked into the sandbox) can
  screenshot the served `/favicon.svg` at a 192/512 viewport; or redraw the
  same mark as a flat PNG. Keep it bold and flat — no photographic detail.
- A maskable variant (`"purpose": "maskable"`) needs the glyph inside the
  center ~80% safe zone so launcher shapes don't clip it.
- Wire the manifest `icons` array plus `theme_color` / `background_color`
  from the app's design tokens, and read the 192 back to confirm it stays
  legible.

## Not supported

No `/api/og` route, no runtime image renderer, no per-route cards, no runtime
`og:*` mutation. The card is one static site-wide image chosen at build time.

If you add `robots.txt`, never blanket `Disallow: /` — crawlers must fetch `/`
to read the meta tags.
