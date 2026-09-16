import React from 'react'
import { Team } from '../types'

interface HeaderProps {
  season: number
  maxSeasons: number
  team: Team
  onOpenRoster: () => void
}

export const Header: React.FC<HeaderProps> = ({
  season,
  maxSeasons,
  team,
  onOpenRoster
}) => {
  return (
    <header className="apple-glass sticky top-0 z-30 px-4 py-3 border-b border-black/[0.06] dark:border-white/[0.08] mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <span
            className="w-3.5 h-3.5 rounded-full ring-2 ring-black/10 dark:ring-white/20"
            style={{ backgroundColor: team.primaryColor }}
          />
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-sm tracking-tight text-neutral-900 dark:text-white">{team.name}</span>
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono">
              {2025 + season}년 (시즌 {season}/{maxSeasons})
            </span>
            {team.stance && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                team.stance === 'WIN_NOW'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-400/20 dark:text-amber-300 border-amber-300/80'
                  : team.stance === 'REBUILDING'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-400/20 dark:text-emerald-300 border-emerald-300/80'
                  : 'bg-neutral-100 text-neutral-700 dark:bg-white/10 dark:text-neutral-300 border-neutral-300/80'
              }`}>
                {team.stance === 'WIN_NOW' ? '🏆 윈나우' : team.stance === 'REBUILDING' ? '🌱 리빌딩' : '⚖️ 밸런스'}
              </span>
            )}
          </div>
        </div>

        {/* 모바일에서만 로스터 모달 버튼 표시 (태블릿/데스크톱은 우측 패널에 항상 보임) */}
        <button
          onClick={onOpenRoster}
          className="lg:hidden text-xs font-semibold py-1.5 px-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.12] text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-white/10 transition"
        >
          선수단 명단
        </button>
      </div>

      {/* 모바일 전용 핵심 지표 바 (태블릿/데스크톱은 우측 패널이 담당) */}
      <div className="grid grid-cols-5 gap-1.5 text-center text-xs mt-2.5 lg:hidden">
        <div className="bg-neutral-100/80 dark:bg-white/[0.03] p-1.5 rounded-xl border border-neutral-200/80 dark:border-white/[0.04]">
          <div className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium">예산</div>
          <div className="font-bold text-neutral-900 dark:text-white mt-0.5">{team.budget}억</div>
        </div>
        <div className="bg-neutral-100/80 dark:bg-white/[0.03] p-1.5 rounded-xl border border-neutral-200/80 dark:border-white/[0.04]">
          <div className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium">팬심</div>
          <div className="font-bold text-neutral-900 dark:text-white mt-0.5">{team.fanSupport}</div>
        </div>
        <div className="bg-neutral-100/80 dark:bg-white/[0.03] p-1.5 rounded-xl border border-neutral-200/80 dark:border-white/[0.04]">
          <div className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium">신뢰</div>
          <div className={`font-bold mt-0.5 ${team.ownerTrust <= 25 ? 'text-red-500' : 'text-neutral-900 dark:text-white'}`}>
            {team.ownerTrust}
          </div>
        </div>
        <div className="bg-neutral-100/80 dark:bg-white/[0.03] p-1.5 rounded-xl border border-neutral-200/80 dark:border-white/[0.04]">
          <div className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium">케미</div>
          <div className="font-bold text-neutral-900 dark:text-white mt-0.5">{team.chemistry}</div>
        </div>
        <div className="bg-neutral-100/80 dark:bg-white/[0.03] p-1.5 rounded-xl border border-neutral-200/80 dark:border-white/[0.04]">
          <div className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium">팜</div>
          <div className="font-bold text-neutral-900 dark:text-white mt-0.5">{team.farmSystem}</div>
        </div>
      </div>
    </header>
  )
}
