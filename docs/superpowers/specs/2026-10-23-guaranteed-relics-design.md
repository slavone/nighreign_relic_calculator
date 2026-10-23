# Guaranteed Relics in Effect Multipliers — Design Spec

## Intent

Effect Multipliers mode (the `v3` tab) lets a player enter the effects on
their equipped relics and see combined Attack Power / Damage Negation /
resource multipliers. Today every relic panel is free-form: pick a group,
then an effect, up to three times.

Many of the best relics in the game are **guaranteed (fixed-effect)
relics**: Night Lord rewards, character remembrance rewards, Collector
Signboard purchases. Their effects never vary, and several carry effects
that never roll on random relics (Night of the Lord's weapon-switch bonuses,
Glass Necklace's successive-attack tiers, and so on). Players equipping them
today have to rebuild them effect by effect, and the unique effects aren't
available at all.

This feature lets the player pick a guaranteed relic by name. It fills the
whole relic panel with that relic's exact effects.

## Goals

- A "Guaranteed relic" dropdown on each of the 3 **Regular** relic panels.
- The dropdown lists 84 relics in 4 groups: Boss, Remembrance, Collector
  Signboard, Misc.
- Picking a relic replaces the panel's free-form rows with that relic's
  fixed effects, which then feed the existing totals engine exactly as
  hand-picked effects do.
- The 25 effects that only exist on guaranteed relics get classifications
  (below), descriptions and JP/KR names.
- Two of those effects get a stack/tier count dropdown. One of them needs a
  small engine extension (per-step values).
- Pre-DLC mode hides DLC relics. Share links round-trip the selected relic.
- Full JP/KR localisation of all new UI text and relic names.

## Non-goals

- No guaranteed relics on Deep of Night panels. None of these relics are
  Deep relics (`isDeepRelic = 0` for all 84 in EquipParamAntique). The user
  confirmed they are regular-slot only.
- No Small Jar Bazaar relics (IDs 1000–1310), and no +1-stat quest pickups
  (11003, 11004, 12004–12007). The user explicitly excluded these.
- No relic color/slot-color validation. The page has no color concept today.
- No "stackable with self" validation. This is consistent with the existing
  mode's non-goals.
- Effect descriptions stay English-only, as they are today: locales carry
  effect *names* and *conditions*, not descriptions.

## Anti-goals

- Hand-editing JSON or the embedded data in `index.html`. All data goes
  through a prepare script, then regeneration, then the README re-embed
  step (project rule).
- Falling back to English for any new UI string in JP/KR, or dropping a
  `data-i18n` attribute (project rule).
- Taking relic effects from the community sheet when it disagrees with game
  data. The sheet has 3 wrong internal effect IDs (see Data). Game data wins.

## Data

### Sources (authoritative game data)

From [ip1259/Elden-Ring-Nightreign-Legal-Relic-Generator](https://github.com/ip1259/Elden-Ring-Nightreign-Legal-Relic-Generator),
the same repo the project already uses. Add these to `data/`:

- `EquipParamAntique.csv` holds relic params. Relevant columns:
  `ID`, `isDeepRelic`, `relicColor`, `attachEffectTableId_1..3`.
- `en/AntiqueName.fmg.xml` → `data/AntiqueName.fmg.xml` (base relic names).
- `en/AntiqueName_dlc01.fmg.xml` → `data/AntiqueName_dlc01.fmg.xml` (DLC
  relic names).

Effect resolution per relic:
1. Take each non-`-1` `attachEffectTableId_N`.
2. Look it up in `AttachEffectTableParam.csv`; its rows give `attachEffectId`
   (skip `-1`).
3. Read that effect's `attachTextId` from `AttachEffectParam.csv`.
4. Look up the display name in `AttachEffectName(.dlc01).fmg.xml`.
5. Normalise the name the same way `prepare_data.mjs` does (HTML-unescape,
   `\n` → space for lookups).

Several relics use internal effect IDs that differ from the random-pool IDs
but resolve to the same display text. Examples: Dark Night of the Beast uses
100000 = "Taking attacks improves attack power", the same text as pool
7032200, and Fell Omen Fetish uses 10002. Classification and description
lookups are **by name**, exactly as for pool effects, so these resolve
automatically.

The community "Relics" sheet tab was cross-checked: all 84 relics' effects
match game data by text. The sheet has the wrong internal ID for 2001,
12003 and 1500, with the same text.

### Relic list and grouping (84 relics)

Group assignment is explicit. List the IDs in the prepare script and don't
infer the groups.

| Group | IDs |
|---|---|
| **Boss** (18) | 2000, 2001, 2010, 2011, 2020, 2021, 2030, 2031, 2040, 2041, 2050, 2051, 2060, 2061, 2070, 2071, 2080, 2100 |
| **Remembrance** (24) | 11000, 11001, 11002, 12000, 12001, 12002, 12003, 13001, 13002, 14000, 14001, 14002, 15000, 15002, 16001, 16002, 17001, 17002, 18000, 18002, 19000, 19001, 19050, 19051 |
| **Collector Signboard** (39) | every ID in 1400–1920 that has a name in AntiqueName: 1400–1520 and 1600–1750 (step 10), plus 1800, 1820, 1830, 1850, 1860, 1870, 1880, 1890, 1900, 1920 |
| **Misc** (3) | 10000 Old Pocketwatch, 10001 Besmirched Frame, 10002 Fell Omen Fetish |

Some Boss relics (the Dark Night variants, Will of Balance) are bought at
the Collector Signboard for 12 Sigils. The user chose to keep them in
**Boss**.

The Will of Balance (2071) is released. GameWith lists it as bought after
beating Harmonia. The user's CSV note calling it "unreleased" is stale.

### DLC rule

A relic is DLC if its ID appears in `AntiqueName_dlc01.fmg.xml` and not in
`AntiqueName.fmg.xml`. This is the same name-file rule the project used to
identify DLC effects. It yields 32 DLC relics: 2070, 2071, 2080, 19000,
19001, 19050, 19051, and Signboard 1600–1920 (25 relics).

The user confirmed all 32 hide in Pre-DLC mode. Night of the Lord (2100) is
base game, as both the name file and the user confirm.

Within the 25 DLC Signboard relics, 19 carry only base-game effects. The
user chose to hide them anyway (best guess: Signboard stock added with the
DLC). If an in-game check without the DLC proves otherwise, flipping them
must be a one-line change to an override set in the prepare script. Design
for that.

### Output

Add a prepare step (new script, or an extension of `prepare_data.mjs`, the
builder's call). It writes `data/fixed_relics.json`, embedded into
`index.html` the same way `relic_data.json` is. Suggested shape per relic:
`{ id, name, group, dlc?, color, effects: [{ id, name, desc?, mul? }] }`,
with `mul`/`desc` attached by name from `effect_multipliers.mjs` /
`descriptions.mjs` exactly as `prepare_data.mjs` does. Keep effects in game
order (table 1 → 2 → 3).

## UI

### Dropdown

- Each of the 3 Regular relic panels gets a "Guaranteed relic" `<select>`
  above its effect rows. The default option is "— none —".
- Options sit in `<optgroup>`s: Boss, Remembrance, Collector Signboard,
  Misc. Order within a group is the builder's call. ID order is a sensible
  default, since it matches in-game grouping by character and night.
- **Labels.** Boss, Remembrance and Misc relics show the relic name.
  Collector Signboard relics all share four names ("Grand Burning/Drizzly/
  Luminous/Tranquil Scene"), so their label is
  `<scene name> — <first effect name>`, e.g.
  "Grand Burning Scene — [Wylder] Improved Mind, Reduced Vigor". This was my
  call, presented to the user without objection. In JP/KR, both parts are
  translated: the scene name from the relic-name locale entries, the effect
  via `I18N.effectName`.
- Deep of Night panels get no dropdown.

### Panel behaviour when a relic is selected

- The free-form rows and the "+ Add desired effect" button are hidden. The
  panel shows a read-only list of the relic's effects, each with its name
  (localised) and description, styled consistently with the existing slot
  rows.
- **Exception: count dropdowns stay interactive.** An effect with
  `variableCount` shows the same count dropdown it would show in a
  free-form row. This covers Signboard 1510's Evergaol effect, Glass
  Necklace and Night of Dregs (below).
- Switching back to "— none —" restores the panel to an empty free-form
  state. Whether any previously entered free-form rows survive is the
  builder's call; empty is acceptable.
- `getBuildEffects()` collects a fixed relic's effects into the same flat
  list as free-form effects, respecting count dropdowns. Totals, specials
  checkboxes, Other Effects and flat sums then all work unchanged.

### Pre-DLC

- In Pre-DLC mode, DLC relics don't appear in the dropdown.
- If a panel holds a DLC relic when the user switches to Pre-DLC, or loads
  a share link with `dlc=pre`, the panel resets to "— none —". This mirrors
  how DLC effects already disappear.

### Share links

- The selected relic is encoded per Regular panel. Key naming is the
  builder's call; it must not collide with existing `${prefix}${relicNum}…`
  keys.
- Count-dropdown values of a fixed relic's effects are encoded too, as they
  are today for free-form rows.
- A link with a selected relic takes priority over any free-form keys for
  that panel.

### Methodology section

Add `EquipParamAntique.csv` and `AntiqueName(.dlc01).fmg.xml` to "Files
Used" with a one-line purpose, in all locales.

## Effect classifications (25 new entries in `effect_multipliers.mjs`)

Every other effect on these relics already exists in the random pools and
keeps its current classification (or lack of one). That includes the
character "[X]" effects and Increased Maximum HP/FP/Stamina.

Numbers come from the user's "Nightreign Useful Info — Relic Effects" CSV
unless noted. The user reviewed this table and approved it with the two
changes already folded in (Dregs and Glass Necklace become counted).

| Effect name (exact) | Entry |
|---|---|
| Improved Melee Attack Power | `baseline`, damage, axes `['universal']`, 1.05 |
| Improved Physical Damage Negation | `baseline`, negation, axes `['physical']`, 0.10 |
| Improved Critical Hits +1 | `conditional`, damage, `['physical']`, group `hitType`, 1.23, condition "On critical hits" (mirrors existing +0) |
| Improved Skill Attack Power | `conditional`, damage, `['universal']`, group `hitType`, 1.15, condition "Weapon skills only" |
| Boosts Attack Power of Added Affinity Attacks | `conditional`, damage, `['magic','fire','lightning','holy']`, group `weapon`, 1.10, condition "Elemental damage on weapons only (not spells)" |
| Poison & Rot in Vicinity Increases Attack Power | `conditional`, `special: true`, damage, `['universal']`, group `status`, 1.12, condition "20s after poison/rot procs nearby" |
| Switching Weapons Boosts Attack Power | `conditional`, `special: true`, damage, `['physical']`, group `status`, 1.10, condition "10s after switching weapons" |
| Status Ailment Gauges Slowly Increase Attack Power | `baseline`, damage, `['universal']`, 1.04, `variableCount`, `maxCount: 10` (stacks) |
| Successive Attacks Boost Attack Power | `baseline`, damage, `['universal']`, `variableCount`, `maxCount: 3`, `stepValues: [1.05, 1.065, 1.09]` (tiers) |
| Continuous HP Recovery | `flat`, value 2, template "+{v} HP/s" |
| Attacks Inflict Rot when Damage is Taken | `flat`, value 25, template "Taking damage adds {v} rot buildup to your weapon for 12s" (same pattern as the existing blood-loss entry) |

Description only (no `mul` entry, so they fall into Other Effects): Stamina
Recovery upon Landing Attacks +1; FP Restoration upon Successive Attacks;
Continuous FP Recovery; Rot in Vicinity Causes Continuous HP Recovery; HP
Recovery From Successful Guarding; Madness Continually Recovers FP; Huge
rune discount for shop purchases while on expedition; Gesture "Crossed
Legs" Builds Up Madness; Frostbite in Vicinity Conceals Self; Extended
Spell Duration; Switching Weapons Adds an Affinity Attack; Occasionally
Nullify Attacks When Damage Negation is Lowered; Improved Stance-Breaking
when Two-Handing; Improved Stance-Breaking when Wielding Two Armaments.

Descriptions for all 25 go into `descriptions.mjs`, written from the CSV's
Effect column in the file's existing style (e.g. "1.12× damage for 20s
after poison or rot procs nearby"). Two have no CSV row. For those, use the
community sheet's notes: Extended Spell Duration "+50% spell duration",
Occasionally Nullify "20% chance to take no damage while any damage
negation is lowered".

Dregs assumes multiplicative stacks (×1.04^N, 10 stacks = ×1.48). This
matches how the user said Glass Necklace's tiers combine. It is not
independently confirmed.

### Counted effects: semantics

- Both counted effects use the existing count dropdown (0..maxCount,
  default 1). 0 means "not active", so they need no specials checkbox. The
  user asked for "the same way we do for night invaders/evergaols".
- **Engine extension: `stepValues`.** It's optional on `variableCount`
  entries. When present, the Nth occurrence (1-based) uses
  `stepValues[N-1]` instead of `value`, and `maxCount` must equal
  `stepValues.length`. Glass Necklace tier 2 = 1.05 × 1.065 ≈ 1.118, and
  tier 3 = × 1.09 ≈ 1.219. This matches the community sheet's 5% / 11.8% /
  21.9%.
- The rest of the engine is unchanged. `getBuildEffects()` pushes N entries
  as today, each carrying its step's value.
- The summary must show the correct combined figure for a stepped effect
  (the product of its steps, not `value^count`). Check how `baselineByName`
  renders grouped duplicates.
- `tests/build.test.mjs` mirrors the engine. Update it too, and add cases
  for stepValues and for a fixed relic's effects reaching the totals.

## Localisation

### Relic names

The new locale section (key naming is the builder's call) is keyed by
English relic name. Values are in
`docs/superpowers/specs/2026-10-23-guaranteed-relics-relic-names.tsv`, which holds EN/JP/KR for all 45 named relics and the 4 Grand Scene names.

- **JP source:** [GameWith relic list](https://gamewith.jp/eldenring/501441).
  All names are present on the page, and most are also on Game8. EN↔JP
  pairing was done by matching effects.
- **KR source:** namu.wiki "엘든 링 밤의 통치자/유물". It blocks scripted
  access, so it was read via the user's Chrome. All 45 named relics are
  present, listed in the same order as EN.
- **KR Scene names are composed, not confirmed.** namu.wiki only gives the
  parts (불타는/축축한/고요한/빛나는 풍경, size word 웅장한). The table uses
  "웅장한 불타는 풍경" etc. Leave a code comment noting this.

### Effect names

Only 3 of the 25 new effect names are in nightreignrelic.com's
`data/ern_effects_export.json`, the usual source: HP Recovery From
Successful Guarding and both Stance-Breaking effects. Take those 3 from the
export as usual.

The other 22 were collected during design. They're in
`docs/superpowers/specs/2026-10-23-guaranteed-relics-effect-names.tsv`, with columns `en`, `jp`, `kr`, `jp_source`, `kr_source`.

- **JP** comes from GameWith's relic page, where each relic's effects are
  listed under it.
- **KR** comes from namu.wiki's relic page, read via the user's Chrome. The
  `+N` spacing was normalised to match the existing `kr.js` style, e.g.
  "치명적인 일격 강화+1". "Stamina Recovery upon Landing Attacks +1" uses
  the existing official base wording "공격 명중 시 스태미나 회복" plus "+1".
  namu.wiki words it differently ("공격 성공 시 스태미너…").

Never fall back to English.

### UI strings and conditions

- New strings: "Guaranteed relic", "— none —", the 4 group names, and
  Methodology lines. Suggested official-ish terms:
  - JP: ボス遺物 / 追憶 / コレクターの看板 / その他
  - KR: 밤의 왕 보스 유물 / 저널 유물 / (Signboard: builder's call, keep it
    consistent with namu.wiki's usage if found) / 기타
- New `condition` strings for the conditional entries need JP/KR entries in
  the locales' `conditions` section, as existing conditions have.

## Left to the builder

- Script structure (new prepare script vs extending one) and JSON shape
  details.
- Option ordering within groups, read-only row styling, and whether
  free-form rows survive a relic toggle.
- Share-link key names.
- Whether the Signboard label truncates long effect names.
- Test layout beyond the cases named above.

## Calls I made (not explicitly confirmed by the user)

- Dropdown placement at the top of each Regular panel, and a read-only
  effect list when a relic is selected.
- Signboard label format `<scene> — <first effect>`.
- Resetting a DLC relic to "— none —" in Pre-DLC mode.
- The individual classifications in the table. The user approved the table
  as a whole ("rest is fine").
- Composed KR Scene names.
