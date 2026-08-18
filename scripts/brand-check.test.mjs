import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import {
  MAX_CARD_BYTES,
  computeBrandWarnings,
  rootDeclaresGameImage,
  rootDeclaresOgTypeGame,
} from "./brand-check.mjs";

const PLACEHOLDER_ROOT = `
const ogImage = host
  ? \`https://og.grok.me/v1/card.png?host=\${encodeURIComponent(host)}\`
  : undefined;
`;

const CUSTOM_ROOT = "const ogImage = host ? `https://${host}/og.jpg` : undefined;";

const GAME_OG_TYPE = '{ property: "og:type", content: "x:game" }';
const GAME_IMAGE = '{ property: "x:game:image", content: xBanner }';
const CUSTOM_GAME_ROOT = `${CUSTOM_ROOT}\nmeta: [${GAME_OG_TYPE}, ${GAME_IMAGE}],`;

function makeWorkspace({
  rootTsx,
  cardFile,
  narrowFile,
  cardBytes = 200 * 1024,
  narrowBytes = 200 * 1024,
} = {}) {
  const root = mkdtempSync(join(tmpdir(), "brand-check-"));
  mkdirSync(join(root, "public"), { recursive: true });
  mkdirSync(join(root, "src/routes"), { recursive: true });
  if (rootTsx !== undefined) {
    writeFileSync(join(root, "src/routes/__root.tsx"), rootTsx);
  }
  if (cardFile !== undefined) {
    writeFileSync(join(root, "public", cardFile), Buffer.alloc(cardBytes, 7));
  }
  if (narrowFile !== undefined) {
    writeFileSync(join(root, "public", narrowFile), Buffer.alloc(narrowBytes, 7));
  }
  return root;
}

test("non-canvas app with placeholder gets a soft BRAND NOTE (utility exception)", () => {
  const root = makeWorkspace({ rootTsx: PLACEHOLDER_ROOT });
  const warnings = computeBrandWarnings({ hasCanvas: false, workspaceRoot: root });
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /^BRAND NOTE:/);
  assert.match(warnings[0], /plain utilit/);
  assert.doesNotMatch(warnings[0], /^BRAND WARNING:/);
});

test("non-canvas app with a compliant card is silent", () => {
  const root = makeWorkspace({ rootTsx: CUSTOM_ROOT, cardFile: "og.jpg" });
  assert.deepEqual(computeBrandWarnings({ hasCanvas: false, workspaceRoot: root }), []);
});

test("non-canvas app with no og:image at all is silent", () => {
  // No head og wiring (e.g. mid-scaffold): nothing to judge yet.
  const root = makeWorkspace({ rootTsx: "export const Route = createRootRoute({});" });
  assert.deepEqual(computeBrandWarnings({ hasCanvas: false, workspaceRoot: root }), []);
});

test("oversized card warns for non-canvas apps too", () => {
  const root = makeWorkspace({
    rootTsx: CUSTOM_ROOT,
    cardFile: "og.jpg",
    cardBytes: MAX_CARD_BYTES + 1,
  });
  const warnings = computeBrandWarnings({ hasCanvas: false, workspaceRoot: root });
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /over 600 KB/);
});

test("canvas app with no card warns 'missing' and missing og:type", () => {
  const root = makeWorkspace({ rootTsx: PLACEHOLDER_ROOT });
  const warnings = computeBrandWarnings({ hasCanvas: true, workspaceRoot: root });
  assert.equal(warnings.length, 2);
  assert.match(warnings[0], /og\.jpg.*is missing/s);
  assert.match(warnings[0], /not done/);
  assert.match(warnings[1], /og:type="x:game"/);
});

test("card present but placeholder still wired warns 'wire og:image' and missing og:type", () => {
  const root = makeWorkspace({ rootTsx: PLACEHOLDER_ROOT, cardFile: "og.jpg" });
  const warnings = computeBrandWarnings({ hasCanvas: true, workspaceRoot: root });
  assert.equal(warnings.length, 2);
  assert.match(warnings[0], /still points og:image/);
  assert.match(warnings[1], /og:type="x:game"/);
});

test("oversized card warns on the scraper budget (jpg and legacy png)", () => {
  for (const cardFile of ["og.jpg", "og.png"]) {
    const root = makeWorkspace({
      rootTsx: CUSTOM_ROOT,
      cardFile,
      cardBytes: MAX_CARD_BYTES + 1,
    });
    const warnings = computeBrandWarnings({ hasCanvas: true, workspaceRoot: root });
    assert.match(warnings[0], /over 600 KB/);
    assert.match(warnings.join("\n"), /og:type="x:game"/);
  }
});

