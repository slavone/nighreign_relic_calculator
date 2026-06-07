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
  if (!m) return CHAR_ORDER.length; // non-character effects sort last
  const idx = CHAR_ORDER.indexOf(m[1]);
  return idx === -1 ? CHAR_ORDER.length - 1 : idx;
}

const raw = JSON.parse(readFileSync('data/relic_groups.json', 'utf8'));

const clean = raw
  .map(g => {
    const effects = g.effects.map(e => unescapeHtml(e.name));
    if (g.compatibilityId === 900) {
      effects.sort((a, b) => charSortKey(a) - charSortKey(b));
    }
    return {
      groupName: unescapeHtml(NAME_OVERRIDES[g.compatibilityId] ?? g.groupName),
      effects,
    };
  })
  .sort((a, b) => a.groupName.localeCompare(b.groupName));

writeFileSync('data/relic_data.json', JSON.stringify(clean, null, 2));
console.log(`Wrote ${clean.length} groups, ${clean.reduce((s, g) => s + g.effects.length, 0)} effects`);
