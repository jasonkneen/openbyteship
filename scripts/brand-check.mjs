/**
 * Brand-asset gate shared by browser-smoke.mjs (and unit-testable without a
 * browser): a canvas app is almost always a game / visually rich app, and
 * those must ship a custom share card — the default og.grok.me placeholder is
 * not acceptable for them (see .grok/skills/og/SKILL.md).
 *
 * Games must also emit og:type="x:game" in the root head so X can present the
 * unfurl as a game card (see og skill § "og:type for games"), and
 * x:game:image pointing at public/x-banner.jpg for the 50:11 X feed card.
 *
 * Checked on the filesystem (not the served head) because live preview has no
 * VITE_PUBLIC_HOSTNAME and renders no og:image tag at all, so the page alone
 * can't reveal the placeholder. og:type does not need a host and is checked
 * on the __root.tsx source.
 */
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

// Over this, link scrapers (X card previews included) time out or skip the
// image, so the card silently fails to unfurl. The og skill's JPEG contract
// (ffmpeg -q:v 4, ~150-300 KB) exists precisely to stay under it.
export const MAX_CARD_BYTES = 600 * 1024;

/**
 * Drop line (//) and block comments so detectors cannot match scaffold examples
 * that only exist inside comments (e.g. AGENTS.md first-scaffold notes copied
 * into __root.tsx). Heuristic only — does not parse string literals.
 */
export function stripJsComments(src) {
  if (!src) return "";
  return src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/[^\n\r]*/g, "");
}

/**
 * True when root head meta declares og:type x:game (TanStack head API form).
 * Property/content order may vary; tolerate either ordering within a short
 * window. Requires the exact value `x:game` — not bare `game`, and not a
 * loose "game" string elsewhere in app code. Comment-only occurrences do not
 * count (live meta required for X game-card unfurls).
 */
export function rootDeclaresOgTypeGame(rootTsx) {
  if (!rootTsx) return false;
  const code = stripJsComments(rootTsx);
  const propertyThenContent =
    /property\s*:\s*["']og:type["'][\s\S]{0,120}?content\s*:\s*["']x:game["']/i;
  const contentThenProperty =
    /content\s*:\s*["']x:game["'][\s\S]{0,120}?property\s*:\s*["']og:type["']/i;
  return propertyThenContent.test(code) || contentThenProperty.test(code);
}

/**
 * True when root head meta declares x:game:image (TanStack head API form).
 * Comment-only scaffold notes do not count.
 */
export function rootDeclaresGameImage(rootTsx) {
  if (!rootTsx) return false;
  const code = stripJsComments(rootTsx);
  return /property\s*:\s*["']x:game:image["']/i.test(code);
}

export function computeBrandWarnings({ hasCanvas, workspaceRoot = "/workspace" }) {
  const skillPath = join(workspaceRoot, ".grok/skills/og/SKILL.md");
  const rootTsxPath = join(workspaceRoot, "src/routes/__root.tsx");
  const rootTsx = existsSync(rootTsxPath) ? readFileSync(rootTsxPath, "utf8") : "";
  const cardPath = [
    join(workspaceRoot, "public/og.jpg"),
    join(workspaceRoot, "public/og.png"),
  ].find(existsSync);
  const warnings = [];

  // A shipped card is validated the same way for every app type.
  if (cardPath !== undefined) {
    if (rootTsx.includes("og.grok.me")) {
      warnings.push(
        `BRAND WARNING: ${cardPath} exists but src/routes/__root.tsx still points og:image `
          + 'at the og.grok.me placeholder. Wire og:image to "https://${host}/og.jpg" per '
          + `${skillPath}.`,
      );
    } else if (statSync(cardPath).size > MAX_CARD_BYTES) {
      warnings.push(
        `BRAND WARNING: ${cardPath} is over 600 KB — link scrapers (X card previews included) `
          + "time out or skip images this heavy, so the card silently fails to unfurl. "
          + `Re-encode as JPEG (public/og.jpg, ffmpeg -q:v 4) per ${skillPath}.`,
      );
    }
  } else if (hasCanvas) {
    // No card. Canvas is a high-confidence game signal — hard warning.
    warnings.push(
      `BRAND WARNING: this looks like a game/canvas app but ${workspaceRoot}/public/og.jpg `
        + "is missing. Games and visually rich apps must ship a custom 1200x630 share card "
        + "built from the app's own art — the default og.grok.me placeholder card is not "
        + `acceptable for them. You are not done: open ${skillPath} and finish the `
        + "brand-asset pass.",
    );
  } else if (rootTsx.includes("og.grok.me")) {
    // No canvas but the placeholder is wired: custom cards are the DEFAULT
    // (DOM games, whimsical apps, creative tools, brand-forward pages) — only
    // plain utilities keep the placeholder. Softer prefix: for a genuine
    // utility this note is correctly dismissed, not acted on.
    warnings.push(
      "BRAND NOTE: og:image is still the og.grok.me placeholder. Custom public/og.jpg "
        + "cards are the default for games of every kind (DOM board/word games included), "
        + "whimsical apps, creative tools, and brand-forward pages — only plain utilities "
        + "(converters, CRUD trackers, admin dashboards) keep the placeholder. If this app "
        + `is not a plain utility, finish the brand-asset pass per ${skillPath}.`,
    );
  }

  // Games (canvas heuristic) must declare og:type="x:game" so X can present the
  // share card as a game. DOM/board games without canvas are covered by agent
  // docs; this gate only fires on the high-confidence canvas signal.
  if (hasCanvas && !rootDeclaresOgTypeGame(rootTsx)) {
    warnings.push(
      'BRAND WARNING: this looks like a game/canvas app but src/routes/__root.tsx is missing '
        + 'og:type="x:game". X uses this meta tag to present the unfurl as a game card — set '
        + `{ property: "og:type", content: "x:game" } in the root head meta (always, not only `
        + `when a host exists) per ${skillPath}. Do not invent x:type or overload twitter:card `
        + "as the game signal.",
    );
  }

  // Games with a custom link card must also ship the 50:11 X feed card and
  // declare it as x:game:image. Skip while still on the og.grok.me placeholder
  // — that pass has not started yet.
  const customCardWired = cardPath !== undefined && !rootTsx.includes("og.grok.me");
  if (hasCanvas && customCardWired) {
    const bannerPath = join(workspaceRoot, "public/x-banner.jpg");
    if (!existsSync(bannerPath)) {
      warnings.push(
        `BRAND WARNING: this looks like a game/canvas app but ${bannerPath} is missing. `
          + "Games need a 50:11 X feed card (1200×264 JPEG) declared as x:game:image — "
          + `open ${skillPath} and finish the brand-asset pass.`,
      );
    } else if (statSync(bannerPath).size > MAX_CARD_BYTES) {
      // Same scraper budget as og.jpg: an oversized banner validates locally
      // but silently fails to unfurl on X.
      warnings.push(
        `BRAND WARNING: ${bannerPath} is over 600 KB — link scrapers (X card previews `
          + "included) time out or skip images this heavy, so the feed card silently fails "
          + `to unfurl. Re-encode as JPEG (ffmpeg -q:v 4) per ${skillPath}.`,
      );
    }
    if (!rootDeclaresGameImage(rootTsx)) {
      warnings.push(
        'BRAND WARNING: this looks like a game/canvas app but src/routes/__root.tsx is missing '
          + 'x:game:image. Set { property: "x:game:image", content: xBanner } pointing at '
          + `"https://\${host}/x-banner.jpg" with x:game:image:width/height 1200/264 `
          + `(same host guard as og:image) per ${skillPath}.`,
      );
    }
  }

  return warnings;
}
