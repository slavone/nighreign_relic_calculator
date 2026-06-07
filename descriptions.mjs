// Effect descriptions sourced from:
// "Nightreign Useful Info (Version 1.03.2) (+ DLC) - Relic Effects.csv"
// "Nightreign Useful Info (Version 1.03.2) (+ DLC) - Deep Relic Effects.csv"
//
// Keyed by exact effect name (after \n → space normalization).

export const EFFECT_DESCRIPTIONS = {
  // ── Vigor / Mind / Endurance ──────────────────────────────────────────────
  'Vigor +1': '+20 Max HP',
  'Vigor +2': '+40 Max HP',
  'Vigor +3': '+60 Max HP',
  'Mind +1':  '+5 Max FP',
  'Mind +2':  '+10 Max FP',
  'Mind +3':  '+15 Max FP',
  'Endurance +1': '+2 Max Stamina',
  'Endurance +2': '+4 Max Stamina',
  'Endurance +3': '+6 Max Stamina',

  // ── Poise ─────────────────────────────────────────────────────────────────
  'Poise +1': '0.95× incoming poise damage',
  'Poise +2': '0.9× incoming poise damage',
  'Poise +3': '0.85× incoming poise damage',

  // ── Cooldown / Ultimate ───────────────────────────────────────────────────
  'Character Skill Cooldown Reduction +1': '0.95× skill cooldown',
  'Character Skill Cooldown Reduction +2': '0.925× skill cooldown',
  'Character Skill Cooldown Reduction +3': '0.9× skill cooldown',
  'Ultimate Art Auto Charge +1': '1.05× ultimate gauge gain',
  'Ultimate Art Auto Charge +2': '1.075× ultimate gauge gain',
  'Ultimate Art Auto Charge +3': '1.1× ultimate gauge gain',

  // ── Physical Attack ───────────────────────────────────────────────────────
  'Physical Attack Up':    '1.04× physical damage',
  'Physical Attack Up +1': '1.05× physical damage',
  'Physical Attack Up +2': '1.06× physical damage',
  'Physical Attack Up +3': '1.105× physical damage',
  'Physical Attack Up +4': '1.12× physical damage',

  // ── Elemental Attack ─────────────────────────────────────────────────────
  'Magic Attack Power Up':    '1.045× magic damage',
  'Magic Attack Power Up +1': '1.055× magic damage',
  'Magic Attack Power Up +2': '1.065× magic damage',
  'Magic Attack Power Up +3': '1.105× magic damage',
  'Magic Attack Power Up +4': '1.12× magic damage',

  'Fire Attack Power Up':    '1.045× fire damage',
  'Fire Attack Power Up +1': '1.055× fire damage',
  'Fire Attack Power Up +2': '1.065× fire damage',
  'Fire Attack Power Up +3': '1.105× fire damage',
  'Fire Attack Power Up +4': '1.12× fire damage',

  'Lightning Attack Power Up':    '1.045× lightning damage',
  'Lightning Attack Power Up +1': '1.055× lightning damage',
  'Lightning Attack Power Up +2': '1.065× lightning damage',
  'Lightning Attack Power Up +3': '1.105× lightning damage',
  'Lightning Attack Power Up +4': '1.12× lightning damage',

  'Holy Attack Power Up':    '1.045× holy damage',
  'Holy Attack Power Up +1': '1.055× holy damage',
  'Holy Attack Power Up +2': '1.065× holy damage',
  'Holy Attack Power Up +3': '1.105× holy damage',
  'Holy Attack Power Up +4': '1.12× holy damage',

  // ── Affinity Attack (DON) ─────────────────────────────────────────────────
  'Improved Affinity Attack Power':    '1.05× magic/fire/lightning/holy damage',
  'Improved Affinity Attack Power +1': '1.08× magic/fire/lightning/holy damage',
  'Improved Affinity Attack Power +2': '1.1× magic/fire/lightning/holy damage',

  // ── Other Attack ─────────────────────────────────────────────────────────
  'Improved Initial Standard Attack':                     '1.15× first light attack damage',
  'Improved Critical Hits':                               '1.18× critical hit damage',
  'Taking attacks improves attack power':                 '1.15× damage for 10s after taking a hit',
  'Attack power increased for each evergaol prisoner defeated': '1.05× damage per Evergaol boss defeated',
  'Attack power increased for each Night Invader defeated':     '1.07× damage per Night Invader defeated',

  // ── Guard Counters ────────────────────────────────────────────────────────
  'Improved Guard Counters':    '1.17× guard counter damage',
  'Improved Guard Counters +1': '1.25× guard counter damage',
  'Improved Guard Counters +2': '1.29× guard counter damage',

  // ── Grease ────────────────────────────────────────────────────────────────
  'Physical attack power increases after using grease items':    '1.1× physical damage for 30s after using grease',
  'Physical attack power increases after using grease items +1': '1.17× physical damage for 30s after using grease',
  'Physical attack power increases after using grease items +2': '1.2× physical damage for 30s after using grease',

  // ── Attack vs Status-Afflicted ────────────────────────────────────────────
  'Attack power up when facing frostbite-afflicted enemy':    '1.1× damage vs frostbite-afflicted targets',
  'Attack power up when facing frostbite-afflicted enemy +1': '1.16× damage vs frostbite-afflicted targets',
  'Attack power up when facing frostbite-afflicted enemy +2': '1.2× damage vs frostbite-afflicted targets',

  'Attack power up when facing poison-afflicted enemy':    '1.1× damage vs poison-afflicted targets',
  'Attack power up when facing poison-afflicted enemy +1': '1.16× damage vs poison-afflicted targets',
  'Attack power up when facing poison-afflicted enemy +2': '1.2× damage vs poison-afflicted targets',

  'Attack power up when facing scarlet rot-afflicted enemy':    '1.1× damage vs rot-afflicted targets',
  'Attack power up when facing scarlet rot-afflicted enemy +1': '1.16× damage vs rot-afflicted targets',
  'Attack power up when facing scarlet rot-afflicted enemy +2': '1.2× damage vs rot-afflicted targets',

  // ── Sorceries / Incantations (DON) ───────────────────────────────────────
  'Improved Sorceries':    '1.05× sorcery damage',
  'Improved Sorceries +1': '1.085× sorcery damage',
  'Improved Sorceries +2': '1.1× sorcery damage',
  'Improved Incantations':    '1.05× incantation damage',
  'Improved Incantations +1': '1.085× incantation damage',
  'Improved Incantations +2': '1.1× incantation damage',

  // ── Sleep / Madness Vicinity (DON) ───────────────────────────────────────
  'Sleep in Vicinity Improves Attack Power':    '1.12× damage after sleep procs nearby',
  'Sleep in Vicinity Improves Attack Power +1': '1.22× damage after sleep procs nearby',
  'Madness in Vicinity Improves Attack Power':    '1.12× damage after madness procs nearby',
  'Madness in Vicinity Improves Attack Power +1': '1.22× damage after madness procs nearby',

  // ── Reduced FP Consumption ────────────────────────────────────────────────
  'Reduced FP Consumption':    '0.92× FP consumption',
  'Reduced FP Consumption +1': '0.87× FP consumption',
  'Reduced FP Consumption +2': '0.84× FP consumption',

  // ── Element Damage Negation ───────────────────────────────────────────────
  'Fire Damage Negation Up':      '+10% fire damage negation',
  'Magic Damage Negation Up':     '+10% magic damage negation',
  'Lightning Damage Negation Up': '+10% lightning damage negation',
  'Holy Damage Negation Up':      '+10% holy damage negation',

  'Improved Fire Damage Negation +1':      '+15% fire damage negation',
  'Improved Fire Damage Negation +2':      '+16% fire damage negation',
  'Improved Magic Damage Negation +1':     '+15% magic damage negation',
  'Improved Magic Damage Negation +2':     '+16% magic damage negation',
  'Improved Lightning Damage Negation +1': '+15% lightning damage negation',
  'Improved Lightning Damage Negation +2': '+16% lightning damage negation',
  'Improved Holy Damage Negation +1':      '+15% holy damage negation',
  'Improved Holy Damage Negation +2':      '+16% holy damage negation',

  // ── Physical Damage Negation (DON) ────────────────────────────────────────
  'Improved Physical Damage Negation +1': '+10.5% physical damage negation',
  'Improved Physical Damage Negation +2': '+12% physical damage negation',

  // ── Affinity Damage Negation ──────────────────────────────────────────────
  'Improved Affinity Damage Negation':    '+6% magic/fire/lightning/holy damage negation',
  'Improved Affinity Damage Negation +1': '+10.5% magic/fire/lightning/holy damage negation',
  'Improved Affinity Damage Negation +2': '+12% magic/fire/lightning/holy damage negation',

  // ── Status Resistance ─────────────────────────────────────────────────────
  'Improved Blood Loss Resistance':    '+75 blood loss resistance',
  'Improved Blood Loss Resistance +1': '+110 blood loss resistance',
  'Improved Death Blight Resistance':    '+75 death blight resistance',
  'Improved Death Blight Resistance +1': '+110 death blight resistance',
  'Improved Frost Resistance':    '+75 frost resistance',
  'Improved Frost Resistance +1': '+110 frost resistance',
  'Improved Madness Resistance':    '+75 madness resistance',
  'Improved Madness Resistance +1': '+110 madness resistance',
  'Improved Poison Resistance':    '+75 poison resistance',
  'Improved Poison Resistance +1': '+110 poison resistance',
  'Improved Rot Resistance':    '+75 rot resistance',
  'Improved Rot Resistance +1': '+110 rot resistance',
  'Improved Sleep Resistance':    '+75 sleep resistance',
  'Improved Sleep Resistance +1': '+110 sleep resistance',

  // ── Poise & Damage Negation on Hit ────────────────────────────────────────
  'Improved Poise & Damage Negation When Knocked Back by Damage':
    '20% damage negation and 0.8× poise damage taken for 20s after being hit',

  // ── DON stat maximums ─────────────────────────────────────────────────────
  'Increased Maximum HP':      '1.1× maximum HP',
  'Increased Maximum FP':      '1.15× maximum FP',
  'Increased Maximum Stamina': '1.12× maximum stamina',
  'Improved Flask HP Restoration': '1.1× HP from flasks',

  // ── Regen ─────────────────────────────────────────────────────────────────
  'HP Restoration on Attack (by Weapon Type)':   'Restores 15 HP with continuous attacks',
  'FP Restoration on Attack (by Weapon Type)':   'Restores 2 FP with continuous attacks',
  'HP Restoration upon Thrusting Counterattack': 'Restores [MaxHP × 0.025] HP on counterhits',
  'HP restored when using medicinal boluses, etc.': 'Restores 50 HP on consumable use',
  'Partial HP Restoration upon Post-Damage Attacks': 'Replenishes HP on hit briefly after taking damage',
  'Defeating Enemies Restores HP for Allies':    'Allies recover 20 HP on each enemy kill',
  'Raised Stamina Recovery for Nearby Allies':   "+4/s stamina recovery for nearby allies",
  'Slowly Restore HP When HP Is Low':            'Restores HP/s for 50s when HP is below 20%',
  'Flask Also Heals Allies':                     'Heals allies for 50% of flask HP in a radius',

  // ── Spell Schools (all 1.12×) ────────────────────────────────────────────
  'Improved Stonedigger Sorcery':           '1.12× Stonedigger sorcery damage',
  'Improved Carian Sword Sorcery':          '1.12× Carian Sword sorcery damage',
  'Improved Glintblade Sorcery':            '1.12× Glintblade sorcery damage',
  'Improved Invisibility Sorcery':          '1.12× Invisibility sorcery damage',
  'Improved Crystalian sorcery':            '1.12× Crystalian sorcery damage',
  'Improved Gravity Sorcery':              '1.12× Gravity sorcery damage',
  'Improved Thorn Sorcery':                '1.12× Thorn sorcery damage',
  'Improved Fundamentalist Incantations':  '1.12× Fundamentalist incantation damage',
  'Improved Dragon Cult Incantations':     '1.12× Dragon Cult incantation damage',
  "Improved Giants' Flame Incantations":   "1.12× Giants' Flame incantation damage",
  'Improved Godslayer Incantations':       '1.12× Godslayer incantation damage',
  'Improved Bestial Incantations':         '1.12× Bestial incantation damage',
  'Improved Frenzied Flame Incantations':  '1.12× Frenzied Flame incantation damage',
  'Improved Dragon Communion Incantations':'1.12× Dragon Communion incantation damage',

  // ── Single Weapon Type Attack Power (1.09×; 1.06× for bows) ─────────────
  'Improved Dagger Attack Power':              '1.09× Dagger damage',
  'Improved Straight Sword Attack Power':      '1.09× Straight Sword damage',
  'Improved Greatsword Attack Power':          '1.09× Greatsword damage',
  'Improved Colossal Sword Attack Power':      '1.09× Colossal Sword damage',
  'Improved Curved Sword Attack Power':        '1.09× Curved Sword damage',
  'Improved Curved Greatsword Attack Power':   '1.09× Curved Greatsword damage',
  'Improved Katana Attack Power':              '1.09× Katana damage',
  'Improved Twinblade Attack Power':           '1.09× Twinblade damage',
  'Improved Thrusting Sword Attack Power':     '1.09× Thrusting Sword damage',
  'Improved Heavy Thrusting Sword Attack Power':'1.09× Heavy Thrusting Sword damage',
  'Improved Axe Attack Power':                 '1.09× Axe damage',
  'Improved Greataxe Attack Power':            '1.09× Greataxe damage',
  'Improved Hammer Attack Power':              '1.09× Hammer damage',
  'Improved Great Hammer Attack Power':        '1.09× Great Hammer damage',
  'Improved Flail Attack Power':               '1.09× Flail damage',
  'Improved Spear Attack Power':               '1.09× Spear damage',
  'Improved Great Spear Attack Power':         '1.09× Great Spear damage',
  'Improved Halberd Attack Power':             '1.09× Halberd damage',
  'Improved Reaper Attack Power':              '1.09× Reaper damage',
  'Improved Fist Attack Power':                '1.09× Fist damage',
  'Improved Claw Attack Power':                '1.09× Claw damage',
  'Improved Whip Attack Power':                '1.09× Whip damage',
  'Improved Colossal Weapon Attack Power':     '1.09× Colossal Weapon damage',
  'Improved Bow Attack Power':                 '1.06× Bow damage',

  // ── 3+ Weapon Type Attack Power ──────────────────────────────────────────
  'Improved Attack Power with 3+ Daggers Equipped':              '1.2× damage with 3+ Daggers equipped',
  'Improved Attack Power with 3+ Straight Swords Equipped':      '1.2× damage with 3+ Straight Swords equipped',
  'Improved Attack Power with 3+ Greatswords Equipped':          '1.2× damage with 3+ Greatswords equipped',
  'Improved Attack Power with 3+ Colossal Swords Equipped':      '1.2× damage with 3+ Colossal Swords equipped',
  'Improved Attack Power with 3+ Curved Swords Equipped':        '1.2× damage with 3+ Curved Swords equipped',
  'Improved Attack Power with 3+ Curved Greatswords Equipped':   '1.2× damage with 3+ Curved Greatswords equipped',
  'Improved Attack Power with 3+ Katana Equipped':               '1.2× damage with 3+ Katanas equipped',
  'Improved Attack Power with 3+ Twinblades Equipped':           '1.2× damage with 3+ Twinblades equipped',
  'Improved Attack Power with 3+ Thrusting Swords Equipped':     '1.2× damage with 3+ Thrusting Swords equipped',
  'Improved Attack Power with 3+ Heavy Thrusting Swords Equipped':'1.2× damage with 3+ Heavy Thrusting Swords equipped',
  'Improved Attack Power with 3+ Axes Equipped':                 '1.2× damage with 3+ Axes equipped',
  'Improved Attack Power with 3+ Greataxes Equipped':            '1.2× damage with 3+ Greataxes equipped',
  'Improved Attack Power with 3+ Hammers Equipped':              '1.2× damage with 3+ Hammers equipped',
  'Improved Attack Power with 3+ Great Hammers Equipped':        '1.2× damage with 3+ Great Hammers equipped',
  'Improved Attack Power with 3+ Flails Equipped':               '1.2× damage with 3+ Flails equipped',
  'Improved Attack Power with 3+ Spears Equipped':               '1.2× damage with 3+ Spears equipped',
  'Improved Attack Power with 3+ Great Spears Equipped':         '1.2× damage with 3+ Great Spears equipped',
  'Improved Attack Power with 3+ Halberds Equipped':             '1.2× damage with 3+ Halberds equipped',
  'Improved Attack Power with 3+ Reapers Equipped':              '1.2× damage with 3+ Reapers equipped',
  'Improved Attack Power with 3+ Fists Equipped':                '1.2× damage with 3+ Fists equipped',
  'Improved Attack Power with 3+ Claws Equipped':                '1.2× damage with 3+ Claws equipped',
  'Improved Attack Power with 3+ Whips Equipped':                '1.2× damage with 3+ Whips equipped',
  'Improved Attack Power with 3+ Colossal Weapons Equipped':     '1.2× damage with 3+ Colossal Weapons equipped',
  'Improved Attack Power with 3+ Bows Equipped':                 '1.1× damage with 3+ Bows equipped',

  // ── Consumable Damage ────────────────────────────────────────────────────
  'Improved Glintstone and Gravity Stone Damage':    '1.15× stone projectile damage',
  'Improved Glintstone and Gravity Stone Damage +1': '1.3× stone projectile damage',
  'Improved Throwing Knife Damage':    '1.15× throwing knife damage',
  'Improved Throwing Knife Damage +1': '1.3× throwing knife damage',
  'Improved Throwing Pot Damage':    '1.15× throwing pot damage',
  'Improved Throwing Pot Damage +1': '1.3× throwing pot damage',

  // ── Exploration ───────────────────────────────────────────────────────────
  'Max HP per Great Church Boss':    '1.05× max HP for each Great Church boss defeated',
  'Runes & Discovery per Fort Boss': '+16 discovery, 1.055× runes for each Fort boss defeated',
  'Arcane per Ruin Boss':            '+4 Arcane for each Ruin boss defeated',
  'Max Stamina per Camp Boss':       '1.075× max stamina for each Camp boss defeated',
  'Max HP increased for each great enemy defeated at a Great Church.': '1.05× max HP per Great Church boss',
  'Runes and Item Discovery increased for each great enemy defeated at a Fort': '+16 discovery, 1.055× runes per Fort boss',
  'Arcane increased for each great enemy defeated at a Ruin': '+4 Arcane per Ruin boss',
  'Max stamina increased for each great enemy defeated at a Great Encampment': '1.075× max stamina per Camp boss',
};

