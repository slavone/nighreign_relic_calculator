window.__LOCALE_JP__ = {
  "ui": {
    "title": "Nightreign 遺物確率計算機",
    "mode_regular": "通常",
    "mode_don": "深夜の探索",
    "dlc_all": "全エフェクト",
    "dlc_pre": "DLC前",
    "calcmode_v1": "エフェクト指定",
    "calcmode_v2": "複数選択",
    "quality_label": "品質",
    "quality_grand": "グランド（3エフェクト）",
    "quality_polished": "磨かれた（2エフェクト）",
    "quality_delicate": "繊細（1エフェクト）",
    "color_label": "カラー",
    "color_blue": "青",
    "color_yellow": "黄",
    "color_green": "緑",
    "color_red": "赤",
    "add_effect": "+ 望むエフェクトを追加",
    "filter_groups": "グループでフィルタ…",
    "select_group_placeholder": "— グループを選択 —",
    "select_effect_placeholder": "— エフェクトを選択 —",
    "remove": "削除",
    "curse_label": "呪い：",
    "select_all": "全選択",
    "select_none": "選択解除",
    "curse_any": "いずれの呪い",
    "curse_filter_title": "呪いフィルタ",
    "curse_selected": "許容できる呪いのみ",
    "err_same_group": "不可能な組み合わせ（同一グループから2つのエフェクト）",
    "err_same_curse": "同じ呪いを遺物に2つ付けることはできません",
    "err_impossible": "不可能な組み合わせ",
    "result_probability": "確率",
    "data_note_regular": "AttachEffectTableParam.csvの実際のゲームウェイトを使用。ゲームデータv1.03.2 + DLCに基づく。",
    "data_note_don": "深夜の探索プール：テーブル2000000+2100000。⚠はランダムな呪いが付くエフェクトを示します。ゲームデータv1.03.2 + DLCに基づく。",
    "data_note_predlc_suffix": " DLC前モード：DLC追加エフェクトを除外。",
    "pool_summary_format": "{g}グループから{n}エフェクトを選択中",
    "methodology_summary": "データソースと方法論",
    "meth_h3_sources": "データソース",
    "meth_game_version": "ゲームバージョン: v1.03.2 + DLC1",
    "meth_src_gamefiles": "生のゲームファイル (CSV/XML): <a href=\"https://github.com/ip1259/Elden-Ring-Nightreign-Legal-Relic-Generator\" target=\"_blank\" rel=\"noopener\">ip1259/Elden-Ring-Nightreign-Legal-Relic-Generator</a>",
    "meth_src_descs": "エフェクト説明・検証: <a href=\"https://docs.google.com/spreadsheets/d/1meXOw4jR1hh7YXVMeijWwSDIXnCw6Tk4hTZPq2qvyK4/edit#gid=1078794188\" target=\"_blank\" rel=\"noopener\">Nightreign Useful Info (v1.03.2 + DLC)</a>",
    "meth_h3_files": "使用ファイル",
    "meth_file_table": "<code>AttachEffectTableParam.csv</code> — ルーテーブルのウェイト",
    "meth_file_param": "<code>AttachEffectParam.csv</code> — エフェクト互換グループ",
    "meth_file_names": "<code>AttachEffectName.fmg.xml</code> + <code>AttachEffectName_dlc01.fmg.xml</code> — エフェクト表示名",
    "meth_chance_weight": "<code>chanceWeight</code>列には<code>actual_weight − 65536</code>が格納されています。実際のウェイト = <code>stored + 65536</code>。",
    "meth_h3_tables": "ルーテーブル",
    "meth_tbl_mode": "モード",
    "meth_tbl_id": "テーブルID",
    "meth_tbl_pool": "プール合計 (W)",
    "meth_tbl_regular": "通常",
    "meth_tbl_regular_pool": "10046（名称なしエフェクト5個、合計ウェイト216を含む）",
    "meth_tbl_don": "深夜エフェクト",
    "meth_tbl_don_pool": "19961（テーブル2100000の名称なしエフェクト83個を含む）",
    "meth_tbl_curses": "深夜の呪い",
    "meth_tbl_curses_pool": "2400（24種の呪い × ウェイト100）",
    "meth_tables_note": "テーブル2000000には最強の呪いエフェクト（例: 攻撃+3/+4）が含まれます。テーブル2100000は通常プールと深夜専用エフェクトを共有する一般的な深夜プールです。",
    "meth_h3_groups": "エフェクトグループ",
    "meth_groups_note": "<code>AttachEffectParam.csv</code>内で同じ<code>compatibilityId</code>を持つエフェクトは互いに排他的です — 同一グループから2つのエフェクトを1つの遺物に付けることはできません。計算機のドロップダウンはこれらのグループに対応しています。",
    "meth_h3_formula": "確率計算式",
    "meth_formula_p1": "任意のグループから好きなエフェクトを選んで<em>希望プール</em>を作成します。<em>K</em>スロットの遺物に対して、計算機はすべてのKエフェクトがプールから引かれる確率を計算します。",
    "meth_formula_p2": "<strong>通常プール</strong> — 各遺物スロットは独自のティアテーブルから抽選されます：スロット1はテーブル110、スロット2は210、スロット3は310（デリケートはティア1のみ、ポリッシュはティア1〜2、グランドはティア1〜3を使用）。同じエフェクトでもティアごとにウェイトが異なり、弱いエフェクトはティア1で、強いエフェクトはティア3で最も出やすくなります。",
    "meth_formula_p3": "<code>efSlots</code>は、各希望エフェクトがどのスロットに入るか（そのスロットのウェイトを使用）を合計し、未選択のスロットは自由枠として扱います。引かれたグループのウェイトは以降のスロットから除かれます。スロットはティアの昇順で処理されます:",
    "meth_formula_p4": "デリケートの結果は厳密です。特定の遺物色が必要な場合は0.25を乗算します。<strong>深夜の探索</strong>の遺物は単一プールモデル（ティアなし）を使用します：P = K! × Σ（K個グループ集合にわたる）ef(S, W) × curseFactor。",
    "meth_h3_curse": "深夜の探索: 呪い係数",
    "meth_curse_p1": "呪いエフェクト（⚠）には、24種の呪いプールから等確率で引かれた呪いが1つ付随します。呪いは<strong>非復元抽出</strong>（同じ呪いが1つの遺物に2回付くことはない）を前提としています。これはゲーム内の遺物の個人的な観察に基づく経験則であり、ゲームコードからは未確認です。",
    "meth_curse_p2": "呪いフィルタを「許容できる呪いのみ」に設定した場合、<em>N</em> = 選択した許容できる呪いの数、<em>m</em> = 現在のK部分集合において全選択エフェクトが呪い付きであるグループ数とします。各部分集合の呪い係数は:",
    "meth_curse_p3": "「いずれの呪い」ではN = 24となり係数 = 1（ペナルティなし）です。N &lt; mの部分集合は不可能のためスキップされます。一部の選択エフェクトのみが呪い付きのグループはmに含まれません — ユーザーがどちらの結果も許容しているためです。",
    "meth_h3_corrections": "データ修正",
    "meth_corrections_p": "エフェクト6001400（Physical Attack Up）はゲームXMLで「+4」とラベルされていますが、そのウェイト（269）はすべての属性タイプ（Magic/Fire/Lightning/Holy Attack Up）で見られる通常パターン（+3ティアが269、+4ティアが130）に一致します。エフェクト6001401はXML内に名前がありませんでしたが（<code>%null%</code>）、確認済みの+4です。名前はデータパイプラインで手動修正されました。",
    "meth_h3_translation": "翻訳",
    "meth_translation_sources": "日本語エフェクト名の参照元: <a href=\"https://gamerch.com/nightreign/924585\" target=\"_blank\" rel=\"noopener\">Gamerch Wiki</a>、<a href=\"https://gamewith.jp/eldenring/501441\" target=\"_blank\" rel=\"noopener\">GameWith</a>、<a href=\"https://game8.jp/eldenring-nightreign/694115\" target=\"_blank\" rel=\"noopener\">Game8</a>、<a href=\"https://nightreignrelic.com\" target=\"_blank\" rel=\"noopener\">nightreignrelic.com</a>。",
    "meth_translation_claude": "日本語UIは<a href=\"https://claude.ai\" target=\"_blank\" rel=\"noopener\">Claude</a>（Anthropic）で翻訳されました。翻訳に誤りを見つけた場合は<a href=\"https://github.com/slavone/nighreign_relic_calculator/issues\" target=\"_blank\" rel=\"noopener\">GitHubで報告</a>してください。"
  },
  "effects": {
    "Vigor +1": {
      "name": "生命力+1"
    },
    "Vigor +2": {
      "name": "生命力+2"
    },
    "Vigor +3": {
      "name": "生命力+3"
    },
    "Mind +1": {
      "name": "精神力+1"
    },
    "Mind +2": {
      "name": "精神力+2"
    },
    "Mind +3": {
      "name": "精神力+3"
    },
    "Endurance +1": {
      "name": "持久力+1"
    },
    "Endurance +2": {
      "name": "持久力+2"
    },
    "Endurance +3": {
      "name": "持久力+3"
    },
    "Strength +1": {
      "name": "筋力+1"
    },
    "Strength +2": {
      "name": "筋力+2"
    },
    "Strength +3": {
      "name": "筋力+3"
    },
    "Dexterity +1": {
      "name": "技量+1"
    },
    "Dexterity +2": {
      "name": "技量+2"
    },
    "Dexterity +3": {
      "name": "技量+3"
    },
    "Intelligence +1": {
      "name": "知力+1"
    },
    "Intelligence +2": {
      "name": "知力+2"
    },
    "Intelligence +3": {
      "name": "知力+3"
    },
    "Faith +1": {
      "name": "信仰+1"
    },
    "Faith +2": {
      "name": "信仰+2"
    },
    "Faith +3": {
      "name": "信仰+3"
    },
    "Arcane +1": {
      "name": "神秘+1"
    },
    "Arcane +2": {
      "name": "神秘+2"
    },
    "Arcane +3": {
      "name": "神秘+3"
    },
    "Poise +1": {
      "name": "強靭度+1"
    },
    "Poise +2": {
      "name": "強靭度+2"
    },
    "Poise +3": {
      "name": "強靭度+3"
    },
    "Physical Attack Power Up": {
      "name": "物理攻撃力上昇"
    },
    "Physical Attack Power Up +1": {
      "name": "物理攻撃力上昇+1"
    },
    "Physical Attack Power Up +2": {
      "name": "物理攻撃力上昇+2"
    },
    "Magic Attack Power Up": {
      "name": "魔力攻撃力上昇"
    },
    "Magic Attack Power Up +1": {
      "name": "魔力攻撃力上昇+1"
    },
    "Magic Attack Power Up +2": {
      "name": "魔力攻撃力上昇+2"
    },
    "Fire Attack Power Up": {
      "name": "炎攻撃力上昇"
    },
    "Fire Attack Power Up +1": {
      "name": "炎攻撃力上昇+1"
    },
    "Fire Attack Power Up +2": {
      "name": "炎攻撃力上昇+2"
    },
    "Lightning Attack Power Up": {
      "name": "雷攻撃力上昇"
    },
    "Lightning Attack Power Up +1": {
      "name": "雷攻撃力上昇+1"
    },
    "Lightning Attack Power Up +2": {
      "name": "雷攻撃力上昇+2"
    },
    "Holy Attack Power Up": {
      "name": "聖攻撃力上昇"
    },
    "Holy Attack Power Up +1": {
      "name": "聖攻撃力上昇+1"
    },
    "Holy Attack Power Up +2": {
      "name": "聖攻撃力上昇+2"
    },
    "Improved Axe Attack Power": {
      "name": "斧の攻撃力上昇"
    },
    "Improved Bow Attack Power": {
      "name": "弓の攻撃力上昇"
    },
    "Improved Claw Attack Power": {
      "name": "爪の攻撃力上昇"
    },
    "Improved Colossal Sword Attack Power": {
      "name": "特大剣の攻撃力上昇"
    },
    "Improved Colossal Weapon Attack Power": {
      "name": "特大武器の攻撃力上昇"
    },
    "Improved Curved Greatsword Attack Power": {
      "name": "大曲剣の攻撃力上昇"
    },
    "Improved Curved Sword Attack Power": {
      "name": "曲剣の攻撃力上昇"
    },
    "Improved Dagger Attack Power": {
      "name": "短剣の攻撃力上昇"
    },
    "Improved Fist Attack Power": {
      "name": "拳の攻撃力上昇"
    },
    "Improved Flail Attack Power": {
      "name": "フレイルの攻撃力上昇"
    },
    "Improved Great Hammer Attack Power": {
      "name": "大槌の攻撃力上昇"
    },
    "Improved Great Spear Attack Power": {
      "name": "大槍の攻撃力上昇"
    },
    "Improved Greataxe Attack Power": {
      "name": "大斧の攻撃力上昇"
    },
    "Improved Greatsword Attack Power": {
      "name": "大剣の攻撃力上昇"
    },
    "Improved Halberd Attack Power": {
      "name": "斧槍の攻撃力上昇"
    },
    "Improved Hammer Attack Power": {
      "name": "槌の攻撃力上昇"
    },
    "Improved Heavy Thrusting Sword Attack Power": {
      "name": "重刺剣の攻撃力上昇"
    },
    "Improved Katana Attack Power": {
      "name": "刀の攻撃力上昇"
    },
    "Improved Reaper Attack Power": {
      "name": "大鎌の攻撃力上昇"
    },
    "Improved Spear Attack Power": {
      "name": "槍の攻撃力上昇"
    },
    "Improved Straight Sword Attack Power": {
      "name": "直剣の攻撃力上昇"
    },
    "Improved Thrusting Sword Attack Power": {
      "name": "刺剣の攻撃力上昇"
    },
    "Improved Twinblade Attack Power": {
      "name": "両刃剣の攻撃力上昇"
    },
    "Improved Whip Attack Power": {
      "name": "鞭の攻撃力上昇"
    },
    "Improved Attack Power with 3+ Axes Equipped": {
      "name": "斧を3本以上装備時、攻撃力上昇"
    },
    "Dormant Power Helps Discover Axes": {
      "name": "潜在する力から斧を見つけやすくなる"
    },
    "Improved Attack Power with 3+ Ballistas Equipped": {
      "name": "バリスタを3本以上装備時、攻撃力上昇"
    },
    "Dormant Power Helps Discover Ballistas": {
      "name": "潜在する力からバリスタを見つけやすくなる"
    },
    "Improved Attack Power with 3+ Bows Equipped": {
      "name": "弓を3本以上装備時、攻撃力上昇"
    },
    "Dormant Power Helps Discover Bows": {
      "name": "潜在する力から弓を見つけやすくなる"
    },
    "Improved Attack Power with 3+ Claws Equipped": {
      "name": "爪を3本以上装備時、攻撃力上昇"
    },
    "Dormant Power Helps Discover Claws": {
      "name": "潜在する力から爪を見つけやすくなる"
    },
    "Improved Attack Power with 3+ Colossal Swords Equipped": {
      "name": "特大剣を3本以上装備時、攻撃力上昇"
    },
    "Dormant Power Helps Discover Colossal Swords": {
      "name": "潜在する力から特大剣を見つけやすくなる"
    },
    "Improved Attack Power with 3+ Colossal Weapons Equipped": {
      "name": "特大武器を3本以上装備時、攻撃力上昇"
    },
    "Dormant Power Helps Discover Colossal Weapons": {
      "name": "潜在する力から特大武器を見つけやすくなる"
    },
    "Improved Attack Power with 3+ Crossbows Equipped": {
      "name": "クロスボウを3本以上装備時、攻撃力上昇"
    },
    "Dormant Power Helps Discover Crossbows": {
      "name": "潜在する力からクロスボウを見つけやすくなる"
    },
    "Improved Attack Power with 3+ Curved Greatswords Equipped": {
      "name": "大曲剣を3本以上装備時、攻撃力上昇"
    },
    "Dormant Power Helps Discover Curved Greatswords": {
      "name": "潜在する力から大曲剣を見つけやすくなる"
    },
    "Improved Attack Power with 3+ Curved Swords Equipped": {
      "name": "曲剣を3本以上装備時、攻撃力上昇"
    },
    "Dormant Power Helps Discover Curved Swords": {
      "name": "潜在する力から曲剣を見つけやすくなる"
    },
    "Improved Attack Power with 3+ Daggers Equipped": {
      "name": "短剣を3本以上装備時、攻撃力上昇"
    },
    "Dormant Power Helps Discover Daggers": {
      "name": "潜在する力から短剣を見つけやすくなる"
    },
    "Improved Fists Attack Power": {
      "name": "拳の攻撃力上昇"
    },
    "Improved Attack Power with 3+ Fists Equipped": {
      "name": "拳を3本以上装備時、攻撃力上昇"
    },
    "Dormant Power Helps Discover Fists": {
      "name": "潜在する力から拳を見つけやすくなる"
    },
    "Improved Attack Power with 3+ Flails Equipped": {
      "name": "フレイルを3本以上装備時、攻撃力上昇"
    },
    "Dormant Power Helps Discover Flails": {
      "name": "潜在する力からフレイルを見つけやすくなる"
    },
    "Improved Attack Power with 3+ Great Hammers Equipped": {
      "name": "大槌を3本以上装備時、攻撃力上昇"
    },
    "Dormant Power Helps Discover Great Hammers": {
      "name": "潜在する力から大槌を見つけやすくなる"
    },
    "Improved Attack Power with 3+ Great Spears Equipped": {
      "name": "大槍を3本以上装備時、攻撃力上昇"
    },
    "Dormant Power Helps Discover Great Spears": {
      "name": "潜在する力から大槍を見つけやすくなる"
    },
    "Improved Attack Power with 3+ Greataxes Equipped": {
      "name": "大斧を3本以上装備時、攻撃力上昇"
    },
    "Dormant Power Helps Discover Greataxes": {
      "name": "潜在する力から大斧を見つけやすくなる"
    },
    "Improved Attack Power with 3+ Greatbows Equipped": {
      "name": "大弓を3本以上装備時、攻撃力上昇"
    },
    "Dormant Power Helps Discover Greatbows": {
      "name": "潜在する力から大弓を見つけやすくなる"
    },
    "Improved Attack Power with 3+ Greatshields Equipped": {
      "name": "大盾を3本以上装備時、攻撃力上昇"
    },
    "Dormant Power Helps Discover Greatshields": {
      "name": "潜在する力から大盾を見つけやすくなる"
    },
    "Improved Attack Power with 3+ Greatswords Equipped": {
      "name": "大剣を3本以上装備時、攻撃力上昇"
    },
    "Dormant Power Helps Discover Greatswords": {
      "name": "潜在する力から大剣を見つけやすくなる"
    },
    "Improved Attack Power with 3+ Halberds Equipped": {
      "name": "斧槍を3本以上装備時、攻撃力上昇"
    },
    "Dormant Power Helps Discover Halberds": {
      "name": "潜在する力から斧槍を見つけやすくなる"
    },
    "Improved Attack Power with 3+ Hammers Equipped": {
      "name": "槌を3本以上装備時、攻撃力上昇"
    },
    "Dormant Power Helps Discover Hammers": {
      "name": "潜在する力から槌を見つけやすくなる"
    },
    "Improved Attack Power with 3+ Heavy Thrusting Swords Equipped": {
      "name": "重刺剣を3本以上装備時、攻撃力上昇"
    },
    "Dormant Power Helps Discover Heavy Thrusting Swords": {
      "name": "潜在する力から重刺剣を見つけやすくなる"
    },
    "Improved Attack Power with 3+ Reapers Equipped": {
      "name": "大鎌を3本以上装備時、攻撃力上昇"
    },
    "Dormant Power Helps Discover Reapers": {
      "name": "潜在する力から大鎌を見つけやすくなる"
    },
    "Improved Attack Power with 3+ Spears Equipped": {
      "name": "槍を3本以上装備時、攻撃力上昇"
    },
    "Dormant Power Helps Discover Spears": {
      "name": "潜在する力から槍を見つけやすくなる"
    },
    "Improved Attack Power with 3+ Straight Swords Equipped": {
      "name": "直剣を3本以上装備時、攻撃力上昇"
    },
    "Dormant Power Helps Discover Straight Swords": {
      "name": "潜在する力から直剣を見つけやすくなる"
    },
    "HP Restoration upon Axe Attacks": {
      "name": "斧の攻撃でHP回復"
    },
    "FP Restoration upon Axe Attacks": {
      "name": "斧の攻撃でFP回復"
    },
    "HP Restoration upon Bow Attacks": {
      "name": "弓の攻撃でHP回復"
    },
    "FP Restoration upon Bow Attacks": {
      "name": "弓の攻撃でFP回復"
    },
    "HP Restoration upon Claw Attacks": {
      "name": "爪の攻撃でHP回復"
    },
    "FP Restoration upon Claw Attacks": {
      "name": "爪の攻撃でFP回復"
    },
    "HP Restoration upon Colossal Sword Attacks": {
      "name": "特大剣の攻撃でHP回復"
    },
    "FP Restoration upon Colossal Sword Attacks": {
      "name": "特大剣の攻撃でFP回復"
    },
    "HP Restoration upon Colossal Weapon Attacks": {
      "name": "特大武器の攻撃でHP回復"
    },
    "FP Restoration upon Colossal Weapon Attacks": {
      "name": "特大武器の攻撃でFP回復"
    },
    "HP Restoration upon Curved Greatsword Attacks": {
      "name": "大曲剣の攻撃でHP回復"
    },
    "FP Restoration upon Curved Greatsword Attacks": {
      "name": "大曲剣の攻撃でFP回復"
    },
    "HP Restoration upon Curved Sword Attacks": {
      "name": "曲剣の攻撃でHP回復"
    },
    "FP Restoration upon Curved Sword Attacks": {
      "name": "曲剣の攻撃でFP回復"
    },
    "HP Restoration upon Dagger Attacks": {
      "name": "短剣の攻撃でHP回復"
    },
    "FP Restoration upon Dagger Attacks": {
      "name": "短剣の攻撃でFP回復"
    },
    "HP Restoration upon Fist Attacks": {
      "name": "拳の攻撃でHP回復"
    },
    "FP Restoration upon Fist Attacks": {
      "name": "拳の攻撃でFP回復"
    },
    "HP Restoration upon Flail Attacks": {
      "name": "フレイルの攻撃でHP回復"
    },
    "FP Restoration upon Flail Attacks": {
      "name": "フレイルの攻撃でFP回復"
    },
    "HP Restoration upon Great Hammer Attacks": {
      "name": "大槌の攻撃でHP回復"
    },
    "FP Restoration upon Great Hammer Attacks": {
      "name": "大槌の攻撃でFP回復"
    },
    "HP Restoration upon Great Spear Attacks": {
      "name": "大槍の攻撃でHP回復"
    },
    "FP Restoration upon Great Spear Attacks": {
      "name": "大槍の攻撃でFP回復"
    },
    "HP Restoration upon Greataxe Attacks": {
      "name": "大斧の攻撃でHP回復"
    },
    "FP Restoration upon Greataxe Attacks": {
      "name": "大斧の攻撃でFP回復"
    },
    "HP Restoration upon Greatsword Attacks": {
      "name": "大剣の攻撃でHP回復"
    },
    "FP Restoration upon Greatsword Attacks": {
      "name": "大剣の攻撃でFP回復"
    },
    "HP Restoration upon Halberd Attacks": {
      "name": "斧槍の攻撃でHP回復"
    },
    "FP Restoration upon Halberd Attacks": {
      "name": "斧槍の攻撃でFP回復"
    },
    "HP Restoration upon Hammer Attacks": {
      "name": "槌の攻撃でHP回復"
    },
    "FP Restoration upon Hammer Attacks": {
      "name": "槌の攻撃でFP回復"
    },
    "HP Restoration upon Heavy Thrusting Sword Attacks": {
      "name": "重刺剣の攻撃でHP回復"
    },
    "FP Restoration upon Heavy Thrusting Sword Attacks": {
      "name": "重刺剣の攻撃でFP回復"
    },
    "HP Restoration upon Katana Attacks": {
      "name": "刀の攻撃でHP回復"
    },
    "FP Restoration upon Katana Attacks": {
      "name": "刀の攻撃でFP回復"
    },
    "HP Restoration upon Reaper Attacks": {
      "name": "大鎌の攻撃でHP回復"
    },
    "FP Restoration upon Reaper Attacks": {
      "name": "大鎌の攻撃でFP回復"
    },
    "HP Restoration upon Spear Attacks": {
      "name": "槍の攻撃でHP回復"
    },
    "FP Restoration upon Spear Attacks": {
      "name": "槍の攻撃でFP回復"
    },
    "HP Restoration upon Straight Sword Attacks": {
      "name": "直剣の攻撃でHP回復"
    },
    "FP Restoration upon Straight Sword Attacks": {
      "name": "直剣の攻撃でFP回復"
    },
    "HP Restoration upon Thrusting Sword Attacks": {
      "name": "刺剣の攻撃でHP回復"
    },
    "FP Restoration upon Thrusting Sword Attacks": {
      "name": "刺剣の攻撃でFP回復"
    },
    "HP Restoration upon Twinblade Attacks": {
      "name": "両刃剣の攻撃でHP回復"
    },
    "FP Restoration upon Twinblade Attacks": {
      "name": "両刃剣の攻撃でFP回復"
    },
    "HP Restoration upon Whip Attacks": {
      "name": "鞭の攻撃でHP回復"
    },
    "FP Restoration upon Whip Attacks": {
      "name": "鞭の攻撃でFP回復"
    },
    "Changes compatible armament's skill to Glintblade Phalanx at start of expedition": {
      "name": "出撃時の武器の戦技を「輝剣ファランクス」にする"
    },
    "Changes compatible armament's skill to Glintblade Phalanx\nat start of expedition": {
      "name": "出撃時の武器の戦技を「輝剣ファランクス」にする"
    },
    "Changes compatible armament's skill to Gravitas at start of expedition": {
      "name": "出撃時の武器の戦技を「グラビタス」にする"
    },
    "Changes compatible armament's skill to Gravitas\nat start of expedition": {
      "name": "出撃時の武器の戦技を「グラビタス」にする"
    },
    "Changes compatible armament's skill to Flaming Strike at start of expedition": {
      "name": "出撃時の武器の戦技を「炎撃」にする"
    },
    "Changes compatible armament's skill to Flaming Strike\nat start of expedition": {
      "name": "出撃時の武器の戦技を「炎撃」にする"
    },
    "Changes compatible armament's skill to Eruption at start of expedition": {
      "name": "出撃時の武器の戦技を「噴火」にする"
    },
    "Changes compatible armament's skill to Eruption\nat start of expedition": {
      "name": "出撃時の武器の戦技を「噴火」にする"
    },
    "Changes compatible armament's skill to Thunderbolt at start of expedition": {
      "name": "出撃時の武器の戦技を「落雷」にする"
    },
    "Changes compatible armament's skill to Thunderbolt\nat start of expedition": {
      "name": "出撃時の武器の戦技を「落雷」にする"
    },
    "Changes compatible armament's skill to Lightning Slash at start of expedition": {
      "name": "出撃時の武器の戦技を「雷撃斬」にする"
    },
    "Changes compatible armament's skill to Lightning Slash\nat start of expedition": {
      "name": "出撃時の武器の戦技を「雷撃斬」にする"
    },
    "Changes compatible armament's skill to Sacred Blade at start of expedition": {
      "name": "出撃時の武器の戦技を「聖なる刃」にする"
    },
    "Changes compatible armament's skill to Sacred Blade\nat start of expedition": {
      "name": "出撃時の武器の戦技を「聖なる刃」にする"
    },
    "Changes compatible armament's skill to Prayerful Strike at start of expedition": {
      "name": "出撃時の武器の戦技を「祈りの打撃」にする"
    },
    "Changes compatible armament's skill to Prayerful Strike\nat start of expedition": {
      "name": "出撃時の武器の戦技を「祈りの打撃」にする"
    },
    "Changes compatible armament's skill to Poisonous Mist at start of expedition": {
      "name": "出撃時の武器の戦技を「毒の霧」にする"
    },
    "Changes compatible armament's skill to Poisonous Mist\nat start of expedition": {
      "name": "出撃時の武器の戦技を「毒の霧」にする"
    },
    "Changes compatible armament's skill to Poison Moth Flight at start of expedition": {
      "name": "出撃時の武器の戦技を「毒蛾の飛翔」にする"
    },
    "Changes compatible armament's skill to Poison Moth Flight\nat start of expedition": {
      "name": "出撃時の武器の戦技を「毒蛾の飛翔」にする"
    },
    "Changes compatible armament's skill to Blood Blade at start of expedition": {
      "name": "出撃時の武器の戦技を「血の刃」にする"
    },
    "Changes compatible armament's skill to Blood Blade\nat start of expedition": {
      "name": "出撃時の武器の戦技を「血の刃」にする"
    },
    "Changes compatible armament's skill to Seppuku at start of expedition": {
      "name": "出撃時の武器の戦技を「切腹」にする"
    },
    "Changes compatible armament's skill to Seppuku\nat start of expedition": {
      "name": "出撃時の武器の戦技を「切腹」にする"
    },
    "Changes compatible armament's skill to Chilling Mist at start of expedition": {
      "name": "出撃時の武器の戦技を「冷気の霧」にする"
    },
    "Changes compatible armament's skill to Chilling Mist\nat start of expedition": {
      "name": "出撃時の武器の戦技を「冷気の霧」にする"
    },
    "Changes compatible armament's skill to Hoarfrost Stomp at start of expedition": {
      "name": "出撃時の武器の戦技を「霜踏み」にする"
    },
    "Changes compatible armament's skill to Hoarfrost Stomp\nat start of expedition": {
      "name": "出撃時の武器の戦技を「霜踏み」にする"
    },
    "Changes compatible armament's skill to White Shadow's Lure at start of expedition": {
      "name": "出撃時の武器の戦技を「白影の誘引」にする"
    },
    "Changes compatible armament's skill to White Shadow's Lure\nat start of expedition": {
      "name": "出撃時の武器の戦技を「白影の誘引」にする"
    },
    "Changes compatible armament's skill to Endure at start of expedition": {
      "name": "出撃時の武器の戦技を「耐え」にする"
    },
    "Changes compatible armament's skill to Endure\nat start of expedition": {
      "name": "出撃時の武器の戦技を「耐え」にする"
    },
    "Changes compatible armament's skill to Quickstep at start of expedition": {
      "name": "出撃時の武器の戦技を「クイックステップ」にする"
    },
    "Changes compatible armament's skill to Quickstep\nat start of expedition": {
      "name": "出撃時の武器の戦技を「クイックステップ」にする"
    },
    "Changes compatible armament's skill to Storm Stomp at start of expedition": {
      "name": "出撃時の武器の戦技を「嵐の踏みつけ」にする"
    },
    "Changes compatible armament's skill to Storm Stomp\nat start of expedition": {
      "name": "出撃時の武器の戦技を「嵐の踏みつけ」にする"
    },
    "Changes compatible armament's skill to Determination at start of expedition": {
      "name": "出撃時の武器の戦技を「覚悟」にする"
    },
    "Changes compatible armament's skill to Determination\nat start of expedition": {
      "name": "出撃時の武器の戦技を「覚悟」にする"
    },
    "Changes compatible armament's skill to Rain of Arrows at start of expedition": {
      "name": "出撃時の武器の戦技を「矢の雨」にする"
    },
    "Changes compatible armament's skill to Rain of Arrows\nat start of expedition": {
      "name": "出撃時の武器の戦技を「矢の雨」にする"
    },
    "Changes compatible armament's sorcery to Magic Glintblade at start of expedition": {
      "name": "出撃時の武器の魔術を「魔術の輝剣」にする"
    },
    "Changes compatible armament's sorcery to Magic Glintblade\nat start of expedition": {
      "name": "出撃時の武器の魔術を「魔術の輝剣」にする"
    },
    "Changes compatible armament's sorcery to Carian Greatsword at start of expedition": {
      "name": "出撃時の武器の魔術を「カーリアの大剣」にする"
    },
    "Changes compatible armament's sorcery to Carian Greatsword\nat start of expedition": {
      "name": "出撃時の武器の魔術を「カーリアの大剣」にする"
    },
    "Changes compatible armament's sorcery to Night Shard at start of expedition": {
      "name": "出撃時の武器の魔術を「夜のかけら」にする"
    },
    "Changes compatible armament's sorcery to Night Shard\nat start of expedition": {
      "name": "出撃時の武器の魔術を「夜のかけら」にする"
    },
    "Changes compatible armament's sorcery to Magma Shot at start of expedition": {
      "name": "出撃時の武器の魔術を「マグマ弾」にする"
    },
    "Changes compatible armament's sorcery to Magma Shot\nat start of expedition": {
      "name": "出撃時の武器の魔術を「マグマ弾」にする"
    },
    "Changes compatible armament's sorcery to Briars of Punishment at start of expedition": {
      "name": "出撃時の武器の魔術を「棘の罰」にする"
    },
    "Changes compatible armament's sorcery to Briars of Punishment\nat start of expedition": {
      "name": "出撃時の武器の魔術を「棘の罰」にする"
    },
    "Changes compatible armament's incantation to Wrath of Gold at start of expedition": {
      "name": "出撃時の武器の祈祷を「黄金の怒り」にする"
    },
    "Changes compatible armament's incantation to Wrath of Gold\nat start of expedition": {
      "name": "出撃時の武器の祈祷を「黄金の怒り」にする"
    },
    "Changes compatible armament's incantation to Lightning Spear at start of expedition": {
      "name": "出撃時の武器の祈祷を「雷の槍」にする"
    },
    "Changes compatible armament's incantation to Lightning Spear\nat start of expedition": {
      "name": "出撃時の武器の祈祷を「雷の槍」にする"
    },
    "Changes compatible armament's incantation to O, Flame! at start of expedition": {
      "name": "出撃時の武器の祈祷を「おお、炎よ！」にする"
    },
    "Changes compatible armament's incantation to O, Flame!\nat start of expedition": {
      "name": "出撃時の武器の祈祷を「おお、炎よ！」にする"
    },
    "Changes compatible armament's incantation to Beast Claw at start of expedition": {
      "name": "出撃時の武器の祈祷を「獣の爪」にする"
    },
    "Changes compatible armament's incantation to Beast Claw\nat start of expedition": {
      "name": "出撃時の武器の祈祷を「獣の爪」にする"
    },
    "Changes compatible armament's incantation to Dragonfire at start of expedition": {
      "name": "出撃時の武器の祈祷を「竜火」にする"
    },
    "Changes compatible armament's incantation to Dragonfire\nat start of expedition": {
      "name": "出撃時の武器の祈祷を「竜火」にする"
    },
    "Fire Grease in possession at start of expedition": {
      "name": "出撃時に「火脂」を持つ"
    },
    "Fire Grease in possession at start of\nexpedition": {
      "name": "出撃時に「火脂」を持つ"
    },
    "Magic Grease in possession at start of expedition": {
      "name": "出撃時に「魔力脂」を持つ"
    },
    "Magic Grease in possession at start of\nexpedition": {
      "name": "出撃時に「魔力脂」を持つ"
    },
    "Lightning Grease in possession at start of expedition": {
      "name": "出撃時に「雷脂」を持つ"
    },
    "Lightning Grease in possession at start of\nexpedition": {
      "name": "出撃時に「雷脂」を持つ"
    },
    "Holy Grease in possession at start of expedition": {
      "name": "出撃時に「聖脂」を持つ"
    },
    "Holy Grease in possession at start of\nexpedition": {
      "name": "出撃時に「聖脂」を持つ"
    },
    "Shield Grease in possession at start of expedition": {
      "name": "出撃時に「盾脂」を持つ"
    },
    "Shield Grease in possession at start of\nexpedition": {
      "name": "出撃時に「盾脂」を持つ"
    },
    "Fire Pots in possession at start of expedition": {
      "name": "出撃時に「火炎壺」を持つ"
    },
    "Fire Pots in possession at start of\nexpedition": {
      "name": "出撃時に「火炎壺」を持つ"
    },
    "Magic Pots in possession at start of expedition": {
      "name": "出撃時に「魔力壺」を持つ"
    },
    "Magic Pots in possession at start of\nexpedition": {
      "name": "出撃時に「魔力壺」を持つ"
    },
    "Lightning Pots in possession at start of expedition": {
      "name": "出撃時に「雷壺」を持つ"
    },
    "Lightning Pots in possession at start of\nexpedition": {
      "name": "出撃時に「雷壺」を持つ"
    },
    "Holy Water Pots in possession at start of expedition": {
      "name": "出撃時に「聖水壺」を持つ"
    },
    "Holy Water Pots in possession at start of\nexpedition": {
      "name": "出撃時に「聖水壺」を持つ"
    },
    "Crystal Darts in possession at start of expedition": {
      "name": "出撃時に「結晶投げ矢」を持つ"
    },
    "Crystal Darts in possession at start of\nexpedition": {
      "name": "出撃時に「結晶投げ矢」を持つ"
    },
    "Poisonbone Darts in possession at start of expedition": {
      "name": "出撃時に「骨の毒投げ矢」を持つ"
    },
    "Poisonbone Darts in possession at start of\nexpedition": {
      "name": "出撃時に「骨の毒投げ矢」を持つ"
    },
    "Throwing Daggers in possession at start of expedition": {
      "name": "出撃時に「スローイングダガー」を持つ"
    },
    "Throwing Daggers in possession at start of\nexpedition": {
      "name": "出撃時に「スローイングダガー」を持つ"
    },
    "Glintstone Scraps in possession at start of expedition": {
      "name": "出撃時に「屑輝石」を持つ"
    },
    "Glintstone Scraps in possession at start of\nexpedition": {
      "name": "出撃時に「屑輝石」を持つ"
    },
    "Gravity Stone Chunks in possession at start of expedition": {
      "name": "出撃時に「塊の重力石」を持つ"
    },
    "Gravity Stone Chunks in possession at start of\nexpedition": {
      "name": "出撃時に「塊の重力石」を持つ"
    },
    "Starlight Shards in possession at start of expedition": {
      "name": "出撃時に「星光の欠片」を持つ"
    },
    "Starlight Shards in possession at start of\nexpedition": {
      "name": "出撃時に「星光の欠片」を持つ"
    },
    "Bewitching Branches in possession at start of expedition": {
      "name": "出撃時に「誘惑の枝」を持つ"
    },
    "Bewitching Branches in possession at start of\nexpedition": {
      "name": "出撃時に「誘惑の枝」を持つ"
    },
    "Wraith Calling Bell in possession at start of expedition": {
      "name": "出撃時に「呪霊喚びの鈴」を持つ"
    },
    "Wraith Calling Bell in possession at start of\nexpedition": {
      "name": "出撃時に「呪霊喚びの鈴」を持つ"
    },
    "Small Pouch in possession at start of expedition": {
      "name": "出撃時に「小さなポーチ」を持つ"
    },
    "Small Pouch in possession at start of\nexpedition": {
      "name": "出撃時に「小さなポーチ」を持つ"
    },
    "Stonesword Key in possession at start of expedition": {
      "name": "出撃時に「石剣の鍵」を持つ"
    },
    "Stonesword Key in possession at start of\nexpedition": {
      "name": "出撃時に「石剣の鍵」を持つ"
    },
    "Cerulean Crystal Tear in possession at start of expedition": {
      "name": "出撃時に「蒼露の雫」を持つ"
    },
    "Cerulean Crystal Tear in possession at start of\nexpedition": {
      "name": "出撃時に「蒼露の雫」を持つ"
    },
    "Cerulean Hidden Tear in possession at start of expedition": {
      "name": "出撃時に「蒼隠しの雫」を持つ"
    },
    "Cerulean Hidden Tear in possession at start of\nexpedition": {
      "name": "出撃時に「蒼隠しの雫」を持つ"
    },
    "Crimson Crystal Tear in possession at start of expedition": {
      "name": "出撃時に「朱露の雫」を持つ"
    },
    "Crimson Crystal Tear in possession at start of\nexpedition": {
      "name": "出撃時に「朱露の雫」を持つ"
    },
    "Crimson Bubbletear in possession at start of expedition": {
      "name": "出撃時に「朱泡の雫」を持つ"
    },
    "Crimson Bubbletear in possession at start of\nexpedition": {
      "name": "出撃時に「朱泡の雫」を持つ"
    },
    "Crimsonburst Crystal Tear in possession at start of expedition": {
      "name": "出撃時に「朱爆の雫」を持つ"
    },
    "Crimsonburst Crystal Tear in possession at start of\nexpedition": {
      "name": "出撃時に「朱爆の雫」を持つ"
    },
    "Crimsonspill Crystal Tear in possession at start of expedition": {
      "name": "出撃時に「朱噴の雫」を持つ"
    },
    "Crimsonspill Crystal Tear in possession at start of\nexpedition": {
      "name": "出撃時に「朱噴の雫」を持つ"
    },
    "Crimsonwhorl Bubbletear in possession at start of expedition": {
      "name": "出撃時に「朱渦の雫」を持つ"
    },
    "Crimsonwhorl Bubbletear in possession at start of\nexpedition": {
      "name": "出撃時に「朱渦の雫」を持つ"
    },
    "Bloodboil Aromatic in possession at start of expedition": {
      "name": "出撃時に「沸血の賦香」を持つ"
    },
    "Bloodboil Aromatic in possession at start of\nexpedition": {
      "name": "出撃時に「沸血の賦香」を持つ"
    },
    "[Wylder] +1 additional Character Skill use": {
      "name": "【追跡者】スキルの使用回数+1"
    },
    "[Wylder] Art activation spreads fire in area": {
      "name": "【追跡者】アーツ発動時、周囲を延焼"
    },
    "[Wylder] Art gauge greatly filled when ability is\nactivated": {
      "name": "【追跡者】アビリティ発動時、アーツゲージ増加"
    },
    "[Wylder] Character Skill inflicts Blood Loss": {
      "name": "【追跡者】スキル中、出血"
    },
    "[Wylder] Improved Intelligence and Faith, Reduced Strength and Dexterity": {
      "name": "【追跡者】知力・信仰上昇、筋力・技量低下"
    },
    "[Wylder] Improved Mind, Reduced Vigor": {
      "name": "【追跡者】精神力上昇、生命力低下"
    },
    "[Wylder] Standard attacks enhanced with fiery\nfollow-ups when using Character Skill (greatsword only)": {
      "name": "【追跡者】スキル使用時、通常攻撃で炎を纏った追撃（大剣のみ）"
    },
    "[Guardian] Character Skill Boosts Damage Negation of Nearby Allies": {
      "name": "【守護者】スキル使用中、周囲の味方のカット率上昇"
    },
    "[Guardian] Creates whirlwind when charging halberd\nattacks": {
      "name": "【守護者】斧槍タメ攻撃時、つむじ風が発生"
    },
    "[Guardian] Improved Mind and Faith, Reduced Vigor": {
      "name": "【守護者】精神力・信仰上昇、生命力低下"
    },
    "[Guardian] Improved Strength and Dexterity, Reduced Vigor": {
      "name": "【守護者】筋力・技量上昇、生命力低下"
    },
    "[Guardian] Increased duration for Character Skill": {
      "name": "【守護者】スキルの持続時間延長"
    },
    "[Guardian] Slowly restores nearby allies' HP\nwhile Art is active": {
      "name": "【守護者】アーツ発動時、周囲の味方HPを徐々に回復"
    },
    "[Guardian] Successful guards send out shockwaves while\nability is active": {
      "name": "【守護者】アビリティ発動中ガード成功時、衝撃波が発生"
    },
    "[Ironeye] +1 additional Character Skill use": {
      "name": "【鉄の目】スキルの使用回数+1"
    },
    "[Ironeye] Art Charge Activation Adds Poison Effect": {
      "name": "【鉄の目】アーツのタメ発動時、毒の状態異常を付加"
    },
    "[Ironeye] Boosts thrusting counterattacks after executing Art": {
      "name": "【鉄の目】アーツ発動後、刺突カウンター強化"
    },
    "[Ironeye] Character Skill Inflicts Heavy Poison Damage on Poisoned Enemies": {
      "name": "【鉄の目】スキルが毒付着時、強力な毒ダメージを与える"
    },
    "[Ironeye] Extends duration of weak point": {
      "name": "【鉄の目】弱点の持続時間を延長させる"
    },
    "[Ironeye] Improved Arcane, Reduced Dexterity": {
      "name": "【鉄の目】神秘上昇、技量低下"
    },
    "[Ironeye] Improved Vigor and Strength, Reduced Dexterity": {
      "name": "【鉄の目】生命力・筋力上昇、技量低下"
    },
    "[Raider] Damage taken while using Character Skill\nimproves attack power and stamina": {
      "name": "【無頼漢】スキル中に攻撃を受けると攻撃力と最大スタミナ上昇"
    },
    "[Raider] Duration of Ultimate Art extended": {
      "name": "【無頼漢】アーツの効果時間延長"
    },
    "[Raider] Hit With Character Skill to Reduce Enemy Attack Power": {
      "name": "【無頼漢】スキル命中時、敵の攻撃力低下"
    },
    "[Raider] Improved Arcane, Reduced Vigor": {
      "name": "【無頼漢】神秘上昇、生命力低下"
    },
    "[Raider] Improved Mind and Intelligence, Reduced Vigor and Endurance": {
      "name": "【無頼漢】精神力・知力上昇、生命力・持久力低下"
    },
    "[Recluse] Activating Ultimate Art raises Max HP": {
      "name": "【隠者】アーツ発動時、最大HP上昇"
    },
    "[Recluse] Collect Affinity Residues to Negate Affinity": {
      "name": "【隠者】属性痕収集で属性を無効化"
    },
    "[Recluse] Collecting affinity residue activates\nTerra Magica": {
      "name": "【隠者】属性痕を集めた時、「魔術の地」が発動"
    },
    "[Recluse] Improved Intelligence and Faith, Reduced Mind": {
      "name": "【隠者】知力・信仰上昇、精神力低下"
    },
    "[Recluse] Improved Vigor, Endurance, and Dexterity, Reduced Intelligence and Faith": {
      "name": "【隠者】生命力・持久力・技量上昇、知力・信仰低下"
    },
    "[Recluse] Suffer blood loss and increase attack\npower upon Art activation": {
      "name": "【隠者】アーツ発動時、自身が出血状態になり、攻撃力上昇"
    },
    "[Revenant] Expend own HP to fully heal nearby allies\nwhen activating Art": {
      "name": "【復讐者】アーツ発動時、自身のHPと引き換えに周囲の味方のHPを全回復"
    },
    "[Revenant] Improved Strength, Reduced Faith": {
      "name": "【復讐者】筋力上昇、信仰低下"
    },
    "[Revenant] Improved Vigor and Endurance, Reduced Mind": {
      "name": "【復讐者】生命力・持久力上昇、精神力低下"
    },
    "[Revenant] Increased Max FP upon Ability Activation": {
      "name": "【復讐者】アビリティ発動時、最大FP上昇"
    },
    "[Revenant] Power up while fighting alongside family": {
      "name": "【復讐者】ファミリーと共闘中の間、自身を強化"
    },
    "[Revenant] Strengthens family and allies when Ultimate Art is activated": {
      "name": "【復讐者】アーツ発動時、ファミリーと味方を強化"
    },
    "[Revenant] Trigger ghostflame explosion during\nUltimate Art activation": {
      "name": "【復讐者】アーツ発動時、霊炎の爆発を発生"
    },
    "[Duchess] Become difficult to spot and silence\nfootsteps after landing critical from behind": {
      "name": "【レディ】背後からの致命の一撃後、自身の姿を見え難くし、足音を消す"
    },
    "[Duchess] Defeating enemies while Art is active ups\nattack power": {
      "name": "【レディ】アーツ発動中、敵撃破で攻撃力上昇"
    },
    "[Duchess] Improved Character Skill Attack Power": {
      "name": "【レディ】スキルのダメージ上昇"
    },
    "[Duchess] Improved Mind and Faith, Reduced Intelligence": {
      "name": "【レディ】精神力・信仰上昇、知力低下"
    },
    "[Duchess] Improved Vigor and Strength, Reduced Mind": {
      "name": "【レディ】生命力・筋力上昇、精神力低下"
    },
    "[Duchess] Successive dagger attack reprises event upon\nnearby enemies": {
      "name": "【レディ】短剣による攻撃連続時、周囲の敵に直近の出来事を再演"
    },
    "[Duchess] Use Character Skill for Brief Invulnerability": {
      "name": "【レディ】スキル使用時、一瞬無敵"
    },
    "[Executor] Character Skill Boosts Attack but Attacking Drains HP": {
      "name": "【執行者】スキル中の攻撃力上昇、攻撃時にHP減少"
    },
    "[Executor] Improved Dexterity and Arcane, Reduced Vigor": {
      "name": "【執行者】技量・神秘上昇、生命力低下"
    },
    "[Executor] Improved Vigor and Endurance, Reduced Arcane": {
      "name": "【執行者】生命力・持久力上昇、神秘低下"
    },
    "[Executor] Roaring restores HP while Art is active": {
      "name": "【執行者】アーツ発動中、咆哮でHP回復"
    },
    "[Executor] Slowly Restore HP upon Ability Activation": {
      "name": "【執行者】アビリティ発動時、徐々にHP回復"
    },
    "[Executor] While Character Skill is active,\nunlocking use of cursed sword restores HP": {
      "name": "【執行者】スキル中、妖刀が解放状態になるとHP回復"
    },
    "[Scholar] Allies targeted by Character Skill gain boosted attack": {
      "name": "【学者】スキル使用時、対象の味方の攻撃力上昇"
    },
    "[Scholar] Continuous damage inflicted on targets threaded by Ultimate Art": {
      "name": "【学者】アーツでリンクした敵対象に、継続ダメージ"
    },
    "[Scholar] Earn runes for each additional specimen acquired with Character Skill": {
      "name": "【学者】スキルによる標本が増える度、ルーンを取得"
    },
    "[Scholar] Prevent slowing of Character Skill progress": {
      "name": "【学者】スキルの進捗率の低下を抑制"
    },
    "[Undertaker] Activating Ultimate Art increases attack power": {
      "name": "【葬儀屋】アーツ発動時、攻撃力上昇"
    },
    "[Undertaker] Attack power increased by landing the final blow of a chain attack": {
      "name": "【葬儀屋】連撃の最終攻撃命中時、攻撃力上昇"
    },
    "[Undertaker] Contact with allies restores their HP while Ultimate Art is activated": {
      "name": "【葬儀屋】アーツ発動時、触れた味方のHP回復"
    },
    "[Undertaker] Physical attacks boosted while assist effect from incantation is active for self": {
      "name": "【葬儀屋】祈祷で自身に補助効果発生時、物理攻撃力上昇"
    },
    "All Resistances Down": {
      "name": "全耐性低下"
    },
    "Continuous HP Loss": {
      "name": "HP持続減少"
    },
    "Lower Attack When Below Max HP": {
      "name": "HP満タン以外で攻撃力低下"
    },
    "Near Death Reduces Max HP": {
      "name": "瀕死時、最大HP低下"
    },
    "Poison Buildup When Below Max HP": {
      "name": "HP満タン以外で毒の蓄積"
    },
    "Reduced Damage Negation After Evading": {
      "name": "回避直後、カット率低下"
    },
    "Reduced Damage Negation for Flask Usages": {
      "name": "聖杯瓶使用中、カット率低下"
    },
    "Reduced Dexterity and Faith": {
      "name": "技量と信仰が低下"
    },
    "Reduced Faith and Strength": {
      "name": "信仰と筋力が低下"
    },
    "Reduced Flask HP Restoration": {
      "name": "聖杯瓶の回復量低下"
    },
    "Reduced Intelligence and Dexterity": {
      "name": "知力と技量が低下"
    },
    "Reduced Rune Acquisition": {
      "name": "取得ルーン減少"
    },
    "Reduced Strength and Intelligence": {
      "name": "筋力と知力が低下"
    },
    "Reduced Vigor and Arcane": {
      "name": "生命力と神秘が低下"
    },
    "Repeated Evasions Lower Damage Negation": {
      "name": "連続回避でカット率低下"
    },
    "Rot Buildup When Below Max HP": {
      "name": "HP満タン以外で腐敗の蓄積"
    },
    "Taking Damage Causes Blood Loss Buildup": {
      "name": "被ダメージ時、出血の状態異常を付加"
    },
    "Taking Damage Causes Death Buildup": {
      "name": "被ダメージ時、死の状態異常を付加"
    },
    "Taking Damage Causes Frost Buildup": {
      "name": "被ダメージ時、冷気の状態異常を付加"
    },
    "Taking Damage Causes Madness Buildup": {
      "name": "被ダメージ時、発狂の状態異常を付加"
    },
    "Taking Damage Causes Poison Buildup": {
      "name": "被ダメージ時、毒の状態異常を付加"
    },
    "Taking Damage Causes Rot Buildup": {
      "name": "被ダメージ時、腐敗の状態異常を付加"
    },
    "Taking Damage Causes Sleep Buildup": {
      "name": "被ダメージ時、睡眠の状態異常を付加"
    },
    "Ultimate Art Charging Impaired": {
      "name": "アーツゲージ蓄積鈍化"
    },
    "Arcane increased for each great enemy defeated at a Ruin": {
      "name": "遺跡ボス撃破ごとに神秘上昇"
    },
    "Attack power increased for each Night Invader defeated": {
      "name": "夜の侵略者撃破ごとに攻撃力上昇"
    },
    "Attack power increased for each evergaol prisoner defeated": {
      "name": "封牢の囚撃破ごとに攻撃力上昇"
    },
    "Attack power up when facing frostbite-afflicted\nenemy": {
      "name": "冷気付着時の攻撃力上昇"
    },
    "Attack power up when facing frostbite-afflicted enemy": {
      "name": "冷気付着時の攻撃力上昇"
    },
    "Attack power up when facing frostbite-afflicted enemy +1": {
      "name": "冷気付着時の攻撃力上昇+1"
    },
    "Attack power up when facing frostbite-afflicted enemy +2": {
      "name": "冷気付着時の攻撃力上昇+2"
    },
    "Attack power up when facing scarlet rot-afflicted\nenemy": {
      "name": "腐敗付着時の攻撃力上昇"
    },
    "Attack power up when facing scarlet rot-afflicted enemy": {
      "name": "腐敗付着時の攻撃力上昇"
    },
    "Attack power up when facing scarlet rot-afflicted enemy +1": {
      "name": "腐敗付着時の攻撃力上昇+1"
    },
    "Attack power up when facing scarlet rot-afflicted enemy +2": {
      "name": "腐敗付着時の攻撃力上昇+2"
    },
    "Attack power up when facing poison-afflicted enemy": {
      "name": "毒付着時の攻撃力上昇"
    },
    "Attack power up when facing poison-afflicted enemy +1": {
      "name": "毒付着時の攻撃力上昇+1"
    },
    "Attack power up when facing poison-afflicted enemy +2": {
      "name": "毒付着時の攻撃力上昇+2"
    },
    "Character Skill Cooldown Reduction +1": {
      "name": "スキルクールタイム軽減+1"
    },
    "Character Skill Cooldown Reduction +2": {
      "name": "スキルクールタイム軽減+2"
    },
    "Character Skill Cooldown Reduction +3": {
      "name": "スキルクールタイム軽減+3"
    },
    "Critical Hit Boosts Stamina Recovery Speed": {
      "name": "致命の一撃でスタミナ回復速度上昇"
    },
    "Critical Hit Boosts Stamina Recovery Speed +1": {
      "name": "致命の一撃でスタミナ回復速度上昇+1"
    },
    "Critical Hits Earn Runes": {
      "name": "致命の一撃でルーン取得"
    },
    "Critical hits fill more of the Art gauge": {
      "name": "致命の一撃でアーツゲージ増加"
    },
    "Critical hits fill more of the Art gauge +1": {
      "name": "致命の一撃でアーツゲージ増加+1"
    },
    "Defeating enemies fills more of the Art gauge": {
      "name": "敵撃破時、アーツゲージ増加"
    },
    "Defeating enemies fills more of the Art gauge +1": {
      "name": "敵撃破時、アーツゲージ増加+1"
    },
    "Defeating enemies near Totem Stela restores HP": {
      "name": "トーテム碑付近の敵撃破時、HP回復"
    },
    "Defeating enemies restores HP for allies but not for\nself": {
      "name": "敵撃破時、味方のみHP回復"
    },
    "HP Restoration upon Thrusting Counterattack": {
      "name": "刺突カウンターでHP回復"
    },
    "HP restored when using medicinal boluses, etc.": {
      "name": "薬剤使用時にHP回復"
    },
    "HP restored when using medicinal boluses, etc. +1": {
      "name": "薬剤使用時にHP回復+1"
    },
    "Improved Affinity Damage Negation": {
      "name": "属性カット率上昇"
    },
    "Improved Blood Loss Resistance": {
      "name": "出血耐性上昇"
    },
    "Improved Damage Negation at Low HP": {
      "name": "HP低下時、カット率上昇"
    },
    "Improved Damage Negation at Low HP by Damage": {
      "name": "被ダメージ時HP低下でカット率上昇"
    },
    "Improved Death Blight Resistance": {
      "name": "抗死耐性上昇"
    },
    "Improved Flask HP Restoration": {
      "name": "聖杯瓶の回復量上昇"
    },
    "Improved Frost Resistance": {
      "name": "冷気耐性上昇"
    },
    "Improved Glintstone and Gravity Stone Damage": {
      "name": "輝石・重力石ダメージ上昇"
    },
    "Improved Lightning Damage Negation": {
      "name": "雷カット率上昇"
    },
    "Improved Madness Resistance": {
      "name": "発狂耐性上昇"
    },
    "Improved Magic Damage Negation": {
      "name": "魔力カット率上昇"
    },
    "Improved Perfuming Arts": {
      "name": "調香術強化"
    },
    "Improved Physical Damage Negation": {
      "name": "物理カット率上昇"
    },
    "Improved Poise & Damage Negation When Knocked Back\nby Damage": {
      "name": "吹き飛ばし時、強靭度とカット率上昇"
    },
    "Improved Poise Near Totem Stela": {
      "name": "トーテム碑付近で強靭度上昇"
    },
    "Improved Poison Resistance": {
      "name": "毒耐性上昇"
    },
    "Improved Rot Resistance": {
      "name": "腐敗耐性上昇"
    },
    "Improved Sleep Resistance": {
      "name": "睡眠耐性上昇"
    },
    "Improved Throwing Knife Damage": {
      "name": "投げ短剣ダメージ上昇"
    },
    "Improved Throwing Pot Damage": {
      "name": "投げ壺ダメージ上昇"
    },
    "Increased Maximum FP": {
      "name": "最大FP上昇"
    },
    "Increased Maximum FP +1": {
      "name": "最大FP上昇+1"
    },
    "Increased Maximum HP": {
      "name": "最大HP上昇"
    },
    "Increased Maximum HP +1": {
      "name": "最大HP上昇+1"
    },
    "Increased Maximum Stamina": {
      "name": "最大スタミナ上昇"
    },
    "Increased Maximum Stamina +1": {
      "name": "最大スタミナ上昇+1"
    },
    "Increased rune acquisition for self and allies": {
      "name": "自身と味方のルーン取得量増加"
    },
    "Items confer effect to all nearby allies": {
      "name": "アイテム効果が周囲の味方にも付与"
    },
    "Fire Damage Negation Up": {
      "name": "炎カット率上昇"
    },
    "Lightning Damage Negation Up": {
      "name": "雷カット率上昇"
    },
    "Magic Damage Negation Up": {
      "name": "魔力カット率上昇"
    },
    "Holy Damage Negation Up": {
      "name": "聖カット率上昇"
    },
    "Max FP increased for each Sorcerer's Rise unlocked": {
      "name": "魔術師の塔解放ごとに最大FP上昇"
    },
    "Max FP with 3+ Staves / Seals": {
      "name": "杖/聖印3本以上装備時、最大FP上昇"
    },
    "Max HP per Great Church Boss": {
      "name": "大教会ボス撃破ごとに最大HP上昇"
    },
    "Max HP with 3+ Shields": {
      "name": "盾3本以上装備時、最大HP上昇"
    },
    "Max Stamina per Camp Boss": {
      "name": "野営地ボス撃破ごとに最大スタミナ上昇"
    },
    "Partial HP Restoration upon Post-Damage Attacks": {
      "name": "被ダメージ後の攻撃でHP一部回復"
    },
    "Raised Stamina Recovery for Nearby Allies": {
      "name": "周囲の味方のスタミナ回復速度上昇"
    },
    "Raised stamina recovery for nearby allies, but not\nfor self": {
      "name": "自身を除く周囲の味方のスタミナ回復速度上昇"
    },
    "Reduced FP Consumption": {
      "name": "FP消費軽減"
    },
    "Rune discount for shop purchases while on expedition": {
      "name": "探索中、店のルーン割引"
    },
    "Runes & Discovery per Fort Boss": {
      "name": "砦ボス撃破ごとにルーン・発見力上昇"
    },
    "Slowly Restore HP When HP Is Low": {
      "name": "HP低下時、徐々にHP回復"
    },
    "Slowly restore HP for self and nearby allies when HP\nis low": {
      "name": "HP低下時、自身と周囲の味方も徐々にHP回復"
    },
    "Stamina Recovery upon Landing Attacks": {
      "name": "攻撃命中時にスタミナ回復"
    },
    "Successful guarding fills more of the Art gauge": {
      "name": "ガード成功時、アーツゲージ増加"
    },
    "Treasure marked upon map": {
      "name": "マップに宝が表示される"
    },
    "Ultimate Art Auto Charge": {
      "name": "アーツゲージ自然蓄積"
    },
    "Physical Attack Up": {
      "name": "物理攻撃力上昇"
    },
    "Physical Attack Up +1": {
      "name": "物理攻撃力上昇+1"
    },
    "Physical Attack Up +2": {
      "name": "物理攻撃力上昇+2"
    },
    "Changes compatible armament's skill to Glintblade\nPhalanx at start of expedition": {
      "name": "出撃時の武器の戦技を「輝剣ファランクス」にする"
    },
    "Changes compatible armament's skill to Gravitas at\nstart of expedition": {
      "name": "出撃時の武器の戦技を「グラビタス」にする"
    },
    "Changes compatible armament's skill to Flaming\nStrike at start of expedition": {
      "name": "出撃時の武器の戦技を「炎撃」にする"
    },
    "Changes compatible armament's skill to\nEruption at start of expedition": {
      "name": "出撃時の武器の戦技を「噴火」にする"
    },
    "Changes compatible armament's skill to Lightning\nSlash at start of expedition": {
      "name": "出撃時の武器の戦技を「雷撃斬」にする"
    },
    "Changes compatible armament's skill to Prayerful\nStrike at start of expedition": {
      "name": "出撃時の武器の戦技を「祈りの打撃」にする"
    },
    "Changes compatible armament's skill to Poisonous\nMist at start of expedition": {
      "name": "出撃時の武器の戦技を「毒の霧」にする"
    },
    "Changes compatible armament's skill to Poison Moth\nFlight at start of expedition": {
      "name": "出撃時の武器の戦技を「毒蛾の飛翔」にする"
    },
    "Changes compatible armament's skill to Seppuku at\nstart of expedition": {
      "name": "出撃時の武器の戦技を「切腹」にする"
    },
    "Changes compatible armament's skill to Hoarfrost\nStomp at start of expedition": {
      "name": "出撃時の武器の戦技を「霜踏み」にする"
    },
    "Changes compatible armament's skill to White\nShadow's Lure at start of expedition": {
      "name": "出撃時の武器の戦技を「白影の誘引」にする"
    },
    "Changes compatible armament's skill to Endure at\nstart of expedition": {
      "name": "出撃時の武器の戦技を「耐え」にする"
    },
    "Changes compatible armament's skill to Quickstep at\nstart of expedition": {
      "name": "出撃時の武器の戦技を「クイックステップ」にする"
    },
    "Changes compatible armament's skill to Rain of\nArrows at start of expedition": {
      "name": "出撃時の武器の戦技を「矢の雨」にする"
    },
    "Changes compatible armament's sorcery to Magic\nGlintblade at start of expedition": {
      "name": "出撃時の武器の魔術を「魔術の輝剣」にする"
    },
    "Changes compatible armament's sorcery to Carian\nGreatsword at start of expedition": {
      "name": "出撃時の武器の魔術を「カーリアの大剣」にする"
    },
    "Changes compatible armament's sorcery to Night\nShard at start of expedition": {
      "name": "出撃時の武器の魔術を「夜のかけら」にする"
    },
    "Changes compatible armament's sorcery to Magma\nShot at start of expedition": {
      "name": "出撃時の武器の魔術を「マグマ弾」にする"
    },
    "Changes compatible armament's sorcery to Briars of\nPunishment at start of expedition": {
      "name": "出撃時の武器の魔術を「棘の罰」にする"
    },
    "Changes compatible armament's incantation to\nWrath of Gold at start of expedition": {
      "name": "出撃時の武器の祈祷を「黄金の怒り」にする"
    },
    "Changes compatible armament's incantation to\nLightning Spear at start of expedition": {
      "name": "出撃時の武器の祈祷を「雷の槍」にする"
    },
    "Changes compatible armament's incantation to\nO, Flame! at start of expedition": {
      "name": "出撃時の武器の祈祷を「おお、炎よ！」にする"
    },
    "Changes compatible armament's incantation to\nBeast Claw at start of expedition": {
      "name": "出撃時の武器の祈祷を「獣の爪」にする"
    },
    "Changes compatible armament's incantation to\nDragonfire at start of expedition": {
      "name": "出撃時の武器の祈祷を「竜火」にする"
    },
    "Acid Spraymist in possession at start of expedition": {
      "name": "出撃時に「酸の噴霧」を持つ"
    },
    "Dormant Power Helps Discover Katana": {
      "name": "潜在する力から、刀を見つけやすくなる"
    },
    "Dormant Power Helps Discover Medium Shields": {
      "name": "潜在する力から、中盾を見つけやすくなる"
    },
    "Dormant Power Helps Discover Sacred Seals": {
      "name": "潜在する力から、聖印を見つけやすくなる"
    },
    "Dormant Power Helps Discover Small Shields": {
      "name": "潜在する力から、小盾を見つけやすくなる"
    },
    "Dormant Power Helps Discover Staves": {
      "name": "潜在する力から、杖を見つけやすくなる"
    },
    "Dormant Power Helps Discover Thrusting Swords": {
      "name": "潜在する力から、刺剣を見つけやすくなる"
    },
    "Dormant Power Helps Discover Twinblades": {
      "name": "潜在する力から、両刃剣を見つけやすくなる"
    },
    "Dormant Power Helps Discover Whips": {
      "name": "潜在する力から、鞭を見つけやすくなる"
    },
    "Draw enemy attention while guarding": {
      "name": "ガード中、敵に狙われやすくなる"
    },
    "Fire Attack Power Up +3": {
      "name": "炎攻撃力上昇＋３"
    },
    "Fire Attack Power Up +4": {
      "name": "炎攻撃力上昇＋４"
    },
    "Flame-Shrouding Cracked Tear in possession at start of expedition": {
      "name": "出撃時に「炎纏いの割れ雫」を持つ"
    },
    "Flask Also Heals Allies": {
      "name": "聖杯瓶の回復を、周囲の味方に分配"
    },
    "Greenburst Crystal Tear in possession at start of expedition": {
      "name": "出撃時に「緑湧きの結晶雫」を持つ"
    },
    "Greenspill Crystal Tear in possession at start of expedition": {
      "name": "出撃時に「緑溢れの結晶雫」を持つ"
    },
    "Guard counter is given a boost based on current HP": {
      "name": "ガードカウンターに、自身の現在ＨＰの一部を加える"
    },
    "HP Restoration upon Thrusting Counterattack +1": {
      "name": "刺突カウンター発生時、ＨＰ回復＋１"
    },
    "Holy Attack Power Up +3": {
      "name": "聖攻撃力上昇＋３"
    },
    "Holy Attack Power Up +4": {
      "name": "聖攻撃力上昇＋４"
    },
    "Holy-Shrouding Cracked Tear in possession at start of expedition": {
      "name": "出撃時に「聖纏いの割れ雫」を持つ"
    },
    "Improved Affinity Attack Power": {
      "name": "属性攻撃力上昇"
    },
    "Improved Affinity Attack Power +1": {
      "name": "属性攻撃力上昇＋１"
    },
    "Improved Affinity Attack Power +2": {
      "name": "属性攻撃力上昇＋２"
    },
    "Improved Affinity Damage Negation +1": {
      "name": "属性カット率上昇＋１"
    },
    "Improved Affinity Damage Negation +2": {
      "name": "属性カット率上昇＋２"
    },
    "Improved Attack Power with 3+ Katana Equipped": {
      "name": "刀の武器種を３つ以上装備していると攻撃力上昇"
    },
    "Improved Attack Power with 3+ Thrusting Swords Equipped": {
      "name": "刺剣の武器種を３つ以上装備していると攻撃力上昇"
    },
    "Improved Attack Power with 3+ Twinblades Equipped": {
      "name": "両刃剣の武器種を３つ以上装備していると攻撃力上昇"
    },
    "Improved Attack Power with 3+ Whips Equipped": {
      "name": "鞭の武器種を３つ以上装備していると攻撃力上昇"
    },
    "Improved Bestial Incantations": {
      "name": "獣の祈祷を強化"
    },
    "Improved Blood Loss Resistance +1": {
      "name": "出血耐性上昇＋１"
    },
    "Improved Carian Sword Sorcery": {
      "name": "カーリアの剣の魔術を強化"
    },
    "Improved Critical Hits": {
      "name": "致命の一撃強化"
    },
    "Improved Crystalian sorcery": {
      "name": "結晶人の魔術を強化"
    },
    "Improved Death Blight Resistance +1": {
      "name": "抗死耐性上昇＋１"
    },
    "Improved Dragon Communion Incantations": {
      "name": "竜餐の祈祷を強化"
    },
    "Improved Dragon Cult Incantations": {
      "name": "王都古竜信仰の祈祷を強化"
    },
    "Improved Fire Damage Negation +1": {
      "name": "炎カット率上昇＋１"
    },
    "Improved Fire Damage Negation +2": {
      "name": "炎カット率上昇＋２"
    },
    "Improved Frenzied Flame Incantations": {
      "name": "狂い火の祈祷を強化"
    },
    "Improved Frost Resistance +1": {
      "name": "冷気耐性上昇＋１"
    },
    "Improved Fundamentalist Incantations": {
      "name": "黄金律原理主義の祈祷を強化"
    },
    "Improved Giants' Flame Incantations": {
      "name": "巨人の火の祈祷を強化"
    },
    "Improved Glintblade Sorcery": {
      "name": "輝剣の魔術を強化"
    },
    "Improved Glintstone and Gravity Stone Damage +1": {
      "name": "輝石、重力石アイテムの攻撃力上昇＋１"
    },
    "Improved Godslayer Incantations": {
      "name": "神狩りの祈祷を強化"
    },
    "Improved Gravity Sorcery": {
      "name": "重力の魔術を強化"
    },
    "Improved Guard Counters": {
      "name": "ガードカウンター強化"
    },
    "Improved Guard Counters +1": {
      "name": "ガードカウンター強化＋１"
    },
    "Improved Guard Counters +2": {
      "name": "ガードカウンター強化＋２"
    },
    "Improved Holy Damage Negation +1": {
      "name": "聖カット率上昇＋１"
    },
    "Improved Holy Damage Negation +2": {
      "name": "聖カット率上昇＋２"
    },
    "Improved Incantations": {
      "name": "祈祷強化"
    },
    "Improved Incantations +1": {
      "name": "祈祷強化＋１"
    },
    "Improved Incantations +2": {
      "name": "祈祷強化＋２"
    },
    "Improved Initial Standard Attack": {
      "name": "通常攻撃の１段目強化"
    },
    "Improved Invisibility Sorcery": {
      "name": "不可視の魔術を強化"
    },
    "Improved Lightning Damage Negation +1": {
      "name": "雷カット率上昇＋１"
    },
    "Improved Lightning Damage Negation +2": {
      "name": "雷カット率上昇＋２"
    },
    "Improved Madness Resistance +1": {
      "name": "発狂耐性上昇＋１"
    },
    "Improved Magic Damage Negation +1": {
      "name": "魔力カット率上昇＋１"
    },
    "Improved Magic Damage Negation +2": {
      "name": "魔力カット率上昇＋２"
    },
    "Improved Perfuming Arts +1": {
      "name": "調香術強化＋１"
    },
    "Improved Physical Damage Negation +1": {
      "name": "物理カット率上昇＋１"
    },
    "Improved Physical Damage Negation +2": {
      "name": "物理カット率上昇＋２"
    },
    "Improved Poison Resistance +1": {
      "name": "毒耐性上昇＋１"
    },
    "Improved Rot Resistance +1": {
      "name": "腐敗耐性上昇＋１"
    },
    "Improved Sleep Resistance +1": {
      "name": "睡眠耐性上昇＋１"
    },
    "Improved Sorceries": {
      "name": "魔術強化"
    },
    "Improved Sorceries +1": {
      "name": "魔術強化＋１"
    },
    "Improved Sorceries +2": {
      "name": "魔術強化＋２"
    },
    "Improved Stonedigger Sorcery": {
      "name": "石掘りの魔術を強化"
    },
    "Improved Thorn Sorcery": {
      "name": "茨の魔術を強化"
    },
    "Improved Throwing Knife Damage +1": {
      "name": "投擲ナイフの攻撃力上昇＋１"
    },
    "Improved Throwing Pot Damage +1": {
      "name": "投擲壺の攻撃力上昇＋１"
    },
    "Ironjar Aromatic in possession at start of expedition": {
      "name": "出撃時に「鉄壺の香薬」を持つ"
    },
    "Leaden Hardtear in possession at start of expedition": {
      "name": "出撃時に「鉛色の硬雫」を持つ"
    },
    "Lightning Attack Power Up +3": {
      "name": "雷攻撃力上昇＋３"
    },
    "Lightning Attack Power Up +4": {
      "name": "雷攻撃力上昇＋４"
    },
    "Lightning-Shrouding Cracked Tear in possession at start of expedition": {
      "name": "出撃時に「雷纏いの割れ雫」を持つ"
    },
    "Madness in Vicinity Improves Attack Power": {
      "name": "周囲で発狂状態の発生時、攻撃力上昇"
    },
    "Madness in Vicinity Improves Attack Power +1": {
      "name": "周囲で発狂状態の発生時、攻撃力上昇＋１"
    },
    "Magic Attack Power Up +3": {
      "name": "魔力攻撃力上昇＋３"
    },
    "Magic Attack Power Up +4": {
      "name": "魔力攻撃力上昇＋４"
    },
    "Magic-Shrouding Cracked Tear in possession at start of expedition": {
      "name": "出撃時に「魔力纏いの割れ雫」を持つ"
    },
    "Max FP Up with 3+ Sacred Seals Equipped": {
      "name": "聖印の武器種を３つ以上装備していると最大ＦＰ上昇"
    },
    "Max FP Up with 3+ Staves Equipped": {
      "name": "杖の武器種を３つ以上装備していると最大ＦＰ上昇"
    },
    "Max HP Up with 3+ Greatshields Equipped": {
      "name": "大盾の武器種を３つ以上装備していると最大ＨＰ上昇"
    },
    "Max HP Up with 3+ Medium Shields Equipped": {
      "name": "中盾の武器種を３つ以上装備していると最大ＨＰ上昇"
    },
    "Max HP Up with 3+ Small Shields Equipped": {
      "name": "小盾の武器種を３つ以上装備していると最大ＨＰ上昇"
    },
    "Max HP increased for each great enemy defeated at a Great Church.": {
      "name": "大教会の強敵を倒す度、最大ＨＰ上昇"
    },
    "Max stamina increased for each great enemy defeated at a Great Encampment": {
      "name": "大野営地の強敵を倒す度、最大スタミナ上昇"
    },
    "Opaline Bubbletear in possession at start of expedition": {
      "name": "出撃時に「真珠色の泡雫」を持つ"
    },
    "Opaline Hardtear in possession at start of expedition": {
      "name": "出撃時に「真珠色の硬雫」を持つ"
    },
    "Partial HP Restoration upon Post-Damage Attacks +1": {
      "name": "ダメージを受けた直後、攻撃によりＨＰの一部を回復＋１"
    },
    "Partial HP Restoration upon Post-Damage Attacks +2": {
      "name": "ダメージを受けた直後、攻撃によりＨＰの一部を回復＋２"
    },
    "Physical Attack Up +3": {
      "name": "物理攻撃力上昇＋３"
    },
    "Physical Attack Up +4": {
      "name": "物理攻撃力上昇＋４"
    },
    "Physical attack power increases after using grease items": {
      "name": "脂アイテム使用時、追加で物理攻撃力上昇"
    },
    "Physical attack power increases after using grease items +1": {
      "name": "脂アイテム使用時、追加で物理攻撃力上昇＋１"
    },
    "Physical attack power increases after using grease items +2": {
      "name": "脂アイテム使用時、追加で物理攻撃力上昇＋２"
    },
    "Poison Spraymist in possession at start of expedition": {
      "name": "出撃時に「毒の噴霧」を持つ"
    },
    "Raised stamina recovery for nearby allies, but not for self": {
      "name": "自身を除く、周囲の味方のスタミナ回復速度上昇"
    },
    "Runes and Item Discovery increased for each great enemy defeated at a Fort": {
      "name": "小砦の強敵を倒す度、取得ルーン増加、発見力上昇"
    },
    "Ruptured Crystal Tear in possession at start of expedition": {
      "name": "出撃時に「破裂した結晶雫」を持つ"
    },
    "Sleep in Vicinity Improves Attack Power": {
      "name": "周囲で睡眠状態の発生時、攻撃力上昇"
    },
    "Sleep in Vicinity Improves Attack Power +1": {
      "name": "周囲で睡眠状態の発生時、攻撃力上昇＋１"
    },
    "Slowly restore HP for self and nearby allies when HP is low": {
      "name": "ＨＰ低下時、周囲の味方を含めＨＰをゆっくりと回復"
    },
    "Spark Aromatic in possession at start of expedition": {
      "name": "出撃時に「火花の香り」を持つ"
    },
    "Speckled Hardtear in possession at start of expedition": {
      "name": "出撃時に「斑彩色の硬雫」を持つ"
    },
    "Spiked Cracked Tear in possession at start of expedition": {
      "name": "出撃時に「大棘の割れ雫」を持つ"
    },
    "Starting armament deals fire damage": {
      "name": "出撃時の武器に炎攻撃力を付加"
    },
    "Starting armament deals holy damage": {
      "name": "出撃時の武器に聖攻撃力を付加"
    },
    "Starting armament deals lightning damage": {
      "name": "出撃時の武器に雷攻撃力を付加"
    },
    "Starting armament deals magic damage": {
      "name": "出撃時の武器に魔力攻撃力を付加"
    },
    "Starting armament inflicts blood loss": {
      "name": "出撃時の武器に出血の状態異常を付加"
    },
    "Starting armament inflicts frost": {
      "name": "出撃時の武器に冷気の状態異常を付加"
    },
    "Starting armament inflicts poison": {
      "name": "出撃時の武器に毒の状態異常を付加"
    },
    "Stonebarb Cracked Tear in possession at start of expedition": {
      "name": "出撃時に「岩棘の割れ雫」を持つ"
    },
    "Successful guarding fills more of the Art gauge +1": {
      "name": "ガード成功時、アーツゲージ増加＋１"
    },
    "Taking attacks improves attack power": {
      "name": "攻撃を受けると攻撃力上昇"
    },
    "Thorny Cracked Tear in possession at start of expedition": {
      "name": "出撃時に「連棘の割れ雫」を持つ"
    },
    "Twiggy Cracked Tear in possession at start of expedition": {
      "name": "出撃時に「細枝の割れ雫」を持つ"
    },
    "Ultimate Art Auto Charge +1": {
      "name": "アーツゲージ自然蓄積＋１"
    },
    "Ultimate Art Auto Charge +2": {
      "name": "アーツゲージ自然蓄積＋２"
    },
    "Ultimate Art Auto Charge +3": {
      "name": "アーツゲージ自然蓄積＋３"
    },
    "Uplifting Aromatic in possession at start of expedition": {
      "name": "出撃時に「高揚の香り」を持つ"
    },
    "Windy Crystal Tear in possession at start of expedition": {
      "name": "出撃時に「風の結晶雫」を持つ"
    }
  },
  "groups": {
    "Vigor": "生命力",
    "Mind": "精神力",
    "Endurance": "持久力",
    "Strength": "筋力",
    "Dexterity": "技量",
    "Intelligence": "知力",
    "Faith": "信仰",
    "Arcane": "神秘",
    "Poise": "強靭度",
    "Arcane per Ruin Boss": "遺跡ボス撃破ごとに神秘上昇",
    "Attack Power": "攻撃力",
    "Attack Power vs Frostbite-Afflicted Enemy": "冷気付着敵への攻撃力上昇",
    "Attack Power vs Poison / Rot Afflicted": "毒/腐敗付着敵への攻撃力上昇",
    "Attack power up when facing frostbite-afflicted\nenemy": "冷気付着時の攻撃力上昇",
    "Bewitching Branches in possession at start of\nexpedition": "出撃時に「誘惑の枝」を持つ",
    "Character Ability": "キャラアビリティ",
    "Character Skill Cooldown Reduction": "スキルクールタイム軽減",
    "Critical Hit Boosts Stamina Recovery Speed": "致命の一撃でスタミナ回復速度上昇",
    "Critical Hits Earn Runes": "致命の一撃でルーン取得",
    "Critical hits fill more of the Art gauge": "致命の一撃でアーツゲージ増加",
    "Crystal Darts in possession at start of expedition": "出撃時に「結晶投げ矢」を持つ",
    "Defeating Enemies Restores HP for Allies": "敵撃破時、味方HP回復",
    "Defeating enemies fills more of the Art gauge": "敵撃破時、アーツゲージ増加",
    "Dormant Power - Weapon Discovery": "潜在する力から武器を見つけやすくなる",
    "Draw enemy attention while guarding": "ガード中、敵の視線を引き付ける",
    "FP Restoration on Attack (by Weapon Type)": "武器種別攻撃でFP回復",
    "Fire Damage Negation Up": "炎カット率上昇",
    "Fire Grease in possession at start of expedition": "出撃時に「火脂」を持つ",
    "Fire Pots in possession at start of expedition": "出撃時に「火炎壺」を持つ",
    "Flask Also Heals Allies": "聖杯瓶が味方も回復",
    "Glintstone Scraps in possession at start of\nexpedition": "出撃時に「屑輝石」を持つ",
    "Gravity Stone Chunks in possession at start of\nexpedition": "出撃時に「塊の重力石」を持つ",
    "HP Restoration on Attack (by Weapon Type)": "武器種別攻撃でHP回復",
    "HP Restoration upon Thrusting Counterattack": "刺突カウンターでHP回復",
    "HP restored when using medicinal boluses, etc.": "薬剤使用時にHP回復",
    "Holy Damage Negation Up": "聖カット率上昇",
    "Holy Grease in possession at start of expedition": "出撃時に「聖脂」を持つ",
    "Holy Water Pots in possession at start of expedition": "出撃時に「聖水壺」を持つ",
    "Improved Affinity Damage Negation": "属性カット率上昇",
    "Improved Blood Loss Resistance": "出血耐性上昇",
    "Improved Damage Negation at Low HP": "HP低下時、カット率上昇",
    "Improved Death Blight Resistance": "抗死耐性上昇",
    "Improved Flask HP Restoration": "聖杯瓶の回復量上昇",
    "Improved Frost Resistance": "冷気耐性上昇",
    "Improved Glintstone and Gravity Stone Damage": "輝石・重力石ダメージ上昇",
    "Improved Lightning Damage Negation": "雷カット率上昇",
    "Improved Madness Resistance": "発狂耐性上昇",
    "Improved Magic Damage Negation": "魔力カット率上昇",
    "Improved Perfuming Arts": "調香術強化",
    "Improved Physical Damage Negation": "物理カット率上昇",
    "Improved Poise & Damage Negation When Knocked Back": "吹き飛ばし時、強靭度とカット率上昇",
    "Improved Poison Resistance": "毒耐性上昇",
    "Improved Rot Resistance": "腐敗耐性上昇",
    "Improved Sleep Resistance": "睡眠耐性上昇",
    "Improved Throwing Knife Damage": "投げ短剣ダメージ上昇",
    "Improved Throwing Pot Damage": "投げ壺ダメージ上昇",
    "Increased Maximum FP": "最大FP上昇",
    "Increased Maximum HP": "最大HP上昇",
    "Increased Maximum Stamina": "最大スタミナ上昇",
    "Increased rune acquisition for self and allies": "自身と味方のルーン取得量増加",
    "Items confer effect to all nearby allies": "アイテム効果が周囲の味方にも付与",
    "Lightning Damage Negation Up": "雷カット率上昇",
    "Lightning Grease in possession at start of\nexpedition": "出撃時に「雷脂」を持つ",
    "Lightning Pots in possession at start of expedition": "出撃時に「雷壺」を持つ",
    "Magic Damage Negation Up": "魔力カット率上昇",
    "Magic Grease in possession at start of expedition": "出撃時に「魔力脂」を持つ",
    "Magic Pots in possession at start of expedition": "出撃時に「魔力壺」を持つ",
    "Max FP increased for each Sorcerer's Rise unlocked": "魔術師の塔解放ごとに最大FP上昇",
    "Max FP with 3+ Staves / Seals": "杖/聖印3本以上装備時、最大FP上昇",
    "Max HP per Great Church Boss": "大教会ボス撃破ごとに最大HP上昇",
    "Max HP with 3+ Shields": "盾3本以上装備時、最大HP上昇",
    "Max Stamina per Camp Boss": "野営地ボス撃破ごとに最大スタミナ上昇",
    "Partial HP Restoration upon Post-Damage Attacks": "被ダメージ後の攻撃でHP一部回復",
    "Poisonbone Darts in possession at start of\nexpedition": "出撃時に「骨の毒投げ矢」を持つ",
    "Raised Stamina Recovery for Nearby Allies": "周囲の味方のスタミナ回復速度上昇",
    "Raised stamina recovery for nearby allies, but not for self": "自身を除く周囲の味方のスタミナ回復速度上昇",
    "Reduced FP Consumption": "FP消費軽減",
    "Rune discount for shop purchases while on expedition": "探索中、店のルーン割引",
    "Runes & Discovery per Fort Boss": "砦ボス撃破ごとにルーン・発見力上昇",
    "Shield Grease in possession at start of expedition": "出撃時に「盾脂」を持つ",
    "Slowly Restore HP When HP Is Low": "HP低下時、徐々にHP回復",
    "Slowly restore HP for self and nearby allies when HP is low": "HP低下時、自身と周囲の味方も徐々にHP回復",
    "Small Pouch in possession at start of expedition": "出撃時に「小さなポーチ」を持つ",
    "Spell School": "魔術/祈祷流派強化",
    "Stamina Recovery upon Landing Attacks": "攻撃命中時にスタミナ回復",
    "Starlight Shards in possession at start of expedition": "出撃時に「星光の欠片」を持つ",
    "Starting Armament Element / Status": "出撃時の武器に属性/状態付加",
    "Starting Armament Skill": "出撃時の武器の戦技変更",
    "Stonesword Key in possession at start of expedition": "出撃時に「石剣の鍵」を持つ",
    "Successful guarding fills more of the Art gauge": "ガード成功時、アーツゲージ増加",
    "Throwing Daggers in possession at start of\nexpedition": "出撃時に「スローイングダガー」を持つ",
    "Treasure marked upon map": "マップに宝が表示される",
    "Ultimate Art Auto Charge": "アーツゲージ自然蓄積",
    "Wraith Calling Bell in possession at start of\nexpedition": "出撃時に「呪霊喚びの鈴」を持つ",
    "Bloodboil Aromatic in possession at start of expedition": "出撃時に「沸血の賦香」を持つ",
    "Cerulean Crystal Tear in possession at start of expedition": "出撃時に「蒼露の雫」を持つ",
    "Cerulean Hidden Tear in possession at start of expedition": "出撃時に「蒼隠しの雫」を持つ",
    "Crimson Bubbletear in possession at start of expedition": "出撃時に「朱泡の雫」を持つ",
    "Crimson Crystal Tear in possession at start of expedition": "出撃時に「朱露の雫」を持つ",
    "Crimsonburst Crystal Tear in possession at start of expedition": "出撃時に「朱爆の雫」を持つ",
    "Crimsonspill Crystal Tear in possession at start of expedition": "出撃時に「朱噴の雫」を持つ",
    "Crimsonwhorl Bubbletear in possession at start of expedition": "出撃時に「朱渦の雫」を持つ",
    "Acid Spraymist in possession at start of expedition": "出撃時に「酸の噴霧」を持つ"
  }
};
