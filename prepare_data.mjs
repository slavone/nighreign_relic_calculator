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

function unescapeHtml(str) {
  return str.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
}

const CHAR_ORDER = ['Wylder','Guardian','Ironeye','Duchess','Raider','Revenant','Recluse','Executor','Scholar','Undertaker'];

function charSortKey(effectName) {
  const m = effectName.match(/^\[([^\]]+)\]/);
  if (!m) return CHAR_ORDER.length;
  const idx = CHAR_ORDER.indexOf(m[1]);
  return idx === -1 ? CHAR_ORDER.length - 1 : idx;
}

// Use table 110 — all effects confirmed rollable regardless of quality.
// Table 100 had fewer effects but the significance of the split is unknown; table 110 is the full pool.
const tableLines = readFileSync('data/AttachEffectTableParam.csv', 'utf8').split('\n');
const weights = {};
for (let i = 1; i < tableLines.length; i++) {
  const cols = tableLines[i].trim().split(',');
  const tableId = parseInt(cols[0]);
  const effectId = parseInt(cols[3]);
  const w = parseInt(cols[4]) + 65536;
  if (tableId !== 110 || w <= 0 || isNaN(effectId)) continue;
  weights[effectId] = w;
}

const raw = JSON.parse(readFileSync('data/relic_groups.json', 'utf8'));

const clean = raw
  .map(g => {
    const effects = g.effects.map(e => ({
      name: unescapeHtml(e.name),
      w: weights[e.id] ?? 0,
    }));

    if (g.compatibilityId === 900) {
      effects.sort((a, b) => charSortKey(a.name) - charSortKey(b.name));
    }

    return {
      groupName: unescapeHtml(NAME_OVERRIDES[g.compatibilityId] ?? g.groupName),
      effects,
    };
  })
  .sort((a, b) => a.groupName.localeCompare(b.groupName));

// True total weight for table 110 (slightly higher than sum of named effects because
// 5 unnamed effects exist with combined weight 216).
const wTotal = 10046;

const output = { wTotal, groups: clean };
writeFileSync('data/relic_data.json', JSON.stringify(output, null, 2));
console.log(`Wrote ${clean.length} groups, ${clean.reduce((s, g) => s + g.effects.length, 0)} effects`);
console.log(`wTotal=${wTotal}`);
