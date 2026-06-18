# Per-Slot Tier Weights — Design

**Date:** 2026-06-18
**Status:** Approved (pending user review of this spec)
**Scope:** Regular relic pool only. Deep of Night (DON) pool, curses, and colors are unchanged.

## Problem

The calculator models every regular-relic effect slot as drawing from a single weight
table (`AttachEffectTableParam` table `110`). The game actually rolls each slot of a
relic from a **different, progressively weighted "tier" table**:

| Quality  | K | Slots draw from tiers | Tables       |
|----------|---|-----------------------|--------------|
| Delicate | 1 | `[0]`                 | 110          |
| Polished | 2 | `[0, 1]`              | 110, 210     |
| Grand    | 3 | `[0, 1, 2]`           | 110, 210, 310|

The three tables are the **same effect set reweighted** — and the redistribution is by
*category*, NOT by gameplay power. Every effect moves monotonically across the tiers
(verified: 236 increasing, 104 decreasing, 0 mixed). The high slot (tier 310) shifts weight
**toward** some groups and **away** from others, independent of how good an effect is to play:

- **Up toward tier 310:** Attack Power (biggest shift, `1505→1864`); Vigor / Mind / Endurance
  (`156→225`); Cooldown Reduction; Ultimate Art Auto Charge; and the `+2/+3` rungs within
  numeric ladders (e.g. `Vigor +3`: `52→92`).
- **Down toward tier 310:** **Spell School** (biggest decrease, `546→406`); the offensive
  scaling stats Str/Dex/Int/Fai/Arc and Poise (`156→123`); status-conditional crit/attack
  effects; and the base/`+1` rungs (e.g. `Vigor +1`: `52→41`).
- **Flat:** Character Ability, Starting Armament Skill/Element, weapon-type HP/FP restore,
  Dormant Power.

Note: "tier-favored" ≠ "strong." A gameplay-strong effect like *Improved Bestial
Incantations* sits in the most tier-*disfavored* group (Spell School).

Because the calculator used tier 0 (table 110) for **every** slot, it
**systematically misestimated multi-slot relics** — over-reporting tier-disfavored combos
and under-reporting tier-favored ones:

- Delicate (1 slot): **exact** (table 110 *is* the correct slot-0 table).
- Polished (2 slots): mean |relErr| ~5%, max ~31%.
- Grand (3 slots): mean ~9%, p90 ~15%, **max ~57%** — e.g. `Vigor +3` was *under*-reported
  by ~36%, while a Spell-School-heavy combo was *over*-reported by ~22%.

(Quantified via Monte Carlo, 200k draws, with group exclusion.)

### Confidence / provenance

The per-slot tier **mechanic is confirmed** from the param data: it appears identically
across three independent table families (`100/200/300`, `110/210/310`, and the
`1000000`-series of 10 character-variant triples), and is corroborated by an independent
empirically-derived dataset (3M+ rolled relics, per the datamined Google Sheet's Credits
tab). The weights are genuine game data — the CSV field is literally `chanceWeight`, a
`Regulation.bin` param editable in Smithbox.

