# Relic Calculator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single self-contained `index.html` that calculates the probability of rolling a desired set of effects on an Elden Ring Nightreign relic.

**Architecture:** Three logical layers in one HTML file: embedded JSON data (groups + effects), pure-function probability math, and a vanilla JS UI wired to the math. A separate `prepare_data.mjs` script regenerates the embedded JSON from the raw game data whenever the game is patched.

**Tech Stack:** Vanilla HTML/CSS/JS (no framework, no build step). Node.js for data prep script and tests (`--experimental-vm-modules` not needed — pure ESM with `.mjs`).

---

## File Map

| File | Purpose |
|---|---|
| `prepare_data.mjs` | Reads `data/relic_groups.json`, applies clean group names, outputs `data/relic_data.json` |
| `data/relic_data.json` | Clean embedded-ready effect groups (groupName + effect name strings only) |
| `tests/calc.test.mjs` | Node.js tests for `comb()` and `calculateProbability()` |
| `index.html` | The deliverable: embedded data + probability logic + UI |

---

## Task 1: Generate Clean Embedded Data

**Files:**
- Create: `prepare_data.mjs`
- Create: `data/relic_data.json` (output)

The raw `data/relic_groups.json` has auto-derived group names and extra fields (`compatibilityId`, `id`, `chars`). This task strips it down to `{ groupName, effects: string[] }` and applies human-readable names.

- [ ] **Step 1: Write `prepare_data.mjs`**

```js
import { readFileSync, writeFileSync } from 'fs';

const NAME_OVERRIDES = {
  100:     'Attack Power',
  200:     'Starting Armament Element / Status',
  300:     'Starting Armament Skill',
  800:     'Spell School',
  900:     'Character Ability',
  6630000: 'Dormant Power - Weapon Discovery',
  7012200: 'Slowly Restore HP When HP Is Low',
  7050000: 'Raised Stamina Recovery for Nearby Allies',
  7082500: 'Max FP with 3+ Staves / Seals',
  7082700: 'Max HP with 3+ Shields',
  7090100: 'Defeating Enemies Restores HP for Allies',
  7240000: 'Improved Poise & Damage Negation When Knocked Back',
  7260300: 'Attack Power vs Poison / Rot Afflicted',
  7340000: 'HP Restoration on Attack (by Weapon Type)',
  7350000: 'FP Restoration on Attack (by Weapon Type)',
};

const raw = JSON.parse(readFileSync('data/relic_groups.json', 'utf8'));

const clean = raw
  .map(g => ({
    groupName: NAME_OVERRIDES[g.compatibilityId] ?? g.groupName,
    effects: g.effects.map(e => e.name),
  }))
  .sort((a, b) => a.groupName.localeCompare(b.groupName));

writeFileSync('data/relic_data.json', JSON.stringify(clean, null, 2));
console.log(`Wrote ${clean.length} groups, ${clean.reduce((s, g) => s + g.effects.length, 0)} effects`);
```

- [ ] **Step 2: Run it**

```bash
node prepare_data.mjs
```

Expected output:
```
Wrote 77 groups, 356 effects
```

- [ ] **Step 3: Spot-check `data/relic_data.json`**

```bash
node -e "
const d = JSON.parse(require('fs').readFileSync('data/relic_data.json','utf8'));
console.log('Groups:', d.length);
// Verify key groups exist with correct names
const names = d.map(g => g.groupName);
['Attack Power','Spell School','Vigor','Character Ability','HP Restoration on Attack (by Weapon Type)']
  .forEach(n => console.log(n + ':', names.includes(n) ? 'OK' : 'MISSING'));
// Show Attack Power group size
const ap = d.find(g => g.groupName === 'Attack Power');
console.log('Attack Power effects:', ap.effects.length);
// Show Vigor effects
const vig = d.find(g => g.groupName === 'Vigor');
console.log('Vigor effects:', vig.effects);
"
```

Expected output:
```
Groups: 77
Attack Power: OK
Spell School: OK
Vigor: OK
Character Ability: OK
HP Restoration on Attack (by Weapon Type): OK
Attack Power effects: 71
Vigor effects: [ 'Vigor +1', 'Vigor +2', 'Vigor +3' ]
```

- [ ] **Step 4: Commit**

```bash
git init
git add prepare_data.mjs data/relic_data.json data/relic_groups.json data/*.csv data/*.xml parse_relics.mjs docs/
git commit -m "feat: add relic data extraction pipeline and compiled effect groups"
```

