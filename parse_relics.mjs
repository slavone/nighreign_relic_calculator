import { readFileSync, writeFileSync } from 'fs';

// --- Parse XML name files ---
function parseNameXml(content) {
  const map = {};
  for (const m of content.matchAll(/<text id="(\d+)">([^<]*)<\/text>/g)) {
    const id = parseInt(m[1]);
    const name = m[2].trim();
    if (name && name !== '%null%') map[id] = name;
  }
  return map;
}

const names = {
  ...parseNameXml(readFileSync('AttachEffectName.fmg.xml', 'utf8')),
  ...parseNameXml(readFileSync('AttachEffectName_dlc01.fmg.xml', 'utf8')),
};

// --- Parse AttachEffectParam.csv ---
// Columns (0-indexed):
// 0:ID 1:Name 2:onHitSpEffect 3:unknown_1 4:unknown_2
// 5:passiveSpEffectId_1 6:passiveSpEffectId_2 7:passiveSpEffectId_3
// 8:compatibilityId 9:attachTextId 10:isPersistentEffect 11:isNumericEffect
// 12:isStrongestEffect 13:unknown_8a4 14:isDebuff 15:unknown_8c 16:unknown_8d
// 17:displayPercentageSymbol 18:allowWylder 19:allowGuardian 20:allowIroneye
// 21:allowDuchess 22:allowRaider 23:allowRevenant 24:allowRecluse 25:allowExecutor
// 26:unknown_9c1 27:unknown_9c2 28:unknown_9c3 29:unknown_9d
// 30:statusIconId 31:overrideBaseEffectId 32:displayedModifierValue 33:overrideEffectId
// 34:attachFilterParamId 35:exclusivityId 36:permanentSpEffectId
const CHARS = ['Wylder','Guardian','Ironeye','Duchess','Raider','Revenant','Recluse','Executor'];

const effectParams = {};
const lines = readFileSync('AttachEffectParam.csv', 'utf8').split('\n');
const header = lines[0];
for (let i = 1; i < lines.length; i++) {
  const row = lines[i].trim();
  if (!row) continue;
  const cols = row.split(',');
  const id = parseInt(cols[0]);
  if (isNaN(id)) continue;
  effectParams[id] = {
    compatibilityId: parseInt(cols[8]),
    exclusivityId: parseInt(cols[35]),
    isDebuff: cols[14] === '1',
    chars: CHARS.filter((_, idx) => cols[18 + idx] === '1'),
  };
}

// --- Parse AttachEffectTableParam.csv to find rollable pool ---
// Find all effectIds that appear in table 100 or 110
const rollablePool = new Set();
const tableLines = readFileSync('AttachEffectTableParam.csv', 'utf8').split('\n');
// Columns: ID, Name, unknown_0, attachEffectId, chanceWeight
for (let i = 1; i < tableLines.length; i++) {
  const row = tableLines[i].trim();
  if (!row) continue;
  const cols = row.split(',');
  const tableId = parseInt(cols[0]);
  const effectId = parseInt(cols[3]);
  if ((tableId === 100 || tableId === 110) && !isNaN(effectId) && effectId > 0) {
    rollablePool.add(effectId);
  }
}

console.log(`Rollable pool size (tables 100+110): ${rollablePool.size}`);

// --- Build groups ---
// Only include effects that: are in rollable pool, have a name, are not debuffs
const groupMap = {};
for (const effectId of rollablePool) {
  const name = names[effectId];
  if (!name) continue;
  const params = effectParams[effectId];
  if (!params) continue;
  if (params.isDebuff) continue;

  const compatId = params.compatibilityId;
  if (!groupMap[compatId]) groupMap[compatId] = [];
  groupMap[compatId].push({ id: effectId, name, chars: params.chars });
}

// Sort effects within each group by id
for (const g of Object.values(groupMap)) {
  g.sort((a, b) => a.id - b.id);
}

// --- Build output ---
// Derive a group name from the first effect name (strip tier suffixes)
function deriveGroupName(effects) {
  if (effects.length === 1) return effects[0].name;
  // Find common prefix of all names
  const names = effects.map(e => e.name);
  let prefix = names[0];
  for (const n of names.slice(1)) {
    while (!n.startsWith(prefix)) {
      prefix = prefix.slice(0, -1);
    }
  }
  return prefix.trim().replace(/[+,]$/, '').trim() || names[0];
}

const groups = Object.entries(groupMap)
  .map(([compatId, effects]) => ({
    compatibilityId: parseInt(compatId),
    groupName: deriveGroupName(effects),
    effects,
  }))
  .sort((a, b) => a.compatibilityId - b.compatibilityId);

console.log(`Total groups: ${groups.length}`);
console.log(`Total rollable effects with names: ${groups.reduce((s, g) => s + g.effects.length, 0)}`);

// Print group summary
for (const g of groups) {
  const charNote = g.effects.some(e => e.chars.length < 8)
    ? ` [char-specific: ${[...new Set(g.effects.flatMap(e => e.chars))].join(',')}]`
    : '';
  console.log(`  compatId=${g.compatibilityId} "${g.groupName}" (${g.effects.length} effects)${charNote}`);
}

writeFileSync('relic_groups.json', JSON.stringify(groups, null, 2));
console.log('\nWrote relic_groups.json');
