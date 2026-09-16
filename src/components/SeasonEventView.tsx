import React, { useState } from 'react'
import { SeasonEvent, EventOption } from '../types'

interface SeasonEventViewProps {
  eventNumber: number // 2 or 3
  event: SeasonEvent
  onConfirmChoice: (option: EventOption) => void
}

export const SeasonEventView: React.FC<SeasonEventViewProps> = ({
  eventNumber,
  event,
  onConfirmChoice
}) => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 space-y-4 overflow-y-auto animate-fade-in">
      <div className="apple-card rounded-3xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.06] pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-black text-white dark:bg-white dark:text-black">
              결정 {eventNumber} / 3
            </span>
            <span className="text-xs text-neutral-600 dark:text-neutral-400">시즌 중 돌발 사건</span>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-white/[0.06] text-neutral-700 dark:text-neutral-300 font-semibold border border-neutral-200 dark:border-white/10">
            {event.category}
          </span>
        </div>

        <div>
          <h3 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white">{event.title}</h3>
          <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 mt-2 leading-relaxed bg-neutral-50 dark:bg-white/[0.02] p-3.5 rounded-2xl border border-neutral-200/70 dark:border-white/[0.04]">
            {event.description}
          </p>
        </div>

        {/* 선택지 */}
        <div className="space-y-2.5 pt-1">
          {event.options.map((opt, idx) => {
            const isSelected = selectedIdx === idx
            return (
              <button
                key={idx}
                onClick={() => setSelectedIdx(idx)}
                className={`w-full text-left p-4 rounded-2xl border transition-all flex flex-col gap-1.5 ${
                  isSelected
                    ? 'bg-neutral-100/90 dark:bg-white/[0.08] border-neutral-900/30 dark:border-white/40 ring-1 ring-neutral-900/20 dark:ring-white/40 shadow-md'
                    : 'bg-neutral-50/70 hover:bg-neutral-100/60 dark:bg-white/[0.02] border-neutral-200/80 dark:border-white/[0.06] hover:border-neutral-300 dark:hover:border-white/[0.12]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white">{opt.text}</div>
                  <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
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
                onConfirmChoice(event.options[selectedIdx])
              }
            }}
            className={`w-full py-3.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
              selectedIdx !== null
                ? 'apple-button-primary shadow-lg cursor-pointer active:scale-[0.98]'
                : 'bg-neutral-200/60 dark:bg-white/[0.05] text-neutral-400 dark:text-neutral-600 border border-neutral-300/40 dark:border-white/[0.04] cursor-not-allowed'
            }`}
          >
            단장의 최종 결단 집행
          </button>
        </div>
      </div>
    </div>
  )
}