---

## Task 2: Probability Calculation (TDD)

**Files:**
- Create: `tests/calc.test.mjs`

The math lives in one function. We test it standalone in Node before touching the HTML.

Reference values (G=77, all uniform probability):
- n=1, group size 3 (e.g. Vigor), Grand → **1.2987%**
- n=1, group size 1 (e.g. Flask Also Heals Allies), Grand → **3.8961%**
- n=1, group size 71 (Attack Power), Grand → **0.0549%**
- n=2, both groups size 3, Grand → **0.0114%**
- n=3, all groups size 1, Grand → **0.0014%**
- n=1, group size 3, Grand, color specified → **0.3247%**
- n=1, group size 3, Polished (K=2) → **~1.2987% * 2/3 ratio** = **0.8658%**
- n=2, both groups size 3, Polished (K=2) → **0.0038%**
- n=1, group size 3, Delicate (K=1) → **0.4329%**
- impossible: n=2 on Delicate (K=1) → **0**
- impossible: two desired effects from the same group → **0**

- [ ] **Step 1: Write `tests/calc.test.mjs`**

```js
// Standalone — no DOM, no imports needed.
// Copy-paste the two functions here so we test the exact code that goes in the HTML.

function comb(n, k) {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  let r = 1;
  for (let i = 0; i < k; i++) r = r * (n - i) / (i + 1);
  return r;
}

// groups: array of { groupName, effects: string[] }
// slots:  array of { groupIdx: number, effectIdx: number }
// quality: 1 | 2 | 3
// colorSelected: boolean
function calculateProbability(groups, quality, colorSelected, slots) {
  const G = groups.length;
  const K = quality;
  const n = slots.length;
  if (n === 0 || n > K) return 0;

  // Check for impossible: two slots from same group
  const groupIndices = slots.map(s => s.groupIdx);
  if (new Set(groupIndices).size < n) return 0;

  const groupFactor = comb(G - n, K - n) / comb(G, K);
  const effectFactor = slots.reduce((prod, s) => prod * (1 / groups[s.groupIdx].effects.length), 1);
  const colorFactor = colorSelected ? 0.25 : 1;

  return groupFactor * effectFactor * colorFactor;
}

// --- Test harness ---
let passed = 0, failed = 0;
function test(label, actual, expected, tolerance = 1e-7) {
  const ok = Math.abs(actual - expected) < tolerance;
  if (ok) { passed++; console.log('  PASS ' + label); }
  else { failed++; console.error('  FAIL ' + label + ': got ' + actual + ', expected ' + expected); }
}

// Build a minimal groups array matching real data shape
const G_REAL = 77;
// Fake groups: first 77 entries with sizes matching test cases
const groups = Array.from({ length: G_REAL }, (_, i) => ({ groupName: 'G' + i, effects: ['e'] }));
// Override sizes for specific test slots
groups[0].effects = ['e1', 'e2', 'e3'];       // size 3  → Vigor-like
groups[1].effects = ['e'];                      // size 1  → Flask-like
groups[2].effects = Array.from({ length: 71 }, (_, i) => 'e' + i); // size 71 → Attack Power
groups[3].effects = ['e1', 'e2', 'e3'];       // size 3  → second stat group

console.log('--- comb() ---');
test('comb(0,0)', comb(0, 0), 1);
test('comb(5,0)', comb(5, 0), 1);
test('comb(5,5)', comb(5, 5), 1);
test('comb(5,2)', comb(5, 2), 10);
test('comb(77,3)', comb(77, 3), 73150);
test('comb(76,2)', comb(76, 2), 2850);
test('comb(3,-1)', comb(3, -1), 0);
test('comb(3,4)', comb(3, 4), 0);

console.log('--- calculateProbability() ---');
// n=1, size 3, Grand, no color
test('n=1 size=3 Grand', calculateProbability(groups, 3, false, [{ groupIdx: 0, effectIdx: 0 }]), 2850 / 73150 / 3, 1e-9);

// n=1, size 1, Grand
test('n=1 size=1 Grand', calculateProbability(groups, 3, false, [{ groupIdx: 1, effectIdx: 0 }]), 2850 / 73150 / 1, 1e-9);

// n=1, size 71, Grand
test('n=1 size=71 Grand', calculateProbability(groups, 3, false, [{ groupIdx: 2, effectIdx: 0 }]), 2850 / 73150 / 71, 1e-9);

// n=2, both size 3, Grand
test('n=2 size=3,3 Grand', calculateProbability(groups, 3, false, [{ groupIdx: 0, effectIdx: 0 }, { groupIdx: 3, effectIdx: 0 }]), 75 / 73150 / 9, 1e-9);

// n=3, all size 1, Grand
test('n=3 all size=1 Grand', calculateProbability(groups, 3, false, [{ groupIdx: 1, effectIdx: 0 }, { groupIdx: 4, effectIdx: 0 }, { groupIdx: 5, effectIdx: 0 }]), 1 / 73150, 1e-9);

// color factor
test('n=1 size=3 Grand color', calculateProbability(groups, 3, true, [{ groupIdx: 0, effectIdx: 0 }]), 2850 / 73150 / 3 / 4, 1e-9);

// Polished K=2, n=1, size 3
test('n=1 size=3 Polished', calculateProbability(groups, 2, false, [{ groupIdx: 0, effectIdx: 0 }]), comb(76, 1) / comb(77, 2) / 3, 1e-9);

// Polished K=2, n=2, both size 3
test('n=2 size=3,3 Polished', calculateProbability(groups, 2, false, [{ groupIdx: 0, effectIdx: 0 }, { groupIdx: 3, effectIdx: 0 }]), 1 / comb(77, 2) / 9, 1e-9);

// Delicate K=1, n=1, size 3
test('n=1 size=3 Delicate', calculateProbability(groups, 1, false, [{ groupIdx: 0, effectIdx: 0 }]), 1 / 77 / 3, 1e-9);

// Impossible: n=2 on Delicate
test('n=2 Delicate impossible', calculateProbability(groups, 1, false, [{ groupIdx: 0, effectIdx: 0 }, { groupIdx: 3, effectIdx: 0 }]), 0);

// Impossible: same group twice
test('same group twice', calculateProbability(groups, 3, false, [{ groupIdx: 0, effectIdx: 0 }, { groupIdx: 0, effectIdx: 1 }]), 0);

// Empty slots
test('no slots', calculateProbability(groups, 3, false, []), 0);

console.log('\n' + passed + ' passed, ' + failed + ' failed');
if (failed > 0) process.exit(1);
```

