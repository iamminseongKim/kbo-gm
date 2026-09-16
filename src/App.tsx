import { useState, useEffect } from 'react'
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
  TeamStance
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
  convertRookieToPlayer
} from './engine/player_generator'
import { advanceSeasonAndApplyAging } from './engine/aging'
import { assignSeasonPlayerForms } from './engine/form'

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
import { PostseasonView } from './components/PostseasonView'
import { SettlementView } from './components/SettlementView'
import { EndingView } from './components/EndingView'

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

  // 시즌 돌발 이벤트
  const [inSeasonEvents, setInSeasonEvents] = useState(IN_SEASON_EVENTS)

  // 시뮬레이션 결과
  const [standings, setStandings] = useState<StandingsRecord[]>([])
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
    setTeams(JSON.parse(JSON.stringify(KBO_TEAMS)))

    // 시즌 1 선수들에게 초기 폼(대폭발 / 슬럼프 / 상승 / 부진) 부여
    const initPrng = new PRNG(`${customSeed}_season_1_forms`)
    const basePlayers = JSON.parse(JSON.stringify(INITIAL_PLAYERS))
    const playersWithForms = assignSeasonPlayerForms(basePlayers, initPrng)
    setPlayers(playersWithForms)

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
    const foreigners = generateForeignCandidates(prng, seasonNum)
    setForeignCandidates(foreigners)

    // 신인 드래프트 3인 생성 (리빌딩 누적 시 특급 스카우팅 보너스)
    const rookies = generateRookieProspects(prng, seasonNum, currentRebuildStack)
    setRookieProspects(rookies)

    // 전반기 / 후반기 이벤트 2개 추첨
    const pickedEvents = prng.sample(IN_SEASON_EVENTS, 2)
    setInSeasonEvents(pickedEvents)

    setModifierDelta(0)
    setPostseasonResults(undefined)
  }

  // 리소스 변경 적용 헬퍼
  const applyOptionDeltas = (opt: EventOption) => {
    setTeams(prev => {
      const current = prev[userTeamId]
      const updated = {
        ...current,
        budget: Math.max(-100, current.budget + (opt.budgetDelta || 0)),
        ownerTrust: Math.min(100, Math.max(0, current.ownerTrust + (opt.ownerTrustDelta || 0))),
        fanSupport: Math.min(100, Math.max(0, current.fanSupport + (opt.fanSupportDelta || 0))),
        chemistry: Math.min(100, Math.max(0, current.chemistry + (opt.chemistryDelta || 0))),
        farmSystem: Math.min(100, Math.max(0, current.farmSystem + (opt.farmDelta || 0)))
      }
      return { ...prev, [userTeamId]: updated }
    })
    if (opt.overallDelta) {
      setModifierDelta(prev => prev + (opt.overallDelta || 0))
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
    applyOptionDeltas(option)
    setPhase('FIRST_HALF_EVENTS')
  }

  // [Phase 3 -> 4] 전반기 이벤트 완료 -> 1군 강등 / 2군 콜업 결단
  const handleConfirmFirstHalfEvent = (option: EventOption) => {
    applyOptionDeltas(option)
    setPhase('CALLUP_DECISION')
  }

  // [Phase 4 -> 5] 콜업 결단 완료 -> 신인 1차 드래프트
  const handleConfirmCallup = (option: EventOption) => {
    applyOptionDeltas(option)
    setPhase('ROOKIE_DRAFT')
  }

  // [Phase 5 -> 6] 신인 1차 지명 완료 -> 후반기 돌발 이벤트
  const handleDraftRookie = (prospect: RookieProspect) => {
    const newRookie = convertRookieToPlayer(prospect, userTeamId)
    setPlayers(prev => [...prev, newRookie])
    setTeams(prev => ({
      ...prev,
      [userTeamId]: {
        ...prev[userTeamId],
        budget: prev[userTeamId].budget - prospect.signingBonus,
        farmSystem: Math.min(100, prev[userTeamId].farmSystem + 12),
        fanSupport: Math.min(100, prev[userTeamId].fanSupport + 5)
      }
    }))
    setPhase('SECOND_HALF_EVENTS')
  }

  // [Phase 6 -> 7] 후반기 이벤트 완료 -> 144경기 페넌트레이스 시뮬레이션
  const handleConfirmSecondHalfEvent = (option: EventOption) => {
    applyOptionDeltas(option)
    const prng = getPrng(888)
    const res = simulatePennantRace(teams, players, prng, activeEnv, modifierDelta, userTeamId)
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
    const res = simulatePostseason(standings, teams, prng, userTeamId, tactic)
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
    const finalPlayers = assignSeasonPlayerForms(updatedPlayers, prng)
    setPlayers(finalPlayers)

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
    <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-black text-neutral-100' : 'light bg-[#f5f5f7] text-[#1d1d1f]'} flex flex-col items-center py-2 sm:py-6 px-2 sm:px-4 font-sans selection:bg-neutral-500/30 transition-colors duration-200`}>
      {/* 상단 글로벌 애플 스타일 내비게이션 바 */}
      <nav className="w-full max-w-7xl px-3 py-2.5 mb-4 flex items-center justify-between border-b border-black/[0.08] dark:border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-neutral-200/70 dark:bg-white/[0.08] border border-neutral-300/80 dark:border-white/15 flex items-center justify-center shadow-sm backdrop-blur transition-transform hover:scale-105">
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
              <span className="font-bold text-base tracking-tight text-neutral-900 dark:text-white leading-none">
                KBO<span className="font-light text-neutral-500 dark:text-neutral-400 ml-0.5">GM</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-200/80 text-neutral-700 dark:bg-white/10 dark:text-neutral-300 font-mono border border-neutral-300/80 dark:border-white/15">
                2026
              </span>
            </div>
            <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium tracking-wide">
              단장 로그라이크 시뮬레이터
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
                phaseTitle="전반기 레이스"
                event={inSeasonEvents[0]}
                team={userTeam}
                onConfirmChoice={handleConfirmFirstHalfEvent}
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
              />
            )}

            {/* 7. 후반기 승부처 돌발 이벤트 */}
            {phase === 'SECOND_HALF_EVENTS' && (
              <SeasonEventView
                phaseTitle="후반기 승부처"
                event={inSeasonEvents[1]}
                team={userTeam}
                onConfirmChoice={handleConfirmSecondHalfEvent}
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
