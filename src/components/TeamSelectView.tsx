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

  const getTeamProfile = (team: typeof currentTeam) => {
    const strengths = [
      { label: '전력 안정성', value: Math.round((team.chemistry + team.ownerTrust) / 2) },
      { label: '성장 여력', value: team.farmSystem },
      { label: '프런트 압박', value: team.fanSupport }
    ]
    const mission = team.difficulty === '쉬움'
      ? '즉시 우승에 도전해 왕조의 문을 여세요.'
      : team.difficulty === '보통'
      ? '가을야구와 세대교체를 동시에 잡으세요.'
      : '제한된 자원으로 판도를 뒤집는 리빌딩이 필요합니다.'
    return { strengths, mission }
  }

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
    <div className="flex-1 flex flex-col p-3 sm:p-6 space-y-6 overflow-y-auto animate-fade-in">
      {/* Apple-style Hero Title */}
      <div className="team-hero text-left pt-5 sm:pt-8 pb-5 px-5 sm:px-7 rounded-[28px]">
        <span className="eyebrow-label">
          NEW CAREER · 7 SEASONS
        </span>
        <h1 className="text-3xl sm:text-5xl font-black tracking-[-0.055em] text-neutral-900 dark:text-white mt-3 leading-[1.04]">
          당신의 야구는<br /><span className="text-red-600 dark:text-red-500">어떤 팀</span>에서 시작됩니까?
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-4 max-w-lg font-medium leading-relaxed">
          매년 단 한 번의 선택이 144경기의 운명을 바꿉니다. 전력을 읽고, 리스크를 감수하고, 7년 안에 우승 반지를 차지하세요.
        </p>
        <div className="flex gap-4 mt-5 text-[11px] font-bold text-neutral-500 dark:text-neutral-400">
          <span>● 10개 구단</span><span>● 고정 시드</span><span>● 영구적 선택</span>
        </div>
      </div>

      {/* 10개 구단 탭 선택 바 */}
      <div>
        <div className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-2.5 px-1 flex justify-between items-center">
          <span>KBO 10개 구단</span>
          <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-normal">선택하여 전력 미리보기</span>
        </div>
        <div className="grid grid-cols-5 gap-2 sm:gap-2.5">
          {teams.map(t => {
            const isSelected = t.id === selectedId
            return (
              <button
                key={t.id}
                onClick={() => handleSelect(t.id)}
                className={`team-tile py-3 px-1 sm:px-2 rounded-2xl text-center flex flex-col items-center justify-center transition-all ${
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
        <div className="apple-card team-brief rounded-[28px] p-5 sm:p-6 space-y-5" style={{ '--team-color': currentTeam.primaryColor } as React.CSSProperties}>
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

          <div className="rounded-2xl bg-neutral-100/80 dark:bg-black/25 border border-black/[0.06] dark:border-white/[0.06] p-4">
            <div className="text-[10px] font-black tracking-[0.16em] text-red-600 dark:text-red-400 uppercase">Board Mission</div>
            <p className="text-sm font-bold text-neutral-900 dark:text-white mt-1">{getTeamProfile(currentTeam).mission}</p>
          </div>

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

          <div className="space-y-3">
            {getTeamProfile(currentTeam).strengths.map(item => (
              <div key={item.label} className="grid grid-cols-[76px_1fr_28px] items-center gap-3 text-[11px]">
                <span className="font-semibold text-neutral-500 dark:text-neutral-400">{item.label}</span>
                <div className="h-1.5 rounded-full bg-neutral-200 dark:bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${item.value}%`, backgroundColor: currentTeam.primaryColor }} />
                </div>
                <span className="font-mono font-bold text-right text-neutral-800 dark:text-neutral-200">{item.value}</span>
              </div>
            ))}
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