test("compliant jpg card under budget still warns without og:type for canvas apps", () => {
  const root = makeWorkspace({ rootTsx: CUSTOM_ROOT, cardFile: "og.jpg" });
  const warnings = computeBrandWarnings({ hasCanvas: true, workspaceRoot: root });
  assert.match(warnings.join("\n"), /og:type="x:game"/);
  assert.match(warnings.join("\n"), /x:game:image/);
  assert.match(warnings.join("\n"), /x-banner\.jpg/);
});

test("compliant game (custom card + og:type + x:game:image + narrow card) is silent", () => {
  const root = makeWorkspace({
    rootTsx: CUSTOM_GAME_ROOT,
    cardFile: "og.jpg",
    narrowFile: "x-banner.jpg",
  });
  assert.deepEqual(computeBrandWarnings({ hasCanvas: true, workspaceRoot: root }), []);
});

test("oversized x-banner warns on the same scraper budget as og.jpg", () => {
  const root = makeWorkspace({
    rootTsx: CUSTOM_GAME_ROOT,
    cardFile: "og.jpg",
    narrowFile: "x-banner.jpg",
    narrowBytes: MAX_CARD_BYTES + 1,
  });
  const warnings = computeBrandWarnings({ hasCanvas: true, workspaceRoot: root });
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /x-banner\.jpg is over 600 KB/);
});

test("legacy png under budget with custom wiring still requires og:type for canvas", () => {
  const root = makeWorkspace({
    rootTsx: "const ogImage = host ? `https://${host}/og.png` : undefined;",
    cardFile: "og.png",
  });
  const warnings = computeBrandWarnings({ hasCanvas: true, workspaceRoot: root });
  assert.match(warnings.join("\n"), /og:type="x:game"/);
});

test("legacy png + og:type game still needs the X feed card", () => {
  const root = makeWorkspace({
    rootTsx:
      'const ogImage = host ? `https://${host}/og.png` : undefined;\n'
      + '{ property: "og:type", content: "x:game" }',
    cardFile: "og.png",
  });
  const warnings = computeBrandWarnings({ hasCanvas: true, workspaceRoot: root });
  assert.match(warnings.join("\n"), /x-banner\.jpg/);
  assert.match(warnings.join("\n"), /x:game:image/);
});

test("rootDeclaresOgTypeGame accepts property/content order variants", () => {
  assert.equal(
    rootDeclaresOgTypeGame('{ property: "og:type", content: "x:game" }'),
    true,
  );
  assert.equal(
    rootDeclaresOgTypeGame("{ property: 'og:type', content: 'x:game' }"),
    true,
  );
  assert.equal(
    rootDeclaresOgTypeGame('{ content: "x:game", property: "og:type" }'),
    true,
  );
  assert.equal(rootDeclaresOgTypeGame('{ property: "og:type", content: "website" }'), false);
  // Bare "game" is not accepted — product contract is the namespaced x:game value.
  assert.equal(rootDeclaresOgTypeGame('{ property: "og:type", content: "game" }'), false);
  assert.equal(rootDeclaresOgTypeGame('const title = "game"'), false);
  assert.equal(rootDeclaresOgTypeGame(""), false);
});

test("rootDeclaresOgTypeGame ignores comment-only scaffold examples", () => {
  // AGENTS.md first-scaffold style: pattern only in a line comment.
  assert.equal(
    rootDeclaresOgTypeGame(
      '      // Games only: { property: "og:type", content: "x:game" } — X uses this to\n'
        + "      // present the share card as a game.\n"
        + "      ...(ogImage ? [{ property: \"og:image\", content: ogImage }] : []),\n",
    ),
    false,
  );
  // Block comment only.
  assert.equal(
    rootDeclaresOgTypeGame(
      '/* { property: "og:type", content: "x:game" } */\n'
        + "export const Route = createRootRoute({});\n",
    ),
    false,
  );
  // Live meta still counts when a comment also mentions the pattern.
  assert.equal(
    rootDeclaresOgTypeGame(
      '      // Games only: { property: "og:type", content: "x:game" }\n'
        + '      { property: "og:type", content: "x:game" },\n',
    ),
    true,
  );
});

test("canvas app with comment-only og:type still warns", () => {
  const root = makeWorkspace({
    rootTsx:
      `${CUSTOM_ROOT}\n`
      + '// Games only: { property: "og:type", content: "x:game" }\n'
      + "meta: [],\n",
    cardFile: "og.jpg",
  });
  const warnings = computeBrandWarnings({ hasCanvas: true, workspaceRoot: root });
  assert.match(warnings.join("\n"), /og:type="x:game"/);
});

test("rootDeclaresGameImage requires a live x:game:image property", () => {
  assert.equal(
    rootDeclaresGameImage('{ property: "x:game:image", content: xBanner }'),
    true,
  );
  assert.equal(
    rootDeclaresGameImage('{ property: "og:image", content: ogImage }'),
    false,
  );
  assert.equal(
    rootDeclaresGameImage('// { property: "x:game:image", content: xBanner }'),
    false,
  );
});
