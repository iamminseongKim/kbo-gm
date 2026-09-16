import { useState, useEffect, useRef } from 'react'
import {
  GamePhase,
  Team,
  Player,
  EnvironmentCard,
  EventOption,
  StandingsRecord,
  SeasonSummary,
  ForeignCandidate,
  RookieProspect,
  TeamStance,
  TradeOffer
} from './types'
import { KBO_TEAMS } from './data/teams'
import { INITIAL_PLAYERS } from './data/players'
import { ENVIRONMENT_CARDS } from './data/environmentCards'
import { IN_SEASON_EVENTS } from './data/events'
import { PRNG } from './engine/prng'
import { simulatePennantRace } from './engine/simulation'
import { simulatePostseason, SeriesResult, TacticChoice } from './engine/postseason'
import {
  generateForeignCandidates,
  generateRookieProspects,
  convertRookieToPlayer,
  convertForeignToPlayer
} from './engine/player_generator'
import { advanceSeasonAndApplyAging } from './engine/aging'
import { assignSeasonPlayerForms } from './engine/form'
import { generateTradeOffers } from './engine/trades'

import { Header } from './components/Header'
import { RosterModal } from './components/RosterModal'
import { CompanionPanel } from './components/CompanionPanel'
import { TeamSelectView } from './components/TeamSelectView'
import { StoveLeagueView } from './components/StoveLeagueView'
import { PreseasonView } from './components/PreseasonView'
import { SeasonEventView } from './components/SeasonEventView'
import { CallupView } from './components/CallupView'
import { DraftView } from './components/DraftView'
import { PennantRaceView } from './components/PennantRaceView'
import { ClutchMatchView } from './components/ClutchMatchView'
import { PostseasonView } from './components/PostseasonView'
import { SettlementView } from './components/SettlementView'
import { EndingView } from './components/EndingView'
import { SeasonProgress } from './components/SeasonProgress'
import { TradeDeadlineView } from './components/TradeDeadlineView'
import { MidseasonReportView } from './components/MidseasonReportView'
import { ForeignReplacementView } from './components/ForeignReplacementView'

