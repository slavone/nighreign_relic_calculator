import { readFileSync, writeFileSync } from 'fs';
import { EFFECT_DESCRIPTIONS, CURSE_DESCRIPTIONS } from './descriptions.mjs';

function unescapeHtml(str) {
  return str.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
}

const NAME_OVERRIDES = {
  100:     'Attack Power',
  200:     'Starting Armament Element / Status',
  300:     'Starting Armament Skill',
  800:     'Spell School',
  900:     'Character Ability',
  6060300: 'Max HP per Great Church Boss',
  6060400: 'Runes & Discovery per Fort Boss',
  6060500: 'Arcane per Ruin Boss',
  6060600: 'Max Stamina per Camp Boss',
  6630000: 'Dormant Power - Weapon Discovery',
  7082500: 'Max FP with 3+ Staves / Seals',
  7082700: 'Max HP with 3+ Shields',
  7090100: 'Defeating Enemies Restores HP for Allies',
  7240000: 'Improved Poise & Damage Negation When Knocked Back',
  7260300: 'Attack Power vs Poison / Rot Afflicted',
  7340000: 'HP Restoration on Attack (by Weapon Type)',
  7350000: 'FP Restoration on Attack (by Weapon Type)',
  7260400: 'Attack Power vs Frostbite-Afflicted Enemy',
  6600000: 'Status Vicinity Improves Attack Power',
};

const CHAR_ORDER = ['Wylder','Guardian','Ironeye','Duchess','Raider','Revenant','Recluse','Executor','Scholar','Undertaker'];
function charSortKey(name) {
  const m = name.match(/^\[([^\]]+)\]/);
  if (!m) return CHAR_ORDER.length;
  const idx = CHAR_ORDER.indexOf(m[1]);
  return idx === -1 ? CHAR_ORDER.length - 1 : idx;
}

// Manual name corrections for effects with wrong or missing names in the XML
const EFFECT_NAME_OVERRIDES = {
  '6001400': 'Physical Attack Up +3',  // XML says "+4" but weight pattern matches +3 tier
  '6001401': 'Physical Attack Up +4',  // XML is %null% but this is the true +4 (rarer, w=130)
};

// Load names
const names = { ...EFFECT_NAME_OVERRIDES };
for (const file of ['AttachEffectName.fmg.xml', 'AttachEffectName_dlc01.fmg.xml']) {
  const xml = readFileSync(`data/${file}`, 'utf8');
  for (const m of xml.matchAll(/<text id="(\d+)">([^<]+)<\/text>/g)) {
    const name = m[2].trim();
    if (name && name !== '%null%' && !EFFECT_NAME_OVERRIDES[m[1]]) names[m[1]] = name;
  }
}

// Load effect params
const effectParams = {};
const csvLines = readFileSync('data/AttachEffectParam.csv', 'utf8').split('\n');
for (let i = 1; i < csvLines.length; i++) {
  const c = csvLines[i].split(',');
  if (!c[0]) continue;
  effectParams[c[0]] = { compatId: parseInt(c[8]), isDebuff: c[14] === '1' };
}

// Load table weights
const tableLines = readFileSync('data/AttachEffectTableParam.csv', 'utf8').split('\n');
const weights2000 = {}, weights2100 = {}, cursePureWeights = {};

// Also track regular pool for hasCurse detection
const regularPool = new Set();

for (let i = 1; i < tableLines.length; i++) {
  const cols = tableLines[i].trim().split(',');
  const tid = parseInt(cols[0]);
  const eid = cols[3];
  const w = parseInt(cols[4]) + 65536;
  if (w <= 0 || isNaN(parseInt(eid))) continue;
  if (tid === 110) regularPool.add(eid);
  if (tid === 2000000) weights2000[eid] = w;
  if (tid === 2100000) weights2100[eid] = w;
  if (tid === 3000000) cursePureWeights[eid] = w;
}

