# Per-Slot Tier Weights Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the regular-relic probability model draw each relic slot from its own progressively-weighted tier table (110/210/310) instead of a single table, correcting the systematic under-estimate of high-tier effects on Polished/Grand relics.

**Architecture:** A new `efSlots` recursion walks the K relic slots in fixed tier-ascending order, using per-tier effect/group weights, and replaces both the `ff` prefactor and the `ef` recursion for the regular pool. The Deep of Night (DON) pool keeps its existing single-pool path untouched. Data is regenerated to carry three weights per effect.

**Tech Stack:** Plain ES modules (Node) for data prep, vanilla JS embedded in a single `index.html`, a hand-rolled assertion harness in `tests/calc.test.mjs`. No build step.

## Global Constraints

- Regular-pool tier tables and totals: tier 0 = table 110 (W=10046), tier 1 = table 210 (W=10058), tier 2 = table 310 (W=10059). A quality-K relic uses tiers `0..K-1`.
- Weight decode: `chanceWeight & 0xFFFF` (0 = disabled).
- Slot processing order: fixed tier-ascending (tier 0 first).
- DON pool, curses, and color factor are **unchanged**. DON keeps the existing single-pool `ef`/`efGroupExclusion` path.
- No build step; `index.html` must stay self-contained and openable directly.
- Embedded `DATA` is regenerated via the Python embed snippet in `README.md`; never hand-edit the embedded JSON.

---

### Task 1: Regenerate regular-pool data with per-tier weights

**Files:**
- Modify: `prepare_data.mjs:46-88`
- Artifact: `data/relic_data.json` (regenerated)

**Interfaces:**
- Produces: `data/relic_data.json` with shape
  `{ wTotals:[W0,W1,W2], wTotalsPreDLC:[W0,W1,W2], groups:[{ groupName, groupWs:[g0,g1,g2], effects:[{ name, ws:[w0,w1,w2], desc?, dlc? }] }] }`

- [ ] **Step 1: Replace the single-table weight read (`prepare_data.mjs:46-57`)**

Replace lines 46–57 with:

```js
// Per-slot tier tables: 110 (slot 0), 210 (slot 1), 310 (slot 2).
// A quality-K relic draws slot i from tier i. Decode is chanceWeight & 0xFFFF (0 = disabled).
const TIER_TABLES = [110, 210, 310];
const tableLines = readFileSync('data/AttachEffectTableParam.csv', 'utf8').split('\n');
const weights = {}; // effectId -> [w110, w210, w310]
for (let i = 1; i < tableLines.length; i++) {
  const cols = tableLines[i].trim().split(',');
  const tableId = parseInt(cols[0]);
  const effectId = parseInt(cols[3]);
  const tierIdx = TIER_TABLES.indexOf(tableId);
  if (tierIdx === -1 || isNaN(effectId)) continue;
  const w = parseInt(cols[4]) & 0xFFFF; // 0 = disabled
  if (w <= 0) continue;
  (weights[effectId] ||= [0, 0, 0])[tierIdx] = w;
}
```

- [ ] **Step 2: Replace the effect/group mapping and output (`prepare_data.mjs:61-88`)**

Replace lines 61–88 with:

