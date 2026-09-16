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

export function generateForeignCandidates(prng: PRNG, season: number): ForeignCandidate[] {
  const candidates: ForeignCandidate[] = []

  // 1. 에이스급 선발 투수 (SP)
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
    previousTeam: 'MLB 템파베이 40인 로스터',
    scoutSummary: 'MLB급 154km 강속구와 횡으로 크게 꺾이는 명품 스위퍼를 장착한 특급 에이스.',
    isPitcher: true,
    pitcherStats: {
      stuff: p1Stuff,
      control: p1Control,
      breaking: prng.nextInt(88, 95),
      clutch: prng.nextInt(85, 93),
      stamina: prng.nextInt(88, 95)
    },
    overall: p1Ovr,
    traits: p1Traits
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
    previousTeam: '일본 프로야구(NPB) 선발 출신',
    scoutSummary: '구속은 148km 수준이나 예리한 제구력과 다양한 변화구로 6이닝을 안정적으로 먹어주는 이닝이터.',
    isPitcher: true,
    pitcherStats: {
      stuff: p2Stuff,
      control: p2Control,
      breaking: prng.nextInt(84, 90),
      clutch: prng.nextInt(82, 88),
      stamina: prng.nextInt(85, 92)
    },
    overall: p2Ovr,
    traits: p2Traits
  })

  // 3. 중심타선 거포형 야수 (1B/OF)
  const b1LastName = prng.choice(FOREIGN_LAST_NAMES)
  const b1Traits = prng.choice(FOREIGN_BATTER_TRAITS)
  const b1Contact = prng.nextInt(85, 91)
  const b1Power = prng.nextInt(92, 97)
  const b1Ovr = Math.round((b1Contact * 0.45) + (b1Power * 0.55))
  candidates.push({
    id: `foreign_batter_${season}_${prng.nextInt(100, 999)}`,
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
    traits: b1Traits
  })

  return candidates
}

export function generateRookieProspects(prng: PRNG, season: number): RookieProspect[] {
  const prospects: RookieProspect[] = []

  // 1. 전체 1순위급 초고교급 파이어볼러 (SP)
  const p1Name = `${prng.choice(KOREAN_SURNAMES)}${prng.choice(KOREAN_FIRST_NAMES)}`
  const p1School = prng.choice(HIGH_SCHOOLS)
  const p1Stuff = prng.nextInt(82, 87)
  const p1Control = prng.nextInt(74, 80)
  prospects.push({
    id: `rookie_${season}_1`,
    name: p1Name,
    position: 'SP',
    age: 19,
    school: p1School,
    signingBonus: 8, // 8억원
    scoutSummary: '최고 154km를 마크하는 아마추어 최대어. 향후 10년간 국가대표 에이스를 책임질 특급 파이어볼러.',
    isPitcher: true,
    pitcherStats: {
      stuff: p1Stuff,
      control: p1Control,
      breaking: prng.nextInt(75, 82),
      clutch: prng.nextInt(72, 80),
      stamina: prng.nextInt(80, 86)
    },
    overall: Math.round((p1Stuff + p1Control) / 2),
    potential: 'S',
    traits: ['154km 파이어볼러', '초고교급 최대어', '탈삼진 본능']
  })

  // 2. 대학 최고의 대형 내야수/포수 (즉시전력감)
  let p2Name = `${prng.choice(KOREAN_SURNAMES)}${prng.choice(KOREAN_FIRST_NAMES)}`
  while (p2Name === p1Name) {
    p2Name = `${prng.choice(KOREAN_SURNAMES)}${prng.choice(KOREAN_FIRST_NAMES)}`
  }
  const p2School = prng.choice(UNIVERSITIES)
  const p2Pos = prng.choice(['SS', 'C', '3B'] as Position[])
  const p2Contact = prng.nextInt(78, 83)
  const p2Power = prng.nextInt(76, 82)
  prospects.push({
    id: `rookie_${season}_2`,
    name: p2Name,
    position: p2Pos,
    age: 23,
    school: p2School,
    signingBonus: 5, // 5억원
    scoutSummary: '대학 리그를 평정한 타격왕 출신. 타석에서의 침착함과 탄탄한 수비로 당장 1군 주전 도약이 가능한 자원.',
    isPitcher: false,
    batterStats: {
      contact: p2Contact,
      power: p2Power,
      eye: prng.nextInt(80, 86),
      speed: prng.nextInt(72, 80),
      defense: prng.nextInt(78, 85),
      stamina: prng.nextInt(80, 88)
    },
    overall: Math.round((p2Contact + p2Power) / 2),
    potential: 'A+',
    traits: ['대학 타격왕', '수비 완성형', '즉시 전력감']
  })

  // 3. 고교 5툴 포텐셜 외야수 (가성비 육성형)
  let p3Name = `${prng.choice(KOREAN_SURNAMES)}${prng.choice(KOREAN_FIRST_NAMES)}`
  while (p3Name === p1Name || p3Name === p2Name) {
    p3Name = `${prng.choice(KOREAN_SURNAMES)}${prng.choice(KOREAN_FIRST_NAMES)}`
  }
  const p3School = prng.choice(HIGH_SCHOOLS)
  const p3Contact = prng.nextInt(72, 78)
  const p3Power = prng.nextInt(74, 80)
  prospects.push({
    id: `rookie_${season}_3`,
    name: p3Name,
    position: 'OF',
    age: 19,
    school: p3School,
    signingBonus: 3, // 3억원
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
    isForeign: true
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
