// Per-effect classification for Damage Build mode.
//
// tier:      'baseline'   — always-on, folds into a running total for its bucket/axis.
//            'conditional'— real value, but requires a specific weapon/school/hit-type
//                           or a transient trigger/state. Shown as its own line with a
//                           "combined with baseline" figure, never silently summed.
//            'flat'       — an ADDITIVE (not multiplicative) effect: a flat stat delta or
//                           buildup-infliction amount. Duplicates on multiple relics
//                           literally SUM (two copies of −80 resistances = −160), unlike
//                           every other tier which combines by multiplication. Has ONE of
//                           two shapes:
//                             { value, template }        — merged by matching effect NAME
//                                                          (the normal case: only this exact
//                                                          effect ever contributes here).
//                             { pools: [{pool, value}] } — merged by POOL KEY instead of
//                                                          name, for the rare case where
//                                                          multiple DIFFERENT named effects
//                                                          feed the same running total (e.g.
//                                                          both "Vigor +1" and the curse
//                                                          "Reduced Vigor and Arcane" affect
//                                                          the same underlying Vigor stat).
//                                                          One entry can list 2+ parts if it
//                                                          touches multiple stats at once.
//                           bucket/axes/category/group/stat are all irrelevant for this tier.
// bucket:    'damage' | 'negation' | 'resource' — baseline/conditional only.
// axes:      damage/negation only — one or more of physical/magic/fire/lightning/holy/universal.
// category:  optional — 'sorcery' | 'incantation'. Layers on top of whichever axis the
//            spell actually deals; general "Improved Sorceries/Incantations" entries have
//            a category but no axes (they don't have a fixed element themselves).
// group:     conditional entries without a category still need a display bucket for the
//            nested summary tree: 'weapon' (single-weapon/throwable-specific), 'hitType'
//            (crit/guard-counter/initial-attack), or 'status' (timing windows, vs-enemy-
//            status, curses — everything else transient/state-dependent).
// stat:      resource bucket only, REQUIRED for baseline entries. Resource covers several
//            genuinely different units (FP consumption, skill cooldown, ultimate gauge gain,
//            max HP/FP/stamina, flask healing, rune gain) that must never be multiplied
//            together — a 0.92x FP-consumption reduction and a 1.1x max-HP bonus aren't the
//            same quantity. One of: 'cooldown' | 'ultimateCharge' | 'fpConsumption' |
//            'maxHP' | 'maxFP' | 'maxStamina' | 'flaskHeal' | 'runeGain'.
// value:     multiplier (e.g. 1.09) for damage/resource baseline/conditional. Fractional
//            negation amount (e.g. 0.10, or negative for a curse that *removes* negation)
//            for negation — combined via ∏(1 − v), never a straight product. For `flat`
//            tier: the signed numeric delta itself (e.g. −80, or 44 for a buildup amount).
// template:  flat tier only — the effect's description with `{v}` standing in for the
//            (possibly summed-across-duplicates) numeric value, so the UI can regenerate
//            an accurate description after combining. Formatted with a literal '−' for
//            negative values, matching how descriptions.mjs already writes them (never a
//            bare ASCII '-').
// condition: required when tier is 'conditional'; human-readable trigger description.
//            Optional on `flat` entries purely as informational display text (e.g. an
//            HP-gated buildup curse) — it does NOT affect how duplicates merge, since
//            flat entries always sum regardless of any trigger condition.
// variableCount: baseline damage/negation only — the effect's real-world "count" (times
//            triggered so far this run, e.g. bosses defeated) isn't the number of relics/
//            slots carrying it, so the UI shows a count selector (0..maxCount) instead of
//            deriving count from duplicate selection, and feeds the SAME effect into
//            computeBuildTotals `count` times — no engine changes needed, this reuses the
//            existing per-occurrence multiply.
// maxCount:  required alongside variableCount — the highest count the count selector
//            offers, i.e. the real in-game cap for that trigger (confirmed with the user).
// special:   conditional tier only, optional boolean (true or absent — never false). Marks
//            a genuinely SITUATIONAL/temporal trigger (vs-a-status enemy, 3+ weapon type
//            equipped, a grease-item window, a curse tied to evading/flasks/low HP, etc.)
//            that may or may not be active at any given moment — as opposed to a spell-
//            school, single-weapon-hit, or hit-type conditional (crit, guard counter, first
//            light attack), which just means "while doing X", a stable playstyle choice, not
//            a fluctuating state. Specials get a checkbox in the build-mode UI (off by
//            default) instead of an always-on totaled row; toggling one folds it into every
//            Totals figure that shares its axis (or every axis, if truly universal — see
//            axes below). NOT implied by axis: a special can be axis-specific (grease items
//            is physical-only) — confirmed per-effect with the user, not inferred from axis
//            or group.
//
// Effect names not present here are treated as Flat/Other by the build-mode UI — that's
// the safe default for anything not classified (flat stat bonuses, resistances, flavor
// text).
//
// See docs/superpowers/specs/2026-07-17-damage-build-mode-design.md for the full rationale,
// including the spell-school → damage-type mapping (confirmed with the user).

