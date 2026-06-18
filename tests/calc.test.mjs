// Tests for the weighted probability formula.
// Functions are defined inline to match the exact code in index.html.

// groups: array of { groupName, effects: [{name, w}] }
// slots:  array of { groupIdx, effectIdx }
// quality: 1 | 2 | 3
// colorSelected: boolean
// W: total weight of the pool
function calculateProbability(W, quality, colorSelected, slots) {
  const K = quality;
  const n = slots.length;
  if (n === 0 || n > K) return 0;

  const groupIndices = slots.map(s => s.groupIdx);
  if (new Set(groupIndices).size < n) return 0;

  // P ≈ K×(K-1)×…×(K-n+1) × ∏(w_i / W)
  let ff = 1;
  for (let i = 0; i < n; i++) ff *= (K - i);

  let ef = 1;
  for (const s of slots) {
    ef *= groups[s.groupIdx].effects[s.effectIdx].w / W;
  }

  return ff * ef * (colorSelected ? 0.25 : 1);
}

// Per-slot tier recursion (regular pool). Mirrors index.html exactly.
function efSlots(groups, Ws, tiers, D, used) {
  if (tiers.length === 0) return D.length === 0 ? 1 : 0;
  const t = tiers[0], rest = tiers.slice(1);
  let Wt = Ws[t];
  for (const gid of used) Wt -= groups[gid].groupWs[t];
  let total = 0;
  for (let i = 0; i < D.length; i++) {
    const d = D[i];
    if (used.has(d.gid)) continue;
    const u = new Set(used); u.add(d.gid);
    total += (d.ws[t] / Wt) * efSlots(groups, Ws, rest, D.filter((_, j) => j !== i), u);
  }
  if (rest.length >= D.length) {
    let freeGW = 0; const seen = new Set();
    for (const d of D) if (!used.has(d.gid) && !seen.has(d.gid)) { seen.add(d.gid); freeGW += d.groupWs[t]; }
    total += ((Wt - freeGW) / Wt) * efSlots(groups, Ws, rest, D, used);
  }
  return total;
}

// --- Test harness ---
let passed = 0, failed = 0;
function test(label, actual, expected, tolerance = 1e-12) {
  const ok = Math.abs(actual - expected) < tolerance;
  if (ok) { passed++; console.log('  PASS ' + label); }
  else { failed++; console.error('  FAIL ' + label + ': got ' + actual + ', expected ' + expected); }
}

const W = 10046;

const groups = [
  { groupName: 'G0', effects: [{ name: 'stat', w: 52 }] },
  { groupName: 'G1', effects: [{ name: 'char-a', w: 53 }, { name: 'char-b', w: 53 }] },
  { groupName: 'G2', effects: [{ name: 'atk-a', w: 9 }, { name: 'atk-b', w: 9 }] },
  { groupName: 'G3', effects: [{ name: 'disc', w: 4 }] },
  { groupName: 'G4', effects: [{ name: 'stat2', w: 52 }] },
  { groupName: 'G5', effects: [{ name: 'stat3', w: 52 }] },
];

console.log('--- calculateProbability() ---');

// n=1, Grand (K=3), stat (w=52): P = 3 * 52/W
test('n=1 Grand stat',
  calculateProbability(W, 3, false, [{ groupIdx: 0, effectIdx: 0 }]),
  3 * 52 / W);

// n=1, Grand, char ability (w=53)
test('n=1 Grand char-ability',
  calculateProbability(W, 3, false, [{ groupIdx: 1, effectIdx: 0 }]),
  3 * 53 / W);

// n=1, Grand, low-weight effect (w=9)
test('n=1 Grand low-weight',
  calculateProbability(W, 3, false, [{ groupIdx: 2, effectIdx: 0 }]),
  3 * 9 / W);

// n=1, Polished (K=2), stat (w=52): P = 2 * 52/W
test('n=1 Polished stat',
  calculateProbability(W, 2, false, [{ groupIdx: 0, effectIdx: 0 }]),
  2 * 52 / W);

// n=1, Delicate (K=1), stat (w=52): P = 1 * 52/W
test('n=1 Delicate stat',
  calculateProbability(W, 1, false, [{ groupIdx: 0, effectIdx: 0 }]),
  1 * 52 / W);

// n=2, Grand, two stats: P = 6 * 52 * 52 / W^2
test('n=2 Grand two stats',
  calculateProbability(W, 3, false, [{ groupIdx: 0, effectIdx: 0 }, { groupIdx: 4, effectIdx: 0 }]),
  6 * 52 * 52 / (W * W));

// n=3, Grand, three stats: P = 6 * 52^3 / W^3
test('n=3 Grand three stats',
  calculateProbability(W, 3, false,
    [{ groupIdx: 0, effectIdx: 0 }, { groupIdx: 4, effectIdx: 0 }, { groupIdx: 5, effectIdx: 0 }]),
  6 * 52 * 52 * 52 / (W * W * W));

