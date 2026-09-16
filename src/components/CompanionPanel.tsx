import React, { useState } from 'react'
import { Team, Player, StandingsRecord, SeasonSummary } from '../types'

interface CompanionPanelProps {
  team: Team
  players: Player[]
  standings?: StandingsRecord[]
  history?: SeasonSummary[]
  season: number
}

export const CompanionPanel: React.FC<CompanionPanelProps> = ({
  team,
  players,
  standings,
  history = [],
  season
}) => {
  const [activeTab, setActiveTab] = useState<'roster' | 'standings'>('roster')

  const teamPlayers = players.filter(p => p.teamId === team.id)
  const pitchers = teamPlayers.filter(p => p.isPitcher)
  const batters = teamPlayers.filter(p => !p.isPitcher)

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

  const renderPlayerCard = (p: Player) => {
    const rating = getRatingBadge(p.overall)
    return (
      <div
        key={p.id}
        className="p-3.5 rounded-2xl bg-white hover:bg-neutral-50 dark:bg-[#18181b] dark:hover:bg-[#202024] border border-neutral-200/90 dark:border-white/[0.08] transition-all duration-200 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col gap-2.5"
      >
        {/* 상단 행: 포지션 뱃지, 선수명, 외인 태그, 나이/연봉, 티어/오버롤 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* 포지션 스쿼클 */}
            <div className="w-8 h-8 rounded-xl bg-neutral-100 text-neutral-800 dark:bg-white/10 dark:text-neutral-200 flex items-center justify-center font-mono font-bold text-xs shrink-0 border border-neutral-200 dark:border-white/10 shadow-sm">
              {p.position}
            </div>

            {/* 선수명 및 바이탈 */}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-sm text-neutral-900 dark:text-white tracking-tight">
                  {p.name}
                </span>
                {p.isForeign && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full border ${
                    p.isAsianQuota
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-400/15 dark:text-purple-300 border-purple-300/80 dark:border-purple-400/30'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300 border-amber-300/80 dark:border-amber-400/30'
                  }`}>
                    {p.isAsianQuota ? '아시아' : '외인'}
                  </span>
                )}
                <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                  {p.age}세 · {p.salary}억
                </span>
              </div>
            </div>
          </div>

          {/* 종합 오버롤 토큰 */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded-md ${rating.pill}`}>
              {rating.tier}
            </span>
            <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-mono font-bold border shadow-sm ${rating.badge}`}>
              {p.overall}
            </span>
          </div>
        </div>

        {/* 중단/하단: 세로 배치 능력치 바 (좌측) + 고유 특성 칩 (우측) */}
        <div className="grid grid-cols-12 gap-2.5 items-center">
          {/* 좌측: 세로로 나란히 배치된 2대 능력치 바 (7 cols) */}
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
                  <span className="font-bold text-neutral-900 dark:text-neutral-100 w-5 text-right">
                    {p.pitcherStats.stuff}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-neutral-600 dark:text-neutral-400 font-semibold w-7">제구</span>
                  <div className="flex-1 mx-2 h-1.5 rounded-full bg-neutral-200 dark:bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-neutral-900 dark:bg-white rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(10, p.pitcherStats.control))}%` }}
                    />
                  </div>
                  <span className="font-bold text-neutral-900 dark:text-neutral-100 w-5 text-right">
                    {p.pitcherStats.control}
                  </span>
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
                  <span className="font-bold text-neutral-900 dark:text-neutral-100 w-5 text-right">
                    {p.batterStats.contact}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-neutral-600 dark:text-neutral-400 font-semibold w-7">장타</span>
                  <div className="flex-1 mx-2 h-1.5 rounded-full bg-neutral-200 dark:bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-neutral-900 dark:bg-white rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(10, p.batterStats.power))}%` }}
                    />
                  </div>
                  <span className="font-bold text-neutral-900 dark:text-neutral-100 w-5 text-right">
                    {p.batterStats.power}
                  </span>
                </div>
              </>
            ) : null}
          </div>

          {/* 우측: 고유 특성 칩들 (5 cols) */}
          <div className="col-span-5 flex flex-wrap gap-1 content-center">
            {p.traits.map((t, idx) => (
              <span
                key={idx}
                className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-white/[0.06] text-neutral-700 dark:text-neutral-300 border border-neutral-200/80 dark:border-white/[0.06] font-medium leading-tight truncate max-w-full"
                title={t}
              >
                #{t}
              </span>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* 구단 핵심 지표 카드 */}
      <div className="apple-card rounded-3xl p-5">
        <div className="flex items-center justify-between pb-4 border-b border-black/[0.06] dark:border-white/[0.06]">
          <div className="flex items-center gap-3">
            <span
              className="w-4 h-4 rounded-full ring-2 ring-black/10 dark:ring-white/10"
              style={{ backgroundColor: team.primaryColor }}
            />
            <div>
              <h3 className="font-bold text-neutral-900 dark:text-white text-base tracking-tight">{team.name}</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-normal">{team.city} · {team.homePark}</p>
            </div>
          </div>
          <span className="text-[11px] px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-white/[0.06] text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-white/10 font-semibold">
            시즌 {season} 진행중
          </span>
        </div>

        {/* 5대 경영 지표 */}
        <div className="grid grid-cols-5 gap-2 pt-4 text-center">
          <div className="p-2.5 rounded-2xl bg-neutral-100/80 dark:bg-white/[0.03] border border-neutral-200/80 dark:border-white/[0.04]">
            <div className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium uppercase tracking-wider">예산</div>
            <div className="text-sm font-bold text-neutral-900 dark:text-white mt-0.5">{team.budget}억</div>
          </div>
          <div className="p-2.5 rounded-2xl bg-neutral-100/80 dark:bg-white/[0.03] border border-neutral-200/80 dark:border-white/[0.04]">
            <div className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium uppercase tracking-wider">팬심</div>
            <div className="text-sm font-bold text-neutral-900 dark:text-white mt-0.5">{team.fanSupport}</div>
          </div>
          <div className="p-2.5 rounded-2xl bg-neutral-100/80 dark:bg-white/[0.03] border border-neutral-200/80 dark:border-white/[0.04]">
            <div className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium uppercase tracking-wider">신뢰</div>
            <div className={`text-sm font-bold mt-0.5 ${team.ownerTrust <= 25 ? 'text-red-500' : 'text-neutral-900 dark:text-white'}`}>
              {team.ownerTrust}
            </div>
          </div>
          <div className="p-2.5 rounded-2xl bg-neutral-100/80 dark:bg-white/[0.03] border border-neutral-200/80 dark:border-white/[0.04]">
            <div className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium uppercase tracking-wider">케미</div>
            <div className="text-sm font-bold text-neutral-900 dark:text-white mt-0.5">{team.chemistry}</div>
          </div>
          <div className="p-2.5 rounded-2xl bg-neutral-100/80 dark:bg-white/[0.03] border border-neutral-200/80 dark:border-white/[0.04]">
            <div className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium uppercase tracking-wider">팜</div>
            <div className="text-sm font-bold text-neutral-900 dark:text-white mt-0.5">{team.farmSystem}</div>
          </div>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="apple-card rounded-3xl p-5 flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-4 border-b border-black/[0.06] dark:border-white/[0.06] pb-3">
          <div className="flex items-center gap-1 bg-neutral-100 dark:bg-white/[0.04] p-1 rounded-xl border border-neutral-200/80 dark:border-white/[0.06]">
            <button
              onClick={() => setActiveTab('roster')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'roster'
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-black shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
              }`}
            >
              선수단 ({teamPlayers.length})
            </button>
            <button
              onClick={() => setActiveTab('standings')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'standings'
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-black shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
              }`}
            >
              리그 순위표
            </button>
          </div>

          <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
            {activeTab === 'roster' ? '2026 공식 등록 엔트리' : '144경기 기준'}
          </span>
        </div>

        {/* 탭 컨텐츠 */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3 text-xs">
          {activeTab === 'roster' ? (
            <>
              {/* 투수진 */}
              <div>
                <div className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2.5 px-0.5 flex items-center justify-between">
                  <span>투수진 ({pitchers.length}명)</span>
                  <span className="text-[10px] font-normal text-neutral-500 dark:text-neutral-400">구위 · 제구 중심</span>
                </div>
                <div className="space-y-2.5">
                  {pitchers.map(p => renderPlayerCard(p))}
                </div>
              </div>

              {/* 야수진 */}
              <div className="pt-2">
                <div className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2.5 px-0.5 flex items-center justify-between">
                  <span>야수진 ({batters.length}명)</span>
                  <span className="text-[10px] font-normal text-neutral-500 dark:text-neutral-400">컨택 · 장타 중심</span>
                </div>
                <div className="space-y-2.5">
                  {batters.map(p => renderPlayerCard(p))}
                </div>
              </div>
            </>
          ) : (
            /* 리그 순위표 탭 */
            <div>
              {standings && standings.length > 0 ? (
                <div className="divide-y divide-black/[0.06] dark:divide-white/[0.04]">
                  {standings.map(st => {
                    const isUser = st.teamId === team.id
                    return (
                      <div
                        key={st.teamId}
                        className={`py-2.5 px-3 flex items-center justify-between rounded-xl transition ${
                          isUser
                            ? 'bg-neutral-900 text-white dark:bg-white/10 dark:text-white font-bold shadow-sm'
                            : 'text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-white/[0.03]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={`w-5 text-center font-mono text-[11px] ${isUser ? 'text-neutral-300' : 'text-neutral-500'}`}>
                            {st.rank}
                          </span>
                          <span className="font-semibold text-xs">{st.teamName}</span>
                          {st.rank <= 5 && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                              PS
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 font-mono text-[11px]">
                          <span className={isUser ? 'text-neutral-300' : 'text-neutral-500'}>{st.wins}승 {st.losses}패</span>
                          <span className="font-bold w-10 text-right">{st.winRate.toFixed(3)}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="py-12 text-center text-neutral-500 dark:text-neutral-400 space-y-2">
                  <div className="text-xs font-bold text-neutral-700 dark:text-neutral-300">정규시즌 개막 전</div>
                  <div className="text-[11px] font-normal">프리시즌 및 2회의 시즌 중 결정을 마친 후 144경기 페넌트레이스가 시뮬레이션됩니다.</div>
                </div>
              )}

              {/* 이전 시즌 성적 히스토리 */}
              {history.length > 0 && (
                <div className="mt-6 pt-4 border-t border-black/[0.06] dark:border-white/[0.06]">
                  <div className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
                    지난 시즌 기록
                  </div>
                  <div className="space-y-1">
                    {history.map(h => (
                      <div key={h.season} className="flex justify-between py-1 text-neutral-600 dark:text-neutral-400 text-xs">
                        <span>시즌 {h.season}</span>
                        <span className="text-neutral-900 dark:text-white font-bold">{h.rank}위 ({h.postseasonResult})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
