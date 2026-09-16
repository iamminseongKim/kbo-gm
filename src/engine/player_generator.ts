import { ForeignCandidate, RookieProspect, Position, Player } from '../types'
import { PRNG } from './prng'


const FOREIGN_LAST_NAMES = [
  '로메로', '산체스', '쿠에바스', '뷰캐넌', '맥키넌', '라모스', '로하스', '폰트', '켈리', '오스틴',
  '알칸타라', '페냐', '디아즈', '레이예스', '앤더슨', '헤이수스', '헤르난데스', '발데스'
]

const FOREIGN_PITCHER_TRAITS = [
  ['마구 스위퍼', '155km 강속구', '빅게임 피처'],
  ['땅볼 유도 싱커', '좌완 특급', '체력왕'],
  ['각도 큰 커브', '탈삼진 머신', '제구 도사'],
  ['무회전 포크볼', '이닝이터', '싸움닭 기질']
]

const FOREIGN_BATTER_TRAITS = [
  ['30홈런 파워', '클러치 히터', '중장거리 슬러거'],
  ['5툴 플레이어', '정교한 컨택', '레이저 송구'],
  ['라인드라이브 머신', '뛰어난 선구안', '찬스 해결사'],
  ['압도적 비거리', '잠실 펜스 브레이커', '빠른 배트스피드']
]

const KOREAN_SURNAMES = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임', '한', '오', '서', '신', '권']
const KOREAN_FIRST_NAMES = [
  '도영', '시환', '동희', '우혁', '민우', '현준', '지원', '태인', '승호', '의리', '영웅', '재현',
  '원빈', '주원', '건우', '도윤', '서진', '하람', '시우', '도현', '준서', '준호', '태민', '진우'
]

const HIGH_SCHOOLS = ['덕수고', '휘문고', '북일고', '경북고', '부산고', '광주일고', '장충고', '유신고', '세광고', '대구상원고']
const UNIVERSITIES = ['고려대', '연세대', '동국대', '인하대', '단국대', '원광대', '한양대', '건국대']

const ASIAN_NAMES = [
  '사토', '타나카', '스즈키', '야마다', '오오타니', '야마모토', '왕웨이중', '첸관위', '린즈웨이', '요시다', '마에다', '이토'
]

