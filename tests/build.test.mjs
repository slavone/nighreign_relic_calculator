// Tests for computeBuildTotals(). Duplicated inline to match the exact code
// in index.html, per this project's existing test convention (see calc.test.mjs).

const AXES = ['physical', 'magic', 'fire', 'lightning', 'holy', 'universal'];
// Resource stats are genuinely different units (FP consumption, cooldown,
// ultimate gauge, max HP/FP/stamina, flask healing) — they must never be
// multiplied together, so each gets its own baseline slot, exactly like
// damage/negation get one per element instead of one blended number.
const RESOURCE_STATS = ['cooldown', 'ultimateCharge', 'fpConsumption', 'maxHP', 'maxFP', 'maxStamina', 'flaskHeal', 'runeGain', 'poiseDamageTaken'];
// Pool-based flat entries merge by POOL KEY (not effect name) — the same
// underlying stat can be fed by multiple differently-named effects (e.g.
// both "Vigor +1" and the curse "Reduced Vigor and Arcane" affect the same
// Vigor total). Values can go either direction (a curse can push a pool
// negative), so formatting always shows an explicit sign, unlike the
// fixed-sign templates used by name-grouped flat entries.
const FLAT_POOL_TEMPLATES = {
  vigor: '{v} Max HP', mind: '{v} Max FP', endurance: '{v} Max Stamina',
  strength: '{v} Strength', dexterity: '{v} Dexterity', intelligence: '{v} Intelligence',
  faith: '{v} Faith', arcane: '{v} Arcane',
};
// Display labels (e.g. "Vigor") are a UI/rendering concern, not part of this
// pure calc function — computeBuildTotals hands back the raw `pool` key and
// the renderer (index.html) resolves it through i18n, matching how every
// other translated string in the output stays untranslated until render.

