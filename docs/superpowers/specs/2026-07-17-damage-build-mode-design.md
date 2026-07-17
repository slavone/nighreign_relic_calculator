# Damage Build Mode — Design Spec

## Motivation

The calculator currently answers "what's the probability of rolling this effect
combination?" It doesn't answer the question players actually care about once
they've *got* relics: "given the exact effects on my equipped relics, what's my
real total damage multiplier?" A relic screen full of "1.09× Katana damage",
"1.12× Bestial Incantation damage", "1.085× Incantation damage" requires manual
arithmetic today, and it's easy to double-count or miss that two effects don't
actually combine (e.g. picking bonuses for two different weapons you can't
wield at once).

This feature adds a new mode where the user enters their actual equipped
relics (not a probability query) and gets back the combined damage,
damage-negation, and resource multipliers.

## Scope

- New top-level mode, alongside *Exact Effects* and *Multiple Choice*.
- 6 relic panels: 3 Regular + 3 Deep of Night. A toggle hides the DON panels
  entirely (for players without DON access).
- Each panel: up to 3 effect pickers (Grand quality's max), reusing the
  existing group→effect cascading selector. No quality/color fields — this
  mode has no probability to compute.
- Each DON panel additionally gets one optional curse dropdown (every DON
  relic carries exactly one curse in-game).
- Live-updating summary block, computed purely from the selected effects.

### Non-goals (this iteration)

- No validation against "Stackable with self?" (the source spreadsheet flags
  some effects as unable to appear twice in a legal loadout). Worth adding
  later as a warning banner, not required for the summary to work.
- No poise-damage-taken tracking — poise-affecting effects are listed as
  plain text (Other Effects), not multiplied into a "poise" total.
- No handling of per-spell damage type overrides from other relic effects
  (e.g. "Starting Weapon deals [element] Damage"); the build assumes a
  standard un-modified weapon/spell loadout.

## Effect classification

Every effect the build mode can reason about numerically falls into one of
three tiers:

1. **Baseline** — a fixed-rate modifier that applies whenever its general
   damage/action category occurs, with no dependency on transient game state
   or a specific weapon/school choice. Example: `Physical Attack Up +1`,
   `Improved Incantations`, `Improved Affinity Attack Power`.
2. **Conditional** — a real numeric value, but it additionally requires
   either (a) a specific weapon type / spell school / hit type (critical,
   guard counter, initial attack, throwing item) rather than a general
   category, or (b) a transient trigger/state (a time-limited buff window
   after an event, an HP or status threshold, timing relative to another
   action like right after evading). Examples: `Improved Katana Attack
   Power`, `Improved Bestial Incantations`, `Improved Critical Hits`,
   `Taking attacks improves attack power` (10s window), `Reduced Damage
   Negation After Evading` (the DON curse).
3. **Flat/Other** — no clean multiplier: flat stat bonuses (+20 Max HP),
   status resistances, flavor/character-unique text, buildup amounts. Shown
   as plain text, same as today's description tooltips.

This tiering applies uniformly to all three totals below (Damage, Damage
Negation, Resource/Recovery) — each can have baseline entries, conditional
entries, and flat leftovers.

Anything not yet given a classification defaults to Flat/Other. A missing
mapping degrades to "shown as text" — it never silently produces a wrong
number.

## Damage-type axes

Baseline damage and negation totals are tracked per axis, since folding
unrelated elements into one blended number would hide exactly the kind of
mismatch this feature exists to prevent:

- **Elemental axes**: Physical, Magic, Fire, Lightning, Holy.
- **Universal**: confirmed to apply across all damage sources regardless of
  element (e.g. `Improved Attack Power with 3+ [Weapon Type] Equipped` —
  the source spreadsheet explicitly notes "works for damage from all
  sources, e.g. spells"; `Improved Melee Attack Power`, which the spreadsheet
  says affects both weapon and skill damage).
- **Category multipliers** (not elemental, layer on top of whichever element
  the actual spell is): **Sorcery**, **Incantation** — from `Improved
  Sorceries` / `Improved Incantations`.

An effect can tag more than one elemental axis at once (`Improved Affinity
Attack Power` / `Improved Affinity Damage Negation` hit Magic + Fire +
Lightning + Holy simultaneously, not Physical).

Damage Negation uses the same axis set (Physical/Magic/Fire/Lightning/Holy/
Universal), computed as a remaining-damage factor: `∏(1 − negation%)` across
the contributing entries per axis, since each negation source reduces what's
left after the previous one, not a flat sum.

Resource/Recovery isn't axis-split — it's one combined multiplier list
covering FP consumption, skill cooldown, ultimate gauge gain, and flask HP
restoration (each of these is a distinct stat, but they're read individually
off the list rather than needing per-axis separation the way damage does).

## Spell-school → damage-type mapping

The 14 school-specific relic effects (`Improved [School] Sorcery/
Incantation`) don't state their damage type in either the source spreadsheet
or `descriptions.mjs` — this had to be filled in from game knowledge and
confirmed with the user:

| School | Type |
|---|---|
| Stonedigger Sorcery | Magic |
| Carian Sword Sorcery | Magic |
| Glintblade Sorcery | Magic |
| Invisibility Sorcery | Magic |
| Crystalian Sorcery | Magic |
| Gravity Sorcery | Magic |
| Thorn Sorcery | Magic |
| Bestial Incantations | Physical |
| Godslayer Incantations | Fire |
| Giants' Flame Incantations | Fire |
| Fundamentalist Incantations | Holy |
| Dragon Cult Incantations | Lightning |
| Frenzied Flame Incantations | Fire |
| Dragon Communion Incantations | **Unclassified** — spans multiple elements depending on which dragon breath is used in-game; goes to Flat/Other rather than a guessed single type. |

Each school entry is tagged both with its elemental axis (table above, where
classified) and the `Incantation` or `Sorcery` category, since general and
school-specific bonuses genuinely stack on the same cast.

## Calculation model

**Baseline totals**: for each axis (and each category), multiply together
every selected Baseline-tier effect tagged with that axis/category. This is
the number shown as e.g. "Physical: ×1.09".

**Conditional entries**: each is shown as its own line with its raw value,
*plus* a computed "combined with your baseline" figure — the conditional's
value multiplied by every baseline/category total it's tagged with. This
avoids two failure modes: (a) silently summing two conditionals that can't
both be active at once (e.g. bonuses for two different single weapon types
— you only wield one at a time), and (b) hiding the real per-action total the
user actually wants.

Example, matching the motivating case (Physical Attack Up +1, Improved
Incantations, Improved Bestial Incantations all selected):

```
Physical (baseline): ×1.09
Incantation (baseline): ×1.085

Conditional:
  Bestial Incantations only — ×1.12
    → combined with Physical + Incantation baseline: ×1.09 × 1.085 × 1.12 = ×1.324
```

**Damage Negation**: same baseline/conditional split, but baseline combines
as `∏(1 − v)` per axis, and conditional entries (e.g. the evasion/flask-usage
curses) show their own combined figure the same way rather than being
subtracted from the baseline total.

**Resource/Recovery**: baseline entries multiply into one combined number;
conditional resource entries (e.g. `Near Death Reduces Max HP` — temporary,
triggered by being downed) are listed separately, not folded in.

**Flat/Other**: listed as plain text below the totals, unchanged from how
descriptions render today.

## Data pipeline

Per the existing pattern (`descriptions.mjs` → `prepare_data.mjs` /
`prepare_don_data.mjs` → embedded into `DATA` / `DON_DATA` in `index.html`),
add a new mapping file (e.g. `effect_multipliers.mjs`) keyed by exact effect
name, holding `{ tier, axes, category?, value, conditionLabel? }`. The
prepare scripts attach this as a field on each effect object during JSON
generation; the existing embed step picks it up automatically since it
already re-embeds the full `DATA`/`DON_DATA` objects.

Unmapped effect names simply have no such field — the UI treats a missing
mapping as Flat/Other, same as a missing `desc` today falls back to no
tooltip.

`value` encoding differs by bucket, matching how each stat actually combines:
Damage and Resource entries store a multiplier (`1.09` for +9%), combined by
straight product. Negation entries store the fractional negation amount
(`0.10` for +10%), combined via `∏(1 − v)` as described above — storing it
as a raw multiplier would be wrong since negation reduces incoming damage,
it doesn't scale it up.

## UI display sketch

```
┌─ Damage ──────────────────────────────────────────────────┐
│ Physical        ×1.09                                     │
│ Incantation     ×1.085                                    │
│                                                             │
│ Conditional:                                               │
│  Bestial Incantations only        ×1.12                   │
│    combined: ×1.09 × ×1.085 × ×1.12 = ×1.324               │
└─────────────────────────────────────────────────────────────┘
┌─ Damage Negation ───────────────────────────────────────────┐
│ ...same layout...                                           │
└─────────────────────────────────────────────────────────────┘
┌─ Resource / Recovery ─────────────────────────────────────────┐
│ ...combined multiplier + conditional list...                  │
└─────────────────────────────────────────────────────────────┘
Other Effects: <plain text list, same style as current descriptions>
```

## i18n

All new labels (mode name, axis names, "Conditional", "combined with your
baseline", curse-picker label, etc.) need JP/KR translations added alongside
English, per existing localisation practice — no UI text ships English-only.

## Open questions / assumptions carried forward

- `Dragon Communion Incantations` has no single damage type; treated as
  Flat/Other. If a definitive per-spell breakdown is ever needed, this can
  be revisited.
- Rare Character-exclusive relic effects (the `[Wylder]`, `[Duchess]`, etc.
  rows) are mostly flavor/unique mechanics with no clean multiplier — they
  default to Flat/Other unless a specific one clearly fits a bucket (e.g.
  `[Ironeye] Boosts thrusting counterattacks... ×1.2` reads as a Conditional
  Physical/Universal entry).
- "Stackable with self?" data from the source spreadsheet isn't used for
  validation in this iteration (see Non-goals) — noted here so it isn't
  forgotten if duplicate-effect warnings are wanted later.
