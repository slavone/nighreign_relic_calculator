# Nightreign Relic Probability Calculator

A single-file HTML calculator for the probability of rolling specific relic effects in Elden Ring Nightreign. Supports both Regular and Deep of Night (DON) relic pools.

## Usage

Open `index.html` in a browser — no server required.

1. Select **Regular** or **Deep of Night** mode
2. Choose a relic **Quality** (Delicate = 1 slot, Polished = 2, Grand = 3)
3. Optionally pick a specific **Color**
4. Add effect slots and select the group + effect you want
5. In DON mode, cursed effects unlock a curse dropdown — select **Any** or a specific curse
6. The probability updates live as you make selections

## Data Sources

- **Game data** (effect IDs, weights, compatibility groups):  
  [ip1259/Elden-Ring-Nightreign-Legal-Relic-Generator](https://github.com/ip1259/Elden-Ring-Nightreign-Legal-Relic-Generator)  
  Files used: `AttachEffectTableParam.csv`, `AttachEffectParam.csv`, `AttachEffectName.fmg.xml`, `AttachEffectName_dlc01.fmg.xml`

- **Effect descriptions and multipliers**:  
  [Nightreign Useful Info spreadsheet](https://docs.google.com/spreadsheets/d/1meXOw4jR1hh7YXVMeijWwSDIXnCw6Tk4hTZPq2qvyK4/edit?gid=1078794188#gid=1078794188)

Game version: **v1.03.2 + DLC1**

## Probability Formula

**Regular pool** — each relic slot draws from its own tier table, so a quality-K relic
uses K differently-weighted tables:

```
P = colorFactor × efSlots(tiers[0..K−1], desired effects)
```

- Slot _i_ draws from tier _i_: tier 0 = table 110 (W=10046), tier 1 = table 210 (W=10058), tier 2 = table 310 (W=10059).
- `efSlots` sums over which slot each desired effect lands in (using that slot's per-tier weight); unselected slots are free; a used group is removed from later slots; slots are processed tier-ascending.
- Delicate (1 slot) is exact; the change matters most for high-tier effects on Grand relics.

**Deep of Night pool** (unchanged, single-pool model):

```
P = K×(K−1)×…×(K−n+1) × ∏(w_i / W) × (0.25 if specific color) × ∏(1/24 per specific curse)
```

- DON pool: tables 2000000 + 2100000, W = 19961. Curse pool: table 3000000, 24 curses, W = 2400.

## Effect Multipliers Mode

A third mode, independent of the probability calculator: enter the actual
effects on up to 6 equipped relics (3 Regular + 3 Deep of Night, DON
toggleable off) and see the combined Damage / Damage Negation / Resource
multipliers.

Effects are classified as **baseline** (always-on, folds into a running
total per damage-type axis: Physical/Magic/Fire/Lightning/Holy/Universal, plus
Sorcery/Incantation category multipliers) or **conditional** (real value, but
tied to a specific weapon/spell-school or a transient trigger — shown as its
own line with a "combined with your baseline" figure rather than silently
merged). Anything not classified (flat stat bonuses, resistances, variable
per-kill scaling effects) is listed as plain text.

See `docs/superpowers/specs/2026-07-17-damage-build-mode-design.md` for the
full design rationale, including the spell-school → damage-type mapping.

Effect classification data lives in `effect_multipliers.mjs` and flows
through the same `prepare_data.mjs` / `prepare_don_data.mjs` → embed pipeline
as effect descriptions.

## Regenerating Data

Raw game files go in `data/`. Then run:

```bash
node parse_relics.mjs        # produces data/relic_groups.json
node prepare_data.mjs        # produces data/relic_data.json (regular pool)
node prepare_don_data.mjs    # produces data/don_relic_data.json (DON pool)
```

Then paste the JSON into `index.html` (the `DATA` and `DON_DATA` constants), or run the embed script:

```bash
python3 -c "
import json, re
with open('data/relic_data.json') as f: r = json.load(f)
with open('data/don_relic_data.json') as f: d = json.load(f)
with open('index.html') as f: c = f.read()
c = re.sub(r'const DATA = \{.*?\};', lambda m: 'const DATA = ' + json.dumps(r, separators=(',',':'), ensure_ascii=False) + ';', c, flags=re.DOTALL)
c = re.sub(r'const DON_DATA = \{.*?\};', lambda m: 'const DON_DATA = ' + json.dumps(d, separators=(',',':'), ensure_ascii=False) + ';', c, flags=re.DOTALL)
with open('index.html', 'w') as f: f.write(c)
"
```

Effect descriptions are maintained in `descriptions.mjs` and embedded during the prepare step.

## Tests

```bash
node tests/calc.test.mjs
```