export function generateForeignCandidates(prng: PRNG, season: number): ForeignCandidate[] {
  const candidates: ForeignCandidate[] = []

  // 1. 에이스급 선발 투수 (SP) - MLB 40인 로스터 출신
  const p1LastName = prng.choice(FOREIGN_LAST_NAMES)
  const p1Traits = prng.choice(FOREIGN_PITCHER_TRAITS)
  const p1Stuff = prng.nextInt(91, 96)
  const p1Control = prng.nextInt(88, 94)
  const p1Ovr = Math.round((p1Stuff + p1Control) / 2)
  candidates.push({
    id: `foreign_sp_${season}_${prng.nextInt(100, 999)}`,
    name: p1LastName,
    position: 'SP',
    age: prng.nextInt(28, 33),
    salary: prng.nextInt(18, 24), // 18~24억원
    previousTeam: 'MLB 트리플A 탈삼진 1위',
    scoutSummary: 'MLB급 154km 강속구와 횡으로 크게 꺾이는 명품 스위퍼를 장착한 외인 1선발.',
    isPitcher: true,
    pitcherStats: {
      stuff: p1Stuff,
      control: p1Control,
      breaking: prng.nextInt(88, 95),
      clutch: prng.nextInt(85, 93),
      stamina: prng.nextInt(88, 95)
    },
    overall: p1Ovr,
    traits: p1Traits,
    country: '미국'
  })

  // 2. 가성비 안정형 선발 투수 (SP)
  let p2LastName = prng.choice(FOREIGN_LAST_NAMES)
  while (p2LastName === p1LastName) {
    p2LastName = prng.choice(FOREIGN_LAST_NAMES)
  }
  const p2Traits = prng.choice(FOREIGN_PITCHER_TRAITS)
  const p2Stuff = prng.nextInt(85, 89)
  const p2Control = prng.nextInt(87, 92)
  const p2Ovr = Math.round((p2Stuff + p2Control) / 2)
  candidates.push({
    id: `foreign_sp_value_${season}_${prng.nextInt(100, 999)}`,
    name: p2LastName,
    position: 'SP',
    age: prng.nextInt(29, 34),
    salary: prng.nextInt(11, 15), // 11~15억원
    previousTeam: '베네수엘라 윈터리그 에이스',
    scoutSummary: '구속 148km 수준이나 날카로운 핀포인트 제구력과 다양한 변화구로 6이닝을 책임지는 이닝이터.',
    isPitcher: true,
    pitcherStats: {
      stuff: p2Stuff,
      control: p2Control,
      breaking: prng.nextInt(84, 90),
      clutch: prng.nextInt(82, 88),
      stamina: prng.nextInt(85, 92)
    },
    overall: p2Ovr,
    traits: p2Traits,
    country: '베네수엘라'
  })

  // 3. 중심타선 거포형 야수 (1B/OF)
  let b1LastName = prng.choice(FOREIGN_LAST_NAMES)
  while (b1LastName === p1LastName || b1LastName === p2LastName) {
    b1LastName = prng.choice(FOREIGN_LAST_NAMES)
  }
  const b1Traits = prng.choice(FOREIGN_BATTER_TRAITS)
  const b1Contact = prng.nextInt(85, 91)
  const b1Power = prng.nextInt(92, 97)
  const b1Ovr = Math.round((b1Contact * 0.45) + (b1Power * 0.55))
  candidates.push({
    id: `foreign_batter_slugger_${season}_${prng.nextInt(100, 999)}`,
    name: b1LastName,
    position: prng.choice(['1B', 'OF', '3B'] as Position[]),
    age: prng.nextInt(27, 32),
    salary: prng.nextInt(16, 22), // 16~22억원
    previousTeam: '도미니카 윈터리그 홈런왕',
    scoutSummary: '타구 속도 175km를 가볍게 넘기는 타고난 파워 히터. 잠실에서도 장외 홈런을 때려낼 수 있는 거포.',
    isPitcher: false,
    batterStats: {
      contact: b1Contact,
      power: b1Power,
      eye: prng.nextInt(82, 89),
      speed: prng.nextInt(65, 78),
      defense: prng.nextInt(70, 82),
      stamina: prng.nextInt(85, 92)
    },
    overall: b1Ovr,
    traits: b1Traits,
    country: '도미니카'
  })

  // 4. 호타준족형 외야수/내야수 (OF/2B/SS)
  let b2LastName = prng.choice(FOREIGN_LAST_NAMES)
  while (b2LastName === p1LastName || b2LastName === p2LastName || b2LastName === b1LastName) {
    b2LastName = prng.choice(FOREIGN_LAST_NAMES)
  }
  const b2Contact = prng.nextInt(89, 94)
  const b2Power = prng.nextInt(82, 88)
  const b2Ovr = Math.round((b2Contact * 0.55) + (b2Power * 0.45))
  candidates.push({
    id: `foreign_batter_contact_${season}_${prng.nextInt(100, 999)}`,
    name: b2LastName,
    position: prng.choice(['OF', 'SS', '2B'] as Position[]),
    age: prng.nextInt(26, 31),
    salary: prng.nextInt(13, 17),
    previousTeam: 'MLB AAA 올스타 외야수',
    scoutSummary: '3할 타율을 기대할 수 있는 스프레이 히터이자 넓은 수비 범위를 자랑하는 5툴 플레이어.',
    isPitcher: false,
    batterStats: {
      contact: b2Contact,
      power: b2Power,
      eye: prng.nextInt(88, 95),
      speed: prng.nextInt(85, 92),
      defense: prng.nextInt(88, 94),
      stamina: prng.nextInt(86, 92)
    },
    overall: b2Ovr,
    traits: ['5툴 플레이어', '정교한 컨택', '넓은 수비 범위'],
    country: '미국'
  })

  // 5. 아시아쿼터 특급 투수 (NPB/CPBL 출신)
  const a1Name = prng.choice(ASIAN_NAMES)
  const a1Country = prng.choice(['일본', '대만'])
  const a1Stuff = prng.nextInt(86, 90)
  const a1Control = prng.nextInt(88, 93)
  candidates.push({
    id: `asian_pitcher_${season}_${prng.nextInt(100, 999)}`,
    name: a1Name,
    position: prng.choice(['SP', 'RP'] as Position[]),
    age: prng.nextInt(27, 33),
    salary: prng.nextInt(7, 10), // 아시아쿼터 가성비 연봉 7~10억원
    previousTeam: `${a1Country} 프로리그 올스타`,
    scoutSummary: `예리한 포크볼과 높은 제구 안정성을 자랑하는 아시아쿼터 즉시전력감 투수.`,
    isPitcher: true,
    pitcherStats: {
      stuff: a1Stuff,
      control: a1Control,
      breaking: prng.nextInt(87, 93),
      clutch: prng.nextInt(84, 90),
      stamina: prng.nextInt(84, 91)
    },
    overall: Math.round((a1Stuff + a1Control) / 2),
    traits: ['아시아쿼터 특급', '칼날 제구', '낙차 큰 포크볼'],
    isAsianQuota: true,
    country: a1Country
  })

  // 6. 아시아쿼터 정교한 야수 (NPB/CPBL 출신)
  let a2Name = prng.choice(ASIAN_NAMES)
  while (a2Name === a1Name) {
    a2Name = prng.choice(ASIAN_NAMES)
  }
  const a2Country = prng.choice(['일본', '대만'])
  const a2Contact = prng.nextInt(88, 93)
  const a2Power = prng.nextInt(75, 82)
  candidates.push({
    id: `asian_batter_${season}_${prng.nextInt(100, 999)}`,
    name: a2Name,
    position: prng.choice(['2B', 'SS', 'OF'] as Position[]),
    age: prng.nextInt(26, 32),
    salary: prng.nextInt(6, 9),
    previousTeam: `${a2Country} 골든글러브 내야수`,
    scoutSummary: `실책 없는 물샐틈없는 그물망 수비와 높은 컨택 성공률을 보유한 아시아쿼터 수비 기둥.`,
    isPitcher: false,
    batterStats: {
      contact: a2Contact,
      power: a2Power,
      eye: prng.nextInt(87, 94),
      speed: prng.nextInt(82, 89),
      defense: prng.nextInt(92, 96),
      stamina: prng.nextInt(84, 90)
    },
    overall: Math.round((a2Contact * 0.5) + (a2Power * 0.5)),
    traits: ['아시아쿼터 내야수', '명품 그물망 수비', '작전수행 도사'],
    isAsianQuota: true,
    country: a2Country
  })

  return candidates
}

