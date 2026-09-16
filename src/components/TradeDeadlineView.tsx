import React, { useState } from 'react'
import { Player, Team, TradeOffer } from '../types'

interface Props {
  userTeam: Team
  teams: Record<string, Team>
  players: Player[]
  offers: TradeOffer[]
  onAccept: (offer: TradeOffer) => void
  onPass: () => void
}

const PlayerSide: React.FC<{ player: Player; label: string; accent?: boolean }> = ({ player, label, accent }) => (
  <div className={`rounded-2xl p-4 border ${accent ? 'bg-blue-500/[0.09] border-blue-400/30' : 'bg-black/20 border-white/[0.07]'}`}>
    <div className="text-[10px] font-black tracking-[0.14em] text-neutral-500 uppercase">{label}</div>
    <div className="flex items-end justify-between mt-2 gap-2">
      <div>
        <div className="text-lg font-black text-white">{player.name}</div>
        <div className="text-xs text-neutral-400 mt-0.5">{player.position} · {player.age}세 · {player.salary}억</div>
      </div>
      <div className="text-right">
        <div className="text-[10px] text-neutral-500">OVR</div>
        <div className="font-mono text-xl font-black text-white">{player.overall}</div>
      </div>
    </div>
    <div className="flex flex-wrap gap-1 mt-3">
      {player.traits.slice(0, 2).map(trait => <span key={trait} className="text-[10px] px-2 py-1 rounded-md bg-white/[0.06] text-neutral-300">#{trait}</span>)}
    </div>
  </div>
)

export const TradeDeadlineView: React.FC<Props> = ({ userTeam, teams, players, offers, onAccept, onPass }) => {
  const [selected, setSelected] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const offer = offers.find(item => item.id === selected)
  const findPlayer = (id: string) => players.find(player => player.id === id)

  if (confirmed && offer) {
    const incoming = findPlayer(offer.incomingPlayerId)!
    const outgoing = findPlayer(offer.outgoingPlayerId)!
    return (
      <div className="flex-1 p-4 sm:p-6 animate-fade-in">
        <div className="apple-card rounded-3xl overflow-hidden">
          <div className="bg-blue-600 px-6 py-4 text-white text-xs font-black tracking-[0.16em]">TRADE COMPLETE · KBO OFFICIAL</div>
          <div className="p-6 sm:p-8 text-center space-y-4">
            <div className="text-5xl">🤝</div>
            <h2 className="text-2xl font-black text-neutral-900 dark:text-white">트레이드 합의 완료</h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">{userTeam.shortName}는 {teams[offer.partnerTeamId].shortName}에서 <b>{incoming.name}</b>을 영입하고, <b>{outgoing.name}</b>을 보냅니다.</p>
            <button className="apple-button-primary w-full" onClick={() => onAccept(offer)}>후반기 엔트리에 반영하기 →</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 space-y-5 animate-fade-in">
      <div className="rounded-3xl p-6 bg-gradient-to-br from-blue-950 to-[#111827] border border-blue-400/20">
        <div className="text-[10px] font-black tracking-[0.18em] text-blue-300">D-DAY · 23:43:12</div>
        <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">트레이드 마감일</h2>
        <p className="text-sm text-blue-100/70 mt-2">리그 사무국 마감 전 도착한 마지막 3개의 제안입니다. 한 건만 승인할 수 있으며, 거절한 제안은 돌아오지 않습니다.</p>
      </div>

      <div className="space-y-4">
        {offers.map(item => {
          const outgoing = findPlayer(item.outgoingPlayerId)
          const incoming = findPlayer(item.incomingPlayerId)
          if (!outgoing || !incoming) return null
          const partner = teams[item.partnerTeamId]
          const isSelected = selected === item.id
          return (
            <button key={item.id} onClick={() => setSelected(isSelected ? null : item.id)} className={`w-full text-left rounded-3xl p-4 border transition ${isSelected ? 'bg-white/[0.08] border-blue-400 ring-2 ring-blue-400/20' : 'apple-card hover:border-white/20'}`}>
              <div className="flex items-center justify-between px-1 mb-3">
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{ backgroundColor: partner.primaryColor }} /><b className="text-sm text-neutral-900 dark:text-white">{partner.name} 제안</b></div>
                <span className="text-[10px] font-black px-2 py-1 rounded-full bg-blue-500/10 text-blue-400">{item.urgency === 'BUYER' ? '즉시전력 보강' : item.urgency === 'SELLER' ? '미래 가치' : '균형 거래'}</span>
              </div>
              <div className="grid sm:grid-cols-[1fr_auto_1fr] gap-2 items-center">
                <PlayerSide player={outgoing} label={`${userTeam.shortName}가 보냄`} />
                <div className="text-center text-neutral-500 font-black">⇄</div>
                <PlayerSide player={incoming} label={`${userTeam.shortName}가 영입`} accent />
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 px-1 mt-3">{item.rationale}</p>
            </button>
          )
        })}
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <button onClick={onPass} className="apple-button-secondary">모든 제안 거절</button>
        <button disabled={!offer} onClick={() => offer && setConfirmed(true)} className={offer ? 'apple-button-primary' : 'py-3 rounded-xl bg-white/5 text-neutral-600 cursor-not-allowed'}>선택한 트레이드 승인</button>
      </div>
    </div>
  )
}
