import React, { useState } from 'react'
import { Team, RookieProspect } from '../types'

interface DraftViewProps {
  team: Team
  prospects: RookieProspect[]
  onDraftRookie: (prospect: RookieProspect) => void
}

export const DraftView: React.FC<DraftViewProps> = ({
  team,
  prospects,
  onDraftRookie
}) => {
  const [selectedProspect, setSelectedProspect] = useState<RookieProspect | null>(null)

  const handleConfirm = () => {
    if (!selectedProspect) return
    onDraftRookie(selectedProspect)
  }

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 space-y-5 overflow-y-auto animate-fade-in">
      <div className="text-center py-4 apple-card rounded-3xl p-5">
        <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 tracking-wider uppercase">
          KBO Rookie Draft 1st Round
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white mt-1">
          2026 KBO 신인 1차 지명 드래프트
        </h2>
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1 max-w-md mx-auto font-normal">
          구단의 미래 10년을 책임질 아마추어 최고 유망주를 지명하십시오. (계약금 예산 차감)
        </p>
      </div>

      <div className="apple-card rounded-3xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.06] pb-3">
          <span className="text-xs font-bold text-neutral-900 dark:text-white">
            1라운드 지명 후보 3인
          </span>
          <span className="text-xs px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-white/[0.06] text-neutral-700 dark:text-neutral-300 font-semibold border border-neutral-200 dark:border-white/10">
            가용 예산: {team.budget}억원
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {prospects.map(p => {
            const isAffordable = team.budget >= p.signingBonus
            const isSelected = selectedProspect?.id === p.id

            return (
              <div
                key={p.id}
                onClick={() => {
                  if (isAffordable) {
                    setSelectedProspect(isSelected ? null : p)
                  }
                }}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                  isSelected
                    ? 'bg-neutral-100/90 dark:bg-white/[0.08] border-neutral-900 dark:border-white ring-2 ring-neutral-900/20 dark:ring-white/40 shadow-md cursor-pointer'
                    : isAffordable
                    ? 'bg-white hover:bg-neutral-50 dark:bg-[#18181b] dark:hover:bg-[#202024] border-neutral-200/90 dark:border-white/[0.08] shadow-sm cursor-pointer'
                    : 'bg-neutral-50/50 dark:bg-white/[0.01] border-neutral-200/50 dark:border-white/[0.03] opacity-60 cursor-not-allowed'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-white/10 text-neutral-800 dark:text-neutral-200 font-bold border border-neutral-200 dark:border-white/10">
                      {p.position}
                    </span>
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 font-mono">
                      포텐셜 {p.potential}
                    </span>
                  </div>

                  <h4 className="font-bold text-base text-neutral-900 dark:text-white">{p.name}</h4>
                  <div className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono mt-0.5">
                    {p.school} · {p.age}세 · 계약금 {p.signingBonus}억
                  </div>

                  <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-2 leading-relaxed">
                    {p.scoutSummary}
                  </p>
                </div>

                <div>
                  {/* 스탯 바 요약 */}
                  <div className="bg-neutral-100/80 dark:bg-white/[0.03] p-2 rounded-xl text-[11px] font-mono mb-2">
                    {p.isPitcher && p.pitcherStats ? (
                      <div className="flex justify-between text-neutral-700 dark:text-neutral-300">
                        <span>구위 <b>{p.pitcherStats.stuff}</b></span>
                        <span>제구 <b>{p.pitcherStats.control}</b></span>
                      </div>
                    ) : p.batterStats ? (
                      <div className="flex justify-between text-neutral-700 dark:text-neutral-300">
                        <span>컨택 <b>{p.batterStats.contact}</b></span>
                        <span>장타 <b>{p.batterStats.power}</b></span>
                      </div>
                    ) : null}
                  </div>

                  {/* 특성 태그 */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {p.traits.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-100 dark:bg-white/[0.06] text-neutral-600 dark:text-neutral-400 font-medium"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>

                  {!isAffordable ? (
                    <div className="text-center text-xs font-semibold text-red-500 py-1.5">
                      ⚠️ 계약금 예산 부족 ({p.signingBonus - team.budget}억 필요)
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
                      {isSelected ? '선택됨' : '지명 후보 선택'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div className="pt-2">
          <button
            disabled={!selectedProspect}
            onClick={handleConfirm}
            className={`w-full py-4 rounded-full text-sm font-semibold tracking-wide transition-all ${
              selectedProspect
                ? 'apple-button-primary shadow-lg cursor-pointer active:scale-[0.98]'
                : 'bg-neutral-200/60 dark:bg-white/[0.05] text-neutral-400 dark:text-neutral-600 border border-neutral-300/40 dark:border-white/[0.04] cursor-not-allowed'
            }`}
          >
            {selectedProspect
              ? `[${selectedProspect.name}] 1차 지명 확정 (계약금 ${selectedProspect.signingBonus}억 지출)`
              : '신인 선수를 선택하십시오'}
          </button>
        </div>
      </div>
    </div>
  )
}