export function generateRookieProspects(prng: PRNG, season: number, rebuildStack = 0): RookieProspect[] {
  const prospects: RookieProspect[] = []
  const statBoost = Math.min(5, rebuildStack * 2)
  const bonusDiscount = Math.min(3, rebuildStack)

  // 1. 전체 1순위급 초고교급 파이어볼러 (SP)
  const p1Name = `${prng.choice(KOREAN_SURNAMES)}${prng.choice(KOREAN_FIRST_NAMES)}`
  const p1School = prng.choice(HIGH_SCHOOLS)
  const p1Stuff = prng.nextInt(82, 87) + statBoost
  const p1Control = prng.nextInt(74, 80) + statBoost
  prospects.push({
    id: `rookie_${season}_1`,
    name: p1Name,
    position: 'SP',
    age: 19,
    school: p1School,
    signingBonus: Math.max(3, 8 - bonusDiscount),
    scoutSummary: rebuildStack > 0
      ? `[리빌딩 집중 스카우팅] 최고 157km 강속구를 던지는 세기의 대어. 팜 시스템 집중 투자로 조기 1군 완성형.`
      : '최고 154km를 마크하는 아마추어 최대어. 향후 10년간 국가대표 에이스를 책임질 특급 파이어볼러.',
    isPitcher: true,
    pitcherStats: {
      stuff: p1Stuff,
      control: p1Control,
      breaking: prng.nextInt(75, 82) + statBoost,
      clutch: prng.nextInt(72, 80),
      stamina: prng.nextInt(80, 86)
    },
    overall: Math.round((p1Stuff + p1Control) / 2),
    potential: 'S',
    traits: rebuildStack > 0 ? ['157km 괴물투수', '세기의 재능', '초고교급 최대어'] : ['154km 파이어볼러', '초고교급 최대어', '탈삼진 본능']
  })

  // 2. 대학 최고의 대형 내야수/포수 (즉시전력감)
  let p2Name = `${prng.choice(KOREAN_SURNAMES)}${prng.choice(KOREAN_FIRST_NAMES)}`
  while (p2Name === p1Name) {
    p2Name = `${prng.choice(KOREAN_SURNAMES)}${prng.choice(KOREAN_FIRST_NAMES)}`
  }
  const p2School = prng.choice(UNIVERSITIES)
  const p2Pos = prng.choice(['SS', 'C', '3B'] as Position[])
  const p2Contact = prng.nextInt(78, 83) + statBoost
  const p2Power = prng.nextInt(76, 82) + statBoost
  prospects.push({
    id: `rookie_${season}_2`,
    name: p2Name,
    position: p2Pos,
    age: 23,
    school: p2School,
    signingBonus: Math.max(2, 5 - bonusDiscount),
    scoutSummary: rebuildStack > 0
      ? `[리빌딩 집중 스카우팅] 대학 통산 4할 20홈런의 완성형 5툴 내야수. 즉시 1군 주전 활약 가능.`
      : '대학 리그를 평정한 타격왕 출신. 타석에서의 침착함과 탄탄한 수비로 당장 1군 주전 도약이 가능한 자원.',
    isPitcher: false,
    batterStats: {
      contact: p2Contact,
      power: p2Power,
      eye: prng.nextInt(80, 86) + statBoost,
      speed: prng.nextInt(72, 80),
      defense: prng.nextInt(78, 85) + statBoost,
      stamina: prng.nextInt(80, 88)
    },
    overall: Math.round((p2Contact + p2Power) / 2),
    potential: rebuildStack >= 2 ? 'S' : 'A+',
    traits: ['대학 타격왕', '수비 완성형', '즉시 전력감']
  })

  // 3. 고교 5툴 포텐셜 외야수 (가성비 육성형)
  let p3Name = `${prng.choice(KOREAN_SURNAMES)}${prng.choice(KOREAN_FIRST_NAMES)}`
  while (p3Name === p1Name || p3Name === p2Name) {
    p3Name = `${prng.choice(KOREAN_SURNAMES)}${prng.choice(KOREAN_FIRST_NAMES)}`
  }
  const p3School = prng.choice(HIGH_SCHOOLS)
  const p3Contact = prng.nextInt(72, 78) + statBoost
  const p3Power = prng.nextInt(74, 80) + statBoost
  prospects.push({
    id: `rookie_${season}_3`,
    name: p3Name,
    position: 'OF',
    age: 19,
    school: p3School,
    signingBonus: Math.max(1, 3 - bonusDiscount),
    scoutSummary: '발 빠르고 어깨 강한 5툴 유망주. 타격 폼을 가다듬으면 호타준족의 리그 대표 외야수로 성장 가능.',
    isPitcher: false,
    batterStats: {
      contact: p3Contact,
      power: p3Power,
      eye: prng.nextInt(70, 78),
      speed: prng.nextInt(88, 95),
      defense: prng.nextInt(76, 84),
      stamina: prng.nextInt(75, 84)
    },
    overall: Math.round((p3Contact * 0.45) + (p3Power * 0.55)),
    potential: 'A',
    traits: ['호타준족', '발 빠른 5툴', '총알 송구']
  })

  // 4. 2군 육성선수 / 신고선수 발굴 (계약금 0원 - 예산 부족 시에도 상시 지명 가능)
  let p4Name = `${prng.choice(KOREAN_SURNAMES)}${prng.choice(KOREAN_FIRST_NAMES)}`
  while (p4Name === p1Name || p4Name === p2Name || p4Name === p3Name) {
    p4Name = `${prng.choice(KOREAN_SURNAMES)}${prng.choice(KOREAN_FIRST_NAMES)}`
  }
  const p4School = prng.choice(UNIVERSITIES)
  const p4Contact = prng.nextInt(68, 74) + statBoost
  const p4Power = prng.nextInt(66, 73) + statBoost
  prospects.push({
    id: `rookie_${season}_4_dev`,
    name: p4Name,
    position: prng.choice(['C', '2B', 'OF', 'RP'] as Position[]),
    age: 23,
    school: `${p4School} (육성선수)`,
    signingBonus: 0,
    scoutSummary: '계약금 0원으로 영입하는 2군 육성선수(신고선수). 당장 화려하진 않으나 성실한 훈련과 투지로 깜짝 스타 도약을 노리는 숨은 원석.',
    isPitcher: false,
    batterStats: {
      contact: p4Contact,
      power: p4Power,
      eye: prng.nextInt(75, 82),
      speed: prng.nextInt(74, 82),
      defense: prng.nextInt(74, 82),
      stamina: prng.nextInt(80, 88)
    },
    overall: Math.round((p4Contact + p4Power) / 2),
    potential: 'B',
    traits: ['육성선수 신화', '악바리 근성', '0원 계약']
  })

  return prospects
}

export function convertForeignToPlayer(candidate: ForeignCandidate, teamId: string): Player {
  return {
    id: candidate.id,
    name: candidate.name,
    teamId,
    position: candidate.position,
    age: candidate.age,
    salary: candidate.salary,
    contractYears: 1,
    isPitcher: candidate.isPitcher,
    pitcherStats: candidate.pitcherStats,
    batterStats: candidate.batterStats,
    overall: candidate.overall,
    traits: candidate.traits,
    isForeign: true,
    isAsianQuota: candidate.isAsianQuota
  }
}

export function convertRookieToPlayer(prospect: RookieProspect, teamId: string): Player {
  return {
    id: prospect.id,
    name: prospect.name,
    teamId,
    position: prospect.position,
    age: prospect.age,
    salary: 1, // 신인 기본 연봉 3,000만원 ~ 1억원 미만 (시뮬레이터 1억 표기)
    contractYears: 3,
    isPitcher: prospect.isPitcher,
    pitcherStats: prospect.pitcherStats,
    batterStats: prospect.batterStats,
    overall: prospect.overall,
    traits: prospect.traits,
    isRookie: true
  }
}
