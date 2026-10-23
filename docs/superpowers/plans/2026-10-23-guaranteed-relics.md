# Guaranteed Relics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let players pick any of 84 guaranteed (fixed-effect) relics by name on the Effect Multipliers tab. The relic's exact effects then feed the existing totals engine.

**Architecture:** A new prepare script resolves relics from game data (`EquipParamAntique.csv` → effect tables → effect names) into `data/fixed_relics.json`. That file is embedded in `index.html` as `FIXED_RELICS`, the same way `DATA`/`DON_DATA` are. Each Regular relic panel gets a dropdown. Selecting a relic swaps the free-form rows for a read-only effect list whose entries flow through `getBuildEffects()` unchanged. Glass Necklace's per-tier values are handled by collapsing a counted effect into one entry with the product value, so `computeBuildTotals` needs no change.

**Tech Stack:** Vanilla JS single-file app (`index.html`), Node ESM prepare scripts and tests (`node tests/*.mjs`, no framework), Python one-liner for embedding.

**Spec:** `docs/superpowers/specs/2026-10-23-guaranteed-relics-design.md`. Read it. This plan doesn't repeat its rationale.

## Global Constraints

- Data flow is always: edit prepare script / `.mjs` source → `node prepare_*.mjs` → re-embed via the README Python script. Never hand-edit `data/*.json` or the embedded constants.
- Every new UI string has a `data-i18n`/`I18N.t` key with entries in **both** `locales/jp.js` and `locales/kr.js`. No English fallback ships.
- Game data wins over the community sheet for which effects a relic has.
- DLC relic = ID present in `AntiqueName_dlc01.fmg.xml` and absent from `AntiqueName.fmg.xml`. A one-line override set must be able to un-DLC IDs.
- Guaranteed relics appear on Regular panels only, never on Deep of Night panels.
- Effect lookups for `mul`/`desc` normalise names exactly as `prepare_data.mjs` does: HTML-unescape, then `\n` → space.
- Tests follow the repo convention: plain Node scripts printing pass/fail counts and exiting non-zero on failure. Engine code that lives in `index.html` is duplicated into `tests/build.test.mjs`.
- Commit on branch `feat/guaranteed-relics`. Every commit ends with `Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>`.

## Review Focus

1. **The same relic in two panels.** In-game you can't equip one relic twice, so a relic chosen in one Regular panel must be disabled in the other two. Test: Task 4 step "duplicate relic disabled".
2. **Share link with a fixed relic and stale free-form keys for the same panel** (e.g. a hand-edited URL). The fixed relic wins and the stray `r1s1` is ignored. Test: Task 5.
3. **Count 0 on Glass Necklace / Dregs.** The effect contributes nothing, not ×1, not NaN, and doesn't show as "×1.00" in Totals. Test: Task 3 (`countedEntries` with count 0).
4. **Pre-DLC with a DLC relic in a share link** (`dlc=pre&r1f=2080`). The panel stays "— none —" and nothing throws. Test: Task 5.
5. **The Signboard Evergaol relic (1510).** Its existing `variableCount` effect still gets a working count dropdown inside a fixed panel, and the count round-trips through the share link. Test: Task 4 and Task 5.

---

### Task 1: Classify the 25 unique effects, add descriptions, extend the schema for `stepValues`

**Files:**
- Modify: `effect_multipliers.mjs` (add entries; document `stepValues` in the header comment next to `variableCount`)
- Modify: `descriptions.mjs` (add 25 entries to `EFFECT_DESCRIPTIONS`)
- Test: `tests/effect_multipliers.test.mjs`

**Interfaces:**
- Produces: `EFFECT_MULTIPLIERS` entries keyed by the exact game names below. These are the new optional field `stepValues: number[]`, valid only with `variableCount`, `maxCount === stepValues.length`, `value === stepValues[0]`.

Exact names and entries. Names are verbatim from game files; the one with an embedded newline is keyed with a space.