export const CURSE_DESCRIPTIONS = {
  'All Resistances Down':                 '−80 all status resistances',
  'Continuous HP Loss':                   '−2 HP/s',
  'Lower Attack When Below Max HP':       '0.915× damage when HP below 85%',
  'Near Death Reduces Max HP':            '0.75× max HP for 60s after being downed',
  'Poison Buildup When Below Max HP':     '2 poison buildup per 0.22s when HP below 85%',
  'Reduced Damage Negation After Evading': '−45% damage negation right after rolling',
  'Reduced Damage Negation for Flask Usages': '−45% damage negation while using flasks',
  'Reduced Dexterity and Faith':          '−3 Dexterity and Faith',
  'Reduced Faith and Strength':           '−3 Faith and Strength',
  'Reduced Flask HP Restoration':         '0.85× HP from flasks',
  'Reduced Intelligence and Dexterity':   '−3 Intelligence and Dexterity',
  'Reduced Rune Acquisition':             '0.9× rune gain',
  'Reduced Strength and Intelligence':    '−3 Strength and Intelligence',
  'Reduced Vigor and Arcane':             '−3 Vigor and Arcane (−60 HP)',
  'Repeated Evasions Lower Damage Negation': '−23%/−35% damage negation for 15s on repeated rolls',
  'Rot Buildup When Below Max HP':        '2 rot buildup per 0.24s when HP below 85%',
  'Taking Damage Causes Blood Loss Buildup': 'Taking damage inflicts 44 blood loss buildup',
  'Taking Damage Causes Death Buildup':   'Taking damage inflicts 32 death blight buildup',
  'Taking Damage Causes Frost Buildup':   'Taking damage inflicts 44 frost buildup',
  'Taking Damage Causes Madness Buildup': 'Taking damage inflicts 40 madness buildup',
  'Taking Damage Causes Poison Buildup':  'Taking damage inflicts 52 poison buildup',
  'Taking Damage Causes Rot Buildup':     'Taking damage inflicts 44 rot buildup',
  'Taking Damage Causes Sleep Buildup':   'Taking damage inflicts 40 sleep buildup',
  'Ultimate Art Charging Impaired':       '0.85× ultimate gauge gain',
};
