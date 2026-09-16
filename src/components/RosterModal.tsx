import React, { useState } from 'react'
import { Player, Team } from '../types'

interface RosterModalProps {
  isOpen: boolean
  onClose: () => void
  team: Team
  players: Player[]
}

export const RosterModal: React.FC<RosterModalProps> = ({
  isOpen,
  onClose,
  team,
  players
}) => {
  const [tab, setTab] = useState<'all' | 'pitcher' | 'batter'>('all')

  if (!isOpen) return null

  const teamPlayers = players.filter(p => p.teamId === team.id)
  const pitchers = teamPlayers.filter(p => p.isPitcher)
  const batters = teamPlayers.filter(p => !p.isPitcher)

  const displayedPlayers = tab === 'pitcher' ? pitchers : tab === 'batter' ? batters : teamPlayers

  const getRatingBadge = (ovr: number) => {
    if (ovr >= 92) {
      return {
        tier: 'S',
        badge: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-400/15 dark:text-amber-300 dark:border-amber-400/30',
        pill: 'bg-amber-100 text-amber-800 dark:bg-amber-400/20 dark:text-amber-300'
      }
    }
    if (ovr >= 85) {
      return {
        tier: 'A+',
        badge: 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30',
        pill: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300'
      }
    }
    if (ovr >= 80) {
      return {
        tier: 'A',
        badge: 'bg-neutral-200 text-neutral-800 border-neutral-300 dark:bg-white/10 dark:text-neutral-200 dark:border-white/15',
        pill: 'bg-neutral-200 text-neutral-700 dark:bg-white/[0.08] dark:text-neutral-300'
      }
    }
    return {
      tier: 'B',
      badge: 'bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-white/[0.06] dark:text-neutral-400 dark:border-white/10',
      pill: 'bg-neutral-100 text-neutral-600 dark:bg-white/[0.04] dark:text-neutral-400'
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="apple-card rounded-3xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-black/[0.08] dark:border-white/10">
        {/* 모달 헤더 */}
        <div className="p-5 border-b border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span
              className="w-3.5 h-3.5 rounded-full ring-2 ring-black/10 dark:ring-white/20"
              style={{ backgroundColor: team.primaryColor }}
            />
            <h3 className="font-bold text-neutral-900 dark:text-white text-base tracking-tight">
              {team.name} 2026 공식 엔트리 ({teamPlayers.length}명)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.12] text-neutral-600 dark:text-neutral-300 flex items-center justify-center transition text-sm"
          >
            ✕
          </button>
        </div>

        {/* 탭 필터 */}
        <div className="px-5 pt-3 pb-2 flex gap-1.5 border-b border-black/[0.04] dark:border-white/[0.04]">
          <button
            onClick={() => setTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              tab === 'all'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-black shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
            }`}
          >
            전체 ({teamPlayers.length})
          </button>
          <button
            onClick={() => setTab('pitcher')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              tab === 'pitcher'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-black shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
            }`}
          >
            투수 ({pitchers.length})
          </button>
          <button
            onClick={() => setTab('batter')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              tab === 'batter'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-black shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
            }`}
          >
            야수 ({batters.length})
          </button>
        </div>

        {/* 선수 리스트 스크롤 영역 */}
        <div className="p-4 overflow-y-auto space-y-2.5 text-xs flex-1">
          {displayedPlayers.map(p => {
            const rating = getRatingBadge(p.overall)
            return (
              <div
                key={p.id}
                className="p-3 rounded-2xl bg-white hover:bg-neutral-50 dark:bg-[#18181b] dark:hover:bg-[#202024] border border-neutral-200/90 dark:border-white/[0.08] transition-all duration-200 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col gap-2"
              >
                {/* Upper Row: Position, Name, Foreign Badge, Age/Salary, Rating */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-neutral-100 text-neutral-800 dark:bg-white/10 dark:text-neutral-200 flex items-center justify-center font-mono font-bold text-xs shrink-0 border border-neutral-200 dark:border-white/10 shadow-sm">
                      {p.position}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-sm text-neutral-900 dark:text-white tracking-tight">
                          {p.name}
                        </span>
                        {p.isForeign && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300 border border-amber-300/80 dark:border-amber-400/30">
                            외인
                          </span>
                        )}
                        <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                          {p.age}세 · {p.salary}억
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded-md ${rating.pill}`}>
                      {rating.tier}
                    </span>
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-bold border shadow-sm ${rating.badge}`}>
                      {p.overall}
                    </span>
                  </div>
                </div>

                {/* Body Row: Vertical Stats (Left) + Adjacent Traits (Right) */}
                <div className="grid grid-cols-12 gap-2.5 items-center">
                  <div className="col-span-7 flex flex-col gap-1.5 bg-neutral-50 dark:bg-white/[0.03] p-2 rounded-xl border border-neutral-200/80 dark:border-white/[0.06]">
                    {p.isPitcher && p.pitcherStats ? (
                      <>
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className="text-neutral-600 dark:text-neutral-400 font-semibold w-7">구위</span>
                          <div className="flex-1 mx-2 h-1.5 rounded-full bg-neutral-200 dark:bg-white/10 overflow-hidden">
                            <div
                              className="h-full bg-neutral-900 dark:bg-white rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(100, Math.max(10, p.pitcherStats.stuff))}%` }}
                            />
                          </div>
                          <span className="font-bold text-neutral-900 dark:text-neutral-100 w-5 text-right">{p.pitcherStats.stuff}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className="text-neutral-600 dark:text-neutral-400 font-semibold w-7">제구</span>
                          <div className="flex-1 mx-2 h-1.5 rounded-full bg-neutral-200 dark:bg-white/10 overflow-hidden">
                            <div
                              className="h-full bg-neutral-900 dark:bg-white rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(100, Math.max(10, p.pitcherStats.control))}%` }}
                            />
                          </div>
                          <span className="font-bold text-neutral-900 dark:text-neutral-100 w-5 text-right">{p.pitcherStats.control}</span>
                        </div>
                      </>
                    ) : p.batterStats ? (
                      <>
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className="text-neutral-600 dark:text-neutral-400 font-semibold w-7">컨택</span>
                          <div className="flex-1 mx-2 h-1.5 rounded-full bg-neutral-200 dark:bg-white/10 overflow-hidden">
                            <div
                              className="h-full bg-neutral-900 dark:bg-white rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(100, Math.max(10, p.batterStats.contact))}%` }}
                            />
                          </div>
                          <span className="font-bold text-neutral-900 dark:text-neutral-100 w-5 text-right">{p.batterStats.contact}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className="text-neutral-600 dark:text-neutral-400 font-semibold w-7">장타</span>
                          <div className="flex-1 mx-2 h-1.5 rounded-full bg-neutral-200 dark:bg-white/10 overflow-hidden">
                            <div
                              className="h-full bg-neutral-900 dark:bg-white rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(100, Math.max(10, p.batterStats.power))}%` }}
                            />
                          </div>
                          <span className="font-bold text-neutral-900 dark:text-neutral-100 w-5 text-right">{p.batterStats.power}</span>
                        </div>
                      </>
                    ) : null}
                  </div>

                  <div className="col-span-5 flex flex-wrap gap-1 content-center">
                    {p.traits.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-1.5 py-0.5 rounded-md bg-neutral-100 dark:bg-white/[0.06] text-neutral-700 dark:text-neutral-300 border border-neutral-200/80 dark:border-white/[0.06] font-medium leading-tight truncate max-w-full"
                        title={t}
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="p-3.5 border-t border-black/[0.06] dark:border-white/[0.06] bg-neutral-50/50 dark:bg-white/[0.01] text-center">
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-normal">
            2026 KBO 공식 등록 선수단 명단 및 능력치 기준
          </p>
        </div>
      </div>
    </div>
  )
}
