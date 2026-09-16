import { SeasonEvent } from '../types'

export const PRESEASON_DECISIONS = [
  {
    id: 'pre_fa_market',
    title: '📢 FA(자유계약선수) 시장 개장',
    description: '리그 최정상급 FA 선수가 시장에 나왔습니다. 구단의 미래 예산과 전력을 결정해야 합니다.',
    category: '트레이드' as const,
    options: [
      {
        text: '🔥 60억 통큰 베팅! 국가대표급 중심타자 영입',
        effectDesc: '팀 전력 대폭 상승 (+5), 예산 -60억, 팬심 +15',
        overallDelta: 5,
        budgetDelta: -60,
        fanSupportDelta: 15,
        ownerTrustDelta: 5
      },
      {
        text: '🛡️ 알짜배기 25억 불펜 요원 영입',
        effectDesc: '팀 전력 소폭 상승 (+2), 예산 -25억, 케미스트리 +5',
        overallDelta: 2,
        budgetDelta: -25,
        chemistryDelta: 5
      },
      {
        text: '🌱 FA 철수! 유망주 팜과 육성에 올인',
        effectDesc: '유망주 팜 +15, 예산 보존 (+10억 육성지원금), 팬심 -5',
        farmDelta: 15,
        budgetDelta: 10,
        fanSupportDelta: -5
      }
    ]
  },
  {
    id: 'pre_camp_location',
    title: '✈️ 스프링캠프 전지훈련지 선정',
    description: '선수단의 1년 몸을 만드는 스프링캠프 장소와 훈련 강도를 결정해야 합니다.',
    category: '구단주' as const,
    options: [
      {
        text: '🇺🇸 미국 애리조나 풀 패키지 최첨단 캠프 (-20억)',
        effectDesc: '팀 전력 상승 (+3), 케미스트리 +8, 예산 -20억',
        overallDelta: 3,
        chemistryDelta: 8,
        budgetDelta: -20
      },
      {
        text: '🇯🇵 일본 오키나와 실전 연습경기 중심 캠프 (-10억)',
        effectDesc: '팀 전력 안정 (+1), 케미스트리 +4, 예산 -10억',
        overallDelta: 1,
        chemistryDelta: 4,
        budgetDelta: -10
      },
      {
        text: '🇰🇷 국내 제주도 실내 훈련 (비용 절감형)',
        effectDesc: '예산 보존 (+5억 절감), 케미스트리 -5, 팬심 -3',
        budgetDelta: 5,
        chemistryDelta: -5,
        fanSupportDelta: -3
      }
    ]
  },
  {
    id: 'pre_facility_investment',
    title: '🏗️ 2군 퓨처스 훈련 시설 및 데이터 랩 투자',
    description: '트래킹 장비와 바이오메카닉스 랩을 설치하여 부상 방지와 육성 시스템을 고도화할 수 있습니다.',
    category: '유망주' as const,
    options: [
      {
        text: '🔬 최첨단 바이오메카닉스 랩 구축 (-30억)',
        effectDesc: '유망주 팜 +20, 부상 억제, 예산 -30억',
        farmDelta: 20,
        budgetDelta: -30,
        ownerTrustDelta: 5
      },
      {
        text: '🍗 선수단 식단 및 트레이닝 지원 개선 (-10억)',
        effectDesc: '케미스트리 +10, 팀 전력 +1, 예산 -10억',
        chemistryDelta: 10,
        overallDelta: 1,
        budgetDelta: -10
      },
      {
        text: '💰 시설 투자 보류, 구단 재정 비축',
        effectDesc: '예산 보존, 구단주 신뢰 +5, 팬심 -5',
        ownerTrustDelta: 5,
        fanSupportDelta: -5
      }
    ]
  }
]

