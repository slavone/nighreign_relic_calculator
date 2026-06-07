// Effect descriptions sourced from:
// "Nightreign Useful Info (Version 1.03.2) (+ DLC) - Relic Effects.csv"
// "Nightreign Useful Info (Version 1.03.2) (+ DLC) - Deep Relic Effects.csv"
//
// Keyed by group name. Both regular and DON groups use this same map.
// DON cursed tiers noted where the bonus differs from the regular tier.

export const DESCRIPTIONS = {
  // ── Stats ───────────────────────────────────────────────────────────────
  'Vigor':     '+20/+40/+60 Max HP',
  'Mind':      '+5/+10/+15 Max FP',
  'Endurance': '+2/+4/+6 Max Stamina',
  'Poise':     'Reduces incoming poise damage by 0.95×/0.9×/0.85×',

  // ── Art gauge ────────────────────────────────────────────────────────────
  'Character Skill Cooldown Reduction': 'Reduces skill cooldown by 0.95×/0.925×/0.9×',
  'Ultimate Art Auto Charge':           'Increases ultimate gauge gain by 1.05×/1.075×/1.1×',
  'Critical hits fill more of the Art gauge':      '+5 to Ultimate Art Gauge on critical hits',
  'Defeating enemies fills more of the Art gauge':  '+5 to Ultimate Art Gauge per enemy kill',
  'Successful guarding fills more of the Art gauge':'+1 to Ultimate Art Gauge on successful block',
  'Stamina Recovery upon Landing Attacks':          'Restores 2/3 stamina with continuous attacks',
  'Critical Hit Boosts Stamina Recovery Speed':     'Increases stamina recovery by 10/s for 15 seconds',

  // ── Regen ────────────────────────────────────────────────────────────────
  'HP Restoration on Attack (by Weapon Type)':  'Restores 15 HP with continuous attacks',
  'FP Restoration on Attack (by Weapon Type)':  'Restores 2 FP with continuous attacks',
  'HP Restoration upon Thrusting Counterattack':'Restores [MaxHP × 0.025] HP on counterhits',
  'HP restored when using medicinal boluses, etc.': 'Restores 50 HP on consumable use',
  'Partial HP Restoration upon Post-Damage Attacks':'Replenishes HP on hit briefly after taking damage',
  'Defeating Enemies Restores HP for Allies':   'Allies recover 20 HP on each enemy kill',
  'Raised Stamina Recovery for Nearby Allies':  "Increases allies' stamina recovery speed by 4/s",
  'Slowly Restore HP When HP Is Low':           'Restores HP/s for 50 seconds when HP is below 20%',
  'Flask Also Heals Allies':                    'Heals allies for 50% of flask HP in a radius',

  // ── DON-exclusive stat effects ────────────────────────────────────────────
  'Increased Maximum HP':      'Increases maximum HP by 1.1×',
  'Increased Maximum FP':      'Increases maximum FP by 1.15×',
  'Increased Maximum Stamina': 'Increases maximum stamina by 1.12×',
  'Improved Flask HP Restoration': 'Increases HP from flasks by 1.1×',
  'Reduced FP Consumption':    'Reduces FP consumption by 0.92×/0.87×/0.84×',

  // ── Offensive ────────────────────────────────────────────────────────────
  'Spell School':  'Increases damage of the specified spell school by 1.12×',
  'Attack Power vs Poison / Rot Afflicted':   '1.1× damage vs poison/rot-afflicted targets',
  'Attack Power vs Frostbite-Afflicted Enemy':'1.1× damage vs frostbite-afflicted targets',
  'Improved Affinity Attack Power': 'Magic/fire/lightning/holy damage × 1.05/1.08/1.1',
  'Status Vicinity Improves Attack Power':    '1.12×/1.22× damage after sleep/madness procs nearby',
  'Improved Glintstone and Gravity Stone Damage':'Increases stone projectile damage by 1.15×',
  'Improved Throwing Knife Damage': 'Increases throwing knife damage by 1.15×',
  'Improved Throwing Pot Damage':   'Increases throwing pot damage by 1.15×',
  'Dormant Power - Weapon Discovery':'Changes preferred weapon class, making it more likely to drop',
  'Starting Armament Element / Status':"Changes starting weapon to deal elemental damage or inflict status",
  'Starting Armament Skill':          "Changes starting weapon's skill",

  // ── Defensive ─────────────────────────────────────────────────────────────
  'Fire Damage Negation Up':      'Increases fire damage negation (+10%; DON cursed tiers: +15%/+16%)',
  'Holy Damage Negation Up':      'Increases holy damage negation (+10%; DON cursed tiers: +15%/+16%)',
  'Lightning Damage Negation Up': 'Increases lightning damage negation (+10%; DON cursed tiers: +15%/+16%)',
  'Magic Damage Negation Up':     'Increases magic damage negation (+10%; DON cursed tiers: +15%/+16%)',
  'Improved Affinity Damage Negation': 'Magic/fire/lightning/holy damage negation +6%/+10.5%/+12%',
  'Improved Physical Damage Negation': 'Physical damage negation +10.5%/+12%',
  'Improved Damage Negation at Low HP':'16% damage negation when HP is below 40%',
  'Improved Poise & Damage Negation When Knocked Back':
    '20% damage negation and 0.8× poise damage taken for 20 seconds',
  'Draw enemy attention while guarding': 'Increases aggro while blocking (not guaranteed)',

  // Status resistance — regular +75; DON cursed tiers +110/+130
  'Improved Blood Loss Resistance': 'Increases blood loss resistance (+75; DON cursed: +110/+130)',
  'Improved Death Blight Resistance':'Increases death blight resistance (+75; DON cursed: +110/+130)',
  'Improved Frost Resistance':       'Increases frost resistance (+75; DON cursed: +110/+130)',
  'Improved Madness Resistance':     'Increases madness resistance (+75; DON cursed: +110/+130)',
  'Improved Poison Resistance':      'Increases poison resistance (+75; DON cursed: +110/+130)',
  'Improved Rot Resistance':         'Increases rot resistance (+75; DON cursed: +110/+130)',
  'Improved Sleep Resistance':       'Increases sleep resistance (+75; DON cursed: +110/+130)',

  // ── Exploration ───────────────────────────────────────────────────────────
  'Flask Also Heals Allies':                        'Heals allies for 50% of flask HP in a radius',
  'Items confer effect to all nearby allies':        'Items used affect nearby allies too',
  'Increased rune acquisition for self and allies':  '1.035× rune gain for self and allies',
  'Critical Hits Earn Runes':                        'Gain 600 runes on critical hits',
  'Treasure marked upon map':                        'Reveals hidden chest locations',
  'Max FP increased for each Sorcerer\'s Rise unlocked': 'Max FP × 1.18 per Sorcerer\'s Rise unlocked',
  'Rune discount for shop purchases while on expedition': '10%/20% discount at merchants',
  'Max FP with 3+ Staves / Seals': '+50 Max FP when carrying 3+ staves or seals',
  'Max HP with 3+ Shields':        '+200 Max HP when carrying 3+ shields',

  // DON exploration
  'Max HP per Great Church Boss':    'Max HP × 1.05 for each Great Church boss defeated',
  'Runes & Discovery per Fort Boss': '+16 discovery, runes × 1.055 for each Fort boss defeated',
  'Arcane per Ruin Boss':            '+4 Arcane for each Ruin boss defeated',
  'Max Stamina per Camp Boss':       'Max Stamina × 1.075 for each Camp boss defeated',
};