- [ ] **Step 2: Run tests**

```bash
node tests/calc.test.mjs
```

The functions are defined inline in the test file, so all tests should pass immediately — this validates the math before we copy it to the HTML.

- [ ] **Step 3: Verify output**

Expected:
```
--- comb() ---
  PASS comb(0,0)
  PASS comb(5,0)
  ...
--- calculateProbability() ---
  PASS n=1 size=3 Grand
  ...
14 passed, 0 failed
```

- [ ] **Step 4: Commit**

```bash
git add tests/calc.test.mjs
git commit -m "test: add probability calculation test suite"
```

---

## Task 3: Build `index.html` — Structure, Data, and Styles

**Files:**
- Create: `index.html`

Build the static skeleton with embedded data and CSS. No JS logic yet — just confirm it renders correctly in a browser.

- [ ] **Step 1: Create `index.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nightreign Relic Calculator</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: sans-serif; background: #1a1a1a; color: #e0e0e0; max-width: 640px; margin: 2rem auto; padding: 0 1rem; }
    h1 { font-size: 1.3rem; margin-bottom: 1.5rem; color: #f0c060; }
    .controls { display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
    .controls label { display: flex; flex-direction: column; gap: 0.3rem; font-size: 0.85rem; color: #aaa; }
    select { background: #2a2a2a; color: #e0e0e0; border: 1px solid #444; padding: 0.4rem 0.6rem; font-size: 0.9rem; border-radius: 4px; cursor: pointer; }
    select:focus { outline: 1px solid #f0c060; }
    .slot { display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.6rem; flex-wrap: wrap; }
    .slot select { flex: 1; min-width: 180px; }
    .remove-btn { background: none; border: 1px solid #555; color: #aaa; padding: 0.3rem 0.6rem; border-radius: 4px; cursor: pointer; font-size: 0.8rem; }
    .remove-btn:hover { border-color: #f06060; color: #f06060; }
    #add-slot { background: none; border: 1px dashed #555; color: #aaa; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; margin-top: 0.4rem; font-size: 0.85rem; }
    #add-slot:hover { border-color: #f0c060; color: #f0c060; }
    #result { margin-top: 1.5rem; font-size: 1.4rem; color: #f0c060; min-height: 2rem; }
    #result.impossible { color: #f06060; font-size: 1rem; }
    .note { font-size: 0.75rem; color: #666; margin-top: 0.4rem; }
  </style>
</head>
<body>
  <h1>Nightreign Relic Probability Calculator</h1>

  <div class="controls">
    <label>
      Quality
      <select id="quality">
        <option value="3">Grand (3 effects)</option>
        <option value="2">Polished (2 effects)</option>
        <option value="1">Delicate (1 effect)</option>
      </select>
    </label>
    <label>
      Color
      <select id="color">
        <option value="">Any</option>
        <option value="blue">Blue</option>
        <option value="yellow">Yellow</option>
        <option value="green">Green</option>
        <option value="red">Red</option>
      </select>
    </label>
  </div>

  <div id="slots-container"></div>
  <button id="add-slot">+ Add desired effect</button>
  <p class="note">Assumes uniform probability. Based on game data v1.03.2 + DLC.</p>

  <div id="result"></div>

  <script>
    const GROUPS = GROUPS_PLACEHOLDER;
  </script>
</body>
</html>
```

