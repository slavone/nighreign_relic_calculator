// Schema validation for effect_multipliers.mjs — every entry must have a
// self-consistent shape so the calc engine (computeBuildTotals) never has
// to guess or crash on malformed data.
import { EFFECT_MULTIPLIERS } from '../effect_multipliers.mjs';
import { readFileSync } from 'fs';

let passed = 0, failed = 0;
function check(label, ok) {
  if (ok) { passed++; }
  else { failed++; console.error('  FAIL ' + label); }
}

const VALID_TIERS = new Set(['baseline', 'conditional', 'flat']);
const VALID_BUCKETS = new Set(['damage', 'negation', 'resource']);
const VALID_AXES = new Set(['physical', 'magic', 'fire', 'lightning', 'holy', 'universal']);
const VALID_CATEGORIES = new Set(['sorcery', 'incantation']);
const VALID_GROUPS = new Set(['weapon', 'hitType', 'status']);
const VALID_STATS = new Set(['cooldown', 'ultimateCharge', 'fpConsumption', 'maxHP', 'maxFP', 'maxStamina', 'flaskHeal', 'runeGain']);

const entries = Object.entries(EFFECT_MULTIPLIERS);
check('at least 80 entries present', entries.length >= 80);

for (const [name, m] of entries) {
  check(`${name}: tier is valid`, VALID_TIERS.has(m.tier));
  check(`${name}: value is a finite number`, typeof m.value === 'number' && Number.isFinite(m.value));

  if (m.tier === 'flat') {
    // Additive tier — duplicates SUM, not multiply. No bucket/axes/category/
    // group/stat concept applies; only a template for regenerating the
    // description after combining duplicates' values.
    check(`${name}: flat entry has no bucket`, m.bucket === undefined);
    check(`${name}: flat entry has no axes`, m.axes === undefined);
    check(`${name}: flat entry has no category`, m.category === undefined);
    check(`${name}: flat entry has no group`, m.group === undefined);
    check(`${name}: flat entry has no stat`, m.stat === undefined);
    check(`${name}: flat entry has a template string`, typeof m.template === 'string' && m.template.includes('{v}'));
    check(`${name}: flat entry's condition, if present, is a non-empty string`,
      m.condition === undefined || (typeof m.condition === 'string' && m.condition.length > 0));
    continue;
  }

  check(`${name}: bucket is valid`, VALID_BUCKETS.has(m.bucket));
  check(`${name}: flat-only template is absent`, m.template === undefined);
  if (m.bucket === 'negation') {
    // Negation has no category concept — always axis-based.
    check(`${name}: axes is a non-empty array`, Array.isArray(m.axes) && m.axes.length > 0);
    (m.axes || []).forEach(a => check(`${name}: axis "${a}" is valid`, VALID_AXES.has(a)));
  } else if (m.bucket === 'damage') {
    // General "Improved Sorceries/Incantations" entries are category-only (no
    // fixed element of their own) — a damage entry needs axes OR a category.
    const hasAxes = Array.isArray(m.axes) && m.axes.length > 0;
    check(`${name}: has axes or a category`, hasAxes || m.category !== undefined);
    (m.axes || []).forEach(a => check(`${name}: axis "${a}" is valid`, VALID_AXES.has(a)));
  } else {
    check(`${name}: resource bucket has no axes`, m.axes === undefined);
    // Resource covers several genuinely different units (FP consumption,
    // cooldown, ultimate gauge, max HP/FP/stamina, flask healing, rune gain)
    // that must never be multiplied together — every resource entry needs a
    // stat tag so the UI can keep them in separate rows.
    check(`${name}: resource entry has a stat`, m.stat !== undefined);
    check(`${name}: stat is valid`, VALID_STATS.has(m.stat));
  }
  if (m.category !== undefined) {
    check(`${name}: category is valid`, VALID_CATEGORIES.has(m.category));
  }
  if (m.group !== undefined) {
    check(`${name}: group is valid`, VALID_GROUPS.has(m.group));
    check(`${name}: group and category are mutually exclusive`, m.category === undefined);
  }
  if (m.tier === 'conditional') {
    check(`${name}: conditional has a condition string`, typeof m.condition === 'string' && m.condition.length > 0);
    check(`${name}: conditional has a category or a group (for the summary tree)`,
      m.category !== undefined || m.group !== undefined);
  } else {
    check(`${name}: baseline has no condition string`, m.condition === undefined);
    check(`${name}: baseline has no group`, m.group === undefined);
  }
  // Negation values are fractional (can be negative for a curse that *removes*
  // negation); damage/resource values are multipliers, always positive.
  if (m.bucket === 'negation') {
    check(`${name}: negation value is in a sane fractional range`, m.value > -1 && m.value < 1);
  } else {
    check(`${name}: multiplier value is positive`, m.value > 0);
  }
}

