// Schema validation for effect_multipliers.mjs — every entry must have a
// self-consistent shape so the calc engine (computeBuildTotals) never has
// to guess or crash on malformed data.
import { EFFECT_MULTIPLIERS } from '../effect_multipliers.mjs';

let passed = 0, failed = 0;
function check(label, ok) {
  if (ok) { passed++; }
  else { failed++; console.error('  FAIL ' + label); }
}

const VALID_TIERS = new Set(['baseline', 'conditional']);
const VALID_BUCKETS = new Set(['damage', 'negation', 'resource']);
const VALID_AXES = new Set(['physical', 'magic', 'fire', 'lightning', 'holy', 'universal']);
const VALID_CATEGORIES = new Set(['sorcery', 'incantation']);

const entries = Object.entries(EFFECT_MULTIPLIERS);
check('at least 80 entries present', entries.length >= 80);

for (const [name, m] of entries) {
  check(`${name}: tier is valid`, VALID_TIERS.has(m.tier));
  check(`${name}: bucket is valid`, VALID_BUCKETS.has(m.bucket));
  check(`${name}: value is a finite number`, typeof m.value === 'number' && Number.isFinite(m.value));
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
  }
  if (m.category !== undefined) {
    check(`${name}: category is valid`, VALID_CATEGORIES.has(m.category));
  }
  if (m.tier === 'conditional') {
    check(`${name}: conditional has a condition string`, typeof m.condition === 'string' && m.condition.length > 0);
  } else {
    check(`${name}: baseline has no condition string`, m.condition === undefined);
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

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