- [ ] **Step 2: Embed the real data — replace `GROUPS_PLACEHOLDER`**

```bash
node -e "
const d = JSON.parse(require('fs').readFileSync('data/relic_data.json','utf8'));
const json = JSON.stringify(d);
const html = require('fs').readFileSync('index.html','utf8');
require('fs').writeFileSync('index.html', html.replace('GROUPS_PLACEHOLDER', json));
console.log('Embedded', d.length, 'groups');
"
```

Expected: `Embedded 77 groups`

- [ ] **Step 3: Open in browser and confirm it loads without errors**

Open `index.html` in a browser. The page should show the title, two dropdowns (Quality and Color), and a dashed "Add desired effect" button. Open the browser console — no errors.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: add HTML skeleton with embedded relic data and styles"
```

---

## Task 4: Implement UI Logic — Slots and Dropdowns

**Files:**
- Modify: `index.html` — replace the `<script>` block with full UI logic

Add the slot management code: adding effect slots, populating group/effect dropdowns, removing a slot, and enforcing the one-group-per-slot constraint.

- [ ] **Step 1: Replace the `<script>` block in `index.html`**

Replace everything from `<script>` to `</script>` with:

```html
  <script>
    const GROUPS = /* (already embedded — do not replace this line) */;

    // --- Probability math ---
    function comb(n, k) {
      if (k < 0 || k > n) return 0;
      if (k === 0 || k === n) return 1;
      let r = 1;
      for (let i = 0; i < k; i++) r = r * (n - i) / (i + 1);
      return r;
    }

    function calculateProbability(groups, quality, colorSelected, slots) {
      const G = groups.length;
      const K = quality;
      const n = slots.length;
      if (n === 0 || n > K) return 0;
      const groupIndices = slots.map(s => s.groupIdx);
      if (new Set(groupIndices).size < n) return 0;
      const groupFactor = comb(G - n, K - n) / comb(G, K);
      const effectFactor = slots.reduce((prod, s) => prod * (1 / groups[s.groupIdx].effects.length), 1);
      const colorFactor = colorSelected ? 0.25 : 1;
      return groupFactor * effectFactor * colorFactor;
    }

    // --- UI ---
    const slotsContainer = document.getElementById('slots-container');
    const addSlotBtn = document.getElementById('add-slot');
    const qualitySelect = document.getElementById('quality');
    const colorSelect = document.getElementById('color');
    const resultEl = document.getElementById('result');

    function getQuality() { return parseInt(qualitySelect.value); }
    function getColorSelected() { return colorSelect.value !== ''; }

    function getSelectedGroupIndices() {
      return [...slotsContainer.querySelectorAll('.group-select')]
        .map(s => parseInt(s.value))
        .filter(v => !isNaN(v));
    }

    function buildGroupOptions(currentGroupIdx) {
      const usedIndices = new Set(getSelectedGroupIndices());
      let html = '<option value="">— select group —</option>';
      GROUPS.forEach((g, i) => {
        if (!usedIndices.has(i) || i === currentGroupIdx) {
          const sel = i === currentGroupIdx ? ' selected' : '';
          html += `<option value="${i}"${sel}>${g.groupName} (${g.effects.length})</option>`;
        }
      });
      return html;
    }

    function buildEffectOptions(groupIdx, currentEffectIdx) {
      if (isNaN(groupIdx) || groupIdx < 0) return '<option value="">— select effect —</option>';
      let html = '';
      GROUPS[groupIdx].effects.forEach((name, i) => {
        const sel = i === currentEffectIdx ? ' selected' : '';
        html += `<option value="${i}"${sel}>${name}</option>`;
      });
      return html;
    }

    function refreshGroupDropdowns() {
      slotsContainer.querySelectorAll('.slot').forEach(slot => {
        const groupSel = slot.querySelector('.group-select');
        const currentGroupIdx = parseInt(groupSel.value);
        groupSel.innerHTML = buildGroupOptions(currentGroupIdx);
      });
    }

    function addSlot() {
      const slotCount = slotsContainer.querySelectorAll('.slot').length;
      const quality = getQuality();
      if (slotCount >= quality) return;

      const slot = document.createElement('div');
      slot.className = 'slot';

      const groupSel = document.createElement('select');
      groupSel.className = 'group-select';
      groupSel.innerHTML = buildGroupOptions(NaN);

      const effectSel = document.createElement('select');
      effectSel.className = 'effect-select';
      effectSel.innerHTML = '<option value="">— select effect —</option>';

      const removeBtn = document.createElement('button');
      removeBtn.className = 'remove-btn';
      removeBtn.textContent = 'Remove';

      groupSel.addEventListener('change', () => {
        const gIdx = parseInt(groupSel.value);
        effectSel.innerHTML = buildEffectOptions(gIdx, NaN);
        if (!isNaN(gIdx)) effectSel.value = '0';
        refreshGroupDropdowns();
        updateResult();
      });

      effectSel.addEventListener('change', updateResult);

      removeBtn.addEventListener('click', () => {
        slot.remove();
        refreshGroupDropdowns();
        updateAddBtn();
        updateResult();
      });

      // First slot has no remove button
      const isFirst = slotsContainer.querySelectorAll('.slot').length === 0;
      if (isFirst) {
        slot.append(groupSel, effectSel);
      } else {
        slot.append(groupSel, effectSel, removeBtn);
      }
      slotsContainer.appendChild(slot);
      updateAddBtn();
    }

    function updateAddBtn() {
      const slotCount = slotsContainer.querySelectorAll('.slot').length;
      addSlotBtn.disabled = slotCount >= getQuality();
      addSlotBtn.style.opacity = addSlotBtn.disabled ? '0.4' : '1';
    }

    function updateResult() {
      const slots = [...slotsContainer.querySelectorAll('.slot')].map(slot => {
        const gIdx = parseInt(slot.querySelector('.group-select').value);
        const eIdx = parseInt(slot.querySelector('.effect-select').value);
        return { groupIdx: gIdx, effectIdx: eIdx };
      }).filter(s => !isNaN(s.groupIdx) && !isNaN(s.effectIdx));

      if (slots.length === 0) {
        resultEl.textContent = '';
        resultEl.className = '';
        return;
      }

      // Check impossible combination
      const groupIndices = slots.map(s => s.groupIdx);
      if (new Set(groupIndices).size < groupIndices.length) {
        resultEl.textContent = 'Impossible combination (two effects from the same group)';
        resultEl.className = 'impossible';
        return;
      }

      const p = calculateProbability(GROUPS, getQuality(), getColorSelected(), slots);
      resultEl.textContent = 'Probability: ' + (p * 100).toFixed(4) + '%';
      resultEl.className = '';
    }

    qualitySelect.addEventListener('change', () => {
      // Remove excess slots if quality decreased
      const quality = getQuality();
      const slots = [...slotsContainer.querySelectorAll('.slot')];
      slots.slice(quality).forEach(s => s.remove());
      refreshGroupDropdowns();
      updateAddBtn();
      updateResult();
    });

    colorSelect.addEventListener('change', updateResult);
    addSlotBtn.addEventListener('click', addSlot);

    // Initialize
    addSlot();
    updateResult();
  </script>
