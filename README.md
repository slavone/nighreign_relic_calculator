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

For a relic with K available slots selecting n specific effects:

```
P = K×(K−1)×…×(K−n+1) × ∏(w_i / W) × (0.25 if specific color) × ∏(1/24 per specific curse)
```

Where:
- `w_i` = weight of effect i in the pool
- `W` = total weight of all effects in the pool
- Regular pool: table 110, W = 10046
- DON pool: tables 2000000 + 2100000, W = 19961
- Curse pool: table 3000000, 24 curses each with equal weight, W = 2400

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
