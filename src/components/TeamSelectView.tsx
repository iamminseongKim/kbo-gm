import React, { useState, useEffect } from 'react'
import { KBO_TEAMS } from '../data/teams'

interface TeamSelectViewProps {
  onSelectTeam: (teamId: string, seed: string) => void
  onPreviewTeam?: (teamId: string) => void
}

export const TeamSelectView: React.FC<TeamSelectViewProps> = ({
  onSelectTeam,
  onPreviewTeam
}) => {
  const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const seed = todayStr
  const [selectedId, setSelectedId] = useState<string>('kia')

  const teams = Object.values(KBO_TEAMS)
  const currentTeam = KBO_TEAMS[selectedId]

  useEffect(() => {
    if (onPreviewTeam) {
      onPreviewTeam(selectedId)
    }
  }, [selectedId, onPreviewTeam])

  const handleSelect = (id: string) => {
    setSelectedId(id)
    if (onPreviewTeam) {
      onPreviewTeam(id)
    }
  }

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 space-y-6 overflow-y-auto animate-fade-in">
      {/* Apple-style Hero Title */}
      <div className="text-center pt-2 pb-1">
        <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 tracking-wider uppercase">
          2026 KBO General Manager
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white mt-1">
          부임할 구단을 선택하십시오.
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1 max-w-sm mx-auto font-normal">
          7시즌의 여정. 144경기의 치열한 페넌트레이스. 가을의 전설에 도전하세요.
        </p>
      </div>

      {/* 10개 구단 탭 선택 바 */}
      <div>
        <div className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-2.5 px-1 flex justify-between items-center">
          <span>KBO 10개 구단</span>
          <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-normal">선택하여 전력 미리보기</span>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {teams.map(t => {
            const isSelected = t.id === selectedId
            return (
              <button
                key={t.id}
                onClick={() => handleSelect(t.id)}
                className={`py-3 px-2 rounded-2xl text-center flex flex-col items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-md ring-2 ring-black/20 dark:ring-white/60 scale-[1.03]'
                    : 'bg-white hover:bg-neutral-100 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-neutral-800 dark:text-neutral-200 border border-neutral-200/90 dark:border-white/[0.08] shadow-sm'
                }`}
              >
                <span
                  className={`w-3.5 h-3.5 rounded-full mb-1.5 transition-transform ${
                    isSelected ? 'ring-2 ring-white/50 dark:ring-black/40' : 'ring-1 ring-black/10 dark:ring-white/10'
                  }`}
                  style={{ backgroundColor: t.primaryColor }}
                />
                <span className={`text-xs font-semibold tracking-tight ${isSelected ? 'text-white dark:text-black' : 'text-neutral-800 dark:text-neutral-200'}`}>
                  {t.shortName}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 선택된 구단 상세 브리핑 카드 */}
      {currentTeam && (
        <div className="apple-card rounded-3xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.06] pb-4">
            <div className="flex items-center gap-3">
              <span
                className="w-5 h-5 rounded-full ring-2 ring-black/10 dark:ring-white/20 shadow-sm"
                style={{ backgroundColor: currentTeam.primaryColor }}
              />
              <div>
                <h3 className="font-bold text-neutral-900 dark:text-white text-lg tracking-tight">{currentTeam.name}</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 font-normal">{currentTeam.city} · {currentTeam.homePark}</p>
              </div>
            </div>
            <span className="text-xs px-3 py-1 rounded-full font-semibold bg-neutral-100 dark:bg-white/[0.06] text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-white/10">
              난이도 {currentTeam.difficulty}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed font-normal">
            {currentTeam.description}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center">
            <div className="bg-neutral-50 dark:bg-white/[0.03] p-3 rounded-2xl border border-neutral-200/80 dark:border-white/[0.04]">
              <div className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium uppercase tracking-wider">초기 예산</div>
              <div className="text-sm font-bold text-neutral-900 dark:text-white mt-1">{currentTeam.budget}억원</div>
            </div>
            <div className="bg-neutral-50 dark:bg-white/[0.03] p-3 rounded-2xl border border-neutral-200/80 dark:border-white/[0.04]">
              <div className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium uppercase tracking-wider">팬덤 열기</div>
              <div className="text-sm font-bold text-neutral-900 dark:text-white mt-1">{currentTeam.fanSupport}</div>
            </div>
            <div className="bg-neutral-50 dark:bg-white/[0.03] p-3 rounded-2xl border border-neutral-200/80 dark:border-white/[0.04]">
              <div className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium uppercase tracking-wider">구단주 신뢰</div>
              <div className="text-sm font-bold text-neutral-900 dark:text-white mt-1">{currentTeam.ownerTrust}</div>
            </div>
            <div className="bg-neutral-50 dark:bg-white/[0.03] p-3 rounded-2xl border border-neutral-200/80 dark:border-white/[0.04]">
              <div className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium uppercase tracking-wider">유망주 팜</div>
              <div className="text-sm font-bold text-neutral-900 dark:text-white mt-1">{currentTeam.farmSystem}</div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => onSelectTeam(currentTeam.id, seed)}
              className="apple-button-primary w-full py-3.5 text-sm font-semibold shadow-lg transition-transform active:scale-[0.98]"
            >
              {currentTeam.shortName} 단장으로 공식 취임
            </button>
          </div>
        </div>
      )}

      {/* 안내문 */}
      <div className="text-[11px] text-neutral-500 dark:text-neutral-400 text-center leading-normal pt-1 font-normal">
        본 시뮬레이터는 KBO 및 각 구단의 공식 게임이 아닌 비공식 팬 창작 전략 시뮬레이션입니다.<br />
        2026 시즌 공식 등록 엔트리 및 통계 모델을 기반으로 시뮬레이션합니다.
      </div>
    </div>
  )
}