// Color factor
test('n=1 Grand stat + color',
  calculateProbability(W, 3, true, [{ groupIdx: 0, effectIdx: 0 }]),
  3 * 52 / W * 0.25);

// Weapon discovery (w=4) on Polished
test('Weapon Discovery Polished',
  calculateProbability(W, 2, false, [{ groupIdx: 3, effectIdx: 0 }]),
  2 * 4 / W);

// Char ability is 53/52 times more likely than a stat effect
const pStat = calculateProbability(W, 3, false, [{ groupIdx: 0, effectIdx: 0 }]);
const pChar = calculateProbability(W, 3, false, [{ groupIdx: 1, effectIdx: 0 }]);
test('char-ability is 53/52 times more likely than stat',
  Math.abs(pChar / pStat - 53 / 52),
  0, 1e-10);

// Impossible: n=2 on Delicate (K=1)
test('n=2 on Delicate = 0',
  calculateProbability(W, 1, false, [{ groupIdx: 0, effectIdx: 0 }, { groupIdx: 4, effectIdx: 0 }]),
  0);

// Impossible: same group twice
test('same group twice = 0',
  calculateProbability(W, 3, false, [{ groupIdx: 0, effectIdx: 0 }, { groupIdx: 0, effectIdx: 0 }]),
  0);

// Empty slots
test('no slots = 0',
  calculateProbability(W, 3, false, []),
  0);

// --- efSlots() : per-slot tier model (regular pool) ---
console.log('\n--- efSlots() ---');

// Reference data: gid 0 = Vigor (+1/+2/+3), gid 1 & 2 = identical-tier flat stats.
const TG = [
  { groupWs: [156, 191, 225], effects: [ {ws:[52,47,41]}, {ws:[52,72,92]}, {ws:[52,72,92]} ] },
  { groupWs: [156, 156, 156], effects: [ {ws:[52,52,52]} ] },
  { groupWs: [156, 156, 156], effects: [ {ws:[52,52,52]} ] },
];
const TWs = [10046, 10058, 10059];
const tItem = (gid, ei) => ({ ws: TG[gid].effects[ei].ws, groupWs: TG[gid].groupWs, gid });
const tiersFor = K => Array.from({ length: K }, (_, i) => i);

// Vigor+3 on Grand (1 desired, 2 free): closed form using all three tier weights.
const v3grand = 52/10046
  + (10046-156)/10046 * ( 72/10058
  + (10058-191)/10058 * ( 92/10059 ) );
test('efSlots Vigor+3 Grand (per-slot tiers)',
  efSlots(TG, TWs, tiersFor(3), [tItem(0, 2)], new Set()),
  v3grand, 1e-12);

// Delicate (K=1) is exact = w0/W0 (tier 0 = table 110, no free slot).
test('efSlots Vigor+3 Delicate = 52/10046',
  efSlots(TG, TWs, tiersFor(1), [tItem(0, 2)], new Set()),
  52/10046, 1e-12);

// Weak effect on Grand goes BELOW the old 3*w/W model.
const v1grand = 52/10046
  + (10046-156)/10046 * ( 47/10058
  + (10058-191)/10058 * ( 41/10059 ) );
test('efSlots Vigor+1 Grand (weak, below old model)',
  efSlots(TG, TWs, tiersFor(3), [tItem(0, 0)], new Set()),
  v1grand, 1e-12);

// Identical-tier flat stat on Grand: still applies group exclusion, so < 3*52/W.
const flatGrand = 52/10046
  + (10046-156)/10046 * ( 52/10058
  + (10058-156)/10058 * ( 52/10059 ) );
test('efSlots identical-tier flat-stat Grand',
  efSlots(TG, TWs, tiersFor(3), [tItem(1, 0)], new Set()),
  flatGrand, 1e-12);

// Two flat stats on Grand (n=2, K=3): one free slot.
test('efSlots two flat-stats Grand (n=2,K=3)',
  efSlots(TG, TWs, tiersFor(3), [tItem(1, 0), tItem(2, 0)], new Set()),
  0.000160476969, 1e-9);

// Two flat stats on Polished (n=2, K=2): no free slot, n=K.
test('efSlots two flat-stats Polished (n=2,K=2)',
  efSlots(TG, TWs, tiersFor(2), [tItem(1, 0), tItem(2, 0)], new Set()),
  0.000054365150, 1e-9);

// n > K returns 0 (more desired than slots).
test('efSlots n=2 on Delicate (K=1) = 0',
  efSlots(TG, TWs, tiersFor(1), [tItem(1, 0), tItem(2, 0)], new Set()),
  0, 1e-15);

console.log('\n' + passed + ' passed, ' + failed + ' failed');
if (failed > 0) process.exit(1);
