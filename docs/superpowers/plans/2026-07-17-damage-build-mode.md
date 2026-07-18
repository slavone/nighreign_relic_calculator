# Damage Build Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a third calculator mode, "Damage Build", where the user enters the actual effects on up to 6 equipped relics (3 Regular + 3 Deep of Night) and gets back combined Damage / Damage Negation / Resource multipliers — no probability involved.

**Architecture:** A new effect-metadata file (`effect_multipliers.mjs`) classifies each relic effect as `baseline`, `conditional`, or unmapped (flat/other). The existing `prepare_data.mjs` / `prepare_don_data.mjs` pipeline embeds this metadata into `data/relic_data.json` / `data/don_relic_data.json` as a `mul` field per effect, exactly like `desc` is embedded today. A new pure function `computeBuildTotals()` (duplicated between `index.html` and a test file, matching this project's existing convention for `tests/calc.test.mjs`) turns a list of selected effects into baseline totals per damage-type axis, a conditional-effects list with combined figures, and a leftover list. A new UI section (`#v3-section`) renders 6 relic panels reusing the existing group/effect/curse `<select>` pattern from `index.html`, parametrized to a fixed data source per panel instead of the global `mode` toggle.

**Tech Stack:** Vanilla JS, single-file `index.html`, Node.js data-prep scripts (no bundler, no framework, no test runner beyond hand-rolled `tests/*.test.mjs` scripts run via `node`).

## Global Constraints

- Never edit `data/relic_data.json` or `data/don_relic_data.json` by hand — always edit the prepare scripts (`prepare_data.mjs` / `prepare_don_data.mjs`) or `effect_multipliers.mjs`, then regenerate, then re-embed into `index.html` via the embed script in `README.md`.
- Any new UI-visible text (labels, buttons, tooltips) needs entries added to `locales/jp.js` AND `locales/kr.js` in the same task that introduces it — never ship English-only text.
- Follow existing code conventions: vanilla JS, no new dependencies, no build step.
- Match the spec's tier/axis rules exactly (see `docs/superpowers/specs/2026-07-17-damage-build-mode-design.md`) — baseline vs conditional classification, and the negation formula `∏(1 − v)`.

---

## File Structure

| File | Responsibility |
|---|---|
| `effect_multipliers.mjs` (new) | Per-effect-name metadata: `{ tier, bucket, axes?, category?, value, condition? }`. Single source of truth for the build-mode classification. |
| `prepare_data.mjs` (modify) | Embed `mul` field (regular pool) alongside existing `desc` field. |
| `prepare_don_data.mjs` (modify) | Embed `mul` field (DON pool) alongside existing `desc` field. |
| `data/relic_data.json`, `data/don_relic_data.json` (regenerated, not hand-edited) | Now carry `mul` per effect where classified. |
| `index.html` (modify) | New `computeBuildTotals()` function; new `#v3-section` HTML + relic-panel builder JS; new mode-toggle button; calcMode wiring; i18n keys. |
| `tests/effect_multipliers.test.mjs` (new) | Schema validation over `effect_multipliers.mjs`. |
| `tests/build.test.mjs` (new) | Behavioral tests for `computeBuildTotals()`, duplicated from the `index.html` implementation per the project's existing test convention. |
| `locales/jp.js`, `locales/kr.js` (modify) | Translations for new UI strings. |
| `README.md` (modify) | Document the new mode and its assumptions. |

---

### Task 1: `effect_multipliers.mjs` — effect classification data

**Files:**
- Create: `effect_multipliers.mjs`
- Test: `tests/effect_multipliers.test.mjs`

**Interfaces:**
- Produces: `EFFECT_MULTIPLIERS` — a plain object keyed by exact effect name (after `\n` → space normalization, same convention as `EFFECT_DESCRIPTIONS` in `descriptions.mjs`). Each value is `{ tier: 'baseline'|'conditional', bucket: 'damage'|'negation'|'resource', axes？: string[], category?: 'sorcery'|'incantation', value: number, condition?: string }`. `axes` is only present for `damage`/`negation` buckets. `condition` is required when `tier === 'conditional'`, absent otherwise. Consumed by Task 2 (prepare scripts) and Task 3 (calc engine).

- [ ] **Step 1: Write the schema-validation test**

Create `tests/effect_multipliers.test.mjs`:

```javascript
// Schema validation for effect_multipliers.mjs — every entry must have a
// self-consistent shape so the calc engine (computeBuildTotals) never has
// to guess or crash on malformed data.
import { EFFECT_MULTIPLIERS } from '../effect_multipliers.mjs';

let passed = 0, failed = 0;
function check(label, ok) {
  if (ok) { passed++; }
  else { failed++; console.error('  FAIL ' + label); }
}

const VALID_TIERS = new Set(['baseline', 'conditional']);
const VALID_BUCKETS = new Set(['damage', 'negation', 'resource']);
const VALID_AXES = new Set(['physical', 'magic', 'fire', 'lightning', 'holy', 'universal']);
const VALID_CATEGORIES = new Set(['sorcery', 'incantation']);

const entries = Object.entries(EFFECT_MULTIPLIERS);
check('at least 80 entries present', entries.length >= 80);

for (const [name, m] of entries) {
  check(`${name}: tier is valid`, VALID_TIERS.has(m.tier));
  check(`${name}: bucket is valid`, VALID_BUCKETS.has(m.bucket));
  check(`${name}: value is a finite number`, typeof m.value === 'number' && Number.isFinite(m.value));
  if (m.bucket === 'negation') {
    // Negation has no category concept — always axis-based.
    check(`${name}: axes is a non-empty array`, Array.isArray(m.axes) && m.axes.length > 0);
    (m.axes || []).forEach(a => check(`${name}: axis "${a}" is valid`, VALID_AXES.has(a)));
  } else if (m.bucket === 'damage') {
    // General "Improved Sorceries/Incantations" entries are category-only (no
    // fixed element of their own) — a damage entry needs axes OR a category.
    const hasAxes = Array.isArray(m.axes) && m.axes.length > 0;
    check(`${name}: has axes or a category`, hasAxes || m.category !== undefined);
    (m.axes || []).forEach(a => check(`${name}: axis "${a}" is valid`, VALID_AXES.has(a)));
  } else {
    check(`${name}: resource bucket has no axes`, m.axes === undefined);
  }
  if (m.category !== undefined) {
    check(`${name}: category is valid`, VALID_CATEGORIES.has(m.category));
  }
  if (m.tier === 'conditional') {
    check(`${name}: conditional has a condition string`, typeof m.condition === 'string' && m.condition.length > 0);
  } else {
    check(`${name}: baseline has no condition string`, m.condition === undefined);
  }
  // Negation values are fractional (can be negative for a curse that *removes*
  // negation); damage/resource values are multipliers, always positive.
  if (m.bucket === 'negation') {
    check(`${name}: negation value is in a sane fractional range`, m.value > -1 && m.value < 1);
  } else {
    check(`${name}: multiplier value is positive`, m.value > 0);
  }
}

// Spot-check a handful of specific entries the design spec calls out by name.
const bestial = EFFECT_MULTIPLIERS['Improved Bestial Incantations'];
check('Bestial Incantations is physical + incantation, conditional', bestial &&
  bestial.tier === 'conditional' && bestial.bucket === 'damage' &&
  bestial.axes.includes('physical') && bestial.category === 'incantation' && bestial.value === 1.12);

const godslayer = EFFECT_MULTIPLIERS['Improved Godslayer Incantations'];
check('Godslayer Incantations is fire', godslayer && godslayer.axes.includes('fire'));

const fundamentalist = EFFECT_MULTIPLIERS['Improved Fundamentalist Incantations'];
check('Fundamentalist Incantations is holy', fundamentalist && fundamentalist.axes.includes('holy'));

const dragonCult = EFFECT_MULTIPLIERS['Improved Dragon Cult Incantations'];
check('Dragon Cult Incantations is lightning', dragonCult && dragonCult.axes.includes('lightning'));

const stonedigger = EFFECT_MULTIPLIERS['Improved Stonedigger Sorcery'];
check('Stonedigger Sorcery is magic', stonedigger && stonedigger.axes.includes('magic'));

check('Dragon Communion Incantations is intentionally unmapped',
  EFFECT_MULTIPLIERS['Improved Dragon Communion Incantations'] === undefined);

const katanaSingle = EFFECT_MULTIPLIERS['Improved Katana Attack Power'];
check('single-weapon Katana bonus is conditional', katanaSingle && katanaSingle.tier === 'conditional' && katanaSingle.value === 1.09);

const katana3plus = EFFECT_MULTIPLIERS['Improved Attack Power with 3+ Katana Equipped'];
check('3+ Katana bonus is baseline universal', katana3plus &&
  katana3plus.tier === 'baseline' && katana3plus.axes.includes('universal') && katana3plus.value === 1.2);

const evasionCurse = EFFECT_MULTIPLIERS['Reduced Damage Negation After Evading'];
check('evasion curse is negative negation, conditional', evasionCurse &&
  evasionCurse.tier === 'conditional' && evasionCurse.bucket === 'negation' && evasionCurse.value === -0.45);

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/effect_multipliers.test.mjs`
Expected: FAIL — `Cannot find module '../effect_multipliers.mjs'` (file doesn't exist yet).

- [ ] **Step 3: Create `effect_multipliers.mjs`**

Create `effect_multipliers.mjs`:

```javascript
// Per-effect classification for Damage Build mode.
//
// tier:      'baseline'   — always-on, folds into a running total for its bucket/axis.
//            'conditional'— real value, but requires a specific weapon/school/hit-type
//                           or a transient trigger/state. Shown as its own line with a
//                           "combined with baseline" figure, never silently summed.
// bucket:    'damage' | 'negation' | 'resource'
// axes:      damage/negation only — one or more of physical/magic/fire/lightning/holy/universal.
// category:  optional — 'sorcery' | 'incantation'. Layers on top of whichever axis the
//            spell actually deals; general "Improved Sorceries/Incantations" entries have
//            a category but no axes (they don't have a fixed element themselves).
// value:     multiplier (e.g. 1.09) for damage/resource. Fractional negation amount
//            (e.g. 0.10, or negative for a curse that *removes* negation) for negation —
//            combined via ∏(1 − v), never a straight product.
// condition: required when tier is 'conditional'; human-readable trigger description.
//
// Effect names not present here are treated as Flat/Other by the build-mode UI — that's
// the safe default for anything not classified (flat stat bonuses, resistances, flavor
// text, variable/unbounded-scaling effects like "per boss defeated").
//
// See docs/superpowers/specs/2026-07-17-damage-build-mode-design.md for the full rationale,
// including the spell-school → damage-type mapping (confirmed with the user).

export const EFFECT_MULTIPLIERS = {
  // ── Resource / Recovery (baseline) ────────────────────────────────────────
  'Character Skill Cooldown Reduction +1': { tier: 'baseline', bucket: 'resource', value: 0.95 },
  'Character Skill Cooldown Reduction +2': { tier: 'baseline', bucket: 'resource', value: 0.925 },
  'Character Skill Cooldown Reduction +3': { tier: 'baseline', bucket: 'resource', value: 0.9 },
  'Ultimate Art Auto Charge +1': { tier: 'baseline', bucket: 'resource', value: 1.05 },
  'Ultimate Art Auto Charge +2': { tier: 'baseline', bucket: 'resource', value: 1.075 },
  'Ultimate Art Auto Charge +3': { tier: 'baseline', bucket: 'resource', value: 1.1 },
  'Reduced FP Consumption': { tier: 'baseline', bucket: 'resource', value: 0.92 },
  'Reduced FP Consumption +1': { tier: 'baseline', bucket: 'resource', value: 0.87 },
  'Reduced FP Consumption +2': { tier: 'baseline', bucket: 'resource', value: 0.84 },
  'Increased Maximum HP': { tier: 'baseline', bucket: 'resource', value: 1.1 },
  'Increased Maximum FP': { tier: 'baseline', bucket: 'resource', value: 1.15 },
  'Increased Maximum Stamina': { tier: 'baseline', bucket: 'resource', value: 1.12 },
  'Improved Flask HP Restoration': { tier: 'baseline', bucket: 'resource', value: 1.1 },
  // DON curses that are fixed-rate (no transient trigger) go in Resource baseline too.
  'Reduced Flask HP Restoration': { tier: 'baseline', bucket: 'resource', value: 0.85 },
  'Ultimate Art Charging Impaired': { tier: 'baseline', bucket: 'resource', value: 0.85 },
  // DON curse — temporary state after being downed, not fixed-rate.
  'Near Death Reduces Max HP': { tier: 'conditional', bucket: 'resource', value: 0.75, condition: '60s after being downed' },

  // ── Elemental Attack Up (baseline damage) ─────────────────────────────────
  'Physical Attack Up': { tier: 'baseline', bucket: 'damage', axes: ['physical'], value: 1.04 },
  'Physical Attack Up +1': { tier: 'baseline', bucket: 'damage', axes: ['physical'], value: 1.05 },
  'Physical Attack Up +2': { tier: 'baseline', bucket: 'damage', axes: ['physical'], value: 1.06 },
  'Physical Attack Up +3': { tier: 'baseline', bucket: 'damage', axes: ['physical'], value: 1.105 },
  'Physical Attack Up +4': { tier: 'baseline', bucket: 'damage', axes: ['physical'], value: 1.12 },
  'Magic Attack Power Up': { tier: 'baseline', bucket: 'damage', axes: ['magic'], value: 1.045 },
  'Magic Attack Power Up +1': { tier: 'baseline', bucket: 'damage', axes: ['magic'], value: 1.055 },
  'Magic Attack Power Up +2': { tier: 'baseline', bucket: 'damage', axes: ['magic'], value: 1.065 },
  'Magic Attack Power Up +3': { tier: 'baseline', bucket: 'damage', axes: ['magic'], value: 1.105 },
  'Magic Attack Power Up +4': { tier: 'baseline', bucket: 'damage', axes: ['magic'], value: 1.12 },
  'Fire Attack Power Up': { tier: 'baseline', bucket: 'damage', axes: ['fire'], value: 1.045 },
  'Fire Attack Power Up +1': { tier: 'baseline', bucket: 'damage', axes: ['fire'], value: 1.055 },
  'Fire Attack Power Up +2': { tier: 'baseline', bucket: 'damage', axes: ['fire'], value: 1.065 },
  'Fire Attack Power Up +3': { tier: 'baseline', bucket: 'damage', axes: ['fire'], value: 1.105 },
  'Fire Attack Power Up +4': { tier: 'baseline', bucket: 'damage', axes: ['fire'], value: 1.12 },
  'Lightning Attack Power Up': { tier: 'baseline', bucket: 'damage', axes: ['lightning'], value: 1.045 },
  'Lightning Attack Power Up +1': { tier: 'baseline', bucket: 'damage', axes: ['lightning'], value: 1.055 },
  'Lightning Attack Power Up +2': { tier: 'baseline', bucket: 'damage', axes: ['lightning'], value: 1.065 },
  'Lightning Attack Power Up +3': { tier: 'baseline', bucket: 'damage', axes: ['lightning'], value: 1.105 },
  'Lightning Attack Power Up +4': { tier: 'baseline', bucket: 'damage', axes: ['lightning'], value: 1.12 },
  'Holy Attack Power Up': { tier: 'baseline', bucket: 'damage', axes: ['holy'], value: 1.045 },
  'Holy Attack Power Up +1': { tier: 'baseline', bucket: 'damage', axes: ['holy'], value: 1.055 },
  'Holy Attack Power Up +2': { tier: 'baseline', bucket: 'damage', axes: ['holy'], value: 1.065 },
  'Holy Attack Power Up +3': { tier: 'baseline', bucket: 'damage', axes: ['holy'], value: 1.105 },
  'Holy Attack Power Up +4': { tier: 'baseline', bucket: 'damage', axes: ['holy'], value: 1.12 },
  'Improved Affinity Attack Power': { tier: 'baseline', bucket: 'damage', axes: ['magic', 'fire', 'lightning', 'holy'], value: 1.05 },
  'Improved Affinity Attack Power +1': { tier: 'baseline', bucket: 'damage', axes: ['magic', 'fire', 'lightning', 'holy'], value: 1.08 },
  'Improved Affinity Attack Power +2': { tier: 'baseline', bucket: 'damage', axes: ['magic', 'fire', 'lightning', 'holy'], value: 1.1 },

  // ── Sorcery / Incantation category multipliers (baseline, no fixed axis) ─
  'Improved Sorceries': { tier: 'baseline', bucket: 'damage', category: 'sorcery', value: 1.05 },
  'Improved Sorceries +1': { tier: 'baseline', bucket: 'damage', category: 'sorcery', value: 1.085 },
  'Improved Sorceries +2': { tier: 'baseline', bucket: 'damage', category: 'sorcery', value: 1.1 },
  'Improved Incantations': { tier: 'baseline', bucket: 'damage', category: 'incantation', value: 1.05 },
  'Improved Incantations +1': { tier: 'baseline', bucket: 'damage', category: 'incantation', value: 1.085 },
  'Improved Incantations +2': { tier: 'baseline', bucket: 'damage', category: 'incantation', value: 1.1 },

  // ── Spell schools (conditional: only while casting that school) ─────────
  // Sorceries are all Magic-typed regardless of flavor. Incantations vary by
  // school — mapping confirmed with the user; Dragon Communion intentionally
  // left unmapped (spans multiple elements, no single type).
  'Improved Stonedigger Sorcery': { tier: 'conditional', bucket: 'damage', axes: ['magic'], category: 'sorcery', value: 1.12, condition: 'Casting Stonedigger sorceries only' },
  'Improved Carian Sword Sorcery': { tier: 'conditional', bucket: 'damage', axes: ['magic'], category: 'sorcery', value: 1.12, condition: 'Casting Carian Sword sorceries only' },
  'Improved Glintblade Sorcery': { tier: 'conditional', bucket: 'damage', axes: ['magic'], category: 'sorcery', value: 1.12, condition: 'Casting Glintblade sorceries only' },
  'Improved Invisibility Sorcery': { tier: 'conditional', bucket: 'damage', axes: ['magic'], category: 'sorcery', value: 1.12, condition: 'Casting Invisibility sorceries only' },
  'Improved Crystalian sorcery': { tier: 'conditional', bucket: 'damage', axes: ['magic'], category: 'sorcery', value: 1.12, condition: 'Casting Crystalian sorceries only' },
  'Improved Gravity Sorcery': { tier: 'conditional', bucket: 'damage', axes: ['magic'], category: 'sorcery', value: 1.12, condition: 'Casting Gravity sorceries only' },
  'Improved Thorn Sorcery': { tier: 'conditional', bucket: 'damage', axes: ['magic'], category: 'sorcery', value: 1.12, condition: 'Casting Thorn sorceries only' },
  'Improved Fundamentalist Incantations': { tier: 'conditional', bucket: 'damage', axes: ['holy'], category: 'incantation', value: 1.12, condition: 'Casting Fundamentalist incantations only' },
  'Improved Dragon Cult Incantations': { tier: 'conditional', bucket: 'damage', axes: ['lightning'], category: 'incantation', value: 1.12, condition: 'Casting Dragon Cult incantations only' },
  "Improved Giants' Flame Incantations": { tier: 'conditional', bucket: 'damage', axes: ['fire'], category: 'incantation', value: 1.12, condition: "Casting Giants' Flame incantations only" },
  'Improved Godslayer Incantations': { tier: 'conditional', bucket: 'damage', axes: ['fire'], category: 'incantation', value: 1.12, condition: 'Casting Godslayer incantations only' },
  'Improved Bestial Incantations': { tier: 'conditional', bucket: 'damage', axes: ['physical'], category: 'incantation', value: 1.12, condition: 'Casting Bestial incantations only' },
  'Improved Frenzied Flame Incantations': { tier: 'conditional', bucket: 'damage', axes: ['fire'], category: 'incantation', value: 1.12, condition: 'Casting Frenzied Flame incantations only' },
  // 'Improved Dragon Communion Incantations' intentionally omitted — see comment above.

  // ── Specific hit-type / timing-window damage (conditional) ───────────────
  'Improved Initial Standard Attack': { tier: 'conditional', bucket: 'damage', axes: ['universal'], value: 1.15, condition: 'First light attack only' },
  'Improved Critical Hits': { tier: 'conditional', bucket: 'damage', axes: ['universal'], value: 1.18, condition: 'On critical hits' },
  'Taking attacks improves attack power': { tier: 'conditional', bucket: 'damage', axes: ['universal'], value: 1.15, condition: '10s after taking a hit' },
  'Improved Guard Counters': { tier: 'conditional', bucket: 'damage', axes: ['universal'], value: 1.17, condition: 'On guard counters' },
  'Improved Guard Counters +1': { tier: 'conditional', bucket: 'damage', axes: ['universal'], value: 1.25, condition: 'On guard counters' },
  'Improved Guard Counters +2': { tier: 'conditional', bucket: 'damage', axes: ['universal'], value: 1.29, condition: 'On guard counters' },
  'Physical attack power increases after using grease items': { tier: 'conditional', bucket: 'damage', axes: ['physical'], value: 1.1, condition: '30s after using grease items' },
  'Physical attack power increases after using grease items +1': { tier: 'conditional', bucket: 'damage', axes: ['physical'], value: 1.17, condition: '30s after using grease items' },
  'Physical attack power increases after using grease items +2': { tier: 'conditional', bucket: 'damage', axes: ['physical'], value: 1.2, condition: '30s after using grease items' },
  'Attack power up when facing frostbite-afflicted enemy': { tier: 'conditional', bucket: 'damage', axes: ['universal'], value: 1.1, condition: 'vs frostbite-afflicted enemies' },
  'Attack power up when facing frostbite-afflicted enemy +1': { tier: 'conditional', bucket: 'damage', axes: ['universal'], value: 1.16, condition: 'vs frostbite-afflicted enemies' },
  'Attack power up when facing frostbite-afflicted enemy +2': { tier: 'conditional', bucket: 'damage', axes: ['universal'], value: 1.2, condition: 'vs frostbite-afflicted enemies' },
  'Attack power up when facing poison-afflicted enemy': { tier: 'conditional', bucket: 'damage', axes: ['universal'], value: 1.1, condition: 'vs poison-afflicted enemies' },
  'Attack power up when facing poison-afflicted enemy +1': { tier: 'conditional', bucket: 'damage', axes: ['universal'], value: 1.16, condition: 'vs poison-afflicted enemies' },
  'Attack power up when facing poison-afflicted enemy +2': { tier: 'conditional', bucket: 'damage', axes: ['universal'], value: 1.2, condition: 'vs poison-afflicted enemies' },
  'Attack power up when facing scarlet rot-afflicted enemy': { tier: 'conditional', bucket: 'damage', axes: ['universal'], value: 1.1, condition: 'vs rot-afflicted enemies' },
  'Attack power up when facing scarlet rot-afflicted enemy +1': { tier: 'conditional', bucket: 'damage', axes: ['universal'], value: 1.16, condition: 'vs rot-afflicted enemies' },
  'Attack power up when facing scarlet rot-afflicted enemy +2': { tier: 'conditional', bucket: 'damage', axes: ['universal'], value: 1.2, condition: 'vs rot-afflicted enemies' },
  'Sleep in Vicinity Improves Attack Power': { tier: 'conditional', bucket: 'damage', axes: ['universal'], value: 1.12, condition: 'After sleep procs nearby' },
  'Sleep in Vicinity Improves Attack Power +1': { tier: 'conditional', bucket: 'damage', axes: ['universal'], value: 1.22, condition: 'After sleep procs nearby' },
  'Madness in Vicinity Improves Attack Power': { tier: 'conditional', bucket: 'damage', axes: ['universal'], value: 1.12, condition: 'After madness procs nearby' },
  'Madness in Vicinity Improves Attack Power +1': { tier: 'conditional', bucket: 'damage', axes: ['universal'], value: 1.22, condition: 'After madness procs nearby' },
  'Improved Glintstone and Gravity Stone Damage': { tier: 'conditional', bucket: 'damage', axes: ['magic'], value: 1.15, condition: 'Stone/Gravity Stone throws only' },
  'Improved Glintstone and Gravity Stone Damage +1': { tier: 'conditional', bucket: 'damage', axes: ['magic'], value: 1.3, condition: 'Stone/Gravity Stone throws only' },
  'Improved Throwing Knife Damage': { tier: 'conditional', bucket: 'damage', axes: ['physical'], value: 1.15, condition: 'Throwing Knife throws only' },
  'Improved Throwing Knife Damage +1': { tier: 'conditional', bucket: 'damage', axes: ['physical'], value: 1.3, condition: 'Throwing Knife throws only' },
  'Improved Throwing Pot Damage': { tier: 'conditional', bucket: 'damage', axes: ['universal'], value: 1.15, condition: 'Throwing Pot throws only' },
  'Improved Throwing Pot Damage +1': { tier: 'conditional', bucket: 'damage', axes: ['universal'], value: 1.3, condition: 'Throwing Pot throws only' },

  // ── DON curse: HP-threshold-dependent damage debuff (conditional) ────────
  'Lower Attack When Below Max HP': { tier: 'conditional', bucket: 'damage', axes: ['universal'], value: 0.915, condition: 'While HP is below 85%' },

  // ── Damage Negation (baseline) ────────────────────────────────────────────
  'Fire Damage Negation Up': { tier: 'baseline', bucket: 'negation', axes: ['fire'], value: 0.10 },
  'Magic Damage Negation Up': { tier: 'baseline', bucket: 'negation', axes: ['magic'], value: 0.10 },
  'Lightning Damage Negation Up': { tier: 'baseline', bucket: 'negation', axes: ['lightning'], value: 0.10 },
  'Holy Damage Negation Up': { tier: 'baseline', bucket: 'negation', axes: ['holy'], value: 0.10 },
  'Improved Fire Damage Negation +1': { tier: 'baseline', bucket: 'negation', axes: ['fire'], value: 0.15 },
  'Improved Fire Damage Negation +2': { tier: 'baseline', bucket: 'negation', axes: ['fire'], value: 0.16 },
  'Improved Magic Damage Negation +1': { tier: 'baseline', bucket: 'negation', axes: ['magic'], value: 0.15 },
  'Improved Magic Damage Negation +2': { tier: 'baseline', bucket: 'negation', axes: ['magic'], value: 0.16 },
  'Improved Lightning Damage Negation +1': { tier: 'baseline', bucket: 'negation', axes: ['lightning'], value: 0.15 },
  'Improved Lightning Damage Negation +2': { tier: 'baseline', bucket: 'negation', axes: ['lightning'], value: 0.16 },
  'Improved Holy Damage Negation +1': { tier: 'baseline', bucket: 'negation', axes: ['holy'], value: 0.15 },
  'Improved Holy Damage Negation +2': { tier: 'baseline', bucket: 'negation', axes: ['holy'], value: 0.16 },
  'Improved Physical Damage Negation +1': { tier: 'baseline', bucket: 'negation', axes: ['physical'], value: 0.105 },
  'Improved Physical Damage Negation +2': { tier: 'baseline', bucket: 'negation', axes: ['physical'], value: 0.12 },
  'Improved Affinity Damage Negation': { tier: 'baseline', bucket: 'negation', axes: ['magic', 'fire', 'lightning', 'holy'], value: 0.06 },
  'Improved Affinity Damage Negation +1': { tier: 'baseline', bucket: 'negation', axes: ['magic', 'fire', 'lightning', 'holy'], value: 0.105 },
  'Improved Affinity Damage Negation +2': { tier: 'baseline', bucket: 'negation', axes: ['magic', 'fire', 'lightning', 'holy'], value: 0.12 },

  // ── Damage Negation (conditional: time-window or state-dependent) ────────
  'Improved Poise & Damage Negation When Knocked Back by Damage': { tier: 'conditional', bucket: 'negation', axes: ['universal'], value: 0.20, condition: '20s after being hit' },
  'Reduced Damage Negation After Evading': { tier: 'conditional', bucket: 'negation', axes: ['universal'], value: -0.45, condition: 'Right after evading' },
  'Reduced Damage Negation for Flask Usages': { tier: 'conditional', bucket: 'negation', axes: ['universal'], value: -0.45, condition: 'While using flasks' },
};

// ── Weapon-type Attack Power (single-weapon = conditional; 3+ equipped = baseline universal) ──
// Generated from a lookup table rather than hand-duplicated per weapon: the "3+ Equipped"
// group name keeps "Katana" singular in the key even though every other weapon type is
// pluralized there (matches the exact names in data/relic_groups.json).
const WEAPON_TYPES = [
  { single: 'Dagger', plural: 'Daggers' },
  { single: 'Straight Sword', plural: 'Straight Swords' },
  { single: 'Greatsword', plural: 'Greatswords' },
  { single: 'Colossal Sword', plural: 'Colossal Swords' },
  { single: 'Curved Sword', plural: 'Curved Swords' },
  { single: 'Curved Greatsword', plural: 'Curved Greatswords' },
  { single: 'Katana', plural: 'Katana' },
  { single: 'Twinblade', plural: 'Twinblades' },
  { single: 'Thrusting Sword', plural: 'Thrusting Swords' },
  { single: 'Heavy Thrusting Sword', plural: 'Heavy Thrusting Swords' },
  { single: 'Axe', plural: 'Axes' },
  { single: 'Greataxe', plural: 'Greataxes' },
  { single: 'Hammer', plural: 'Hammers' },
  { single: 'Great Hammer', plural: 'Great Hammers' },
  { single: 'Flail', plural: 'Flails' },
  { single: 'Spear', plural: 'Spears' },
  { single: 'Great Spear', plural: 'Great Spears' },
  { single: 'Halberd', plural: 'Halberds' },
  { single: 'Reaper', plural: 'Reapers' },
  { single: 'Fist', plural: 'Fists' },
  { single: 'Claw', plural: 'Claws' },
  { single: 'Whip', plural: 'Whips' },
  { single: 'Colossal Weapon', plural: 'Colossal Weapons' },
  { single: 'Bow', plural: 'Bows', singleValue: 1.06, groupValue: 1.1 },
];

for (const w of WEAPON_TYPES) {
  const singleValue = w.singleValue ?? 1.09;
  const groupValue = w.groupValue ?? 1.2;
  EFFECT_MULTIPLIERS[`Improved ${w.single} Attack Power`] = {
    tier: 'conditional', bucket: 'damage', axes: ['physical'], value: singleValue,
    condition: `${w.single} hits only`,
  };
  EFFECT_MULTIPLIERS[`Improved Attack Power with 3+ ${w.plural} Equipped`] = {
    tier: 'baseline', bucket: 'damage', axes: ['universal'], value: groupValue,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node tests/effect_multipliers.test.mjs`
Expected: `... passed, 0 failed`

- [ ] **Step 5: Commit**

```bash
git add effect_multipliers.mjs tests/effect_multipliers.test.mjs
git commit -m "feat: add effect classification data for Damage Build mode"
```

---

### Task 2: Wire `mul` metadata into the data-prep pipeline

**Files:**
- Modify: `prepare_data.mjs:1-2, 62-72`
- Modify: `prepare_don_data.mjs:1-2, 109-114, 135-142`

**Interfaces:**
- Consumes: `EFFECT_MULTIPLIERS` from Task 1 (`effect_multipliers.mjs`).
- Produces: every effect object in `data/relic_data.json` / `data/don_relic_data.json` gains an optional `mul` field, mirroring how `desc` is already attached. Consumed by Task 3 (calc engine) and Task 5/6 (UI).

- [ ] **Step 1: Import `EFFECT_MULTIPLIERS` in both prepare scripts**

In `prepare_data.mjs`, change line 2:

```javascript
import { EFFECT_DESCRIPTIONS } from './descriptions.mjs';
```

to:

```javascript
import { EFFECT_DESCRIPTIONS } from './descriptions.mjs';
import { EFFECT_MULTIPLIERS } from './effect_multipliers.mjs';
```

In `prepare_don_data.mjs`, change line 2:

```javascript
import { EFFECT_DESCRIPTIONS, CURSE_DESCRIPTIONS } from './descriptions.mjs';
```

to:

```javascript
import { EFFECT_DESCRIPTIONS, CURSE_DESCRIPTIONS } from './descriptions.mjs';
import { EFFECT_MULTIPLIERS } from './effect_multipliers.mjs';
```

- [ ] **Step 2: Attach `mul` in `prepare_data.mjs`'s effect-mapping loop**

Change (around line 66-72):

```javascript
    const effects = g.effects.map(e => {
      const name = unescapeHtml(e.name);
      const desc = EFFECT_DESCRIPTIONS[name.replace(/\n/g, ' ')] || '';
      const dlc = DLC_EFFECT_IDS.has(Number(e.id));
      const ws = weights[e.id] ?? [0, 0, 0];
      return { id: e.id, name, ws, ...(desc && { desc }), ...(dlc && { dlc: true }) };
    });
```

to:

```javascript
    const effects = g.effects.map(e => {
      const name = unescapeHtml(e.name);
      const desc = EFFECT_DESCRIPTIONS[name.replace(/\n/g, ' ')] || '';
      const mul = EFFECT_MULTIPLIERS[name.replace(/\n/g, ' ')];
      const dlc = DLC_EFFECT_IDS.has(Number(e.id));
      const ws = weights[e.id] ?? [0, 0, 0];
      return { id: e.id, name, ws, ...(desc && { desc }), ...(mul && { mul }), ...(dlc && { dlc: true }) };
    });
```

- [ ] **Step 3: Attach `mul` in `prepare_don_data.mjs`'s two effect-push sites**

Change (around line 108-114, inside `addEffect`):

```javascript
  if (!groupMap[compatId].find(e => e.id === eid)) {
    const eName = unescapeHtml(name);
    const desc = EFFECT_DESCRIPTIONS[eName.replace(/\n/g, ' ')] || '';
    const dlc = DLC_EFFECT_IDS.has(Number(eid));
    groupMap[compatId].push({ id: eid, name: eName, w, hasCurse, ...(desc && { desc }), ...(dlc && { dlc: true }) });
  }
```

to:

```javascript
  if (!groupMap[compatId].find(e => e.id === eid)) {
    const eName = unescapeHtml(name);
    const desc = EFFECT_DESCRIPTIONS[eName.replace(/\n/g, ' ')] || '';
    const mul = EFFECT_MULTIPLIERS[eName.replace(/\n/g, ' ')];
    const dlc = DLC_EFFECT_IDS.has(Number(eid));
    groupMap[compatId].push({ id: eid, name: eName, w, hasCurse, ...(desc && { desc }), ...(mul && { mul }), ...(dlc && { dlc: true }) });
  }
```

Change (around line 135-141, inside the character-ability loop):

```javascript
  const eName = unescapeHtml(name);
  const desc = EFFECT_DESCRIPTIONS[eName.replace(/\n/g, ' ')] || '';
  const dlc = wPre === 0; // Scholar / Undertaker: absent from the pre-DLC pool
  (groupMap[CHAR_ABILITY_COMPAT] ||= []).push({
    id: eid, name: eName, w: wDlc, wPre, hasCurse: false,
    ...(desc && { desc }), ...(dlc && { dlc: true }),
  });
```

to:

```javascript
  const eName = unescapeHtml(name);
  const desc = EFFECT_DESCRIPTIONS[eName.replace(/\n/g, ' ')] || '';
  const mul = EFFECT_MULTIPLIERS[eName.replace(/\n/g, ' ')];
  const dlc = wPre === 0; // Scholar / Undertaker: absent from the pre-DLC pool
  (groupMap[CHAR_ABILITY_COMPAT] ||= []).push({
    id: eid, name: eName, w: wDlc, wPre, hasCurse: false,
    ...(desc && { desc }), ...(mul && { mul }), ...(dlc && { dlc: true }),
  });
```

- [ ] **Step 4: Regenerate the JSON and verify `mul` is present**

Run:
```bash
node parse_relics.mjs
node prepare_data.mjs
node prepare_don_data.mjs
```

Expected: same group/effect counts as before (this only adds a field, never removes effects). Then verify:
```bash
grep -o '"Physical Attack Up +1","ws":\[[0-9,]*\],"desc":"[^"]*","mul":{[^}]*}' data/relic_data.json
```
Expected: a match containing `"tier":"baseline","bucket":"damage","axes":["physical"],"value":1.05`.

```bash
grep -o '"Improved Bestial Incantations".\{0,160\}' data/don_relic_data.json
```
Expected: a match containing `"mul":{"tier":"conditional","bucket":"damage","axes":["physical"],"category":"incantation","value":1.12,"condition":"Casting Bestial incantations only"}`.

- [ ] **Step 5: Run the existing test suite to confirm no regression**

Run: `node tests/calc.test.mjs`
Expected: all existing tests still PASS (this task only adds a field; it doesn't touch weights or probability logic).

- [ ] **Step 6: Commit**

```bash
git add prepare_data.mjs prepare_don_data.mjs data/relic_data.json data/don_relic_data.json
git commit -m "feat: embed damage-multiplier metadata into relic data"
```

---

### Task 3: Embed regenerated data into `index.html`

**Files:**
- Modify: `index.html:267-268` (the `DATA` / `DON_DATA` constants)

**Interfaces:**
- Consumes: `data/relic_data.json`, `data/don_relic_data.json` from Task 2.
- Produces: `DATA` / `DON_DATA` in-browser constants now carry `mul` per effect, available to Task 4's `computeBuildTotals()` and Task 5/6's UI code.

- [ ] **Step 1: Run the embed script from `README.md`**

```bash
python3 -c "
import json, re
with open('data/relic_data.json') as f: r = json.load(f)
with open('data/don_relic_data.json') as f: d = json.load(f)
with open('index.html') as f: c = f.read()
c = re.sub(r'const DATA = \{.*?\};', lambda m: 'const DATA = ' + json.dumps(r, separators=(',',':'), ensure_ascii=False) + ';', c, flags=re.DOTALL)
c = re.sub(r'const DON_DATA = \{.*?\};', lambda m: 'const DON_DATA = ' + json.dumps(d, separators=(',',':'), ensure_ascii=False) + ';', c, flags=re.DOTALL)
with open('index.html', 'w') as f: f.write(c)
"
```

- [ ] **Step 2: Verify the embed succeeded**

```bash
grep -o '"Physical Attack Up +1","ws":\[[0-9,]*\],"desc":"[^"]*","mul":{[^}]*}' index.html
```
Expected: same match as Task 2 Step 4, now present inside `index.html`.

- [ ] **Step 3: Smoke-test the page still loads**

Open `index.html` in a browser (or `python3 -m http.server` from the repo root and visit it). Expected: the existing Regular/DON, Exact Effects/Multiple Choice modes still work exactly as before — this task only changed embedded data, no behavior.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "chore: re-embed relic data with damage-multiplier metadata"
```

---

### Task 4: `computeBuildTotals()` — pure calculation engine

**Files:**
- Modify: `index.html` (add function in the main `<script>` block, near the other pure calc functions like `efSlots` around line 327)
- Create: `tests/build.test.mjs`

**Interfaces:**
- Consumes: `EFFECT_MULTIPLIERS`-shaped `mul` objects (Task 1/2/3) attached to effect entries.
- Produces: `computeBuildTotals(effects)` where `effects` is `Array<{ name: string, mul?: object }>`. Returns:
  ```
  {
    damageBaseline: { physical, magic, fire, lightning, holy, universal },  // numbers, multiplier products
    negationBaseline: { physical, magic, fire, lightning, holy, universal }, // numbers, remaining-damage factors
    categoryBaseline: { sorcery, incantation },                             // numbers, multiplier products
    resourceBaseline: number,
    conditional: Array<{ name, bucket, axes?, category?, value, condition, combined }>,
    other: Array<{ name }>,
  }
  ```
  Consumed by Task 6 (summary rendering).

- [ ] **Step 1: Write the failing test**

Create `tests/build.test.mjs`:

```javascript
// Tests for computeBuildTotals(). Duplicated inline to match the exact code
// in index.html, per this project's existing test convention (see calc.test.mjs).

const AXES = ['physical', 'magic', 'fire', 'lightning', 'holy', 'universal'];

function computeBuildTotals(effects) {
  const damageBaseline = Object.fromEntries(AXES.map(a => [a, 1]));
  const negationBaseline = Object.fromEntries(AXES.map(a => [a, 1]));
  const categoryBaseline = { sorcery: 1, incantation: 1 };
  let resourceBaseline = 1;
  const conditional = [];
  const other = [];

  for (const effect of effects) {
    const m = effect.mul;
    if (!m) { other.push({ name: effect.name }); continue; }
    if (m.tier === 'conditional') { conditional.push({ name: effect.name, ...m }); continue; }
    if (m.bucket === 'resource') {
      resourceBaseline *= m.value;
    } else if (m.bucket === 'negation') {
      for (const axis of m.axes) negationBaseline[axis] *= (1 - m.value);
    } else {
      for (const axis of (m.axes || [])) damageBaseline[axis] *= m.value;
      if (m.category) categoryBaseline[m.category] *= m.value;
    }
  }

  // Universal always applies on top of a conditional entry's own specific axis
  // (Universal bonuses, by definition, apply regardless of damage type) — so it's
  // folded in unconditionally, skipping a second multiply if the entry's own axis
  // literally is "universal" (avoids squaring it).
  function combinedFor(c) {
    if (c.bucket === 'resource') return resourceBaseline * c.value;
    if (c.bucket === 'negation') {
      let combined = negationBaseline.universal;
      for (const axis of c.axes) if (axis !== 'universal') combined *= negationBaseline[axis];
      return combined * (1 - c.value);
    }
    let combined = damageBaseline.universal;
    for (const axis of c.axes) if (axis !== 'universal') combined *= damageBaseline[axis];
    if (c.category) combined *= categoryBaseline[c.category];
    return combined * c.value;
  }

  return {
    damageBaseline, negationBaseline, categoryBaseline, resourceBaseline,
    conditional: conditional.map(c => ({ ...c, combined: combinedFor(c) })),
    other,
  };
}

// --- Test harness (matches tests/calc.test.mjs style) ---
let passed = 0, failed = 0;
function test(label, actual, expected, tolerance = 1e-9) {
  const ok = typeof expected === 'number'
    ? Math.abs(actual - expected) < tolerance
    : actual === expected;
  if (ok) { passed++; console.log('  PASS ' + label); }
  else { failed++; console.error('  FAIL ' + label + ': got ' + JSON.stringify(actual) + ', expected ' + JSON.stringify(expected)); }
}

// Worked example from the design spec: Physical Attack Up +1, Improved
// Incantations +1, Improved Bestial Incantations (physical + incantation).
{
  const physicalUp1 = { tier: 'baseline', bucket: 'damage', axes: ['physical'], value: 1.05 };
  const incantationsUp1 = { tier: 'baseline', bucket: 'damage', category: 'incantation', value: 1.085 };
  const bestial = { tier: 'conditional', bucket: 'damage', axes: ['physical'], category: 'incantation', value: 1.12, condition: 'Casting Bestial incantations only' };
  const r = computeBuildTotals([
    { name: 'Physical Attack Up +1', mul: physicalUp1 },
    { name: 'Improved Incantations +1', mul: incantationsUp1 },
    { name: 'Improved Bestial Incantations', mul: bestial },
  ]);
  test('physical baseline', r.damageBaseline.physical, 1.05);
  test('incantation category baseline', r.categoryBaseline.incantation, 1.085);
  test('untouched axis stays 1', r.damageBaseline.magic, 1);
  test('bestial combined = physical * incantation * bestial', r.conditional[0].combined, 1.05 * 1.085 * 1.12);
  test('conditional entry carries its condition text', r.conditional[0].condition, 'Casting Bestial incantations only');
}

// Negation: a baseline Fire negation plus the evasion curse (negative value,
// universal axis) — the two must not interfere since they're different axes.
{
  const fireNeg = { tier: 'baseline', bucket: 'negation', axes: ['fire'], value: 0.10 };
  const evasionCurse = { tier: 'conditional', bucket: 'negation', axes: ['universal'], value: -0.45, condition: 'Right after evading' };
  const r = computeBuildTotals([
    { name: 'Fire Damage Negation Up', mul: fireNeg },
    { name: 'Reduced Damage Negation After Evading', mul: evasionCurse },
  ]);
  test('fire negation baseline (remaining-damage factor)', r.negationBaseline.fire, 0.90);
  test('universal negation baseline untouched', r.negationBaseline.universal, 1);
  test('evasion curse combined = 1 * (1 - (-0.45)) = 1.45', r.conditional[0].combined, 1.45);
}

// A Universal baseline (e.g. the 3+-weapon-equipped bonus) must fold into a
// conditional entry's combined figure even though the entry's own axis is
// Physical, not Universal — Universal applies to all damage by definition.
{
  const physicalUp1 = { tier: 'baseline', bucket: 'damage', axes: ['physical'], value: 1.05 };
  const katana3plus = { tier: 'baseline', bucket: 'damage', axes: ['universal'], value: 1.2 };
  const katanaSingle = { tier: 'conditional', bucket: 'damage', axes: ['physical'], value: 1.09, condition: 'Katana hits only' };
  const r = computeBuildTotals([
    { name: 'Physical Attack Up +1', mul: physicalUp1 },
    { name: 'Improved Attack Power with 3+ Katana Equipped', mul: katana3plus },
    { name: 'Improved Katana Attack Power', mul: katanaSingle },
  ]);
  test('universal baseline', r.damageBaseline.universal, 1.2);
  test('katana combined = physical * universal * katana', r.conditional[0].combined, 1.05 * 1.2 * 1.09);
}

// Duplicate effects (two relics rolling the same baseline effect) multiply twice.
{
  const physicalUp = { tier: 'baseline', bucket: 'damage', axes: ['physical'], value: 1.04 };
  const r = computeBuildTotals([
    { name: 'Physical Attack Up', mul: physicalUp },
    { name: 'Physical Attack Up', mul: physicalUp },
  ]);
  test('duplicate baseline effects both apply', r.damageBaseline.physical, 1.04 * 1.04);
}

// Unmapped effects fall into `other`, never silently multiplied.
{
  const r = computeBuildTotals([{ name: 'Vigor +1' }]);
  test('unmapped effect count', r.other.length, 1);
  test('unmapped effect name', r.other[0].name, 'Vigor +1');
  test('unmapped effect does not touch damage baseline', r.damageBaseline.physical, 1);
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
```

- [ ] **Step 2: Run the test to validate the reference implementation**

`tests/build.test.mjs` defines its own copy of `computeBuildTotals` (there's no module system linking it to `index.html` — same convention `tests/calc.test.mjs` already uses for `efSlots`), so there's no "fails because the function doesn't exist yet" cycle here. Instead, this step validates the arithmetic itself before Step 3 duplicates the exact same code into `index.html`.

Run: `node tests/build.test.mjs`
Expected: `14 passed, 0 failed`. If anything fails, fix the arithmetic in `tests/build.test.mjs` itself before proceeding — Step 3 must copy an already-correct implementation.

- [ ] **Step 3: Add the identical function to `index.html`**

In the main `<script>` block, immediately after the `efSlots` function (ends around line 345, before `function calculateProbabilityV2` at line 347), insert:

```javascript
    // Damage Build mode — pure calc engine. Kept in sync with tests/build.test.mjs.
    const BUILD_AXES = ['physical', 'magic', 'fire', 'lightning', 'holy', 'universal'];

    function computeBuildTotals(effects) {
      const damageBaseline = Object.fromEntries(BUILD_AXES.map(a => [a, 1]));
      const negationBaseline = Object.fromEntries(BUILD_AXES.map(a => [a, 1]));
      const categoryBaseline = { sorcery: 1, incantation: 1 };
      let resourceBaseline = 1;
      const conditional = [];
      const other = [];

      for (const effect of effects) {
        const m = effect.mul;
        if (!m) { other.push({ name: effect.name }); continue; }
        if (m.tier === 'conditional') { conditional.push({ name: effect.name, ...m }); continue; }
        if (m.bucket === 'resource') {
          resourceBaseline *= m.value;
        } else if (m.bucket === 'negation') {
          for (const axis of m.axes) negationBaseline[axis] *= (1 - m.value);
        } else {
          for (const axis of (m.axes || [])) damageBaseline[axis] *= m.value;
          if (m.category) categoryBaseline[m.category] *= m.value;
        }
      }

      function combinedFor(c) {
        if (c.bucket === 'resource') return resourceBaseline * c.value;
        if (c.bucket === 'negation') {
          let combined = 1;
          for (const axis of c.axes) combined *= negationBaseline[axis];
          return combined * (1 - c.value);
        }
        let combined = 1;
        for (const axis of c.axes) combined *= damageBaseline[axis];
        if (c.category) combined *= categoryBaseline[c.category];
        return combined * c.value;
      }

      return {
        damageBaseline, negationBaseline, categoryBaseline, resourceBaseline,
        conditional: conditional.map(c => ({ ...c, combined: combinedFor(c) })),
        other,
      };
    }
```

- [ ] **Step 4: Verify in-browser**

Open `index.html`, open the browser dev console, and run:
```javascript
computeBuildTotals([
  { name: 'Physical Attack Up +1', mul: { tier: 'baseline', bucket: 'damage', axes: ['physical'], value: 1.05 } },
  { name: 'Improved Bestial Incantations', mul: { tier: 'conditional', bucket: 'damage', axes: ['physical'], category: 'incantation', value: 1.12, condition: 'Casting Bestial incantations only' } },
])
```
Expected: `damageBaseline.physical === 1.05`, `conditional[0].combined === 1.05 * 1.12` (no incantation-category factor here since none was selected, so `categoryBaseline.incantation` stayed `1`).

- [ ] **Step 5: Commit**

```bash
git add index.html tests/build.test.mjs
git commit -m "feat: add computeBuildTotals calc engine for Damage Build mode"
```

---

### Task 5: Damage Build mode — HTML scaffold + CSS

**Files:**
- Modify: `index.html:139-142` (calcmode mode-toggle)
- Modify: `index.html:170-173` (insert new section alongside `#v1-section` / `#v2-section`)
- Modify: `index.html` `<style>` block (add a few rules)

**Interfaces:**
- Produces: DOM elements `#v3-section`, `#build-don-toggle`, `#build-regular-relics`, `#build-don-relics`, `#build-summary` — consumed by Task 6's JS wiring.

- [ ] **Step 1: Add the third mode-toggle button**

Change (`index.html:139-142`):

```html
  <div class="mode-toggle" style="margin-bottom: 1rem;">
    <button class="mode-btn" data-calcmode="v1" data-i18n="calcmode_v1">Exact Effects</button>
    <button class="mode-btn active" data-calcmode="v2" data-i18n="calcmode_v2">Multiple Choice</button>
  </div>
```

to:

```html
  <div class="mode-toggle" style="margin-bottom: 1rem;">
    <button class="mode-btn" data-calcmode="v1" data-i18n="calcmode_v1">Exact Effects</button>
    <button class="mode-btn active" data-calcmode="v2" data-i18n="calcmode_v2">Multiple Choice</button>
    <button class="mode-btn" data-calcmode="v3" data-i18n="calcmode_v3">Damage Build</button>
  </div>
```

- [ ] **Step 2: Add the `#v3-section` container**

Change (`index.html:170-173`):

```html
  <div id="v1-section" style="display:none">
    <div id="slots-container"></div>
    <button id="add-slot" data-i18n="add_effect">+ Add desired effect</button>
  </div>
```

to:

```html
  <div id="v1-section" style="display:none">
    <div id="slots-container"></div>
    <button id="add-slot" data-i18n="add_effect">+ Add desired effect</button>
  </div>

  <div id="v3-section" style="display:none">
    <label class="build-don-toggle-label">
      <input type="checkbox" id="build-don-toggle" checked>
      <span data-i18n="build_don_toggle">Include Deep of Night relics</span>
    </label>
    <h3 data-i18n="build_regular_heading">Regular Relics</h3>
    <div id="build-regular-relics"></div>
    <h3 id="build-don-heading" data-i18n="build_don_heading">Deep of Night Relics</h3>
    <div id="build-don-relics"></div>
    <div id="build-summary"></div>
  </div>
```

- [ ] **Step 3: Add CSS for the new elements**

In the `<style>` block, immediately after the existing `#add-slot` rules (around line 100-101), add:

```css
    .build-don-toggle-label { display: block; margin-bottom: 1rem; color: #ccc; font-size: 0.9rem; }
    .relic-panel { border: 1px solid #444; border-radius: 6px; padding: 0.8rem; margin-bottom: 1rem; }
    .relic-panel-title { font-weight: 600; color: #f0c060; margin-bottom: 0.5rem; font-size: 0.9rem; }
    .add-effect-btn { background: none; border: 1px dashed #555; color: #aaa; padding: 0.4rem 0.9rem; border-radius: 4px; cursor: pointer; font-size: 0.8rem; }
    .add-effect-btn:hover { border-color: #f0c060; color: #f0c060; }
    .add-effect-btn:disabled { opacity: 0.4; cursor: default; }
    .build-summary-section { border: 1px solid #444; border-radius: 6px; padding: 0.8rem; margin-top: 1rem; }
    .build-summary-title { font-weight: 600; color: #f0c060; margin-bottom: 0.5rem; }
    .build-axis-row { display: flex; justify-content: space-between; padding: 0.15rem 0; font-size: 0.9rem; }
    .build-conditional-item { padding: 0.3rem 0; font-size: 0.85rem; border-top: 1px solid #333; }
    .build-conditional-combined { color: #f0c060; }
    .build-other-list { font-size: 0.8rem; color: #999; margin-top: 0.5rem; }
```

- [ ] **Step 4: Manual smoke test**

Open `index.html` in a browser. Expected: a "Damage Build" button appears in the calc-mode toggle row; clicking it does nothing yet (no JS wired) but doesn't error, and no `#v3-section` content is visible since it defaults to `display:none` and no click handler exists yet for `data-calcmode="v3"` — this is expected at this stage (Task 6 wires the handler).

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat: add Damage Build mode HTML/CSS scaffold"
```

---

### Task 6: Damage Build mode — relic panel rendering

**Files:**
- Modify: `index.html` (add JS functions in the main `<script>` block, after the existing v2 pool-UI functions, e.g. after `buildCurseFilterUI` around line 783)

**Interfaces:**
- Consumes: `DATA`, `DON_DATA` (global constants), `I18N` (global), CSS classes from Task 5.
- Produces: `buildRelicPanels()`, `getBuildEffects()` — the latter is consumed by Task 7 (summary rendering).

- [ ] **Step 1: Add parametrized option-builder helpers**

The existing `buildGroupOptions`/`buildEffectOptions`/`buildCurseOptions` (lines 512-544) close over the global `mode` variable, which switches the *entire app* between Regular and DON. Damage Build mode needs both pools simultaneously (3 Regular panels + 3 DON panels), so it needs its own versions parametrized by an explicit `groups` array instead of the global `mode`.

Add, after `buildCurseOptions` (line 544):

```javascript
    // --- Damage Build mode: relic panel UI ---
    // Unlike buildGroupOptions/buildEffectOptions/buildCurseOptions (which read the
    // global `mode`), these take their pool explicitly since Build mode shows Regular
    // and DON relics side by side regardless of the top Regular/DON toggle.
    function buildOptionsForGroups(groups, usedIndices, currentGroupIdx) {
      let html = `<option value="">${I18N.t('select_group_placeholder', '— select group —')}</option>`;
      groups.forEach((g, i) => {
        if (!usedIndices.has(i) || i === currentGroupIdx) {
          const sel = i === currentGroupIdx ? ' selected' : '';
          html += `<option value="${i}"${sel}>${I18N.groupName(g.groupName)} (${g.effects.length})</option>`;
        }
      });
      return html;
    }

    function buildEffectOptionsForGroups(groups, groupIdx, currentEffectIdx) {
      if (isNaN(groupIdx) || groupIdx < 0) return `<option value="">${I18N.t('select_effect_placeholder', '— select effect —')}</option>`;
      let html = '';
      groups[groupIdx].effects.forEach((e, i) => {
        const sel = i === currentEffectIdx ? ' selected' : '';
        html += `<option value="${i}"${sel}>${I18N.effectName(e.name)}</option>`;
      });
      return html;
    }

    function buildCurseOptionsFor(currentCurseIdx) {
      let html = `<option value="">${I18N.t('curse_any', 'Any curse')}</option>`;
      DON_DATA.curses.forEach((c, i) => {
        const sel = i === currentCurseIdx ? ' selected' : '';
        html += `<option value="${i}"${sel}>${I18N.effectName(c.name)}</option>`;
      });
      return html;
    }
```

- [ ] **Step 2: Add the relic-panel factory**

Add immediately after:

```javascript
    function activeBuildPreDLCGroups(pool) {
      // Mirrors activeGroups()'s pre-DLC filtering, but parametrized to an explicit pool
      // (DATA or DON_DATA) instead of the global `mode`.
      if (!preDLC) return pool.groups;
      return pool.groups
        .map(g => ({ ...g, effects: g.effects.filter(e => !e.dlc) }))
        .filter(g => g.effects.length > 0);
    }

    function createRelicPanel(pool, allowCurse, title) {
      const panel = document.createElement('div');
      panel.className = 'relic-panel';
      const titleEl = document.createElement('div');
      titleEl.className = 'relic-panel-title';
      titleEl.textContent = title;
      const slotsEl = document.createElement('div');
      slotsEl.className = 'relic-panel-slots';
      const addBtn = document.createElement('button');
      addBtn.className = 'add-effect-btn';
      addBtn.type = 'button';
      addBtn.textContent = I18N.t('add_effect', '+ Add desired effect');

      function usedGroupIndices() {
        return new Set([...slotsEl.querySelectorAll('.group-select')]
          .map(s => parseInt(s.value)).filter(v => !isNaN(v)));
      }
      function updateAddBtnState() {
        addBtn.disabled = slotsEl.querySelectorAll('.slot-block').length >= 3;
      }
      function refreshGroupDropdowns() {
        const groups = activeBuildPreDLCGroups(pool);
        slotsEl.querySelectorAll('.slot-block').forEach(block => {
          const groupSel = block.querySelector('.group-select');
          const cur = parseInt(groupSel.value);
          groupSel.innerHTML = buildOptionsForGroups(groups, usedGroupIndices(), cur);
        });
      }

      function addRow() {
        if (slotsEl.querySelectorAll('.slot-block').length >= 3) return;
        const groups = activeBuildPreDLCGroups(pool);
        const block = document.createElement('div');
        block.className = 'slot-block';
        const row = document.createElement('div');
        row.className = 'slot';
        const groupSel = document.createElement('select');
        groupSel.className = 'group-select';
        groupSel.innerHTML = buildOptionsForGroups(groups, usedGroupIndices(), NaN);
        const effectSel = document.createElement('select');
        effectSel.className = 'effect-select';
        effectSel.innerHTML = `<option value="">${I18N.t('select_effect_placeholder', '— select effect —')}</option>`;
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn';
        removeBtn.textContent = I18N.t('remove', 'Remove');
        row.append(groupSel, effectSel, removeBtn);
        block.append(row);

        groupSel.addEventListener('change', () => {
          const gIdx = parseInt(groupSel.value);
          effectSel.innerHTML = buildEffectOptionsForGroups(groups, gIdx, NaN);
          if (!isNaN(gIdx)) effectSel.selectedIndex = 0;
          refreshGroupDropdowns();
          updateResult();
        });
        effectSel.addEventListener('change', updateResult);
        removeBtn.addEventListener('click', () => {
          block.remove();
          refreshGroupDropdowns();
          updateAddBtnState();
          updateResult();
        });

        slotsEl.appendChild(block);
        updateAddBtnState();
      }

      addBtn.addEventListener('click', addRow);
      panel.append(titleEl, slotsEl, addBtn);

      // Every DON relic carries exactly one curse — this lives on the panel
      // itself, not per effect slot, so it must NOT go inside addRow().
      if (allowCurse) {
        const curseRow = document.createElement('div');
        curseRow.className = 'curse-row visible';
        const curseLabel = document.createElement('span');
        curseLabel.className = 'curse-label';
        curseLabel.textContent = I18N.t('curse_label', 'Curse:');
        const curseSel = document.createElement('select');
        curseSel.className = 'curse-select';
        curseSel.innerHTML = buildCurseOptionsFor(NaN);
        curseSel.addEventListener('change', updateResult);
        curseRow.append(curseLabel, curseSel);
        panel.append(curseRow);
      }

      updateAddBtnState();
      return panel;
    }
```

- [ ] **Step 3: Add the panel-set builder and effect-collector**

Add immediately after:

```javascript
    function buildRelicPanels() {
      const regularContainer = document.getElementById('build-regular-relics');
      const donContainer = document.getElementById('build-don-relics');
      regularContainer.innerHTML = '';
      donContainer.innerHTML = '';
      for (let i = 1; i <= 3; i++) {
        regularContainer.appendChild(createRelicPanel(DATA, false,
          I18N.t('build_relic_label', 'Relic') + ' ' + i));
      }
      for (let i = 1; i <= 3; i++) {
        donContainer.appendChild(createRelicPanel(DON_DATA, true,
          I18N.t('build_don_relic_label', 'DON Relic') + ' ' + i));
      }
    }

    // Reads every selected effect across all 6 relic panels (plus any selected
    // curses) and returns the flat list computeBuildTotals() expects.
    function getBuildEffects() {
      const effects = [];
      // Curses live once per relic panel (`.relic-panel`), not per effect slot
      // — iterate panels, not a flat list of slot-blocks, so each DON relic's
      // single curse is only read once regardless of how many effect rows it has.
      function collectFromPanels(container, pool, includeCurse) {
        const groups = activeBuildPreDLCGroups(pool);
        container.querySelectorAll('.relic-panel').forEach(panel => {
          panel.querySelectorAll('.slot-block').forEach(block => {
            const gIdx = parseInt(block.querySelector('.group-select').value);
            const eIdx = parseInt(block.querySelector('.effect-select').value);
            if (isNaN(gIdx) || isNaN(eIdx)) return;
            const effect = groups[gIdx]?.effects[eIdx];
            if (effect) effects.push({ name: effect.name, mul: effect.mul });
          });
          if (includeCurse) {
            const curseSel = panel.querySelector('.curse-select');
            const cIdx = parseInt(curseSel?.value);
            if (!isNaN(cIdx)) {
              const curse = DON_DATA.curses[cIdx];
              if (curse) effects.push({ name: curse.name, mul: curse.mul });
            }
          }
        });
      }
      collectFromPanels(document.getElementById('build-regular-relics'), DATA, false);
      if (document.getElementById('build-don-toggle').checked) {
        collectFromPanels(document.getElementById('build-don-relics'), DON_DATA, true);
      }
      return effects;
    }
```

- [ ] **Step 4: Wire the DON-relics toggle checkbox**

Add immediately after (still inside the same script, this can go right before the existing "Calc mode toggle" block at line 1070):

```javascript
    document.getElementById('build-don-toggle').addEventListener('change', () => {
      document.getElementById('build-don-relics').style.display =
        document.getElementById('build-don-toggle').checked ? '' : 'none';
      document.getElementById('build-don-heading').style.display =
        document.getElementById('build-don-toggle').checked ? '' : 'none';
      updateResult();
    });
```

- [ ] **Step 5: Manual smoke test**

This task alone doesn't yet call `buildRelicPanels()` from anywhere (that's wired into the mode toggle in Task 8) or render a summary (Task 7), so verify via the browser console after opening `index.html`:
```javascript
buildRelicPanels();
document.getElementById('v3-section').style.display = '';
```
Expected: 3 "Relic N" panels and 3 "DON Relic N" panels appear, each with a working "+ Add desired effect" button (up to 3 rows, group/effect selects populate correctly). Each DON relic panel shows exactly one curse dropdown for the whole panel (not one per effect row). Select a few effects, then run `getBuildEffects()` in the console — expected: an array of `{name, mul}` objects matching your selections.

- [ ] **Step 6: Commit**

```bash
git add index.html
git commit -m "feat: add relic panel rendering for Damage Build mode"
```

---

### Task 7: Damage Build mode — summary rendering

**Files:**
- Modify: `index.html` (add a rendering function, then wire it into `updateResult()`)

**Interfaces:**
- Consumes: `computeBuildTotals()` (Task 4), `getBuildEffects()` (Task 6).
- Produces: `renderBuildSummary()` — renders into `#build-summary`.

- [ ] **Step 1: Add the axis/category label helpers and renderer**

Add after `computeBuildTotals` (from Task 4):

```javascript
    const BUILD_AXIS_LABELS = {
      physical: () => I18N.t('build_axis_physical', 'Physical'),
      magic: () => I18N.t('build_axis_magic', 'Magic'),
      fire: () => I18N.t('build_axis_fire', 'Fire'),
      lightning: () => I18N.t('build_axis_lightning', 'Lightning'),
      holy: () => I18N.t('build_axis_holy', 'Holy'),
      universal: () => I18N.t('build_axis_universal', 'Universal'),
    };
    const BUILD_CATEGORY_LABELS = {
      sorcery: () => I18N.t('build_category_sorcery', 'Sorcery'),
      incantation: () => I18N.t('build_category_incantation', 'Incantation'),
    };

    function fmtMul(v) { return '×' + v.toFixed(3).replace(/\.?0+$/, ''); }

    // extraRowsHtml is appended into `rows` BEFORE the closing div — never patch
    // the returned HTML with .replace('</div>...', ...) afterward, since a plain
    // string .replace() consumes the matched closing tag instead of inserting
    // before it, producing malformed nested HTML.
    function renderBuildSection(titleKey, titleFallback, baseline, extraRowsHtml) {
      const rows = Object.entries(baseline)
        .filter(([, v]) => Math.abs(v - 1) > 1e-9)
        .map(([axis, v]) => `<div class="build-axis-row"><span>${BUILD_AXIS_LABELS[axis]()}</span><span>${fmtMul(v)}</span></div>`)
        .join('') + (extraRowsHtml || '');
      return `<div class="build-summary-section">
        <div class="build-summary-title">${I18N.t(titleKey, titleFallback)}</div>
        ${rows || `<div class="build-axis-row"><span>${I18N.t('build_none_selected', 'No effects selected yet')}</span></div>`}
      </div>`;
    }

    function renderBuildConditional(conditional) {
      if (conditional.length === 0) return '';
      const items = conditional.map(c => {
        const axisLabel = (c.axes || []).map(a => BUILD_AXIS_LABELS[a]()).join(' + ');
        const categoryLabel = c.category ? ' + ' + BUILD_CATEGORY_LABELS[c.category]() : '';
        return `<div class="build-conditional-item">
          <div>${I18N.effectName(c.name)} — ${fmtMul(c.value)} <em>(${c.condition})</em></div>
          <div class="build-conditional-combined">${I18N.t('build_combined_label', 'Combined')}: ${axisLabel}${categoryLabel} → ${fmtMul(c.combined)}</div>
        </div>`;
      }).join('');
      return `<div class="build-summary-section">
        <div class="build-summary-title">${I18N.t('build_conditional_title', 'Conditional Effects')}</div>
        ${items}
      </div>`;
    }

    function renderBuildOther(other) {
      if (other.length === 0) return '';
      const items = other.map(o => `<li>${I18N.effectName(o.name)}</li>`).join('');
      return `<div class="build-summary-section">
        <div class="build-summary-title">${I18N.t('build_other_title', 'Other Effects')}</div>
        <ul class="build-other-list">${items}</ul>
      </div>`;
    }

    function renderBuildSummary() {
      const summaryEl = document.getElementById('build-summary');
      const effects = getBuildEffects();
      const r = computeBuildTotals(effects);

      // Fold category baselines into the same "Damage" box as their own rows
      // (they're not elemental axes, but they belong conceptually with damage).
      const categoryRows = Object.entries(r.categoryBaseline).filter(([, v]) => Math.abs(v - 1) > 1e-9);
      const categoryExtra = categoryRows.map(([cat, v]) =>
        `<div class="build-axis-row"><span>${BUILD_CATEGORY_LABELS[cat]()}</span><span>${fmtMul(v)}</span></div>`).join('');
      const damageHtml = renderBuildSection('build_damage_title', 'Damage', r.damageBaseline, categoryExtra);

      const negationHtml = renderBuildSection('build_negation_title', 'Damage Negation', r.negationBaseline);
      const resourceHtml = `<div class="build-summary-section">
        <div class="build-summary-title">${I18N.t('build_resource_title', 'Resource / Recovery')}</div>
        <div class="build-axis-row"><span>${I18N.t('build_resource_combined', 'Combined')}</span><span>${fmtMul(r.resourceBaseline)}</span></div>
      </div>`;

      summaryEl.innerHTML = damageHtml + negationHtml + resourceHtml +
        renderBuildConditional(r.conditional) + renderBuildOther(r.other);
    }
```

- [ ] **Step 2: Hook `renderBuildSummary()` into the render loop**

Find `updateResult()` (line 799). At its very start, add an early return for Build mode (it has its own render path and doesn't use `quality`/`color`/probability at all):

```javascript
    function updateResult() {
      if (calcMode === 'v3') { renderBuildSummary(); return; }
```

(Leave the rest of the existing function body unchanged below this new line.)

- [ ] **Step 3: Manual smoke test**

In the browser console:
```javascript
calcMode = 'v3';
buildRelicPanels();
document.getElementById('v3-section').style.display = '';
updateResult();
```
Expected: the summary box renders "No effects selected yet" for Damage/Negation, "×1" resource. Select `Physical Attack Up +1` in Relic 1, and `Improved Bestial Incantations` in Relic 2 — expected: Damage section shows `Physical ×1.05`, and a Conditional Effects section appears showing "Improved Bestial Incantations — ×1.12 (Casting Bestial incantations only)" with a combined figure of `×1.05` (since no Incantation-category baseline is selected in this quick test, category factor stays 1).

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: render Damage Build mode summary"
```

---

### Task 8: Wire the `v3` calc-mode toggle end-to-end

**Files:**
- Modify: `index.html:943-945` (URL-restore render block)
- Modify: `index.html:1077-1083` (calc-mode click handler)
- Modify: `index.html:1118-1141` (initial page load)

**Interfaces:**
- Consumes: `buildRelicPanels()`, `renderBuildSummary()`, `updateResult()` from Tasks 6/7.
- Produces: full end-to-end mode switching, including hiding the now-irrelevant quality/color controls, probability result box, and share row while in Build mode.

- [ ] **Step 1: Hide quality/color/result/share controls in Build mode**

Change (`index.html:943-945`):

```javascript
      document.getElementById('v1-section').style.display = calcMode === 'v1' ? '' : 'none';
      document.getElementById('v2-section').style.display = calcMode === 'v2' ? '' : 'none';
      document.getElementById('curse-checkboxes').classList.toggle('visible', curseFilter.mode === 'selected');
```

to:

```javascript
      document.getElementById('v1-section').style.display = calcMode === 'v1' ? '' : 'none';
      document.getElementById('v2-section').style.display = calcMode === 'v2' ? '' : 'none';
      document.getElementById('v3-section').style.display = calcMode === 'v3' ? '' : 'none';
      document.querySelector('.controls').style.display = calcMode === 'v3' ? 'none' : '';
      document.getElementById('result').style.display = calcMode === 'v3' ? 'none' : '';
      document.querySelector('.share-row').style.display = calcMode === 'v3' ? 'none' : '';
      document.getElementById('curse-checkboxes').classList.toggle('visible', curseFilter.mode === 'selected');
```

- [ ] **Step 2: Update the calc-mode click handler**

Change (`index.html:1070-1087`):

```javascript
    document.querySelectorAll('[data-calcmode]').forEach(btn => {
      btn.addEventListener('click', () => {
        const newCalcMode = btn.dataset.calcmode;
        if (newCalcMode === calcMode) return;
        calcMode = newCalcMode;
        document.querySelectorAll('[data-calcmode]').forEach(b =>
          b.classList.toggle('active', b.dataset.calcmode === calcMode));
        document.getElementById('v1-section').style.display = calcMode === 'v1' ? '' : 'none';
        document.getElementById('v2-section').style.display = calcMode === 'v2' ? '' : 'none';
        if (calcMode === 'v1') {
          clearSlots(); addSlot(); updateAddBtn();
        } else {
          buildPoolUI(); buildCurseFilterUI(); updatePoolSummary();
        }
        updateCurseFilterVisibility();
        updateResult();
      });
    });
```

to:

```javascript
    document.querySelectorAll('[data-calcmode]').forEach(btn => {
      btn.addEventListener('click', () => {
        const newCalcMode = btn.dataset.calcmode;
        if (newCalcMode === calcMode) return;
        calcMode = newCalcMode;
        document.querySelectorAll('[data-calcmode]').forEach(b =>
          b.classList.toggle('active', b.dataset.calcmode === calcMode));
        document.getElementById('v1-section').style.display = calcMode === 'v1' ? '' : 'none';
        document.getElementById('v2-section').style.display = calcMode === 'v2' ? '' : 'none';
        document.getElementById('v3-section').style.display = calcMode === 'v3' ? '' : 'none';
        document.querySelector('.controls').style.display = calcMode === 'v3' ? 'none' : '';
        document.getElementById('result').style.display = calcMode === 'v3' ? 'none' : '';
        document.querySelector('.share-row').style.display = calcMode === 'v3' ? 'none' : '';
        if (calcMode === 'v1') {
          clearSlots(); addSlot(); updateAddBtn();
        } else if (calcMode === 'v2') {
          buildPoolUI(); buildCurseFilterUI(); updatePoolSummary();
        } else {
          buildRelicPanels();
        }
        updateCurseFilterVisibility();
        updateResult();
      });
    });
```

- [ ] **Step 3: Initialize Build mode state on page load if `calcMode` restores to `v3`**

The existing initial-load IIFE (line 1118-1141) always calls `buildPoolUI()`/`buildCurseFilterUI()` regardless of `calcMode`, and `restoreFromURL()` (line 917+) never sets `calcMode = 'v3'` today (no `&calc=v3` URL param support is being added in this plan — out of scope, see Non-goals in the spec). Add a Build-mode-aware branch right after `buildCurseFilterUI();` (line 1134):

```javascript
      buildPoolUI();
      buildCurseFilterUI();
      buildRelicPanels();
      applyRestoredSelections(restored);
```

(This just always builds the Build-mode panels too, alongside the existing v1/v2 setup — harmless since `#v3-section` stays hidden unless the user clicks the toggle.)

- [ ] **Step 4: Manual end-to-end test**

Open `index.html` fresh in a browser:
1. Click "Damage Build". Expected: quality/color controls, the probability result box, and the share row all disappear; 3 Regular + 3 DON relic panels appear with a "No effects selected yet" summary.
2. Select `Physical Attack Up +1` on Regular Relic 1, `Improved Katana Attack Power` on Regular Relic 2, `Improved Attack Power with 3+ Katana Equipped` on Regular Relic 3. Expected: Damage section shows `Physical ×1.05` and `Universal ×1.2`; Conditional Effects shows the Katana single-weapon bonus with combined `×1.05 × 1.2 × 1.09` (physical baseline × universal baseline × its own value, per `computeBuildTotals`'s `combinedFor` which multiplies across every axis the entry declares).
3. Uncheck "Include Deep of Night relics". Expected: the 3 DON panels hide and any DON-relic selections stop contributing to the summary (verify by first selecting a DON effect, confirming it affects the summary, then unchecking the toggle and confirming the summary changes back).
4. Switch to "Exact Effects" and back to "Multiple Choice". Expected: no errors, both existing modes work exactly as before (regression check).

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat: wire Damage Build mode into the calc-mode toggle"
```

---

### Task 9: i18n — English strings + JP/KR translations

**Files:**
- Modify: `index.html` (add `data-i18n` attributes already present from Task 5/7 — verify keys used)
- Modify: `locales/jp.js`
- Modify: `locales/kr.js`

**Interfaces:** None (leaf task — translates keys introduced by Tasks 5-7).

- [ ] **Step 1: Enumerate every new `I18N.t(...)` / `data-i18n` key introduced**

From Tasks 5 and 7, the new keys are: `calcmode_v3`, `build_don_toggle`, `build_regular_heading`, `build_don_heading`, `build_relic_label`, `build_don_relic_label`, `build_axis_physical`, `build_axis_magic`, `build_axis_fire`, `build_axis_lightning`, `build_axis_holy`, `build_axis_universal`, `build_category_sorcery`, `build_category_incantation`, `build_none_selected`, `build_combined_label`, `build_conditional_title`, `build_other_title`, `build_damage_title`, `build_negation_title`, `build_resource_title`, `build_resource_combined`.

- [ ] **Step 2: Add English fallbacks are already inline via `I18N.t(key, fallback)`**

No action needed — every call site from Tasks 5/7 already supplies an English fallback string as the second argument, so English works with zero locale-file changes (same pattern as every other `I18N.t()` call in the codebase).

- [ ] **Step 3: Add Japanese translations**

In `locales/jp.js`, inside the `"ui": { ... }` object (starts line 2), add (alongside the existing `calcmode_v1`/`calcmode_v2` keys around line 8-9):

```json
    "calcmode_v3": "ダメージビルド",
    "build_don_toggle": "深夜の遺物を含める",
    "build_regular_heading": "通常の遺物",
    "build_don_heading": "深夜の遺物",
    "build_relic_label": "遺物",
    "build_don_relic_label": "深夜の遺物",
    "build_axis_physical": "物理",
    "build_axis_magic": "魔力",
    "build_axis_fire": "炎",
    "build_axis_lightning": "雷",
    "build_axis_holy": "聖",
    "build_axis_universal": "全般",
    "build_category_sorcery": "魔術",
    "build_category_incantation": "祈祷",
    "build_none_selected": "まだ効果が選択されていません",
    "build_combined_label": "合計",
    "build_conditional_title": "条件付き効果",
    "build_other_title": "その他の効果",
    "build_damage_title": "ダメージ",
    "build_negation_title": "ダメージ軽減",
    "build_resource_title": "リソース・回復",
    "build_resource_combined": "合計倍率",
```

- [ ] **Step 4: Add Korean translations**

In `locales/kr.js`, inside the `"ui": { ... }` object, add the equivalent keys:

```json
    "calcmode_v3": "데미지 빌드",
    "build_don_toggle": "심야 유물 포함",
    "build_regular_heading": "일반 유물",
    "build_don_heading": "심야 유물",
    "build_relic_label": "유물",
    "build_don_relic_label": "심야 유물",
    "build_axis_physical": "물리",
    "build_axis_magic": "마력",
    "build_axis_fire": "화염",
    "build_axis_lightning": "번개",
    "build_axis_holy": "신성",
    "build_axis_universal": "전체",
    "build_category_sorcery": "마법",
    "build_category_incantation": "기도",
    "build_none_selected": "아직 선택된 효과가 없습니다",
    "build_combined_label": "합계",
    "build_conditional_title": "조건부 효과",
    "build_other_title": "기타 효과",
    "build_damage_title": "데미지",
    "build_negation_title": "피해 경감",
    "build_resource_title": "자원 / 회복",
    "build_resource_combined": "합산 배율",
```

- [ ] **Step 5: Verify no JSON/JS syntax errors**

Run:
```bash
node -e "require('./locales/jp.js'); console.log('jp ok')" 2>&1 | tail -5
node -e "require('./locales/kr.js'); console.log('kr ok')" 2>&1 | tail -5
```
Note: these files assign to `window.__LOCALE_*__` and will throw `window is not defined` under plain Node — that's expected and fine; the goal of this check is only to confirm there's no *syntax* error before that line executes. If you see `ReferenceError: window is not defined`, the JSON/JS syntax parsed correctly. Any other error (e.g. `Unexpected token`) means a typo in the added block — fix it.

- [ ] **Step 6: Manual smoke test in both languages**

Open `index.html?lang=jp`, click "Damage Build" (should read "ダメージビルド"), confirm the panel headings and summary section titles render in Japanese. Repeat with `?lang=kr`.

- [ ] **Step 7: Commit**

```bash
git add locales/jp.js locales/kr.js
git commit -m "i18n: localise Damage Build mode strings"
```

---

### Task 10: Documentation

**Files:**
- Modify: `README.md`
- Modify: `index.html` (methodology `<details>` section, around line 199-241)

**Interfaces:** None (leaf task).

- [ ] **Step 1: Add a README section describing Damage Build mode**

In `README.md`, after the existing "## Probability Formula" section, add:

```markdown
## Damage Build Mode

A third mode, independent of the probability calculator: enter the actual
effects on up to 6 equipped relics (3 Regular + 3 Deep of Night, DON
toggleable off) and see the combined Damage / Damage Negation / Resource
multipliers.

Effects are classified as **baseline** (always-on, folds into a running
total per damage-type axis: Physical/Magic/Fire/Lightning/Holy/Universal, plus
Sorcery/Incantation category multipliers) or **conditional** (real value, but
tied to a specific weapon/spell-school or a transient trigger — shown as its
own line with a "combined with your baseline" figure rather than silently
merged). Anything not classified (flat stat bonuses, resistances, variable
per-kill scaling effects) is listed as plain text.

See `docs/superpowers/specs/2026-07-17-damage-build-mode-design.md` for the
full design rationale, including the spell-school → damage-type mapping.

Effect classification data lives in `effect_multipliers.mjs` and flows
through the same `prepare_data.mjs` / `prepare_don_data.mjs` → embed pipeline
as effect descriptions.
```

- [ ] **Step 2: Add an in-app methodology note**

In `index.html`'s methodology `<details>` section, after the existing Deep of Night formula paragraph (around line 241, the `meth_formula_p4` paragraph), add a new paragraph:

```html
        <p data-i18n="meth_build_mode_note">Damage Build mode (a separate, third tab) doesn't compute probability — it lets you enter your actual equipped relics' effects and see the combined Damage / Damage Negation / Resource multipliers, splitting baseline (always-on) from conditional (weapon/school-specific or situational) effects.</p>
```

Add the corresponding `meth_build_mode_note` key with a Japanese/Korean translation to `locales/jp.js` / `locales/kr.js` (same pattern as Task 9).

- [ ] **Step 3: Commit**

```bash
git add README.md index.html locales/jp.js locales/kr.js
git commit -m "docs: describe Damage Build mode in README and in-app methodology"
```

---

### Post-plan addendum: Task 11 — URL share-link sync for Build mode

Not in the original plan — Task 8's URL Non-goal turned out to be user-visible
(`updateResult()`'s early return for `calcMode === 'v3'` skipped
`history.replaceState` entirely, so nothing about Build mode ever reached the
URL, not even `calc=v3`). Added after a user report during finishing:

- `buildShareURL()` gained a `calcMode === 'v3'` branch: `calc=v3`,
  `buildDon=0` (only if unchecked), and per-relic-panel params
  `r{1-3}s{1-3}` / `d{1-3}s{1-3}` / `d{1-3}c` (effect ids / curse names,
  mirroring the existing `slot{n}` / `slot{n}c` convention).
- `restoreFromURL()` resolves `calc=v3`, restores the DON-include checkbox,
  and returns a `build: { donIncluded, regular, don }` restore payload.
- `applyRestoredSelections()` gained a v3 branch (`applyRestoredBuildPanel`)
  that simulates `.click()` on each panel's "+ Add effect" button to create
  the right number of rows, then sets `<select>` values against
  `findBuildEffectByKey` (a pool-parametrized twin of `findEffectByKey`).
- `updateResult()`'s early return now calls `history.replaceState` before
  `renderBuildSummary()`.

Verified with a throwaway `jsdom` instance (installed outside the repo, never
added as a project dependency) driving the actual served `index.html`:
select effects across regular + DON panels including a curse → URL updates
correctly → reloading that exact URL restores identical selections →
unchecking "include DON relics" removes their contribution and sets
`buildDon=0`. 26/26 assertions passed, plus a 13-assertion regression pass
confirming v1/v2 mode and runtime mode-switching were unaffected.

---

### Post-plan addendum: Task 12 — curses are per effect slot, not per relic

Both the spec (Scope section) and Task 6 asserted "every DON relic carries
exactly one curse" and built one curse dropdown per relic panel. This was
wrong — user-caught. The game data already encodes the truth via each
effect's `hasCurse` flag (used correctly by Exact Effects mode's
`updateCurseRow()`, which this feature should have mirrored from the start):
not every DON effect carries a curse, and a relic can end up with 0, 1, 2,
or 3 curses depending on which of its up to 3 effects happen to be
curse-bearing ones.

Fix: moved the curse dropdown from the panel level into `addRow()` itself —
each effect slot gets its own `.curse-row`, hidden by default and toggled
visible only when that slot's currently-selected effect has `hasCurse` (via
a new `updateCurseRowVisibility()` closure, wired to both the group-select
and effect-select `change` handlers). `getBuildEffects()` now reads curses
per slot-block instead of once per panel. The URL scheme changed from one
`d{relic}c` param to per-slot `d{relic}c{slot}` (matching the `r{}s{}` /
`d{}s{}` effect-key convention, and matching Exact Effects mode's existing
per-slot `slot{n}c` scheme this should have followed originally).

Verified with a fresh `jsdom` instance against the actual served app: two
effect slots on one DON relic, one cursed / one not — only the cursed
slot's curse-row becomes visible; the URL keys the chosen curse to the
correct slot (`d1c1`, not a bare `d1c`) and never leaks a curse param for
the non-cursed slot; round-tripping that URL restores the exact same
per-slot curse-row visibility and selection. 21 assertions across two test
files, plus a 14-assertion full-scenario regression pass (v1/v2/v3 together,
including the "Bestial Incantations has no curse" negative case) — all
passed.

---

### Post-plan addendum: Task 13 — duplicate conditional effects weren't combined

User-caught: selecting the same conditional effect on multiple relics (their
example: "Improved Carian Sword Sorcery" on 3 regular relics + 1 DON relic
slot) produced 4 separate, identical-looking rows in Conditional Effects,
each computing its "combined" figure against only the shared baseline —
silently ignoring its 3 siblings. In-game all 4 copies would actually stack
(baseline × 1.12⁴ when casting a Carian Sword spell with all 4 relics
equipped), so 4 uncombined rows showing the same understated number was
both confusing and wrong.

Fix: `computeBuildTotals` now groups conditional (and flat/"other") entries
by exact effect name into a `Map` instead of a flat array, tracking a
`count`. `combinedFor` raises the duplicate's own value to `count` (or
`(1 − v)` to `count` for negation, since identical repeated factors reduce
to a power) before folding in the baseline/category/universal terms. The
UI (`renderBuildConditional` / `renderBuildOther`) shows a `×N` suffix and
"each" qualifier when count > 1, added `build_each_label` i18n key.
Mutually-exclusive effects (e.g. Katana vs Greatsword single-weapon bonuses)
are unaffected — they group by name, so different names never merge.

Verified against the user's exact reported URL with a fresh `jsdom`
instance: Conditional Effects now shows exactly one "Improved Carian Sword
Sorcery ×4 — ×1.12 each" row with combined `×1.974` (= 1.12² baseline ×
1.12⁴), matching hand-computed expectations. Also added a permanent
regression test (`tests/build.test.mjs`) reproducing this scenario. 5
live-DOM assertions plus 18/18 in the updated unit test file, all passed.

---

### Post-plan addendum: Task 14 — nested summary tree (base_dmg / sorceries / weapons / hit-type / status)

User follow-up, sketched as a small YAML mockup: instead of a flat
Conditional Effects list, nest each specific effect under its category or
group so the multiplication chain reads naturally — e.g. `sorceries: {dmg:
1.1, carian: 1.25 * 1.1 * 1.12}`. Confirmed with the user this should
generalize to *every* conditional effect, not just Sorcery/Incantation:
Weapons, Hit-Type Bonuses (crit/guard-counter/initial-attack), and
Situational Effects (timing windows, vs-enemy-status, curses) each get
their own named subgroup.

`effect_multipliers.mjs` gained a `group` field (`'weapon' | 'hitType' |
'status'`) on every conditional entry that lacks a `category` — mutually
exclusive with `category`, validated by the schema test.
`computeBuildTotals` replaced its flat `conditional` array with a
`conditionalTree` nested by `bucket -> (category ?? group)`, and
`combinedFor` now returns `{ combined, factors }` — a list of `{kind:
'axis'|'category'|'resource'|'self', key?, value}` — so the renderer can
show the full transparent multiplication chain (e.g. "Magic ×1.12 ×
Sorcery ×1.1 × Improved Carian Sword Sorcery ×1.574 = ×1.939") instead of
one opaque combined number. `renderBuildSummary` was rewritten around a new
`renderBuildSubgroup` helper.

**Real bug caught during verification, unrelated to the design itself**: the
`group` field never reached the live app. Editing `effect_multipliers.mjs`
alone doesn't touch `data/relic_data.json` / `data/don_relic_data.json` or
`index.html`'s embedded `DATA`/`DON_DATA` — those needed `prepare_data.mjs`
+ `prepare_don_data.mjs` re-run and the embed script re-applied, which was
skipped. Every group-only (no category) conditional entry silently landed
in neither bucket and vanished from the tree until this was caught by a
live jsdom test showing "No effects selected yet" despite real selections.
Added a permanent regression test in `tests/effect_multipliers.test.mjs`
that diffs `EFFECT_MULTIPLIERS` against what's actually baked into both
JSON files, specifically so a future "forgot to re-run the pipeline"
mistake fails loudly instead of silently.

Verified end-to-end with fresh `jsdom` instances against the served app:
the user's second URL now renders `Sorcery: {Sorcery ×1.1, Improved Carian
Sword Sorcery ×4 — ×1.12 each → Magic ×1.12 × Sorcery ×1.1 × Improved
Carian Sword Sorcery ×1.574 = ×1.939}` nested correctly; a separate
Weapons/Hit-Type/Situational scenario (Katana + Critical Hits + a
frostbite-target effect on 3 different relics) produced exactly the 3
expected subgroups with no cross-leakage. 13 live-DOM assertions plus
24/24 in the updated `tests/build.test.mjs` and 1423/1423 in
`tests/effect_multipliers.test.mjs`, all passed.

---

### Post-plan addendum: Task 15 — situational effects nest under every affected total, not just their own line

Two rounds of user follow-up on a real scenario: they selected the "Lower
Attack When Below Max HP" curse (a universal-axis, -8.5% damage debuff) and
wanted to see its effect propagate through the whole view rather than sit
as one isolated line disconnected from the real per-element totals. Round
1 asked for it nested under each active elemental baseline ("what's my
Physical damage while also below 85% HP"). Round 2 generalized: it should
also nest under specific conditional entries like Carian Sword Sorcery,
not only the base axis rows — since the curse applies on top of any hit,
including a Carian Sword cast made while below 85% HP.

`computeBuildTotals` gained two mechanisms, both keyed off the same
`damageUniversalOnly` list (conditional entries whose `axes` is exactly
`['universal']`, i.e. apply regardless of damage type — no self- or
cross-universal-only nesting, to avoid combinatorial pairs):
1. `damageAxisNested` / `negationAxisNested` — for each baseline axis that's
   actually non-1, a nested branch per universal-only entry, value =
   `axisBaseline × entry.combined` (entry.combined already folds in the
   universal baseline, so this is a single multiply, not double-counting).
2. `nestedWithUniversal` attached directly to every OTHER conditional entry
   (sorcery/incantation/weapon/hitType/status alike), value =
   `entry.combined × universalEntry.combined`.

Rendering: `renderBuildAxisRows` now takes the nested map and renders a
`.build-axis-nested` sub-row per baseline axis; `renderConditionalRow` does
the same for `c.nestedWithUniversal`, using the same CSS class so both
levels read consistently.

Verified end-to-end against the user's exact URL with a fresh `jsdom`
instance: Physical (×1.12) and Magic (×1.065) baselines both show "Lower
Attack When Below Max HP → ×1.025" / "→ ×0.974" nested underneath; Carian
Sword Sorcery and Improved Bestial Incantations each show the same curse
nested under their own combined figure; the curse's own line correctly
shows zero self-nested rows. One test-authoring bug surfaced during
verification (a loose text-match selector picked up the curse's *name*
appearing inside another row's nested reference rather than its own row)
and was fixed in the test, not the product — the underlying HTML was
already correct. 7 live-DOM assertions plus 34/34 in the updated
`tests/build.test.mjs`, all passed.

---

### Post-plan addendum: Task 16 — "Damage" section renamed to "Attack Power"

User request: the game consistently calls this stat "Attack Power" (e.g.
every effect name is "X Attack Power Up") — the summary's "Damage" section
title should match. Updated `build_damage_title`'s English fallback and the
JP/KR translations (攻撃力 / 공격력, matching how "Attack Power" is already
translated throughout the rest of the app's effect names) — plus the
in-app methodology note and README prose. "Damage Negation" was left
unchanged since that phrase matches real in-game effect names (e.g. "Fire
Damage Negation Up"). Internal identifiers (`build_damage_title` i18n key,
`damageBaseline`/`dmgTree` JS variable names) are unchanged since they're
implementation detail. Verified across EN/JP/KR with a live jsdom instance
that clicking into the mode renders the new title and the old "Damage"
string is gone in all three languages.

### Post-plan addendum: Task 17 — Resource/Recovery no longer blends unrelated stats

User-caught, real design flaw: a build with only "Reduced FP Consumption"
selected showed "Resource / Recovery: Combined ×0.92" — a bare, unlabeled
number. Worse, the underlying model was wrong even when several resource
effects were selected together: FP consumption, skill cooldown, ultimate
gauge gain, max HP/FP/stamina, and flask healing are genuinely different
units, and multiplying them into one blended "Combined" figure produces a
meaningless number (a 0.92× FP-consumption reduction times a 1.1× max-HP
bonus isn't any real quantity).

Fix mirrors how Damage/Negation are already split per elemental axis:
`effect_multipliers.mjs` gained a required `stat` field
(`'cooldown' | 'ultimateCharge' | 'fpConsumption' | 'maxHP' | 'maxFP' |
'maxStamina' | 'flaskHeal'`) on every resource-bucket entry, validated by
the schema test. `computeBuildTotals`'s `resourceBaseline` changed from a
single scalar to an object keyed by stat (exactly like `damageBaseline`/
`negationBaseline` are keyed by axis); the one resource conditional entry
("Near Death Reduces Max HP") now only folds in its own stat's baseline
as a factor, never an unrelated one. The UI renders one labeled row per
active stat (e.g. "FP Consumption ×0.92") instead of a single anonymous
"Combined" line; the now-dead `build_resource_combined` i18n key was
removed and seven new per-stat labels added (JP/KR included).

Required re-running `prepare_data.mjs` / `prepare_don_data.mjs` and the
embed step (the lesson from Task 14's addendum applied correctly this
time — verified the `stat` field actually reached `index.html`'s embedded
data before testing further). Verified against the user's exact URL with
a fresh `jsdom` instance: Resource / Recovery now shows "FP Consumption
×0.92" with no bare "Combined" label anywhere in the summary. Added two
permanent regression tests in `tests/build.test.mjs` (one general
stat-isolation case, one for the conditional-resource-entry factor leak).
3 live-DOM assertions plus 39/39 in the updated `tests/build.test.mjs`
and 1455/1455 in `tests/effect_multipliers.test.mjs`, all passed.

### Post-plan addendum: Task 18 — suppress the redundant "combined" line when there's no baseline

User-caught clutter: a conditional entry with nothing else selected on its
axis/category (e.g. "Attack power up when facing poison-afflicted enemy"
with no other Physical/universal baseline active) rendered its combined
breakdown line as a verbatim repeat of the line above it — `factors` in
that case is just the effect's own "self" factor, so `breakdown = value`
and `combined = value`, producing two identical-looking lines.

`renderConditionalRow` now only emits the `.build-conditional-combined`
line when `c.factors.length > 1` (i.e. there's a real baseline/category
factor beyond the effect's own value). Verified against the user's exact
URL: the poison-afflicted and Madness-in-Vicinity rows (both isolated,
nothing to combine with) now show no combined line at all, while a
control case (Katana bonus + a real Physical baseline) still shows its
breakdown correctly. computeBuildTotals itself is unchanged — this was a
pure rendering fix. 8 live-DOM assertions across two scenarios, all
passed; no regression in the existing 39/39 `tests/build.test.mjs` suite
(the calc engine's `factors` output was already correct — only its
unconditional rendering was the bug).

### Post-plan addendum: Task 19 — "Situational Effects" renamed to "Actions"; Resource/Recovery merged into "Other Effects"

Two more small user-requested adjustments. First, renamed the `status`
group's display label from "Situational Effects" to "Actions" (English
fallback + JP 行動 / KR 행동) — purely cosmetic, the internal `'status'`
group key is unchanged.

Second: Resource/Recovery and Other Effects were merged into a single
"Other Effects" block. `renderBuildOther` was split into
`renderBuildOtherList` (just the flat unmapped-effect `<ul>`, no longer
wrapping its own section) and `renderBuildSummary` now concatenates the
resource stat rows + resource-conditional subgroup + the flat other-list
under one shared "Other Effects" title, hiding the whole block only when
all three are empty. The now-dead `build_resource_title` i18n key was
removed from both locale files (JP/KR); the methodology note and README
were reworded to describe two multiplier sections (Attack Power, Damage
Negation) plus resource stats and unclassified effects folded into Other
Effects, with matching JP/KR translation updates.

`computeBuildTotals` is completely unchanged — this was a pure rendering
merge. Verified with two live jsdom scenarios: a build with both a
resource baseline (Reduced FP Consumption) and an unmapped effect
(Improved Damage Negation at Low HP) renders exactly 3 sections total
(Attack Power, Damage Negation, Other Effects) with both pieces of
content inside the merged block; a build with nothing resource- or
other-related renders no "Other Effects" section at all. 7 live-DOM
assertions across both scenarios, plus 20/39/1455 unchanged across the
three existing test suites (as expected, since the calc engine wasn't
touched).

### Post-plan addendum: Task 20 — sub-labels inside the merged "Other Effects" block

User follow-up on Task 19's merge, with a real URL exposing the problem:
the merged block silently mixed two visual formats with no explanation —
numeric rows with a `×value` (FP Consumption, Max HP — mapped in
`effect_multipliers.mjs`) sitting directly above a plain bullet list with
no numbers at all (flat/flavor effects like "All Resistances Down",
"Continuous HP Loss" — genuinely unmapped, since they're flat stat
changes with no clean multiplier). Without any heading, it read as an
inconsistent bug rather than two intentionally different categories.

Added two sub-labels using the same `.build-subgroup`/`.build-subgroup-title`
pattern already used for Attack Power's Sorcery/Weapons/Actions
subgroups: "Resource" above the numeric stat rows + any resource Actions
subgroup, and "No Computed Multiplier" above the flat unclassified list —
new i18n keys `build_resource_label` / `build_other_unclassified_label`
(JP: リソース / 倍率計算不可, KR: 자원 / 배율 계산 불가). `renderBuildOtherList`
now wraps its own `<ul>` in a labeled subgroup instead of a bare list.
computeBuildTotals is unchanged — purely a rendering clarity fix.

Verified against the user's exact URL with a fresh `jsdom` instance: the
Other Effects section now shows "Resource" above the FP Consumption/Max
HP rows and "No Computed Multiplier" above the three flat-effect bullets,
in that order. 4 live-DOM assertions, no regression in the existing
20/39/1455 test suites.

### Post-plan addendum: Task 21 — three more real gaps in the same scenario

Same URL, one more round of user feedback exposed three separate real
issues, not just polish:

1. **Data gap**: `Improved Damage Negation at Low HP` ("Increases damage
   negation by 16% when HP is below 40%") was completely unmapped in both
   `effect_multipliers.mjs` and `descriptions.mjs` — it silently fell into
   the flat Other Effects list instead of Damage Negation's Actions
   subgroup, where every other HP-threshold/timing negation effect
   already lives. Added the mapping (`conditional`, `negation`,
   `axes: ['universal']`, `group: 'status'`, `value: 0.16`) and a
   description. Scanned both source CSVs for any other similarly-missed
   "when HP is..." effects — the only other matches (Poison/Rot Buildup
   When Below Max HP, the "Slowly restore HP..." regen effect) are
   genuinely non-multiplier effects (flat buildup infliction, HP/s regen)
   and correctly stay unmapped.
2. **Missing descriptions**: the flat "No Computed Multiplier" list showed
   bare effect names with zero explanation of what they actually do (e.g.
   "All Resistances Down" with no indication it's −80 resistances). `desc`
   is now threaded through `getBuildEffects()` → `computeBuildTotals`'s
   `otherByName` map → rendered as "Name — description" using the same
   `I18N.effectDesc()` helper used everywhere else in the app.
3. **Opaque sub-labels**: "Resource" and "No Computed Multiplier" read as
   unexplained jargon on their own. Renamed "Resource" → "Resource Stats"
   and added a one-line italic caption under the "Other Effects" title
   ("Effects that don't combine into the Attack Power / Damage Negation
   totals above") — JP/KR translations included, new `build_other_caption`
   i18n key, new `.build-summary-caption` CSS class.

Required re-running `prepare_data.mjs`/`prepare_don_data.mjs` and the
embed step (both `descriptions.mjs` and `effect_multipliers.mjs` changed).
Verified against the user's exact URL with a fresh `jsdom` instance:
Improved Damage Negation at Low HP now appears inside the Damage Negation
section (nested under the Physical baseline too, as any universal-axis
conditional should) and is gone from Other Effects; "All Resistances
Down" and "Continuous HP Loss" now show their real descriptions; the
caption and "Resource Stats" label both render. 7 live-DOM assertions,
plus two new permanent regression tests (one in
`tests/effect_multipliers.test.mjs` for the mapping, one in
`tests/build.test.mjs` for the `desc` passthrough) — 20/40/1466 across
the three test suites, all passed.

### Post-plan addendum: Task 22 — reverted the caption and Resource grouping; unified curse styling

Immediate user follow-up on Task 21's own additions — three corrections:

1. Removed the "Effects that don't combine into..." caption sentence
   entirely (and its now-dead `build_other_caption` i18n key / CSS class).
2. Un-nested the "Resource Stats" subgroup wrapper added in Task 21 —
   resource stat rows (FP Consumption, Max HP, etc.) are flat rows
   directly under "Other Effects" again, exactly like Physical/Magic
   axis rows sit directly under Attack Power with no umbrella label.
   Removed the now-dead `build_resource_label` i18n key.
3. Unmapped/flat effects ("All Resistances Down", "Continuous HP Loss")
   previously rendered as a plain `<ul><li>` bullet list, visually
   inconsistent with every other effect in the summary. `renderBuildOtherList`
   now reuses the same `.build-conditional-item` box structure as
   `renderConditionalRow` (name line + a secondary detail line) — new
   `.build-other-desc` CSS class holds the description in a muted color
   distinct from the gold `.build-conditional-combined` class, since it's
   informational text, not a computed multiplier.

Verified against the same user URL with a fresh `jsdom` instance: caption
gone, FP Consumption/Max HP render as flat rows with no "Resource Stats"
wrapper, and the two flat curses render as `.build-conditional-item`
boxes with their description in `.build-other-desc`. 7 live-DOM
assertions, no regression in the existing 20/40/1466 test suites (this
was a pure rendering change — computeBuildTotals untouched).

### Post-plan addendum: Task 23 — a new `flat` (additive) tier for stackable curses

Same URL, one more round: the user asked what should happen when the same
flat/unmapped curse (e.g. "All Resistances Down") sits on two different
relics at once — since these genuinely SUM in-game (two copies of −80
resistances = −160), not multiply like every other tier in this system.
Asked to clarify scope before building (recompute the real combined value
vs. just presentational grouping); user chose "compute and show the real
combined value."

Added a new `tier: 'flat'` to `effect_multipliers.mjs` — additive, not
multiplicative. Each entry has `value` (the signed numeric delta) and
`template` (the description with `{v}` standing in for the — possibly
summed — value). `computeBuildTotals` gained a `flatByName` map that sums
`value` across duplicates (unlike every other merge path, which combines
via count + a power/product) and regenerates the description from the
template using the summed total. Mapped 13 curses this way: the two from
the reported scenario (All Resistances Down, Continuous HP Loss), 4
stat-drain curses (Reduced Dexterity/Faith/Intelligence/Strength pairs),
7 "Taking Damage Causes X Buildup" curses, and 2 HP-gated buildup curses
(Poison/Rot Buildup When Below Max HP, kept their `condition` as
informational-only display text — it doesn't affect merging). Two curses
with more than one distinct number in their description (Reduced Vigor
and Arcane: −3 stats AND −60 HP; Repeated Evasions Lower Damage
Negation: two-stage −23%/−35%) were intentionally left unmapped rather
than guessing which number to combine.

Also caught in the same pass: "Reduced Rune Acquisition" (0.9× rune gain)
is a genuine percentage multiplier, not a flat effect — it was only
unmapped because no resource-stat slot existed for rune gain yet. Added
a `runeGain` slot to the existing multiplicative resource-stat system
(alongside cooldown/FP/max-HP/etc.) rather than the new additive one,
since it's the right fit.

New `renderBuildFlatList` renders merged flat entries in their own "Flat
Effects" subgroup (JP: 固定効果, KR: 고정 효과), same `.build-conditional-item`
box style as everything else, showing the `×N` count and the recomputed
description. Verified with two scenarios against a fresh `jsdom` instance:
the same curse on 2 different DON relics shows "All Resistances Down ×2
— −160 all status resistances" (the real combined value); the original
full user URL (each flat curse used only once) still shows the unchanged
per-copy value with no stray `×2`, and Improved Damage Negation at Low HP
remains correctly nested in Damage Negation. 9 live-DOM assertions across
both scenarios, plus 47/1777 in the two updated unit test suites
(including new tests for cross-name isolation and positive-value
formatting), all passed.

### Post-plan addendum: Task 24 — flat effects render as plain rows, no subgroup

Immediate user follow-up on Task 23: the "Flat Effects" subgroup (added
in that same commit) was unwanted — user wanted resource stats and flat
effects listed in one flat sequence, each row formatted exactly like a
resource-stat row (`Name → value`, no box, no two-line layout, no
subgroup wrapper). `renderBuildFlatList` was simplified to emit plain
`.build-axis-row` divs (same class already used for Physical/Magic/FP
Consumption/etc.) instead of `.build-conditional-item` boxes inside a
labeled subgroup; the now-dead `build_flat_label` i18n key was removed
from both locale files. `computeBuildTotals` is unchanged.

Verified against the user's exact URL with a fresh `jsdom` instance: five
sequential flat rows in the exact requested order (FP Consumption, Max
HP, Rune Gain, All Resistances Down, Continuous HP Loss), no subgroup
title, no conditional-item boxes — matching the user's literal mockup.
As a side confirmation, the same run also showed a real duplicate
("Improved Damage Negation at Low HP" selected on two different regular
relics) correctly merging into one `×2` entry, nested under all five
elemental Damage Negation baselines. 8 live-DOM assertions, no regression
in the existing 20/47/1777 test suites (pure rendering simplification).

### Post-plan addendum: Task 25 — curse-dropdown fixes (v3 only)

Two related user requests about the per-slot curse `<select>` in Effect
Multipliers mode:

1. Remove "Any curse" from the v3 dropdown — it's a leftover from the
   v1/v2 probability-filter curse dropdown (`buildCurseOptions`, unrelated
   and untouched) where "any" is a meaningful filter state. In build mode
   you're recording the ONE specific curse actually on your relic, so
   "any" never made sense. `buildCurseOptionsFor` (the v3-only builder)
   now uses a neutral "— select curse —" placeholder, matching the
   existing group/effect placeholder style. New `select_curse_placeholder`
   i18n key (JP/KR included).
2. Prevent picking the same curse twice on one relic (a real relic can
   only carry each curse once). `buildCurseOptionsFor` gained a
   `usedIndices` parameter (mirroring `buildOptionsForGroups`'s existing
   group-exclusion pattern) that hides curses already chosen on a sibling
   slot of the same panel, unless it's that slot's own current value.
   `createRelicPanel` gained `usedCurseIndices()` / `refreshCurseDropdowns()`
   helpers, wired into the curse-select's own `change` handler, the
   group/effect visibility-recompute path (so switching to a non-cursed
   effect frees the curse back up), and the remove-row handler (so
   deleting a slot frees its curse for the remaining slots).

Verified with a fresh `jsdom` instance: the v3 dropdown no longer offers
"Any curse" (shows the new placeholder instead); picking a curse on one
slot removes it from a sibling slot's options on the same relic; removing
the slot that held a curse releases it back into the sibling's option
list; the v1/v2 curse *filter* (a different, unrelated dropdown) still
shows "Any curse" untouched. 6 live-DOM assertions across two test files,
no regression in the existing 20/47/1777 test suites (calc engine
untouched — this was UI-only).

### Post-plan addendum: Task 26 — curses encoded by stable id, not name, in share links

User-caught inconsistency: regular/DON relic effects have always used
their stable game-data `id` in share-link URLs (`effectKeyFor`/
`findEffectByKey`), but curses used their English name text instead —
the one exception to an otherwise-consistent scheme, across all three
modes (v1's `slot{n}c`, v2's `curse` filter param, v3's `d{relic}c{slot}`).

Curses actually have a stable id available — table 3000000's effect id,
already read into `eid` inside `prepare_don_data.mjs`'s curse-building
loop, just never attached to the curse object the way regular effects'
`id` field already is. Added `id: eid` there, regenerated
`data/don_relic_data.json`, re-embedded. `findCurseIndexByName` became
`findCurseIndexById` (matches by id, with a name-match fallback so any
share link generated before this change — including the exact style of
URL the user had been pasting all session — still restores correctly).
All three encode sites (`sp.append('curse', ...)`, `sp.set('slot'+n+'c',
...)`, `sp.set(\`${prefix}${relicNum}c${slotNum}\`, ...)`) now write
`.id` instead of `.name`.

Verified with a fresh `jsdom` instance across all three modes: a v3 URL
built from the user's exact old-style (name-based) params still resolves
its curses correctly (backward-compat fallback), and the freshly
regenerated share link for the same build now encodes curses as numeric
ids; round-tripping that new-style URL restores correctly; v1's
`slot1c` and v2's curse-filter `curse` params both now emit numeric ids
too. 8 live-DOM assertions, plus two new permanent regression checks in
`tests/effect_multipliers.test.mjs` (every curse has an id; ids are
unique) — 20/47/1779 across the three test suites, all passed.

### Post-plan addendum: Task 27 — cursed-effect ⚠ marker in v3's effect dropdown

Small parity fix: v1 (Exact Effects) and v2 (Multiple Choice) both mark a
cursed DON effect with a `⚠` suffix in its dropdown option/checkbox label
(`e.hasCurse ? ' ⚠' : ''`), but v3's `buildEffectOptionsForGroups` never
did. Added the identical marker — since regular-pool effects never carry
`hasCurse` at all, no `mode === 'don'` guard is needed (unlike v1/v2's
version of this check, which is redundant for the same reason but kept
as-is since it wasn't part of this fix).

Verified with a fresh `jsdom` instance: a cursed DON effect's option now
shows `⚠`, an uncursed DON effect's option doesn't, and no regular-relic
effect ever shows the marker (sanity check, since regular effects have no
curse concept at all). 5 live-DOM assertions, no regression in the
existing 20/47/1779 test suites (no data pipeline changes needed for
this one).

### Post-plan addendum: Task 28 — audited "No Computed Multiplier" before renaming to "Non Stackable"

User request: rename the bucket to "Non Stackable" *and verify everything
in it actually is*. Rather than rename blind, used the source spreadsheet's
unused "Stackable with self?" column (flagged in project memory as an
open item since the original Issue #1 data audit) as ground truth, cross-
referencing all ~317 currently-unmapped effect names against it.

Found real problems: several confirmed-stackable, clean-numeric effects
were sitting in the bucket, which would have made "Non Stackable" a false
claim if renamed as-is — Vigor/Mind/Endurance +1/2/3 (clean HP/FP/Stamina
conversions already in `descriptions.mjs`), the 7-status × 2-tier
resistance family (+75/+110, confirmed "Yes"), Poise +1/2/3 (a genuine
0.95/0.9/0.85 multiplier), and "Increased rune acquisition for self and
allies" (1.035× rune gain, just missing a resource-stat slot). Also found
two multi-value curses (Reduced Vigor and Arcane: two different numbers;
Repeated Evasions Lower Damage Negation: two-stage %) that were previously
left unmapped as "too complex" — asked the user how to handle these rather
than guess; they wanted them actually computed, not exception-listed.

Two rounds of `AskUserQuestion` resolved the judgment calls: (1) Poise
gets real tracking, reversing the original design spec's explicit
poise-tracking non-goal — added `poiseDamageTaken` as a new multiplicative
resource stat, same pattern as `fpConsumption`/`cooldown`/etc. (2) The raw
base stats (Strength/Dexterity/Intelligence/Faith/Arcane) should sum with
themselves as plain point totals — user pointed out there's no reason they
can't, since the `flat` tier doesn't require an HP-style unit conversion,
just a number and a template.

This required a genuine data-model extension: the existing `flat` tier
only merged duplicates of the exact same effect NAME. But "Vigor +1" (a
relic effect) and "Reduced Vigor and Arcane" (a curse) both need to feed
the SAME running Vigor total despite having different names — merging by
name can't express that. Added a second `flat` shape,
`{ pools: [{pool, value}, ...] }`, merged by POOL KEY instead of name; one
entry can list 2+ parts (Reduced Vigor and Arcane touches both `vigor` and
`arcane`). `computeBuildTotals` gained a parallel `flatByPool` accumulator
alongside the existing `flatByName` one. Display labels for pools moved
into the renderer (`BUILD_FLAT_POOL_LABELS`, i18n-wrapped) rather than
`computeBuildTotals` itself, preserving the existing convention that the
calc engine never touches I18N — caught and fixed mid-implementation when
the pool label was accidentally being double-translated.

Vigor/Mind/Endurance pools are tracked in their derived resource units
(Max HP/FP/Stamina, matching the spreadsheet's own conversion — "Reduced
Vigor and Arcane"'s −3 Vigor contributes −60 to the SAME pool as "Vigor
+1"'s +20, both in HP terms); Strength/Dexterity/Intelligence/Faith/Arcane
have no such conversion in the source data, so those pools track raw stat
points instead. The 4 existing dual-stat-drain curses (Reduced Dexterity
and Faith, etc.) were converted from single combined-template flat entries
to 2-part pool entries for the same cross-name-merging reason. "Repeated
Evasions Lower Damage Negation" became a proper conditional negation
Action (tracked at its escalated −35% worst case, per the user's explicit
request to treat it like every other timing-window negation curse).

Verified with fresh `jsdom` instances: the bucket now reads "Non
Stackable" (EN/JP/KR); the two effects from the user's original URL
(guard-based damage boost, guard-aggro effect — both confirmed
non-stackable) correctly remain in it; "Vigor +1" + "Reduced Vigor and
Arcane" picked together merge into one row showing "−40 Max HP" (the real
combined value, not two disconnected numbers); Poise +1 now shows as a
proper "Poise Damage Taken ×0.95" resource row instead of sitting
unmapped. 17 live-DOM assertions across three scenarios plus full JP/KR
translation checks, plus two new permanent regression tests in
`tests/effect_multipliers.test.mjs` and 5 new ones in
`tests/build.test.mjs` covering the pool-merge mechanism specifically —
20/52/2346 across the three test suites, all passed.

### Post-plan addendum: Task 29 — fixed a Universal-baseline double-counting bug

User-reported "weird result" while selecting `Improved Attack Power with
3+ [Weapon Type] Equipped` alongside a school-specific incantation bonus
and a frostbite curse — investigating led to a genuine two-part
conversation (not just a bug report): first clarifying that "Universal"
is structurally a baseline damage-type row like Physical/Magic/Fire/
Lightning/Holy (proposed folding it into each element the way Affinity
already does), then the user pushed back that they want to see BOTH the
separate baseline breakdown AND a combined total — same as spell schools
already show — and provided a second, more detailed example that exposed
an actual correctness bug underneath the display question.

Root cause, confirmed by hand-computing the exact numbers from the user's
pasted HTML: `attachUniversalNesting` (added in Task 23, "nest situational
effects under every affected total") computed a specific conditional
entry's nesting under ANOTHER universal-only conditional as
`entry.combined * u.combined` — but `u.combined` already folds in the
shared universal baseline as one of its own factors, and so does
`entry.combined`, so multiplying the two together SQUARES the universal
baseline instead of applying it once (e.g. "Improved Giants' Flame
Incantations" nested with a frostbite curse showed ×2.186 instead of the
correct ×1.656). Task 23's original test for this exact code path
happened to have no active universal baseline in its scenario, so
`u.combined === u.value` there and the bug was invisible — a coincidence,
not a real pass.

Fix: `entry.combined * Math.pow(u.value, u.count)` — multiply by u's own
raw self-multiplier (raised to its duplicate count), never its full
combined figure, matching how `damageAxisNested` (the other nesting path)
already avoided this by using the raw baseline value on one side.
Strengthened the misleading Task-23 test (relabeled to clarify it
couldn't distinguish the two formulas) and added a dedicated regression
test with an active universal baseline specifically designed to tell the
buggy and correct formulas apart — verified by temporarily reverting the
fix and confirming the new test fails (2/2 assertions) before restoring
it. Verified live against a reconstructed version of the user's scenario
with a fresh `jsdom` instance: the nested combined value now reads ×1.656,
matching the correct from-scratch computation. The Universal-display
design conversation itself remains open ("lets think") — this addendum
covers only the confirmed math bug it surfaced, not a resolution to the
sizing/labeling question. 4 live-DOM assertions, 2 new permanent
regression tests, 20/54/2346 across the three test suites.

### Post-plan addendum: Task 30 — resolved the Universal-display design
question by reclassifying the "3+ weapon type equipped" bonus as
conditional, and renamed "Universal" to "All Damage"

Resumed the "lets think" design conversation from Task 29. Two options
were sketched (fold Universal directly into each element like Affinity,
vs. keep it a separate row with a "combined with X" nested line under
each element) and the user picked the second, then added a decisive
correction: the ACTUAL problem wasn't display layout, it was
classification. "Improved Attack Power with 3+ [Weapon Type] Equipped"
was the ONLY entry in `effect_multipliers.mjs` using `tier: 'baseline',
axes: ['universal']` — every other universal-axis entry (frostbite,
guard counters, sleep procs, etc.) was already `tier: 'conditional'` with
a `condition` string. Being silently folded into an always-on baseline
made the effect's real trigger requirement (3+ of that weapon type
actually equipped) invisible, and gave it no name/condition label
anywhere in the UI — that's what "unclear where this multiplier comes
from" and "make sure it's specified that this only works with that
condition" were actually pointing at.

Fix: reclassified all 23 weapon-type "3+ Equipped" entries in
`effect_multipliers.mjs` from `{ tier: 'baseline', bucket: 'damage',
axes: ['universal'], value }` to `{ tier: 'conditional', bucket:
'damage', axes: ['universal'], group: 'weapon', value, condition: '3+
${plural} Equipped' }` — matching the single-weapon variant's shape one
group over. No `computeBuildTotals` engine changes were needed: the
universal-only conditional nesting machinery (`nestUniversalOnly` /
`damageAxisNested`, `attachUniversalNesting` / `nestedWithUniversal`,
both exercised and fixed in Task 29) already does exactly what's wanted
for a conditional universal-axis entry — nest it under every active
elemental baseline row AND under every other conditional entry, each
time showing the full multiplication chain. The entry just needed to
actually BE conditional to enter that path instead of being silently
pre-multiplied into `damageBaseline.universal` with no visible name or
condition. Also renamed the `build_axis_universal` label from "Universal"
to "All Damage" (jp: 全ダメージ, kr: 전체 피해) per the user's request —
though with this reclassification, no current effect populates that
baseline slot anymore, so the row itself won't currently render; the
rename is future-proofing for if a genuinely always-on universal-damage
effect is ever added.

Regenerated `data/relic_data.json` and `data/don_relic_data.json` via
`prepare_data.mjs`/`prepare_don_data.mjs` (confirmed via diff: only the
23 weapon-group entries changed, `tier`/`group`/`condition` fields only)
and re-embedded `DATA`/`DON_DATA` into `index.html`. Updated
`tests/effect_multipliers.test.mjs`'s katana-3+ check to assert
`conditional`/`group: 'weapon'`/`condition` instead of `baseline`.
Rewrote the corresponding `tests/build.test.mjs` block (previously a
synthetic `tier: 'baseline'` mock) to use the real new classification,
adding assertions for: no more always-on universal baseline from this
effect, the condition text survives into the conditional-tree row, the
row's own `combined` is just its self-value (no baseline to fold in), the
Physical baseline row nests a "combined with 3+ Katana" line, and the
single-weapon Katana entry's `nestedWithUniversal` also picks it up.
Relabeled Task 29's synthetic double-counting regression test (which used
a hand-rolled `tier: 'baseline'` universal mock representing "a real 3+
weapon type equipped effect") to stop implying that's still real —
renamed the mock effect to "Hypothetical Universal Baseline Buff" and
clarified in the comment that the engine still supports the tier
generically even though no current real effect uses it. Verified live
with a fresh `jsdom` instance reconstructing Fire Attack Power Up +4 +
Improved Attack Power with 3+ Daggers Equipped: the Fire baseline row now
renders a nested "Improved Attack Power with 3+ Daggers Equipped (3+
Daggers Equipped) → ×1.344" line, and the Weapons subgroup shows
"Improved Attack Power with 3+ Daggers Equipped — ×1.2 (3+ Daggers
Equipped)" — both the isolated multiplier and its trigger condition are
now visible, and it correctly combines into the real per-element total
via the existing nesting display. 20/57/2394 across the three test
suites, all passing.

### Post-plan addendum: Task 31 — added kill-count selectors for Evergaol /
Night Invader attack-power bonuses, and closed the resulting baseline
Universal display gap

User request: "Attack power increased for each evergaol prisoner
defeated" (1.05x per kill) and "...each Night Invader defeated" (1.07x
per kill) were completely unmapped in `effect_multipliers.mjs` — real
percent-per-kill multipliers that fell into the flat "Non Stackable"
bucket with no numeric contribution at all. Unlike every other
multiplicative effect, their real "count" is a run-progress number the
player tracks themselves (bosses/invaders actually cleared), not how many
relics/slots carry the effect — so they needed a dedicated count input
rather than the existing duplicate-selection-derived count. Asked the
user for the real in-game caps to bound the selector: confirmed 7
Evergaols, 4 Night Invaders. The user's other suggestion — a toggle for
the "3+ weapon types" bonus — turned out already covered by Task 30's
fix (selecting the relic effect from its dropdown already IS the on/off
toggle); confirmed with the user and made no change there.

Classification: both effects added as `{ tier: 'baseline', bucket:
'damage', axes: ['universal'], value, variableCount: true, maxCount }` —
genuinely baseline (permanent for the rest of the run once triggered),
unlike Task 30's reclassified weapon bonus. Documented the new
`variableCount`/`maxCount` fields in the file's header comment and added
schema validation + spot-checks in `tests/effect_multipliers.test.mjs`.

Engine: zero changes to `computeBuildTotals`. A baseline-tier entry
already multiplies its value into the running baseline once per
occurrence in the effects array — so the UI just pushes the SAME effect
into that array `count` times (once per kill), and `value^count` falls
out for free, the same mechanism that already handles two relics with
the same baseline effect selected.

UI (`createRelicPanel`'s `addRow()`): added a `count-row`/`count-select`
per slot, built once and toggled visible via `updateCountRowVisibility()`
— mirrors `updateCurseRowVisibility()` exactly, wired into both the
group-select and effect-select `change` handlers. Options are rebuilt
0..maxCount only when the slot's effect actually changes (tracked via a
`data-effect-name` attribute), so switching away and back doesn't reset
a count the player already set. `getBuildEffects()` reads the selected
count and pushes the effect that many times (0 if unset/zero — the row
contributes nothing rather than crashing). Share-link round-trip: added
an `n` URL param (`${prefix}${relicNum}n${slotNum}`) alongside the
existing `s` (slot) and `c` (curse) params in `buildShareURL()`, threaded
through `restoreFromURL()`'s return shape (regular panels gained a
`counts` array, matching how DON panels already carry `curses`) and
`applyRestoredBuildPanel()` (new `countKeys` parameter, gated by the
same `effect.mul.variableCount` check used on first selection).

Second-order fix this surfaced: since Evergaol/Night Invader are the
FIRST real always-on baseline-tier Universal effects (Task 30 correctly
moved the only prior example, the weapon bonus, to conditional), the
original "Universal sits as an isolated, unexplained number" display gap
from the Task 29/30 design conversation was suddenly real again — Fire
×1.065 and All Damage ×1.158 would've rendered as two disconnected
numbers with no visible combined total. Fixed in `renderBuildAxisRows`
(render-layer only, no `computeBuildTotals` duplication needed): every
non-universal axis row now gets an extra nested line combining it with
the baseline Universal value whenever the latter is active — "Fire
×1.065 → All Damage ×1.158 → ×1.233" — using the exact same
`build-axis-nested` row style already used for named conditional
nesting, just unconditioned (no name/condition text, since a baseline
source has neither). Conditional entries needed no equivalent fix:
`combinedFor` already folds `damageBaseline.universal` into every
conditional entry's own `combined` figure and factor-breakdown line, so
e.g. Carian Sword Sorcery already correctly shows the Universal baseline
as one of its multiplied factors.

Regenerated `data/relic_data.json` (Evergaol/Night Invader are
regular-pool-only, `don_relic_data.json` unchanged) and re-embedded.
Added 2 new `tests/build.test.mjs` cases for the push-N-times mechanism
using the real values (1.05³, 1.07⁴ at the real max). Verified live with
`jsdom`, driving actual DOM interactions (not eval) — selected the
Evergaol effect in relic 1, confirmed the count-row appeared with options
0–7 defaulting to 1, set it to 3, added Fire Attack Power Up +2 in relic
2, and read the real rendered summary HTML: `Fire ×1.065` → nested `All
Damage ×1.158 → ×1.233`, plus the standalone `All Damage ×1.158` row, and
the share URL `r1s1=7060000&r1n1=3&r2s1=7001602`. Then loaded that exact
URL fresh and confirmed the restore reconstructs identical state
(group/effect/count all round-trip, rendered HTML byte-identical).
Added `build_count_label` ("Count:" / 回数： / 횟수:) to both locales.
20/62/2587 across the three test suites, all passing.

### Post-plan addendum: Task 32 — full Attack Power / Damage Negation
redesign: Inventory + Totals sections, replacing the old inline nesting

User provided a concrete YAML mockup (`ui.yaml`, kept untracked — their own
working file) proposing a structural redesign: show each category's raw
composition first (which selected effects fed it, and their individual
values — "night_invaders: 1.07 * 1.07 * 1.07", not one flattened number),
then a SEPARATE "Totals" block with the real grand-total per axis/category,
where situational effects (crit, guard counter, vs-status-afflicted enemy,
3+ weapon type equipped) are OFF by default and toggled on via checkbox so
the player can explore a maximum-multiplier scenario without every proc
being silently assumed active. Clarified three points before implementing
(all "Recommended" answers): (1) the toggle applies only to genuinely
situational/temporal universal-axis conditionals — spell-school and single-
weapon-hit conditionals stay always-on, since their own total already means
"while doing X"; (2) yes, track individual contributing values per axis/
category rather than one pre-flattened baseline product; (3) yes, un-blend
Evergaol/Night Invader (and any future universal-axis baseline source) back
into separately-named rows in the inventory list, only combining them in
Totals — this reverses part of Task 31's "All Damage" blending, which
turned out to be the wrong call once real per-source distinctness mattered.

**Engine (`computeBuildTotals`, index.html + tests/build.test.mjs,
identical):** Added a second parameter, `enabledSpecialNames` (a Set,
defaults to empty), and `baselineByName` — baseline-tier effects grouped by
name with a count, mirroring how `conditionalByName` already works, purely
so the summary can show sources rather than one flattened product;
`damageBaseline`/`negationBaseline`/`categoryBaseline`/`resourceBaseline`
are untouched and remain the single source of truth for every combined
figure. From `baselineByName`, derived: `damageAxisBreakdown`/
`negationAxisBreakdown` (single-axis-only contributors per axis — the
universal axis's list is exactly Evergaol/Night Invader/etc., each keeping
its own name), `categoryBaselineBreakdown` (sorcery/incantation),
`resourceBreakdown`, and `damageMultiAxisGroups` (baseline entries touching
2+ axes at once, e.g. Improved Affinity Attack Power, grouped by their axes
signature so a shared source doesn't silently vanish into 4 axis rows with
no trace of it). `damageUniversalOnly`/`negationUniversalOnly` (already
existed) are now exactly the "specials" checkbox candidate list.
`specialsMultiplier()` computes purely from each toggled special's own raw
`value`/`count` (never another entry's `.combined`) — structurally
preventing the Task-29 double-counting bug from being reintroduced, since
there's no longer any nesting-of-combined-figures code path at all.
`damageTotals`/`negationTotals`/`categoryTotals` are the real grand-totals:
baseline value × the universal BASELINE sources × only the toggled
specials. Every non-universal-only conditional entry (spell school,
single-weapon hit) gets a `total` field the same way; universal-only
entries get `total: undefined` (they're a checkbox, never a totaled row).
Multi-axis groups get a `total` field too. **Removed entirely:**
`nestUniversalOnly`/`attachUniversalNesting`/`damageAxisNested`/
`negationAxisNested`/`nestedWithUniversal` — superseded by Totals, which
combines the same information more completely (every toggled special at
once, not one nested line per possible pairing).

**Tests:** rewrote every test referencing the removed nesting fields to use
`damageTotals`/`total`/the specials Set instead (verified both toggled-off
and toggled-on behavior), relabeled the Task-29 double-counting regression
test to confirm the new `specialsMultiplier()` design makes the bug class
structurally impossible, and added new tests for the breakdown structures:
multiple different-valued contributors merging into one axis's breakdown
list, duplicate-name collapsing to one entry with a count, Affinity's
multi-axis group excluding itself from the plain per-axis lists, and
Evergaol/Night Invader surfacing as separately-named universal-axis rows
(not blended). 20/86/2587 across the three suites.

**Render (index.html only, no engine impact):** Split into
`renderInventory*` (Section 1 — flat name/label + `fmtBreakdown()`, which
repeats each contributor's value `count` times and joins with " × ", no
cross-category combination) and `renderTotals*` (Section 2 — "All Damage"
always shown as the reference point even at ×1; every other row only when
"present", matching Section 1's own presence rule; an axis touched by a
multi-axis group, e.g. Fire under Affinity, is shown NESTED under that
group instead of ALSO as a separate top-level row, so the same number never
displays twice; a per-bucket "Special Triggers" checkbox list, OFF by
default, wired through `updateResult()` — not a bare `renderBuildSummary()`
call — so toggling one also updates the share URL). `enabledSpecials`
(module-level `Set`, keyed by effect NAME since duplicate selections of the
same special already collapse to one entry with no single slot position to
key a toggle off of) persists across renders and round-trips through a new
repeated `special` URL param, read back in `restoreFromURL()`.
Resource/Recovery and the flat/other lists are UNCHANGED — no "universal"
cross-cutting concept applies there, so the Inventory/Totals split wasn't
needed. Removed the now-fully-unused `renderBuildAxisRows` and the
`universal` entry from `BUILD_AXIS_LABELS` (dead since Section 1 shows each
universal source by name and Section 2 uses the new `build_all_dmg_label`
key instead) along with its now-orphaned `build_axis_universal` locale
strings.

**Bug caught during verification:** the specials checkbox's `change`
handler initially called `renderBuildSummary()` directly instead of
`updateResult()` — re-rendered correctly but never updated the share URL,
so a shared link silently dropped which specials were toggled on. Caught
by the live jsdom round-trip test (toggle → grab share URL → load it fresh
→ compare); fixed by routing through `updateResult()` like every other
v3 input already does.

**Live verification:** reconstructed a realistic scenario with real
relic/DON ids (2 different Physical Attack Up tiers, Fire Attack Power Up
+4, 2 copies of Improved Affinity Attack Power +2, 3 copies of Improved
Carian Sword Sorcery across 3 different relics, a single Katana hit
conditional, the 3+ Katana Equipped special, the vs-poison special, and 3
Night Invader kills via the count selector) and hand-verified every number
in the rendered HTML against the formula by hand (e.g. Carian's total
before/after toggling specials: `1.2250 × 1.21 × 1.4049 = ×2.083`, then
`× 1.32 = ×2.749` — matched exactly). Confirmed Fire nests correctly under
Affinity (fire-specific IS present) while Magic/Lightning/Holy don't (no
axis-specific source selected for them), and that Sorcery's own category
total is omitted (no "Improved Sorceries" baseline active) while Carian's
row still totals correctly. Then verified the share-URL round-trip
separately (see the bug above). New i18n keys `build_group_affinity`,
`build_all_dmg_label`, `build_specials_title`, `build_totals_title` added
to both locales.

### Post-plan addendum: Task 33 — Physical/Affinity always shown in Totals,
"All Damage" row removed, negation-Affinity gap fixed, negation breakdown
display bug fixed

User feedback after seeing Task 32 live: "there are basically two types of
dmg - physical and affinity" — so Totals should always show Physical and
Affinity (even at ×1), with Fire/Magic/Lightning/Holy still only shown when
they diverge from the general Affinity number (e.g. Giants' Flame relying
on an elevated Fire total). Mid-turn follow-up: remove the separate "All
Damage" row entirely, since Physical and Affinity now always show it
folded in already — a third always-shown row for the same
universal-baseline contribution was redundant now that both fundamental
types already carry it.

**Real bug found while implementing:** effect_multipliers.mjs has
`'Improved Affinity Damage Negation'` (3 tiers, axes: magic+fire+lightning+
holy, negation bucket) — a genuine multi-axis Affinity-type effect for
Damage Negation, mirroring its Attack Power counterpart. Task 32 only built
`damageMultiAxisGroups` for the `'damage'` bucket; selecting the negation
version made it vanish from the summary ENTIRELY (not shown in Inventory
OR Totals) — a real gap, not just a display preference. Generalized the
one-off `damageMultiAxisGroups` builder into `buildMultiAxisGroups(bucket,
universalBaseline, specialsMul)`, called once per bucket, producing both
`damageMultiAxisGroups` and a new `negationMultiAxisGroups`. Also missing:
`renderBuildSummary()`'s negation Inventory body never called
`renderInventoryMultiAxisGroups` at all — added it.

**"Always show Affinity" implementation:** rather than gate Affinity's
presence in the returned list on whether any contributing effect was
selected, `buildMultiAxisGroups` now unconditionally seeds a
`{axes: AFFINITY_AXES, rows: []}` entry for the canonical
magic+fire+lightning+holy signature before returning — same pattern as
Physical (which needed no seeding, since `renderTotalsAxisRows` just always
renders a Physical row now regardless of `axisBreakdown.physical`).
`renderInventoryMultiAxisGroups` filters out empty-rows groups, since
Section 1 must still only show what's actually selected — the "always
show" rule is Totals-only, per the user's own scoping ("in totals... we
should always show").

**Second bug caught while writing the negation test:** the generic
`buildMultiAxisGroups` combined rows via a straight `∏v` (correct for
damage) — for negation, the combination rule is `∏(1−v)` (a "remaining
damage" factor), matching how `negationBaseline` accumulates everywhere
else. Fixed with an `isNegation` branch inside the reduce. Caught by a new
test (`negation Affinity combined = (1 - 0.06)`) that initially failed with
`got 0.06, expected 0.94` before the fix.

**Third bug caught via reasoning before it shipped:** Section 1's new
per-axis/multi-axis-group breakdown display (`fmtBreakdown`) was built to
show each contributing effect's RAW `value` (correct for damage, where raw
value === the multiplier). For negation, raw value (e.g. 0.10 for a
+10%-negation relic) and the actual combined "remaining damage" factor
(0.90) are different numbers that don't compose the same way — showing
"×0.100" per source would have been actively misleading, and multiplying
two raw negation values together in the reader's head wouldn't reconstruct
the real total. Threaded an `isNegation` flag through
`fmtBreakdown`/`renderInventoryRow`/`renderInventoryAxisRows`/
`renderInventoryMultiAxisGroups`, transforming each row to `(1 − value)` for
display only when the bucket is negation — verified live: "Fire Damage
Negation Up" (raw 0.10) now reads as "Fire: ×0.900" in Section 1, matching
what Totals already correctly showed. `renderInventoryConditionalRow` (used
for negation curses like "Reduced Damage Negation After Evading") was left
untouched — it already showed raw values before this session's redesign
too, so leaving it alone avoids scope creep on a pre-existing pattern the
user didn't flag.

**Removed:** the `allDmgRow` line and its `build_all_dmg_label` i18n key
(both locales) — Physical and Affinity always carry the universal-baseline
contribution now, so a separate "All Damage" row duplicated information
with no reference point of its own.

Added 8 new tests to `tests/build.test.mjs` covering: Affinity's placeholder
entry when nothing is selected (both buckets), the real negation-Affinity
effect populating `negationMultiAxisGroups` with the correct `(1−v)`
combination. Verified live with `jsdom`: a build with only Carian Sword
Sorcery selected (no baseline at all) correctly shows Physical ×1 and
Affinity ×1 in Totals with no All Damage row; a negation build with Fire
Damage Negation Up + Improved Affinity Damage Negation shows Section 1's
"Fire: ×0.900" / "Affinity: ×0.940" and Totals' nested "Fire: ×0.846"
(0.9 × 0.94, both sources sharing the same accumulator slot) correctly
below the general "Affinity: ×0.940" row. 20/95/2587 across the three test
suites, all passing.

### Post-plan addendum: Task 34 — weapon-specific conditionals nest under
Physical/Affinity in Totals, replacing the separate Weapons box there

User: "for physical, we can show specific weapons values like we show the
specific affinities within the affinity block" — i.e. extend Task 33's
nesting (Fire showing an elevated total under Affinity thanks to its own
bonus) to ALSO cover weapon-specific conditionals (Katana hits, Glintstone/
Gravity Stone throws, etc.), nested under whichever axis they actually
belong to, the same "specific value, shown only when it exists" treatment.

Discovered while implementing: `effect_multipliers.mjs`'s `group: 'weapon'`
entries don't all share one axis — most are physical (the WEAPON_TYPES
loop, Throwing Knife), but "Improved Glintstone and Gravity Stone Damage"
is magic-axis. So "nest weapon entries under Physical" would have been
wrong for Glintstone — the correct rule is "nest each conditional entry
under whichever SINGLE axis it actually has" (Physical for Katana, under
Affinity's Magic slot for Glintstone), generalizing the mechanism rather
than special-casing "weapon" specifically.

`renderTotalsAxisRows` gained a 4th parameter, `axisConditionals` (the
group's conditional-tree entries to consider for nesting — `dmgTree.weapon`
for damage, `[]` for negation, which has no weapon group at all) and a new
`conditionalsFor(axis)` helper that nests each entry whose own `axes` is
exactly `[axis]` (excluding universal-only ones, which have no `total`
and are handled as specials checkboxes elsewhere) under Physical or under
each of Affinity's touched axes. Also removed the now-dead `axisRows`
variable from Task 33's version of this function: since `multiAxisGroups`
always carries an Affinity entry (Task 33), every non-physical damage axis
is ALWAYS "touched" by it, so the old top-level axisRows path had already
become unreachable — simplified rather than left as confusing dead code.
Removed the separate `renderTotalsSubgroup(BUILD_GROUP_LABELS.weapon, ...)`
call from Totals (damage only — negation never had one), since its content
is now shown nested under Physical/Affinity instead; Section 1's "Weapons"
box is UNCHANGED (still lists every selected weapon-specific effect with
its raw value, same as before) — only Totals absorbs the duplicate.

No engine changes were needed — `conditionalTree` entries already carry
`axes`/`total` from Task 32. Verified live with `jsdom`: Physical Attack Up
+1 + Improved Affinity Attack Power +2 + Improved Katana Attack Power
(physical) + Improved Glintstone and Gravity Stone Damage (magic) — Totals
showed "Physical ×1.05" with nested "Improved Katana Attack Power ×1.145"
(1.05 × 1.09), and "Affinity ×1.1" with nested "Improved Glintstone and
Gravity Stone Damage ×1.265" (1.1 × 1.15, since damageBaseline.magic
already includes Affinity's contribution), with no separate Weapons box
in Totals and the Weapons box still present, unchanged, in Section 1.
20/95/2587 across the three test suites (no test changes needed — this
was a render-only change, not an engine change).

### Post-plan addendum: Task 35 — Critical Hits / Guard Counters
reclassified from universal to physical-only

User: "guard counters are now under special triggers. they should be a
subcategory under physical as specific dmg type, same for critical."
Critical hit and guard counter bonus damage is physical-only (the
FromSoft riposte/critical multiplier applies to the weapon's physical
damage component, not affinity/elemental) — user-confirmed game knowledge,
not a guess. Reclassified `'Improved Critical Hits'` and all 3 tiers of
`'Improved Guard Counters'` in `effect_multipliers.mjs` from
`axes: ['universal']` to `axes: ['physical']` (kept `group: 'hitType'`).
This moves them out of `damageUniversalOnly` (no longer a "specials"
checkbox — they're always-on now, like a weapon-specific hit) and into
Task 34's axis-nesting path automatically, with zero engine changes needed
— `renderTotalsAxisRows`'s `axisConditionals` param was updated to receive
`[...dmgTree.weapon, ...dmgTree.hitType]` (previously weapon only) so
hit-type entries get the same nesting-under-Physical treatment. Removed
the now-fully-redundant `renderTotalsSubgroup(BUILD_GROUP_LABELS.hitType,
...)` call from Totals — after this reclassification, the only entry left
in `dmgTree.hitType` is "Improved Initial Standard Attack" (still
universal-only, so still a checkbox with no `total`), meaning that
subgroup box had become a permanent no-op.

Regenerated `data/relic_data.json` (2 axis changes — only Critical Hits
exists in the regular pool) and `data/don_relic_data.json` (4 — Critical
Hits + all 3 Guard Counter tiers exist in the DON pool) and re-embedded.
Added 2 schema spot-checks in `tests/effect_multipliers.test.mjs`
confirming `axes.includes('physical')` and NOT `'universal'`. Verified
live with `jsdom`: Physical Attack Up +1 + Improved Critical Hits +
Improved Guard Counters +2 — Totals now shows "Physical ×1.05" with both
nested underneath ("Improved Critical Hits ×1.239" = 1.05×1.18, "Improved
Guard Counters +2 ×1.355" = 1.05×1.29), Section 1 still lists both raw
values under "Hit-Type Bonuses" unchanged, and "Affinity ×1" shows with
nothing nested (as expected, untouched). 20/95/2589 across the three test
suites.

Also investigated a user-reported "Evergaol/Night Invader overwrite each
other" concern mid-task — reproduced via both URL restore and live
interactive dropdown selection across two different relics and found
BOTH combine correctly (e.g. Evergaol×2 + Night Invader×3 → Physical
×1.351 = 1.05²×1.07³); user confirmed it was their own testing mistake
(had selected Night Invader with count=0, which correctly contributes
nothing). No code change needed — noted here since the investigation
happened but turned out to be a non-issue.

### Post-plan addendum: Task 36 — v3 reuses the regular/Deep of Night mode
toggle instead of its own "Include DON relics" checkbox; Improved Initial
Standard Attack reclassified to physical

User: "we already have a toggle regular/deep of night. for v3 we have
added an additional checkbox Include Deep of Night relics. can we remove
the new checkbox and use the old toggle in that context for v3?" The v1/v2
mode toggle (`mode`, 'regular'|'don') and v3's `#build-don-toggle` checkbox
were previously independent — the top toggle had literally no effect on
v3, which always showed both relic sections and used its own checkbox to
decide whether to read DON panel selections. Unified them: "Regular"
selected now means v3 only reads/shows regular relics; "Deep of Night"
means it also shows/reads the DON panels alongside them (an additive
inclusion, not an exclusive switch — v3 never hides the regular panels).

Removed the checkbox HTML/CSS entirely. Replaced every
`document.getElementById('build-don-toggle').checked` read with
`mode === 'don'`: `getBuildEffects()`'s DON-panel collection guard,
`buildShareURL()`'s `donIncluded` (the separate `buildDon` URL param was
also removed — fully redundant now that `mode` is already encoded),
`restoreFromURL()`'s DON-panel display/return-object derivation. Since
`mode` defaults to `'regular'`, `#build-don-relics`/`#build-don-heading`
now default to `display:none` in the HTML (previously they defaulted
visible, matching the checkbox's `checked` default) — a real behavior
change (DON panels no longer shown by default in v3), which is exactly
what unifying the controls implies. Added the missing display-sync to 3
places that previously relied on the checkbox's own `change` listener
(now deleted): the mode-toggle click handler's new `calcMode === 'v3'`
branch, and the calc-mode-toggle handler's v3 branch (after
`buildRelicPanels()` rebuilds the DOM, display must be re-applied since
a fresh `buildRelicPanels()` call doesn't touch container display style).
`restoreFromURL()` already covers the page-load path.

Separately, user: "Improved initial attack is listed as special trigger,
it should rather be just a subcategory within the physical, like guard
counters." Same reasoning as Task 35 (Critical Hits/Guard Counters): the
first-light-attack bonus is physical-only, not a universal special.
Reclassified `'Improved Initial Standard Attack'` from
`axes: ['universal']` to `axes: ['physical']` — no other engine/render
changes needed, it automatically routes through Task 34's axis-nesting
mechanism (nests under Physical in Totals) since it's already `group:
'hitType'`, which Task 35 already wired into `axisConditionals`.

**Self-correction caught mid-task:** the user also initially said
"Physical attack power increases after using grease items should be in
special triggers," which I implemented (reclassified to universal) — but
they immediately followed up "axes should obviously be physical only,"
reversing it. Reverted cleanly back to `axes: ['physical']` (its original,
correct classification) before regenerating data, so no incorrect
intermediate state was ever committed.

Regenerated `data/relic_data.json`/`data/don_relic_data.json` (diff shows
exactly the one intended change — universal→physical for Improved Initial
Standard Attack in both pools) and re-embedded. Added a schema spot-check
in `tests/effect_multipliers.test.mjs` for the Initial Standard Attack
reclassification and confirmed the grease-items spot-check still asserts
physical (unchanged). Verified live with `jsdom`: confirmed the checkbox
no longer exists in the DOM; DON container hidden by default when
entering v3 with mode='regular'; clicking "Deep of Night" shows the DON
panels and adds `mode=don` to the URL; clicking back to "Regular" hides
them and removes it; a DON-relic effect (Fire Attack Power Up +4) combined
correctly with a regular-relic effect (Physical Attack Up +1) only when
mode='don', both live-interactively and via a `mode=don` URL restored
fresh. Improved Initial Standard Attack now nests under Physical in
Totals ("Physical ×1.05" → nested "Improved Initial Standard Attack
×1.208" = 1.05×1.15). 20/95/2591 across the three test suites.
