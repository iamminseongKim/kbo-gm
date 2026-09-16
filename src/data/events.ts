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
  }
]
