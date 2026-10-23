// Locale completeness for guaranteed relics (Effect Multipliers mode): every
// relic name, every effect on those relics, the new conditions and the new UI
// strings must be translated in jp and kr. The UI never falls back to English.
import { readFileSync } from 'fs';
import vm from 'vm';
import { EFFECT_MULTIPLIERS } from '../effect_multipliers.mjs';

let passed = 0, failed = 0;
function check(label, ok) {
  if (ok) { passed++; }
  else { failed++; console.error('  FAIL ' + label); }
}

function loadLocale(file, globalName) {
  const sandbox = { window: {} };
  vm.runInNewContext(readFileSync(new URL(`../locales/${file}`, import.meta.url), 'utf8'), sandbox);
  return sandbox.window[globalName];
}

// Mirrors I18N.condition() in i18n.js: static entries, plus the two
// per-weapon-type templates ("<Weapon> hits only", "3+ <Weapon> Equipped").
function conditionTranslated(loc, en) {
  if (loc?.conditions?.[en]) return true;
  let m = en.match(/^(.+) hits only$/);
  if (m) return !!(loc?.weaponTypes?.[m[1]] && loc?.conditionTemplates?.hitsOnly);
  m = en.match(/^3\+ (.+) Equipped$/);
  if (m) return !!(loc?.weaponTypes?.[m[1]] && loc?.conditionTemplates?.equipped3Plus);
  return false;
}

const fixed = JSON.parse(readFileSync(new URL('../data/fixed_relics.json', import.meta.url), 'utf8'));
const relicNames = [...new Set(fixed.relics.map(r => r.name))];
const effectNames = [...new Set(fixed.relics.flatMap(r => r.effects.map(e => e.name)))];
const conditions = [...new Set(fixed.relics.flatMap(r => r.effects.map(e => e.mul?.condition)).filter(Boolean))];
const UI_KEYS = ['fixed_relic_label', 'fixed_relic_none', 'fixed_group_boss', 'fixed_group_remembrance',
  'fixed_group_signboard', 'fixed_group_misc', 'meth_file_antique', 'fixed_relic_select_btn'];

for (const [file, globalName] of [['jp.js', '__LOCALE_JP__'], ['kr.js', '__LOCALE_KR__']]) {
  const loc = loadLocale(file, globalName);
  check(`${file}: loads`, !!loc);
  for (const n of relicNames) check(`${file}: relic name "${n}"`, !!loc?.relics?.[n]);
  for (const n of effectNames) check(`${file}: effect name "${n}"`, !!loc?.effects?.[n]?.name);
  for (const c of conditions) check(`${file}: condition "${c}"`, conditionTranslated(loc, c));
  for (const k of UI_KEYS) check(`${file}: ui.${k}`, !!loc?.ui?.[k]);
}

// Descriptions: every effect the app can show (regular + DON pools, curses,
// guaranteed relics) that has an English description must have a jp/kr one
// under the same raw-name key I18N.effectDesc() looks up.
const J = f => JSON.parse(readFileSync(new URL(`../data/${f}`, import.meta.url), 'utf8'));
const described = new Map();
const addDesc = e => { if (e.desc && !described.has(e.name)) described.set(e.name, e.desc); };
for (const d of [J('relic_data.json'), J('don_relic_data.json')]) {
  for (const g of d.groups) g.effects.forEach(addDesc);
  (d.curses || []).forEach(addDesc);
}
fixed.relics.forEach(r => r.effects.forEach(addDesc));
// Flat-row templates ({v} = summed value): per-effect ones from
// effect_multipliers.mjs plus the stat-pool ones hard-coded in index.html.
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const poolBlock = html.match(/const BUILD_FLAT_POOL_TEMPLATES = \{([\s\S]*?)\};/);
const poolTemplates = poolBlock ? [...poolBlock[1].matchAll(/'([^']*\{v\}[^']*)'/g)].map(m => m[1]) : [];
check('found the 8 stat-pool flat templates in index.html', poolTemplates.length === 8);
const templates = [...new Set([...Object.values(EFFECT_MULTIPLIERS).filter(m => m.template).map(m => m.template), ...poolTemplates])];

for (const [file, globalName] of [['jp.js', '__LOCALE_JP__'], ['kr.js', '__LOCALE_KR__']]) {
  const loc = loadLocale(file, globalName);
  for (const n of described.keys()) check(`${file}: description for "${n}"`, !!loc?.effects?.[n]?.desc);
  for (const t of templates) {
    const tr = loc?.flatTemplates?.[t];
    check(`${file}: flat template "${t}" translated, keeping {v}`, !!tr && tr.includes('{v}'));
  }
}

// Sanity: the condition list above really comes from EFFECT_MULTIPLIERS.
check('conditions on fixed relics are classified conditions',
  conditions.every(c => Object.values(EFFECT_MULTIPLIERS).some(m => m.condition === c)));

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
