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
// group:     conditional entries without a category still need a display bucket for the
//            nested summary tree: 'weapon' (single-weapon/throwable-specific), 'hitType'
//            (crit/guard-counter/initial-attack), or 'status' (timing windows, vs-enemy-
//            status, curses — everything else transient/state-dependent).
// stat:      resource bucket only, REQUIRED for baseline entries. Resource covers several
//            genuinely different units (FP consumption, skill cooldown, ultimate gauge gain,
//            max HP/FP/stamina, flask healing) that must never be multiplied together — a
//            0.92x FP-consumption reduction and a 1.1x max-HP bonus aren't the same quantity.
//            One of: 'cooldown' | 'ultimateCharge' | 'fpConsumption' | 'maxHP' | 'maxFP' |
//            'maxStamina' | 'flaskHeal'.
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
  'Improved Initial Standard Attack': { tier: 'conditional', bucket: 'damage', axes: ['universal'], group: 'hitType', value: 1.15, condition: 'First light attack only' },
  'Improved Critical Hits': { tier: 'conditional', bucket: 'damage', axes: ['universal'], group: 'hitType', value: 1.18, condition: 'On critical hits' },
  'Taking attacks improves attack power': { tier: 'conditional', bucket: 'damage', axes: ['universal'], group: 'status', value: 1.15, condition: '10s after taking a hit' },
  'Improved Guard Counters': { tier: 'conditional', bucket: 'damage', axes: ['universal'], group: 'hitType', value: 1.17, condition: 'On guard counters' },
  'Improved Guard Counters +1': { tier: 'conditional', bucket: 'damage', axes: ['universal'], group: 'hitType', value: 1.25, condition: 'On guard counters' },
  'Improved Guard Counters +2': { tier: 'conditional', bucket: 'damage', axes: ['universal'], group: 'hitType', value: 1.29, condition: 'On guard counters' },
  'Physical attack power increases after using grease items': { tier: 'conditional', bucket: 'damage', axes: ['physical'], group: 'status', value: 1.1, condition: '30s after using grease items' },
  'Physical attack power increases after using grease items +1': { tier: 'conditional', bucket: 'damage', axes: ['physical'], group: 'status', value: 1.17, condition: '30s after using grease items' },
  'Physical attack power increases after using grease items +2': { tier: 'conditional', bucket: 'damage', axes: ['physical'], group: 'status', value: 1.2, condition: '30s after using grease items' },
  'Attack power up when facing frostbite-afflicted enemy': { tier: 'conditional', bucket: 'damage', axes: ['universal'], group: 'status', value: 1.1, condition: 'vs frostbite-afflicted enemies' },
  'Attack power up when facing frostbite-afflicted enemy +1': { tier: 'conditional', bucket: 'damage', axes: ['universal'], group: 'status', value: 1.16, condition: 'vs frostbite-afflicted enemies' },
  'Attack power up when facing frostbite-afflicted enemy +2': { tier: 'conditional', bucket: 'damage', axes: ['universal'], group: 'status', value: 1.2, condition: 'vs frostbite-afflicted enemies' },
  'Attack power up when facing poison-afflicted enemy': { tier: 'conditional', bucket: 'damage', axes: ['universal'], group: 'status', value: 1.1, condition: 'vs poison-afflicted enemies' },
  'Attack power up when facing poison-afflicted enemy +1': { tier: 'conditional', bucket: 'damage', axes: ['universal'], group: 'status', value: 1.16, condition: 'vs poison-afflicted enemies' },
  'Attack power up when facing poison-afflicted enemy +2': { tier: 'conditional', bucket: 'damage', axes: ['universal'], group: 'status', value: 1.2, condition: 'vs poison-afflicted enemies' },
  'Attack power up when facing scarlet rot-afflicted enemy': { tier: 'conditional', bucket: 'damage', axes: ['universal'], group: 'status', value: 1.1, condition: 'vs rot-afflicted enemies' },
  'Attack power up when facing scarlet rot-afflicted enemy +1': { tier: 'conditional', bucket: 'damage', axes: ['universal'], group: 'status', value: 1.16, condition: 'vs rot-afflicted enemies' },
  'Attack power up when facing scarlet rot-afflicted enemy +2': { tier: 'conditional', bucket: 'damage', axes: ['universal'], group: 'status', value: 1.2, condition: 'vs rot-afflicted enemies' },
  'Sleep in Vicinity Improves Attack Power': { tier: 'conditional', bucket: 'damage', axes: ['universal'], group: 'status', value: 1.12, condition: 'After sleep procs nearby' },
  'Sleep in Vicinity Improves Attack Power +1': { tier: 'conditional', bucket: 'damage', axes: ['universal'], group: 'status', value: 1.22, condition: 'After sleep procs nearby' },
  'Madness in Vicinity Improves Attack Power': { tier: 'conditional', bucket: 'damage', axes: ['universal'], group: 'status', value: 1.12, condition: 'After madness procs nearby' },
  'Madness in Vicinity Improves Attack Power +1': { tier: 'conditional', bucket: 'damage', axes: ['universal'], group: 'status', value: 1.22, condition: 'After madness procs nearby' },
  'Improved Glintstone and Gravity Stone Damage': { tier: 'conditional', bucket: 'damage', axes: ['magic'], group: 'weapon', value: 1.15, condition: 'Stone/Gravity Stone throws only' },
  'Improved Glintstone and Gravity Stone Damage +1': { tier: 'conditional', bucket: 'damage', axes: ['magic'], group: 'weapon', value: 1.3, condition: 'Stone/Gravity Stone throws only' },
  'Improved Throwing Knife Damage': { tier: 'conditional', bucket: 'damage', axes: ['physical'], group: 'weapon', value: 1.15, condition: 'Throwing Knife throws only' },
  'Improved Throwing Knife Damage +1': { tier: 'conditional', bucket: 'damage', axes: ['physical'], group: 'weapon', value: 1.3, condition: 'Throwing Knife throws only' },
  'Improved Throwing Pot Damage': { tier: 'conditional', bucket: 'damage', axes: ['universal'], group: 'weapon', value: 1.15, condition: 'Throwing Pot throws only' },
  'Improved Throwing Pot Damage +1': { tier: 'conditional', bucket: 'damage', axes: ['universal'], group: 'weapon', value: 1.3, condition: 'Throwing Pot throws only' },

  // ── DON curse: HP-threshold-dependent damage debuff (conditional) ────────
  'Lower Attack When Below Max HP': { tier: 'conditional', bucket: 'damage', axes: ['universal'], group: 'status', value: 0.915, condition: 'While HP is below 85%' },

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
  'Improved Poise & Damage Negation When Knocked Back by Damage': { tier: 'conditional', bucket: 'negation', axes: ['universal'], group: 'status', value: 0.20, condition: '20s after being hit' },
  'Reduced Damage Negation After Evading': { tier: 'conditional', bucket: 'negation', axes: ['universal'], group: 'status', value: -0.45, condition: 'Right after evading' },
  'Reduced Damage Negation for Flask Usages': { tier: 'conditional', bucket: 'negation', axes: ['universal'], group: 'status', value: -0.45, condition: 'While using flasks' },
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
    tier: 'conditional', bucket: 'damage', axes: ['physical'], group: 'weapon', value: singleValue,
    condition: `${w.single} hits only`,
  };
  EFFECT_MULTIPLIERS[`Improved Attack Power with 3+ ${w.plural} Equipped`] = {
    tier: 'baseline', bucket: 'damage', axes: ['universal'], value: groupValue,
  };
}
