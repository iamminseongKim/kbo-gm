import React, { useState } from 'react'
import { Team, RookieProspect } from '../types'

interface DraftViewProps {
  team: Team
  prospects: RookieProspect[]
  onDraftRookie: (prospect: RookieProspect) => void
  onBackToStoveLeague?: () => void
  onBorrowEmergencyBudget?: () => void
}

export const DraftView: React.FC<DraftViewProps> = ({
  team,
  prospects,
  onDraftRookie,
  onBackToStoveLeague,
  onBorrowEmergencyBudget
}) => {
  const [selectedProspect, setSelectedProspect] = useState<RookieProspect | null>(null)

  // 0원 계약금 육성선수(신고선수) 옵션이 없으면 기본 생성
  const allProspects: RookieProspect[] = [...prospects]
  if (!allProspects.some(p => p.signingBonus === 0)) {
    allProspects.push({
      id: `rookie_${team.id}_dev_fallback`,
      name: '미지명 2군 육성선수',
      position: 'C',
      age: 23,
      school: '대학/독립리그 (육성선수)',
      signingBonus: 0,
      scoutSummary: '계약금 0원으로 입단하는 2군 육성선수(신고선수). 성실한 훈련과 투지로 퓨처스리그에서 주전 도약을 꿈꾸는 숨은 원석.',
      isPitcher: false,
      batterStats: {
        contact: 74,
        power: 71,
        eye: 78,
        speed: 76,
        defense: 78,
        stamina: 82
      },
      overall: 73,
      potential: 'B',
      traits: ['육성선수 입단', '악바리 근성', '0원 계약']
    })
  }

  const isBudgetTight = team.budget < 3

  const handleConfirm = () => {
    if (!selectedProspect) return
    onDraftRookie(selectedProspect)
  }

  return (
    <div className="flex-1 flex flex-col p-3 sm:p-5 space-y-5 break-keep pb-16">
      {/* 1. 상단 브리핑 카드 */}
      <div className="bg-[#141720] border border-white/10 rounded-3xl p-5 sm:p-6 text-center shadow-md">
        <div className="flex items-center justify-between mb-2">
          {onBackToStoveLeague ? (
            <button
              type="button"
              onClick={onBackToStoveLeague}
              className="text-xs font-bold text-neutral-300 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl border border-white/10 transition flex items-center gap-1"
            >
              <span>← 스토브리그로 돌아가기</span>
            </button>
          ) : <div />}

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] text-neutral-400 text-xs font-mono font-semibold tracking-wider uppercase">
            <span>KBO ROOKIE DRAFT</span>
            <span>·</span>
            <span>1ST ROUND</span>
          </div>

          <div className="w-20" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
          신인 1차 지명 드래프트 회의
        </h2>
        <p className="text-xs sm:text-sm text-neutral-300 mt-1.5 max-w-md mx-auto">
          구단의 미래를 책임질 신인 유망주를 지명하십시오. (계약금 예산 차감)
        </p>
      </div>

      {/* 2. 예산 부족 비상 대책 배너 (예산 3억 미만일 때 항시 노출) */}
      {isBudgetTight && (
        <div className="p-4 sm:p-5 rounded-3xl bg-[#1c1813] border border-amber-500/40 shadow-lg space-y-3 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              <div>
                <h4 className="font-black text-sm text-amber-300">
                  신인 계약금 예산 부족 (현재 보유: {team.budget}억원)
                </h4>
                <p className="text-xs text-neutral-300 mt-0.5">
                  상위 지명 후보의 계약금이 부족합니다. 아래 해결 방법 중 하나를 선택하십시오:
                </p>
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold border border-amber-500/30 shrink-0">
              보유: {team.budget}억
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {onBorrowEmergencyBudget && (
              <button
                type="button"
                onClick={onBorrowEmergencyBudget}
                className="py-3 px-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs transition shadow-md flex items-center justify-center gap-1.5 active:scale-[0.98]"
              >
                <span>🏢 모기업 특별 계약금 10억 긴급 차입 (신뢰 -8)</span>
              </button>
            )}

            {onBackToStoveLeague && (
              <button
                type="button"
                onClick={onBackToStoveLeague}
                className="py-3 px-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition border border-white/20 flex items-center justify-center gap-1.5 active:scale-[0.98]"
              >
                <span>🔄 스토브리그로 돌아가 예산 재설계</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. 지명 후보 목록 (2열 그리드로 큼직하고 시원하게) */}
      <div className="bg-[#141720] border border-white/10 rounded-3xl p-5 sm:p-6 space-y-4 shadow-md">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <span className="font-black text-base text-white">
            지명 후보 선수 목록 ({allProspects.length}명)
          </span>
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-white/10 text-neutral-200 border border-white/10">
            가용 예산: {team.budget}억원
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {allProspects.map(p => {
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
                className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col justify-between gap-3.5 ${
                  isSelected
                    ? 'bg-blue-500/[0.12] border-blue-400 ring-2 ring-blue-400/40 shadow-lg cursor-pointer'
                    : isAffordable
                    ? 'bg-[#181d28] hover:bg-[#202534] border-white/[0.09] shadow-sm cursor-pointer'
                    : 'bg-white/[0.02] border-white/[0.05] opacity-60 cursor-not-allowed'
                }`}
              >
                <div>
                  {/* 포지션 & 포텐셜 */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
                      p.isPitcher
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {p.position}
                    </span>

                    <span className={`font-mono font-black text-xs px-2 py-0.5 rounded-md ${
                      p.potential === 'S'
                        ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                        : p.potential.startsWith('A')
                        ? 'bg-sky-400/20 text-sky-300 border border-sky-400/40'
                        : 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/40'
                    }`}>
                      포텐셜 {p.potential}
                    </span>
                  </div>

                  {/* 이름 & 계약금: 큼직한 이름 */}
                  <h4 className="text-xl sm:text-2xl font-black text-white tracking-tight break-keep">
                    {p.name}
                  </h4>
                  <div className="text-xs text-neutral-400 font-mono mt-0.5">
                    {p.school} · {p.age}세 ·{' '}
                    {p.signingBonus === 0 ? (
                      <b className="text-emerald-400 font-bold">계약금 0원 (무료 입단)</b>
                    ) : (
                      <b className="text-amber-300 font-bold">계약금 {p.signingBonus}억원</b>
                    )}
                  </div>

                  {/* 스카우트 리포트 */}
                  <p className="text-xs text-neutral-300 mt-2.5 leading-relaxed italic bg-white/[0.03] p-2.5 rounded-xl border border-white/[0.05]">
                    "{p.scoutSummary}"
                  </p>

                  {/* 스탯 미니 바 */}
                  <div className="bg-white/[0.04] px-3 py-2 rounded-xl text-xs font-mono mt-2.5">
                    {p.isPitcher && p.pitcherStats ? (
                      <div className="flex justify-between text-neutral-300">
                        <span>구위 <b className="text-white">{p.pitcherStats.stuff}</b></span>
                        <span>제구 <b className="text-white">{p.pitcherStats.control}</b></span>
                        <span>체력 <b className="text-white">{p.pitcherStats.stamina}</b></span>
                      </div>
                    ) : p.batterStats ? (
                      <div className="flex justify-between text-neutral-300">
                        <span>컨택 <b className="text-white">{p.batterStats.contact}</b></span>
                        <span>장타 <b className="text-white">{p.batterStats.power}</b></span>
                        <span>선구 <b className="text-white">{p.batterStats.eye}</b></span>
                      </div>
                    ) : null}
                  </div>

                  {/* 특성 태그 */}
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {p.traits.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-white/[0.06] text-neutral-300 font-medium"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 지명 버튼 */}
                <div className="pt-2 border-t border-white/[0.08]">
                  {!isAffordable ? (
                    <div className="space-y-1.5">
                      <div className="text-center text-xs font-bold text-rose-400 py-1">
                        ⚠️ 계약금 예산 부족 ({p.signingBonus - team.budget}억 필요)
                      </div>
                      {onBorrowEmergencyBudget && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            onBorrowEmergencyBudget()
                          }}
                          className="w-full py-1.5 rounded-lg text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition"
                        >
                          모기업 10억 긴급 차입 후 지명하기
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-blue-500 text-white shadow-md'
                          : 'bg-white text-neutral-950 hover:bg-neutral-200'
                      }`}
                    >
                      {isSelected ? '✓ 선택 완료' : '지명 후보 선택'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* 하단 최종 지명 버튼 */}
        <div className="pt-3">
          <button
            type="button"
            disabled={!selectedProspect}
            onClick={handleConfirm}
            className={`w-full py-4 rounded-2xl text-base font-black tracking-tight shadow-xl transition-all duration-200 active:scale-[0.98] ${
              selectedProspect
                ? 'bg-white hover:bg-neutral-200 text-neutral-950 shadow-white/10 cursor-pointer'
                : 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-white/5'
            }`}
          >
            {selectedProspect
              ? `[${selectedProspect.name}] 1차 지명 확정 (계약금 ${selectedProspect.signingBonus}억 지출) →`
              : '신인 선수를 선택하십시오'}
          </button>
        </div>
      </div>
    </div>
  )
}

