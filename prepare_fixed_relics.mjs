import { readFileSync, writeFileSync } from 'fs';
import { EFFECT_DESCRIPTIONS } from './descriptions.mjs';
import { EFFECT_MULTIPLIERS } from './effect_multipliers.mjs';

// Guaranteed (fixed-effect) relics for Effect Multipliers mode. Each relic's
// effects are resolved from game data:
//   EquipParamAntique.attachEffectTableId_1..3 → AttachEffectTableParam rows
//   (attachEffectId) → AttachEffectParam.attachTextId → AttachEffectName(.dlc01).
// Group assignment is explicit (see the design spec) — not inferred.
const GROUPS = {
  boss: [2000, 2001, 2010, 2011, 2020, 2021, 2030, 2031, 2040, 2041, 2050, 2051, 2060, 2061, 2070, 2071, 2080, 2100],
  remembrance: [11000, 11001, 11002, 12000, 12001, 12002, 12003, 13001, 13002, 14000, 14001, 14002, 15000, 15002,
    16001, 16002, 17001, 17002, 18000, 18002, 19000, 19001, 19050, 19051],
  // 3-Sigil "Grand … Scene" relics. 1810/1840/1910/1930 have names but no
  // effects, so they're not listed.
  signboard: [1400, 1410, 1420, 1430, 1440, 1450, 1460, 1470, 1480, 1490, 1500, 1510, 1520,
    1600, 1610, 1620, 1630, 1640, 1650, 1660, 1670, 1680, 1690, 1700, 1710, 1720, 1730, 1740, 1750,
    1800, 1820, 1830, 1850, 1860, 1870, 1880, 1890, 1900, 1920],
  misc: [10000, 10001, 10002],
};

// A relic is DLC when its name only exists in AntiqueName_dlc01.fmg.xml — the
// same name-file rule used for DLC effects. The 20 DLC Signboard relics with
// only base-game effects were hidden by best guess; if an in-game check
// without the DLC shows some are sold to base-game players, list their IDs
// here to un-DLC them.
const DLC_OVERRIDE_BASE = new Set([]);

function unescapeHtml(str) {
  return str.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
}

function parseNames(file) {
  const map = new Map();
  for (const m of readFileSync(`data/${file}`, 'utf8').matchAll(/<text id="(\d+)">([^<]*)<\/text>/g)) {
    const name = m[2].trim();
    if (name && name !== '%null%') map.set(Number(m[1]), unescapeHtml(name));
  }
  return map;
}

// Plain comma split is safe for these param CSVs: array-ish fields are
// written as [0|0|0] with no commas inside.
function parseCsv(file, requiredColumns) {
  const lines = readFileSync(`data/${file}`, 'utf8').split('\n').filter(l => l.trim());
  const header = lines[0].split(',').map(h => h.trim());
  for (const col of requiredColumns) {
    if (!header.includes(col)) throw new Error(`${file}: missing column ${col}`);
  }
  return lines.slice(1).map(l => {
    const cols = l.split(',');
    return Object.fromEntries(header.map((h, i) => [h, cols[i]?.trim()]));
  });
}

const TABLE_COLS = ['attachEffectTableId_1', 'attachEffectTableId_2', 'attachEffectTableId_3'];
const antique = new Map(parseCsv('EquipParamAntique.csv', ['ID', 'relicColor', 'isDeepRelic', ...TABLE_COLS])
  .map(r => [Number(r.ID), r]));
const effectParam = new Map(parseCsv('AttachEffectParam.csv', ['ID', 'attachTextId']).map(r => [Number(r.ID), r]));
const effectTables = new Map();
for (const r of parseCsv('AttachEffectTableParam.csv', ['ID', 'attachEffectId'])) {
  const id = Number(r.ID);
  if (!effectTables.has(id)) effectTables.set(id, []);
  effectTables.get(id).push(Number(r.attachEffectId));
}

const effectNames = new Map([...parseNames('AttachEffectName.fmg.xml'), ...parseNames('AttachEffectName_dlc01.fmg.xml')]);
const baseRelicNames = parseNames('AntiqueName.fmg.xml');
const dlcRelicNames = parseNames('AntiqueName_dlc01.fmg.xml');

function resolveEffect(effectId) {
  const param = effectParam.get(effectId);
  if (!param) throw new Error(`effect ${effectId}: not in AttachEffectParam.csv`);
  const raw = effectNames.get(Number(param.attachTextId));
  if (!raw) throw new Error(`effect ${effectId}: no name for attachTextId ${param.attachTextId}`);
  const name = raw.replace(/\n/g, ' ');
  const desc = EFFECT_DESCRIPTIONS[name] || '';
  const mul = EFFECT_MULTIPLIERS[name];
  return { id: effectId, name, ...(desc && { desc }), ...(mul && { mul }) };
}

const relics = [];
for (const [group, ids] of Object.entries(GROUPS)) {
  for (const id of ids) {
    const row = antique.get(id);
    if (!row) throw new Error(`relic ${id}: not in EquipParamAntique.csv`);
    if (row.isDeepRelic !== '0') throw new Error(`relic ${id}: is a Deep relic`);
    const name = baseRelicNames.get(id) ?? dlcRelicNames.get(id);
    if (!name) throw new Error(`relic ${id}: no name in AntiqueName files`);
    const dlc = !baseRelicNames.has(id) && dlcRelicNames.has(id) && !DLC_OVERRIDE_BASE.has(id);
    const effects = [];
    for (const col of TABLE_COLS) {
      const tableId = Number(row[col]);
      if (tableId === -1) continue;
      const rows = effectTables.get(tableId);
      if (!rows) throw new Error(`relic ${id}: effect table ${tableId} not found`);
      const live = rows.filter(e => e !== -1);
      // A multi-row table would be a weighted random roll, not a fixed effect.
      if (live.length !== 1) throw new Error(`relic ${id}: table ${tableId} has ${live.length} effects, expected 1`);
      effects.push(resolveEffect(live[0]));
    }
    if (effects.length === 0) throw new Error(`relic ${id}: no effects`);
    relics.push({ id, name, group, color: Number(row.relicColor), ...(dlc && { dlc: true }), effects });
  }
}

const output = { groups: Object.keys(GROUPS), relics };
writeFileSync('data/fixed_relics.json', JSON.stringify(output, null, 2));
console.log(`fixed_relics.json: ${relics.length} relics (${relics.filter(r => r.dlc).length} DLC)`);
