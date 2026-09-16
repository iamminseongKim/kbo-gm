import React, { useState } from 'react'
import { EnvironmentCard, EventOption, Team } from '../types'
import { PRESEASON_DECISIONS } from '../data/events'

interface PreseasonViewProps {
  season: number
  environment: EnvironmentCard
  team: Team
  onConfirmChoice: (option: EventOption) => void
}

export const PreseasonView: React.FC<PreseasonViewProps> = ({
  season,
  environment,
  team,
  onConfirmChoice
}) => {
  const decisionIndex = (season - 1) % PRESEASON_DECISIONS.length
  const currentDecision = PRESEASON_DECISIONS[decisionIndex]

  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 space-y-4 overflow-y-auto animate-fade-in">
      {/* 시즌 환경 브리핑 카드 */}
      <div className="apple-card rounded-3xl p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-white/[0.06] text-neutral-700 dark:text-neutral-300 font-semibold border border-neutral-200 dark:border-white/10">
            시즌 환경 변수
          </span>
          <h4 className="font-bold text-sm text-neutral-900 dark:text-white">{environment.name}</h4>
        </div>
        <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed pl-0.5">
          {environment.description}
        </p>
      </div>

      {/* 프리시즌 의사결정 카드 */}
      <div className="apple-card rounded-3xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.06] pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-black text-white dark:bg-white dark:text-black">
              스프링캠프
            </span>
            <span className="text-xs text-neutral-600 dark:text-neutral-400">시즌 기조 및 훈련 방침</span>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-white/[0.06] text-neutral-700 dark:text-neutral-300 font-semibold border border-neutral-200 dark:border-white/10">
            보유 예산: {team.budget}억원
          </span>
        </div>

        <div>
          <h3 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white">{currentDecision.title}</h3>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1.5 leading-relaxed font-normal">
            {currentDecision.description}
          </p>
        </div>

        {/* 선택지 목록 */}
        <div className="space-y-2.5 pt-1">
          {currentDecision.options.map((opt, idx) => {
            const isSelected = selectedIdx === idx
            const isAffordable = !opt.budgetDelta || opt.budgetDelta >= 0 || (team.budget + opt.budgetDelta >= 0)

            return (
              <button
                key={idx}
                disabled={!isAffordable}
                onClick={() => {
                  if (isAffordable) setSelectedIdx(idx)
                }}
                className={`w-full text-left p-4 rounded-2xl border transition-all flex flex-col gap-1.5 ${
                  !isAffordable
                    ? 'bg-neutral-50/50 dark:bg-white/[0.01] border-neutral-200/50 dark:border-white/[0.03] opacity-50 cursor-not-allowed'
                    : isSelected
                    ? 'bg-neutral-100/90 dark:bg-white/[0.08] border-neutral-900 dark:border-white ring-1 ring-neutral-900/20 dark:ring-white/40 shadow-md'
                    : 'bg-neutral-50/70 hover:bg-neutral-100/60 dark:bg-white/[0.02] border-neutral-200/80 dark:border-white/[0.06] hover:border-neutral-300 dark:hover:border-white/[0.12]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white">{opt.text}</div>
                  <span className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ml-2 ${
                    isSelected
                      ? 'border-neutral-900 bg-neutral-900 dark:border-white dark:bg-white'
                      : 'border-neutral-400 dark:border-white/30'
                  }`}>
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white dark:bg-black" />}
                  </span>
                </div>
                <div className="text-xs text-neutral-600 dark:text-neutral-400 font-normal">
                  {opt.effectDesc}
                </div>
                {!isAffordable && opt.budgetDelta && (
                  <div className="text-[11px] font-semibold text-red-500 mt-1">
                    ⚠️ 예산 부족 (필요: {Math.abs(opt.budgetDelta)}억 / 보유: {team.budget}억)
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* 확정 버튼 */}
        <div className="pt-2">
          <button
            disabled={selectedIdx === null}
            onClick={() => {
              if (selectedIdx !== null) {
                onConfirmChoice(currentDecision.options[selectedIdx])
              }
            }}
            className={`w-full py-3.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
              selectedIdx !== null
                ? 'apple-button-primary shadow-lg cursor-pointer active:scale-[0.98]'
                : 'bg-neutral-200/60 dark:bg-white/[0.05] text-neutral-400 dark:text-neutral-600 border border-neutral-300/40 dark:border-white/[0.04] cursor-not-allowed'
            }`}
          >
            기조 확정 및 정규시즌 전반기 개막
          </button>
        </div>
      </div>
    </div>
  )
}
