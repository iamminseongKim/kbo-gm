import React, { useState } from 'react'
import { Team, Player, ForeignCandidate } from '../types'

interface StoveLeagueViewProps {
  team: Team
  players: Player[]
  candidates: ForeignCandidate[]
  onReleasePlayer: (playerId: string, refundBudget: number) => void
  onSignForeign: (candidate: ForeignCandidate, replacePlayerId: string) => void
  onProceed: () => void
}

export const StoveLeagueView: React.FC<StoveLeagueViewProps> = ({
  team,
  players,
  candidates,
  onReleasePlayer,
  onSignForeign,
  onProceed
}) => {
  const teamPlayers = players.filter(p => p.teamId === team.id)
  const currentForeigns = teamPlayers.filter(p => p.isForeign)
  const releasablePlayers = teamPlayers.filter(p => p.age >= 32 || p.salary >= 8)

  const [selectedCandidate, setSelectedCandidate] = useState<ForeignCandidate | null>(null)
  const [selectedReplaceId, setSelectedReplaceId] = useState<string>(currentForeigns[0]?.id || '')
  const [releasedIds, setReleasedIds] = useState<string[]>([])
  const [signedCandidateIds, setSignedCandidateIds] = useState<string[]>([])

  const handleRelease = (player: Player) => {
    const refund = Math.round(player.salary * 0.7)
    onReleasePlayer(player.id, refund)
    setReleasedIds(prev => [...prev, player.id])
  }

  const handleSign = () => {
    if (!selectedCandidate || !selectedReplaceId) return
    onSignForeign(selectedCandidate, selectedReplaceId)
    setSignedCandidateIds(prev => [...prev, selectedCandidate.id])
    setSelectedCandidate(null)
  }

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 space-y-6 overflow-y-auto animate-fade-in">
      {/* 헤더 브리핑 */}
      <div className="text-center py-4 apple-card rounded-3xl p-5">
        <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 tracking-wider uppercase">
          KBO Stove League & Roster Management
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white mt-1">
          스토브리그: 선수단 정리 및 외인 계약
        </h2>
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1 max-w-md mx-auto">
          예산 잔액과 샐러리를 고려하여 고액 베테랑 정리 및 특급 외국인 선수를 영입하십시오.
        </p>
      </div>

      {/* 섹션 1: 외국인 선수 스카우트 풀 */}
      <div className="apple-card rounded-3xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.06] pb-3">
          <div>
            <h3 className="font-bold text-base text-neutral-900 dark:text-white">
              ✈️ 2026 해외 스카우트 풀 (외국인 후보)
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              현재 보유 외인: {currentForeigns.map(f => `${f.name}(${f.position})`).join(', ') || '없음'}
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-white/[0.06] text-neutral-700 dark:text-neutral-300 font-semibold border border-neutral-200 dark:border-white/10">
            가용 예산: {team.budget}억원
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {candidates.map((c) => {
            const isSigned = signedCandidateIds.includes(c.id)
            const isAffordable = team.budget >= c.salary
            const isSelected = selectedCandidate?.id === c.id

            return (
              <div
                key={c.id}
                onClick={() => {
                  if (!isSigned && isAffordable) {
                    setSelectedCandidate(isSelected ? null : c)
                  }
                }}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                  isSigned
                    ? 'bg-neutral-100 dark:bg-white/[0.02] border-neutral-200 dark:border-white/[0.04] opacity-50 cursor-not-allowed'
                    : isSelected
                    ? 'bg-neutral-100/90 dark:bg-white/[0.08] border-neutral-900 dark:border-white ring-2 ring-neutral-900/20 dark:ring-white/40 shadow-md cursor-pointer'
                    : isAffordable
                    ? 'bg-white hover:bg-neutral-50 dark:bg-[#18181b] dark:hover:bg-[#202024] border-neutral-200/90 dark:border-white/[0.08] shadow-sm cursor-pointer'
                    : 'bg-neutral-50/50 dark:bg-white/[0.01] border-neutral-200/50 dark:border-white/[0.03] opacity-60 cursor-not-allowed'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-white/10 text-neutral-800 dark:text-neutral-200 font-bold border border-neutral-200 dark:border-white/10">
                      {c.position}
                    </span>
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 font-mono">
                      OVR {c.overall}
                    </span>
                  </div>

                  <h4 className="font-bold text-base text-neutral-900 dark:text-white">{c.name}</h4>
                  <div className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono mt-0.5">
                    {c.age}세 · 계약 연봉 {c.salary}억
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-1 font-medium truncate">
                    {c.previousTeam}
                  </div>

                  <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-2 leading-relaxed">
                    {c.scoutSummary}
                  </p>
                </div>

                <div>
                  {/* 스탯 표시 */}
                  <div className="bg-neutral-100/80 dark:bg-white/[0.03] p-2 rounded-xl text-[11px] font-mono mb-2">
                    {c.isPitcher && c.pitcherStats ? (
                      <div className="flex justify-between text-neutral-700 dark:text-neutral-300">
                        <span>구위 <b>{c.pitcherStats.stuff}</b></span>
                        <span>제구 <b>{c.pitcherStats.control}</b></span>
                      </div>
                    ) : c.batterStats ? (
                      <div className="flex justify-between text-neutral-700 dark:text-neutral-300">
                        <span>컨택 <b>{c.batterStats.contact}</b></span>
                        <span>장타 <b>{c.batterStats.power}</b></span>
                      </div>
                    ) : null}
                  </div>

                  {isSigned ? (
                    <div className="text-center text-xs font-bold text-emerald-600 dark:text-emerald-400 py-1.5">
                      ✓ 계약 완료
                    </div>
                  ) : !isAffordable ? (
                    <div className="text-center text-xs font-semibold text-red-500 py-1.5">
                      ⚠️ 예산 부족 ({c.salary - team.budget}억 필요)
                    </div>
                  ) : (
                    <button
                      type="button"
                      className={`w-full py-2 rounded-xl text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                          : 'bg-neutral-100 dark:bg-white/10 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200'
                      }`}
                    >
                      {isSelected ? '선택 해제' : '영입 후보 선택'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* 외인 교체 대상 지정 및 계약 확정 모달식 바 */}
        {selectedCandidate && (
          <div className="bg-neutral-100/90 dark:bg-white/[0.04] p-4 rounded-2xl border border-neutral-300/80 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in">
            <div className="text-xs">
              <span className="font-bold text-neutral-900 dark:text-white">
                [{selectedCandidate.name}]
              </span>
              <span className="text-neutral-600 dark:text-neutral-300 ml-1">
                영입 시 대체할 기존 외국인 선수:
              </span>
              <select
                value={selectedReplaceId}
                onChange={(e) => setSelectedReplaceId(e.target.value)}
                className="ml-2 px-2.5 py-1.5 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-300 dark:border-white/10 text-xs font-semibold"
              >
                {currentForeigns.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.position}, 연봉 {f.salary}억, OVR {f.overall})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleSign}
              className="apple-button-primary px-5 py-2.5 text-xs font-bold whitespace-nowrap shadow-md"
            >
              계약 체결 (지출: {selectedCandidate.salary}억)
            </button>
          </div>
        )}
      </div>

      {/* 섹션 2: 선수단 정리 (방출 / 샐러리 세이브) */}
      <div className="apple-card rounded-3xl p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.06] pb-3">
          <div>
            <h3 className="font-bold text-base text-neutral-900 dark:text-white">
              ✂️ 선수단 정리 (방출 및 샐러리 삭감)
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              고연봉 노쇠화 선수를 정리하면 연봉의 70%를 예산으로 환급받습니다.
            </p>
          </div>
        </div>

        <div className="space-y-2 text-xs">
          {releasablePlayers.slice(0, 4).map(p => {
            const isReleased = releasedIds.includes(p.id)
            const refund = Math.round(p.salary * 0.7)
            return (
              <div
                key={p.id}
                className="p-3 rounded-xl bg-neutral-50 dark:bg-white/[0.02] border border-neutral-200/80 dark:border-white/[0.04] flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-neutral-500">{p.position}</span>
                  <span className="font-bold text-neutral-900 dark:text-white">{p.name}</span>
                  <span className="text-neutral-500 font-mono">({p.age}세 · 연봉 {p.salary}억)</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-200 text-neutral-700 dark:bg-white/10 dark:text-neutral-300">
                    OVR {p.overall}
                  </span>
                </div>

                {isReleased ? (
                  <span className="text-neutral-400 font-semibold">방출 완료 (+{refund}억 환급)</span>
                ) : (
                  <button
                    onClick={() => handleRelease(p)}
                    className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-300 dark:border-red-500/20 border border-red-200 text-xs font-semibold transition"
                  >
                    방출 (+{refund}억 확보)
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* 완료 버튼 */}
      <div className="pt-2">
        <button
          onClick={onProceed}
          className="apple-button-primary w-full py-4 text-sm font-semibold shadow-lg transition-transform active:scale-[0.98]"
        >
          스토브리그 마감 및 스프링캠프로 이동
        </button>
      </div>
    </div>
  )
}
