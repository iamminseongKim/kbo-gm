import { SeasonEvent } from '../types'

export const PRESEASON_DECISIONS = [
  {
    id: 'pre_fa_market',
    title: '📢 FA(자유계약선수) 시장 개장',
    description: '리그 최정상급 FA 선수가 시장에 나왔습니다. 구단의 미래 예산과 전력을 결정해야 합니다.',
    category: '트레이드' as const,
    options: [
      {
        text: '🔥 80억 통큰 베팅! 국가대표급 중심타자 영입',
        effectDesc: '팀 전력 대폭 상승 (+6), 예산 -80억, 팬심 +15',
        overallDelta: 6,
        budgetDelta: -80,
        fanSupportDelta: 15,
        ownerTrustDelta: 5
      },
      {
        text: '🛡️ 알짜배기 20억 불펜 요원 영입',
        effectDesc: '팀 전력 소폭 상승 (+2), 예산 -20억, 케미스트리 +5',
        overallDelta: 2,
        budgetDelta: -20,
        chemistryDelta: 5
      },
      {
        text: '🌱 FA 철수! 유망주 팜과 육성에 올인',
        effectDesc: '유망주 팜 +15, 예산 보존 (+10억 지원금), 팬심 -5',
        farmDelta: 15,
        budgetDelta: 10,
        fanSupportDelta: -5
      }
    ]
  },
  {
    id: 'pre_foreign_player',
    title: '✈️ 외국인 선수 스카우트',
    description: '메이저리그 40인 로스터 출신 거물급 후보와 남미 리그 흙속의 진주가 보고되었습니다.',
    category: '외국인' as const,
    options: [
      {
        text: '💎 MLB 출신 155km 특급 선발 영입 (15억)',
        effectDesc: '팀 전력 상승 (+4), 예산 -15억, 팬심 +10',
        overallDelta: 4,
        budgetDelta: -15,
        fanSupportDelta: 10
      },
      {
        text: '⚾ 가성비 뛰어난 KBO 경력직 투수 영입 (8억)',
        effectDesc: '팀 전력 안정 (+2), 예산 -8억, 케미스트리 +5',
        overallDelta: 2,
        budgetDelta: -8,
        chemistryDelta: 5
      },
      {
        text: '🎰 로또형 거포 외인 타자 깜짝 영입 (5억)',
        effectDesc: '팀 전력 변동 (+3), 예산 -5억, 케미스트리 -3',
        overallDelta: 3,
        budgetDelta: -5,
        chemistryDelta: -3
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
        text: '🔬 최첨단 바이오메카닉스 랩 구축 (30억)',
        effectDesc: '유망주 팜 +20, 부상 억제, 예산 -30억',
        farmDelta: 20,
        budgetDelta: -30,
        ownerTrustDelta: 5
      },
      {
        text: '🍗 선수단 식단 및 트레이닝 지원 개선 (10억)',
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
        text: '🛌 4주간 완벽한 휴식과 치료 부여 (유망주 콜업)',
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
    id: 'ev_foreign_slump',
    title: '📉 외국인 4번 타자의 극심한 2할대 빈타',
    description: '기대를 모았던 외국인 타자가 변화구에 전혀 대처하지 못하며 타선의 혈을 막고 있습니다.',
    category: '외국인',
    options: [
      {
        text: '⚡ 즉시 방출 및 대체 외인 긴급 수혈 (-12억)',
        effectDesc: '팀 전력 상승 (+3), 예산 -12억, 팬심 +8',
        overallDelta: 3,
        budgetDelta: -12,
        fanSupportDelta: 8
      },
      {
        text: '🤝 믿음의 야구! 2군 조정 후 기회 지속 부여',
        effectDesc: '케미스트리 +5, 팀 전력 변동 없음, 팬심 -5',
        chemistryDelta: 5,
        fanSupportDelta: -5
      }
    ]
  },
  {
    id: 'ev_manager_conflict',
    title: '💥 현장 감독과 데이터 분석팀의 정면 충돌',
    description: '감독이 데이터팀의 극단적 수비 시프트 지침을 거부하며 프런트와 갈등을 빚고 있습니다.',
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
    id: 'ev_trade_deadline',
    title: '⏰ 트레이드 마감일! 윈나우(Win-Now) 승부수?',
    description: '지방 구단에서 국가대표급 베테랑 불펜을 1라운드 지명권과 유망주 2명 패키지로 제안했습니다.',
    category: '트레이드',
    options: [
      {
        text: '🏆 우승을 위해 미래를 건다! 트레이드 성사',
        effectDesc: '즉시 전력 상승 (+4), 유망주 팜 -15, 팬심 +10',
        overallDelta: 4,
        farmDelta: -15,
        fanSupportDelta: 10
      },
      {
        text: '🛑 미래가 더 소중하다! 정중히 거절',
        effectDesc: '유망주 팜 보존, 구단주 신뢰 +3, 팬심 -5',
        farmDelta: 3,
        ownerTrustDelta: 3,
        fanSupportDelta: -5
      }
    ]
  },
  {
    id: 'ev_truck_protest',
    title: '🚛 구단 사무소 앞 팬클럽의 근조화환 & 트럭 시위',
    description: '최근 연패와 경기력 저하로 분노한 열성 팬들이 본사 앞에서 트럭 시위를 벌이고 있습니다.',
    category: '구단주',
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
    id: 'ev_rookie_breakout',
    title: '✨ 2군 18세 신인 투수의 153km 깜짝 호투',
    description: '퓨처스리그에서 고졸 신인이 무실점 행진을 이어가며 1군 호출을 강력히 요구하고 있습니다.',
    category: '유망주',
    options: [
      {
        text: '🚀 당장 1군 필승조로 파격 콜업',
        effectDesc: '팀 전력 상승 (+3), 케미스트리 -3, 팬심 +8',
        overallDelta: 3,
        chemistryDelta: -3,
        fanSupportDelta: 8
      },
      {
        text: '⏳ 아직 미완의 대기, 2군에서 투구수 관리 육성',
        effectDesc: '유망주 팜 +10, 구단주 신뢰 +3',
        farmDelta: 10,
        ownerTrustDelta: 3
      }
    ]
  }
]
