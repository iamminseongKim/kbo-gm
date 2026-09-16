import React, { useState } from 'react'
import { ForeignCandidate, Player, Team } from '../types'

interface Props {
  team: Team
  strugglingPlayer: Player
  candidates: ForeignCandidate[]
  onKeep: () => void
  onReplace: (candidate: ForeignCandidate, totalCost: number) => void
}

export const ForeignReplacementView: React.FC<Props> = ({ team, strugglingPlayer, candidates, onKeep, onReplace }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const replacementFee = 3
  const selected = candidates.find(candidate => candidate.id === selectedId)
  const costFor = (candidate: ForeignCandidate) => Math.ceil(candidate.salary * 0.55) + replacementFee

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 space-y-5 animate-fade-in">
      <div className="rounded-3xl p-6 bg-gradient-to-br from-amber-950 to-[#1c1710] border border-amber-400/20">
        <div className="text-[10px] font-black tracking-[0.18em] text-amber-300">WAIVER MARKET · MID-SEASON</div>
        <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">외국인 선수 중도 교체 검토</h2>
        <p className="text-sm text-amber-100/70 mt-2">스카우트팀이 대체 후보를 확보했습니다. 잔여 시즌 연봉 55%와 행정 비용 3억원이 즉시 지출됩니다.</p>
      </div>

      <div className="rounded-3xl border border-rose-500/25 bg-rose-500/[0.05] p-5">
        <div className="flex items-center justify-between">
          <div><div className="text-[10px] font-black text-rose-400 tracking-wider">REVIEW TARGET</div><h3 className="text-xl font-black text-neutral-900 dark:text-white mt-1">{strugglingPlayer.name}</h3><p className="text-xs text-neutral-500 mt-1">{strugglingPlayer.position} · {strugglingPlayer.age}세 · 연봉 {strugglingPlayer.salary}억</p></div>
          <div className="text-right"><div className="text-[10px] text-neutral-500">현재 OVR</div><div className="font-mono text-3xl font-black text-rose-400">{strugglingPlayer.overall}</div></div>
        </div>
        <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-4 p-3 rounded-xl bg-black/10 dark:bg-black/20">전반기 기대 이하의 성적과 적응 문제로 교체 여론이 커지고 있습니다. 단, 방출해도 이미 지급한 전반기 연봉은 돌려받을 수 없습니다.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {candidates.map(candidate => {
          const totalCost = costFor(candidate)
          const affordable = team.budget >= totalCost
          const active = selectedId === candidate.id
          return (
            <button key={candidate.id} disabled={!affordable} onClick={() => setSelectedId(active ? null : candidate.id)} className={`text-left rounded-3xl p-5 border transition ${!affordable ? 'opacity-45 cursor-not-allowed bg-white/[0.02] border-white/[0.05]' : active ? 'bg-amber-500/10 border-amber-400 ring-2 ring-amber-400/20' : 'apple-card hover:border-white/20'}`}>
              <div className="flex justify-between gap-3"><div><span className="text-[10px] font-black px-2 py-1 rounded-md bg-white/[0.07] text-neutral-400">{candidate.country} · {candidate.position}</span><h4 className="text-lg font-black text-neutral-900 dark:text-white mt-2">{candidate.name}</h4></div><div className="text-right"><div className="text-[10px] text-neutral-500">OVR</div><div className="font-mono text-2xl font-black text-amber-400">{candidate.overall}</div></div></div>
              <p className="text-xs text-neutral-500 mt-3 leading-relaxed">{candidate.scoutSummary}</p>
              <div className="mt-4 pt-3 border-t border-white/[0.07] flex justify-between text-xs"><span className="text-neutral-500">잔여연봉+행정비</span><b className={affordable ? 'text-amber-400' : 'text-rose-400'}>{totalCost}억원</b></div>
              {!affordable && <div className="text-[10px] text-rose-400 mt-2">예산 {totalCost - team.budget}억원 부족</div>}
            </button>
          )
        })}
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <button onClick={onKeep} className="apple-button-secondary">재신임하고 예산 보존</button>
        <button disabled={!selected} onClick={() => selected && onReplace(selected, costFor(selected))} className={selected ? 'apple-button-primary' : 'py-3 rounded-xl bg-white/5 text-neutral-600 cursor-not-allowed'}>교체 계약 승인</button>
      </div>
    </div>
  )
}
