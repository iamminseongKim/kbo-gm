import React, { useState } from 'react'
import { SeriesResult, TacticChoice } from '../engine/postseason'
import { Team } from '../types'

interface PostseasonViewProps {
  userTeam: Team
  onRunPostseason: (tactic: TacticChoice) => void
  results?: {
    seriesList: SeriesResult[]
    champion: Team
    userFinalResult: string
  }
  onProceedToSettlement: () => void
}

export const PostseasonView: React.FC<PostseasonViewProps> = ({
  userTeam,
  onRunPostseason,
  results,
  onProceedToSettlement
}) => {
  const [selectedTactic, setSelectedTactic] = useState<TacticChoice>('standard')
  const [hasSimulated, setHasSimulated] = useState(false)

  const handleStart = () => {
    onRunPostseason(selectedTactic)
    setHasSimulated(true)
  }

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 space-y-4 overflow-y-auto animate-fade-in">
      {/* 타이틀 배너 */}
      <div className="text-center py-4 apple-card rounded-3xl">
        <div className="text-[11px] font-semibold tracking-wider text-neutral-500 dark:text-neutral-400 uppercase mb-1">
          KBO Postseason Ladder
        </div>
        <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
          {userTeam.name} — 가을의 전설
        </h2>
      </div>

      {!hasSimulated || !results ? (
        /* 단기전 전술 선택 화면 */
        <div className="apple-card rounded-3xl p-5 sm:p-6 space-y-4">
          <div className="border-b border-black/[0.06] dark:border-white/[0.06] pb-3">
            <h3 className="font-bold text-neutral-900 dark:text-white text-base">포스트시즌 단기전 전술 지침</h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 font-normal">
              단기전의 성패를 가를 투수진 운용 방침을 결정하십시오.
            </p>
          </div>

          <div className="space-y-2.5 pt-1">
            <button
              onClick={() => setSelectedTactic('short_rest')}
              className={`w-full text-left p-4 rounded-2xl border transition-all flex flex-col gap-1.5 ${
                selectedTactic === 'short_rest'
                  ? 'bg-neutral-100/90 dark:bg-white/[0.08] border-neutral-900/30 dark:border-white/40 ring-1 ring-neutral-900/20 dark:ring-white/40 shadow-md'
                  : 'bg-neutral-50/70 hover:bg-neutral-100/60 dark:bg-white/[0.02] border-neutral-200/80 dark:border-white/[0.06] hover:border-neutral-300 dark:hover:border-white/[0.12]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white">에이스 1선발 3일 휴식 조기 등판 강행</div>
                <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  selectedTactic === 'short_rest'
                    ? 'border-neutral-900 bg-neutral-900 dark:border-white dark:bg-white'
                    : 'border-neutral-400 dark:border-white/30'
                }`}>
                  {selectedTactic === 'short_rest' && <span className="w-1.5 h-1.5 rounded-full bg-white dark:bg-black" />}
                </span>
              </div>
              <div className="text-xs text-neutral-600 dark:text-neutral-400 font-normal">
                1선발을 최대한 많이 투입하여 확실한 승리를 노립니다. (승률 보정 +8%)
              </div>
            </button>

            <button
              onClick={() => setSelectedTactic('early_closer')}
              className={`w-full text-left p-4 rounded-2xl border transition-all flex flex-col gap-1.5 ${
                selectedTactic === 'early_closer'
                  ? 'bg-neutral-100/90 dark:bg-white/[0.08] border-neutral-900/30 dark:border-white/40 ring-1 ring-neutral-900/20 dark:ring-white/40 shadow-md'
                  : 'bg-neutral-50/70 hover:bg-neutral-100/60 dark:bg-white/[0.02] border-neutral-200/80 dark:border-white/[0.06] hover:border-neutral-300 dark:hover:border-white/[0.12]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white">위기 시 8회 마무리 조기 투입 총력전</div>
                <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  selectedTactic === 'early_closer'
                    ? 'border-neutral-900 bg-neutral-900 dark:border-white dark:bg-white'
                    : 'border-neutral-400 dark:border-white/30'
                }`}>
                  {selectedTactic === 'early_closer' && <span className="w-1.5 h-1.5 rounded-full bg-white dark:bg-black" />}
                </span>
              </div>
              <div className="text-xs text-neutral-600 dark:text-neutral-400 font-normal">
                경기 후반 리드를 잡는 즉시 뒷문을 걸어잠급니다. (승률 보정 +5%)
              </div>
            </button>

            <button
              onClick={() => setSelectedTactic('standard')}
              className={`w-full text-left p-4 rounded-2xl border transition-all flex flex-col gap-1.5 ${
                selectedTactic === 'standard'
                  ? 'bg-neutral-100/90 dark:bg-white/[0.08] border-neutral-900/30 dark:border-white/40 ring-1 ring-neutral-900/20 dark:ring-white/40 shadow-md'
                  : 'bg-neutral-50/70 hover:bg-neutral-100/60 dark:bg-white/[0.02] border-neutral-200/80 dark:border-white/[0.06] hover:border-neutral-300 dark:hover:border-white/[0.12]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white">4선발 정석 로테이션 가동</div>
                <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  selectedTactic === 'standard'
                    ? 'border-neutral-900 bg-neutral-900 dark:border-white dark:bg-white'
                    : 'border-neutral-400 dark:border-white/30'
                }`}>
                  {selectedTactic === 'standard' && <span className="w-1.5 h-1.5 rounded-full bg-white dark:bg-black" />}
                </span>
              </div>
              <div className="text-xs text-neutral-600 dark:text-neutral-400 font-normal">
                무리한 당겨쓰기 없이 투수진의 체력과 밸런스를 지킵니다. (안정적 전력)
              </div>
            </button>
          </div>

          <div className="pt-2">
            <button
              onClick={handleStart}
              className="apple-button-primary w-full py-4 text-sm font-semibold shadow-lg transition-transform active:scale-[0.98]"
            >
              포스트시즌 시리즈 돌입
            </button>
          </div>
        </div>
      ) : (
        /* 포스트시즌 경기 결과 브래킷 */
        <div className="space-y-4 animate-fade-in">
          {/* 결과 배너 */}
          <div className="apple-card rounded-3xl p-5 text-center">
            <div className="text-[11px] text-neutral-500 dark:text-neutral-400 font-semibold uppercase tracking-wider">
              최종 성적
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mt-1 tracking-tight">
              {results.userFinalResult}
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 font-normal">
              2026 챔피언: <span className="font-bold text-neutral-900 dark:text-white">{results.champion.name}</span>
            </p>
          </div>

          {/* 시리즈별 경기 기록 */}
          <div className="space-y-2.5 text-xs">
            {results.seriesList.map((s, idx) => {
              const isUserInvolved = s.team1.id === userTeam.id || s.team2.id === userTeam.id
              const isUserWon = s.winner.id === userTeam.id
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border transition-all ${
                    isUserInvolved
                      ? isUserWon
                        ? 'bg-neutral-100/90 dark:bg-white/[0.06] border-neutral-400/40 dark:border-white/30 ring-1 ring-neutral-900/10 dark:ring-white/20'
                        : 'bg-neutral-50 dark:bg-white/[0.02] border-neutral-200 dark:border-white/[0.08]'
                      : 'bg-neutral-50/50 dark:bg-white/[0.02] border-neutral-200/60 dark:border-white/[0.05]'
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold mb-2">
                    <span className="text-neutral-700 dark:text-neutral-300 font-semibold">{s.roundName}</span>
                    <span className="text-neutral-900 dark:text-white font-mono font-bold">
                      {s.winner.shortName} 승리 ({s.team1Wins} : {s.team2Wins})
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-600 dark:text-neutral-400 space-y-1 font-normal">
                    {s.logs.slice(-2).map((log, lIdx) => (
                      <div key={lIdx} className="truncate">• {log}</div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="pt-2">
            <button
              onClick={onProceedToSettlement}
              className="apple-button-primary w-full py-4 text-sm font-semibold shadow-lg transition-transform active:scale-[0.98]"
            >
              시즌 결산 리포트로 이동
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