```js
const clean = raw
  .map(g => {
    const effects = g.effects.map(e => {
      const name = unescapeHtml(e.name);
      const desc = EFFECT_DESCRIPTIONS[name.replace(/\n/g, ' ')] || '';
      const dlc = DLC_EFFECT_IDS.has(Number(e.id));
      const ws = weights[e.id] ?? [0, 0, 0];
      return { name, ws, ...(desc && { desc }), ...(dlc && { dlc: true }) };
    });

    if (g.compatibilityId === 900) {
      effects.sort((a, b) => charSortKey(a.name) - charSortKey(b.name));
    }

    const groupName = unescapeHtml(NAME_OVERRIDES[g.compatibilityId] ?? g.groupName);
    const groupWs = [0, 1, 2].map(t => effects.reduce((s, e) => s + e.ws[t], 0));
    return { groupName, groupWs, effects };
  })
  .sort((a, b) => a.groupName.localeCompare(b.groupName));

// True per-tier totals for tables 110/210/310 — slightly higher than the sum of named
// effects because 5 unnamed effects exist (combined weight 216 in tier 0).
const wTotals = [10046, 10058, 10059];

const dlcWeights = [0, 1, 2].map(t =>
  clean.flatMap(g => g.effects).filter(e => e.dlc).reduce((s, e) => s + e.ws[t], 0));
const wTotalsPreDLC = wTotals.map((w, t) => w - dlcWeights[t]);

const output = { wTotals, wTotalsPreDLC, groups: clean };
writeFileSync('data/relic_data.json', JSON.stringify(output, null, 2));
console.log(`Wrote ${clean.length} groups, ${clean.reduce((s, g) => s + g.effects.length, 0)} effects`);
console.log(`wTotals=${wTotals}, wTotalsPreDLC=${wTotalsPreDLC}`);
```

- [ ] **Step 3: Regenerate the data**

Run: `node prepare_data.mjs`
Expected: prints `Wrote 77 groups, 335 effects` and `wTotals=10046,10058,10059`.

- [ ] **Step 4: Verify the output shape and totals**

Run:
```bash
node -e '
const d = require("./data/relic_data.json");
const assert = require("assert");
assert.deepStrictEqual(d.wTotals, [10046,10058,10059], "wTotals");
const g = d.groups.find(x => x.groupName === "Arcane");
assert.strictEqual(g.effects[0].ws.length, 3, "effect has 3 tier weights");
assert.strictEqual(g.groupWs.length, 3, "group has 3 tier weights");
assert.strictEqual(g.groupWs[0], g.effects.reduce((s,e)=>s+e.ws[0],0), "groupWs[0] = sum ws[0]");
console.log("OK", JSON.stringify(g.effects[0]));
'
```
Expected: prints `OK {"name":"Arcane +1","ws":[52,...],...}` with no assertion error.

- [ ] **Step 5: Commit**

```bash
git add prepare_data.mjs data/relic_data.json
git commit -m "feat: regenerate regular-pool data with per-slot tier weights"
```

---

### Task 2: Add `efSlots` recursion and its tests

**Files:**
- Modify: `tests/calc.test.mjs` (append a new section)
- Test: `tests/calc.test.mjs`

**Interfaces:**
- Produces: `efSlots(groups, Ws, tiers, D, used) -> number`
  - `groups`: array of `{ groupWs:[3] }` (indexable by gid)
  - `Ws`: `[W0,W1,W2]` per-tier totals
  - `tiers`: array like `[0,1,2]` (length K)
  - `D`: array of `{ ws:[3], groupWs:[3], gid }` (desired items)
  - `used`: `Set` of gid
- This is the exact function Task 3 embeds into `index.html`.

- [ ] **Step 1: Write the failing tests (append to end of `tests/calc.test.mjs`, before the final summary block at line 118)**

Insert before `console.log('\n' + passed ...)`:

```js
// --- efSlots() : per-slot tier model (regular pool) ---
console.log('\n--- efSlots() ---');

// Reference data: gid 0 = Vigor (+1/+2/+3), gid 1 & 2 = identical-tier flat stats.
const TG = [
  { groupWs: [156, 191, 225], effects: [ {ws:[52,47,41]}, {ws:[52,72,92]}, {ws:[52,72,92]} ] },
  { groupWs: [156, 156, 156], effects: [ {ws:[52,52,52]} ] },
  { groupWs: [156, 156, 156], effects: [ {ws:[52,52,52]} ] },
];
const TWs = [10046, 10058, 10059];
const tItem = (gid, ei) => ({ ws: TG[gid].effects[ei].ws, groupWs: TG[gid].groupWs, gid });
const tiersFor = K => Array.from({ length: K }, (_, i) => i);

// Vigor+3 on Grand (1 desired, 2 free): closed form using all three tier weights.
const v3grand = 52/10046
  + (10046-156)/10046 * ( 72/10058
  + (10058-191)/10058 * ( 92/10059 ) );
test('efSlots Vigor+3 Grand (per-slot tiers)',
  efSlots(TG, TWs, tiersFor(3), [tItem(0, 2)], new Set()),
  v3grand, 1e-12);

// Delicate (K=1) is exact = w0/W0 (tier 0 = table 110, no free slot).
test('efSlots Vigor+3 Delicate = 52/10046',
  efSlots(TG, TWs, tiersFor(1), [tItem(0, 2)], new Set()),
  52/10046, 1e-12);

// Weak effect on Grand goes BELOW the old 3*w/W model.
const v1grand = 52/10046
  + (10046-156)/10046 * ( 47/10058
  + (10058-191)/10058 * ( 41/10059 ) );
test('efSlots Vigor+1 Grand (weak, below old model)',
  efSlots(TG, TWs, tiersFor(3), [tItem(0, 0)], new Set()),
  v1grand, 1e-12);

// Identical-tier flat stat on Grand: still applies group exclusion, so < 3*52/W.
const flatGrand = 52/10046
  + (10046-156)/10046 * ( 52/10058
  + (10058-156)/10058 * ( 52/10059 ) );
test('efSlots identical-tier flat-stat Grand',
  efSlots(TG, TWs, tiersFor(3), [tItem(1, 0)], new Set()),
  flatGrand, 1e-12);

// Two flat stats on Grand (n=2, K=3): one free slot.
test('efSlots two flat-stats Grand (n=2,K=3)',
  efSlots(TG, TWs, tiersFor(3), [tItem(1, 0), tItem(2, 0)], new Set()),
  0.000160476969, 1e-9);

// Two flat stats on Polished (n=2, K=2): no free slot, n=K.
test('efSlots two flat-stats Polished (n=2,K=2)',
  efSlots(TG, TWs, tiersFor(2), [tItem(1, 0), tItem(2, 0)], new Set()),
  0.000054365150, 1e-9);

// n > K returns 0 (more desired than slots).
test('efSlots n=2 on Delicate (K=1) = 0',
  efSlots(TG, TWs, tiersFor(1), [tItem(1, 0), tItem(2, 0)], new Set()),
  0, 1e-15);
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node tests/calc.test.mjs`
Expected: FAIL / crash with `ReferenceError: efSlots is not defined`.

- [ ] **Step 3: Add the `efSlots` implementation (insert near the top of `tests/calc.test.mjs`, after the existing `calculateProbability` function, around line 28)**

```js
// Per-slot tier recursion (regular pool). Mirrors index.html exactly.
function efSlots(groups, Ws, tiers, D, used) {
  if (tiers.length === 0) return D.length === 0 ? 1 : 0;
  const t = tiers[0], rest = tiers.slice(1);
  let Wt = Ws[t];
  for (const gid of used) Wt -= groups[gid].groupWs[t];
  let total = 0;
  for (let i = 0; i < D.length; i++) {
    const d = D[i];
    if (used.has(d.gid)) continue;
    const u = new Set(used); u.add(d.gid);
    total += (d.ws[t] / Wt) * efSlots(groups, Ws, rest, D.filter((_, j) => j !== i), u);
  }
  if (rest.length >= D.length) {
    let freeGW = 0; const seen = new Set();
    for (const d of D) if (!used.has(d.gid) && !seen.has(d.gid)) { seen.add(d.gid); freeGW += d.groupWs[t]; }
    total += ((Wt - freeGW) / Wt) * efSlots(groups, Ws, rest, D, used);
  }
  return total;
}
```

- [ ] **Step 4: Run tests to verify all pass**

Run: `node tests/calc.test.mjs`
Expected: all tests PASS (existing `calculateProbability` tests + 7 new `efSlots` tests), exit code 0.

- [ ] **Step 5: Commit**

```bash
git add tests/calc.test.mjs
git commit -m "test: add efSlots per-slot tier recursion with reference cases"
```