export const IN_SEASON_EVENTS: SeasonEvent[] = [
  {
    id: 'ev_walkoff_scapegoat',
    title: '🎙️ 끝내기 실책 후, 신인 유격수가 인터뷰를 거부했다',
    description: '라이벌전 9회말 평범한 땅볼을 놓친 신인이 라커룸에서 고개를 들지 못하고 있습니다. 감독은 다음 경기 선발 제외를 요청했고, 팬들은 SNS로 선수를 몰아세우고 있습니다.',
    category: '갈등',
    options: [
      { text: '🫂 단장이 직접 보호하고 다음 경기에도 선발 기용', effectDesc: '당장 전력 -1, 케미 +12, 팜 +6', overallDelta: -1, chemistryDelta: 12, farmDelta: 6 },
      { text: '📉 2군에서 재정비하도록 엔트리 말소', effectDesc: '전력 안정 +1, 팬심 +4, 팜 -5', overallDelta: 1, fanSupportDelta: 4, farmDelta: -5 },
      { text: '📰 공개 사과 기자회견으로 정면 돌파', effectDesc: '팬심 +10, 선수단 케미 -6', fanSupportDelta: 10, chemistryDelta: -6 }
    ]
  },
  {
    id: 'ev_deadline_trade',
    title: '☎️ 트레이드 마감 17분 전, 라이벌 구단의 전화',
    description: '상대 단장이 즉시전력 불펜 에이스를 내주는 대신 팀 내 최고 유망주와 현금 12억을 요구했습니다. 결재 가능 시간은 17분뿐입니다.',
    category: '트레이드',
    options: [
      { text: '🔥 우승 확률을 산다. 제안 수락', effectDesc: '전력 +3, 예산 -12억, 팜 -15', overallDelta: 3, budgetDelta: -12, farmDelta: -15 },
      { text: '🌱 미래를 지킨다. 협상 결렬', effectDesc: '팜 +5, 팬심 -6, 구단주 신뢰 -3', farmDelta: 5, fanSupportDelta: -6, ownerTrustDelta: -3 },
      { text: '🤝 현금 대신 백업 포수를 얹어 역제안', effectDesc: '전력 +1, 케미 -5, 예산 -4억', overallDelta: 1, chemistryDelta: -5, budgetDelta: -4 }
    ]
  },
  {
    id: 'ev_doubleheader_bullpen',
    title: '🌧️ 13연전 확정, 불펜에 남은 투수는 다섯 명',
    description: '연이은 우천 취소로 지옥의 일정이 편성됐습니다. 수석코치는 선발 한 명을 불펜으로 돌리자고 하고, 데이터팀은 과감한 휴식일 운영을 주장합니다.',
    category: '부상',
    options: [
      { text: '🧪 불펜 데이를 세 차례 가동한다', effectDesc: '전력 +1, 케미 -4, 부상 위험 감수', overallDelta: 1, chemistryDelta: -4 },
      { text: '🚌 퓨처스 투수 세 명 긴급 콜업', effectDesc: '전력 -2, 팜 +10, 케미 +5', overallDelta: -2, farmDelta: 10, chemistryDelta: 5 },
      { text: '💸 방출 시장 베테랑 긴급 영입', effectDesc: '예산 -8억, 전력 +2', budgetDelta: -8, overallDelta: 2 }
    ]
  },
  {
    id: 'ev_ace_injury',
    title: '🚑 에이스 1선발의 팔꿈치 통증 호소',
    description: '전반기 팀을 이끌던 에이스 투수가 팔꿈치에 경미한 불편감을 느껴 진단을 요청했습니다.',
    category: '부상',
    options: [
      {
        text: '🇩🇪 독일 특급 스포츠클리닉 긴급 이송 정밀치료 (-15억)',
        effectDesc: '팀 전력 유지, 구단주 신뢰 +8, 예산 -15억',
        ownerTrustDelta: 8,
        budgetDelta: -15,
        chemistryDelta: 5
      },
      {
        text: '🛌 4주간 완벽한 휴식과 치료 부여 (2군 유망주 콜업)',
        effectDesc: '팀 전력 단기 하락 (-2), 유망주 팜 +5, 구단주 신뢰 +5',
        overallDelta: -2,
        farmDelta: 5,
        ownerTrustDelta: 5
      },
      {
        text: '💉 주사 치료 후 5인 로테이션 정상 소화 강행',
        effectDesc: '팀 전력 유지, 케미스트리 -10, 팬심 하락 (-5)',
        chemistryDelta: -10,
        fanSupportDelta: -5
      }
    ]
  },
  {
    id: 'ev_mlb_posting',
    title: '🇺🇸 MLB 메이저리그 스카우트의 에이스 포스팅 오퍼',
    description: '해외 스카우트진이 우리 팀 주축 선수의 포스팅 이적을 제안하며 거액의 이적료를 제시했습니다.',
    category: '트레이드',
    options: [
      {
        text: '💰 선수 꿈을 존중하고 포스팅 승인 (+50억 이적료)',
        effectDesc: '예산 +50억, 팀 전력 하락 (-4), 팬심 -10',
        budgetDelta: 50,
        overallDelta: -4,
        fanSupportDelta: -10
      },
      {
        text: '🛡️ "우승이 먼저다!" 포스팅 전격 거부 및 다년계약 (-20억)',
        effectDesc: '팀 전력 보존 (+2), 팬심 +15, 예산 -20억',
        overallDelta: 2,
        fanSupportDelta: 15,
        budgetDelta: -20
      }
    ]
  },
  {
    id: 'ev_manager_conflict',
    title: '💥 현장 감독과 데이터 분석팀의 정면 충돌',
    description: '감독이 데이터팀의 극단적 수비 시프트 및 투구수 제한 지침을 거부하며 프런트와 갈등을 빚고 있습니다.',
    category: '갈등',
    options: [
      {
        text: '📊 단장 직권으로 데이터 기반 운영 전면 강제',
        effectDesc: '팀 전력 효율 상승 (+2), 감독/케미스트리 -10',
        overallDelta: 2,
        chemistryDelta: -10
      },
      {
        text: '🧢 현장 감독의 베테랑 감각과 재량을 전폭 신뢰',
        effectDesc: '케미스트리 +10, 구단주 신뢰 -5, 팀 전력 -1',
        chemistryDelta: 10,
        ownerTrustDelta: -5,
        overallDelta: -1
      }
    ]
  },
  {
    id: 'ev_bench_clearing',
    title: '🥊 연장 12회 빈볼 시비로 촉발된 대형 벤치클리어링',
    description: '상대 마무리 투수의 위협구로 양 팀 더그아웃 전원이 충돌했습니다. KBO 상벌위원회가 소집되었습니다.',
    category: '징계',
    options: [
      {
        text: '⚖️ 제재금 및 벌금 전액 구단 대납 및 선수단 보호 (-10억)',
        effectDesc: '선수단 결속력 폭발 (케미 +15), 예산 -10억',
        chemistryDelta: 15,
        budgetDelta: -10
      },
      {
        text: '📋 당사자 선수들에게 엄중 경고 및 자체 징계',
        effectDesc: '구단주 신뢰 +5, 케미스트리 -10, 팬심 -5',
        ownerTrustDelta: 5,
        chemistryDelta: -10,
        fanSupportDelta: -5
      }
    ]
  },
  {
    id: 'ev_truck_protest',
    title: '🚛 구단 사무소 앞 팬클럽의 근조화환 & 트럭 시위',
    description: '최근 연패와 경기력 저하로 분노한 열성 팬들이 본사 앞에서 트럭 시위를 벌이고 있습니다.',
    category: '팬덤',
    options: [
      {
        text: '🙇 단장이 직접 현장에 나가 커피를 돌리며 소통',
        effectDesc: '팬심 +12, 케미스트리 +5, 구단주 신뢰 -3',
        fanSupportDelta: 12,
        chemistryDelta: 5,
        ownerTrustDelta: -3
      },
      {
        text: '🤐 묵묵부답. "프로는 성적으로만 말한다"',
        effectDesc: '팬심 -10, 구단주 신뢰 +5, 예산 변동 없음',
        fanSupportDelta: -10,
        ownerTrustDelta: 5
      }
    ]
  },
  {
    id: 'ev_abs_machine',
    title: '🤖 KBO ABS(로봇 심판) 존 적응 스트레스 폭발',
    description: '베테랑 타자들이 바깥쪽 낮은 존 판정에 거세게 항의하며 삼진과 퇴장이 늘어나고 있습니다.',
    category: '갈등',
    options: [
      {
        text: '💻 ABS 존 전담 트래킹 VR 훈련 장비 즉시 도입 (-10억)',
        effectDesc: '팀 타격 효율 상승 (+3), 예산 -10억',
        overallDelta: 3,
        budgetDelta: -10
      },
      {
        text: '🗣️ 심판위원장 방문 공식 항의 및 언론 인터뷰',
        effectDesc: '팬심 +8, 구단주 신뢰 -5, 벌금 -3억',
        fanSupportDelta: 8,
        ownerTrustDelta: -5,
        budgetDelta: -3
      }
    ]
  },
  {
    id: 'ev_parent_company_crisis',
    title: '🏢 모기업 경영 악화로 인한 지원금 삭감 위기',
    description: '그룹사의 실적 부진으로 인해 구단에 지원되는 추가 운영비 예산 축소가 통보되었습니다.',
    category: '구단주',
    options: [
      {
        text: '📉 구단 긴축 재정 승인 (-25억 삭감)',
        effectDesc: '예산 -25억, 구단주 신뢰 +12, 케미스트리 -5',
        budgetDelta: -25,
        ownerTrustDelta: 12,
        chemistryDelta: -5
      },
      {
        text: '🧢 마케팅 및 스폰서십 유치로 자체 수익 방어',
        effectDesc: '팬심 +10, 유망주 팜 -5, 예산 -5억 선방',
        fanSupportDelta: 10,
        farmDelta: -5,
        budgetDelta: -5
      }
    ]
  },
  {
    id: 'ev_cheerleader_syndrome',
    title: '🔥 숏폼 챌린지 열풍으로 직관 매진 행렬',
    description: '응원단과 마스코트의 숏폼 댄스가 전 세계적으로 바이럴되며 전 좌석 매진이 이어집니다.',
    category: '팬덤',
    options: [
      {
        text: '🎉 티켓 및 굿즈 수익으로 특별 보너스 배당 (+20억)',
        effectDesc: '예산 +20억, 팬심 +15, 케미스트리 +5',
        budgetDelta: 20,
        fanSupportDelta: 15,
        chemistryDelta: 5
      },
      {
        text: '🏟️ 입장 수익 전액 홈구장 편의시설 리모델링 투자',
        effectDesc: '팬심 대폭 상승 (+25), 구단주 신뢰 +5',
        fanSupportDelta: 25,
        ownerTrustDelta: 5
      }
    ]
  },
  {
    id: 'ev_allstar_selection',
    title: '⭐ 올스타 팬 투표, 우리 팀 선수가 선발 명단에서 탈락했다',
    description: '리그 정상급 성적에도 인기 투표에서 밀리자 선수와 팬들이 공개적으로 아쉬움을 드러냈습니다.',
    category: '팬덤',
    options: [
      { text: '📣 구단 채널에서 대대적인 추가 투표 캠페인', effectDesc: '팬심 +10, 케미 +4, 홍보비 -4억', fanSupportDelta: 10, chemistryDelta: 4, budgetDelta: -4 },
      { text: '🧘 휴식이 보약이다. 선수에게 완전 휴가 부여', effectDesc: '전력 +1, 팬심 -3', overallDelta: 1, fanSupportDelta: -3 }
    ]
  },
  {
    id: 'ev_rain_suspension',
    title: '🌧️ 원정 3연전 연속 우천 취소, 더블헤더 편성 확정',
    description: '선발 로테이션은 여유가 생겼지만 시즌 막판 체력 부담이 커질 일정이 발표됐습니다.',
    category: '부상',
    options: [
      { text: '🔄 6선발 체제로 전환해 체력을 분산한다', effectDesc: '전력 -1, 팜 +7, 케미 +3', overallDelta: -1, farmDelta: 7, chemistryDelta: 3 },
      { text: '🔥 에이스 중심 5인 로테이션을 유지한다', effectDesc: '전력 +2, 케미 -5', overallDelta: 2, chemistryDelta: -5 }
    ]
  },
  {
    id: 'ev_sign_stealing',
    title: '🔍 상대 구단의 사인 훔치기 의혹 영상이 확산됐다',
    description: '우리 배터리의 사인이 노출됐다는 분석 영상이 화제가 되며 전력분석팀이 긴급 보고를 올렸습니다.',
    category: '징계',
    options: [
      { text: '🔐 피치컴과 복합 사인 체계를 즉시 도입', effectDesc: '전력 +2, 예산 -7억', overallDelta: 2, budgetDelta: -7 },
      { text: '🎙️ 증거 영상을 공개하고 KBO에 공식 제소', effectDesc: '팬심 +9, 구단주 신뢰 -4', fanSupportDelta: 9, ownerTrustDelta: -4 }
    ]
  },
  {
    id: 'ev_captain_slump',
    title: '🧢 주장에게 찾아온 28타석 연속 무안타',
    description: '주장은 자신을 선발에서 빼달라고 요청했지만 동료들은 그가 더그아웃의 중심이라며 만류하고 있습니다.',
    category: '갈등',
    options: [
      { text: '🪑 선발 제외 후 대타로 부담을 줄인다', effectDesc: '전력 -1, 케미 +8', overallDelta: -1, chemistryDelta: 8 },
      { text: '🤝 끝까지 3번 타자로 신뢰한다', effectDesc: '전력 변동성 +2, 구단주 신뢰 -3', overallDelta: 2, ownerTrustDelta: -3 }
    ]
  },
  {
    id: 'ev_rookie_balk',
    title: '😰 신인 투수가 만원 관중 앞에서 연속 보크를 범했다',
    description: '경기 후 선수가 눈물을 보였고, 2군 투수코치는 장기적인 관점의 재정비가 필요하다고 조언합니다.',
    category: '유망주',
    options: [
      { text: '🌱 결과와 무관하게 다음 선발 기회를 보장', effectDesc: '전력 -2, 팜 +12, 케미 +5', overallDelta: -2, farmDelta: 12, chemistryDelta: 5 },
      { text: '📋 2군에서 투구폼을 처음부터 교정', effectDesc: '팜 +6, 전력 -1, 구단주 신뢰 +3', farmDelta: 6, overallDelta: -1, ownerTrustDelta: 3 }
    ]
  },
  {
    id: 'ev_merchandise_shortage',
    title: '🧢 인기 선수 유니폼이 전국 매장에서 품절됐다',
    description: '예상보다 큰 주문량으로 생산이 따라가지 못하고 있습니다. 팬들은 재입고 일정을 요구하고 있습니다.',
    category: '팬덤',
    options: [
      { text: '🏭 긴급 증산과 한정판 출시', effectDesc: '예산 +12억, 팬심 +8', budgetDelta: 12, fanSupportDelta: 8 },
      { text: '🎁 선수 이름으로 유소년 야구단에 수익 기부', effectDesc: '예산 +3억, 팬심 +15, 구단주 신뢰 +4', budgetDelta: 3, fanSupportDelta: 15, ownerTrustDelta: 4 }
    ]
  },
  {
    id: 'ev_veteran_retirement',
    title: '🫡 프랜차이즈 베테랑이 시즌 후 은퇴 의사를 밝혔다',
    description: '선수는 조용히 떠나길 원하지만 팬들은 성대한 은퇴 투어를 요구하고 있습니다.',
    category: '갈등',
    options: [
      { text: '🏟️ 전 구장 은퇴 투어와 기념행사 추진', effectDesc: '예산 -8억, 팬심 +18, 케미 +6', budgetDelta: -8, fanSupportDelta: 18, chemistryDelta: 6 },
      { text: '🏆 우승 경쟁에만 집중하고 시즌 후 행사', effectDesc: '전력 +1, 팬심 -6', overallDelta: 1, fanSupportDelta: -6 }
    ]
  },
  {
    id: 'ev_farm_breakout',
    title: '🚀 퓨처스리그에서 무명 타자가 4경기 연속 홈런을 쳤다',
    description: '스카우트팀은 당장 1군 콜업을 주장하지만 감독은 수비 완성도가 부족하다고 반대합니다.',
    category: '유망주',
    options: [
      { text: '⬆️ 즉시 1군 콜업해 지명타자로 기용', effectDesc: '전력 +2, 팜 +5, 케미 -3', overallDelta: 2, farmDelta: 5, chemistryDelta: -3 },
      { text: '🛠️ 시즌 끝까지 2군에서 수비 집중 훈련', effectDesc: '팜 +12, 팬심 -4', farmDelta: 12, fanSupportDelta: -4 }
    ]
  },
  {
    id: 'ev_agent_leak',
    title: '📰 주전 선수의 연장계약 요구액이 언론에 유출됐다',
    description: '에이전트가 흘린 것으로 의심되는 거액의 요구 조건이 팬 커뮤니티를 뜨겁게 달구고 있습니다.',
    category: '갈등',
    options: [
      { text: '✍️ 시즌 중 조기 연장계약으로 불씨 차단', effectDesc: '예산 -18억, 케미 +8, 전력 +1', budgetDelta: -18, chemistryDelta: 8, overallDelta: 1 },
      { text: '🚪 협상은 시즌 후. 에이전트에 강경 대응', effectDesc: '구단주 신뢰 +7, 케미 -8, 팬심 -3', ownerTrustDelta: 7, chemistryDelta: -8, fanSupportDelta: -3 }
    ]
  },
  {
    id: 'ev_food_poisoning',
    title: '🤢 원정 숙소 집단 식중독, 주전 4명 출전 불투명',
    description: '더블헤더를 하루 앞두고 선수단 다수가 복통을 호소합니다. 경기 강행 여부를 빠르게 결정해야 합니다.',
    category: '부상',
    options: [
      { text: '🏥 KBO에 경기 연기를 공식 요청', effectDesc: '전력 보존, 구단주 신뢰 -5, 예산 -3억', ownerTrustDelta: -5, budgetDelta: -3 },
      { text: '🚌 퓨처스 선수단 긴급 이동 및 경기 강행', effectDesc: '전력 -3, 팜 +10, 팬심 +5', overallDelta: -3, farmDelta: 10, fanSupportDelta: 5 }
    ]
  },
  {
    id: 'ev_pitch_clock',
    title: '⏱️ 피치클락 위반으로 마무리 투수가 연속 볼 판정을 받았다',
    description: '새 규정에 적응하지 못한 투수진의 경기 템포가 흔들리고 있습니다. 전담 코치가 즉각적인 교정을 제안했습니다.',
    category: '갈등',
    options: [
      { text: '🎥 전 투수 대상 템포 분석 프로그램 도입', effectDesc: '전력 +2, 예산 -6억', overallDelta: 2, budgetDelta: -6 },
      { text: '🧢 포수에게 경기 운영 전권 부여', effectDesc: '케미 +7, 전력 +1', chemistryDelta: 7, overallDelta: 1 }
    ]
  },
  {
    id: 'ev_foreign_homesick',
    title: '🌎 외국인 에이스가 가족 문제로 귀국을 요청했다',
    description: '선수는 2주 안에 돌아오겠다고 약속했지만 중요한 상위권 연전과 일정이 겹칩니다.',
    category: '외국인',
    options: [
      { text: '✈️ 가족 동반 귀국을 허용하고 전폭 지원', effectDesc: '전력 -2, 케미 +10, 예산 -3억', overallDelta: -2, chemistryDelta: 10, budgetDelta: -3 },
      { text: '📅 시즌 종료까지 잔류를 설득', effectDesc: '전력 +2, 케미 -9', overallDelta: 2, chemistryDelta: -9 }
    ]
  },
  {
    id: 'ev_doping_rumor',
    title: '🧪 주축 타자를 둘러싼 금지약물 익명 제보',
    description: '사실관계가 확인되지 않은 제보가 언론에 전달됐습니다. 침묵할수록 소문은 빠르게 커지고 있습니다.',
    category: '징계',
    options: [
      { text: '🔬 즉시 자발적 검사와 결과 전면 공개', effectDesc: '구단주 신뢰 +10, 팬심 +5, 전력 -1', ownerTrustDelta: 10, fanSupportDelta: 5, overallDelta: -1 },
      { text: '⚖️ 법무팀을 통해 보도 금지 강경 대응', effectDesc: '예산 -7억, 팬심 -5, 전력 유지', budgetDelta: -7, fanSupportDelta: -5 }
    ]
  },
  {
    id: 'ev_stadium_blackout',
    title: '💡 홈경기 7회, 갑작스러운 조명탑 정전',
    description: '경기가 48분간 중단됐고 시설 노후화 논란이 전국 뉴스로 번졌습니다.',
    category: '구단주',
    options: [
      { text: '🏗️ 조명과 전력 설비 전면 교체', effectDesc: '예산 -16억, 팬심 +10, 구단주 신뢰 +5', budgetDelta: -16, fanSupportDelta: 10, ownerTrustDelta: 5 },
      { text: '🔧 긴급 보수만 진행하고 비용 최소화', effectDesc: '예산 -3억, 팬심 -8', budgetDelta: -3, fanSupportDelta: -8 }
    ]
  },
  {
    id: 'ev_bullpen_phone',
    title: '☎️ 불펜 전화 착오로 준비되지 않은 투수가 등판했다',
    description: '코칭스태프의 소통 실수가 역전패로 이어졌습니다. 감독과 투수코치가 서로 책임을 미루고 있습니다.',
    category: '갈등',
    options: [
      { text: '📋 투수코치에게 공식 경고 및 매뉴얼 개편', effectDesc: '전력 +1, 케미 -5, 신뢰 +4', overallDelta: 1, chemistryDelta: -5, ownerTrustDelta: 4 },
      { text: '🤝 내부 문제로 정리하고 코칭스태프 보호', effectDesc: '케미 +8, 팬심 -6', chemistryDelta: 8, fanSupportDelta: -6 }
    ]
  },
  {
    id: 'ev_scout_poaching',
    title: '🕵️ 라이벌 구단이 수석 스카우트에게 파격적인 이직 제안을 보냈다',
    description: '최근 드래프트 성공을 이끈 핵심 인력이 시즌 도중 흔들리고 있습니다.',
    category: '유망주',
    options: [
      { text: '💼 연봉 인상과 장기계약으로 잔류시킨다', effectDesc: '예산 -8억, 팜 +12', budgetDelta: -8, farmDelta: 12 },
      { text: '🌱 젊은 스카우트에게 승진 기회 부여', effectDesc: '팜 +5, 구단주 신뢰 +5', farmDelta: 5, ownerTrustDelta: 5 }
    ]
  },
  {
    id: 'ev_broken_bat',
    title: '🪵 경기 중 부러진 배트가 관중석으로 날아갔다',
    description: '다행히 큰 부상은 없었지만 안전망과 장비 관리 책임을 두고 여론이 악화됐습니다.',
    category: '팬덤',
    options: [
      { text: '🛡️ 전 좌석 안전망 교체와 피해자 지원', effectDesc: '예산 -9억, 팬심 +12', budgetDelta: -9, fanSupportDelta: 12 },
      { text: '📄 규정상 문제없다는 공식 입장 발표', effectDesc: '예산 보존, 팬심 -10, 구단주 신뢰 +3', fanSupportDelta: -10, ownerTrustDelta: 3 }
    ]
  },
  {
    id: 'ev_national_team',
    title: '🇰🇷 국가대표팀이 주전 선수 5명을 동시에 차출했다',
    description: '구단의 명예는 높아졌지만 리그 재개 직후 체력 저하와 공백이 우려됩니다.',
    category: '부상',
    options: [
      { text: '🏅 차출을 전폭 지원하고 대체 선수 육성', effectDesc: '전력 -2, 팜 +10, 팬심 +8', overallDelta: -2, farmDelta: 10, fanSupportDelta: 8 },
      { text: '📨 일부 선수의 차출 제외를 협회에 요청', effectDesc: '전력 +1, 팬심 -6, 구단주 신뢰 -3', overallDelta: 1, fanSupportDelta: -6, ownerTrustDelta: -3 }
    ]
  },
  {
    id: 'ev_catcher_collision',
    title: '💥 홈 충돌 이후 주전 포수가 어지럼증을 호소했다',
    description: '검사 결과는 정상이지만 의료진은 뇌진탕 프로토콜 적용을 권고합니다.',
    category: '부상',
    options: [
      { text: '🏥 즉시 10일 부상자 명단에 등록', effectDesc: '전력 -2, 케미 +7', overallDelta: -2, chemistryDelta: 7 },
      { text: '🥽 보호 장비 보강 후 대타 출전', effectDesc: '전력 +1, 케미 -6, 예산 -2억', overallDelta: 1, chemistryDelta: -6, budgetDelta: -2 }
    ]
  },
  {
    id: 'ev_mascot_accident',
    title: '🦖 마스코트의 시구 퍼포먼스가 예상치 못한 화제가 됐다',
    description: '우스꽝스러운 실수 영상이 해외까지 퍼지며 구단 계정 팔로워가 급증했습니다.',
    category: '팬덤',
    options: [
      { text: '📱 밈을 활용한 글로벌 굿즈 출시', effectDesc: '예산 +9억, 팬심 +9', budgetDelta: 9, fanSupportDelta: 9 },
      { text: '🎪 홈 6연전 특별 퍼포먼스로 확대', effectDesc: '예산 -3억, 팬심 +15', budgetDelta: -3, fanSupportDelta: 15 }
    ]
  },
  {
    id: 'ev_minor_bus',
    title: '🚌 퓨처스 선수단 버스 고장으로 경기 출전이 무산됐다',
    description: '노후 차량과 열악한 2군 지원 환경이 선수 가족들의 공개 비판을 받고 있습니다.',
    category: '유망주',
    options: [
      { text: '🚍 전용 버스와 원정 지원 체계 전면 교체', effectDesc: '예산 -11억, 팜 +15, 케미 +4', budgetDelta: -11, farmDelta: 15, chemistryDelta: 4 },
      { text: '🔧 차량 수리와 담당자 문책으로 마무리', effectDesc: '예산 -2억, 팜 -7, 신뢰 +3', budgetDelta: -2, farmDelta: -7, ownerTrustDelta: 3 }
    ]
  },
  {
    id: 'ev_salary_dispute',
    title: '💰 연봉 고과를 둘러싼 선수단 집단 불만',
    description: '비슷한 성적에도 연봉 인상률이 다르다는 내부 자료가 퍼지며 라커룸 분위기가 냉랭해졌습니다.',
    category: '갈등',
    options: [
      { text: '📊 고과 기준을 공개하고 특별 인센티브 지급', effectDesc: '예산 -10억, 케미 +13', budgetDelta: -10, chemistryDelta: 13 },
      { text: '🔒 계약은 비공개 원칙이라며 강경 대응', effectDesc: '구단주 신뢰 +7, 케미 -12', ownerTrustDelta: 7, chemistryDelta: -12 }
    ]
  },
  {
    id: 'ev_foul_ball',
    title: '⚾ 어린이 팬이 파울볼에 맞아 병원으로 이송됐다',
    description: '선수는 직접 병문안을 원하고, 구단은 홈구장 안전 대책 발표를 준비하고 있습니다.',
    category: '팬덤',
    options: [
      { text: '🏥 치료비 전액 지원과 선수단 병문안', effectDesc: '예산 -4억, 팬심 +14, 케미 +4', budgetDelta: -4, fanSupportDelta: 14, chemistryDelta: 4 },
      { text: '🎟️ 전 관중 대상 안전 캠페인 실시', effectDesc: '예산 -7억, 팬심 +10, 신뢰 +5', budgetDelta: -7, fanSupportDelta: 10, ownerTrustDelta: 5 }
    ]
  },
  {
    id: 'ev_umpire_ejection',
    title: '🟥 감독이 판정 항의 끝에 시즌 세 번째 퇴장을 당했다',
    description: '팬들은 투지를 칭찬하지만 구단주는 반복되는 벌금과 이미지 손상을 우려합니다.',
    category: '징계',
    options: [
      { text: '🔥 감독을 공개 지지하고 벌금 대납', effectDesc: '팬심 +12, 케미 +7, 예산 -3억', fanSupportDelta: 12, chemistryDelta: 7, budgetDelta: -3 },
      { text: '📌 재발 시 징계한다는 공식 경고', effectDesc: '구단주 신뢰 +8, 케미 -8', ownerTrustDelta: 8, chemistryDelta: -8 }
    ]
  },
  {
    id: 'ev_independent_star',
    title: '💎 독립리그에서 160km를 던지는 무명 투수가 발견됐다',
    description: '제구는 불안하지만 여러 구단이 동시에 테스트를 제안하며 영입 경쟁이 시작됐습니다.',
    category: '유망주',
    options: [
      { text: '💸 계약금 6억을 제시해 즉시 선점', effectDesc: '예산 -6억, 팜 +14, 전력 +1', budgetDelta: -6, farmDelta: 14, overallDelta: 1 },
      { text: '🔎 2주간 추가 관찰 후 판단', effectDesc: '팜 +5, 영입 실패 위험', farmDelta: 5 }
    ]
  },
  {
    id: 'ev_social_media',
    title: '📱 선수가 심야 SNS 라이브에서 감독 전술을 비판했다',
    description: '영상은 곧 삭제됐지만 이미 팬 커뮤니티와 스포츠 뉴스에 빠르게 퍼졌습니다.',
    category: '갈등',
    options: [
      { text: '🤐 공개 사과와 벌금 징계', effectDesc: '신뢰 +6, 케미 -7, 팬심 -3', ownerTrustDelta: 6, chemistryDelta: -7, fanSupportDelta: -3 },
      { text: '🗣️ 감독과 선수의 공개 화해 인터뷰', effectDesc: '케미 +8, 팬심 +6, 신뢰 -3', chemistryDelta: 8, fanSupportDelta: 6, ownerTrustDelta: -3 }
    ]
  },
  {
    id: 'ev_ticket_price',
    title: '🎫 구단의 주말 티켓 가격 인상안이 이사회에 올라왔다',
    description: '재정팀은 큰 수익을 예상하지만 팬클럽은 야구의 대중성을 해친다며 반발합니다.',
    category: '구단주',
    options: [
      { text: '📈 인기 좌석 가격을 인상한다', effectDesc: '예산 +16억, 팬심 -12, 신뢰 +5', budgetDelta: 16, fanSupportDelta: -12, ownerTrustDelta: 5 },
      { text: '👨‍👩‍👧 가족석 가격을 동결하고 수익을 포기', effectDesc: '팬심 +12, 신뢰 -3', fanSupportDelta: 12, ownerTrustDelta: -3 }
    ]
  },
  {
    id: 'ev_batboy',
    title: '❤️ 배트보이가 쓰러진 선수를 도운 장면이 전국에 중계됐다',
    description: '어린 스태프의 침착한 대응이 감동을 주며 구단 문화에 대한 호평이 이어집니다.',
    category: '팬덤',
    options: [
      { text: '🎓 장학금과 정식 표창을 수여', effectDesc: '예산 -2억, 팬심 +12, 케미 +5', budgetDelta: -2, fanSupportDelta: 12, chemistryDelta: 5 },
      { text: '🤲 지역 안전교육 캠페인으로 확대', effectDesc: '예산 -5억, 팬심 +16, 신뢰 +4', budgetDelta: -5, fanSupportDelta: 16, ownerTrustDelta: 4 }
    ]
  },
  {
    id: 'ev_video_room',
    title: '📹 전력분석 영상 서버가 랜섬웨어 공격을 받았다',
    description: '상대 분석 자료와 선수 개인 영상 일부가 잠겨 다음 시리즈 준비에 차질이 생겼습니다.',
    category: '구단주',
    options: [
      { text: '🛡️ 보안 업체와 데이터 시스템 전면 재구축', effectDesc: '예산 -14억, 전력 +2, 신뢰 +5', budgetDelta: -14, overallDelta: 2, ownerTrustDelta: 5 },
      { text: '📓 현장 스카우트의 수기 보고서로 대응', effectDesc: '전력 -2, 예산 보존, 케미 +3', overallDelta: -2, chemistryDelta: 3 }
    ]
  },
  {
    id: 'ev_rule5',
    title: '📋 2차 드래프트 보호선수 명단 유출 사고',
    description: '보호 대상에서 빠진 베테랑과 유망주들이 자신들의 이름을 확인하며 동요하고 있습니다.',
    category: '갈등',
    options: [
      { text: '🙇 단장이 선수단 앞에서 직접 사과', effectDesc: '케미 +10, 신뢰 -5', chemistryDelta: 10, ownerTrustDelta: -5 },
      { text: '🧾 명단은 검토안일 뿐이라며 원칙 고수', effectDesc: '신뢰 +6, 케미 -10, 팬심 -3', ownerTrustDelta: 6, chemistryDelta: -10, fanSupportDelta: -3 }
    ]
  },
  {
    id: 'ev_sponsor_uniform',
    title: '👕 신규 스폰서가 전통 유니폼 색상 변경을 요구했다',
    description: '거액 후원 조건이지만 오랜 팬들은 구단 정체성을 팔아넘기는 일이라며 반대합니다.',
    category: '구단주',
    options: [
      { text: '💵 특별 유니폼 10경기 조건으로 타협', effectDesc: '예산 +18억, 팬심 -7, 신뢰 +6', budgetDelta: 18, fanSupportDelta: -7, ownerTrustDelta: 6 },
      { text: '🎨 전통 색상을 지키고 후원 제안 거절', effectDesc: '팬심 +14, 구단주 신뢰 -5', fanSupportDelta: 14, ownerTrustDelta: -5 }
    ]
  },
  {
    id: 'ev_bench_leak',
    title: '🗞️ 선발 라인업이 경기 5시간 전 상대 팀에 유출됐다',
    description: '내부 관계자가 정보를 흘렸다는 의혹 속에 선수단 전체가 서로를 의심하기 시작했습니다.',
    category: '징계',
    options: [
      { text: '🔍 외부 감사팀을 불러 철저히 조사', effectDesc: '예산 -6억, 신뢰 +8, 케미 -5', budgetDelta: -6, ownerTrustDelta: 8, chemistryDelta: -5 },
      { text: '🔒 라인업 공개 절차만 바꾸고 조용히 수습', effectDesc: '전력 +1, 팬심 -4', overallDelta: 1, fanSupportDelta: -4 }
    ]
  }
]