```

**Important:** The `const GROUPS = /* ... */;` line already has the embedded JSON data from Task 3. Do NOT overwrite the GROUPS value — only add the code that comes after it.

In practice: open `index.html`, find the `<script>` block. The first line is `const GROUPS = [...]` (long, one line). Keep that line exactly as-is. Replace everything after the semicolon on that line (to `</script>`) with the rest of the script above, starting from `// --- Probability math ---`.

- [ ] **Step 2: Open in browser and test manually**

1. Open `index.html`.
2. One slot appears with "— select group —".
3. Select "Vigor" from group dropdown → effect dropdown should show "Vigor +1", "Vigor +2", "Vigor +3" and auto-select the first. Result should show a probability.
4. Click "+ Add desired effect" → second slot appears. "Vigor" should NOT appear in the second slot's group dropdown.
5. Select "Mind" in slot 2 → result updates.
6. Click "+ Add desired effect" → third slot appears.
7. After 3 slots, the add button dims and is disabled.
8. Click "Remove" on slot 2 → slot removed, "Vigor" and "Mind" remain exclusive in remaining slots.
9. Change quality to "Polished" → third slot removed if present, add button shows max 2 slots.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: implement relic calculator UI with dynamic effect slots"
```

---

## Task 5: Edge Cases and Final Polish

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Verify edge cases in browser**

Test each scenario and confirm the correct output:

| Scenario | Expected |
|---|---|
| No slot filled | Result hidden (empty) |
| Group selected, no effect yet | Result hidden |
| n=1 Grand, Vigor +1, no color | `Probability: 1.2987%` |
| n=1 Grand, Flask Also Heals Allies, no color | `Probability: 3.8961%` |
| n=1 Grand, any Attack Power effect, no color | `Probability: 0.0549%` |
| n=1 Grand, Vigor +1, color = Blue | `Probability: 0.3247%` |
| n=2 Grand, Vigor +1 + Mind +1, no color | `Probability: 0.0114%` |
| n=3 Grand, 3 single-effect groups, no color | `Probability: 0.0014%` |
| Quality = Polished, n=2, Vigor +1 + Mind +1 | `Probability: 0.0038%` |
| Quality = Delicate, n=1, Vigor +1 | `Probability: 0.4329%` |
| Switch from Grand to Delicate with 3 slots active | Slots 2+3 removed |

- [ ] **Step 2: Fix the `&amp;` in group name**

The group "Improved Poise & Damage Negation When Knocked Back" may have been parsed with `&amp;` as the HTML entity. Check and fix in `prepare_data.mjs` if needed:

```bash
node -e "
const d = JSON.parse(require('fs').readFileSync('data/relic_data.json','utf8'));
d.filter(g => g.groupName.includes('amp')).forEach(g => console.log(g.groupName));
"
```

If it prints a group with `&amp;`, update `prepare_data.mjs` to unescape HTML entities:

```js
// Add this helper near the top of prepare_data.mjs
function unescapeHtml(str) {
  return str.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
}