function computeBuildTotals(effects) {
  const damageBaseline = Object.fromEntries(AXES.map(a => [a, 1]));
  const negationBaseline = Object.fromEntries(AXES.map(a => [a, 1]));
  const categoryBaseline = { sorcery: 1, incantation: 1 };
  const resourceBaseline = Object.fromEntries(RESOURCE_STATS.map(s => [s, 1]));
  // Grouped by name: the same specific effect selected on multiple relics
  // genuinely stacks (e.g. 3 relics all with "Improved Carian Sword
  // Sorcery" all apply together whenever you cast one) — so duplicates
  // combine into a single row with a count, not N identical-looking rows
  // that each silently ignore their siblings.
  const conditionalByName = new Map();
  const otherByName = new Map();
  // Flat effects are ADDITIVE, not multiplicative — two copies of "All
  // Resistances Down" (−80 each) really do mean −160, so duplicates sum
  // their value directly rather than combining via count + a power, unlike
  // every other tier.
  const flatByName = new Map();
  // Pool-based flat entries (see FLAT_POOL_TEMPLATES above) merge by pool key
  // instead of effect name — one relic-effect selection can feed 2+ pools at
  // once (e.g. "Reduced Vigor and Arcane" touches both vigor and arcane).
  const flatByPool = new Map();

  for (const effect of effects) {
    const m = effect.mul;
    if (!m) {
      const existing = otherByName.get(effect.name);
      if (existing) existing.count++;
      else otherByName.set(effect.name, { name: effect.name, desc: effect.desc, count: 1 });
      continue;
    }
    if (m.tier === 'flat') {
      if (m.pools) {
        for (const part of m.pools) {
          const existing = flatByPool.get(part.pool);
          if (existing) { existing.value += part.value; existing.count++; }
          else flatByPool.set(part.pool, { pool: part.pool, value: part.value, count: 1 });
        }
        continue;
      }
      const existing = flatByName.get(effect.name);
      if (existing) { existing.value += m.value; existing.count++; }
      else flatByName.set(effect.name, { name: effect.name, value: m.value, template: m.template, condition: m.condition, count: 1 });
      continue;
    }
    if (m.tier === 'conditional') {
      const existing = conditionalByName.get(effect.name);
      if (existing) existing.count++;
      else conditionalByName.set(effect.name, { name: effect.name, ...m, count: 1 });
      continue;
    }
    if (m.bucket === 'resource') {
      resourceBaseline[m.stat] *= m.value;
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
      if (resourceBaseline[c.stat] !== 1) factors.push({ kind: 'resource', key: c.stat, value: resourceBaseline[c.stat] });
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

  // A universal-axis-only conditional (no category, axes === ['universal'])
  // applies to EVERY damage type, not just a standalone line — e.g. the
  // "Lower Attack When Below Max HP" curse should show up nested under each
  // active elemental baseline too ("what's my Physical damage while also
  // below 85% HP"), not just as an isolated -8.5% row disconnected from the
  // real total. Its own `combined` already folds in the universal baseline,
  // so nesting it under axis X is just axisBaseline × entry.combined.
  function nestUniversalOnly(baseline, groups) {
    const universalOnly = groups.flat().filter(c => c.axes.length === 1 && c.axes[0] === 'universal');
    const nested = {};
    for (const axis of AXES) {
      if (axis === 'universal' || baseline[axis] === 1) continue;
      nested[axis] = universalOnly.map(c => ({
        name: c.name, condition: c.condition, count: c.count,
        combined: baseline[axis] * c.combined,
      }));
    }
    return nested;
  }
  const damageUniversalOnly = [conditionalTree.damage.weapon, conditionalTree.damage.hitType, conditionalTree.damage.status]
    .flat().filter(c => c.axes.length === 1 && c.axes[0] === 'universal');
  const damageAxisNested = nestUniversalOnly(damageBaseline, [damageUniversalOnly]);
  const negationAxisNested = nestUniversalOnly(negationBaseline, [conditionalTree.negation.status]);

  // Same idea, one level deeper: a universal-axis situational effect applies
  // on top of every OTHER specific conditional entry too, not just the base
  // axis rows — e.g. Carian Sword Sorcery should show "...also below 85% HP"
  // nested under IT specifically, not just under the Magic baseline. Entries
  // that are themselves universal-only are skipped (no self-nesting, and no
  // nesting against other universal-onlies, to avoid combinatorial pairs).
  const damageUniversalOnlySet = new Set(damageUniversalOnly);
  function attachUniversalNesting(entry) {
    entry.nestedWithUniversal = damageUniversalOnlySet.has(entry) ? [] : damageUniversalOnly.map(u => ({
      name: u.name, condition: u.condition, count: u.count,
      combined: entry.combined * u.combined,
    }));
    return entry;
  }
  for (const group of ['sorcery', 'incantation', 'weapon', 'hitType', 'status']) {
    conditionalTree.damage[group] = conditionalTree.damage[group].map(attachUniversalNesting);
  }

  // Flat entries: description is regenerated from the template using the
  // SUMMED value across duplicates (not the original per-copy number), so
  // two relics with "All Resistances Down" show "−160 all status
  // resistances" — the real combined effect — not the original −80 with a
  // count tag bolted on.
  function formatFlatValue(v) { return v < 0 ? '−' + Math.abs(v) : String(v); }
  const flatFromNames = [...flatByName.values()].map(f => ({
    ...f,
    desc: f.template.replace('{v}', formatFlatValue(f.value)),
  }));
  // Pool totals can land on either side of zero (a curse can push a stat
  // negative even after gains), so they always show an explicit sign —
  // unlike name-grouped templates, which each already bake in a fixed sign
  // convention matching their own source description.
  function formatFlatPoolValue(v) { return (v < 0 ? '−' : '+') + Math.abs(v); }
  const flatFromPools = [...flatByPool.values()].map(p => ({
    pool: p.pool,
    desc: FLAT_POOL_TEMPLATES[p.pool].replace('{v}', formatFlatPoolValue(p.value)),
    count: p.count,
  }));
  const flat = [...flatFromNames, ...flatFromPools];

  return {
    damageBaseline, negationBaseline, categoryBaseline, resourceBaseline,
    conditionalTree, damageAxisNested, negationAxisNested, flat,
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

// User-reported request, matching their exact scenario: a universal-axis
// curse (Lower Attack When Below Max HP) shouldn't just sit as an isolated
// -8.5% line — it should also nest under every ACTIVE elemental baseline
// ("what's my Physical damage while also below 85% HP"), since it applies
// regardless of damage type. Only baselines that are actually non-1 get a
// nested branch — Magic stays untouched here, so it must not appear.
{
  const physicalUp4 = { tier: 'baseline', bucket: 'damage', axes: ['physical'], value: 1.12 };
  const hpCurse = { tier: 'conditional', bucket: 'damage', axes: ['universal'], group: 'status', value: 0.915, condition: 'While HP is below 85%' };
  const r = computeBuildTotals([
    { name: 'Physical Attack Up +4', mul: physicalUp4 },
    { name: 'Lower Attack When Below Max HP', mul: hpCurse },
  ]);
  test('physical baseline is 1.12', r.damageBaseline.physical, 1.12);
  test('magic baseline stays untouched', r.damageBaseline.magic, 1);
  test('curse nests under damage.status on its own', r.conditionalTree.damage.status.length, 1);
  test('damageAxisNested has a physical branch', !!r.damageAxisNested.physical, true);
  test('damageAxisNested has no magic branch (baseline untouched)', r.damageAxisNested.magic, undefined);
  test('nested physical branch = physical baseline × curse combined (1.12 × 0.915)',
    r.damageAxisNested.physical[0].combined, 1.12 * 0.915);
}

// User follow-up: the same curse should ALSO nest under a specific entry
// like Carian Sword Sorcery, not just the base axis rows — since it applies
// on top of any hit, including a Carian Sword spell cast while below 85% HP.
{
  const magicUp = { tier: 'baseline', bucket: 'damage', axes: ['magic'], value: 1.12 };
  const carianSword = { tier: 'conditional', bucket: 'damage', axes: ['magic'], category: 'sorcery', value: 1.12, condition: 'Casting Carian Sword sorceries only' };
  const hpCurse = { tier: 'conditional', bucket: 'damage', axes: ['universal'], group: 'status', value: 0.915, condition: 'While HP is below 85%' };
  const r = computeBuildTotals([
    { name: 'Magic Attack Power Up +4', mul: magicUp },
    { name: 'Improved Carian Sword Sorcery', mul: carianSword },
    { name: 'Lower Attack When Below Max HP', mul: hpCurse },
  ]);
  const carianRow = r.conditionalTree.damage.sorcery.find(c => c.name === 'Improved Carian Sword Sorcery');
  test('Carian row carries a nestedWithUniversal entry', carianRow.nestedWithUniversal.length, 1);
  test('nested entry is the HP curse', carianRow.nestedWithUniversal[0].name, 'Lower Attack When Below Max HP');
  test('nested combined = Carian combined × curse combined',
    carianRow.nestedWithUniversal[0].combined, carianRow.combined * 0.915);
  const curseRow = r.conditionalTree.damage.status.find(c => c.name === 'Lower Attack When Below Max HP');
  test('the curse itself does not nest under itself (empty array)', curseRow.nestedWithUniversal.length, 0);
}

// User-reported bug: Resource/Recovery used to blend every resource stat
// into one "Combined" number, which was meaningless (FP consumption and
// max HP are different units — multiplying them together produces
// nonsense) and, worse, showed a bare unlabeled number when only one stat
// was selected ("Combined ×0.92" — combined with what?). Each stat must
// now get its own labeled row, and unrelated stats must not interfere.
{
  const fpConsumption = { tier: 'baseline', bucket: 'resource', stat: 'fpConsumption', value: 0.92 };
  const r = computeBuildTotals([{ name: 'Reduced FP Consumption', mul: fpConsumption }]);
  test('fpConsumption baseline reflects the selected effect', r.resourceBaseline.fpConsumption, 0.92);
  test('unrelated resource stats stay untouched', r.resourceBaseline.maxHP, 1);
  test('unrelated resource stats stay untouched (cooldown)', r.resourceBaseline.cooldown, 1);
}

// A conditional resource entry (Near Death Reduces Max HP, stat: maxHP)
// must only fold in the maxHP baseline as its factor, never fpConsumption
// or any other stat's baseline — different resource stats must never mix.
{
  const maxHPUp = { tier: 'baseline', bucket: 'resource', stat: 'maxHP', value: 1.1 };
  const fpConsumption = { tier: 'baseline', bucket: 'resource', stat: 'fpConsumption', value: 0.92 };
  const nearDeath = { tier: 'conditional', bucket: 'resource', stat: 'maxHP', group: 'status', value: 0.75, condition: '60s after being downed' };
  const r = computeBuildTotals([
    { name: 'Increased Maximum HP', mul: maxHPUp },
    { name: 'Reduced FP Consumption', mul: fpConsumption },
    { name: 'Near Death Reduces Max HP', mul: nearDeath },
  ]);
  const nearDeathRow = r.conditionalTree.resource.status[0];
  test('Near Death row combined = maxHP baseline × its own value (not fpConsumption)',
    nearDeathRow.combined, 1.1 * 0.75);
  test('Near Death row has exactly 2 factors (maxHP baseline + self, no fpConsumption leak)',
    nearDeathRow.factors.length, 2);
}

// Unmapped effects fall into `other`, never silently multiplied.
{
  const r = computeBuildTotals([{ name: 'Vigor +1' }]);
  test('unmapped effect count', r.other.length, 1);
  test('unmapped effect name', r.other[0].name, 'Vigor +1');
  test('unmapped effect does not touch damage baseline', r.damageBaseline.physical, 1);
}

// User-caught gap: unmapped effects showed a bare name with no explanation
// of what they do. `desc` must survive into the `other` entry so the UI can
// render it — e.g. "Reduced Vigor and Arcane — −3 Vigor and Arcane (−60 HP)"
// instead of leaving the user to guess. (This effect is intentionally left
// unmapped since it has two distinct numbers in one description.)
{
  const r = computeBuildTotals([{ name: 'Reduced Vigor and Arcane', desc: '−3 Vigor and Arcane (−60 HP)' }]);
  test('unmapped effect carries its desc through to `other`', r.other[0].desc, '−3 Vigor and Arcane (−60 HP)');
}

// User-requested: flat/additive effects (a curse selected on 2 different
// relics) must SUM their value, not just tag on a ×2 next to the original
// per-copy number — two copies of "All Resistances Down" (−80 each) really
// do mean −160.
{
  const allResistancesDown = { tier: 'flat', value: -80, template: '{v} all status resistances' };
  const r = computeBuildTotals([
    { name: 'All Resistances Down', mul: allResistancesDown },
    { name: 'All Resistances Down', mul: allResistancesDown },
  ]);
  test('exactly one merged flat entry', r.flat.length, 1);
  test('flat value sums across duplicates (-80 + -80 = -160)', r.flat[0].value, -160);
  test('flat entry carries a count of 2', r.flat[0].count, 2);
  test('regenerated desc uses the SUMMED value, not the original per-copy number',
    r.flat[0].desc, '−160 all status resistances');
}

// A single (non-duplicated) flat effect still regenerates correctly, and a
// positive-value flat effect (buildup infliction, no minus sign) formats
// without a spurious "+".
{
  const bloodLoss = { tier: 'flat', value: 44, template: 'Taking damage inflicts {v} blood loss buildup' };
  const r = computeBuildTotals([{ name: 'Taking Damage Causes Blood Loss Buildup', mul: bloodLoss }]);
  test('single flat effect keeps its original value', r.flat[0].value, 44);
  test('positive flat value has no leading +', r.flat[0].desc, 'Taking damage inflicts 44 blood loss buildup');
}

// Different-name flat effects must never merge with each other.
{
  const allResistancesDown = { tier: 'flat', value: -80, template: '{v} all status resistances' };
  const continuousHpLoss = { tier: 'flat', value: -2, template: '{v} HP/s' };
  const r = computeBuildTotals([
    { name: 'All Resistances Down', mul: allResistancesDown },
    { name: 'Continuous HP Loss', mul: continuousHpLoss },
  ]);
  test('two distinct flat effects stay as two separate entries', r.flat.length, 2);
}

// User-requested: two DIFFERENTLY-NAMED effects that touch the same base
// stat (Vigor +1 relic effect, and the curse "Reduced Vigor and Arcane")
// must combine into ONE pool total, not sit as two separate unrelated rows.
{
  const vigorUp1 = { tier: 'flat', pools: [{ pool: 'vigor', value: 20 }] };
  const reducedVigorArcane = { tier: 'flat', pools: [{ pool: 'vigor', value: -60 }, { pool: 'arcane', value: -3 }] };
  const r = computeBuildTotals([
    { name: 'Vigor +1', mul: vigorUp1 },
    { name: 'Reduced Vigor and Arcane', mul: reducedVigorArcane },
  ]);
  const vigorRow = r.flat.find(f => f.pool === 'vigor');
  const arcaneRow = r.flat.find(f => f.pool === 'arcane');
  test('exactly one vigor-pool row (merged across 2 differently-named sources)', r.flat.filter(f => f.pool === 'vigor').length, 1);
  test('vigor pool sums +20 and -60 to -40', vigorRow.desc, '−40 Max HP');
  test('arcane pool only touched by the curse, stays -3', arcaneRow.desc, '−3 Arcane');
}

// A pool total that ends up positive shows an explicit "+" (unlike
// name-grouped flat entries, whose sign is baked into their own template).
{
  const vigorUp1 = { tier: 'flat', pools: [{ pool: 'vigor', value: 20 }] };
  const vigorUp2 = { tier: 'flat', pools: [{ pool: 'vigor', value: 40 }] };
  const r = computeBuildTotals([
    { name: 'Vigor +1', mul: vigorUp1 },
    { name: 'Vigor +2', mul: vigorUp2 },
  ]);
  const vigorRow = r.flat.find(f => f.pool === 'vigor');
  test('two vigor sources merge into one row with count 2', vigorRow.count, 2);
  test('positive pool total shows an explicit +', vigorRow.desc, '+60 Max HP');
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
