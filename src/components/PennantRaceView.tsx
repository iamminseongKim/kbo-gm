import React, { useState, useEffect } from 'react'
import { StandingsRecord, Team } from '../types'

interface PennantRaceViewProps {
  standings: StandingsRecord[]
  userTeam: Team
  onProceed: () => void
}

export const PennantRaceView: React.FC<PennantRaceViewProps> = ({
  standings,
  userTeam,
  onProceed
}) => {
  const [isSimulating, setIsSimulating] = useState(true)
  const [displayedCount, setDisplayedCount] = useState(0)

  // 144경기 시뮬레이션 순위표 롤링 연출
  useEffect(() => {
    let current = 0
    const timer = setInterval(() => {
      current += 1
      setDisplayedCount(current)
      if (current >= 10) {
        clearInterval(timer)
        setIsSimulating(false)
      }
    }, 120)
    return () => clearInterval(timer)
  }, [])

  const userStanding = standings.find(s => s.teamId === userTeam.id)
  const isPostseasonQualified = userStanding && userStanding.rank <= 5

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 space-y-4 overflow-y-auto animate-fade-in">
      {/* 상태 알림 헤더 */}
      <div className="text-center py-4 apple-card rounded-3xl">
        <div className="text-[11px] font-semibold tracking-wider text-neutral-500 dark:text-neutral-400 uppercase mb-1">
          {isSimulating ? '144-Game Pennant Race' : 'Pennant Race Final Standings'}
        </div>
        <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
          {isSimulating ? '정규시즌 144경기 시뮬레이션 중...' : `${userTeam.name} 정규시즌 ${userStanding?.rank}위 확정`}
        </h2>
      </div>

      {/* 10개 구단 순위표 테이블 */}
      <div className="apple-card rounded-3xl overflow-hidden">
        <div className="bg-neutral-100 dark:bg-white/[0.03] px-4 py-2.5 border-b border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
          <span className="w-8 text-center">순위</span>
          <span className="flex-1 ml-2">구단</span>
          <span className="w-20 text-center font-mono">승-패-무</span>
          <span className="w-14 text-center font-mono">승률</span>
          <span className="w-12 text-center font-mono">게임차</span>
        </div>

        <div className="divide-y divide-black/[0.04] dark:divide-white/[0.04] text-xs">
          {standings.slice(0, isSimulating ? displayedCount : 10).map((st) => {
            const isUser = st.teamId === userTeam.id
            const isTop5 = st.rank <= 5
            return (
              <div
                key={st.teamId}
                className={`px-4 py-2.5 flex items-center justify-between transition-all ${
                  isUser
                    ? 'bg-neutral-900 text-white dark:bg-white/[0.12] dark:text-white font-semibold shadow-sm'
                    : 'text-neutral-800 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-white/[0.02]'
                }`}
              >
                <div className="w-8 text-center font-mono text-xs">
                  {st.rank <= 5 ? (
                    <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${
                      isUser
                        ? 'bg-white text-black'
                        : 'bg-neutral-900 text-white dark:bg-white/20 dark:text-white'
                    }`}>
                      {st.rank}
                    </span>
                  ) : (
                    <span className={isUser ? 'text-neutral-300' : 'text-neutral-500 dark:text-neutral-400'}>{st.rank}</span>
                  )}
                </div>

                <div className="flex-1 ml-2 flex items-center gap-2 truncate">
                  <span className={`truncate ${isUser ? 'font-bold text-white' : 'font-medium text-neutral-900 dark:text-white'}`}>
                    {st.teamName}
                  </span>
                  {isTop5 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 font-semibold">
                      PS
                    </span>
                  )}
                </div>

                <div className={`w-20 text-center font-mono tabular-nums ${isUser ? 'text-neutral-300' : 'text-neutral-500 dark:text-neutral-400'}`}>
                  {st.wins}-{st.losses}-{st.draws}
                </div>

                <div className={`w-14 text-center font-mono font-bold tabular-nums ${isUser ? 'text-white' : 'text-neutral-900 dark:text-white'}`}>
                  {st.winRate.toFixed(3)}
                </div>

                <div className={`w-12 text-center font-mono tabular-nums ${isUser ? 'text-neutral-300' : 'text-neutral-500 dark:text-neutral-400'}`}>
                  {st.gamesBehind === 0 ? '-' : st.gamesBehind.toFixed(1)}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 다음 단계 진행 버튼 */}
      {!isSimulating && (
        <div className="pt-2 animate-fade-in">
          {isPostseasonQualified ? (
            <button
              onClick={onProceed}
              className="apple-button-primary w-full py-4 text-sm font-semibold shadow-lg transition-transform active:scale-[0.98]"
            >
              정규시즌 {userStanding?.rank}위로 가을야구(포스트시즌) 출격
            </button>
          ) : (
            <button
              onClick={onProceed}
              className="apple-button-secondary w-full py-4 text-sm font-semibold transition-transform active:scale-[0.98]"
            >
              가을야구 진출 실패 — 시즌 결산으로 이동
            </button>
          )}
        </div>
      )}
    </div>
  )
}