| Key | Entry |
|---|---|
| `Improved Melee Attack Power` | `{ tier: 'baseline', bucket: 'damage', axes: ['universal'], value: 1.05 }` |
| `Improved Physical Damage Negation` | `{ tier: 'baseline', bucket: 'negation', axes: ['physical'], value: 0.10 }` |
| `Improved Critical Hits +1` | `{ tier: 'conditional', bucket: 'damage', axes: ['physical'], group: 'hitType', value: 1.23, condition: 'On critical hits' }` |
| `Improved Skill Attack Power` | `{ tier: 'conditional', bucket: 'damage', axes: ['universal'], group: 'hitType', value: 1.15, condition: 'Weapon skills only' }` |
| `Boosts Attack Power of Added Affinity Attacks` | `{ tier: 'conditional', bucket: 'damage', axes: ['magic','fire','lightning','holy'], group: 'weapon', value: 1.10, condition: 'Elemental damage on weapons only (not spells)' }` |
| `Poison & Rot in Vicinity Increases Attack Power` | `{ tier: 'conditional', special: true, bucket: 'damage', axes: ['universal'], group: 'status', value: 1.12, condition: '20s after poison/rot procs nearby' }` |
| `Switching Weapons Boosts Attack Power` | `{ tier: 'conditional', special: true, bucket: 'damage', axes: ['physical'], group: 'status', value: 1.10, condition: '10s after switching weapons' }` |
| `Status Ailment Gauges Slowly Increase Attack Power` | `{ tier: 'baseline', bucket: 'damage', axes: ['universal'], value: 1.04, variableCount: true, maxCount: 10 }` |
| `Successive Attacks Boost Attack Power` | `{ tier: 'baseline', bucket: 'damage', axes: ['universal'], value: 1.05, variableCount: true, maxCount: 3, stepValues: [1.05, 1.065, 1.09] }` |
| `Continuous HP Recovery` | `{ tier: 'flat', value: 2, template: '+{v} HP/s' }` |
| `Attacks Inflict Rot when Damage is Taken` | `{ tier: 'flat', value: 25, template: 'Taking damage adds {v} rot buildup to your weapon for 12s' }` |

Description-only (add to `descriptions.mjs` only, no `mul`): `Stamina Recovery upon Landing Attacks +1`, `FP Restoration upon Successive Attacks`, `Continuous FP Recovery`, `Rot in Vicinity Causes Continuous HP Recovery`, `HP Recovery From Successful Guarding`, `Madness Continually Recovers FP`, `Huge rune discount for shop purchases while on expedition`, `Gesture "Crossed Legs" Builds Up Madness`, `Frostbite in Vicinity Conceals Self`, `Extended Spell Duration`, `Switching Weapons Adds an Affinity Attack`, `Occasionally Nullify Attacks When Damage Negation is Lowered`, `Improved Stance-Breaking when Two-Handing`, `Improved Stance-Breaking when Wielding Two Armaments`.

Descriptions for all 25 come from the "Effect" column of `Nightreign Useful Info (Version 1.03.2) (+ DLC) - Relic Effects.csv`, in the file's existing style (`'1.12× damage for 20s after poison or rot procs nearby'`). Two exceptions: Extended Spell Duration → `'+50% spell duration'`; Occasionally Nullify → `'20% chance to take no damage while any damage negation is lowered'`. Glass Necklace → `'1.05× / 1.065× / 1.09× damage per successive-attack tier (stacking: up to ~1.219×)'`. Dregs → `'1.04× damage every 20s while a status gauge is visible (up to 10 stacks)'`.

- [ ] **Step 1: Write the failing schema tests.** In `tests/effect_multipliers.test.mjs`, next to the existing `variableCount` checks (around line 96):
  - If `m.stepValues !== undefined`: it's an array of numbers > 0; `m.variableCount === true`; `m.maxCount === m.stepValues.length`; `m.value === m.stepValues[0]`.
  - Spot checks, mirroring the existing `evergaol`/`nightInvader` ones:
    - `'Successive Attacks Boost Attack Power'` has `stepValues` deep-equal `[1.05, 1.065, 1.09]` and `maxCount === 3`.
    - `'Status Ailment Gauges Slowly Increase Attack Power'` has `value === 1.04`, `variableCount === true`, `maxCount === 10`.
    - `'Improved Critical Hits +1'` has `value === 1.23` and `condition === 'On critical hits'`.
    - `'Improved Physical Damage Negation'` has `bucket === 'negation'` and `value === 0.10`.