// Build DON positive effect groups
// hasCurse: all table-2000000 effects are cursed; table-2100000 effects cursed if DON-exclusive AND ends with +N
const groupMap = {};
const addEffect = (eid, w, fromTable2000) => {
  const name = names[eid];
  if (!name) return;
  const p = effectParams[eid];
  if (!p || p.isDebuff) return;
  const hasCurse = fromTable2000 || (!regularPool.has(eid) && / \+\d+$/.test(name));
  const compatId = p.compatId;
  if (!groupMap[compatId]) groupMap[compatId] = [];
  // Avoid duplicates (an effect could theoretically appear in both tables)
  if (!groupMap[compatId].find(e => e.id === eid)) {
    const eName = unescapeHtml(name);
    const desc = EFFECT_DESCRIPTIONS[eName.replace(/\n/g, ' ')] || '';
    groupMap[compatId].push({ id: eid, name: eName, w, hasCurse, ...(desc && { desc }) });
  }
};

for (const [eid, w] of Object.entries(weights2000)) addEffect(eid, w, true);
for (const [eid, w] of Object.entries(weights2100)) addEffect(eid, w, false);

// Sort effects within groups
for (const [compatId, effects] of Object.entries(groupMap)) {
  const cid = parseInt(compatId);
  if (cid === 900) {
    // Character abilities: sort by character order, then non-cursed before cursed within same char
    effects.sort((a, b) => {
      const keyA = charSortKey(a.name) * 10 + (a.hasCurse ? 1 : 0);
      const keyB = charSortKey(b.name) * 10 + (b.hasCurse ? 1 : 0);
      return keyA - keyB;
    });
  } else {
    // Group effects by base name (strip trailing +N), then sort by tier number within each base.
    // This keeps all tiers of an effect adjacent regardless of cursed status.
    const tierNum = name => {
      const m = name.match(/ \+(\d+)$/);
      return m ? parseInt(m[1]) : -1;
    };
    const baseName = name => name.replace(/ \+\d+$/, '');
    effects.sort((a, b) => {
      const baseA = baseName(a.name), baseB = baseName(b.name);
      if (baseA !== baseB) return baseA.localeCompare(baseB);
      return tierNum(a.name) - tierNum(b.name);
    });
  }
}

const groups = Object.entries(groupMap)
  .map(([compatId, effects]) => {
    const cid = parseInt(compatId);
    const derived = (effects[0]?.name ?? '').replace(/ \+\d+$/, '').replace(/\n/g, ' ');
    const rawGroupName = NAME_OVERRIDES[cid] ?? derived;
    const groupName = unescapeHtml(rawGroupName);
    return { compatId: cid, groupName, effects };
  })
  .sort((a, b) => a.groupName.localeCompare(b.groupName));

// Build curse list from table 3000000
const curses = Object.entries(cursePureWeights)
  .map(([eid, w]) => {
    const name = unescapeHtml(names[eid] || '(unknown)');
    const desc = CURSE_DESCRIPTIONS[name] || '';
    return { name, w, ...(desc && { desc }) };
  })
  .filter(c => c.name !== '(unknown)')
  .sort((a, b) => a.name.localeCompare(b.name));

// wTotal = sum of ALL non-zero weights in tables 2000000 + 2100000 (named + unnamed).
// weights2000/weights2100 already include unnamed effects, so no extra addition needed.
const wTotal = Object.values(weights2000).reduce((s, w) => s + w, 0)
             + Object.values(weights2100).reduce((s, w) => s + w, 0);
const wCurseTotal = Object.values(cursePureWeights).reduce((s, w) => s + w, 0);

const namedCount = Object.values(groupMap).flat().length;
const cursedCount = Object.values(groupMap).flat().filter(e => e.hasCurse).length;
console.log(`Named effects: ${namedCount} in ${groups.length} groups`);
console.log(`Cursed: ${cursedCount}, Uncursed: ${namedCount - cursedCount}`);
console.log(`Curses: ${curses.length}`);

const output = {
  wTotal,
  wCurseTotal,
  groups: groups.map(({ groupName, effects }) => ({ groupName, effects })),
  curses,
};

writeFileSync('data/don_relic_data.json', JSON.stringify(output, null, 2));
console.log(`\nwTotal=${wTotal}, wCurseTotal=${wCurseTotal}`);
console.log('Wrote data/don_relic_data.json');