// Spot-check a handful of specific entries the design spec calls out by name.
const bestial = EFFECT_MULTIPLIERS['Improved Bestial Incantations'];
check('Bestial Incantations is physical + incantation, conditional', bestial &&
  bestial.tier === 'conditional' && bestial.bucket === 'damage' &&
  bestial.axes.includes('physical') && bestial.category === 'incantation' && bestial.value === 1.12);

const godslayer = EFFECT_MULTIPLIERS['Improved Godslayer Incantations'];
check('Godslayer Incantations is fire', godslayer && godslayer.axes.includes('fire'));

const fundamentalist = EFFECT_MULTIPLIERS['Improved Fundamentalist Incantations'];
check('Fundamentalist Incantations is holy', fundamentalist && fundamentalist.axes.includes('holy'));

const dragonCult = EFFECT_MULTIPLIERS['Improved Dragon Cult Incantations'];
check('Dragon Cult Incantations is lightning', dragonCult && dragonCult.axes.includes('lightning'));

const stonedigger = EFFECT_MULTIPLIERS['Improved Stonedigger Sorcery'];
check('Stonedigger Sorcery is magic', stonedigger && stonedigger.axes.includes('magic'));

check('Dragon Communion Incantations is intentionally unmapped',
  EFFECT_MULTIPLIERS['Improved Dragon Communion Incantations'] === undefined);

const katanaSingle = EFFECT_MULTIPLIERS['Improved Katana Attack Power'];
check('single-weapon Katana bonus is conditional', katanaSingle && katanaSingle.tier === 'conditional' && katanaSingle.value === 1.09);

const katana3plus = EFFECT_MULTIPLIERS['Improved Attack Power with 3+ Katana Equipped'];
check('3+ Katana bonus is baseline universal', katana3plus &&
  katana3plus.tier === 'baseline' && katana3plus.axes.includes('universal') && katana3plus.value === 1.2);

const evasionCurse = EFFECT_MULTIPLIERS['Reduced Damage Negation After Evading'];
check('evasion curse is negative negation, conditional', evasionCurse &&
  evasionCurse.tier === 'conditional' && evasionCurse.bucket === 'negation' && evasionCurse.value === -0.45);

// User-caught gap: this real relic effect (Defensive category, "Increases
// damage negation by 16% when HP is below 40%") was completely unmapped,
// so it silently fell into the flat Other Effects list instead of the
// Damage Negation section's Actions subgroup where it belongs.
const lowHpNegation = EFFECT_MULTIPLIERS['Improved Damage Negation at Low HP'];
check('Improved Damage Negation at Low HP is mapped as a conditional negation', lowHpNegation &&
  lowHpNegation.tier === 'conditional' && lowHpNegation.bucket === 'negation' &&
  lowHpNegation.group === 'status' && lowHpNegation.value === 0.16);

// User-caught gap: "Reduced Rune Acquisition" (0.9x rune gain) is a real
// percentage multiplier, not a flat effect — it was only unmapped because
// no 'runeGain' resource-stat slot existed yet.
const runeAcquisition = EFFECT_MULTIPLIERS['Reduced Rune Acquisition'];
check('Reduced Rune Acquisition is a resource baseline multiplier, not flat', runeAcquisition &&
  runeAcquisition.tier === 'baseline' && runeAcquisition.bucket === 'resource' &&
  runeAcquisition.stat === 'runeGain' && runeAcquisition.value === 0.9);

