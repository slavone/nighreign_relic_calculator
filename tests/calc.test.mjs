// Standalone — no DOM, no imports needed.
// Copy-paste the two functions here so we test the exact code that goes in the HTML.

function comb(n, k) {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  let r = 1;
  for (let i = 0; i < k; i++) r = r * (n - i) / (i + 1);
  return r;
}

// groups: array of { groupName, effects: string[] }
// slots:  array of { groupIdx: number, effectIdx: number }
// quality: 1 | 2 | 3
// colorSelected: boolean
function calculateProbability(groups, quality, colorSelected, slots) {
  const G = groups.length;
  const K = quality;
  const n = slots.length;
  if (n === 0 || n > K) return 0;

  // Check for impossible: two slots from same group
  const groupIndices = slots.map(s => s.groupIdx);
  if (new Set(groupIndices).size < n) return 0;

  const groupFactor = comb(G - n, K - n) / comb(G, K);
  const effectFactor = slots.reduce((prod, s) => prod * (1 / groups[s.groupIdx].effects.length), 1);
  const colorFactor = colorSelected ? 0.25 : 1;

  return groupFactor * effectFactor * colorFactor;
}

// --- Test harness ---
let passed = 0, failed = 0;
function test(label, actual, expected, tolerance = 1e-7) {
  const ok = Math.abs(actual - expected) < tolerance;
  if (ok) { passed++; console.log('  PASS ' + label); }
  else { failed++; console.error('  FAIL ' + label + ': got ' + actual + ', expected ' + expected); }
}

// Build a minimal groups array matching real data shape
const G_REAL = 77;
const groups = Array.from({ length: G_REAL }, (_, i) => ({ groupName: 'G' + i, effects: ['e'] }));
// Override sizes for specific test slots
groups[0].effects = ['e1', 'e2', 'e3'];       // size 3  → Vigor-like
groups[1].effects = ['e'];                      // size 1  → Flask-like
groups[2].effects = Array.from({ length: 71 }, (_, i) => 'e' + i); // size 71 → Attack Power
groups[3].effects = ['e1', 'e2', 'e3'];       // size 3  → second stat group

console.log('--- comb() ---');
test('comb(0,0)', comb(0, 0), 1);
test('comb(5,0)', comb(5, 0), 1);
test('comb(5,5)', comb(5, 5), 1);
test('comb(5,2)', comb(5, 2), 10);
test('comb(77,3)', comb(77, 3), 73150);
test('comb(76,2)', comb(76, 2), 2850);
test('comb(3,-1)', comb(3, -1), 0);
test('comb(3,4)', comb(3, 4), 0);

console.log('--- calculateProbability() ---');
// n=1, size 3, Grand, no color
test('n=1 size=3 Grand', calculateProbability(groups, 3, false, [{ groupIdx: 0, effectIdx: 0 }]), 2850 / 73150 / 3, 1e-9);

// n=1, size 1, Grand
test('n=1 size=1 Grand', calculateProbability(groups, 3, false, [{ groupIdx: 1, effectIdx: 0 }]), 2850 / 73150 / 1, 1e-9);

// n=1, size 71, Grand
test('n=1 size=71 Grand', calculateProbability(groups, 3, false, [{ groupIdx: 2, effectIdx: 0 }]), 2850 / 73150 / 71, 1e-9);

// n=2, both size 3, Grand
test('n=2 size=3,3 Grand', calculateProbability(groups, 3, false, [{ groupIdx: 0, effectIdx: 0 }, { groupIdx: 3, effectIdx: 0 }]), 75 / 73150 / 9, 1e-9);

// n=3, all size 1, Grand
test('n=3 all size=1 Grand', calculateProbability(groups, 3, false, [{ groupIdx: 1, effectIdx: 0 }, { groupIdx: 4, effectIdx: 0 }, { groupIdx: 5, effectIdx: 0 }]), 1 / 73150, 1e-9);

// color factor
test('n=1 size=3 Grand color', calculateProbability(groups, 3, true, [{ groupIdx: 0, effectIdx: 0 }]), 2850 / 73150 / 3 / 4, 1e-9);

// Polished K=2, n=1, size 3
test('n=1 size=3 Polished', calculateProbability(groups, 2, false, [{ groupIdx: 0, effectIdx: 0 }]), comb(76, 1) / comb(77, 2) / 3, 1e-9);

// Polished K=2, n=2, both size 3
test('n=2 size=3,3 Polished', calculateProbability(groups, 2, false, [{ groupIdx: 0, effectIdx: 0 }, { groupIdx: 3, effectIdx: 0 }]), 1 / comb(77, 2) / 9, 1e-9);

// Delicate K=1, n=1, size 3
test('n=1 size=3 Delicate', calculateProbability(groups, 1, false, [{ groupIdx: 0, effectIdx: 0 }]), 1 / 77 / 3, 1e-9);

// Impossible: n=2 on Delicate
test('n=2 Delicate impossible', calculateProbability(groups, 1, false, [{ groupIdx: 0, effectIdx: 0 }, { groupIdx: 3, effectIdx: 0 }]), 0);

// Impossible: same group twice
test('same group twice', calculateProbability(groups, 3, false, [{ groupIdx: 0, effectIdx: 0 }, { groupIdx: 0, effectIdx: 1 }]), 0);

// Empty slots
test('no slots', calculateProbability(groups, 3, false, []), 0);

console.log('\n' + passed + ' passed, ' + failed + ' failed');
if (failed > 0) process.exit(1);
