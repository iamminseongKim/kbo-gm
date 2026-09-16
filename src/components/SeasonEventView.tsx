import React, { useState } from 'react'
import { SeasonEvent, EventOption, Team } from '../types'

interface SeasonEventViewProps {
  phaseTitle: string
  event: SeasonEvent
  team: Team
  onConfirmChoice: (option: EventOption) => void
}

export const SeasonEventView: React.FC<SeasonEventViewProps> = ({
  phaseTitle,
  event,
  team,
  onConfirmChoice
}) => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
  const [isResolved, setIsResolved] = useState(false)
  const selectedOption = selectedIdx !== null ? event.options[selectedIdx] : null

  const getConsequence = (option: EventOption) => {
    if ((option.overallDelta || 0) >= 2) return '결단은 즉시 현장에 전달됐습니다. 코칭스태프는 전력 상승을 자신하지만, 이제 결과로 증명해야 합니다.'
    if ((option.chemistryDelta || 0) >= 8) return '선수단 단체 대화방에 지지 메시지가 이어졌습니다. 더그아웃의 공기가 눈에 띄게 달라졌습니다.'
    if ((option.fanSupportDelta || 0) >= 8) return '발표 직후 팬 커뮤니티의 반응이 폭발했습니다. 다음 홈경기 예매율이 빠르게 오르고 있습니다.'
    if ((option.budgetDelta || 0) < -10) return '재무팀이 지출안을 승인했습니다. 이제 이 투자는 순위표 위의 숫자로 평가받게 됩니다.'
    if ((option.ownerTrustDelta || 0) < 0) return '이사회는 이번 결정을 공식 기록에 남겼습니다. 다음 성적 보고의 무게가 더 커졌습니다.'
    return '결정은 전 구단에 공지됐습니다. 선수단과 팬들은 단장의 다음 행보를 지켜보고 있습니다.'
  }

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 space-y-4 overflow-y-auto animate-fade-in">
      <div className="apple-card rounded-3xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.06] pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-black text-white dark:bg-white dark:text-black">
              {phaseTitle}
            </span>
            <span className="text-xs text-neutral-600 dark:text-neutral-400">시즌 돌발 변수</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-white/[0.06] text-neutral-700 dark:text-neutral-300 font-semibold border border-neutral-200 dark:border-white/10">
              {event.category}
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-white/[0.06] text-neutral-700 dark:text-neutral-300 font-semibold border border-neutral-200 dark:border-white/10">
              보유 예산: {team.budget}억
            </span>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white">{event.title}</h3>
          <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 mt-2 leading-relaxed bg-neutral-50 dark:bg-white/[0.02] p-3.5 rounded-2xl border border-neutral-200/70 dark:border-white/[0.04]">
            {event.description}
          </p>
        </div>

        {/* 선택지 */}
        {!isResolved && <div className="space-y-2.5 pt-1">
          {event.options.map((opt, idx) => {
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
        </div>}

        {isResolved && selectedOption && (
          <div className="rounded-3xl overflow-hidden border border-red-500/25 bg-red-500/[0.05] animate-fade-in">
            <div className="px-5 py-3 bg-red-600 text-white flex items-center justify-between">
              <span className="text-[10px] font-black tracking-[0.18em]">BREAKING · FRONT OFFICE</span>
              <span className="text-[10px] opacity-80">방금 전</span>
            </div>
            <div className="p-5 space-y-3">
              <div className="text-[11px] font-bold text-red-600 dark:text-red-400">단장실 공식 발표</div>
              <h4 className="text-lg font-black tracking-tight text-neutral-900 dark:text-white">“{selectedOption.text.replace(/^[^\s]+\s/, '')}”</h4>
              <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">{getConsequence(selectedOption)}</p>
              <div className="text-xs font-bold text-neutral-600 dark:text-neutral-400 bg-white/60 dark:bg-black/20 rounded-xl p-3 border border-black/5 dark:border-white/5">
                예상 후폭풍 · {selectedOption.effectDesc}
              </div>
            </div>
          </div>
        )}

        {/* 확정 버튼 */}
        <div className="pt-2">
          <button
            disabled={selectedIdx === null}
            onClick={() => {
              if (selectedIdx === null) return
              if (!isResolved) setIsResolved(true)
              else onConfirmChoice(event.options[selectedIdx])
            }}
            className={`w-full py-3.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
              selectedIdx !== null
                ? 'apple-button-primary shadow-lg cursor-pointer active:scale-[0.98]'
                : 'bg-neutral-200/60 dark:bg-white/[0.05] text-neutral-400 dark:text-neutral-600 border border-neutral-300/40 dark:border-white/[0.04] cursor-not-allowed'
            }`}
          >
            {isResolved ? '후폭풍을 안고 시즌 계속하기 →' : '단장의 최종 결단 집행'}
          </button>
        </div>
      </div>
    </div>
  )
}
