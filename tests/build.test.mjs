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

function computeBuildTotals(effects, enabledSpecialNames) {
  enabledSpecialNames = enabledSpecialNames || new Set();
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
  // Baseline entries grouped by name too, purely so the summary can show
  // WHICH selected effects fed a given baseline number (e.g. "Fire: ×1.12 ×
  // ×1.1" from two different relics) instead of one already-flattened
  // product with no memory of its sources. damageBaseline/negationBaseline/
  // categoryBaseline/resourceBaseline above are untouched — they remain the
  // single source of truth for every combined figure.
  const baselineByName = new Map();

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
      // Tiers of the same conditional FAMILY (e.g. Throwing Pot / ... +1, or
      // Guard Counters +0/+1/+2) share a condition + axes signature and stack
      // multiplicatively — merge into one family entry (keyed by
      // bucket|group-or-category|axes|condition), accumulating each distinct
      // tier's value in `tiers`. Situational `special` effects stay keyed by
      // name (they surface as individual player-toggled checkboxes).
      const famKey = m.special
        ? `special:${effect.name}`
        : `fam:${m.bucket}|${m.category || m.group}|${[...(m.axes || [])].sort().join(',')}|${m.condition}`;
      const existing = conditionalByName.get(famKey);
      if (existing) {
        existing.count++;
        const tier = existing.tiers.find(t => t.value === m.value);
        if (tier) tier.count++;
        else existing.tiers.push({ value: m.value, count: 1, name: effect.name });
      } else {
        const displayName = m.special ? effect.name : effect.name.replace(/ \+\d+$/, '');
        conditionalByName.set(famKey, { name: displayName, ...m, count: 1, tiers: [{ value: m.value, count: 1, name: effect.name }] });
      }
      continue;
    }
    const existingB = baselineByName.get(effect.name);
    if (existingB) existingB.count++;
    else baselineByName.set(effect.name, { name: effect.name, ...m, count: 1 });
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
    // A family's own contribution is ∏ vᶜ over its tiers (negation combines as
    // a (1 − v) "remaining damage" factor per tier instead).
    const selfDamage = () => c.tiers.reduce((p, t) => p * Math.pow(t.value, t.count), 1);
    const selfNegation = () => c.tiers.reduce((p, t) => p * Math.pow(1 - t.value, t.count), 1);
    const factors = [];
    if (c.bucket === 'resource') {
      if (resourceBaseline[c.stat] !== 1) factors.push({ kind: 'resource', key: c.stat, value: resourceBaseline[c.stat] });
      factors.push({ kind: 'self', value: selfDamage() });
    } else if (c.bucket === 'negation') {
      if (negationBaseline.universal !== 1) factors.push({ kind: 'axis', key: 'universal', value: negationBaseline.universal });
      for (const axis of c.axes) if (axis !== 'universal' && negationBaseline[axis] !== 1) factors.push({ kind: 'axis', key: axis, value: negationBaseline[axis] });
      factors.push({ kind: 'self', value: selfNegation() });
    } else {
      if (damageBaseline.universal !== 1) factors.push({ kind: 'axis', key: 'universal', value: damageBaseline.universal });
      for (const axis of c.axes) if (axis !== 'universal' && damageBaseline[axis] !== 1) factors.push({ kind: 'axis', key: axis, value: damageBaseline[axis] });
      if (c.category && categoryBaseline[c.category] !== 1) factors.push({ kind: 'category', key: c.category, value: categoryBaseline[c.category] });
      factors.push({ kind: 'self', value: selfDamage() });
    }
    const combined = factors.reduce((p, f) => p * f.value, 1);
    // `self` is the family's own contribution alone (∏ over tiers), no baseline
    // folded in — lets a multi-axis conditional recompute a per-element total
    // without a baseline being counted once per axis.
    const self = c.bucket === 'negation' ? selfNegation() : selfDamage();
    return { combined, factors, self };
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

  // A conditional entry explicitly marked `special: true` in
  // effect_multipliers.mjs is a genuinely SITUATIONAL/temporal trigger —
  // vs-a-status-afflicted enemy, 3+ weapon type equipped, a grease-item
  // window, etc. — that may or may not be active at any given moment,
  // unlike a spell-school, single-weapon-hit, or hit-type conditional
  // (crit, guard counter — which just means "while doing X", the exact
  // scenario its own total already represents). These are exactly the
  // candidates for the player-toggled "specials" checkboxes: excluded from
  // every Totals figure unless explicitly enabled, so the player can explore
  // a maximum-multiplier scenario without every proc being silently assumed
  // to always be active. A special isn't necessarily universal-axis (grease
  // items is physical-only) — each only ever applies to ITS OWN axis (or
  // every axis, if truly universal), never to an unrelated one, so
  // specialsMultiplierFor() takes the axis being computed and only counts a
  // toggled special if it's universal or a match.
  const damageSpecials = [conditionalTree.damage.weapon, conditionalTree.damage.hitType, conditionalTree.damage.status]
    .flat().filter(c => c.special);
  const negationSpecials = conditionalTree.negation.status.filter(c => c.special);

  function specialsMultiplierFor(list, isNegation, axis) {
    return list.reduce((p, c) => {
      if (!enabledSpecialNames.has(c.name)) return p;
      const cAxis = c.axes[0];
      if (cAxis !== 'universal' && cAxis !== axis) return p;
      return p * Math.pow(isNegation ? (1 - c.value) : c.value, c.count);
    }, 1);
  }
  const damageUniversalSpecialsMultiplier = specialsMultiplierFor(damageSpecials, false, 'universal');
  const negationUniversalSpecialsMultiplier = specialsMultiplierFor(negationSpecials, true, 'universal');

  // Totals: the REAL grand-total multiplier per axis/category — baseline
  // axis/category value × the baseline All-Damage sources (Evergaol/Night
  // Invader kills, always active once triggered) × only the situational
  // specials currently toggled on THAT APPLY TO THIS AXIS (universal
  // specials apply everywhere; an axis-specific special like grease items
  // only applies to its own axis). damageBaseline[axis] never includes
  // damageBaseline.universal (they're independent accumulator slots), so
  // it's folded in here explicitly.
  const damageTotals = {};
  for (const axis of AXES) {
    const specialsMul = specialsMultiplierFor(damageSpecials, false, axis);
    damageTotals[axis] = axis === 'universal'
      ? damageBaseline.universal * specialsMul
      : damageBaseline[axis] * damageBaseline.universal * specialsMul;
  }
  const negationTotals = {};
  for (const axis of AXES) {
    const specialsMul = specialsMultiplierFor(negationSpecials, true, axis);
    negationTotals[axis] = axis === 'universal'
      ? negationBaseline.universal * specialsMul
      : negationBaseline[axis] * negationBaseline.universal * specialsMul;
  }
  // Category totals aren't bound to one axis (Sorcery can be cast in any
  // element), so only universal specials apply here — an axis-specific one
  // belongs on that axis's own total, not the generic category one.
  const categoryTotals = {
    sorcery: categoryBaseline.sorcery * damageBaseline.universal * damageUniversalSpecialsMultiplier,
    incantation: categoryBaseline.incantation * damageBaseline.universal * damageUniversalSpecialsMultiplier,
  };

  // Every non-special conditional entry (spell school, single-weapon hit,
  // hit-type bonus) gets its own Totals figure too: its `combined` (which
  // already folds in its own axis/category baseline plus the universal
  // BASELINE) times whichever specials matching ITS OWN axis are toggled on.
  // A MULTI-axis entry (e.g. Improved Throwing Pot Damage, matching Affinity's
  // magic+fire+lightning+holy signature) is the exception: one hit deals ONE
  // element, so instead of one figure multiplying every element baseline
  // together (which overcounts), it carries a `perAxisTotal` map — element
  // baseline × universal × its own `self` × that axis's specials, per element.
  // Specials get no `total` of their own — checkbox-only.
  const damageSpecialsSet = new Set(damageSpecials);
  for (const group of ['sorcery', 'incantation', 'weapon', 'hitType', 'status']) {
    conditionalTree.damage[group] = conditionalTree.damage[group].map(c => {
      if (damageSpecialsSet.has(c)) return { ...c, total: undefined };
      if (c.axes && c.axes.length > 1) {
        const perAxisTotal = {};
        for (const axis of c.axes) {
          perAxisTotal[axis] = damageBaseline[axis] * damageBaseline.universal * c.self
            * specialsMultiplierFor(damageSpecials, false, axis);
        }
        return { ...c, perAxisTotal, total: undefined };
      }
      return { ...c, total: c.combined * specialsMultiplierFor(damageSpecials, false, c.axes[0]) };
    });
  }
  const negationSpecialsSet = new Set(negationSpecials);
  conditionalTree.negation.status = conditionalTree.negation.status.map(c => ({
    ...c, total: negationSpecialsSet.has(c) ? undefined
      : c.combined * specialsMultiplierFor(negationSpecials, true, c.axes.length === 1 ? c.axes[0] : 'universal'),
  }));

  // Breakdown/inventory views: which selected effects fed each axis,
  // category, or resource stat, so the summary can show "Fire: ×1.12 × ×1.1"
  // (the individual contributing values) instead of one already-flattened
  // number. Multi-axis baseline sources (Improved Affinity Attack Power,
  // which touches magic+fire+lightning+holy at once) are pulled OUT of each
  // individual axis's list — grouped by their own axes signature instead —
  // so a shared source doesn't silently vanish into 4 different rows with no
  // trace it was ever one selection.
  function baselineRows(filterFn) {
    return [...baselineByName.values()].filter(filterFn)
      .map(b => ({ name: b.name, value: b.value, count: b.count }));
  }
  const damageAxisBreakdown = {}, negationAxisBreakdown = {};
  for (const axis of AXES) {
    damageAxisBreakdown[axis] = baselineRows(b => b.bucket === 'damage' && b.axes && b.axes.length === 1 && b.axes[0] === axis);
    negationAxisBreakdown[axis] = baselineRows(b => b.bucket === 'negation' && b.axes && b.axes.length === 1 && b.axes[0] === axis);
  }
  const categoryBaselineBreakdown = {
    sorcery: baselineRows(b => b.category === 'sorcery'),
    incantation: baselineRows(b => b.category === 'incantation'),
  };
  const resourceBreakdown = {};
  for (const stat of RESOURCE_STATS) {
    resourceBreakdown[stat] = baselineRows(b => b.bucket === 'resource' && b.stat === stat);
  }
  // Physical and Affinity (magic+fire+lightning+holy) are the two
  // fundamental damage types — Affinity always gets a group entry here,
  // even with zero contributing effects (combined 1), so the Totals section
  // can always show it as a reference point next to Physical, the same way
  // "All Damage" always shows regardless of whether anything actually
  // populates it. Both damage AND negation have a real "Improved Affinity
  // ..." baseline effect, so this applies to both.
  const AFFINITY_AXES = ['fire', 'holy', 'lightning', 'magic'];
  const AFFINITY_AXES_KEY = AFFINITY_AXES.join(',');
  function buildMultiAxisGroups(bucket, universalBaseline, specialsMul) {
    const seen = new Map();
    for (const b of baselineByName.values()) {
      if (b.bucket !== bucket || !b.axes || b.axes.length <= 1) continue;
      const key = [...b.axes].sort().join(',');
      if (!seen.has(key)) seen.set(key, { axes: b.axes, rows: [] });
      seen.get(key).rows.push({ name: b.name, value: b.value, count: b.count });
    }
    if (!seen.has(AFFINITY_AXES_KEY)) seen.set(AFFINITY_AXES_KEY, { axes: AFFINITY_AXES, rows: [] });
    // Negation combines via ∏(1 − v) (a "remaining damage" factor), same as
    // negationBaseline elsewhere — damage combines via a straight ∏v.
    const isNegation = bucket === 'negation';
    return [...seen.values()].map(g => {
      const combined = g.rows.reduce((p, r) => p * Math.pow(isNegation ? (1 - r.value) : r.value, r.count), 1);
      return { axes: g.axes, rows: g.rows, combined, total: combined * universalBaseline * specialsMul };
    });
  }
  // Affinity's own total is a cross-element figure (not bound to one axis),
  // so — like categoryTotals — only universal specials apply.
  const damageMultiAxisGroups = buildMultiAxisGroups('damage', damageBaseline.universal, damageUniversalSpecialsMultiplier);
  const negationMultiAxisGroups = buildMultiAxisGroups('negation', negationBaseline.universal, negationUniversalSpecialsMultiplier);

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
    conditionalTree,
    damageAxisBreakdown, negationAxisBreakdown, categoryBaselineBreakdown, resourceBreakdown,
    damageMultiAxisGroups, negationMultiAxisGroups,
    damageSpecials, negationSpecials,
    damageTotals, negationTotals, categoryTotals,
    flat,
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
  const evasionCurse = { tier: 'conditional', special: true, bucket: 'negation', axes: ['universal'], group: 'status', value: -0.45, condition: 'Right after evading' };
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