---

### Task 3: Wire `efSlots` into `index.html` (data + formula)

**Files:**
- Modify: `index.html` — `DATA` constant (line 258), `activeGroups`/`activeW` (265-279), `calculateProbabilityV2` (281-351), `calculateProbabilityV1` (353-388)

**Interfaces:**
- Consumes: `efSlots` (Task 2 signature), regenerated `DATA` (Task 1 shape).
- Produces: regular-mode V1/V2 results computed via `efSlots`; DON results unchanged.

- [ ] **Step 1: Add `activeWs()` and update `activeGroups()` (replace `index.html:265-279`)**

```js
    function activeGroups() {
      const src = mode === 'don' ? DON_DATA : DATA;
      if (!preDLC) return src.groups;
      return src.groups
        .map(g => {
          const effects = g.effects.filter(e => !e.dlc);
          if (g.groupWs) { // regular pool: per-tier group weights
            const groupWs = [0, 1, 2].map(t => effects.reduce((s, e) => s + e.ws[t], 0));
            return { ...g, groupWs, effects };
          }
          const groupW = effects.reduce((s, e) => s + e.w, 0); // DON: scalar
          return { ...g, groupW, effects };
        })
        .filter(g => g.effects.length > 0);
    }
    function activeW() { // DON single-pool total
      return preDLC ? DON_DATA.wTotalPreDLC : DON_DATA.wTotal;
    }
    function activeWs() { // regular per-tier totals [W0, W1, W2]
      return preDLC ? DATA.wTotalsPreDLC : DATA.wTotals;
    }
```

- [ ] **Step 2: Add top-level `efSlots` (insert immediately before `function calculateProbabilityV2` at `index.html:281`)**

```js
    // Per-slot tier recursion for the regular pool. Each of the K slots draws from a
    // different tier table (slot i -> tier i); slots processed in tier-ascending order.
    //   groups: activeGroups();  Ws: activeWs() (3 per-tier totals)
    //   tiers: [0..K-1];  D: [{ ws:[3], groupWs:[3], gid }];  used: Set of gid
    function efSlots(groups, Ws, tiers, D, used) {
      if (tiers.length === 0) return D.length === 0 ? 1 : 0;
      const t = tiers[0], rest = tiers.slice(1);
      let Wt = Ws[t];
      for (const gid of used) Wt -= groups[gid].groupWs[t];
      let total = 0;
      for (let i = 0; i < D.length; i++) {
        const d = D[i];
        if (used.has(d.gid)) continue;
        const u = new Set(used); u.add(d.gid);
        total += (d.ws[t] / Wt) * efSlots(groups, Ws, rest, D.filter((_, j) => j !== i), u);
      }
      if (rest.length >= D.length) {
        let freeGW = 0; const seen = new Set();
        for (const d of D) if (!used.has(d.gid) && !seen.has(d.gid)) { seen.add(d.gid); freeGW += d.groupWs[t]; }
        total += ((Wt - freeGW) / Wt) * efSlots(groups, Ws, rest, D, used);
      }
      return total;
    }
```

