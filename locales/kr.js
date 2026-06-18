window.__LOCALE_KR__ = {
  "ui": {
    "title": "Nightreign 유물 확률 계산기",
    "mode_regular": "일반",
    "mode_don": "심야의 탐색",
    "dlc_all": "전체 효과",
    "dlc_pre": "DLC 이전",
    "calcmode_v1": "효과 지정",
    "calcmode_v2": "복수 선택",
    "quality_label": "품질",
    "quality_grand": "그랜드 (3효과)",
    "quality_polished": "폴리시드 (2효과)",
    "quality_delicate": "델리케이트 (1효과)",
    "color_label": "색상",
    "color_blue": "파랑",
    "color_yellow": "노랑",
    "color_green": "초록",
    "color_red": "빨강",
    "add_effect": "+ 원하는 효과 추가",
    "filter_groups": "그룹 필터…",
    "select_group_placeholder": "— 그룹 선택 —",
    "select_effect_placeholder": "— 효과 선택 —",
    "remove": "제거",
    "curse_label": "저주:",
    "select_all": "전체 선택",
    "select_none": "선택 해제",
    "curse_any": "모든 저주",
    "curse_filter_title": "저주 필터",
    "curse_selected": "허용 가능한 저주만",
    "err_same_group": "불가능한 조합 (같은 그룹에서 두 효과)",
    "err_same_curse": "같은 저주를 유물에 두 번 붙일 수 없습니다",
    "err_impossible": "불가능한 조합",
    "result_probability": "확률",
    "data_note_regular": "AttachEffectTableParam.csv의 실제 게임 가중치 사용. 게임 데이터 v1.03.2 + DLC 기반.",
    "data_note_don": "심야 탐색 풀: 테이블 2000000+2100000. ⚠은 랜덤 저주가 붙는 효과를 표시합니다. 게임 데이터 v1.03.2 + DLC 기반.",
    "data_note_predlc_suffix": " DLC 이전 모드: DLC 추가 효과 제외.",
    "pool_summary_format": "{g}개 그룹에서 {n}개 효과 선택 중",
    "methodology_summary": "데이터 출처 및 방법론",
    "meth_h3_sources": "데이터 출처",
    "meth_game_version": "게임 버전: v1.03.2 + DLC1",
    "meth_src_gamefiles": "생 게임 파일 (CSV/XML): <a href=\"https://github.com/ip1259/Elden-Ring-Nightreign-Legal-Relic-Generator\" target=\"_blank\" rel=\"noopener\">ip1259/Elden-Ring-Nightreign-Legal-Relic-Generator</a>",
    "meth_src_descs": "효과 설명 및 검증: <a href=\"https://docs.google.com/spreadsheets/d/1meXOw4jR1hh7YXVMeijWwSDIXnCw6Tk4hTZPq2qvyK4/edit#gid=1078794188\" target=\"_blank\" rel=\"noopener\">Nightreign Useful Info (v1.03.2 + DLC)</a>",
    "meth_h3_files": "사용 파일",
    "meth_file_table": "<code>AttachEffectTableParam.csv</code> — 루트 테이블 가중치",
    "meth_file_param": "<code>AttachEffectParam.csv</code> — 효과 호환 그룹",
    "meth_file_names": "<code>AttachEffectName.fmg.xml</code> + <code>AttachEffectName_dlc01.fmg.xml</code> — 효과 표시 이름",
    "meth_chance_weight": "<code>chanceWeight</code> 컬럼은 <code>actual_weight − 65536</code>을 저장합니다. 실제 가중치 = <code>stored + 65536</code>.",
    "meth_h3_tables": "루트 테이블",
    "meth_tbl_mode": "모드",
    "meth_tbl_id": "테이블 ID",
    "meth_tbl_pool": "풀 합계 (W)",
    "meth_tbl_regular": "일반",
    "meth_tbl_regular_pool": "10046 (이름 없는 효과 5개, 합산 가중치 216 포함)",
    "meth_tbl_don": "심야 효과",
    "meth_tbl_don_pool": "19961 (테이블 2100000의 이름 없는 효과 83개 포함)",
    "meth_tbl_curses": "심야 저주",
    "meth_tbl_curses_pool": "2400 (24종 저주 × 가중치 100)",
    "meth_tables_note": "테이블 2000000에는 가장 강력한 저주 효과(예: 공격 +3/+4)가 포함됩니다. 테이블 2100000은 일반 풀과 심야 전용 효과를 공유하는 일반 심야 풀입니다.",
    "meth_h3_groups": "효과 그룹",
    "meth_groups_note": "<code>AttachEffectParam.csv</code>에서 같은 <code>compatibilityId</code>를 공유하는 효과는 상호 배타적입니다 — 같은 그룹에서 두 효과를 하나의 유물에 붙일 수 없습니다. 계산기의 드롭다운은 이 그룹에 해당합니다.",
    "meth_h3_formula": "확률 계산식",
    "meth_formula_p1": "원하는 그룹에서 효과를 선택해 <em>희망 풀</em>을 만드세요. <em>K</em> 슬롯 유물에 대해 계산기는 K개 효과 모두가 풀에서 나올 확률을 계산합니다.",
    "meth_formula_p2": "<strong>일반 풀</strong> — 각 유물 슬롯은 자체 티어 테이블에서 추첨됩니다: 슬롯 1은 테이블 110, 슬롯 2는 210, 슬롯 3은 310 (델리케이트는 티어 1만, 폴리시드는 티어 1~2, 그랜드는 티어 1~3 사용). 같은 효과라도 티어마다 가중치가 다르며, 약한 효과는 티어 1에서, 강한 효과는 티어 3에서 가장 흔합니다.",
    "meth_formula_p3": "<code>efSlots</code>는 각 희망 효과가 어느 슬롯에 들어가는지(해당 슬롯의 가중치 사용)를 합산하고, 선택하지 않은 슬롯은 자유 슬롯으로 취급합니다. 사용된 그룹의 가중치는 이후 슬롯에서 제외됩니다. 슬롯은 티어 오름차순으로 처리됩니다:",
    "meth_formula_p4": "델리케이트 결과는 정확합니다. 특정 유물 색상이 필요한 경우 0.25를 곱하세요. <strong>심야의 탐색</strong> 유물은 단일 풀 모델(티어 없음)을 사용합니다: P = K! × Σ(K개 그룹 부분집합에 대해) ef(S, W) × curseFactor.",
    "meth_h3_curse": "심야의 탐색: 저주 계수",
    "meth_curse_p1": "저주 효과(⚠)에는 24종 저주 풀에서 동일 확률로 뽑힌 저주 하나가 동반됩니다. 저주는 <strong>비복원 추출</strong>을 전제로 합니다 — 같은 저주가 한 유물에 두 번 붙을 수 없습니다. 이는 게임 내 유물의 개인 관찰에 기반한 경험적 가정이며 게임 코드에서 확인되지 않았습니다.",
    "meth_curse_p2": "저주 필터를 \"허용 가능한 저주만\"으로 설정한 경우 <em>N</em> = 선택한 허용 가능한 저주 수, <em>m</em> = 현재 K 부분집합에서 모든 선택 효과가 저주 효과인 그룹 수입니다. 부분집합별 저주 계수:",
    "meth_curse_p3": "\"모든 저주\"는 N = 24로 계수 = 1(패널티 없음). N &lt; m인 부분집합은 불가능하여 건너뜁니다.",
    "meth_h3_corrections": "데이터 수정",
    "meth_corrections_p": "효과 6001400(Physical Attack Up)은 게임 XML에서 \"+4\"로 표시되지만 가중치(269)는 모든 속성 타입의 일반 패턴(+3 등급: 269, +4 등급: 130)과 일치합니다. 효과 6001401은 XML에 이름이 없었지만(<code>%null%</code>) 확인된 +4입니다. 이름은 데이터 파이프라인에서 수동으로 수정되었습니다.",
    "meth_h3_translation": "번역",
    "meth_translation_sources": "한국어 효과 이름 출처: <a href=\"https://nightreignrelic.com\" target=\"_blank\" rel=\"noopener\">nightreignrelic.com</a>.",
    "meth_translation_claude": "한국어 UI는 <a href=\"https://claude.ai\" target=\"_blank\" rel=\"noopener\">Claude</a> (Anthropic)로 번역되었습니다. 번역 오류를 발견하시면 <a href=\"https://github.com/slavone/nighreign_relic_calculator/issues\" target=\"_blank\" rel=\"noopener\">GitHub에서 신고</a>해 주세요."
  },
  "effects": {
    "Acid Spraymist in possession at start of expedition": {
      "name": "출격 시 「산 분무」 소지"
    },
    "All Resistances Down": {
      "name": "모든 상태 이상 내성 저하"
    },
    "Arcane +1": {
      "name": "신비+1"
    },
    "Arcane +2": {
      "name": "신비+2"
    },
    "Arcane +3": {
      "name": "신비+3"
    },
    "Arcane increased for each great enemy defeated at a Ruin": {
      "name": "유적의 강적을 쓰러뜨릴 때마다 신비 상승"
    },
    "Attack power increased for each Night Invader defeated": {
      "name": "밤의 침입자를 쓰러뜨릴 때마다 공격력 상승"
    },
    "Attack power increased for each evergaol prisoner defeated": {
      "name": "봉인감옥의 죄수를 쓰러뜨릴 때마다 공격력 상승"
    },
    "Attack power up when facing frostbite-afflicted\nenemy": {
      "name": "동상 상태인 적에 대한 공격 강화"
    },
    "Attack power up when facing frostbite-afflicted enemy +1": {
      "name": "동상 상태인 적에 대한 공격 강화+1"
    },
    "Attack power up when facing frostbite-afflicted enemy +2": {
      "name": "동상 상태인 적에 대한 공격 강화+2"
    },
    "Attack power up when facing poison-afflicted enemy": {
      "name": "독 상태인 적에 대한 공격 강화"
    },
    "Attack power up when facing poison-afflicted enemy +1": {
      "name": "독 상태인 적에 대한 공격 강화+1"
    },
    "Attack power up when facing poison-afflicted enemy +2": {
      "name": "독 상태인 적에 대한 공격 강화+2"
    },
    "Attack power up when facing scarlet rot-afflicted\nenemy": {
      "name": "부패 상태인 적에 대한 공격 강화"
    },
    "Attack power up when facing scarlet rot-afflicted enemy +1": {
      "name": "부패 상태인 적에 대한 공격 강화+1"
    },
    "Attack power up when facing scarlet rot-afflicted enemy +2": {
      "name": "부패 상태인 적에 대한 공격 강화+2"
    },
    "Bewitching Branches in possession at start of\nexpedition": {
      "name": "출격 시 「유혹의 나뭇가지」 소지"
    },
    "Bloodboil Aromatic in possession at start of expedition": {
      "name": "출격 시 「광열의 향약」 소지"
    },
    "Cerulean Crystal Tear in possession at start of expedition": {
      "name": "출격 시 「푸른 결정 물방울」 소지"
    },
    "Cerulean Hidden Tear in possession at start of expedition": {
      "name": "출격 시 「푸른 숨겨진 물방울」 소지"
    },
    "Changes compatible armament's incantation to\nBeast Claw at start of expedition": {
      "name": "출격 시 무기의 기도 「짐승 발톱」 ※적용 가능한 무기종만"
    },
    "Changes compatible armament's incantation to\nDragonfire at start of expedition": {
      "name": "출격 시 무기의 기도 「용염」 ※적용 가능한 무기종만"
    },
    "Changes compatible armament's incantation to\nLightning Spear at start of expedition": {
      "name": "출격 시 무기의 기도 「벼락 창」 ※적용 가능한 무기종만"
    },
    "Changes compatible armament's incantation to\nO, Flame! at start of expedition": {
      "name": "출격 시 무기의 기도 「불이여!」 ※적용 가능한 무기종만"
    },
    "Changes compatible armament's incantation to\nWrath of Gold at start of expedition": {
      "name": "출격 시 무기의 기도 「황금의 분노」 ※적용 가능한 무기종만"
    },
    "Changes compatible armament's skill to Blood Blade\nat start of expedition": {
      "name": "출격 시 무기의 전투 기술 「피의 칼날」 ※적용 가능한 무기종만"
    },
    "Changes compatible armament's skill to Chilling Mist\nat start of expedition": {
      "name": "출격 시 무기의 전투 기술 「냉기 안개」 ※적용 가능한 무기종만"
    },
    "Changes compatible armament's skill to Determination\nat start of expedition": {
      "name": "출격 시 무기의 전투 기술 「디터미네이션」 ※적용 가능한 무기종만"
    },
    "Changes compatible armament's skill to Endure at\nstart of expedition": {
      "name": "출격 시 무기의 전투 기술 「참기」 ※적용 가능한 무기종만"
    },
    "Changes compatible armament's skill to\nEruption at start of expedition": {
      "name": "출격 시 무기의 전투 기술 「용암 분화」 ※적용 가능한 무기종만"
    },
    "Changes compatible armament's skill to Flaming\nStrike at start of expedition": {
      "name": "출격 시 무기의 전투 기술 「염격」 ※적용 가능한 무기종만"
    },
    "Changes compatible armament's skill to Glintblade\nPhalanx at start of expedition": {
      "name": "출격 시 무기의 전투 기술 「휘검의 원진」 ※적용 가능한 무기종만"
    },
    "Changes compatible armament's skill to Gravitas at\nstart of expedition": {
      "name": "출격 시 무기의 전투 기술 「그라비타스」 ※적용 가능한 무기종만"
    },
    "Changes compatible armament's skill to Hoarfrost\nStomp at start of expedition": {
      "name": "출격 시 무기의 전투 기술 「서리 밟기」 ※적용 가능한 무기종만"
    },
    "Changes compatible armament's skill to Lightning\nSlash at start of expedition": {
      "name": "출격 시 무기의 전투 기술 「뇌격참」 ※적용 가능한 무기종만"
    },
    "Changes compatible armament's skill to Poison Moth\nFlight at start of expedition": {
      "name": "출격 시 무기의 전투 기술 「독나방은 두 번 춤춘다」 ※적용 가능한 무기종만"
    },
    "Changes compatible armament's skill to Poisonous\nMist at start of expedition": {
      "name": "출격 시 무기의 전투 기술 「독 안개」 ※적용 가능한 무기종만"
    },
    "Changes compatible armament's skill to Prayerful\nStrike at start of expedition": {
      "name": "출격 시 무기의 전투 기술 「기도의 일격」 ※적용 가능한 무기종만"
    },
    "Changes compatible armament's skill to Quickstep at\nstart of expedition": {
      "name": "출격 시 무기의 전투 기술 「퀵스텝」 ※적용 가능한 무기종만"
    },
    "Changes compatible armament's skill to Rain of\nArrows at start of expedition": {
      "name": "출격 시 무기의 전투 기술 「애로우 레인」 ※적용 가능한 무기종만"
    },
    "Changes compatible armament's skill to Sacred Blade\nat start of expedition": {
      "name": "출격 시 무기의 전투 기술 「신성한 칼날」 ※적용 가능한 무기종만"
    },
    "Changes compatible armament's skill to Seppuku at\nstart of expedition": {
      "name": "출격 시 무기의 전투 기술 「할복」 ※적용 가능한 무기종만"
    },
    "Changes compatible armament's skill to Storm Stomp\nat start of expedition": {
      "name": "출격 시 무기의 전투 기술 「남각」 ※적용 가능한 무기종만"
    },
    "Changes compatible armament's skill to Thunderbolt\nat start of expedition": {
      "name": "출격 시 무기의 전투 기술 「낙뢰」 ※적용 가능한 무기종만"
    },
    "Changes compatible armament's skill to White\nShadow's Lure at start of expedition": {
      "name": "출격 시 무기의 전투 기술 「흰 그림자의 유인」 ※적용 가능한 무기종만"
    },
    "Changes compatible armament's sorcery to Briars of\nPunishment at start of expedition": {
      "name": "출격 시 무기의 마술 「벌의 가시」 ※적용 가능한 무기종만"
    },
    "Changes compatible armament's sorcery to Carian\nGreatsword at start of expedition": {
      "name": "출격 시 무기의 마술 「카리아의 대검」 ※적용 가능한 무기종만"
    },
    "Changes compatible armament's sorcery to Magic\nGlintblade at start of expedition": {
      "name": "출격 시 무기의 마술 「마술의 휘검」 ※적용 가능한 무기종만"
    },
    "Changes compatible armament's sorcery to Magma\nShot at start of expedition": {
      "name": "출격 시 무기의 마술 「용암탄」 ※적용 가능한 무기종만"
    },
    "Changes compatible armament's sorcery to Night\nShard at start of expedition": {
      "name": "출격 시 무기의 마술 「밤의 돌팔매」 ※적용 가능한 무기종만"
    },
    "Character Skill Cooldown Reduction +1": {
      "name": "스킬 쿨 타임 경감+1"
    },
    "Character Skill Cooldown Reduction +2": {
      "name": "스킬 쿨 타임 경감+2"
    },
    "Character Skill Cooldown Reduction +3": {
      "name": "스킬 쿨 타임 경감+3"
    },
    "Continuous HP Loss": {
      "name": "HP 지속 감소"
    },
    "Crimson Bubbletear in possession at start of expedition": {
      "name": "출격 시 「붉은 거품 물방울」 소지"
    },
    "Crimson Crystal Tear in possession at start of expedition": {
      "name": "출격 시 「붉은 결정 물방울」 소지"
    },
    "Crimsonburst Crystal Tear in possession at start of expedition": {
      "name": "출격 시 「샘솟는 붉은 결정 물방울」 소지"
    },
    "Crimsonspill Crystal Tear in possession at start of expedition": {
      "name": "출격 시 「넘친 붉은 결정 물방울」 소지"
    },
    "Crimsonwhorl Bubbletear in possession at start of expedition": {
      "name": "출격 시 「붉은 소용돌이 거품 물방울」 소지"
    },
    "Critical Hit Boosts Stamina Recovery Speed": {
      "name": "치명적인 일격으로 스태미나 회복 속도 상승"
    },
    "Critical Hit Boosts Stamina Recovery Speed +1": {
      "name": "치명적인 일격으로 스태미나 회복 속도 상승+1"
    },
    "Critical Hits Earn Runes": {
      "name": "치명적인 일격으로 룬 획득"
    },
    "Critical hits fill more of the Art gauge": {
      "name": "치명적인 일격으로 아츠 게이지 증가"
    },
    "Critical hits fill more of the Art gauge +1": {
      "name": "치명적인 일격으로 아츠 게이지 증가+1"
    },
    "Crystal Darts in possession at start of expedition": {
      "name": "출격 시 「결정 투척 화살」 소지"
    },
    "Defeating enemies fills more of the Art gauge": {
      "name": "적을 쓰러뜨릴 시 아츠 게이지 증가"
    },
    "Defeating enemies fills more of the Art gauge +1": {
      "name": "적을 쓰러뜨릴 시 아츠 게이지 증가+1"
    },
    "Defeating enemies near Totem Stela restores HP": {
      "name": "토템 스텔라 주위에서 적을 쓰러뜨릴 시 HP 회복"
    },
    "Defeating enemies restores HP for allies but not for\nself": {
      "name": "적을 쓰러뜨릴 시, 자신을 제외한 주위 아군의 HP 회복"
    },
    "Dexterity +1": {
      "name": "기량+1"
    },
    "Dexterity +2": {
      "name": "기량+2"
    },
    "Dexterity +3": {
      "name": "기량+3"
    },
    "Dormant Power Helps Discover Axes": {
      "name": "잠재한 힘으로 도끼를 찾기 쉬워진다"
    },
    "Dormant Power Helps Discover Ballistas": {
      "name": "잠재한 힘으로 발리스타를 찾기 쉬워진다"
    },
    "Dormant Power Helps Discover Bows": {
      "name": "잠재한 힘으로 활을 찾기 쉬워진다"
    },
    "Dormant Power Helps Discover Claws": {
      "name": "잠재한 힘으로 손톱을 찾기 쉬워진다"
    },
    "Dormant Power Helps Discover Colossal Swords": {
      "name": "잠재한 힘으로 특대검을 찾기 쉬워진다"
    },
    "Dormant Power Helps Discover Colossal Weapons": {
      "name": "잠재한 힘으로 특대형 무기를 찾기 쉬워진다"
    },
    "Dormant Power Helps Discover Crossbows": {
      "name": "잠재한 힘으로 석궁을 찾기 쉬워진다"
    },
    "Dormant Power Helps Discover Curved Greatswords": {
      "name": "잠재한 힘으로 대곡검을 찾기 쉬워진다"
    },
    "Dormant Power Helps Discover Curved Swords": {
      "name": "잠재한 힘으로 곡검을 찾기 쉬워진다"
    },
    "Dormant Power Helps Discover Daggers": {
      "name": "잠재한 힘으로 단검을 찾기 쉬워진다"
    },
    "Dormant Power Helps Discover Fists": {
      "name": "잠재한 힘으로 주먹을 찾기 쉬워진다"
    },
    "Dormant Power Helps Discover Flails": {
      "name": "잠재한 힘으로 철퇴를 찾기 쉬워진다"
    },
    "Dormant Power Helps Discover Great Hammers": {
      "name": "잠재한 힘으로 대형 망치를 찾기 쉬워진다"
    },
    "Dormant Power Helps Discover Great Spears": {
      "name": "잠재한 힘으로 대형 창을 찾기 쉬워진다"
    },
    "Dormant Power Helps Discover Greataxes": {
      "name": "잠재한 힘으로 대형 도끼를 찾기 쉬워진다"
    },
    "Dormant Power Helps Discover Greatbows": {
      "name": "잠재한 힘으로 대궁을 찾기 쉬워진다"
    },
    "Dormant Power Helps Discover Greatshields": {
      "name": "잠재한 힘으로 대형 방패를 찾기 쉬워진다"
    },
    "Dormant Power Helps Discover Greatswords": {
      "name": "잠재한 힘으로 대검을 찾기 쉬워진다"
    },
    "Dormant Power Helps Discover Halberds": {
      "name": "잠재한 힘으로 도끼창을 찾기 쉬워진다"
    },
    "Dormant Power Helps Discover Hammers": {
      "name": "잠재한 힘으로 망치를 찾기 쉬워진다"
    },
    "Dormant Power Helps Discover Heavy Thrusting Swords": {
      "name": "잠재한 힘으로 대자검을 찾기 쉬워진다"
    },
    "Dormant Power Helps Discover Katana": {
      "name": "잠재한 힘으로 도를 찾기 쉬워진다"
    },
    "Dormant Power Helps Discover Medium Shields": {
      "name": "잠재한 힘으로 중형 방패를 찾기 쉬워진다"
    },
    "Dormant Power Helps Discover Reapers": {
      "name": "잠재한 힘으로 낫을 찾기 쉬워진다"
    },
    "Dormant Power Helps Discover Sacred Seals": {
      "name": "잠재한 힘으로 성인을 찾기 쉬워진다"
    },
    "Dormant Power Helps Discover Small Shields": {
      "name": "잠재한 힘으로 소형 방패를 찾기 쉬워진다"
    },
    "Dormant Power Helps Discover Spears": {
      "name": "잠재한 힘으로 창을 찾기 쉬워진다"
    },
    "Dormant Power Helps Discover Staves": {
      "name": "잠재한 힘으로 지팡이를 찾기 쉬워진다"
    },
    "Dormant Power Helps Discover Straight Swords": {
      "name": "잠재한 힘으로 직검을 찾기 쉬워진다"
    },
    "Dormant Power Helps Discover Thrusting Swords": {
      "name": "잠재한 힘으로 자검을 찾기 쉬워진다"
    },
    "Dormant Power Helps Discover Twinblades": {
      "name": "잠재한 힘으로 쌍날검을 찾기 쉬워진다"
    },
    "Dormant Power Helps Discover Whips": {
      "name": "잠재한 힘으로 채찍을 찾기 쉬워진다"
    },
    "Draw enemy attention while guarding": {
      "name": "가드 중 적에게 노려지기 쉬워짐"
    },
    "Endurance +1": {
      "name": "지구력+1"
    },
    "Endurance +2": {
      "name": "지구력+2"
    },
    "Endurance +3": {
      "name": "지구력+3"
    },
    "FP Restoration upon Axe Attacks": {
      "name": "도끼 공격으로 FP 회복"
    },
    "FP Restoration upon Bow Attacks": {
      "name": "활 공격으로 FP 회복"
    },
    "FP Restoration upon Claw Attacks": {
      "name": "손톱 공격으로 FP 회복"
    },
    "FP Restoration upon Colossal Sword Attacks": {
      "name": "특대검 공격으로 FP 회복"
    },
    "FP Restoration upon Colossal Weapon Attacks": {
      "name": "특대형 무기 공격으로 FP 회복"
    },
    "FP Restoration upon Curved Greatsword Attacks": {
      "name": "대곡검 공격으로 FP 회복"
    },
    "FP Restoration upon Curved Sword Attacks": {
      "name": "곡검 공격으로 FP 회복"
    },
    "FP Restoration upon Dagger Attacks": {
      "name": "단검 공격으로 FP 회복"
    },
    "FP Restoration upon Fist Attacks": {
      "name": "주먹 공격으로 FP 회복"
    },
    "FP Restoration upon Flail Attacks": {
      "name": "철퇴 공격으로 FP 회복"
    },
    "FP Restoration upon Great Hammer Attacks": {
      "name": "대형 망치 공격으로 FP 회복"
    },
    "FP Restoration upon Great Spear Attacks": {
      "name": "대형 창 공격으로 FP 회복"
    },
    "FP Restoration upon Greataxe Attacks": {
      "name": "대형 도끼 공격으로 FP 회복"
    },
    "FP Restoration upon Greatsword Attacks": {
      "name": "대검 공격으로 FP 회복"
    },
    "FP Restoration upon Halberd Attacks": {
      "name": "도끼창 공격으로 FP 회복"
    },
    "FP Restoration upon Hammer Attacks": {
      "name": "망치 공격으로 FP 회복"
    },
    "FP Restoration upon Heavy Thrusting Sword Attacks": {
      "name": "대자검 공격으로 FP 회복"
    },
    "FP Restoration upon Katana Attacks": {
      "name": "도 공격으로 FP 회복"
    },
    "FP Restoration upon Reaper Attacks": {
      "name": "낫 공격으로 FP 회복"
    },
    "FP Restoration upon Spear Attacks": {
      "name": "창 공격으로 FP 회복"
    },
    "FP Restoration upon Straight Sword Attacks": {
      "name": "직검 공격으로 FP 회복"
    },
    "FP Restoration upon Thrusting Sword Attacks": {
      "name": "자검 공격으로 FP 회복"
    },
    "FP Restoration upon Twinblade Attacks": {
      "name": "쌍날검 공격으로 FP 회복"
    },
    "FP Restoration upon Whip Attacks": {
      "name": "채찍 공격으로 FP 회복"
    },
    "Faith +1": {
      "name": "신앙+1"
    },
    "Faith +2": {
      "name": "신앙+2"
    },
    "Faith +3": {
      "name": "신앙+3"
    },
    "Fire Attack Power Up": {
      "name": "화염 공격력 상승"
    },
    "Fire Attack Power Up +1": {
      "name": "화염 공격력 상승+1"
    },
    "Fire Attack Power Up +2": {
      "name": "화염 공격력 상승+2"
    },
    "Fire Attack Power Up +3": {
      "name": "화염 공격력 상승+3"
    },
    "Fire Attack Power Up +4": {
      "name": "화염 공격력 상승+4"
    },
    "Fire Damage Negation Up": {
      "name": "화염 경감률 상승"
    },
    "Fire Grease in possession at start of expedition": {
      "name": "출격 시 「불기름」 소지"
    },
    "Fire Pots in possession at start of expedition": {
      "name": "출격 시 「화염 항아리」 소지"
    },
    "Flame-Shrouding Cracked Tear in possession at start of expedition": {
      "name": "출격 시 「불꽃 두른 깨진 물방울」 소지"
    },
    "Flask Also Heals Allies": {
      "name": "성배병 회복을 주위 아군에 분배"
    },
    "Glintstone Scraps in possession at start of\nexpedition": {
      "name": "출격 시 「부스러기 휘석」 소지"
    },
    "Gravity Stone Chunks in possession at start of\nexpedition": {
      "name": "출격 시 「중력석 덩어리」 소지"
    },
    "Greenburst Crystal Tear in possession at start of expedition": {
      "name": "출격 시 「샘솟는 초록 결정 물방울」 소지"
    },
    "Greenspill Crystal Tear in possession at start of expedition": {
      "name": "출격 시 「넘친 초록 결정 물방울」 소지"
    },
    "Guard counter is given a boost based on current HP": {
      "name": "가드 카운터에 자신의 현재 HP의 일부를 추가"
    },
    "HP Restoration upon Axe Attacks": {
      "name": "도끼 공격으로 HP 회복"
    },
    "HP Restoration upon Bow Attacks": {
      "name": "활 공격으로 HP 회복"
    },
    "HP Restoration upon Claw Attacks": {
      "name": "손톱 공격으로 HP 회복"
    },
    "HP Restoration upon Colossal Sword Attacks": {
      "name": "특대검 공격으로 HP 회복"
    },
    "HP Restoration upon Colossal Weapon Attacks": {
      "name": "특대형 무기 공격으로 HP 회복"
    },
    "HP Restoration upon Curved Greatsword Attacks": {
      "name": "대곡검 공격으로 HP 회복"
    },
    "HP Restoration upon Curved Sword Attacks": {
      "name": "곡검 공격으로 HP 회복"
    },
    "HP Restoration upon Dagger Attacks": {
      "name": "단검 공격으로 HP 회복"
    },
    "HP Restoration upon Fist Attacks": {
      "name": "주먹 공격으로 HP 회복"
    },
    "HP Restoration upon Flail Attacks": {
      "name": "철퇴 공격으로 HP 회복"
    },
    "HP Restoration upon Great Hammer Attacks": {
      "name": "대형 망치 공격으로 HP 회복"
    },
    "HP Restoration upon Great Spear Attacks": {
      "name": "대형 창 공격으로 HP 회복"
    },
    "HP Restoration upon Greataxe Attacks": {
      "name": "대형 도끼 공격으로 HP 회복"
    },
    "HP Restoration upon Greatsword Attacks": {
      "name": "대검 공격으로 HP 회복"
    },
    "HP Restoration upon Halberd Attacks": {
      "name": "도끼창 공격으로 HP 회복"
    },
    "HP Restoration upon Hammer Attacks": {
      "name": "망치 공격으로 HP 회복"
    },
    "HP Restoration upon Heavy Thrusting Sword Attacks": {
      "name": "대자검 공격으로 HP 회복"
    },
    "HP Restoration upon Katana Attacks": {
      "name": "도 공격으로 HP 회복"
    },
    "HP Restoration upon Reaper Attacks": {
      "name": "낫 공격으로 HP 회복"
    },
    "HP Restoration upon Spear Attacks": {
      "name": "창 공격으로 HP 회복"
    },
    "HP Restoration upon Straight Sword Attacks": {
      "name": "직검 공격으로 HP 회복"
    },
    "HP Restoration upon Thrusting Counterattack": {
      "name": "관통 카운터 발생 시 HP 회복"
    },
    "HP Restoration upon Thrusting Counterattack +1": {
      "name": "관통 카운터 발생 시 HP 회복+1"
    },
    "HP Restoration upon Thrusting Sword Attacks": {
      "name": "자검 공격으로 HP 회복"
    },
    "HP Restoration upon Twinblade Attacks": {
      "name": "쌍날검 공격으로 HP 회복"
    },
    "HP Restoration upon Whip Attacks": {
      "name": "채찍 공격으로 HP 회복"
    },
    "HP restored when using medicinal boluses, etc.": {
      "name": "이끼약 등 아이템 사용 시 HP 회복"
    },
    "HP restored when using medicinal boluses, etc. +1": {
      "name": "이끼약 등 아이템 사용 시 HP 회복+1"
    },
    "Holy Attack Power Up": {
      "name": "신성 공격력 상승"
    },
    "Holy Attack Power Up +1": {
      "name": "신성 공격력 상승+1"
    },
    "Holy Attack Power Up +2": {
      "name": "신성 공격력 상승+2"
    },
    "Holy Attack Power Up +3": {
      "name": "신성 공격력 상승+3"
    },
    "Holy Attack Power Up +4": {
      "name": "신성 공격력 상승+4"
    },
    "Holy Damage Negation Up": {
      "name": "신성 경감률 상승"
    },
    "Holy Grease in possession at start of expedition": {
      "name": "출격 시 「신성기름」 소지"
    },
    "Holy Water Pots in possession at start of expedition": {
      "name": "출격 시 「성수 항아리」 소지"
    },
    "Holy-Shrouding Cracked Tear in possession at start of expedition": {
      "name": "출격 시 「신성 두른 깨진 물방울」 소지"
    },
    "Improved Affinity Attack Power": {
      "name": "속성 공격력 상승"
    },
    "Improved Affinity Attack Power +1": {
      "name": "속성 공격력 상승+1"
    },
    "Improved Affinity Attack Power +2": {
      "name": "속성 공격력 상승+2"
    },
    "Improved Affinity Damage Negation": {
      "name": "속성 경감률 상승"
    },
    "Improved Affinity Damage Negation +1": {
      "name": "속성 경감률 상승+1"
    },
    "Improved Affinity Damage Negation +2": {
      "name": "속성 경감률 상승+2"
    },
    "Improved Attack Power with 3+ Axes Equipped": {
      "name": "도끼 무기를 3개 이상 장비 시 공격력 상승"
    },
    "Improved Attack Power with 3+ Bows Equipped": {
      "name": "활 무기를 3개 이상 장비 시 공격력 상승"
    },
    "Improved Attack Power with 3+ Claws Equipped": {
      "name": "발톱 무기를 3개 이상 장비 시 공격력 상승"
    },
    "Improved Attack Power with 3+ Colossal Swords Equipped": {
      "name": "특대검 무기를 3개 이상 장비 시 공격력 상승"
    },
    "Improved Attack Power with 3+ Colossal Weapons Equipped": {
      "name": "특대형 무기를 3개 이상 장비 시 공격력 상승"
    },
    "Improved Attack Power with 3+ Curved Greatswords Equipped": {
      "name": "대곡검 무기를 3개 이상 장비 시 공격력 상승"
    },
    "Improved Attack Power with 3+ Curved Swords Equipped": {
      "name": "곡검 무기를 3개 이상 장비 시 공격력 상승"
    },
    "Improved Attack Power with 3+ Daggers Equipped": {
      "name": "단검 무기를 3개 이상 장비 시 공격력 상승"
    },
    "Improved Attack Power with 3+ Fists Equipped": {
      "name": "주먹 무기를 3개 이상 장비 시 공격력 상승"
    },
    "Improved Attack Power with 3+ Flails Equipped": {
      "name": "철퇴 무기를 3개 이상 장비 시 공격력 상승"
    },
    "Improved Attack Power with 3+ Great Hammers Equipped": {
      "name": "대형 망치 무기를 3개 이상 장비 시 공격력 상승"
    },
    "Improved Attack Power with 3+ Great Spears Equipped": {
      "name": "대형 창 무기를 3개 이상 장비 시 공격력 상승"
    },
    "Improved Attack Power with 3+ Greataxes Equipped": {
      "name": "대형 도끼 무기를 3개 이상 장비 시 공격력 상승"
    },
    "Improved Attack Power with 3+ Greatswords Equipped": {
      "name": "대검 무기를 3개 이상 장비 시 공격력 상승"
    },
    "Improved Attack Power with 3+ Halberds Equipped": {
      "name": "도끼창 무기를 3개 이상 장비 시 공격력 상승"
    },
    "Improved Attack Power with 3+ Hammers Equipped": {
      "name": "망치 무기를 3개 이상 장비 시 공격력 상승"
    },
    "Improved Attack Power with 3+ Heavy Thrusting Swords Equipped": {
      "name": "대자검 무기를 3개 이상 장비 시 공격력 상승"
    },
    "Improved Attack Power with 3+ Katana Equipped": {
      "name": "도 무기를 3개 이상 장비 시 공격력 상승"
    },
    "Improved Attack Power with 3+ Reapers Equipped": {
      "name": "낫 무기를 3개 이상 장비 시 공격력 상승"
    },
    "Improved Attack Power with 3+ Spears Equipped": {
      "name": "창 무기를 3개 이상 장비 시 공격력 상승"
    },
    "Improved Attack Power with 3+ Straight Swords Equipped": {
      "name": "직검 무기를 3개 이상 장비 시 공격력 상승"
    },
    "Improved Attack Power with 3+ Thrusting Swords Equipped": {
      "name": "자검 무기를 3개 이상 장비 시 공격력 상승"
    },
    "Improved Attack Power with 3+ Twinblades Equipped": {
      "name": "쌍날검 무기를 3개 이상 장비 시 공격력 상승"
    },
    "Improved Attack Power with 3+ Whips Equipped": {
      "name": "채찍 무기를 3개 이상 장비 시 공격력 상승"
    },
    "Improved Axe Attack Power": {
      "name": "도끼 공격력 상승"
    },
    "Improved Bestial Incantations": {
      "name": "짐승 기도 강화"
    },
    "Improved Blood Loss Resistance": {
      "name": "출혈 내성 상승"
    },
    "Improved Blood Loss Resistance +1": {
      "name": "출혈 내성 상승+1"
    },
    "Improved Bow Attack Power": {
      "name": "활 공격력 상승"
    },
    "Improved Carian Sword Sorcery": {
      "name": "카리아의 검 마술 강화"
    },
    "Improved Claw Attack Power": {
      "name": "손톱 공격력 상승"
    },
    "Improved Colossal Sword Attack Power": {
      "name": "특대검 공격력 상승"
    },
    "Improved Colossal Weapon Attack Power": {
      "name": "특대형 무기 공격력 상승"
    },
    "Improved Critical Hits": {
      "name": "치명적인 일격 강화"
    },
    "Improved Crystalian sorcery": {
      "name": "결정인의 마술 강화"
    },
    "Improved Curved Greatsword Attack Power": {
      "name": "대곡검 공격력 상승"
    },
    "Improved Curved Sword Attack Power": {
      "name": "곡검 공격력 상승"
    },
    "Improved Dagger Attack Power": {
      "name": "단검 공격력 상승"
    },
    "Improved Damage Negation at Low HP": {
      "name": "HP 저하 시 경감률 상승"
    },
    "Improved Death Blight Resistance": {
      "name": "항사 내성 상승"
    },
    "Improved Death Blight Resistance +1": {
      "name": "항사 내성 상승+1"
    },
    "Improved Dragon Communion Incantations": {
      "name": "용찬 기도 강화"
    },
    "Improved Dragon Cult Incantations": {
      "name": "도읍 고룡신앙 기도 강화"
    },
    "Improved Fire Damage Negation +1": {
      "name": "화염 경감률 상승+1"
    },
    "Improved Fire Damage Negation +2": {
      "name": "화염 경감률 상승+2"
    },
    "Improved Fist Attack Power": {
      "name": "주먹 공격력 상승"
    },
    "Improved Flail Attack Power": {
      "name": "철퇴 공격력 상승"
    },
    "Improved Flask HP Restoration": {
      "name": "성배병 회복량 상승"
    },
    "Improved Frenzied Flame Incantations": {
      "name": "미친 불 기도 강화"
    },
    "Improved Frost Resistance": {
      "name": "동상 내성 상승"
    },
    "Improved Frost Resistance +1": {
      "name": "동상 내성 상승+1"
    },
    "Improved Fundamentalist Incantations": {
      "name": "황금률 원리주의 기도 강화"
    },
    "Improved Giants' Flame Incantations": {
      "name": "거인의 불 기도 강화"
    },
    "Improved Glintblade Sorcery": {
      "name": "휘검 마술 강화"
    },
    "Improved Glintstone and Gravity Stone Damage": {
      "name": "휘석, 중력석 아이템의 공격력 상승"
    },
    "Improved Glintstone and Gravity Stone Damage +1": {
      "name": "휘석, 중력석 아이템의 공격력 상승+1"
    },
    "Improved Godslayer Incantations": {
      "name": "신 사냥 기도 강화"
    },
    "Improved Gravity Sorcery": {
      "name": "중력 마술 강화"
    },
    "Improved Great Hammer Attack Power": {
      "name": "대형 망치 공격력 상승"
    },
    "Improved Great Spear Attack Power": {
      "name": "대형 창 공격력 상승"
    },
    "Improved Greataxe Attack Power": {
      "name": "대형 도끼 공격력 상승"
    },
    "Improved Greatsword Attack Power": {
      "name": "대검 공격력 상승"
    },
    "Improved Guard Counters": {
      "name": "가드 카운터 강화"
    },
    "Improved Guard Counters +1": {
      "name": "가드 카운터 강화+1"
    },
    "Improved Guard Counters +2": {
      "name": "가드 카운터 강화+2"
    },
    "Improved Halberd Attack Power": {
      "name": "도끼창 공격력 상승"
    },
    "Improved Hammer Attack Power": {
      "name": "망치 공격력 상승"
    },
    "Improved Heavy Thrusting Sword Attack Power": {
      "name": "대자검 공격력 상승"
    },
    "Improved Holy Damage Negation +1": {
      "name": "신성 경감률 상승+1"
    },
    "Improved Holy Damage Negation +2": {
      "name": "신성 경감률 상승+2"
    },
    "Improved Incantations": {
      "name": "기도 강화"
    },
    "Improved Incantations +1": {
      "name": "기도 강화+1"
    },
    "Improved Incantations +2": {
      "name": "기도 강화+2"
    },
    "Improved Initial Standard Attack": {
      "name": "일반 공격의 첫 공격 강화"
    },
    "Improved Invisibility Sorcery": {
      "name": "보이지 않는 마술 강화"
    },
    "Improved Katana Attack Power": {
      "name": "도 공격력 상승"
    },
    "Improved Lightning Damage Negation +1": {
      "name": "벼락 경감률 상승+1"
    },
    "Improved Lightning Damage Negation +2": {
      "name": "벼락 경감률 상승+2"
    },
    "Improved Madness Resistance": {
      "name": "발광 내성 상승"
    },
    "Improved Madness Resistance +1": {
      "name": "발광 내성 상승+1"
    },
    "Improved Magic Damage Negation +1": {
      "name": "마력 경감률 상승+1"
    },
    "Improved Magic Damage Negation +2": {
      "name": "마력 경감률 상승+2"
    },
    "Improved Perfuming Arts +1": {
      "name": "조향술 강화+1"
    },
    "Improved Physical Damage Negation +1": {
      "name": "물리 경감률 상승+1"
    },
    "Improved Physical Damage Negation +2": {
      "name": "물리 경감률 상승+2"
    },
    "Improved Poise & Damage Negation When Knocked Back\nby Damage": {
      "name": "대미지를 받아 날아갔을 때, 강인도와 경감률 상승"
    },
    "Improved Poise Near Totem Stela": {
      "name": "토템 스텔라 주위에서 강인도 상승"
    },
    "Improved Poison Resistance": {
      "name": "독 내성 상승"
    },
    "Improved Poison Resistance +1": {
      "name": "독 내성 상승+1"
    },
    "Improved Reaper Attack Power": {
      "name": "낫 공격력 상승"
    },
    "Improved Rot Resistance": {
      "name": "부패 내성 상승"
    },
    "Improved Rot Resistance +1": {
      "name": "부패 내성 상승+1"
    },
    "Improved Sleep Resistance": {
      "name": "수면 내성 상승"
    },
    "Improved Sleep Resistance +1": {
      "name": "수면 내성 상승+1"
    },
    "Improved Sorceries": {
      "name": "마술 강화"
    },
    "Improved Sorceries +1": {
      "name": "마술 강화+1"
    },
    "Improved Sorceries +2": {
      "name": "마술 강화+2"
    },
    "Improved Spear Attack Power": {
      "name": "창 공격력 상승"
    },
    "Improved Stonedigger Sorcery": {
      "name": "채굴 마술 강화"
    },
    "Improved Straight Sword Attack Power": {
      "name": "직검 공격력 상승"
    },
    "Improved Thorn Sorcery": {
      "name": "가시 마술 강화"
    },
    "Improved Throwing Knife Damage": {
      "name": "투척 나이프 공격력 상승"
    },
    "Improved Throwing Knife Damage +1": {
      "name": "투척 나이프 공격력 상승+1"
    },
    "Improved Throwing Pot Damage": {
      "name": "투척 항아리 공격력 상승"
    },
    "Improved Throwing Pot Damage +1": {
      "name": "투척 항아리 공격력 상승+1"
    },
    "Improved Thrusting Sword Attack Power": {
      "name": "자검 공격력 상승"
    },
    "Improved Twinblade Attack Power": {
      "name": "쌍날검 공격력 상승"
    },
    "Improved Whip Attack Power": {
      "name": "채찍 공격력 상승"
    },
    "Increased Maximum FP": {
      "name": "최대 FP 상승"
    },
    "Increased Maximum HP": {
      "name": "최대 HP 상승"
    },
    "Increased Maximum Stamina": {
      "name": "최대 스태미나 상승"
    },
    "Increased rune acquisition for self and allies": {
      "name": "자신과 아군의 획득 룬 증가"
    },
    "Intelligence +1": {
      "name": "지력+1"
    },
    "Intelligence +2": {
      "name": "지력+2"
    },
    "Intelligence +3": {
      "name": "지력+3"
    },
    "Ironjar Aromatic in possession at start of expedition": {
      "name": "출격 시 「철 항아리 향약」 소지"
    },
    "Items confer effect to all nearby allies": {
      "name": "아이템 효과가 주위 아군에게도 발동"
    },
    "Leaden Hardtear in possession at start of expedition": {
      "name": "출격 시 「납빛 굳은 물방울」 소지"
    },
    "Lightning Attack Power Up": {
      "name": "벼락 공격력 상승"
    },
    "Lightning Attack Power Up +1": {
      "name": "벼락 공격력 상승+1"
    },
    "Lightning Attack Power Up +2": {
      "name": "벼락 공격력 상승+2"
    },
    "Lightning Attack Power Up +3": {
      "name": "벼락 공격력 상승+3"
    },
    "Lightning Attack Power Up +4": {
      "name": "벼락 공격력 상승+4"
    },
    "Lightning Damage Negation Up": {
      "name": "벼락 경감률 상승"
    },
    "Lightning Grease in possession at start of\nexpedition": {
      "name": "출격 시 「벼락기름」 소지"
    },
    "Lightning Pots in possession at start of expedition": {
      "name": "출격 시 「벼락 항아리」 소지"
    },
    "Lightning-Shrouding Cracked Tear in possession at start of expedition": {
      "name": "출격 시 「벼락 두른 깨진 물방울」 소지"
    },
    "Lower Attack When Below Max HP": {
      "name": "HP 최대 미만 시 공격력 저하"
    },
    "Madness in Vicinity Improves Attack Power": {
      "name": "주위에서 발광 발생 시 공격력 상승"
    },
    "Madness in Vicinity Improves Attack Power +1": {
      "name": "주위에서 발광 발생 시 공격력 상승+1"
    },
    "Magic Attack Power Up": {
      "name": "마력 공격력 상승"
    },
    "Magic Attack Power Up +1": {
      "name": "마력 공격력 상승+1"
    },
    "Magic Attack Power Up +2": {
      "name": "마력 공격력 상승+2"
    },
    "Magic Attack Power Up +3": {
      "name": "마력 공격력 상승+3"
    },
    "Magic Attack Power Up +4": {
      "name": "마력 공격력 상승+4"
    },
    "Magic Damage Negation Up": {
      "name": "마력 경감률 상승"
    },
    "Magic Grease in possession at start of expedition": {
      "name": "출격 시 「마력기름」 소지"
    },
    "Magic Pots in possession at start of expedition": {
      "name": "출격 시 「마력 항아리」 소지"
    },
    "Magic-Shrouding Cracked Tear in possession at start of expedition": {
      "name": "출격 시 「마력 두른 깨진 물방울」 소지"
    },
    "Max FP Up with 3+ Sacred Seals Equipped": {
      "name": "성인 무기를 3개 이상 장비 시 최대 FP 상승"
    },
    "Max FP Up with 3+ Staves Equipped": {
      "name": "지팡이 무기를 3개 이상 장비 시 최대 FP 상승"
    },
    "Max FP increased for each Sorcerer's Rise unlocked": {
      "name": "마술사탑의 장치를 해제할 때마다 최대 FP 상승"
    },
    "Max HP Up with 3+ Greatshields Equipped": {
      "name": "대형 방패를 3개 이상 장비 시 최대 HP 상승"
    },
    "Max HP Up with 3+ Medium Shields Equipped": {
      "name": "중형 방패를 3개 이상 장비 시 최대 HP 상승"
    },
    "Max HP Up with 3+ Small Shields Equipped": {
      "name": "소형 방패를 3개 이상 장비 시 최대 HP 상승"
    },
    "Max HP increased for each great enemy defeated at a Great Church.": {
      "name": "대교회의 강적을 쓰러뜨릴 때마다 최대 HP 상승"
    },
    "Max stamina increased for each great enemy defeated at a Great Encampment": {
      "name": "대야영지의 강적을 쓰러뜨릴 때마다 최대 스태미나 상승"
    },
    "Mind +1": {
      "name": "정신력+1"
    },
    "Mind +2": {
      "name": "정신력+2"
    },
    "Mind +3": {
      "name": "정신력+3"
    },
    "Near Death Reduces Max HP": {
      "name": "빈사 시 최대 HP 저하"
    },
    "Opaline Bubbletear in possession at start of expedition": {
      "name": "출격 시 「진주색 거품 물방울」 소지"
    },
    "Opaline Hardtear in possession at start of expedition": {
      "name": "출격 시 「진주색 굳은 물방울」 소지"
    },
    "Partial HP Restoration upon Post-Damage Attacks": {
      "name": "대미지를 받은 직후 공격으로 HP 일부 회복"
    },
    "Partial HP Restoration upon Post-Damage Attacks +1": {
      "name": "대미지를 받은 직후 공격으로 HP 일부 회복+1"
    },
    "Partial HP Restoration upon Post-Damage Attacks +2": {
      "name": "대미지를 받은 직후 공격으로 HP 일부 회복+2"
    },
    "Physical Attack Up": {
      "name": "물리 공격력 상승"
    },
    "Physical Attack Up +1": {
      "name": "물리 공격력 상승+1"
    },
    "Physical Attack Up +2": {
      "name": "물리 공격력 상승+2"
    },
    "Physical Attack Up +3": {
      "name": "물리 공격력 상승+3"
    },
    "Physical Attack Up +4": {
      "name": "물리 공격력 상승+4"
    },
    "Physical attack power increases after using grease items": {
      "name": "기름 아이템 사용 시 추가로 물리 공격력 상승"
    },
    "Physical attack power increases after using grease items +1": {
      "name": "기름 아이템 사용 시 추가로 물리 공격력 상승+1"
    },
    "Physical attack power increases after using grease items +2": {
      "name": "기름 아이템 사용 시 추가로 물리 공격력 상승+2"
    },
    "Poise +1": {
      "name": "강인도+1"
    },
    "Poise +2": {
      "name": "강인도+2"
    },
    "Poise +3": {
      "name": "강인도+3"
    },
    "Poison Buildup When Below Max HP": {
      "name": "HP 최대 미만 시 독 축적"
    },
    "Poison Spraymist in possession at start of expedition": {
      "name": "출격 시 「독 분무」 소지"
    },
    "Poisonbone Darts in possession at start of\nexpedition": {
      "name": "출격 시 「투척 독 뼈화살」 소지"
    },
    "Reduced Damage Negation After Evading": {
      "name": "회피 직후 경감률 저하"
    },
    "Reduced Damage Negation for Flask Usages": {
      "name": "성배병 사용 시 경감률 저하"
    },
    "Reduced Dexterity and Faith": {
      "name": "기량과 신앙 저하"
    },
    "Reduced FP Consumption": {
      "name": "소비 FP 경감"
    },
    "Reduced Faith and Strength": {
      "name": "신앙과 근력 저하"
    },
    "Reduced Flask HP Restoration": {
      "name": "성배병 회복량 저하"
    },
    "Reduced Intelligence and Dexterity": {
      "name": "지력과 기량 저하"
    },
    "Reduced Rune Acquisition": {
      "name": "획득 룬 감소"
    },
    "Reduced Strength and Intelligence": {
      "name": "근력과 지력 저하"
    },
    "Reduced Vigor and Arcane": {
      "name": "생명력과 신비 저하"
    },
    "Repeated Evasions Lower Damage Negation": {
      "name": "회피 연속 시 경감률 저하"
    },
    "Rot Buildup When Below Max HP": {
      "name": "HP 최대 미만 시 부패 축적"
    },
    "Rune discount for shop purchases while on expedition": {
      "name": "출격 중 상점 구매에 필요한 룬 할인"
    },
    "Runes and Item Discovery increased for each great enemy defeated at a Fort": {
      "name": "작은 성채의 강적을 쓰러뜨릴 때마다 획득 룬 증가, 발견력 상승"
    },
    "Ruptured Crystal Tear in possession at start of expedition": {
      "name": "출격 시 「파열된 결정 물방울」 소지"
    },
    "Shield Grease in possession at start of expedition": {
      "name": "출격 시 「방패기름」 소지"
    },
    "Sleep in Vicinity Improves Attack Power": {
      "name": "주위에서 수면 발생 시 공격력 상승"
    },
    "Sleep in Vicinity Improves Attack Power +1": {
      "name": "주위에서 수면 발생 시 공격력 상승+1"
    },
    "Small Pouch in possession at start of expedition": {
      "name": "출격 시 「작은 파우치」 소지"
    },
    "Spark Aromatic in possession at start of expedition": {
      "name": "출격 시 「불꽃의 향기」 소지"
    },
    "Speckled Hardtear in possession at start of expedition": {
      "name": "출격 시 「얼룩색 굳은 물방울」 소지"
    },
    "Spiked Cracked Tear in possession at start of expedition": {
      "name": "출격 시 「큰 가시 깨진 물방울」 소지"
    },
    "Stamina Recovery upon Landing Attacks": {
      "name": "공격 명중 시 스태미나 회복"
    },
    "Starlight Shards in possession at start of expedition": {
      "name": "출격 시 「별빛 조각」 소지"
    },
    "Starting armament deals fire damage": {
      "name": "출격 시 무기에 화염 공격력 부여"
    },
    "Starting armament deals holy damage": {
      "name": "출격 시 무기에 신성 공격력 부여"
    },
    "Starting armament deals lightning damage": {
      "name": "출격 시 무기에 벼락 공격력 부여"
    },
    "Starting armament deals magic damage": {
      "name": "출격 시 무기에 마력 공격력 부여"
    },
    "Starting armament inflicts blood loss": {
      "name": "출격 시 무기에 출혈 상태 이상 부여"
    },
    "Starting armament inflicts frost": {
      "name": "출격 시 무기에 동상 상태 이상 부여"
    },
    "Starting armament inflicts poison": {
      "name": "출격 시 무기에 독 상태 이상 부여"
    },
    "Stonebarb Cracked Tear in possession at start of expedition": {
      "name": "출격 시 「바위 가시 깨진 물방울」 소지"
    },
    "Stonesword Key in possession at start of expedition": {
      "name": "출격 시 「석검 열쇠」 소지"
    },
    "Strength +1": {
      "name": "근력+1"
    },
    "Strength +2": {
      "name": "근력+2"
    },
    "Strength +3": {
      "name": "근력+3"
    },
    "Successful guarding fills more of the Art gauge": {
      "name": "가드 성공 시 아츠 게이지 증가"
    },
    "Successful guarding fills more of the Art gauge +1": {
      "name": "가드 성공 시 아츠 게이지 증가+1"
    },
    "Taking Damage Causes Blood Loss Buildup": {
      "name": "대미지를 받을 시 출혈 축적"
    },
    "Taking Damage Causes Death Buildup": {
      "name": "대미지를 받을 시 죽음 축적"
    },
    "Taking Damage Causes Frost Buildup": {
      "name": "대미지를 받을 시 동상 축적"
    },
    "Taking Damage Causes Madness Buildup": {
      "name": "대미지를 받을 시 발광 축적"
    },
    "Taking Damage Causes Poison Buildup": {
      "name": "대미지를 받을 시 독 축적"
    },
    "Taking Damage Causes Rot Buildup": {
      "name": "대미지를 받을 시 부패 축적"
    },
    "Taking Damage Causes Sleep Buildup": {
      "name": "대미지를 받을 시 수면 축적"
    },
    "Taking attacks improves attack power": {
      "name": "공격을 받으면 공격력 상승"
    },
    "Thorny Cracked Tear in possession at start of expedition": {
      "name": "출격 시 「가시 깨진 물방울」 소지"
    },
    "Throwing Daggers in possession at start of\nexpedition": {
      "name": "출격 시 「투척 단검」 소지"
    },
    "Treasure marked upon map": {
      "name": "묻힌 보물의 위치를 지도에 표시"
    },
    "Twiggy Cracked Tear in possession at start of expedition": {
      "name": "출격 시 「가는 가지 깨진 물방울」 소지"
    },
    "Ultimate Art Auto Charge +1": {
      "name": "아츠 게이지 자연 축적+1"
    },
    "Ultimate Art Auto Charge +2": {
      "name": "아츠 게이지 자연 축적+2"
    },
    "Ultimate Art Auto Charge +3": {
      "name": "아츠 게이지 자연 축적+3"
    },
    "Ultimate Art Charging Impaired": {
      "name": "아츠 게이지 축적 둔화"
    },
    "Uplifting Aromatic in possession at start of expedition": {
      "name": "출격 시 「고양의 향기」 소지"
    },
    "Vigor +1": {
      "name": "생명력+1"
    },
    "Vigor +2": {
      "name": "생명력+2"
    },
    "Vigor +3": {
      "name": "생명력+3"
    },
    "Windy Crystal Tear in possession at start of expedition": {
      "name": "출격 시 「바람 결정 물방울」 소지"
    },
    "Wraith Calling Bell in possession at start of\nexpedition": {
      "name": "출격 시 「주령을 부르는 종」 소지"
    },
    "[Duchess] Become difficult to spot and silence\nfootsteps after landing critical from behind": {
      "name": "[레이디]등 뒤에서 치명적인 일격 후 적에게 잘 안 보이게 되고 발소리를 지움"
    },
    "[Duchess] Defeating enemies while Art is active ups\nattack power": {
      "name": "[레이디]아츠 발동 중 적 격파 시 공격력 상승"
    },
    "[Duchess] Improved Character Skill Attack Power": {
      "name": "[레이디]스킬 대미지 상승"
    },
    "[Duchess] Improved Mind and Faith, Reduced Intelligence": {
      "name": "[레이디]정신력/신앙 상승, 지력 저하"
    },
    "[Duchess] Improved Vigor and Strength, Reduced Mind": {
      "name": "[레이디]생명력/근력 상승, 정신력 저하"
    },
    "[Duchess] Use Character Skill for Brief Invulnerability": {
      "name": "[레이디]스킬 사용 시 잠시 무적"
    },
    "[Executor] Character Skill Boosts Attack but Attacking Drains HP": {
      "name": "[집행자]스킬 중 공격력 상승, 공격 시 HP 감소"
    },
    "[Executor] Improved Dexterity and Arcane, Reduced Vigor": {
      "name": "[집행자]기량/신비 상승, 생명력 저하"
    },
    "[Executor] Improved Vigor and Endurance, Reduced Arcane": {
      "name": "[집행자]생명력/지구력 상승, 신비 저하"
    },
    "[Executor] Roaring restores HP while Art is active": {
      "name": "[집행자]아츠 발동 중 포효로 HP 회복"
    },
    "[Executor] Slowly Restore HP upon Ability Activation": {
      "name": "[집행자]어빌리티 발동 시 HP를 서서히 회복"
    },
    "[Executor] While Character Skill is active,\nunlocking use of cursed sword restores HP": {
      "name": "[집행자]스킬 중 요도가 해방 상태가 되면 HP 회복"
    },
    "[Guardian] Character Skill Boosts Damage Negation of Nearby Allies": {
      "name": "[수호자]스킬 사용 시 주위 아군의 경감률 상승"
    },
    "[Guardian] Creates whirlwind when charging halberd\nattacks": {
      "name": "[수호자]도끼창 차지 공격 시 회오리 발생"
    },
    "[Guardian] Improved Mind and Faith, Reduced Vigor": {
      "name": "[수호자]정신력/신앙 상승, 생명력 저하"
    },
    "[Guardian] Improved Strength and Dexterity, Reduced Vigor": {
      "name": "[수호자]근력/기량 상승, 생명력 저하"
    },
    "[Guardian] Increased duration for Character Skill": {
      "name": "[수호자]스킬 지속 시간 연장"
    },
    "[Guardian] Slowly restores nearby allies' HP\nwhile Art is active": {
      "name": "[수호자]아츠 발동 시 주위 아군의 HP를 서서히 회복"
    },
    "[Guardian] Successful guards send out shockwaves while\nability is active": {
      "name": "[수호자]어빌리티 발동 중 가드 성공 시 충격파 발생"
    },
    "[Ironeye] +1 additional Character Skill use": {
      "name": "[철의 눈]스킬 사용 횟수 +1"
    },
    "[Ironeye] Art Charge Activation Adds Poison Effect": {
      "name": "[철의 눈]아츠 차지 발동 시 독 상태 이상 부여"
    },
    "[Ironeye] Boosts thrusting counterattacks after executing Art": {
      "name": "[철의 눈]아츠 발동 후 관통 카운터 강화"
    },
    "[Ironeye] Character Skill Inflicts Heavy Poison Damage on Poisoned Enemies": {
      "name": "[철의 눈]스킬에 독 상태 이상을 부여하고 독 상태인 적에 큰 대미지"
    },
    "[Ironeye] Extends duration of weak point": {
      "name": "[철의 눈]약점의 지속 시간 연장"
    },
    "[Ironeye] Improved Arcane, Reduced Dexterity": {
      "name": "[철의 눈]신비 상승, 기량 저하"
    },
    "[Ironeye] Improved Vigor and Strength, Reduced Dexterity": {
      "name": "[철의 눈]생명력/근력 상승, 기량 저하"
    },
    "[Raider] Damage taken while using Character Skill\nimproves attack power and stamina": {
      "name": "[무뢰한]스킬 중 공격을 받으면 공격력과 최대 스태미나 상승"
    },
    "[Raider] Duration of Ultimate Art extended": {
      "name": "[무뢰한]아츠 효과 시간 연장"
    },
    "[Raider] Hit With Character Skill to Reduce Enemy Attack Power": {
      "name": "[무뢰한]스킬 명중 시 적의 공격력 저하"
    },
    "[Raider] Improved Arcane, Reduced Vigor": {
      "name": "[무뢰한]신비 상승, 생명력 저하"
    },
    "[Raider] Improved Mind and Intelligence, Reduced Vigor and Endurance": {
      "name": "[무뢰한]정신력/지력 상승, 생명력/지구력 저하"
    },
    "[Recluse] Activating Ultimate Art raises Max HP": {
      "name": "[은둔자]아츠 발동 시 최대 HP 상승"
    },
    "[Recluse] Collect Affinity Residues to Negate Affinity": {
      "name": "[은둔자]속성흔을 모으면 대응하는 속성 경감률 상승"
    },
    "[Recluse] Collecting affinity residue activates\nTerra Magica": {
      "name": "[은둔자]속성흔을 모으면 「마술의 땅」 발동"
    },
    "[Recluse] Improved Intelligence and Faith, Reduced Mind": {
      "name": "[은둔자]지력/신앙 상승, 정신력 저하"
    },
    "[Recluse] Improved Vigor, Endurance, and Dexterity, Reduced Intelligence and Faith": {
      "name": "[은둔자]생명력/지구력/기량 상승, 지력/신앙 저하"
    },
    "[Recluse] Suffer blood loss and increase attack\npower upon Art activation": {
      "name": "[은둔자]아츠 발동 시 자신에게 출혈 발생, 공격력 상승"
    },
    "[Revenant] Expend own HP to fully heal nearby allies\nwhen activating Art": {
      "name": "[복수자]아츠 발동 시 자신의 HP와 맞바꿔 주위 아군의 HP를 전부 회복"
    },
    "[Revenant] Improved Strength, Reduced Faith": {
      "name": "[복수자]근력 상승, 신앙 저하"
    },
    "[Revenant] Improved Vigor and Endurance, Reduced Mind": {
      "name": "[복수자]생명력/지구력 상승, 정신력 저하"
    },
    "[Revenant] Increased Max FP upon Ability Activation": {
      "name": "[복수자]어빌리티 발동 시 최대 FP 상승"
    },
    "[Revenant] Power up while fighting alongside family": {
      "name": "[복수자]패밀리와 함께 싸우는 동안 자신을 강화"
    },
    "[Revenant] Strengthens family and allies when Ultimate Art is activated": {
      "name": "[복수자]아츠 발동 시 패밀리와 아군 강화"
    },
    "[Revenant] Trigger ghostflame explosion during\nUltimate Art activation": {
      "name": "[복수자]아츠 발동 시 영혼 불꽃 폭발 발생"
    },
    "[Scholar] Allies targeted by Character Skill gain boosted attack": {
      "name": "[학자]스킬 사용 시 대상에 포함된 아군의 공격력 상승"
    },
    "[Scholar] Continuous damage inflicted on targets threaded by Ultimate Art": {
      "name": "[학자]아츠로 링크한 적에게 지속 대미지"
    },
    "[Scholar] Earn runes for each additional specimen acquired with Character Skill": {
      "name": "[학자]스킬의 표본이 늘 때마다 룬 획득"
    },
    "[Scholar] Prevent slowing of Character Skill progress": {
      "name": "[학자]스킬 진척률 저하를 억제"
    },
    "[Undertaker] Activating Ultimate Art increases attack power": {
      "name": "[장의사]아츠 발동 시 공격력 상승"
    },
    "[Undertaker] Attack power increased by landing the final blow of a chain attack": {
      "name": "[장의사]연속 공격의 최종 공격 명중 시 공격력 상승"
    },
    "[Undertaker] Contact with allies restores their HP while Ultimate Art is activated": {
      "name": "[장의사]아츠 발동 시 닿은 아군의 HP 회복"
    },
    "[Undertaker] Physical attacks boosted while assist effect from incantation is active for self": {
      "name": "[장의사]기도 사용으로 자신에게 보조 효과 발생 시 물리 공격력 상승"
    },
    "[Wylder] +1 additional Character Skill use": {
      "name": "[추적자]스킬 사용 횟수 +1"
    },
    "[Wylder] Art activation spreads fire in area": {
      "name": "[추적자]아츠 발동 시 주위 연소"
    },
    "[Wylder] Art gauge greatly filled when ability is\nactivated": {
      "name": "[추적자]어빌리티 발동 시 아츠 게이지 증가"
    },
    "[Wylder] Character Skill inflicts Blood Loss": {
      "name": "[추적자]스킬에 출혈 상태 이상 부여"
    },
    "[Wylder] Improved Intelligence and Faith, Reduced Strength and Dexterity": {
      "name": "[추적자]지력/신앙 상승, 근력/기량 저하"
    },
    "[Wylder] Improved Mind, Reduced Vigor": {
      "name": "[추적자]정신력 상승, 생명력 저하"
    },
    "[Wylder] Standard attacks enhanced with fiery\nfollow-ups when using Character Skill (greatsword only)": {
      "name": "[추적자]스킬 사용 시 일반 공격으로 불꽃을 두른 추가 공격(대검 한정)"
    },
    "[Duchess] Successive dagger attack reprises event upon\nnearby enemies": {
      "name": "[레이디]단검 연속 공격 명중 시 주위 적에게 직전에 일어난 일을 재현"
    },
    "Raised stamina recovery for nearby allies, but not\nfor self": {
      "name": "자신을 제외한 주위 아군의 스태미나 회복 속도 상승"
    },
    "Slowly restore HP for self and nearby allies when HP\nis low": {
      "name": "HP 저하 시 주위 아군을 포함해 HP를 서서히 회복"
    }
  },
  "groups": {
    "Improved Perfuming Arts": "조향술 강화",
    "Raised stamina recovery for nearby allies, but not for self": "자신을 제외한 주위 아군의 스태미나 회복 속도 상승",
    "Slowly restore HP for self and nearby allies when HP is low": "HP 저하 시 주위 아군을 포함해 HP를 서서히 회복",
    "Attack power up when facing frostbite-afflicted\nenemy": "동상 상태인 적에 대한 공격 강화",
    "Bewitching Branches in possession at start of\nexpedition": "출격 시 「유혹의 나뭇가지」 소지",
    "Critical Hit Boosts Stamina Recovery Speed": "치명적인 일격으로 스태미나 회복 속도 상승",
    "Critical Hits Earn Runes": "치명적인 일격으로 룬 획득",
    "Critical hits fill more of the Art gauge": "치명적인 일격으로 아츠 게이지 증가",
    "Crystal Darts in possession at start of expedition": "출격 시 「결정 투척 화살」 소지",
    "Defeating enemies fills more of the Art gauge": "적을 쓰러뜨릴 시 아츠 게이지 증가",
    "Draw enemy attention while guarding": "가드 중 적에게 노려지기 쉬워짐",
    "Fire Damage Negation Up": "화염 경감률 상승",
    "Fire Grease in possession at start of expedition": "출격 시 「불기름」 소지",
    "Fire Pots in possession at start of expedition": "출격 시 「화염 항아리」 소지",
    "Flask Also Heals Allies": "성배병 회복을 주위 아군에 분배",
    "Glintstone Scraps in possession at start of\nexpedition": "출격 시 「부스러기 휘석」 소지",
    "Gravity Stone Chunks in possession at start of\nexpedition": "출격 시 「중력석 덩어리」 소지",
    "Holy Damage Negation Up": "신성 경감률 상승",
    "Holy Grease in possession at start of expedition": "출격 시 「신성기름」 소지",
    "Holy Water Pots in possession at start of expedition": "출격 시 「성수 항아리」 소지",
    "HP Restoration upon Thrusting Counterattack": "관통 카운터 발생 시 HP 회복",
    "HP restored when using medicinal boluses, etc.": "이끼약 등 아이템 사용 시 HP 회복",
    "Improved Blood Loss Resistance": "출혈 내성 상승",
    "Improved Damage Negation at Low HP": "HP 저하 시 경감률 상승",
    "Improved Death Blight Resistance": "항사 내성 상승",
    "Improved Frost Resistance": "동상 내성 상승",
    "Improved Glintstone and Gravity Stone Damage": "휘석, 중력석 아이템의 공격력 상승",
    "Improved Madness Resistance": "발광 내성 상승",
    "Improved Poison Resistance": "독 내성 상승",
    "Improved Rot Resistance": "부패 내성 상승",
    "Improved Sleep Resistance": "수면 내성 상승",
    "Improved Throwing Knife Damage": "투척 나이프 공격력 상승",
    "Improved Throwing Pot Damage": "투척 항아리 공격력 상승",
    "Increased rune acquisition for self and allies": "자신과 아군의 획득 룬 증가",
    "Items confer effect to all nearby allies": "아이템 효과가 주위 아군에게도 발동",
    "Lightning Damage Negation Up": "벼락 경감률 상승",
    "Lightning Grease in possession at start of\nexpedition": "출격 시 「벼락기름」 소지",
    "Lightning Pots in possession at start of expedition": "출격 시 「벼락 항아리」 소지",
    "Magic Damage Negation Up": "마력 경감률 상승",
    "Magic Grease in possession at start of expedition": "출격 시 「마력기름」 소지",
    "Magic Pots in possession at start of expedition": "출격 시 「마력 항아리」 소지",
    "Max FP increased for each Sorcerer's Rise unlocked": "마술사탑의 장치를 해제할 때마다 최대 FP 상승",
    "Partial HP Restoration upon Post-Damage Attacks": "대미지를 받은 직후 공격으로 HP 일부 회복",
    "Poisonbone Darts in possession at start of\nexpedition": "출격 시 「투척 독 뼈화살」 소지",
    "Rune discount for shop purchases while on expedition": "출격 중 상점 구매에 필요한 룬 할인",
    "Shield Grease in possession at start of expedition": "출격 시 「방패기름」 소지",
    "Small Pouch in possession at start of expedition": "출격 시 「작은 파우치」 소지",
    "Stamina Recovery upon Landing Attacks": "공격 명중 시 스태미나 회복",
    "Starlight Shards in possession at start of expedition": "출격 시 「별빛 조각」 소지",
    "Stonesword Key in possession at start of expedition": "출격 시 「석검 열쇠」 소지",
    "Successful guarding fills more of the Art gauge": "가드 성공 시 아츠 게이지 증가",
    "Throwing Daggers in possession at start of\nexpedition": "출격 시 「투척 단검」 소지",
    "Treasure marked upon map": "묻힌 보물의 위치를 지도에 표시",
    "Wraith Calling Bell in possession at start of\nexpedition": "출격 시 「주령을 부르는 종」 소지",
    "Acid Spraymist in possession at start of expedition": "출격 시 「산 분무」 소지",
    "Cerulean Crystal Tear in possession at start of expedition": "출격 시 「푸른 결정 물방울」 소지",
    "Improved Affinity Damage Negation": "속성 경감률 상승",
    "Improved Flask HP Restoration": "성배병 회복량 상승",
    "Increased Maximum FP": "최대 FP 상승",
    "Increased Maximum HP": "최대 HP 상승",
    "Increased Maximum Stamina": "최대 스태미나 상승",
    "Reduced FP Consumption": "소비 FP 경감",
    "Arcane": "신비",
    "Attack Power": "공격력",
    "Dexterity": "기량",
    "Endurance": "지구력",
    "Faith": "신앙",
    "Intelligence": "지력",
    "Mind": "정신력",
    "Poise": "강인함",
    "Strength": "근력",
    "Vigor": "생명력",
    "Character Ability": "캐릭터 능력",
    "Character Skill Cooldown Reduction": "스킬 쿨타임 단축",
    "Starting Armament Skill": "출격 시 무기 전투 기술 변경",
    "Starting Armament Element / Status": "출격 시 무기에 속성/상태 부여",
    "Spell School": "마술/기도 유파 강화",
    "Dormant Power - Weapon Discovery": "잠재력으로 무기를 찾기 쉬워짐",
    "Attack Power vs Poison / Rot Afflicted": "독/부패 상태인 적에 대한 공격 강화",
    "Attack Power vs Frostbite-Afflicted Enemy": "동상 상태인 적에 대한 공격 강화",
    "Arcane per Ruin Boss": "유적 보스를 쓰러뜨릴 때마다 신비 상승",
    "Defeating Enemies Restores HP for Allies": "적 격파 시 아군 HP 회복",
    "FP Restoration on Attack (by Weapon Type)": "무기 종류별 공격으로 FP 회복",
    "HP Restoration on Attack (by Weapon Type)": "무기 종류별 공격으로 HP 회복",
    "Improved Lightning Damage Negation": "번개 피해 차단율 상승",
    "Improved Magic Damage Negation": "마력 피해 차단율 상승",
    "Improved Physical Damage Negation": "물리 피해 차단율 상승",
    "Improved Poise & Damage Negation When Knocked Back": "피격 시 강인함 및 피해 차단율 상승",
    "Max FP with 3+ Staves / Seals": "지팡이/봉인 3개 이상 장비 시 최대 FP 상승",
    "Max HP per Great Church Boss": "대성당 보스 격파 시마다 최대 HP 상승",
    "Max HP with 3+ Shields": "방패 3개 이상 장비 시 최대 HP 상승",
    "Max Stamina per Camp Boss": "야영지 보스 격파 시마다 최대 스태미나 상승",
    "Raised Stamina Recovery for Nearby Allies": "주위 아군의 스태미나 회복 속도 상승",
    "Runes & Discovery per Fort Boss": "요새 보스 격파 시마다 룬·발견력 상승",
    "Slowly Restore HP When HP Is Low": "HP 저하 시 서서히 HP 회복",
    "Ultimate Art Auto Charge": "아츠 게이지 자연 축적"
  }
};
