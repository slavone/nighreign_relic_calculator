// Tests for computeBuildTotals(). Duplicated inline to match the exact code
// in index.html, per this project's existing test convention (see calc.test.mjs).

const AXES = ['physical', 'magic', 'fire', 'lightning', 'holy', 'universal'];

function computeBuildTotals(effects) {
  const damageBaseline = Object.fromEntries(AXES.map(a => [a, 1]));
  const negationBaseline = Object.fromEntries(AXES.map(a => [a, 1]));
  const categoryBaseline = { sorcery: 1, incantation: 1 };
  let resourceBaseline = 1;
  // Grouped by name: the same specific effect selected on multiple relics
  // genuinely stacks (e.g. 3 relics all with "Improved Carian Sword
  // Sorcery" all apply together whenever you cast one) — so duplicates
  // combine into a single row with a count, not N identical-looking rows
  // that each silently ignore their siblings.
  const conditionalByName = new Map();
  const otherByName = new Map();

  for (const effect of effects) {
    const m = effect.mul;
    if (!m) {
      const existing = otherByName.get(effect.name);
      if (existing) existing.count++;
      else otherByName.set(effect.name, { name: effect.name, count: 1 });
      continue;
    }
    if (m.tier === 'conditional') {
      const existing = conditionalByName.get(effect.name);
      if (existing) existing.count++;
      else conditionalByName.set(effect.name, { name: effect.name, ...m, count: 1 });
      continue;
    }
    if (m.bucket === 'resource') {
      resourceBaseline *= m.value;
    } else if (m.bucket === 'negation') {
      for (const axis of m.axes) negationBaseline[axis] *= (1 - m.value);
    } else {
      for (const axis of (m.axes || [])) damageBaseline[axis] *= m.value;
      if (m.category) categoryBaseline[m.category] *= m.value;
    }
  }

  // Each factor is { kind: 'axis'|'category'|'resource'|'self', key?, value } so
  // the UI can render a transparent multiplication chain (baseline axis ×
  // category × the effect's own value) instead of one opaque number. Only
  // non-1 baseline factors are included. `count` copies of the same effect
  // fold into its own "self" factor as value^count (or (1-v)^count for
  // negation) — identical repeated factors reduce to a power.
  function combinedFor(c) {
    const factors = [];
    if (c.bucket === 'resource') {
      if (resourceBaseline !== 1) factors.push({ kind: 'resource', value: resourceBaseline });
      factors.push({ kind: 'self', value: Math.pow(c.value, c.count) });
    } else if (c.bucket === 'negation') {
      if (negationBaseline.universal !== 1) factors.push({ kind: 'axis', key: 'universal', value: negationBaseline.universal });
      for (const axis of c.axes) if (axis !== 'universal' && negationBaseline[axis] !== 1) factors.push({ kind: 'axis', key: axis, value: negationBaseline[axis] });
      factors.push({ kind: 'self', value: Math.pow(1 - c.value, c.count) });
    } else {
      if (damageBaseline.universal !== 1) factors.push({ kind: 'axis', key: 'universal', value: damageBaseline.universal });
      for (const axis of c.axes) if (axis !== 'universal' && damageBaseline[axis] !== 1) factors.push({ kind: 'axis', key: axis, value: damageBaseline[axis] });
      if (c.category && categoryBaseline[c.category] !== 1) factors.push({ kind: 'category', key: c.category, value: categoryBaseline[c.category] });
      factors.push({ kind: 'self', value: Math.pow(c.value, c.count) });
    }
    const combined = factors.reduce((p, f) => p * f.value, 1);
    return { combined, factors };
  }

  // Nest each merged conditional entry under bucket -> (category ?? group):
  // Sorcery/Incantation-specific schools sit under their category; weapon-
  // specific / hit-type / situational effects sit under their own group.
  const conditionalTree = {
    damage: { sorcery: [], incantation: [], weapon: [], hitType: [], status: [] },
    negation: { status: [] },
    resource: { status: [] },
  };
  for (const c of conditionalByName.values()) {
    const key = c.category || c.group;
    const bucketTree = conditionalTree[c.bucket];
    (bucketTree[key] ||= []).push({ ...c, ...combinedFor(c) });
  }

  return {
    damageBaseline, negationBaseline, categoryBaseline, resourceBaseline,
    conditionalTree,
    other: [...otherByName.values()],
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
// Incantations +1, Improved Bestial Incantations (physical + incantation) —
// Bestial nests under conditionalTree.damage.incantation (its category).
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
  const bestialRow = r.conditionalTree.damage.incantation[0];
  test('bestial nests under damage.incantation', !!bestialRow, true);
  test('bestial combined = physical * incantation * bestial', bestialRow.combined, 1.05 * 1.085 * 1.12);
  test('bestial has 3 factors (physical axis, incantation category, self)', bestialRow.factors.length, 3);
  test('conditional entry carries its condition text', bestialRow.condition, 'Casting Bestial incantations only');
}

// Negation: a baseline Fire negation plus the evasion curse (negative value,
// universal axis, group 'status') — the two must not interfere since
// they're different axes. Nests under conditionalTree.negation.status.
{
  const fireNeg = { tier: 'baseline', bucket: 'negation', axes: ['fire'], value: 0.10 };
  const evasionCurse = { tier: 'conditional', bucket: 'negation', axes: ['universal'], group: 'status', value: -0.45, condition: 'Right after evading' };
  const r = computeBuildTotals([
    { name: 'Fire Damage Negation Up', mul: fireNeg },
    { name: 'Reduced Damage Negation After Evading', mul: evasionCurse },
  ]);
  test('fire negation baseline (remaining-damage factor)', r.negationBaseline.fire, 0.90);
  test('universal negation baseline untouched', r.negationBaseline.universal, 1);
  const curseRow = r.conditionalTree.negation.status[0];
  test('evasion curse nests under negation.status', !!curseRow, true);
  test('evasion curse combined = 1 * (1 - (-0.45)) = 1.45', curseRow.combined, 1.45);
  test('evasion curse has 1 factor (self only — universal baseline untouched)', curseRow.factors.length, 1);
}

// A Universal baseline (e.g. the 3+-weapon-equipped bonus) must fold into a
// conditional entry's combined figure even though the entry's own axis is
// Physical, not Universal — Universal applies to all damage by definition.
// Katana nests under conditionalTree.damage.weapon (its group).
{
  const physicalUp1 = { tier: 'baseline', bucket: 'damage', axes: ['physical'], value: 1.05 };
  const katana3plus = { tier: 'baseline', bucket: 'damage', axes: ['universal'], value: 1.2 };
  const katanaSingle = { tier: 'conditional', bucket: 'damage', axes: ['physical'], group: 'weapon', value: 1.09, condition: 'Katana hits only' };
  const r = computeBuildTotals([
    { name: 'Physical Attack Up +1', mul: physicalUp1 },
    { name: 'Improved Attack Power with 3+ Katana Equipped', mul: katana3plus },
    { name: 'Improved Katana Attack Power', mul: katanaSingle },
  ]);
  test('universal baseline', r.damageBaseline.universal, 1.2);
  const katanaRow = r.conditionalTree.damage.weapon[0];
  test('katana nests under damage.weapon', !!katanaRow, true);
  test('katana combined = physical * universal * katana', katanaRow.combined, 1.05 * 1.2 * 1.09);
}

// User-reported bug: the same conditional effect selected on 4 different
// relics (e.g. Improved Carian Sword Sorcery on 3 regular relics + 1 DON
// relic slot) must collapse into ONE row under damage.sorcery with count=4,
// whose combined figure reflects all 4 copies stacking (magic baseline ×
// sorcery category baseline × 1.12^4) — not 4 separate rows each silently
// showing only a single copy's contribution.
{
  const magicUp = { tier: 'baseline', bucket: 'damage', axes: ['magic'], value: 1.12 };
  const carianSword = { tier: 'conditional', bucket: 'damage', axes: ['magic'], category: 'sorcery', value: 1.12, condition: 'Casting Carian Sword sorceries only' };
  const r = computeBuildTotals([
    { name: 'Magic Attack Power Up +4', mul: magicUp },
    { name: 'Magic Attack Power Up +4', mul: magicUp },
    { name: 'Improved Carian Sword Sorcery', mul: carianSword },
    { name: 'Improved Carian Sword Sorcery', mul: carianSword },
    { name: 'Improved Carian Sword Sorcery', mul: carianSword },
    { name: 'Improved Carian Sword Sorcery', mul: carianSword },
  ]);
  test('4 duplicate conditional effects collapse into 1 row under damage.sorcery', r.conditionalTree.damage.sorcery.length, 1);
  const carianRow = r.conditionalTree.damage.sorcery[0];
  test('collapsed row carries count=4', carianRow.count, 4);
  test('magic baseline reflects both baseline copies', r.damageBaseline.magic, 1.12 * 1.12);
  test('combined reflects magic baseline × 1.12^4 (sorcery category untouched by baseline)',
    carianRow.combined, (1.12 * 1.12) * Math.pow(1.12, 4));
  test('other groups (incantation/weapon/hitType/status) stay empty',
    r.conditionalTree.damage.incantation.length + r.conditionalTree.damage.weapon.length +
    r.conditionalTree.damage.hitType.length + r.conditionalTree.damage.status.length, 0);
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