// User-requested: flat/additive curses stack by SUMMING their value across
// duplicates, not multiplying — spot-check the two curses from the reported
// scenario plus one buildup-infliction curse for shape variety.
const allResistancesDown = EFFECT_MULTIPLIERS['All Resistances Down'];
check('All Resistances Down is flat, -80, with a {v} template', allResistancesDown &&
  allResistancesDown.tier === 'flat' && allResistancesDown.value === -80 &&
  allResistancesDown.template === '{v} all status resistances');

const continuousHpLoss = EFFECT_MULTIPLIERS['Continuous HP Loss'];
check('Continuous HP Loss is flat, -2, with a {v} template', continuousHpLoss &&
  continuousHpLoss.tier === 'flat' && continuousHpLoss.value === -2 &&
  continuousHpLoss.template === '{v} HP/s');

const bloodLossBuildup = EFFECT_MULTIPLIERS['Taking Damage Causes Blood Loss Buildup'];
check('Taking Damage Causes Blood Loss Buildup is flat, +44', bloodLossBuildup &&
  bloodLossBuildup.tier === 'flat' && bloodLossBuildup.value === 44);

check('multi-number curses (Reduced Vigor and Arcane, Repeated Evasions...) are intentionally left unmapped',
  EFFECT_MULTIPLIERS['Reduced Vigor and Arcane'] === undefined &&
  EFFECT_MULTIPLIERS['Repeated Evasions Lower Damage Negation'] === undefined);

// Guards against the exact mistake that slipped through once already: editing
// effect_multipliers.mjs without re-running prepare_data.mjs/prepare_don_data.mjs
// and re-embedding — data/relic_data.json and data/don_relic_data.json (and by
// extension index.html's embedded DATA/DON_DATA) must reflect the CURRENT
// source, not a stale snapshot from before a field was added.
function findMulByName(data, name) {
  for (const g of data.groups) {
    const e = g.effects.find(e => e.name === name);
    if (e) return e.mul;
  }
  return undefined;
}

const relicData = JSON.parse(readFileSync(new URL('../data/relic_data.json', import.meta.url), 'utf8'));
const donData = JSON.parse(readFileSync(new URL('../data/don_relic_data.json', import.meta.url), 'utf8'));

check('regenerated data/relic_data.json has the current Physical Attack Up +1 mul',
  JSON.stringify(findMulByName(relicData, 'Physical Attack Up +1')) === JSON.stringify(EFFECT_MULTIPLIERS['Physical Attack Up +1']));
check('regenerated data/relic_data.json has the current group field (Katana, weapon)',
  JSON.stringify(findMulByName(relicData, 'Improved Katana Attack Power')) === JSON.stringify(EFFECT_MULTIPLIERS['Improved Katana Attack Power']));
check('regenerated data/don_relic_data.json has the current Improved Bestial Incantations mul',
  JSON.stringify(findMulByName(donData, 'Improved Bestial Incantations')) === JSON.stringify(EFFECT_MULTIPLIERS['Improved Bestial Incantations']));

const donCurse = donData.curses.find(c => c.name === 'Reduced Damage Negation After Evading');
check('regenerated data/don_relic_data.json curse list has the current group field',
  donCurse && JSON.stringify(donCurse.mul) === JSON.stringify(EFFECT_MULTIPLIERS['Reduced Damage Negation After Evading']));

// User-caught gap: curses were the only relic-effect list encoded by name in
// share-link URLs (regular/DON effects always used their stable game-data
// id) — this locks in that every curse carries an id, and that ids are
// unique, so a future data regeneration can't silently drop this again.
check('every curse in data/don_relic_data.json has an id', donData.curses.every(c => c.id !== undefined));
check('curse ids are unique', new Set(donData.curses.map(c => c.id)).size === donData.curses.length);

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