export const EFFECT_MULTIPLIERS = {
  // ── Resource / Recovery (baseline) ────────────────────────────────────────
  'Character Skill Cooldown Reduction +1': { tier: 'baseline', bucket: 'resource', stat: 'cooldown', value: 0.95 },
  'Character Skill Cooldown Reduction +2': { tier: 'baseline', bucket: 'resource', stat: 'cooldown', value: 0.925 },
  'Character Skill Cooldown Reduction +3': { tier: 'baseline', bucket: 'resource', stat: 'cooldown', value: 0.9 },
  'Ultimate Art Auto Charge +1': { tier: 'baseline', bucket: 'resource', stat: 'ultimateCharge', value: 1.05 },
  'Ultimate Art Auto Charge +2': { tier: 'baseline', bucket: 'resource', stat: 'ultimateCharge', value: 1.075 },
  'Ultimate Art Auto Charge +3': { tier: 'baseline', bucket: 'resource', stat: 'ultimateCharge', value: 1.1 },
  'Reduced FP Consumption': { tier: 'baseline', bucket: 'resource', stat: 'fpConsumption', value: 0.92 },
  'Reduced FP Consumption +1': { tier: 'baseline', bucket: 'resource', stat: 'fpConsumption', value: 0.87 },
  'Reduced FP Consumption +2': { tier: 'baseline', bucket: 'resource', stat: 'fpConsumption', value: 0.84 },
  'Increased Maximum HP': { tier: 'baseline', bucket: 'resource', stat: 'maxHP', value: 1.1 },
  'Increased Maximum FP': { tier: 'baseline', bucket: 'resource', stat: 'maxFP', value: 1.15 },
  'Increased Maximum Stamina': { tier: 'baseline', bucket: 'resource', stat: 'maxStamina', value: 1.12 },
  'Improved Flask HP Restoration': { tier: 'baseline', bucket: 'resource', stat: 'flaskHeal', value: 1.1 },
  // DON curses that are fixed-rate (no transient trigger) go in Resource baseline too.
  'Reduced Flask HP Restoration': { tier: 'baseline', bucket: 'resource', stat: 'flaskHeal', value: 0.85 },
  'Ultimate Art Charging Impaired': { tier: 'baseline', bucket: 'resource', stat: 'ultimateCharge', value: 0.85 },
  'Reduced Rune Acquisition': { tier: 'baseline', bucket: 'resource', stat: 'runeGain', value: 0.9 },
  // DON curse — temporary state after being downed, not fixed-rate.
  'Near Death Reduces Max HP': { tier: 'conditional', bucket: 'resource', stat: 'maxHP', group: 'status', value: 0.75, condition: '60s after being downed' },

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

  // ── Run-progress scaling (baseline, universal) — the multiplier applies
  // permanently for the rest of the run once triggered, but how many times
  // it's triggered depends on the player's actual run (bosses/invaders
  // cleared), not on relic/slot duplication, so the UI offers a count
  // selector (0..maxCount, capped at the real in-game max) instead of
  // deriving count from how many relics carry the effect.
  'Attack power increased for each evergaol prisoner defeated': { tier: 'baseline', bucket: 'damage', axes: ['universal'], value: 1.05, variableCount: true, maxCount: 7 },
  'Attack power increased for each Night Invader defeated': { tier: 'baseline', bucket: 'damage', axes: ['universal'], value: 1.07, variableCount: true, maxCount: 4 },

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
  // Same physical-only reasoning as Critical Hits/Guard Counters below — the
  // first-light-attack bonus is a physical damage component, not a "special"
  // applying to every damage type (user-confirmed).
  'Improved Initial Standard Attack': { tier: 'conditional', bucket: 'damage', axes: ['physical'], group: 'hitType', value: 1.15, condition: 'First light attack only' },
  // Critical hit / guard counter bonus damage is physical-only (the FromSoft
  // riposte/critical multiplier applies to the weapon's physical damage
  // component, not affinity/elemental) — user-confirmed, not a "special"
  // applying to all damage types, so these are physical-axis conditionals
  // like a weapon-specific hit, not universal-only.
  'Improved Critical Hits': { tier: 'conditional', bucket: 'damage', axes: ['physical'], group: 'hitType', value: 1.18, condition: 'On critical hits' },
  'Taking attacks improves attack power': { tier: 'conditional', special: true, bucket: 'damage', axes: ['universal'], group: 'status', value: 1.15, condition: '10s after taking a hit' },
  'Improved Guard Counters': { tier: 'conditional', bucket: 'damage', axes: ['physical'], group: 'hitType', value: 1.17, condition: 'On guard counters' },
  'Improved Guard Counters +1': { tier: 'conditional', bucket: 'damage', axes: ['physical'], group: 'hitType', value: 1.25, condition: 'On guard counters' },
  'Improved Guard Counters +2': { tier: 'conditional', bucket: 'damage', axes: ['physical'], group: 'hitType', value: 1.29, condition: 'On guard counters' },
  'Physical attack power increases after using grease items': { tier: 'conditional', special: true, bucket: 'damage', axes: ['physical'], group: 'status', value: 1.1, condition: '30s after using grease items' },
  'Physical attack power increases after using grease items +1': { tier: 'conditional', special: true, bucket: 'damage', axes: ['physical'], group: 'status', value: 1.17, condition: '30s after using grease items' },
  'Physical attack power increases after using grease items +2': { tier: 'conditional', special: true, bucket: 'damage', axes: ['physical'], group: 'status', value: 1.2, condition: '30s after using grease items' },
  'Attack power up when facing frostbite-afflicted enemy': { tier: 'conditional', special: true, bucket: 'damage', axes: ['universal'], group: 'status', value: 1.1, condition: 'vs frostbite-afflicted enemies' },
  'Attack power up when facing frostbite-afflicted enemy +1': { tier: 'conditional', special: true, bucket: 'damage', axes: ['universal'], group: 'status', value: 1.16, condition: 'vs frostbite-afflicted enemies' },
  'Attack power up when facing frostbite-afflicted enemy +2': { tier: 'conditional', special: true, bucket: 'damage', axes: ['universal'], group: 'status', value: 1.2, condition: 'vs frostbite-afflicted enemies' },
  'Attack power up when facing poison-afflicted enemy': { tier: 'conditional', special: true, bucket: 'damage', axes: ['universal'], group: 'status', value: 1.1, condition: 'vs poison-afflicted enemies' },
  'Attack power up when facing poison-afflicted enemy +1': { tier: 'conditional', special: true, bucket: 'damage', axes: ['universal'], group: 'status', value: 1.16, condition: 'vs poison-afflicted enemies' },
  'Attack power up when facing poison-afflicted enemy +2': { tier: 'conditional', special: true, bucket: 'damage', axes: ['universal'], group: 'status', value: 1.2, condition: 'vs poison-afflicted enemies' },
  'Attack power up when facing scarlet rot-afflicted enemy': { tier: 'conditional', special: true, bucket: 'damage', axes: ['universal'], group: 'status', value: 1.1, condition: 'vs rot-afflicted enemies' },
  'Attack power up when facing scarlet rot-afflicted enemy +1': { tier: 'conditional', special: true, bucket: 'damage', axes: ['universal'], group: 'status', value: 1.16, condition: 'vs rot-afflicted enemies' },
  'Attack power up when facing scarlet rot-afflicted enemy +2': { tier: 'conditional', special: true, bucket: 'damage', axes: ['universal'], group: 'status', value: 1.2, condition: 'vs rot-afflicted enemies' },
  'Sleep in Vicinity Improves Attack Power': { tier: 'conditional', special: true, bucket: 'damage', axes: ['universal'], group: 'status', value: 1.12, condition: 'After sleep procs nearby' },
  'Sleep in Vicinity Improves Attack Power +1': { tier: 'conditional', special: true, bucket: 'damage', axes: ['universal'], group: 'status', value: 1.22, condition: 'After sleep procs nearby' },
  'Madness in Vicinity Improves Attack Power': { tier: 'conditional', special: true, bucket: 'damage', axes: ['universal'], group: 'status', value: 1.12, condition: 'After madness procs nearby' },
  'Madness in Vicinity Improves Attack Power +1': { tier: 'conditional', special: true, bucket: 'damage', axes: ['universal'], group: 'status', value: 1.22, condition: 'After madness procs nearby' },
  'Improved Glintstone and Gravity Stone Damage': { tier: 'conditional', bucket: 'damage', axes: ['magic'], group: 'weapon', value: 1.15, condition: 'Stone/Gravity Stone throws only' },
  'Improved Glintstone and Gravity Stone Damage +1': { tier: 'conditional', bucket: 'damage', axes: ['magic'], group: 'weapon', value: 1.3, condition: 'Stone/Gravity Stone throws only' },
  'Improved Throwing Knife Damage': { tier: 'conditional', bucket: 'damage', axes: ['physical'], group: 'weapon', value: 1.15, condition: 'Throwing Knife throws only' },
  'Improved Throwing Knife Damage +1': { tier: 'conditional', bucket: 'damage', axes: ['physical'], group: 'weapon', value: 1.3, condition: 'Throwing Knife throws only' },
  // User-confirmed: thrown pots deal Affinity damage (fire/magic/lightning/
  // holy depending on the pot type), not truly universal damage — so this
  // is a multi-axis weapon conditional matching Affinity's own signature,
  // like Improved Affinity Attack Power but conditional instead of baseline.
  // Not a "special" — selecting it already means "while throwing pots".
  'Improved Throwing Pot Damage': { tier: 'conditional', bucket: 'damage', axes: ['magic', 'fire', 'lightning', 'holy'], group: 'weapon', value: 1.15, condition: 'Throwing Pot throws only' },
  'Improved Throwing Pot Damage +1': { tier: 'conditional', bucket: 'damage', axes: ['magic', 'fire', 'lightning', 'holy'], group: 'weapon', value: 1.3, condition: 'Throwing Pot throws only' },
  // ── DON curse: HP-threshold-dependent damage debuff (conditional) ────────
  'Lower Attack When Below Max HP': { tier: 'conditional', special: true, bucket: 'damage', axes: ['universal'], group: 'status', value: 0.915, condition: 'While HP is below 85%' },
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
  'Improved Poise & Damage Negation When Knocked Back by Damage': { tier: 'conditional', special: true, bucket: 'negation', axes: ['universal'], group: 'status', value: 0.20, condition: '20s after being hit' },
  'Reduced Damage Negation After Evading': { tier: 'conditional', special: true, bucket: 'negation', axes: ['universal'], group: 'status', value: -0.45, condition: 'Right after evading' },
  'Reduced Damage Negation for Flask Usages': { tier: 'conditional', special: true, bucket: 'negation', axes: ['universal'], group: 'status', value: -0.45, condition: 'While using flasks' },
  'Improved Damage Negation at Low HP': { tier: 'conditional', special: true, bucket: 'negation', axes: ['universal'], group: 'status', value: 0.16, condition: 'While HP is below 40%' },
  // Two-stage curse (−23% then escalating to −35% on repeated rolls within
  // 15s) — tracked at its worst-case (escalated) value, same "Actions"
  // treatment as every other timing-window negation curse above.
  'Repeated Evasions Lower Damage Negation': { tier: 'conditional', special: true, bucket: 'negation', axes: ['universal'], group: 'status', value: -0.35, condition: '15s after repeated evasions (escalates from −23% to −35%)' },
  // ── Flat/additive DON curses ──────────────────────────────────────────────
  // Duplicates SUM (see `flat` tier note above), not multiply — two copies of
  // "All Resistances Down" really do mean −160, not −80 squared or ×2 tagged
  // onto the original number.
  'All Resistances Down': { tier: 'flat', value: -80, template: '{v} all status resistances' },
  'Continuous HP Loss': { tier: 'flat', value: -2, template: '{v} HP/s' },
  // Dual-stat curses feed the SAME pools as the matching "X +N" relic effects
  // below (e.g. this curse's Dexterity part merges with any "Dexterity +N"
  // picked elsewhere) — see the `pools` shape note at the top of this file.
  'Reduced Dexterity and Faith': { tier: 'flat', pools: [{ pool: 'dexterity', value: -3 }, { pool: 'faith', value: -3 }] },
  'Reduced Faith and Strength': { tier: 'flat', pools: [{ pool: 'faith', value: -3 }, { pool: 'strength', value: -3 }] },
  'Reduced Intelligence and Dexterity': { tier: 'flat', pools: [{ pool: 'intelligence', value: -3 }, { pool: 'dexterity', value: -3 }] },
  'Reduced Strength and Intelligence': { tier: 'flat', pools: [{ pool: 'strength', value: -3 }, { pool: 'intelligence', value: -3 }] },
  // The "vigor" pool is tracked in derived Max HP terms (matching "Vigor +1"
  // = +20 Max HP below, a fixed 20-per-point conversion straight from the
  // source spreadsheet) — so this curse's −3 Vigor contributes −60 to that
  // SAME pool, exactly the "(−60 HP)" the spreadsheet already spells out;
  // it's not an independent second number, just the same delta in HP units.
  // "arcane" has no such conversion, so it stays in raw stat points.
  'Reduced Vigor and Arcane': { tier: 'flat', pools: [{ pool: 'vigor', value: -60 }, { pool: 'arcane', value: -3 }] },
  'Taking Damage Causes Blood Loss Buildup': { tier: 'flat', value: 44, template: 'Taking damage inflicts {v} blood loss buildup' },
  'Taking Damage Causes Death Buildup': { tier: 'flat', value: 32, template: 'Taking damage inflicts {v} death blight buildup' },
  'Taking Damage Causes Frost Buildup': { tier: 'flat', value: 44, template: 'Taking damage inflicts {v} frost buildup' },
  'Taking Damage Causes Madness Buildup': { tier: 'flat', value: 40, template: 'Taking damage inflicts {v} madness buildup' },
  'Taking Damage Causes Poison Buildup': { tier: 'flat', value: 52, template: 'Taking damage inflicts {v} poison buildup' },
  'Taking Damage Causes Rot Buildup': { tier: 'flat', value: 44, template: 'Taking damage inflicts {v} rot buildup' },
  'Taking Damage Causes Sleep Buildup': { tier: 'flat', value: 40, template: 'Taking damage inflicts {v} sleep buildup' },
  'Poison Buildup When Below Max HP': { tier: 'flat', value: 2, template: '{v} poison buildup per 0.22s', condition: 'While HP is below 85%' },
  'Rot Buildup When Below Max HP': { tier: 'flat', value: 2, template: '{v} rot buildup per 0.24s', condition: 'While HP is below 85%' },

  // ── Status resistances (baseline, flat/additive — confirmed "Stackable: Yes"
  // in the source spreadsheet). These are always positive gains (no curse
  // reduces a specific named resistance the way "All Resistances Down" does
  // as its own separate effect), so the '+' is baked into the template —
  // unlike the buildup-infliction curses above, whose original descriptions
  // never show a sign. ────────────────────────────────────────────────────
  'Improved Blood Loss Resistance': { tier: 'flat', value: 75, template: '+{v} blood loss resistance' },
  'Improved Blood Loss Resistance +1': { tier: 'flat', value: 110, template: '+{v} blood loss resistance' },
  'Improved Death Blight Resistance': { tier: 'flat', value: 75, template: '+{v} death blight resistance' },
  'Improved Death Blight Resistance +1': { tier: 'flat', value: 110, template: '+{v} death blight resistance' },
  'Improved Frost Resistance': { tier: 'flat', value: 75, template: '+{v} frost resistance' },
  'Improved Frost Resistance +1': { tier: 'flat', value: 110, template: '+{v} frost resistance' },
  'Improved Madness Resistance': { tier: 'flat', value: 75, template: '+{v} madness resistance' },
  'Improved Madness Resistance +1': { tier: 'flat', value: 110, template: '+{v} madness resistance' },
  'Improved Poison Resistance': { tier: 'flat', value: 75, template: '+{v} poison resistance' },
  'Improved Poison Resistance +1': { tier: 'flat', value: 110, template: '+{v} poison resistance' },
  'Improved Rot Resistance': { tier: 'flat', value: 75, template: '+{v} rot resistance' },
  'Improved Rot Resistance +1': { tier: 'flat', value: 110, template: '+{v} rot resistance' },
  'Improved Sleep Resistance': { tier: 'flat', value: 75, template: '+{v} sleep resistance' },
  'Improved Sleep Resistance +1': { tier: 'flat', value: 110, template: '+{v} sleep resistance' },

  // ── Poise (baseline, multiplicative — confirmed "Stackable: Yes") ─────────
  'Poise +1': { tier: 'baseline', bucket: 'resource', stat: 'poiseDamageTaken', value: 0.95 },
  'Poise +2': { tier: 'baseline', bucket: 'resource', stat: 'poiseDamageTaken', value: 0.9 },
  'Poise +3': { tier: 'baseline', bucket: 'resource', stat: 'poiseDamageTaken', value: 0.85 },

  // ── Rune gain (baseline, multiplicative — confirmed "Stackable: Yes",
  // shares the runeGain resource slot with the "Reduced Rune Acquisition"
  // curse above) ────────────────────────────────────────────────────────────
  'Increased rune acquisition for self and allies': { tier: 'baseline', bucket: 'resource', stat: 'runeGain', value: 1.035 },

  // ── Base stat points (flat/additive, pool-based — confirmed "Stackable:
  // Yes"). Vigor/Mind/Endurance have a clean HP/FP/Stamina conversion in the
  // source spreadsheet, so those pools are tracked in derived-resource terms;
  // Strength/Dexterity/Intelligence/Faith/Arcane have no such conversion
  // (their effects are indirect — damage scaling, poise, equip load, etc.),
  // so those pools are tracked as raw stat points instead. ───────────────────
  'Vigor +1': { tier: 'flat', pools: [{ pool: 'vigor', value: 20 }] },
  'Vigor +2': { tier: 'flat', pools: [{ pool: 'vigor', value: 40 }] },
  'Vigor +3': { tier: 'flat', pools: [{ pool: 'vigor', value: 60 }] },
  'Mind +1': { tier: 'flat', pools: [{ pool: 'mind', value: 5 }] },
  'Mind +2': { tier: 'flat', pools: [{ pool: 'mind', value: 10 }] },
  'Mind +3': { tier: 'flat', pools: [{ pool: 'mind', value: 15 }] },
  'Endurance +1': { tier: 'flat', pools: [{ pool: 'endurance', value: 2 }] },
  'Endurance +2': { tier: 'flat', pools: [{ pool: 'endurance', value: 4 }] },
  'Endurance +3': { tier: 'flat', pools: [{ pool: 'endurance', value: 6 }] },
  'Strength +1': { tier: 'flat', pools: [{ pool: 'strength', value: 1 }] },
  'Strength +2': { tier: 'flat', pools: [{ pool: 'strength', value: 2 }] },
  'Strength +3': { tier: 'flat', pools: [{ pool: 'strength', value: 3 }] },
  'Dexterity +1': { tier: 'flat', pools: [{ pool: 'dexterity', value: 1 }] },
  'Dexterity +2': { tier: 'flat', pools: [{ pool: 'dexterity', value: 2 }] },
  'Dexterity +3': { tier: 'flat', pools: [{ pool: 'dexterity', value: 3 }] },
  'Intelligence +1': { tier: 'flat', pools: [{ pool: 'intelligence', value: 1 }] },
  'Intelligence +2': { tier: 'flat', pools: [{ pool: 'intelligence', value: 2 }] },
  'Intelligence +3': { tier: 'flat', pools: [{ pool: 'intelligence', value: 3 }] },
  'Faith +1': { tier: 'flat', pools: [{ pool: 'faith', value: 1 }] },
  'Faith +2': { tier: 'flat', pools: [{ pool: 'faith', value: 2 }] },
  'Faith +3': { tier: 'flat', pools: [{ pool: 'faith', value: 3 }] },
  'Arcane +1': { tier: 'flat', pools: [{ pool: 'arcane', value: 1 }] },
  'Arcane +2': { tier: 'flat', pools: [{ pool: 'arcane', value: 2 }] },
  'Arcane +3': { tier: 'flat', pools: [{ pool: 'arcane', value: 3 }] },
};

// ── Weapon-type Attack Power (both variants are conditional: single-weapon requires that
// weapon's hits, 3+ equipped requires 3+ of that type in your loadout) ──
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
    tier: 'conditional', bucket: 'damage', axes: ['physical'], group: 'weapon', value: singleValue,
    condition: `${w.single} hits only`,
  };
  EFFECT_MULTIPLIERS[`Improved Attack Power with 3+ ${w.plural} Equipped`] = {
    tier: 'conditional', special: true, bucket: 'damage', axes: ['universal'], group: 'weapon', value: groupValue,
    condition: `3+ ${w.plural} Equipped`,
  };
}