- [ ] **Step 2: Run it and confirm it fails.** `node tests/effect_multipliers.test.mjs`. Expected: FAIL lines for the 4 spot checks.
- [ ] **Step 3: Add the entries and descriptions.** Add the 11 `mul` entries in the matching existing sections of `effect_multipliers.mjs`. Document `stepValues` in the header comment block. Add the 25 descriptions to `descriptions.mjs`.
- [ ] **Step 4: Run all tests.** `node tests/effect_multipliers.test.mjs && node tests/build.test.mjs && node tests/calc.test.mjs`. Expected: all pass, 0 failed.
- [ ] **Step 5: Commit.** `git add effect_multipliers.mjs descriptions.mjs tests/effect_multipliers.test.mjs && git commit -m "feat: classify guaranteed-relic-only effects, add stepValues schema"`

---

### Task 2: Game-data inputs and `prepare_fixed_relics.mjs` → `data/fixed_relics.json`

**Files:**
- Create: `data/EquipParamAntique.csv`, `data/AntiqueName.fmg.xml`, `data/AntiqueName_dlc01.fmg.xml` (downloaded, see step 1)
- Create: `prepare_fixed_relics.mjs`
- Create: `data/fixed_relics.json` (generated)
- Test: `tests/fixed_relics.test.mjs` (new)
- Modify: `README.md` ("Regenerating Data": add `node prepare_fixed_relics.mjs`)

