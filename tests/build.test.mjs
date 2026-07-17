// Tests for computeBuildTotals(). Duplicated inline to match the exact code
// in index.html, per this project's existing test convention (see calc.test.mjs).

const AXES = ['physical', 'magic', 'fire', 'lightning', 'holy', 'universal'];

function computeBuildTotals(effects) {
  const damageBaseline = Object.fromEntries(AXES.map(a => [a, 1]));
  const negationBaseline = Object.fromEntries(AXES.map(a => [a, 1]));
  const categoryBaseline = { sorcery: 1, incantation: 1 };
  let resourceBaseline = 1;
  const conditional = [];
  const other = [];

  for (const effect of effects) {
    const m = effect.mul;
    if (!m) { other.push({ name: effect.name }); continue; }
    if (m.tier === 'conditional') { conditional.push({ name: effect.name, ...m }); continue; }
    if (m.bucket === 'resource') {
      resourceBaseline *= m.value;
    } else if (m.bucket === 'negation') {
      for (const axis of m.axes) negationBaseline[axis] *= (1 - m.value);
    } else {
      for (const axis of (m.axes || [])) damageBaseline[axis] *= m.value;
      if (m.category) categoryBaseline[m.category] *= m.value;
    }
  }

  // Universal always applies on top of a conditional entry's own specific axis
  // (Universal bonuses, by definition, apply regardless of damage type) — so it's
  // folded in unconditionally, skipping a second multiply if the entry's own axis
  // literally is "universal" (avoids squaring it).
  function combinedFor(c) {
    if (c.bucket === 'resource') return resourceBaseline * c.value;
    if (c.bucket === 'negation') {
      let combined = negationBaseline.universal;
      for (const axis of c.axes) if (axis !== 'universal') combined *= negationBaseline[axis];
      return combined * (1 - c.value);
    }
    let combined = damageBaseline.universal;
    for (const axis of c.axes) if (axis !== 'universal') combined *= damageBaseline[axis];
    if (c.category) combined *= categoryBaseline[c.category];
    return combined * c.value;
  }

  return {
    damageBaseline, negationBaseline, categoryBaseline, resourceBaseline,
    conditional: conditional.map(c => ({ ...c, combined: combinedFor(c) })),
    other,
  };
}

// --- Test harness (matches tests/calc.test.mjs style) ---
let passed = 0, failed = 0;
function test(label, actual, expected, tolerance = 1e-9) {
  const ok = typeof expected === 'number'
    ? Math.abs(actual - expected) < tolerance
    : actual === expected;
  if (ok) { passed++; console.log('  PASS ' + label); }
  else { failed++; console.error('  FAIL ' + label + ': got ' + JSON.stringify(actual) + ', expected ' + JSON.stringify(expected)); }
}

// Worked example from the design spec: Physical Attack Up +1, Improved
// Incantations +1, Improved Bestial Incantations (physical + incantation).
{
  const physicalUp1 = { tier: 'baseline', bucket: 'damage', axes: ['physical'], value: 1.05 };
  const incantationsUp1 = { tier: 'baseline', bucket: 'damage', category: 'incantation', value: 1.085 };
  const bestial = { tier: 'conditional', bucket: 'damage', axes: ['physical'], category: 'incantation', value: 1.12, condition: 'Casting Bestial incantations only' };
  const r = computeBuildTotals([
    { name: 'Physical Attack Up +1', mul: physicalUp1 },
    { name: 'Improved Incantations +1', mul: incantationsUp1 },
    { name: 'Improved Bestial Incantations', mul: bestial },
  ]);
  test('physical baseline', r.damageBaseline.physical, 1.05);
  test('incantation category baseline', r.categoryBaseline.incantation, 1.085);
  test('untouched axis stays 1', r.damageBaseline.magic, 1);
  test('bestial combined = physical * incantation * bestial', r.conditional[0].combined, 1.05 * 1.085 * 1.12);
  test('conditional entry carries its condition text', r.conditional[0].condition, 'Casting Bestial incantations only');
}

// Negation: a baseline Fire negation plus the evasion curse (negative value,
// universal axis) — the two must not interfere since they're different axes.
{
  const fireNeg = { tier: 'baseline', bucket: 'negation', axes: ['fire'], value: 0.10 };
  const evasionCurse = { tier: 'conditional', bucket: 'negation', axes: ['universal'], value: -0.45, condition: 'Right after evading' };
  const r = computeBuildTotals([
    { name: 'Fire Damage Negation Up', mul: fireNeg },
    { name: 'Reduced Damage Negation After Evading', mul: evasionCurse },
  ]);
  test('fire negation baseline (remaining-damage factor)', r.negationBaseline.fire, 0.90);
  test('universal negation baseline untouched', r.negationBaseline.universal, 1);
  test('evasion curse combined = 1 * (1 - (-0.45)) = 1.45', r.conditional[0].combined, 1.45);
}

// A Universal baseline (e.g. the 3+-weapon-equipped bonus) must fold into a
// conditional entry's combined figure even though the entry's own axis is
// Physical, not Universal — Universal applies to all damage by definition.
{
  const physicalUp1 = { tier: 'baseline', bucket: 'damage', axes: ['physical'], value: 1.05 };
  const katana3plus = { tier: 'baseline', bucket: 'damage', axes: ['universal'], value: 1.2 };
  const katanaSingle = { tier: 'conditional', bucket: 'damage', axes: ['physical'], value: 1.09, condition: 'Katana hits only' };
  const r = computeBuildTotals([
    { name: 'Physical Attack Up +1', mul: physicalUp1 },
    { name: 'Improved Attack Power with 3+ Katana Equipped', mul: katana3plus },
    { name: 'Improved Katana Attack Power', mul: katanaSingle },
  ]);
  test('universal baseline', r.damageBaseline.universal, 1.2);
  test('katana combined = physical * universal * katana', r.conditional[0].combined, 1.05 * 1.2 * 1.09);
}

// Duplicate effects (two relics rolling the same baseline effect) multiply twice.
{
  const physicalUp = { tier: 'baseline', bucket: 'damage', axes: ['physical'], value: 1.04 };
  const r = computeBuildTotals([
    { name: 'Physical Attack Up', mul: physicalUp },
    { name: 'Physical Attack Up', mul: physicalUp },
  ]);
  test('duplicate baseline effects both apply', r.damageBaseline.physical, 1.04 * 1.04);
}

// Unmapped effects fall into `other`, never silently multiplied.
{
  const r = computeBuildTotals([{ name: 'Vigor +1' }]);
  test('unmapped effect count', r.other.length, 1);
  test('unmapped effect name', r.other[0].name, 'Vigor +1');
  test('unmapped effect does not touch damage baseline', r.damageBaseline.physical, 1);
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