- [ ] **Step 3: Add the regular branch to `calculateProbabilityV2` (replace the body between `if (m === 0) return 0;` and the start of `function perm` — i.e. insert after `index.html:285` and before line 287's `const groups = activeGroups();` is reused)**

Replace `index.html:287-290`:
```js
      const groups = activeGroups();
      const W = activeW();
      const nCurses = DON_DATA.curses.length;
      const nAcc = curseFilter.indices.size;
```
with:
```js
      const groups = activeGroups();

      // Regular pool: per-slot tier model.
      if (mode !== 'don') {
        const Ws = activeWs();
        const tiers = Array.from({ length: K }, (_, i) => i);
        function kSubsetsR(arr, k) {
          if (k === 0) return [[]];
          if (arr.length < k) return [];
          const [first, ...rest] = arr;
          return [...kSubsetsR(rest, k - 1).map(s => [first, ...s]), ...kSubsetsR(rest, k)];
        }
        const itemsOf = subset => subset.map(s => ({
          ws: [0, 1, 2].map(t => s.effectIndices.reduce((sum, ei) => sum + groups[s.groupIdx].effects[ei].ws[t], 0)),
          groupWs: groups[s.groupIdx].groupWs,
          gid: s.groupIdx,
        }));
        if (m <= K) return efSlots(groups, Ws, tiers, itemsOf(pool), new Set()) * colorFactor;
        let sum = 0;
        for (const subset of kSubsetsR(pool, K)) sum += efSlots(groups, Ws, tiers, itemsOf(subset), new Set());
        return sum * colorFactor;
      }

      // DON pool: single-pool model (unchanged).
      const W = activeW();
      const nCurses = DON_DATA.curses.length;
      const nAcc = curseFilter.indices.size;
```

The remaining DON V2 code (`perm`, `efGroupExclusion`, `curseFactor`, `items`, the `m <= K` / `kSubsets` blocks at `index.html:292-350`) stays unchanged — it now only runs for DON.

- [ ] **Step 4: Add the regular branch to `calculateProbabilityV1` (modify `index.html:359-360`)**

Replace `index.html:359-360`:
```js
      const groups = activeGroups();
      const W = activeW();
```
with:
```js
      const groups = activeGroups();

      // Regular pool: per-slot tier model.
      if (mode !== 'don') {
        const Ws = activeWs();
        const tiers = Array.from({ length: K }, (_, i) => i);
        const D = slots.map(s => ({
          ws: groups[s.groupIdx].effects[s.effectIdx].ws,
          groupWs: groups[s.groupIdx].groupWs,
          gid: s.groupIdx,
        }));
        return efSlots(groups, Ws, tiers, D, new Set()) * colorFactor;
      }

      // DON pool: single-pool model (unchanged).
      const W = activeW();
```

The remaining DON V1 code (`ff`, `items`, `efV1`, `curseFactor`, final return at `index.html:361-387`) stays unchanged — it now only runs for DON.

- [ ] **Step 5: Re-embed the regenerated `DATA` constant**

Run (from `README.md`'s embed snippet):
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

- [ ] **Step 6: Verify embedded DATA shape and that DON tests still pass**

Run:
```bash
grep -o 'const DATA = {"wTotals":\[10046,10058,10059\]' index.html && echo "DATA shape OK"
node tests/calc.test.mjs
```
Expected: prints `DATA shape OK`, then all tests pass (DON path untouched, so existing tests green).

- [ ] **Step 7: Manual browser smoke test**

Open `index.html` in a browser. Set Regular mode, Grand quality, no color. In V1 (Exact Effects), select the `Vigor` group → `Vigor +3`. Confirm the result reads ≈ **2.11%** (0.0210565). Switch quality to Delicate → confirm it reads ≈ **0.518%** (52/10046). Switch to DON mode and confirm a known DON result is unchanged from before.

- [ ] **Step 8: Commit**

```bash
git add index.html
git commit -m "feat: per-slot tier model for regular relics (V1 + V2); DON unchanged"
```

---

### Task 4: Update methodology note and README

**Files:**
- Modify: `index.html:228-231` (methodology `<pre>`/`<p>` block)
- Modify: `README.md:27-40` (Probability Formula section)

**Interfaces:** none (documentation only).

- [ ] **Step 1: Update the in-app methodology note (`index.html:228-231`)**

Replace the formula block at `index.html:228-231` with text describing the per-slot model. Locate the existing `<pre>P = K! × Σ_{K-subsets S} ef(S, W) ...</pre>` and surrounding `<p>`/`<pre>` and replace with:

```html
        <pre>Regular pool: P = colorFactor × efSlots(tiers[0..K-1], desired effects)</pre>
        <p data-i18n-html="meth_formula_p3">Each relic slot draws from its own tier table: slot 1 from table 110, slot 2 from 210, slot 3 from 310 (Delicate uses tier 1 only; Polished tiers 1–2; Grand tiers 1–3). The same effect has a different weight per tier — weak effects are commonest in tier 1, strong effects in tier 3. <code>efSlots</code> sums over which slot each desired effect lands in (using that slot's weight) and treats unselected slots as free; a used group is removed from later slots. Slots are processed in tier-ascending order. Delicate results are exact; Deep of Night relics use a single-pool model (no tiers).</p>
        <pre>efSlots([], D) = (D empty) ? 1 : 0
efSlots([t,…], D) = Σ_d (w_d[t] / W_t) · efSlots(rest, D∖d)   [desired d lands in slot t]
                  + ((W_t − freeGW_t) / W_t) · efSlots(rest, D)   [slot t free, if slots remain]</pre>
```

Note: if the `data-i18n-html="meth_formula_p3"` key is also defined in `locales/*.js`, update those translations too, or remove the `data-i18n-html` attribute so the literal English text is used. Check with: `grep -rn "meth_formula_p3" locales/ i18n.js`.

- [ ] **Step 2: Update the README Probability Formula section (`README.md:27-40`)**

Replace lines 27–40 with:

```markdown
## Probability Formula

**Regular pool** — each relic slot draws from its own tier table, so a quality-K relic
uses K differently-weighted tables:

```
P = colorFactor × efSlots(tiers[0..K-1], desired effects)
```

- Slot _i_ draws from tier _i_: tier 0 = table 110 (W=10046), tier 1 = table 210 (W=10058), tier 2 = table 310 (W=10059).
- `efSlots` sums over which slot each desired effect lands in (using that slot's per-tier weight); unselected slots are free; a used group is removed from later slots; slots processed tier-ascending.
- Delicate (1 slot) is exact; the change matters most for high-tier effects on Grand relics.

**Deep of Night pool** (unchanged, single-pool model):

```
P = K×(K−1)×…×(K−n+1) × ∏(w_i / W) × (0.25 if specific color) × ∏(1/24 per specific curse)
```

- DON pool: tables 2000000 + 2100000, W = 19961. Curse pool: table 3000000, 24 curses, W = 2400.
```

- [ ] **Step 3: Verify formatting**

Run: `grep -n "efSlots" README.md index.html`
Expected: matches in both files; manually confirm the README renders (no broken code fences) and the methodology note shows in the browser.

- [ ] **Step 4: Commit**

```bash
git add index.html README.md
git commit -m "docs: describe per-slot tier model in methodology note and README"
```

---

## Self-Review

**Spec coverage:**
- Data model (3 weights/effect, 3 group-weights, 3 totals, DON unchanged) → Task 1. ✓
- `efSlots` recursion (fixed tier order, free-slot refinement) → Task 2 (impl+tests), Task 3 (embed). ✓
- V1 + V2 integration, regular branch only, DON via existing path → Task 3. ✓
- Pre-DLC per-tier totals + per-tier `groupWs` in `activeGroups` → Task 1 (`wTotalsPreDLC`) + Task 3 (`activeGroups`/`activeWs`). ✓
- Validation: n=K regression, free-slot n<K, per-slot expected values, Delicate exactness, DON unchanged → Task 2 tests + Task 3 Step 6/7. ✓
- Methodology note + README → Task 4. ✓
- Worked example (Vigor+3 Grand = 2.106%) → Task 2 test `efSlots Vigor+3 Grand` + Task 3 Step 7 smoke. ✓

**Placeholder scan:** No TBD/TODO; all code blocks complete; all expected values are concrete numbers.

**Type consistency:** `efSlots(groups, Ws, tiers, D, used)` signature identical in Task 2 (test) and Task 3 Step 2 (index.html). `D` item shape `{ ws:[3], groupWs:[3], gid }` consistent across V1 (`gid: s.groupIdx`) and V2 (`itemsOf`). `activeWs()` returns `[W0,W1,W2]`; `groups[gid].groupWs` is a 3-array everywhere. Data shape from Task 1 (`ws`, `groupWs`, `wTotals`, `wTotalsPreDLC`) matches all consumers.