**Interfaces:**
- Consumes: `EFFECT_MULTIPLIERS`, `EFFECT_DESCRIPTIONS` (Task 1).
- Produces: `data/fixed_relics.json`, which has this shape:
  ```json
  { "groups": ["boss","remembrance","signboard","misc"],
    "relics": [ { "id": 2100, "name": "Night of the Lord", "group": "boss", "color": 1,
                  "dlc": true?, "effects": [ { "id": 7035700, "name": "...", "desc": "...?", "mul": {...}? } ] } ] }
  ```
  `relics` is in ID order within each group, and groups come in the order above. `dlc` is present only when true. `color` is the raw `relicColor` value. Effects are in game order (table 1 → 2 → 3, each table's rows in file order), with `-1` skipped.

- [ ] **Step 1: Download the inputs.** Run each into `data/`:
  ```bash
  B=https://raw.githubusercontent.com/ip1259/Elden-Ring-Nightreign-Legal-Relic-Generator/HEAD
  curl -sfL $B/EquipParamAntique.csv -o data/EquipParamAntique.csv
  curl -sfL $B/en/AntiqueName.fmg.xml -o data/AntiqueName.fmg.xml
  curl -sfL $B/en/AntiqueName_dlc01.fmg.xml -o data/AntiqueName_dlc01.fmg.xml
  ```
  Expected: `EquipParamAntique.csv` is about 1386 lines, and `grep -c '<text' data/AntiqueName.fmg.xml` gives about 1720.
- [ ] **Step 2: Write the failing test `tests/fixed_relics.test.mjs`.** It reads `data/fixed_relics.json`. Assertions:
  - Exactly 84 relics. Per group: boss 18, remembrance 24, signboard 39, misc 3.
  - DLC relics are exactly the 33 IDs `[2070,2071,2080,19000,19001,19050,19051, 1600,1610,1620,1630,1640,1650,1660,1670,1680,1690,1700,1710,1720,1730,1740,1750,1800,1820,1830,1850,1860,1870,1880,1890,1900,1920]`. 2100 is not DLC.
  - 2100's effect names are `['Switching Weapons Adds an Affinity Attack','Boosts Attack Power of Added Affinity Attacks','Switching Weapons Boosts Attack Power']`.
  - 2001's effect names include `'Taking attacks improves attack power'`, the text of internal ID 100000. That effect carries `mul.special === true`.
  - 19051's effects include `'Successive Attacks Boost Attack Power'` with `mul.stepValues` of length 3.
  - 1520 has 3 effects, all named `'Starlight Shards in possession at start of expedition'`.
  - 1510's effects include `'Attack power increased for each evergaol prisoner defeated'` with `mul.variableCount === true`.
  - No relic has 0 effects, and no effect name contains `\n` (normalised) or starts with `?`.
  - None of 1000–1310, 11003, 11004, 12004–12007 is present.
- [ ] **Step 3: Run it and confirm it fails.** `node tests/fixed_relics.test.mjs`. Expected: crash/FAIL (file missing).
- [ ] **Step 4: Implement `prepare_fixed_relics.mjs`.**
  - Hard-code the group → ID lists from the spec's table. For Signboard, use the 39 IDs listed explicitly.
  - At load, assert that every listed ID exists in `EquipParamAntique.csv`, has a name in one of the two name files, and has `isDeepRelic === '0'`. Throw on violation.
  - Resolve each effect via `attachEffectTableId_1..3` → `AttachEffectTableParam.csv` rows (`attachEffectId`, skip `-1`) → `AttachEffectParam.csv` `attachTextId` (column 9) → `AttachEffectName(.dlc01).fmg.xml`.
  - Normalise names as in `prepare_data.mjs`. Attach `desc`/`mul` by normalised name.
  - DLC: `inDlcFile && !inBaseFile && !DLC_OVERRIDE_BASE.has(id)`, with `const DLC_OVERRIDE_BASE = new Set([])` and a comment that it exists for un-DLC'ing Signboard IDs after an in-game check.
  - CSV note: `EquipParamAntique.csv` fields like `[0|0|0]` contain no commas, so a plain `split(',')` is safe. Assert the header has the expected column names.
- [ ] **Step 5: Generate the JSON and run the tests.** `node prepare_fixed_relics.mjs && node tests/fixed_relics.test.mjs`. Expected: all pass.
- [ ] **Step 6: Commit.** `git add data/EquipParamAntique.csv data/AntiqueName.fmg.xml data/AntiqueName_dlc01.fmg.xml prepare_fixed_relics.mjs data/fixed_relics.json tests/fixed_relics.test.mjs README.md && git commit -m "feat: generate fixed (guaranteed) relic data from game params"`

---

### Task 3: Counted-effect expansion helper (`stepValues` support)

**Files:**
- Modify: `index.html` (new helper near `getBuildEffects`, ~line 1601; use it in `collectFromPanels`)
- Test: `tests/build.test.mjs` (duplicate the helper, following the file's convention)

**Interfaces:**
- Produces: `function countedEntries(effect, count) → Array<{ name, mul, desc }>`, used by Task 4.
  - No `mul.variableCount` → `[{ name, mul, desc }]`, ignoring count.
  - `variableCount` without `stepValues` → `count` copies of `{ name, mul, desc }`. This matches today's behaviour, so Evergaol still gives `value^count`.
  - `variableCount` with `stepValues` → `count === 0` gives `[]`. Otherwise one entry `{ name, mul: { ...mul, value: ∏ stepValues[0..count-1] }, desc }`.
  - The engine then sees one baseline row with the combined value and `count: 1`, so the summary shows ×1.219, not ×1.05³.

- [ ] **Step 1: Write the failing tests** in `tests/build.test.mjs`:
  - `countedEntries(glass, 3)` has length 1, and its `mul.value` is ≈ 1.05×1.065×1.09 (1.21887…, tolerance 1e-9).
  - `countedEntries(glass, 0)` has length 0.
  - `countedEntries(glass, 2)` → `computeBuildTotals(...)` gives `damageBaseline.universal` ≈ 1.11825.
  - `countedEntries(evergaol, 3)` has length 3, and `computeBuildTotals` gives universal ≈ 1.05³.
  - A non-counted effect with count 5 has length 1.
- [ ] **Step 2: Run it and confirm it fails.** `node tests/build.test.mjs`. Expected: `countedEntries is not defined`.
- [ ] **Step 3: Implement `countedEntries`** in both `index.html` and the test file, identically. Replace the inline `for (let i = 0; i < count; i++) effects.push(...)` in `collectFromPanels` with `effects.push(...countedEntries(effect, count))`.
- [ ] **Step 4: Run all tests.** `node tests/build.test.mjs && node tests/effect_multipliers.test.mjs && node tests/calc.test.mjs`. Expected: all pass.
- [ ] **Step 5: Commit.** `git add index.html tests/build.test.mjs && git commit -m "feat: countedEntries helper with per-step values for tiered effects"`

---

### Task 4: Embed `FIXED_RELICS` and build the dropdown and read-only panel UI

**Files:**
- Modify: `README.md` (embed script: also replace `const FIXED_RELICS = {...};` from `data/fixed_relics.json`)
- Modify: `index.html`:
  - a `const FIXED_RELICS = {};` placeholder next to `const DON_DATA`, then embedded
  - CSS next to `.relic-panel`
  - `createRelicPanel`, ~1430
  - `buildRelicPanels`, ~1584
  - `getBuildEffects`, ~1601

**Interfaces:**
- Consumes: `data/fixed_relics.json` (Task 2), `countedEntries` (Task 3).
- Produces, used by Task 5:
  - `createRelicPanel(pool, allowCurse, title, allowFixed)`. The new 4th param is true only for the 3 Regular panels.
  - Panel DOM: `select.fixed-relic-select` (value `''` = none, otherwise a relic ID string), `div.fixed-relic-effects` (one `div.fixed-effect-row[data-effect-idx]` per effect, 0-based). Counted effects get a `.count-select` inside their row, with default 1 and options 0..maxCount.
  - `function setPanelFixedRelic(panel, relicId /* number|null */, counts /* (string|null)[]|undefined */)` selects (or clears) a relic and renders the rows.
  - `function activeFixedRelics() → relic[]` returns `FIXED_RELICS.relics` filtered by `preDLC` (drops `dlc`).
  - `function refreshFixedRelicDropdowns()` re-renders every Regular panel's options. A relic selected in another panel is `disabled`.

Behaviour (spec "UI" section):
- The dropdown sits above the slot rows. It has `<optgroup>`s in `FIXED_RELICS.groups` order, labelled `I18N.t('fixed_group_<group>')`.
- Option label: `I18N.relicName(name)` for boss/remembrance/misc. For signboard it's `` `${I18N.relicName(name)} — ${I18N.effectName(effects[0].name)}` ``. Add `relicName(en) { return this.strings.relics?.[en] ?? en; }` to `i18n.js`.
- On select: hide `.relic-panel-slots` and `.add-effect-btn`, show `.fixed-relic-effects`, and render each row as the localised effect name plus `I18N.effectDesc(name, desc)`. The free-form rows are cleared, so switching back gives an empty free-form panel (plan's call).
- `getBuildEffects`: for a panel whose `.fixed-relic-select` has a value, push `countedEntries(effect, count)` for each relic effect. `count` comes from that row's `.count-select` (`|| 0`), or 1 if the row has none. Skip that panel's slot blocks.
- `buildRelicPanels` already runs on the Pre-DLC toggle, so DLC relics naturally drop out (all panels reset there today, which is existing behaviour).

- [ ] **Step 1: Write the failing check.** Extend `tests/fixed_relics.test.mjs` with an embed-sync assertion. Read `index.html`, extract `const FIXED_RELICS = (…);` with a regex, `JSON.parse` it, and deep-compare it to `data/fixed_relics.json`. This mirrors the existing DATA sync check in `tests/effect_multipliers.test.mjs` (~line 268).
- [ ] **Step 2: Run it and confirm it fails.** `node tests/fixed_relics.test.mjs`. Expected: FAIL (constant missing).
- [ ] **Step 3: Add the placeholder, extend the README embed script, and run the embed.** Run `node prepare_data.mjs && node prepare_don_data.mjs && node prepare_fixed_relics.mjs`, then the README Python script.
- [ ] **Step 4: Implement the UI** described above. Keep `allowFixed` false for DON panels.
- [ ] **Step 5: Run all tests.** `for t in tests/*.test.mjs; do node $t || exit 1; done`. Expected: all pass.
- [ ] **Step 6: Verify in the browser** (use the `run` skill or Claude in Chrome against `file://…/index.html?calc=v3`):
  - Pick Night of the Lord in Relic 1. The rows show 3 effects. The specials list gains "Switching Weapons Boosts Attack Power". Totals show the affinity conditional line ×1.10.
  - Pick Glass Necklace in Relic 2 and set the tier to 3. Universal damage shows ×1.219. With tier 0 there's no Glass Necklace row at all.
  - **Duplicate relic disabled:** with Night of the Lord in Relic 1, the Relic 2 and 3 dropdowns show it disabled. Clearing Relic 1 re-enables it.
  - Pick the Signboard relic 1510 ("Grand Luminous Scene — Attack power increased for each evergaol prisoner defeated"). It shows a count dropdown, and changing it changes universal damage.
  - Switch to Pre-DLC. The Night of Dregs, Will of Balance and Glass Necklace options are gone, and Night of the Lord is still there.
  - Deep of Night panels have no dropdown.
- [ ] **Step 7: Commit.** `git add index.html i18n.js README.md tests/fixed_relics.test.mjs && git commit -m "feat: guaranteed relic dropdown on regular relic panels"`

---

### Task 5: Share links for fixed relics

**Files:**
- Modify: `index.html`:
  - `encodePanel`, ~2023
  - share decode, ~2108
  - `applyRestoredSelections`, ~2219

**Interfaces:**
- Consumes: `setPanelFixedRelic`, `activeFixedRelics` (Task 4).
- URL keys (new, no collision with `r{n}s{m}` / `r{n}c{m}` / `r{n}n{m}`):
  - `r{n}f=<relicId>`
  - `r{n}fn{k}=<count>` for each counted effect, where `k` is the 1-based effect index.

- [ ] **Step 1: Write the failing check.** Factor the per-panel decode into a pure function `parseFixedPanelParams(params, r) → { relicId: number|null, counts: (string|null)[] }`, duplicated into `tests/build.test.mjs`. Test:
  - `?r1f=19051&r1fn3=2` → `{ relicId: 19051, counts: [null, null, '2'] }`
  - no `r1f` → `relicId: null`
  - `r1f=abc` → `relicId: null`
- [ ] **Step 2: Run it and confirm it fails.** `node tests/build.test.mjs`. Expected: `parseFixedPanelParams is not defined`.
- [ ] **Step 3: Implement.**
  - Encode: if a panel has a fixed relic, write `r{n}f` plus `r{n}fn{k}` for each row with a `.count-select`. Write no `r{n}s*` keys for that panel.
  - Decode: `restored.build.regular[i].fixed = parseFixedPanelParams(params, i+1)`.
  - Restore: if `fixed.relicId` is in `activeFixedRelics()`, call `setPanelFixedRelic(panel, id, counts)` and skip `applyRestoredBuildPanel` for that panel. Otherwise (unknown ID, or a DLC relic under `dlc=pre`) leave the panel as "— none —" and fall through to the free-form restore.
  - Restored counts outside `0..maxCount` fall back to 1, as `applyRestoredBuildPanel` does.
- [ ] **Step 4: Run all tests.** `for t in tests/*.test.mjs; do node $t || exit 1; done`. Expected: all pass.
- [ ] **Step 5: Verify in the browser:**
  - Set Glass Necklace tier 2 in Relic 1 and 1510 with count 4 in Relic 2, then press Share. The copied URL contains `r1f=19051&r1fn3=2&r2f=1510&r2fn…=4`. Open it in a new tab and the same state comes back.
  - Hand-append `&r1s1=7000000` to that URL and reload. Relic 1 is still Glass Necklace.
  - Open `?calc=v3&dlc=pre&r1f=2080`. Relic 1 is "— none —" and the console has no errors.
- [ ] **Step 6: Commit.** `git add index.html tests/build.test.mjs && git commit -m "feat: share links round-trip guaranteed relic selections"`

---

### Task 6: Localisation (relic names, effect names, UI strings, conditions, methodology)

**Files:**
- Modify: `locales/jp.js`, `locales/kr.js`
- Modify: `index.html` (Methodology "Files Used" `<li data-i18n-html="meth_file_antique">`)
- Test: `tests/locales.test.mjs` (new)

**Interfaces:**
- Consumes: `data/fixed_relics.json`, plus the TSVs `docs/superpowers/specs/2026-10-23-guaranteed-relics-relic-names.tsv` and `docs/superpowers/specs/2026-10-23-guaranteed-relics-effect-names.tsv`.
- Produces:
  - A new top-level `relics` map in each locale: EN relic name → localised name. It covers the 45 named relics plus the 4 `Grand … Scene` names. Add a comment on the KR Scene entries: "composed from namu.wiki parts, unconfirmed".
  - 25 new `effects[EN].name` entries: 22 from the effect TSV, and 3 (HP Recovery From Successful Guarding and both Stance-Breaking effects) from nightreignrelic.com `data/ern_effects_export.json` `translations.ja_JP`/`ko_KR`.
  - UI keys: `fixed_relic_label`, `fixed_relic_none`, `fixed_group_boss`, `fixed_group_remembrance`, `fixed_group_signboard`, `fixed_group_misc`, `meth_file_antique`.
  - 4 new `conditions` entries.

UI strings (EN / JP / KR):
| key | EN | JP | KR |
|---|---|---|---|
| fixed_relic_label | Guaranteed relic | 固定遺物 | 고정옵션 유물 |
| fixed_relic_none | — none — | — なし — | — 없음 — |
| fixed_group_boss | Boss relics | ボス遺物 | 밤의 왕 보스 유물 |
| fixed_group_remembrance | Remembrance relics | 追憶の遺物 | 저널 유물 |
| fixed_group_signboard | Collector Signboard | コレクターの看板 | 수집가의 간판 |
| fixed_group_misc | Misc | その他 | 기타 |
| meth_file_antique | `<code>EquipParamAntique.csv</code> + <code>AntiqueName.fmg.xml</code> + <code>AntiqueName_dlc01.fmg.xml</code> — guaranteed relics and their names` | …— 固定遺物とその名称 | …— 고정옵션 유물과 이름 |

Conditions (EN key → JP / KR): `Weapon skills only` → 戦技のみ / 전투 기술만; `Elemental damage on weapons only (not spells)` → 武器の属性ダメージのみ（魔術・祈祷は対象外） / 무기의 속성 피해만 (마술·기도 제외); `20s after poison/rot procs nearby` → 近くで毒/腐敗状態が発生してから20秒間 / 근처에서 독/부패 발생 후 20초간; `10s after switching weapons` → 武器の持ち替えから10秒間 / 무기 바꿔 들기 후 10초간.

- [ ] **Step 1: Write the failing test `tests/locales.test.mjs`.** Load each locale with `vm.runInNewContext(src, { window: {} })` and read `window.__LOCALE_JP__` / `__LOCALE_KR__`. For each locale, assert:
  - Every relic in `fixed_relics.json` resolves: `relics[name]` is non-empty, where the name is the relic name itself, or for Signboard relics its scene name.
  - Every effect name on every fixed relic has `effects[name].name`.
  - Every `condition` string in `EFFECT_MULTIPLIERS` whose entry is one of the 25 new keys exists in `conditions`.
  - The 7 UI keys exist in `ui`.
- [ ] **Step 2: Run it and confirm it fails.** `node tests/locales.test.mjs`. Expected: FAIL listing missing relic/effect/ui/condition entries.
- [ ] **Step 3: Add the locale entries** listed above. Wire `data-i18n`/`I18N.t` for the dropdown label and the "— none —" option (Task 4 used `I18N.t(key, EN)`; confirm the keys match). Add the methodology `<li>`.
- [ ] **Step 4: Run all tests.** `for t in tests/*.test.mjs; do node $t || exit 1; done`. Expected: all pass. If an effect name on a fixed relic was already missing from the locales before this branch, add it too; the test makes that visible.
- [ ] **Step 5: Verify in the browser** with `?calc=v3&lang=jp` and `&lang=kr`:
  - The dropdown, group labels, relic names, Signboard labels and effect rows are all translated.
  - Picking Night of the Lord shows its condition text translated in Totals.
- [ ] **Step 6: Commit.** `git add locales/jp.js locales/kr.js index.html tests/locales.test.mjs && git commit -m "feat: jp/kr localisation for guaranteed relics"`

---

### Task 7: Docs and final verification

**Files:**
- Modify: `README.md` (Effect Multipliers section: one paragraph on guaranteed relics; the Tests list includes `fixed_relics.test.mjs` and `locales.test.mjs`)
- Modify: `index.html` (`meth_build_mode_note` gets one sentence about guaranteed relics, with the matching JP/KR locale text)

- [ ] **Step 1: Update the docs.** Update the README and the methodology note, and add the JP/KR `meth_build_mode_note` additions.
- [ ] **Step 2: Do a full regeneration and confirm it's idempotent.** Run `node prepare_data.mjs && node prepare_don_data.mjs && node prepare_fixed_relics.mjs`, the README embed script, then `git status --short`. Expected: no changes to `data/*.json` or the embedded constants beyond what's already committed.
- [ ] **Step 3: Run all tests.** `for t in tests/*.test.mjs; do node $t || exit 1; done`. Expected: all pass.
- [ ] **Step 4: Smoke test in the browser** in EN, JP and KR:
  - Select one relic from each group.
  - Share-link round trip.
  - Pre-DLC toggle.
  - Regular ↔ Deep of Night toggle: DON panels have no dropdown, and the fixed selections survive the toggle.
- [ ] **Step 5: Commit.** `git add README.md index.html locales/jp.js locales/kr.js && git commit -m "docs: document guaranteed relics in Effect Multipliers"`
