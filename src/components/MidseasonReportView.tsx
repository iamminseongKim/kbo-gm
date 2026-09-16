import React from 'react'
import { Player, StandingsRecord, Team } from '../types'

interface Props {
  standings: StandingsRecord[]
  userTeam: Team
  injuredPlayer: Player | null
  onDecision: (decision: 'REST' | 'PLAY_THROUGH') => void
}

export const MidseasonReportView: React.FC<Props> = ({ standings, userTeam, injuredPlayer, onDecision }) => {
  const userStanding = standings.find(row => row.teamId === userTeam.id)
  const targetText = userStanding && userStanding.rank <= 2
    ? '선두 경쟁 중 — 지금부터 모든 결정이 한국시리즈 직행을 좌우합니다.'
    : userStanding && userStanding.rank <= 5
    ? '5강 경계선 — 한 번의 연패가 가을야구 탈락으로 이어질 수 있습니다.'
    : '추격이 필요한 상황 — 트레이드 시장에서 확실한 승부수가 필요합니다.'

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 space-y-5 animate-fade-in">
      <div className="rounded-3xl p-6 bg-gradient-to-br from-emerald-950 to-[#101817] border border-emerald-400/20">
        <div className="text-[10px] font-black tracking-[0.18em] text-emerald-300">ALL-STAR BREAK · 72 GAMES</div>
        <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">전반기 결산 보고</h2>
        <p className="text-sm text-emerald-100/70 mt-2">{targetText}</p>
      </div>

      <div className="apple-card rounded-3xl overflow-hidden">
        <div className="px-5 py-3 border-b border-white/[0.07] text-xs font-black text-neutral-400">전반기 순위표</div>
        {standings.map(row => (
          <div key={row.teamId} className={`grid grid-cols-[32px_1fr_82px_48px] items-center px-5 py-2.5 text-xs border-b border-white/[0.04] ${row.teamId === userTeam.id ? 'bg-emerald-500/10 text-emerald-300 font-bold' : 'text-neutral-400'}`}>
            <b className="font-mono">{row.rank}</b><span>{row.teamName}</span><span className="font-mono text-center">{row.wins}-{row.losses}-{row.draws}</span><span className="font-mono text-right">{row.winRate.toFixed(3)}</span>
          </div>
        ))}
      </div>

      {injuredPlayer && (
        <div className="rounded-3xl border border-rose-500/25 bg-rose-500/[0.06] p-5 sm:p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div><div className="text-[10px] font-black tracking-[0.15em] text-rose-400">MEDICAL REPORT</div><h3 className="text-xl font-black text-neutral-900 dark:text-white mt-1">{injuredPlayer.name}, 햄스트링 미세 손상</h3></div>
            <span className="font-mono font-black text-rose-400">4–6주</span>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-300">의료진은 완전한 휴식을 권고했지만, 선수는 5강 경쟁을 위해 지명타자로라도 뛰겠다는 뜻을 밝혔습니다.</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <button onClick={() => onDecision('REST')} className="text-left p-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition"><b className="text-sm text-neutral-900 dark:text-white">🛌 부상자 명단 등재</b><p className="text-xs text-neutral-500 mt-1">후반기 전력 하락 · 케미 +6 · 완전 회복 우선</p></button>
            <button onClick={() => onDecision('PLAY_THROUGH')} className="text-left p-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/20 transition"><b className="text-sm text-neutral-900 dark:text-white">💉 주사 치료 후 강행</b><p className="text-xs text-neutral-500 mt-1">즉시 복귀 · 케미 -5 · 재발 위험 감수</p></button>
          </div>
        </div>
      )}
    </div>
  )
}