// Apply to groupName and each effect name:
const clean = raw.map(g => ({
  groupName: unescapeHtml(NAME_OVERRIDES[g.compatibilityId] ?? g.groupName),
  effects: g.effects.map(e => unescapeHtml(e.name)),
})).sort((a, b) => a.groupName.localeCompare(b.groupName));
```

Then re-run `node prepare_data.mjs` and re-embed using the same approach as Task 3 Step 2 — except the placeholder is already replaced, so use a regex instead:

```bash
node -e "
const d = JSON.parse(require('fs').readFileSync('data/relic_data.json','utf8'));
const json = JSON.stringify(d);
let html = require('fs').readFileSync('index.html','utf8');
html = html.replace(/const GROUPS = \[[\s\S]*?\];/, 'const GROUPS = ' + json + ';');
require('fs').writeFileSync('index.html', html);
console.log('Re-embedded', d.length, 'groups');
"
```

- [ ] **Step 3: Add page title and attribution comment to HTML**

In `index.html`, add a comment block at the very top (before `<!DOCTYPE html>`):

```html
<!--
  Nightreign Relic Probability Calculator
  Data source: github.com/ip1259/Elden-Ring-Nightreign-Legal-Relic-Generator
  Game version: v1.03.2 + DLC1
  Assumes uniform probability across groups and within groups.
-->
```

- [ ] **Step 4: Final commit**

```bash
git add index.html prepare_data.mjs data/relic_data.json
git commit -m "feat: complete nightreign relic probability calculator"
```
