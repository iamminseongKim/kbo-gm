import React, { useState } from 'react'
import { Team, EventOption } from '../types'

interface CallupViewProps {
  team: Team
  onConfirmCallup: (option: EventOption) => void
}

const CALLUP_OPTIONS: EventOption[] = [
  {
    text: '📉 극심한 슬럼프 베테랑 2군행 & 퓨처스 4할 타자 전격 콜업',
    effectDesc: '타선 활력 및 팀 전력 상승 (+2), 케미스트리 +6, 베테랑 반발(구단주 신뢰 -3)',
    overallDelta: 2,
    chemistryDelta: 6,
    ownerTrustDelta: -3
  },
  {
    text: '⚡ 연투로 지친 불펜 필승조 휴식 & 2군 153km 파이어볼러 등록',
    effectDesc: '마운드 구위 보강 (+3), 팜 유망주 기회 부여 (팜 +8), 케미스트리 -2',
    overallDelta: 3,
    farmDelta: 8,
    chemistryDelta: -2
  },
  {
    text: '🤝 엔트리 변동 없음 — 기존 1군 주전들에게 굳건한 신뢰 부여',
    effectDesc: '선수단 안도감 (케미스트리 +8), 구단주 신뢰 +4, 팀 전력 변동 없음',
    chemistryDelta: 8,
    ownerTrustDelta: 4
  }
]

export const CallupView: React.FC<CallupViewProps> = ({
  team,
  onConfirmCallup
}) => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 space-y-5 overflow-y-auto animate-fade-in">
      <div className="apple-card rounded-3xl p-5 text-center">
        <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 tracking-wider uppercase">
          Mid-Season Roster Movement
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white mt-1">
          1군 엔트리 강등 및 2군 콜업 결단
        </h2>
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1 max-w-md mx-auto font-normal">
          전반기 막바지, 지친 선수단의 피로도와 슬럼프를 타개할 엔트리 교체 방침을 결정하십시오.
        </p>
      </div>

      <div className="apple-card rounded-3xl p-5 sm:p-6 space-y-4">
        <div className="border-b border-black/[0.06] dark:border-white/[0.06] pb-3 flex items-center justify-between">
          <span className="text-xs font-bold text-neutral-900 dark:text-white">
            엔트리 운용 방침 선택
          </span>
          <span className="text-xs text-neutral-500 font-mono">
            {team.name} 1군 28인 엔트리
          </span>
        </div>

        <div className="space-y-3">
          {CALLUP_OPTIONS.map((opt, idx) => {
            const isSelected = selectedIdx === idx
            return (
              <button
                key={idx}
                onClick={() => setSelectedIdx(idx)}
                className={`w-full text-left p-4 rounded-2xl border transition-all flex flex-col gap-1.5 ${
                  isSelected
                    ? 'bg-neutral-100/90 dark:bg-white/[0.08] border-neutral-900 dark:border-white ring-1 ring-neutral-900/20 dark:ring-white/40 shadow-md'
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

        <div className="pt-2">
          <button
            disabled={selectedIdx === null}
            onClick={() => {
              if (selectedIdx !== null) {
                onConfirmCallup(CALLUP_OPTIONS[selectedIdx])
              }
            }}
            className={`w-full py-4 rounded-full text-sm font-semibold tracking-wide transition-all ${
              selectedIdx !== null
                ? 'apple-button-primary shadow-lg cursor-pointer active:scale-[0.98]'
                : 'bg-neutral-200/60 dark:bg-white/[0.05] text-neutral-400 dark:text-neutral-600 border border-neutral-300/40 dark:border-white/[0.04] cursor-not-allowed'
            }`}
          >
            엔트리 변동 확정 및 드래프트장 이동
          </button>
        </div>
      </div>
    </div>
  )
}