What is **not** confirmed from available data: which exact table variant a normal dropped
relic uses (generic `100/200/300` vs a `1000xxx` variant vs DLC `110/210/310`) and the
precise slot order. These candidates differ by <4% in aggregate; the first-order tier
effect is robust. **Decision: build on `[110, 210, 310]`** (the DLC tables; `110` matches
the calculator's current table) and document the assumption. Empirical re-calibration from
raw roll frequencies is a possible future enhancement but out of scope here.

## Data model

`prepare_data.mjs` is updated to emit three weights per effect and three group-weights per
group (decode is `chanceWeight & 0xFFFF`; `0` = disabled):

```js
{
  wTotals:       [W0, W1, W2],    // table 110 / 210 / 310 totals over all effects
  wTotalsPreDLC: [W0p, W1p, W2p], // same, excluding DLC-tagged effects
  groups: [{
    groupName,
    groupWs: [gw0, gw1, gw2],     // group weight per tier (sum of member effect weights)
    effects: [{ name, ws: [w0, w1, w2], desc?, dlc? }]
  }]
}
```

- Tier index `t` ∈ {0,1,2} maps to tables 110/210/310 respectively.
- Expected totals: `wTotals == [10046, 10058, 10059]`.
- Per-tier `groupWs` are required because a group's weight differs per tier, and group
  exclusion must subtract the correct tier's weight from later slots.
- Regular-pool embedded `DATA` roughly doubles in size — acceptable for an embedded
  constant.
- **DON data (`don_relic_data.json`) is unchanged** (single weight; no tier structure —
  its tables `2100000`/`2200000` are identical and `2000000` is a disjoint cursed subset).

## Probability formula — per-slot recursion

A generalization of the current `ef()` from "one shared pool `W`" to "an ordered list of
K slot-tiers." Slots are processed in **fixed tier-ascending order** (tier 0 first); this
fixes the order in which group exclusion is applied.

```
efSlots(tiers, D, used):
  # tiers: remaining slot tiers to fill, e.g. [0,1,2]
  # D:     remaining desired items, each with ws[] (per-tier weight) and a group ref
  # used:  set of group ids already consumed by earlier slots
  if tiers is empty: return (D is empty) ? 1 : 0
  t   = tiers[0]
  Wt  = W[t] - Σ_{g in used} groupWs_g[t]          # remaining total for this tier
  total = 0
  # Option 1: a desired effect lands in this slot
  for d in D where group(d) ∉ used:
      total += (d.ws[t] / Wt) * efSlots(tiers[1:], D \ {d}, used ∪ {group(d)})
  # Option 2: this slot is free (only if remaining slots can still fit all remaining desired)
  if len(tiers[1:]) >= len(D):
      freeGW = Σ over distinct groups still in D of groupWs[t]
      total += ((Wt - freeGW) / Wt) * efSlots(tiers[1:], D, used)
  return total
```

Properties:

- **Replaces both `ff` and `ef`.** The old `K!/(K−n)!` placement prefactor is gone:
  placement is handled by summing over which slot each effect lands in (Option 1) plus the
  free-slot branch (Option 2).
- **Reproduces the current formula exactly for n=K** (no free slots) when all tiers are
  identical — verified to 0.0000% in a worked `n=K=2` case. This is the clean regression
  baseline.
- **Refines the free-slot case (n<K).** The free branch subtracts the still-needed desired
  groups (`freeGW`) so a free slot cannot consume a group a desired effect still needs —
  something the current `perm(K,m)·ef` does not model. With identical tiers this makes
  n<K results differ from today's by a small amount (verified −7.5% in a worked `n=1,K=2`
  case with a large group) and brings them **closer to Monte Carlo ground truth**. It does
  not consume the free slot's actual group from later slots — the same residual
  free-slot pool-shrink simplification the current formula already accepts (~1–2%).
  This refinement is a deliberate, beneficial side effect of the cleaner model, not a
  separate feature; it is validated against Monte Carlo (see Validation).
- **Fixed tier-ascending order** is a documented modeling assumption (true draw order is
  unknown; the difference vs. averaging over slot orders is a small second-order
  group-exclusion conditional).

### Worked example — 1 desired effect + free slots on a Grand relic

The most common query (one desired effect, other slots "any") shows why **all three tier
weights are used**: the desired effect can land in any slot, so its probability is the sum
over the three positions, each using *that slot's* weight. The two "any" slots are the
free branches; each contributes a "didn't take the desired group" factor.

For `Vigor +3` (weights `52 / 72 / 92` in tiers 110 / 210 / 310), with the Vigor group
weights `156 / 191 / 225` and totals `W = [10046, 10058, 10059]`:

```
P = w0/W0                                  # lands in slot 0 (tier 110): 0.518%
  + (W0−g0)/W0 · w1/W1                      # slot 0 free, lands in slot 1 (tier 210): 0.705%
  + (W0−g0)/W0 · (W1−g1)/W1 · w2/W2         # slots 0,1 free, lands in slot 2 (tier 310): 0.883%
  = 2.106%
```

Old single-pool model (always weight 52, ×3 slots): **1.553%** → per-slot gives **+36%**.
A tier-disfavored effect (`Vigor +1`: 52/47/41, declining) moves the opposite way (slightly
*below* the old model), since its highest weight is in the slot the old model already used.
This is exactly the systematic bias the fix corrects.

## V1 / V2 integration

Both regular-mode calculation paths call `efSlots`:

- **V1 (Exact Effects):** replace `ff * efV1(items, W)` with
  `efSlots(tiersForQuality(K), items, {})`, where `tiersForQuality(K) = [0 .. K-1]`. Each
  item carries `ws[]` and its group reference. Group-collision check (same group twice →
  impossible) is unchanged.
- **V2 (Multiple Choice):** the same `efSlots` serves both branches:
  - pool size `m ≤ K`: all desired groups must appear, remaining `K−m` slots free —
    handled by the free branch.
  - pool size `m > K`: sum `efSlots(tiers, subset, {})` over all K-subsets of the pool
    (no free slots, since `|subset| = K`). The `perm()` prefactors are absorbed into the
    recursion.
- **Color factor:** unchanged, multiplied at the end.
- **Curses / DON:** untouched. DON mode keeps calling the existing single-pool
  `efGroupExclusion`. The mode branch selects regular (`efSlots` + tiers) vs DON (existing
  path).

## Pre-DLC and mode branching

- `activeW()` → `activeWs()` returning the 3 active per-tier totals (all-effects vs
  pre-DLC selected by the existing toggle).
- `activeGroups()` filters DLC-tagged effects and recomputes per-tier `groupWs` for the
  active set, exactly as today but ×3 tiers. Groups that become empty are still hidden.
- DON mode is unaffected by these changes.

## Validation & tests (`tests/calc.test.mjs`)

1. **Data assertions:** regenerated `wTotals == [10046, 10058, 10059]`; pre-DLC totals
   equal all-effects totals minus summed DLC-tier weights.
2. **Regression — n=K, identical tiers:** `efSlots([110,110,110], ...)` reproduces the
   current single-pool results exactly for the no-free-slot cases (n=K). Port the relevant
   existing tests as this baseline.
3. **Free-slot refinement — n<K:** with identical tiers, n<K results differ slightly from
   the old formula (free-slot group exclusion); assert they match a Monte Carlo reference
   (the model used during investigation) rather than the old numbers.
4. **Per-slot expected values:** a few hand-checked cases with real tiers (e.g. `Vigor +3`
   on a Grand relic ≈ +40% vs the old single-pool number), cross-checked against the 200k
   Monte Carlo already run during investigation.
5. **Delicate exactness:** Delicate (K=1) results equal the old single-pool results
   (tier 0 = table 110, and n≤1=K so no free-slot refinement applies).
6. **DON unchanged:** DON tests keep their current expected values (path untouched).
7. Existing tests whose values legitimately change (regular n<K, Polished/Grand) are
   updated with new expected numbers and a comment noting the per-slot model + free-slot
   refinement.

## Out of scope

- DON per-slot modeling (confirmed not tiered).
- Empirical re-calibration from raw 3M-roll frequencies.
- Per-character table variants (`1000xxx`) — second-order (~30 character-ability weights);
  not modeled.
- Resolving the exact table-variant/slot-order uncertainty (would need game code or raw
  roll data).

## Methodology note (user-facing)

The in-app methodology section gains a short note: regular-relic probabilities now model
per-slot tier tables (Delicate→110, Polished→110+210, Grand→110+210+310), with the
documented assumptions (table variant `[110,210,310]`, fixed slot order). Delicate results
are exact; the change matters most for high-tier effects on Grand relics.