export default function App() {
  const [phase, setPhase] = useState<GamePhase>('TEAM_SELECT')
  const [seed, setSeed] = useState<string>('20260916')
  const [season, setSeason] = useState<number>(1)
  const maxSeasons = 7

  const [teams, setTeams] = useState<Record<string, Team>>(KBO_TEAMS)
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS)
  const [userTeamId, setUserTeamId] = useState<string>('kia')
  const [previewTeamId, setPreviewTeamId] = useState<string>('kia')
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  const [activeEnv, setActiveEnv] = useState<EnvironmentCard>(ENVIRONMENT_CARDS[0])
  const [modifierDelta, setModifierDelta] = useState<number>(0)

  // 스토브리그 & 드래프트 풀
  const [foreignCandidates, setForeignCandidates] = useState<ForeignCandidate[]>([])
  const [rookieProspects, setRookieProspects] = useState<RookieProspect[]>([])
  const [tradeOffers, setTradeOffers] = useState<TradeOffer[]>([])
  const seenForeignNames = useRef<string[]>([])
  const seenRookieNames = useRef<string[]>([])

  // 시즌 돌발 이벤트
  const [inSeasonEvents, setInSeasonEvents] = useState(IN_SEASON_EVENTS)
  const [firstHalfEventIndex, setFirstHalfEventIndex] = useState(0)
  const [secondHalfEventIndex, setSecondHalfEventIndex] = useState(3)
  const seenEventIds = useRef<string[]>([])

  // 시뮬레이션 결과
  const [standings, setStandings] = useState<StandingsRecord[]>([])
  const [midseasonStandings, setMidseasonStandings] = useState<StandingsRecord[]>([])
  const [injuredPlayerId, setInjuredPlayerId] = useState<string | null>(null)
  const [reviewForeignPlayerId, setReviewForeignPlayerId] = useState<string | null>(null)
  const [postseasonResults, setPostseasonResults] = useState<{
    seriesList: SeriesResult[]
    champion: Team
    userFinalResult: string
  } | undefined>(undefined)

  // 결산 및 히스토리
  const [latestSummary, setLatestSummary] = useState<SeasonSummary | null>(null)
  const [history, setHistory] = useState<SeasonSummary[]>([])
  const [isFired, setIsFired] = useState<boolean>(false)
  const [firedReason, setFiredReason] = useState<string>('')

  // UI 상태
  const [isRosterOpen, setIsRosterOpen] = useState(false)

  // 시즌 시작 시 스토브리그 직전 스냅샷 (예산 오링 등 발생 시 재설계로 복귀 지원)
  const [seasonSnapshot, setSeasonSnapshot] = useState<{
    team: Team
    players: Player[]
    season: number
  } | null>(null)

  // PRNG 인스턴스
  const getPrng = (extra = 0) => new PRNG(`${seed}_s${season}_${extra}`)

  // 유저 팀 가져오기
  const userTeam = teams[userTeamId] || KBO_TEAMS.kia

  // 1. 구단 선택 후 스토브리그로 진입
  const handleSelectTeam = (teamId: string, customSeed: string) => {
    setUserTeamId(teamId)
    setSeed(customSeed)
    setSeason(1)
    setHistory([])
    setIsFired(false)
    setFiredReason('')
    seenForeignNames.current = []
    seenRookieNames.current = []
    seenEventIds.current = []
    const clonedTeams = JSON.parse(JSON.stringify(KBO_TEAMS))
    setTeams(clonedTeams)

    // 시즌 1 선수들에게 초기 폼(대폭발 / 슬럼프 / 상승 / 부진) 부여
    const initPrng = new PRNG(`${customSeed}_season_1_forms`)
    const basePlayers = JSON.parse(JSON.stringify(INITIAL_PLAYERS))
    const playersWithForms = assignSeasonPlayerForms(basePlayers, initPrng)
    setPlayers(playersWithForms)

    const initialTeam = clonedTeams[teamId] || clonedTeams.kia
    setSeasonSnapshot({
      team: JSON.parse(JSON.stringify(initialTeam)),
      players: JSON.parse(JSON.stringify(playersWithForms)),
      season: 1
    })

    initSeason(1, customSeed)
    setPhase('STOVE_LEAGUE')
  }

  // 시즌 초기화 헬퍼
  const initSeason = (seasonNum: number, currentSeed: string, currentRebuildStack = 0) => {
    const prng = new PRNG(`${currentSeed}_season_${seasonNum}`)

    // 환경 카드 추첨
    const envIdx = prng.nextInt(0, ENVIRONMENT_CARDS.length - 1)
    setActiveEnv(ENVIRONMENT_CARDS[envIdx])

    // 스토브리그 외국인 후보 3인 생성
    const foreigners = generateForeignCandidates(prng, seasonNum, seenForeignNames.current)
    seenForeignNames.current = [...seenForeignNames.current, ...foreigners.map(player => player.name)]
    setForeignCandidates(foreigners)

    // 신인 드래프트 3인 생성 (리빌딩 누적 시 특급 스카우팅 보너스)
    const rookies = generateRookieProspects(prng, seasonNum, currentRebuildStack, seenRookieNames.current)
    seenRookieNames.current = [...seenRookieNames.current, ...rookies.map(player => player.name)]
    setRookieProspects(rookies)

    // 전반기 3개 / 후반기 3개. 최근 등장한 사건은 풀이 허용하는 한 재등장하지 않는다.
    let availableEvents = IN_SEASON_EVENTS.filter(event => !seenEventIds.current.includes(event.id))
    if (availableEvents.length < 6) {
      // 풀을 한 바퀴 돈 뒤에도 직전 시즌 사건은 연속으로 나오지 않도록 유지한다.
      const lastSeasonIds = new Set(seenEventIds.current.slice(-6))
      availableEvents = IN_SEASON_EVENTS.filter(event => !lastSeasonIds.has(event.id))
      seenEventIds.current = seenEventIds.current.slice(-6)
    }
    const pickedEvents = prng.sample(availableEvents, 6)
    seenEventIds.current = [...seenEventIds.current, ...pickedEvents.map(event => event.id)]
    setInSeasonEvents(pickedEvents)
    setFirstHalfEventIndex(0)
    setSecondHalfEventIndex(3)

    setModifierDelta(0)
    setPostseasonResults(undefined)
  }

  // 리소스 변경 적용 헬퍼
  const applyOptionDeltas = (opt: EventOption, gamesPerOpponent?: number, simulationSeed = 0) => {
    const current = teams[userTeamId]
    const updatedUserTeam = {
      ...current,
      budget: Math.max(-100, current.budget + (opt.budgetDelta || 0)),
      ownerTrust: Math.min(100, Math.max(0, current.ownerTrust + (opt.ownerTrustDelta || 0))),
      fanSupport: Math.min(100, Math.max(0, current.fanSupport + (opt.fanSupportDelta || 0))),
      chemistry: Math.min(100, Math.max(0, current.chemistry + (opt.chemistryDelta || 0))),
      farmSystem: Math.min(100, Math.max(0, current.farmSystem + (opt.farmDelta || 0)))
    }
    setTeams(prev => {
      return { ...prev, [userTeamId]: updatedUserTeam }
    })
    const nextModifier = modifierDelta + (opt.overallDelta || 0)
    if (opt.overallDelta) {
      setModifierDelta(nextModifier)
    }
    if (gamesPerOpponent) {
      const projectedTeams = { ...teams, [userTeamId]: updatedUserTeam }
      setStandings(simulatePennantRace(
        projectedTeams,
        players,
        getPrng(1200 + simulationSeed),
        activeEnv,
        nextModifier,
        userTeamId,
        season,
        gamesPerOpponent
      ))
    }
  }

  // [Phase 1] 스토브리그 전체 결정 확정 (구단 기조, 외인 4인 슬롯, 베테랑 방출, 예산 및 전력 반영)
  const handleFinalizeStoveLeague = (
    finalForeignPlayers: Player[],
    releasedPlayerIds: string[],
    netBudgetDelta: number,
    powerPenalty: number,
    fanPenalty: number,
    stance: TeamStance
  ) => {
    // 1. 베테랑 방출 및 외인 명단 갱신
    setPlayers(prev => {
      const withoutUserForeignsAndReleased = prev.filter(
        p => !(p.teamId === userTeamId && p.isForeign) && !releasedPlayerIds.includes(p.id)
      )
      return [...withoutUserForeignsAndReleased, ...finalForeignPlayers]
    })

    // 2. 예산, 팬심, 구단 기조 및 후폭풍/육성 누적 반영
    setTeams(prev => {
      const cur = prev[userTeamId]
      let newWinNowDebt = cur.winNowDebt || 0
      let newRebuildStack = cur.rebuildingStack || 0
      let newFarm = cur.farmSystem

      if (stance === 'WIN_NOW') {
        newWinNowDebt += 1
        newRebuildStack = 0 // 윈나우 선회 시 리빌딩 누적 초기화
        newFarm = Math.max(20, newFarm - 5) // 팜 소모
      } else if (stance === 'REBUILDING') {
        newRebuildStack += 1
        newWinNowDebt = Math.max(0, newWinNowDebt - 1)
        newFarm = Math.min(100, newFarm + 15) // 팜 집중 육성
      } else {
        newWinNowDebt = Math.max(0, newWinNowDebt - 1) // 밸런스 시 후폭풍 자연 경감
      }

      return {
        ...prev,
        [userTeamId]: {
          ...cur,
          stance,
          winNowDebt: newWinNowDebt,
          rebuildingStack: newRebuildStack,
          farmSystem: newFarm,
          budget: cur.budget + netBudgetDelta,
          fanSupport: Math.min(100, Math.max(0, cur.fanSupport - fanPenalty))
        }
      }
    })

    // 3. 외인 미사용 공백 페널티 적용 (팀 전력 대폭 하락)
    if (powerPenalty > 0) {
      setModifierDelta(prev => prev - powerPenalty)
    }

    // 4. 다음 단계(스프링캠프)로 진입
    setPhase('PRESEASON')
  }

  // [Phase 2 -> 3] 프리시즌 완료 -> 전반기 돌발 이벤트
  const handleConfirmPreseason = (option: EventOption) => {
    applyOptionDeltas(option, 2, 1)
    setPhase('FIRST_HALF_EVENTS')
  }

  // [Phase 3 -> 4] 전반기 이벤트 완료 -> 1군 강등 / 2군 콜업 결단
  const handleConfirmFirstHalfEvent = (option: EventOption) => {
    const gamesPerOpponent = 4 + firstHalfEventIndex * 2
    applyOptionDeltas(option, gamesPerOpponent, 10 + firstHalfEventIndex)
    if (firstHalfEventIndex < 2) {
      setFirstHalfEventIndex(prev => prev + 1)
      return
    }
    const injuryPrng = getPrng(404)
    const injuryPool = players
      .filter(player => player.teamId === userTeamId && !player.isInjured)
      .sort((a, b) => b.overall - a.overall)
      .slice(0, 6)
    const injured = injuryPool.length ? injuryPrng.choice(injuryPool) : null
    if (injured) {
      setInjuredPlayerId(injured.id)
      setPlayers(prev => prev.map(player => player.id === injured.id
        ? { ...player, isInjured: true, injuryWeeks: injuryPrng.nextInt(4, 6) }
        : player
      ))
    }
    setMidseasonStandings(simulatePennantRace(teams, players, getPrng(405), activeEnv, modifierDelta, userTeamId, season, 8))
    setPhase('MIDSEASON_REPORT')
  }

  const handleMidseasonDecision = (decision: 'REST' | 'PLAY_THROUGH') => {
    if (decision === 'REST') {
      setTeams(prev => ({ ...prev, [userTeamId]: { ...prev[userTeamId], chemistry: Math.min(100, prev[userTeamId].chemistry + 6) } }))
    } else if (injuredPlayerId) {
      setPlayers(prev => prev.map(player => player.id === injuredPlayerId
        ? { ...player, isInjured: false, injuryWeeks: 0, overall: Math.max(50, player.overall - 1) }
        : player
      ))
      setTeams(prev => ({ ...prev, [userTeamId]: { ...prev[userTeamId], chemistry: Math.max(0, prev[userTeamId].chemistry - 5) } }))
    }
    const foreignPool = players
      .filter(player => player.teamId === userTeamId && player.isForeign && !player.isAsianQuota)
      .sort((a, b) => (a.overall + (a.formDelta || 0)) - (b.overall + (b.formDelta || 0)))
    if (foreignPool.length) {
      setReviewForeignPlayerId(foreignPool[0].id)
      setPhase('FOREIGN_REPLACEMENT')
    } else {
      setPhase('CALLUP_DECISION')
    }
  }

  const handleKeepForeignPlayer = () => {
    setTeams(prev => ({
      ...prev,
      [userTeamId]: {
        ...prev[userTeamId],
        chemistry: Math.min(100, prev[userTeamId].chemistry + 4),
        fanSupport: Math.max(0, prev[userTeamId].fanSupport - 2)
      }
    }))
    setPhase('CALLUP_DECISION')
  }

  const handleReplaceForeignPlayer = (candidate: ForeignCandidate, totalCost: number) => {
    const replacement = convertForeignToPlayer(candidate, userTeamId)
    const previous = players.find(player => player.id === reviewForeignPlayerId)
    setPlayers(prev => [
      ...prev.filter(player => player.id !== reviewForeignPlayerId && player.id !== candidate.id),
      replacement
    ])
    setTeams(prev => ({
      ...prev,
      [userTeamId]: {
        ...prev[userTeamId],
        budget: prev[userTeamId].budget - totalCost,
        fanSupport: Math.min(100, Math.max(0, prev[userTeamId].fanSupport + (previous && candidate.overall > previous.overall ? 6 : -3))),
        chemistry: Math.max(0, prev[userTeamId].chemistry - 3)
      }
    }))
    setPhase('CALLUP_DECISION')
  }

  // [Phase 4 -> 5] 콜업 결단 완료 -> 신인 1차 드래프트
  const handleConfirmCallup = (option: EventOption) => {
    applyOptionDeltas(option, 9, 30)
    setPhase('ROOKIE_DRAFT')
  }

  // 모기업 특별 지원금 긴급 차입 (신뢰도 -8, 예산 +10억)
  const handleBorrowEmergencyBudget = () => {
    setTeams(prev => {
      const cur = prev[userTeamId]
      return {
        ...prev,
        [userTeamId]: {
          ...cur,
          budget: cur.budget + 10,
          ownerTrust: Math.max(5, cur.ownerTrust - 8)
        }
      }
    })
  }

  // 스토브리그로 되돌아가기 (예산 오링 탈출 및 선수단 재설계)
  const handleBackToStoveLeague = () => {
    if (seasonSnapshot && seasonSnapshot.season === season) {
      setTeams(prev => ({
        ...prev,
        [userTeamId]: JSON.parse(JSON.stringify(seasonSnapshot.team))
      }))
      setPlayers(JSON.parse(JSON.stringify(seasonSnapshot.players)))
    } else {
      // 스냅샷이 없는 경우의 안전 복구 (외인 연봉 및 기본 예산 복원)
      const userForeigns = players.filter(p => p.teamId === userTeamId && p.isForeign)
      const foreignTotalSalary = userForeigns.reduce((acc, p) => acc + p.salary, 0)
      setTeams(prev => {
        const cur = prev[userTeamId]
        return {
          ...prev,
          [userTeamId]: {
            ...cur,
            budget: Math.max(cur.budget, cur.budget + Math.max(45, foreignTotalSalary))
          }
        }
      })
    }
    setModifierDelta(0)
    setPhase('STOVE_LEAGUE')
  }

  // [Phase 5 -> 6] 신인 1차 지명 완료 -> 후반기 돌발 이벤트
  const handleDraftRookie = (prospect: RookieProspect) => {
    const newRookie = convertRookieToPlayer(prospect, userTeamId)
    const rosterAfterDraft = [...players, newRookie]
    setPlayers(rosterAfterDraft)
    setTeams(prev => ({
      ...prev,
      [userTeamId]: {
        ...prev[userTeamId],
        budget: prev[userTeamId].budget - prospect.signingBonus,
        farmSystem: Math.min(100, prev[userTeamId].farmSystem + 12),
        fanSupport: Math.min(100, prev[userTeamId].fanSupport + 5)
      }
    }))
    setTradeOffers(generateTradeOffers(teams, rosterAfterDraft, userTeamId, getPrng(555), season))
    setPhase('TRADE_DEADLINE')
  }

  const handleAcceptTrade = (offer: TradeOffer) => {
    setPlayers(prev => prev.map(player => {
      if (player.id === offer.outgoingPlayerId) return { ...player, teamId: offer.partnerTeamId }
      if (player.id === offer.incomingPlayerId) return { ...player, teamId: userTeamId }
      return player
    }))
    setTeams(prev => ({
      ...prev,
      [userTeamId]: {
        ...prev[userTeamId],
        fanSupport: Math.min(100, prev[userTeamId].fanSupport + 3),
        chemistry: Math.max(0, prev[userTeamId].chemistry - 2)
      }
    }))
    setPhase('SECOND_HALF_EVENTS')
  }

  const handlePassTrade = () => setPhase('SECOND_HALF_EVENTS')

  // [Phase 6 -> CLUTCH_MATCH] 후반기 이벤트 완료 -> 9회말 승부처 현장 작전 지휘
  const handleConfirmSecondHalfEvent = (option: EventOption) => {
    const gamesPerOpponent = 10 + (secondHalfEventIndex - 3) * 2
    applyOptionDeltas(option, gamesPerOpponent, 40 + secondHalfEventIndex)
    if (secondHalfEventIndex < 5) {
      setSecondHalfEventIndex(prev => prev + 1)
      return
    }
    setPhase('CLUTCH_MATCH')
  }

  // [CLUTCH_MATCH -> PENNANT_RACE] 현장 지휘 완료 -> 144경기 페넌트레이스 시뮬레이션
  const handleFinishClutchMatch = (isVictory: boolean, _outcomeDesc: string) => {
    let extraModifier = modifierDelta
    if (isVictory) {
      extraModifier += 1.5
      setModifierDelta(prev => prev + 1.5)
      setTeams(prev => ({
        ...prev,
        [userTeamId]: {
          ...prev[userTeamId],
          chemistry: Math.min(100, prev[userTeamId].chemistry + 8),
          fanSupport: Math.min(100, prev[userTeamId].fanSupport + 10)
        }
      }))
    }
    const prng = getPrng(888)
    const res = simulatePennantRace(teams, players, prng, activeEnv, extraModifier, userTeamId, season)
    setStandings(res)
    setPhase('PENNANT_RACE')
  }

  // [Phase 7 -> 8] 페넌트레이스 종료 후 진행 (5위 이내면 포스트시즌, 아니면 결산)
  const handlePennantProceed = () => {
    const userStanding = standings.find(s => s.teamId === userTeamId)
    if (userStanding && userStanding.rank <= 5) {
      setPhase('POSTSEASON')
    } else {
      processSeasonSettlement('가을야구 탈락')
    }
  }

  // [Phase 8] 포스트시즌 시뮬레이션 실행
  const handleRunPostseason = (tactic: TacticChoice) => {
    const prng = getPrng(999)
    const res = simulatePostseason(standings, teams, prng, userTeamId, tactic, season)
    setPostseasonResults(res)
  }

  // [Phase 8 -> 9] 포스트시즌 후 결산으로 이동
  const handlePostseasonSettlement = () => {
    const finalResult = postseasonResults?.userFinalResult || '가을야구 마감'
    processSeasonSettlement(finalResult)
  }

  // 시즌 결산 처리 로직
  const processSeasonSettlement = (postseasonResult: string) => {
    const userStanding = standings.find(s => s.teamId === userTeamId)
    const rank = userStanding?.rank || 10
    const wins = userStanding?.wins || 0
    const losses = userStanding?.losses || 0
    const draws = userStanding?.draws || 0
    const winRate = userStanding?.winRate || 0

    // 구단주 및 팬 평가 변화 (기조에 따른 관용/엄격함 차등 적용)
    let trustDelta = rank <= 5 ? 12 : -15
    let fanDelta = rank <= 5 ? 15 : -10

    if (userTeam.stance === 'REBUILDING') {
      if (rank > 5) {
        trustDelta = -5 // 리빌딩 선언 구단은 단기 부진에 대해 정상 참작
        fanDelta = -4
      } else {
        trustDelta = 20 // 리빌딩 중 5강 돌풍 시 파격적 보너스
        fanDelta = 25
      }
    } else if (userTeam.stance === 'WIN_NOW') {
      if (rank > 5) {
        trustDelta = -22 // 윈나우 선언 후 가을야구 탈락 시 혹독한 책임 추궁
        fanDelta = -18
      }
    }

    if (postseasonResult.includes('우승!')) {
      trustDelta += 20
      fanDelta += 30
    }

    const newOwnerTrust = Math.min(100, Math.max(0, userTeam.ownerTrust + trustDelta))
    const newFanSupport = Math.min(100, Math.max(0, userTeam.fanSupport + fanDelta))
    const newBudget = userTeam.budget + 45 // 차기 시즌 운영비 지급

    setTeams(prev => ({
      ...prev,
      [userTeamId]: {
        ...prev[userTeamId],
        ownerTrust: newOwnerTrust,
        fanSupport: newFanSupport,
        budget: newBudget
      }
    }))

    const summary: SeasonSummary = {
      season,
      rank,
      wins,
      losses,
      draws,
      winRate,
      postseasonResult,
      budget: newBudget,
      fanSupport: newFanSupport,
      ownerTrust: newOwnerTrust
    }

    setLatestSummary(summary)
    const newHistory = [...history, summary]
    setHistory(newHistory)

    // 해고 조건 검사
    if (newOwnerTrust <= 0) {
      setIsFired(true)
      setFiredReason('구단주 신뢰도가 0이 되어 이사회로부터 전격 해임 통보를 받았습니다.')
    } else if (newBudget < -50) {
      setIsFired(true)
      setFiredReason('무리한 지출로 구단 재정이 파산하여 경질되었습니다.')
    } else if (
      newHistory.length >= 3 &&
      newHistory.slice(-3).every(h => h.rank === 10)
    ) {
      setIsFired(true)
      setFiredReason('3년 연속 최하위 10위로 구단 성적 부진의 책임을 물어 해임되었습니다.')
    }

    setPhase('SEASON_SETTLEMENT')
  }

  // [Phase 9 -> 차기 시즌 스토브리그]
  const handleNextSeason = () => {
    const nextSeason = season + 1
    const prng = new PRNG(`${seed}_aging_s${nextSeason}`)

    // 1. 나이 1살 증가 및 에이징 커브 / 리빌딩 특급 성장 / 윈나우 후폭풍 적용
    const { updatedPlayers } = advanceSeasonAndApplyAging(players, teams, prng, nextSeason)

    // 2. 차기 시즌 선수단 컨디션 / 슬럼프(Form) 부여
    const finalPlayers = assignSeasonPlayerForms(
      updatedPlayers.map(player => ({ ...player, isInjured: false, injuryWeeks: 0 })),
      prng
    )
    setPlayers(finalPlayers)

    const currentTeam = teams[userTeamId]
    setSeasonSnapshot({
      team: JSON.parse(JSON.stringify(currentTeam)),
      players: JSON.parse(JSON.stringify(finalPlayers)),
      season: nextSeason
    })

    setSeason(nextSeason)
    const currentRebuild = teams[userTeamId]?.rebuildingStack || 0
    initSeason(nextSeason, seed, currentRebuild)
    setPhase('STOVE_LEAGUE')
  }

  // 최종 엔딩 화면으로 진입
  const handleFinalEnding = () => {
    setPhase('GAME_OVER')
  }

  // 재시작
  const handleRestart = () => {
    setPhase('TEAM_SELECT')
  }

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light')
      document.documentElement.classList.remove('dark')
      document.body.classList.add('light')
      document.body.classList.remove('dark')
      document.body.style.backgroundColor = '#f5f5f7'
      document.body.style.color = '#111827'
    } else {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
      document.body.classList.add('dark')
      document.body.classList.remove('light')
      document.body.style.backgroundColor = '#000000'
      document.body.style.color = '#f5f5f5'
    }
  }, [theme])

  // 데스크톱 우측 패널에 표시할 구단 (팀 선택 화면에서는 미리보기 중인 팀, 게임 중에는 유저 팀)
  const activeCompanionTeam = phase === 'TEAM_SELECT'
    ? (teams[previewTeamId] || userTeam)
    : userTeam

  return (
    <div className={`game-shell min-h-screen ${theme === 'dark' ? 'dark text-neutral-100' : 'light text-[#1d1d1f]'} flex flex-col items-center py-2 sm:py-5 px-2 sm:px-4 font-sans selection:bg-red-500/30 transition-colors duration-200`}>
      {/* 상단 글로벌 애플 스타일 내비게이션 바 */}
      <nav className="top-command-bar w-full max-w-7xl px-3 sm:px-4 py-3 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="brand-ball w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-transform hover:rotate-6">
            <svg className="w-5 h-5 text-neutral-900 dark:text-white" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
              <path d="M7 4.5C8.8 6.5 9.8 9.1 9.8 12C9.8 14.9 8.8 17.5 7 19.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M17 4.5C15.2 6.5 14.2 9.1 14.2 12C14.2 14.9 15.2 17.5 17 19.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M7.7 8.5L9.3 7.8M7.2 12H9.8M7.7 15.5L9.3 16.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              <path d="M16.3 8.5L14.7 7.8M16.8 12H14.2M16.3 15.5L14.7 16.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-base tracking-[-0.04em] text-neutral-900 dark:text-white leading-none">
                KBO<span className="font-medium text-red-600 dark:text-red-500 ml-1">GM</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-200/80 text-neutral-700 dark:bg-white/10 dark:text-neutral-300 font-mono border border-neutral-300/80 dark:border-white/15">
                ROGUELIKE
              </span>
            </div>
            <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium tracking-wide">
              THE FRONT OFFICE · 2026
            </span>
          </div>
        </div>

        {/* 다크 / 라이트 모드 전환 스위치 */}
        <div className="flex items-center bg-neutral-200/80 dark:bg-white/[0.06] p-0.5 rounded-full border border-neutral-300/80 dark:border-white/10 text-xs">
          <button
            onClick={() => setTheme('dark')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all ${
              theme === 'dark'
                ? 'bg-neutral-900 text-white font-semibold shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
            }`}
            title="다크 모드"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
            <span>다크</span>
          </button>
          <button
            onClick={() => setTheme('light')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all ${
              theme === 'light'
                ? 'bg-white text-neutral-900 font-semibold shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
            }`}
            title="라이트 모드"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span>라이트</span>
          </button>
        </div>
      </nav>

      {/* 메인 레이아웃 */}
      <div className="w-full max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* 좌측 패널 */}
          <main className="col-span-1 lg:col-span-7 xl:col-span-7 flex flex-col min-h-[85vh]">
            {phase !== 'TEAM_SELECT' && phase !== 'GAME_OVER' && (
              <Header
                season={season}
                maxSeasons={maxSeasons}
                team={userTeam}
                onOpenRoster={() => setIsRosterOpen(true)}
              />
            )}
            {phase !== 'TEAM_SELECT' && phase !== 'GAME_OVER' && (
              <SeasonProgress phase={phase} />
            )}

            {/* 1. 구단 선택 */}
            {phase === 'TEAM_SELECT' && (
              <TeamSelectView
                onSelectTeam={handleSelectTeam}
                onPreviewTeam={setPreviewTeamId}
              />
            )}

            {/* 2. 스토브리그 (구단 기조 & 외인 영입) */}
            {phase === 'STOVE_LEAGUE' && (
              <StoveLeagueView
                season={season}
                team={userTeam}
                players={players}
                candidates={foreignCandidates}
                onFinalizeStoveLeague={handleFinalizeStoveLeague}
              />
            )}

            {/* 3. 스프링캠프 (프리시즌 기조) */}
            {phase === 'PRESEASON' && (
              <PreseasonView
                season={season}
                environment={activeEnv}
                team={userTeam}
                onConfirmChoice={handleConfirmPreseason}
              />
            )}

            {/* 4. 전반기 돌발 이벤트 */}
            {phase === 'FIRST_HALF_EVENTS' && (
              <SeasonEventView
                key={inSeasonEvents[firstHalfEventIndex]?.id}
                phaseTitle={`전반기 이벤트 ${firstHalfEventIndex + 1}/3`}
                event={inSeasonEvents[firstHalfEventIndex]}
                team={userTeam}
                onConfirmChoice={handleConfirmFirstHalfEvent}
              />
            )}

            {/* 4.5. 올스타 브레이크 전반기 결산 및 실제 부상 대응 */}
            {phase === 'MIDSEASON_REPORT' && (
              <MidseasonReportView
                standings={midseasonStandings}
                userTeam={userTeam}
                injuredPlayer={players.find(player => player.id === injuredPlayerId) || null}
                onDecision={handleMidseasonDecision}
              />
            )}

            {/* 4.7. 외국인 선수 중도 교체 시장 */}
            {phase === 'FOREIGN_REPLACEMENT' && reviewForeignPlayerId && (
              <ForeignReplacementView
                team={userTeam}
                strugglingPlayer={players.find(player => player.id === reviewForeignPlayerId)!}
                candidates={foreignCandidates
                  .filter(candidate => !candidate.isAsianQuota && !players.some(player => player.id === candidate.id))
                  .sort((a, b) => b.overall - a.overall)
                  .slice(0, 4)}
                onKeep={handleKeepForeignPlayer}
                onReplace={handleReplaceForeignPlayer}
              />
            )}

            {/* 5. 1군 강등 / 2군 콜업 결단 */}
            {phase === 'CALLUP_DECISION' && (
              <CallupView
                team={userTeam}
                onConfirmCallup={handleConfirmCallup}
              />
            )}

            {/* 6. 신인 1차 지명 드래프트 */}
            {phase === 'ROOKIE_DRAFT' && (
              <DraftView
                team={userTeam}
                prospects={rookieProspects}
                onDraftRookie={handleDraftRookie}
                onBackToStoveLeague={handleBackToStoveLeague}
                onBorrowEmergencyBudget={handleBorrowEmergencyBudget}
              />
            )}

            {/* 6.5. 트레이드 마감일 */}
            {phase === 'TRADE_DEADLINE' && (
              <TradeDeadlineView
                userTeam={userTeam}
                teams={teams}
                players={players}
                offers={tradeOffers}
                onAccept={handleAcceptTrade}
                onPass={handlePassTrade}
              />
            )}

            {/* 7. 후반기 승부처 돌발 이벤트 */}
            {phase === 'SECOND_HALF_EVENTS' && (
              <SeasonEventView
                key={inSeasonEvents[secondHalfEventIndex]?.id}
                phaseTitle={`후반기 이벤트 ${secondHalfEventIndex - 2}/3`}
                event={inSeasonEvents[secondHalfEventIndex]}
                team={userTeam}
                onConfirmChoice={handleConfirmSecondHalfEvent}
              />
            )}

            {/* 7.5. [신규] 9회 승부처 현장 작전 지휘 (대타, 대주자, 번트, 투수교체, 고의사구) */}
            {phase === 'CLUTCH_MATCH' && (
              <ClutchMatchView
                season={season}
                userTeam={userTeam}
                players={players}
                prng={getPrng(777)}
                onFinishClutchMatch={handleFinishClutchMatch}
              />
            )}

            {/* 8. 144경기 페넌트레이스 결과 */}
            {phase === 'PENNANT_RACE' && (
              <PennantRaceView
                standings={standings}
                userTeam={userTeam}
                onProceed={handlePennantProceed}
              />
            )}

            {/* 9. 포스트시즌 */}
            {phase === 'POSTSEASON' && (
              <PostseasonView
                userTeam={userTeam}
                onRunPostseason={handleRunPostseason}
                results={postseasonResults}
                onProceedToSettlement={handlePostseasonSettlement}
              />
            )}

            {/* 10. 시즌 결산 */}
            {phase === 'SEASON_SETTLEMENT' && latestSummary && (
              <SettlementView
                season={season}
                maxSeasons={maxSeasons}
                summary={latestSummary}
                team={userTeam}
                isFired={isFired}
                firedReason={firedReason}
                onNextSeason={handleNextSeason}
                onFinalEnding={handleFinalEnding}
              />
            )}

            {/* 11. 최종 커리어 엔딩 */}
            {phase === 'GAME_OVER' && (
              <EndingView
                team={userTeam}
                history={history}
                isFired={isFired}
                firedReason={firedReason}
                seed={seed}
                onRestart={handleRestart}
              />
            )}
          </main>

          {/* 우측 패널: 데스크톱 컴패니언 보드 (실시간 로스터 반영) */}
          <aside className="hidden lg:block lg:col-span-5 xl:col-span-5 sticky top-6 max-h-[calc(100vh-4rem)] flex flex-col">
            <CompanionPanel
              team={activeCompanionTeam}
              players={players}
              standings={standings}
              history={history}
              season={season}
            />
          </aside>
        </div>
      </div>

      {/* 모바일 전용 로스터 모달 */}
      <RosterModal
        isOpen={isRosterOpen}
        onClose={() => setIsRosterOpen(false)}
        team={userTeam}
        players={players}
        season={season}
      />
    </div>
  )
}
