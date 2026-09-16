import { useState, useEffect } from 'react'
import { GamePhase, Team, Player, EnvironmentCard, EventOption, StandingsRecord, SeasonSummary } from './types'
import { KBO_TEAMS } from './data/teams'
import { INITIAL_PLAYERS } from './data/players'
import { ENVIRONMENT_CARDS } from './data/environmentCards'
import { IN_SEASON_EVENTS } from './data/events'
import { PRNG } from './engine/prng'
import { simulatePennantRace } from './engine/simulation'
import { simulatePostseason, SeriesResult, TacticChoice } from './engine/postseason'
import { Header } from './components/Header'
import { RosterModal } from './components/RosterModal'
import { CompanionPanel } from './components/CompanionPanel'
import { TeamSelectView } from './components/TeamSelectView'
import { PreseasonView } from './components/PreseasonView'
import { SeasonEventView } from './components/SeasonEventView'
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
  const [players] = useState<Player[]>(INITIAL_PLAYERS)
  const [userTeamId, setUserTeamId] = useState<string>('kia')
  const [previewTeamId, setPreviewTeamId] = useState<string>('kia')
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  const [activeEnv, setActiveEnv] = useState<EnvironmentCard>(ENVIRONMENT_CARDS[0])
  const [modifierDelta, setModifierDelta] = useState<number>(0)

  // 시즌 돌발 이벤트
  const [inSeasonEvents, setInSeasonEvents] = useState(IN_SEASON_EVENTS)
  const [eventStep, setEventStep] = useState<number>(1) // 1 for first event (결정 2), 2 for second event (결정 3)

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

  // 1. 구단 선택 후 게임 시작
  const handleSelectTeam = (teamId: string, customSeed: string) => {
    setUserTeamId(teamId)
    setSeed(customSeed)
    setSeason(1)
    setHistory([])
    setIsFired(false)
    setFiredReason('')
    setTeams(JSON.parse(JSON.stringify(KBO_TEAMS)))

    // 시즌 1 환경 카드 및 이벤트 뽑기
    initSeason(1, customSeed)
    setPhase('PRESEASON')
  }

  // 시즌 초기화 헬퍼
  const initSeason = (seasonNum: number, currentSeed: string) => {
    const prng = new PRNG(`${currentSeed}_season_${seasonNum}`)
    // 환경 카드 추첨
    const envIdx = prng.nextInt(0, ENVIRONMENT_CARDS.length - 1)
    setActiveEnv(ENVIRONMENT_CARDS[envIdx])

    // 시즌 중 이벤트 2개 추첨
    const pickedEvents = prng.sample(IN_SEASON_EVENTS, 2)
    setInSeasonEvents(pickedEvents)
    setEventStep(1)
    setModifierDelta(0)
    setPostseasonResults(undefined)
  }

  // 유저 팀 가져오기
  const userTeam = teams[userTeamId] || KBO_TEAMS.kia

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

  // 2. 프리시즌 선택 확정 -> 첫 번째 시즌 이벤트로
  const handleConfirmPreseason = (option: EventOption) => {
    applyOptionDeltas(option)
    setPhase('SEASON_EVENTS')
  }

  // 3. 시즌 이벤트 선택
  const handleConfirmEvent = (option: EventOption) => {
    applyOptionDeltas(option)
    if (eventStep === 1) {
      setEventStep(2) // 두 번째 이벤트로
    } else {
      // 3개 결정 완료 -> 144경기 페넌트레이스 시뮬레이션
      const prng = getPrng(888)
      const res = simulatePennantRace(teams, players, prng, activeEnv, modifierDelta, userTeamId)
      setStandings(res)
      setPhase('PENNANT_RACE')
    }
  }

  // 4. 페넌트레이스 종료 후 진행 (5위 이내면 포스트시즌, 아니면 결산)
  const handlePennantProceed = () => {
    const userStanding = standings.find(s => s.teamId === userTeamId)
    if (userStanding && userStanding.rank <= 5) {
      setPhase('POSTSEASON')
    } else {
      processSeasonSettlement('가을야구 탈락')
    }
  }

  // 5. 포스트시즌 시뮬레이션 실행
  const handleRunPostseason = (tactic: TacticChoice) => {
    const prng = getPrng(999)
    const res = simulatePostseason(standings, teams, prng, userTeamId, tactic)
    setPostseasonResults(res)
  }

  // 6. 포스트시즌 후 결산으로 이동
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

    // 구단주 및 팬 평가 변화
    let trustDelta = rank <= 5 ? 10 : -15
    let fanDelta = rank <= 5 ? 12 : -8
    if (postseasonResult.includes('우승!')) {
      trustDelta += 15
      fanDelta += 20
    }

    const newOwnerTrust = Math.min(100, Math.max(0, userTeam.ownerTrust + trustDelta))
    const newFanSupport = Math.min(100, Math.max(0, userTeam.fanSupport + fanDelta))
    const newBudget = userTeam.budget + 40 // 차기 시즌 운영비 지급

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

  // 7. 다음 시즌으로 진입
  const handleNextSeason = () => {
    const nextSeason = season + 1
    setSeason(nextSeason)
    initSeason(nextSeason, seed)
    setPhase('PRESEASON')
  }

  // 8. 최종 엔딩 화면으로 진입
  const handleFinalEnding = () => {
    setPhase('GAME_OVER')
  }

  // 9. 재시작
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
        {/* 1. 애플 스타일 KBO GM 로고 & 워드마크 */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-neutral-200/70 dark:bg-white/[0.08] border border-neutral-300/80 dark:border-white/15 flex items-center justify-center shadow-sm backdrop-blur transition-transform hover:scale-105">
            {/* Apple Precision Minimalist Baseball Stitches Emblem */}
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

        {/* 2. 다크 모드 / 라이트 모드 전환 스위치 */}
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

      {/* 3. 메인 레이아웃: 모바일은 1장 보기, 태블릿/데스크톱은 2장 보기 완전 자동 반응형 */}
      <div className="w-full max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* 좌측 패널: 메인 게임 플로우 */}
          <main className="col-span-1 lg:col-span-7 xl:col-span-7 flex flex-col min-h-[85vh]">
            {/* 상단 헤더 (구단 선택 및 엔딩 화면 제외) */}
            {phase !== 'TEAM_SELECT' && phase !== 'GAME_OVER' && (
              <Header
                season={season}
                maxSeasons={maxSeasons}
                team={userTeam}
                onOpenRoster={() => setIsRosterOpen(true)}
              />
            )}

            {/* 뷰 스위처 */}
            {phase === 'TEAM_SELECT' && (
              <TeamSelectView
                onSelectTeam={handleSelectTeam}
                onPreviewTeam={setPreviewTeamId}
              />
            )}

            {phase === 'PRESEASON' && (
              <PreseasonView
                season={season}
                environment={activeEnv}
                onConfirmChoice={handleConfirmPreseason}
              />
            )}

            {phase === 'SEASON_EVENTS' && (
              <SeasonEventView
                eventNumber={eventStep + 1}
                event={inSeasonEvents[eventStep - 1]}
                onConfirmChoice={handleConfirmEvent}
              />
            )}

            {phase === 'PENNANT_RACE' && (
              <PennantRaceView
                standings={standings}
                userTeam={userTeam}
                onProceed={handlePennantProceed}
              />
            )}

            {phase === 'POSTSEASON' && (
              <PostseasonView
                userTeam={userTeam}
                onRunPostseason={handleRunPostseason}
                results={postseasonResults}
                onProceedToSettlement={handlePostseasonSettlement}
              />
            )}

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

          {/* 우측 패널: 태블릿 & 데스크톱 컴패니언 보드 (모바일 화면에서는 자동 숨김) */}
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
      />
    </div>
  )
}