// User-reported gap: "3+ weapon type equipped" only actually applies with
// 3+ of that type in your loadout — it is NOT an always-on baseline, so it
// must show up as its own conditional entry with that condition text
// visible (same as the single-weapon variant), not silently folded into an
// unlabeled "Universal" baseline number with no indication of where it
// came from. It still applies to all damage types by definition, so it
// still folds into every active axis/other conditional via the same
// universal-only nesting machinery as any other universal-axis conditional
// (e.g. the frostbite curse) — it just does so as a conditional now.
{
  const physicalUp1 = { tier: 'baseline', bucket: 'damage', axes: ['physical'], value: 1.05 };
  const katana3plus = { tier: 'conditional', special: true, bucket: 'damage', axes: ['universal'], group: 'weapon', value: 1.2, condition: '3+ Katana Equipped' };
  const katanaSingle = { tier: 'conditional', bucket: 'damage', axes: ['physical'], group: 'weapon', value: 1.09, condition: 'Katana hits only' };
  const effects = [
    { name: 'Physical Attack Up +1', mul: physicalUp1 },
    { name: 'Improved Attack Power with 3+ Katana Equipped', mul: katana3plus },
    { name: 'Improved Katana Attack Power', mul: katanaSingle },
  ];
  const rOff = computeBuildTotals(effects);
  test('no more always-on universal baseline from this effect', rOff.damageBaseline.universal, 1);
  const weaponRowsOff = rOff.conditionalTree.damage.weapon;
  const katana3RowOff = weaponRowsOff.find(c => c.name === 'Improved Attack Power with 3+ Katana Equipped');
  const katanaSingleRowOff = weaponRowsOff.find(c => c.name === 'Improved Katana Attack Power');
  test('3+ Katana bonus nests under damage.weapon as a conditional', !!katana3RowOff, true);
  test('3+ Katana condition text is preserved for display', katana3RowOff.condition, '3+ Katana Equipped');
  test('3+ Katana combined is its own self value (no other universal baseline active)', katana3RowOff.combined, 1.2);
  test('a universal-only special gets no `total` of its own', katana3RowOff.total, undefined);
  // Toggled OFF by default — a situational special like "3+ Katana Equipped"
  // must NOT silently apply to Totals just because it's selected.
  test('Physical total ignores the special while toggled off', rOff.damageTotals.physical, 1.05);
  test('single-weapon Katana total ignores the special while toggled off', katanaSingleRowOff.total, 1.05 * 1.09);

  const rOn = computeBuildTotals(effects, new Set(['Improved Attack Power with 3+ Katana Equipped']));
  const katanaSingleRowOn = rOn.conditionalTree.damage.weapon.find(c => c.name === 'Improved Katana Attack Power');
  test('toggling the special ON folds it into the Physical total', rOn.damageTotals.physical, 1.05 * 1.2);
  test('toggling it ON also folds it into the single-weapon Katana total', katanaSingleRowOn.total, (1.05 * 1.09) * 1.2);
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

// A universal-axis curse (Lower Attack When Below Max HP) is a "special":
// excluded from Totals by default (its situational-ness is exactly why it
// needs the toggle), but once toggled on it applies to EVERY active
// elemental baseline ("what's my Physical damage while also below 85%
// HP") since it applies regardless of damage type. Magic stays untouched
// here either way, since there's no magic baseline active.
{
  const physicalUp4 = { tier: 'baseline', bucket: 'damage', axes: ['physical'], value: 1.12 };
  const hpCurse = { tier: 'conditional', special: true, bucket: 'damage', axes: ['universal'], group: 'status', value: 0.915, condition: 'While HP is below 85%' };
  const effects = [
    { name: 'Physical Attack Up +4', mul: physicalUp4 },
    { name: 'Lower Attack When Below Max HP', mul: hpCurse },
  ];
  const rOff = computeBuildTotals(effects);
  test('physical baseline is 1.12', rOff.damageBaseline.physical, 1.12);
  test('magic baseline stays untouched', rOff.damageBaseline.magic, 1);
  test('curse nests under damage.status on its own', rOff.conditionalTree.damage.status.length, 1);
  test('curse toggled off: physical total is just the baseline', rOff.damageTotals.physical, 1.12);
  test('curse toggled off: magic total stays untouched', rOff.damageTotals.magic, 1);

  const rOn = computeBuildTotals(effects, new Set(['Lower Attack When Below Max HP']));
  test('curse toggled on: physical total = physical baseline × curse value', rOn.damageTotals.physical, 1.12 * 0.915);
  // Universal specials apply to EVERY damage type by definition, even Magic
  // (which has no baseline of its own here) — its real total becomes just
  // the curse's own value, not left at 1.
  test('curse toggled on: magic total also reflects it (universal applies broadly)', rOn.damageTotals.magic, 0.915);
}

// The same curse should ALSO fold into a specific entry's Totals figure like
// Carian Sword Sorcery, not just the base axis rows — since it applies on
// top of any hit, including a Carian Sword spell cast while below 85% HP.
{
  const magicUp = { tier: 'baseline', bucket: 'damage', axes: ['magic'], value: 1.12 };
  const carianSword = { tier: 'conditional', bucket: 'damage', axes: ['magic'], category: 'sorcery', value: 1.12, condition: 'Casting Carian Sword sorceries only' };
  const hpCurse = { tier: 'conditional', special: true, bucket: 'damage', axes: ['universal'], group: 'status', value: 0.915, condition: 'While HP is below 85%' };
  const effects = [
    { name: 'Magic Attack Power Up +4', mul: magicUp },
    { name: 'Improved Carian Sword Sorcery', mul: carianSword },
    { name: 'Lower Attack When Below Max HP', mul: hpCurse },
  ];
  const rOff = computeBuildTotals(effects);
  const carianRowOff = rOff.conditionalTree.damage.sorcery.find(c => c.name === 'Improved Carian Sword Sorcery');
  const curseRowOff = rOff.conditionalTree.damage.status.find(c => c.name === 'Lower Attack When Below Max HP');
  test('curse toggled off: Carian total is just its own combined figure', carianRowOff.total, carianRowOff.combined);
  test('a universal-only special (the curse) gets no total of its own', curseRowOff.total, undefined);

  const rOn = computeBuildTotals(effects, new Set(['Lower Attack When Below Max HP']));
  const carianRowOn = rOn.conditionalTree.damage.sorcery.find(c => c.name === 'Improved Carian Sword Sorcery');
  test('curse toggled on: Carian total = Carian combined × curse value', carianRowOn.total, carianRowOn.combined * 0.915);
}

// Structural regression guard for the double-counting bug fixed in Task 29
// (attachUniversalNesting computing entry.combined × u.combined, squaring a
// shared active universal BASELINE instead of applying it once): the new
// specialsMultiplier() computes purely from each special's raw `value`/
// `count`, never from another entry's `.combined` — so double-counting a
// shared baseline factor is structurally impossible, unlike the old nesting
// code this replaced. Uses a synthetic baseline-tier universal effect since
// no current real effect sets one (every real universal-axis effect is
// conditional — see the 3+-weapon-equipped test above).
{
  const fireUp = { tier: 'baseline', bucket: 'damage', axes: ['fire'], value: 1.12 };
  const universalBaseline = { tier: 'baseline', bucket: 'damage', axes: ['universal'], value: 1.2 };
  const giantsFlame = { tier: 'conditional', bucket: 'damage', axes: ['fire'], category: 'incantation', value: 1.12, condition: "Casting Giants' Flame incantations only" };
  const frostbite = { tier: 'conditional', special: true, bucket: 'damage', axes: ['universal'], group: 'status', value: 1.1, condition: 'vs frostbite-afflicted enemies' };
  const effects = [
    { name: 'Fire Attack Power Up +4', mul: fireUp },
    { name: 'Hypothetical Universal Baseline Buff', mul: universalBaseline },
    { name: "Improved Giants' Flame Incantations", mul: giantsFlame },
    { name: 'Attack power up when facing frostbite-afflicted enemy', mul: frostbite },
  ];
  const r = computeBuildTotals(effects, new Set(['Attack power up when facing frostbite-afflicted enemy']));
  const giantsFlameRow = r.conditionalTree.damage.incantation.find(c => c.name === "Improved Giants' Flame Incantations");
  const trueValue = 1.12 /* fire baseline */ * 1.2 /* universal baseline, already in .combined */ * 1.12 /* Giants' Flame, already in .combined */ * 1.1 /* frostbite, toggled on */;
  test('total matches the true from-scratch value (no double-counted universal)', giantsFlameRow.total, trueValue);
  test('total is NOT the buggy double-counted value',
    Math.abs(giantsFlameRow.total - giantsFlameRow.combined * (1.2 * 1.1)) > 1e-9, true);
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

// User-requested: Evergaol/Night Invader kill-count bonuses (1.05x per
// Evergaol, 1.07x per Night Invader) scale with a real run count the player
// states directly, not with relic/slot duplication — the UI feeds the SAME
// baseline effect into computeBuildTotals `count` times (once per kill), so
// no engine changes were needed here: a baseline entry already multiplies
// its value in once per occurrence in the effects array, same as any other
// duplicate baseline effect.
{
  const evergaol = { tier: 'baseline', bucket: 'damage', axes: ['universal'], value: 1.05, variableCount: true, maxCount: 7 };
  const fireUp = { tier: 'baseline', bucket: 'damage', axes: ['fire'], value: 1.12 };
  const r = computeBuildTotals([
    { name: 'Attack power increased for each evergaol prisoner defeated', mul: evergaol },
    { name: 'Attack power increased for each evergaol prisoner defeated', mul: evergaol },
    { name: 'Attack power increased for each evergaol prisoner defeated', mul: evergaol },
    { name: 'Fire Attack Power Up +4', mul: fireUp },
  ]);
  test('3 evergaol kills compound to 1.05^3', r.damageBaseline.universal, Math.pow(1.05, 3));
  test('fire baseline stays independent of the universal baseline', r.damageBaseline.fire, 1.12);
  test('real fire total reads as fire baseline * universal baseline', r.damageBaseline.fire * r.damageBaseline.universal, 1.12 * Math.pow(1.05, 3));
}

{
  const nightInvader = { tier: 'baseline', bucket: 'damage', axes: ['universal'], value: 1.07, variableCount: true, maxCount: 4 };
  const r0 = computeBuildTotals([]);
  const r4 = computeBuildTotals(Array.from({ length: 4 }, () =>
    ({ name: 'Attack power increased for each Night Invader defeated', mul: nightInvader })));
  test('0 kills leaves the universal baseline untouched', r0.damageBaseline.universal, 1);
  test('4 Night Invader kills (the real in-game max) compound to 1.07^4', r4.damageBaseline.universal, Math.pow(1.07, 4));
}

// User-requested redesign: the summary should show WHICH selected effects
// fed each axis (e.g. "Fire: ×1.12 × ×1.1" from two different relics), not
// just the pre-flattened product — damageAxisBreakdown carries that list.
{
  const fireUp2 = { tier: 'baseline', bucket: 'damage', axes: ['fire'], value: 1.065 };
  const fireUp4 = { tier: 'baseline', bucket: 'damage', axes: ['fire'], value: 1.12 };
  const r = computeBuildTotals([
    { name: 'Fire Attack Power Up +2', mul: fireUp2 },
    { name: 'Fire Attack Power Up +4', mul: fireUp4 },
  ]);
  test('fire breakdown has 2 distinct contributors', r.damageAxisBreakdown.fire.length, 2);
  test('fire breakdown includes both sources by name',
    r.damageAxisBreakdown.fire.map(c => c.name).sort().join(','),
    ['Fire Attack Power Up +2', 'Fire Attack Power Up +4'].sort().join(','));
  test('magic breakdown is empty (untouched)', r.damageAxisBreakdown.magic.length, 0);
  test('fire baseline still reflects both (unchanged accumulator)', r.damageBaseline.fire, 1.065 * 1.12);
}

// The same effect selected twice (e.g. 2 relics both with the same tier)
// collapses into ONE breakdown entry with count=2, not 2 separate rows.
{
  const fireUp2 = { tier: 'baseline', bucket: 'damage', axes: ['fire'], value: 1.065 };
  const r = computeBuildTotals([
    { name: 'Fire Attack Power Up +2', mul: fireUp2 },
    { name: 'Fire Attack Power Up +2', mul: fireUp2 },
  ]);
  test('duplicate baseline source collapses to 1 breakdown entry', r.damageAxisBreakdown.fire.length, 1);
  test('duplicate breakdown entry carries count=2', r.damageAxisBreakdown.fire[0].count, 2);
}

// Multi-axis baseline sources (Improved Affinity Attack Power, which touches
// magic+fire+lightning+holy at once) must NOT silently vanish into 4
// separate per-axis rows with no trace of a shared source — they get pulled
// into their own damageMultiAxisGroups entry instead, and each per-axis
// breakdown list stays axis-SPECIFIC only.
{
  const affinity1 = { tier: 'baseline', bucket: 'damage', axes: ['magic', 'fire', 'lightning', 'holy'], value: 1.05 };
  const fireUp2 = { tier: 'baseline', bucket: 'damage', axes: ['fire'], value: 1.065 };
  const r = computeBuildTotals([
    { name: 'Improved Affinity Attack Power', mul: affinity1 },
    { name: 'Fire Attack Power Up +2', mul: fireUp2 },
  ]);
  test('fire breakdown excludes the multi-axis Affinity source', r.damageAxisBreakdown.fire.length, 1);
  test('fire breakdown only has the fire-specific source', r.damageAxisBreakdown.fire[0].name, 'Fire Attack Power Up +2');
  test('exactly 1 multi-axis group (Affinity)', r.damageMultiAxisGroups.length, 1);
  test('the multi-axis group touches magic/fire/lightning/holy', [...r.damageMultiAxisGroups[0].axes].sort().join(','),
    ['magic', 'fire', 'lightning', 'holy'].sort().join(','));
  test('the multi-axis group has its own combined value', r.damageMultiAxisGroups[0].combined, 1.05);
  // damageBaseline.fire (the unchanged accumulator, used for Totals) still
  // includes BOTH sources multiplied together — only the breakdown DISPLAY
  // splits them apart.
  test('damageBaseline.fire (Totals source) still includes affinity + fire-specific', r.damageBaseline.fire, 1.05 * 1.065);
  test('real fire total = fire-specific × affinity (both folded into damageTotals.fire)',
    r.damageTotals.fire, 1.05 * 1.065);
  test('the multi-axis group itself carries a `total` (its own combined, no universal baseline active here)',
    r.damageMultiAxisGroups[0].total, 1.05);
}

// Universal-axis BASELINE sources (Evergaol/Night Invader kills) must show
// up as their OWN separately-named rows in the breakdown, not blended into
// one generic "All Damage" line — damageAxisBreakdown.universal is exactly
// baselineByName grouped by name, so each real source keeps its identity.
{
  const evergaol = { tier: 'baseline', bucket: 'damage', axes: ['universal'], value: 1.05, variableCount: true, maxCount: 7 };
  const nightInvader = { tier: 'baseline', bucket: 'damage', axes: ['universal'], value: 1.07, variableCount: true, maxCount: 4 };
  const r = computeBuildTotals([
    { name: 'Attack power increased for each evergaol prisoner defeated', mul: evergaol },
    { name: 'Attack power increased for each evergaol prisoner defeated', mul: evergaol },
    { name: 'Attack power increased for each Night Invader defeated', mul: nightInvader },
  ]);
  test('universal breakdown has 2 distinct named sources', r.damageAxisBreakdown.universal.length, 2);
  const evergaolRow = r.damageAxisBreakdown.universal.find(c => c.name === 'Attack power increased for each evergaol prisoner defeated');
  const invaderRow = r.damageAxisBreakdown.universal.find(c => c.name === 'Attack power increased for each Night Invader defeated');
  test('evergaol row carries count=2 (2 kills)', evergaolRow.count, 2);
  test('night invader row carries count=1 (1 kill)', invaderRow.count, 1);
  test('all_dmg total = evergaol^2 × nightInvader^1', r.damageTotals.universal, Math.pow(1.05, 2) * Math.pow(1.07, 1));
}

// Category baseline breakdown (Sorcery/Incantation general boosts) follows
// the same per-name grouping.
{
  const sorc1 = { tier: 'baseline', bucket: 'damage', category: 'sorcery', value: 1.05 };
  const r = computeBuildTotals([{ name: 'Improved Sorceries', mul: sorc1 }]);
  test('sorcery category breakdown has 1 contributor', r.categoryBaselineBreakdown.sorcery.length, 1);
  test('sorcery category breakdown names the source', r.categoryBaselineBreakdown.sorcery[0].name, 'Improved Sorceries');
  test('incantation category breakdown stays empty', r.categoryBaselineBreakdown.incantation.length, 0);
}

// User-requested: Physical and Affinity are "the two fundamental damage
// types" and should always have a Totals reference row, even with nothing
// selected — mirroring how "All Damage" always shows. Affinity therefore
// always gets a multi-axis group entry (combined=1, empty rows) even when
// no Affinity-type effect is selected at all.
{
  const r = computeBuildTotals([]);
  test('damageMultiAxisGroups always includes an Affinity entry, even empty', r.damageMultiAxisGroups.length, 1);
  test('the empty Affinity entry has no contributing rows', r.damageMultiAxisGroups[0].rows.length, 0);
  test('the empty Affinity entry has combined=1', r.damageMultiAxisGroups[0].combined, 1);
  test('the empty Affinity entry totals to 1 (nothing else active)', r.damageMultiAxisGroups[0].total, 1);
  test('negationMultiAxisGroups also always includes an Affinity entry', r.negationMultiAxisGroups.length, 1);
  test('negation Affinity entry totals to 1 too', r.negationMultiAxisGroups[0].total, 1);
}

// Negation has a real "Improved Affinity Damage Negation" baseline effect
// (axes: magic+fire+lightning+holy, like its Attack Power counterpart) —
// it must populate negationMultiAxisGroups the same way, not just damage's.
{
  const affinityNeg = { tier: 'baseline', bucket: 'negation', axes: ['magic', 'fire', 'lightning', 'holy'], value: 0.06 };
  const r = computeBuildTotals([{ name: 'Improved Affinity Damage Negation', mul: affinityNeg }]);
  test('negation Affinity group has 1 contributing row', r.negationMultiAxisGroups[0].rows.length, 1);
  test('negation Affinity group names the source', r.negationMultiAxisGroups[0].rows[0].name, 'Improved Affinity Damage Negation');
  // Negation combines via (1 − v), same as any other negation baseline.
  test('negation Affinity combined = (1 - 0.06)', r.negationMultiAxisGroups[0].combined, 0.94);
}

// User-requested: a special isn't necessarily universal-axis — "Physical
// attack power increases after using grease items" is physical-only but
// still genuinely situational (a 30s buff window), so it needs the same
// toggle as frostbite/poison, but its effect must stay scoped to Physical
// only — it must NOT leak into Affinity or an unrelated element's total.
{
  const physicalUp = { tier: 'baseline', bucket: 'damage', axes: ['physical'], value: 1.05 };
  const affinityUp = { tier: 'baseline', bucket: 'damage', axes: ['magic', 'fire', 'lightning', 'holy'], value: 1.1 };
  const greaseItems = { tier: 'conditional', special: true, bucket: 'damage', axes: ['physical'], group: 'status', value: 1.1, condition: '30s after using grease items' };
  const effects = [
    { name: 'Physical Attack Up +1', mul: physicalUp },
    { name: 'Improved Affinity Attack Power +2', mul: affinityUp },
    { name: 'Physical attack power increases after using grease items', mul: greaseItems },
  ];
  const rOff = computeBuildTotals(effects);
  test('grease items toggled off: physical total is just the baseline', rOff.damageTotals.physical, 1.05);
  test('grease items toggled off: affinity group total untouched', rOff.damageMultiAxisGroups[0].total, 1.1);

  const rOn = computeBuildTotals(effects, new Set(['Physical attack power increases after using grease items']));
  test('grease items toggled on: physical total = physical baseline × grease value', rOn.damageTotals.physical, 1.05 * 1.1);
  test('grease items toggled on: affinity total stays UNTOUCHED (axis-specific special must not leak)', rOn.damageMultiAxisGroups[0].total, 1.1);
  test('grease items toggled on: magic total (an Affinity element) also stays untouched', rOn.damageTotals.magic, 1.1);
}

// Improved Throwing Pot Damage deals Affinity damage — a MULTI-axis
// conditional matching Affinity's signature. A single thrown pot deals ONE
// element, so it carries a PER-ELEMENT total (not one figure multiplying every
// element baseline together, which would overcount). With only a Fire baseline
// active, the Fire pot picks up that bonus; magic/lightning/holy pots don't.
{
  const fireUp = { tier: 'baseline', bucket: 'damage', axes: ['fire'], value: 1.12 };
  const throwingPot = { tier: 'conditional', bucket: 'damage', axes: ['magic', 'fire', 'lightning', 'holy'], group: 'weapon', value: 1.15, condition: 'Throwing Pot throws only' };
  const r = computeBuildTotals([
    { name: 'Fire Attack Power Up +4', mul: fireUp },
    { name: 'Improved Throwing Pot Damage', mul: throwingPot },
  ]);
  const potRow = r.conditionalTree.damage.weapon.find(c => c.name === 'Improved Throwing Pot Damage');
  test('multi-axis conditional carries no single total', potRow.total, undefined);
  test('fire pot picks up the Fire-specific bonus', potRow.perAxisTotal.fire, 1.12 * 1.15);
  test('magic pot gets only its own self (no fire leak)', potRow.perAxisTotal.magic, 1.15);
  test('lightning pot gets only its own self', potRow.perAxisTotal.lightning, 1.15);
  test('throwing pot is NOT a special (no checkbox)', r.damageSpecials.includes(potRow), false);
}

// Full regression for the user's reported build: Fire +4/+3, Improved Affinity
// +1, one base Throwing Pot + three "+1". The tiers collapse to ONE family
// entry (self = 1.15¹ × 1.3³), and its per-element totals must NOT multiply the
// four affinity baselines together. Fire pot = fire baseline × self; the other
// three elements only carry the shared Affinity 1.08.
{
  const fireUp4 = { tier: 'baseline', bucket: 'damage', axes: ['fire'], value: 1.12 };
  const fireUp3 = { tier: 'baseline', bucket: 'damage', axes: ['fire'], value: 1.105 };
  const affinity = { tier: 'baseline', bucket: 'damage', axes: ['magic', 'fire', 'lightning', 'holy'], value: 1.08 };
  const potBase = { tier: 'conditional', bucket: 'damage', axes: ['magic', 'fire', 'lightning', 'holy'], group: 'weapon', value: 1.15, condition: 'Throwing Pot throws only' };
  const potPlus1 = { tier: 'conditional', bucket: 'damage', axes: ['magic', 'fire', 'lightning', 'holy'], group: 'weapon', value: 1.3, condition: 'Throwing Pot throws only' };
  const r = computeBuildTotals([
    { name: 'Fire Attack Power Up +4', mul: fireUp4 },
    { name: 'Fire Attack Power Up +3', mul: fireUp3 },
    { name: 'Improved Affinity Attack Power +1', mul: affinity },
    { name: 'Improved Throwing Pot Damage', mul: potBase },
    { name: 'Improved Throwing Pot Damage +1', mul: potPlus1 },
    { name: 'Improved Throwing Pot Damage +1', mul: potPlus1 },
    { name: 'Improved Throwing Pot Damage +1', mul: potPlus1 },
  ]);
  const potRows = r.conditionalTree.damage.weapon.filter(c => c.condition === 'Throwing Pot throws only');
  test('throwing pot tiers collapse to a single family row', potRows.length, 1);
  const potRow = potRows[0];
  test('family row uses the base name (no "+N" suffix)', potRow.name, 'Improved Throwing Pot Damage');
  test('family count reflects all contributing relics', potRow.count, 4);
  const self = 1.15 * Math.pow(1.3, 3);
  test('fire pot = fire baseline × self (no other elements folded in)', potRow.perAxisTotal.fire, (1.12 * 1.105 * 1.08) * self);
  test('magic pot = shared Affinity baseline × self', potRow.perAxisTotal.magic, 1.08 * self);
  test('holy pot = shared Affinity baseline × self', potRow.perAxisTotal.holy, 1.08 * self);
  // Guard against the old overcounting bug: the per-element total must be far
  // below the all-four-axes product (≈ ×4.25 for this build).
  test('fire pot total is NOT the overcounted all-axes product', potRow.perAxisTotal.fire < 1.08 * 1.08 * 1.08 * (1.12 * 1.105 * 1.08) * self, true);
  // The per-tier breakdown data survives the merge: each tier keeps its own
  // name, value and contributing count (so Section 1 can still list them
  // individually — base ×1.15 and "+1 ×3" ×1.3).
  test('family keeps two distinct tiers', potRow.tiers.length, 2);
  const baseTier = potRow.tiers.find(t => t.value === 1.15);
  const plus1Tier = potRow.tiers.find(t => t.value === 1.3);
  test('base tier keeps its name and count', baseTier.name + '|' + baseTier.count, 'Improved Throwing Pot Damage|1');
  test('+1 tier keeps its name and count', plus1Tier.name + '|' + plus1Tier.count, 'Improved Throwing Pot Damage +1|3');
}

// Guard Counters +0/+1/+2 — a physical-only tiered family — likewise merges
// into one row with the tiers multiplied.
{
  const gc0 = { tier: 'conditional', bucket: 'damage', axes: ['physical'], group: 'hitType', value: 1.17, condition: 'On guard counters' };
  const gc1 = { tier: 'conditional', bucket: 'damage', axes: ['physical'], group: 'hitType', value: 1.25, condition: 'On guard counters' };
  const gc2 = { tier: 'conditional', bucket: 'damage', axes: ['physical'], group: 'hitType', value: 1.29, condition: 'On guard counters' };
  const r = computeBuildTotals([
    { name: 'Improved Guard Counters', mul: gc0 },
    { name: 'Improved Guard Counters +1', mul: gc1 },
    { name: 'Improved Guard Counters +2', mul: gc2 },
  ]);
  const gcRows = r.conditionalTree.damage.hitType.filter(c => c.condition === 'On guard counters');
  test('guard counter tiers collapse to a single family row', gcRows.length, 1);
  test('guard counter family self = product of all three tiers', gcRows[0].combined, 1.17 * 1.25 * 1.29);
}

// Different families that merely share a bucket/group but have distinct
// conditions must NOT merge (two different weapon-hit bonuses stay separate).
{
  const katana = { tier: 'conditional', bucket: 'damage', axes: ['physical'], group: 'weapon', value: 1.09, condition: 'Katana hits only' };
  const dagger = { tier: 'conditional', bucket: 'damage', axes: ['physical'], group: 'weapon', value: 1.09, condition: 'Dagger hits only' };
  const r = computeBuildTotals([
    { name: 'Improved Katana Attack Power', mul: katana },
    { name: 'Improved Dagger Attack Power', mul: dagger },
  ]);
  test('distinct-condition families stay separate', r.conditionalTree.damage.weapon.length, 2);
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
