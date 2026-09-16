export type Position = 'SP' | 'RP' | 'CP' | 'C' | '1B' | '2B' | '3B' | 'SS' | 'OF' | 'DH'

export interface BatterStats {
  contact: number // 타격 (0-100)
  power: number   // 장타 (0-100)
  eye: number     // 선구 (0-100)
  speed: number   // 주루 (0-100)
  defense: number // 수비 (0-100)
  stamina: number // 체력 (0-100)
}

export interface PitcherStats {
  stuff: number     // 구위 (0-100)
  control: number   // 제구 (0-100)
  breaking: number  // 변화구 (0-100)
  clutch: number    // 위기관리 (0-100)
  stamina: number   // 체력 (0-100)
}

export type PlayerForm = 'HOT' | 'GOOD' | 'NORMAL' | 'COLD' | 'SLUMP'

export interface Player {
  id: string
  name: string
  teamId: string
  position: Position
  age: number
  salary: number // 억원
  contractYears: number
  isPitcher: boolean
  batterStats?: BatterStats
  pitcherStats?: PitcherStats
  overall: number // S(90+), A(80+), B(70+), C(60+), D(<60)
  traits: string[]
  isForeign?: boolean
  isAsianQuota?: boolean
  isRookie?: boolean
  isInjured?: boolean
  injuryWeeks?: number
  lastSeasonDelta?: number
  form?: PlayerForm
  formDelta?: number
  formReason?: string
}

export type TeamStance = 'WIN_NOW' | 'BALANCED' | 'REBUILDING'

export interface Team {
  id: string
  name: string
  shortName: string
  city: string
  primaryColor: string
  secondaryColor: string
  budget: number      // 억원
  fanSupport: number  // 0~100
  ownerTrust: number  // 0~100 (0이면 해고)
  chemistry: number   // 0~100
  farmSystem: number  // 0~100 (유망주 팜)
  homePark: string
  difficulty: '쉬움' | '보통' | '어려움'
  description: string
  stance?: TeamStance // 현재 시즌 기조 ('WIN_NOW' | 'BALANCED' | 'REBUILDING')
  winNowDebt?: number // 윈나우 후폭풍/리바운드 누적치 (0, 1, 2...)
  rebuildingStack?: number // 리빌딩 누적 연차 (0, 1, 2...)
}

export interface StandingsRecord {
  teamId: string
  teamName: string
  wins: number
  losses: number
  draws: number
  winRate: number
  runScored: number
  runAllowed: number
  rank: number
  gamesBehind: number
}

export interface EnvironmentCard {
  id: string
  name: string
  description: string
  type: 'hitter_favorable' | 'pitcher_favorable' | 'abs_strict' | 'salary_cap' | 'rookie_boom' | 'normal'
}

export interface EventOption {
  text: string
  effectDesc: string
  budgetDelta?: number
  ownerTrustDelta?: number
  fanSupportDelta?: number
  chemistryDelta?: number
  farmDelta?: number
  overallDelta?: number
  requiredBudget?: number
}

export interface SeasonEvent {
  id: string
  title: string
  description: string
  category: '부상' | '갈등' | '유망주' | '외국인' | '트레이드' | '구단주' | '팬덤' | '징계'
  options: EventOption[]
}

export interface RookieProspect {
  id: string
  name: string
  position: Position
  age: number
  school: string
  scoutSummary: string
  signingBonus: number // 억원
  isPitcher: boolean
  pitcherStats?: PitcherStats
  batterStats?: BatterStats
  overall: number
  potential: 'S' | 'A+' | 'A' | 'B'
  traits: string[]
}

export interface ForeignCandidate {
  id: string
  name: string
  position: Position
  age: number
  salary: number // 억원
  previousTeam: string
  scoutSummary: string
  isPitcher: boolean
  pitcherStats?: PitcherStats
  batterStats?: BatterStats
  overall: number
  traits: string[]
  isAsianQuota?: boolean
  country?: string
}

export interface PostseasonMatch {
  roundName: '와일드카드' | '준플레이오프' | '플레이오프' | '한국시리즈'
  team1Id: string
  team2Id: string
  team1Wins: number
  team2Wins: number
  requiredWins: number
  winnerId?: string
  isUserInvolved: boolean
}

export interface SeasonSummary {
  season: number
  rank: number
  wins: number
  losses: number
  draws: number
  winRate: number
  postseasonResult: string
  budget: number
  fanSupport: number
  ownerTrust: number
}

export type GamePhase =
  | 'TEAM_SELECT'
  | 'STOVE_LEAGUE'
  | 'PRESEASON'
  | 'FIRST_HALF_EVENTS'
  | 'CALLUP_DECISION'
  | 'ROOKIE_DRAFT'
  | 'SECOND_HALF_EVENTS'
  | 'CLUTCH_MATCH'
  | 'PENNANT_RACE'
  | 'POSTSEASON'
  | 'SEASON_SETTLEMENT'
  | 'GAME_OVER'
