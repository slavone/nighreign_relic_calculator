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

console.log('\n' + passed + ' passed, ' + failed + ' failed');
if (failed > 0) process.exit(1);
