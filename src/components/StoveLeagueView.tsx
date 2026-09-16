import React, { useState } from 'react'
import { Team, Player, ForeignCandidate, Position, TeamStance } from '../types'

interface StoveLeagueViewProps {
  season?: number
  team: Team
  players: Player[]
  candidates: ForeignCandidate[]
  onFinalizeStoveLeague: (
    finalForeignPlayers: Player[],
    releasedPlayerIds: string[],
    netBudgetDelta: number,
    powerPenalty: number,
    fanPenalty: number,
    stance: TeamStance
  ) => void
}

interface SlotState {
  slotIndex: number
  label: string
  isAsianQuotaSlot: boolean
  mode: 'RE_SIGN' | 'REPLACED' | 'EMPTY'
  initialPlayer: Player
  candidate?: ForeignCandidate
  cost: number
}

export const StoveLeagueView: React.FC<StoveLeagueViewProps> = ({
  season = 1,
  team,
  players,
  candidates,
  onFinalizeStoveLeague
}) => {
  const [selectedStance, setSelectedStance] = useState<TeamStance>(team.stance || 'BALANCED')
  const teamPlayers = players.filter(p => p.teamId === team.id)
  const currentForeigns = teamPlayers.filter(p => p.isForeign)
  const releasablePlayers = teamPlayers.filter(p => !p.isForeign && (p.age >= 32 || p.salary >= 8))

  // 초기 4개 슬롯 구성 (기존 외인 3명 + 아시아쿼터 1명)
  const initialAsian = currentForeigns.find(p => p.isAsianQuota) || currentForeigns[3]
  const initialRegulars = currentForeigns.filter(p => p.id !== initialAsian?.id).slice(0, 3)

  // 기본 슬롯 4개 초기화
  const [slots, setSlots] = useState<SlotState[]>(() => {
    const list: SlotState[] = []
    // 슬롯 1~3: 일반 외국인
    for (let i = 0; i < 3; i++) {
      const p = initialRegulars[i] || currentForeigns[i] || {
        id: `placeholder_foreign_${i}`,
        name: `외인 선수 ${i + 1}`,
        teamId: team.id,
        position: 'SP' as Position,
        age: 30,
        salary: 14,
        contractYears: 1,
        isPitcher: true,
        overall: 88,
        traits: ['외인'],
        isForeign: true
      }
      list.push({
        slotIndex: i,
        label: `외인 슬롯 ${i + 1}`,
        isAsianQuotaSlot: false,
        mode: 'RE_SIGN',
        initialPlayer: p,
        cost: p.salary
      })
    }

    // 슬롯 4: 아시아쿼터
    const asianP = initialAsian || {
      id: 'placeholder_asian',
      name: '아시아쿼터 선수',
      teamId: team.id,
      position: 'SP' as Position,
      age: 29,
      salary: 8,
      contractYears: 1,
      isPitcher: true,
      overall: 87,
      traits: ['아시아쿼터'],
      isForeign: true,
      isAsianQuota: true
    }
    list.push({
      slotIndex: 3,
      label: '아시아쿼터 슬롯',
      isAsianQuotaSlot: true,
      mode: 'RE_SIGN',
      initialPlayer: asianP,
      cost: asianP.salary
    })

    return list
  })

  const [selectedCandidate, setSelectedCandidate] = useState<ForeignCandidate | null>(null)
  const [releasedPlayerIds, setReleasedPlayerIds] = useState<string[]>([])

  // 베테랑 방출 토글
  const handleToggleRelease = (player: Player) => {
    if (releasedPlayerIds.includes(player.id)) {
      setReleasedPlayerIds(prev => prev.filter(id => id !== player.id))
    } else {
      setReleasedPlayerIds(prev => [...prev, player.id])
    }
  }

  // 슬롯 모드 변경 (재계약)
  const setSlotReSign = (slotIndex: number) => {
    setSlots(prev => prev.map(s => {
      if (s.slotIndex !== slotIndex) return s
      return {
        ...s,
        mode: 'RE_SIGN',
        candidate: undefined,
        cost: s.initialPlayer.salary
      }
    }))
  }

  // 슬롯 모드 변경 (미사용 - 예산 0원, 전력 급락)
  const setSlotEmpty = (slotIndex: number) => {
    setSlots(prev => prev.map(s => {
      if (s.slotIndex !== slotIndex) return s
      return {
        ...s,
        mode: 'EMPTY',
        candidate: undefined,
        cost: 0
      }
    }))
  }

  // 슬롯에 후보 영입 및 교체
  const assignCandidateToSlot = (slotIndex: number, candidate: ForeignCandidate) => {
    setSlots(prev => prev.map(s => {
      if (s.slotIndex !== slotIndex) return s
      return {
        ...s,
        mode: 'REPLACED',
        candidate,
        cost: candidate.salary
      }
    }))
    setSelectedCandidate(null)
  }

  // 예산 계산
  const totalExpenditure = slots.reduce((acc, s) => acc + s.cost, 0)
  const totalRefund = releasablePlayers
    .filter(p => releasedPlayerIds.includes(p.id))
    .reduce((acc, p) => acc + Math.round(p.salary * 0.7), 0)
  const netBudgetDelta = totalRefund - totalExpenditure
  const remainingBudget = team.budget + netBudgetDelta
  const isBudgetValid = remainingBudget >= 0

  // 활성 외국인 선수 포지션 계산 (미사용 제외)
  const activeForeignPlayers = slots.map(s => {
    if (s.mode === 'EMPTY') return null
    if (s.mode === 'REPLACED' && s.candidate) {
      return {
        isPitcher: s.candidate.isPitcher,
        position: s.candidate.position,
        name: s.candidate.name
      }
    }
    return {
      isPitcher: s.initialPlayer.isPitcher,
      position: s.initialPlayer.position,
      name: s.initialPlayer.name
    }
  }).filter(Boolean) as { isPitcher: boolean; position: Position; name: string }[]

  const pitcherCount = activeForeignPlayers.filter(p => p.isPitcher).length
  const batterCount = activeForeignPlayers.filter(p => !p.isPitcher).length
  const activeCount = activeForeignPlayers.length
  const emptyCount = slots.filter(s => s.mode === 'EMPTY').length

  // 규정 검증 (투투타, 타타투 가능 / 투투투투, 타타타타 불가능)
  let ruleError: string | null = null
  if (activeCount === 4) {
    if (pitcherCount === 4) {
      ruleError = '🚫 KBO 규정 위반: 외국인 투수만 4명(투투투투)으로 구성할 수 없습니다. 타자를 최소 1명 포함하십시오.'
    } else if (batterCount === 4) {
      ruleError = '🚫 KBO 규정 위반: 외국인 타자만 4명(타타타타)으로 구성할 수 없습니다. 투수를 최소 1명 포함하십시오.'
    }
  } else if (activeCount > 1) {
    if (pitcherCount === activeCount) {
      ruleError = `🚫 KBO 규정 위반: 투수만 ${pitcherCount}명으로 구성할 수 없습니다. (타자 최소 1명 필수)`
    } else if (batterCount === activeCount) {
      ruleError = `🚫 KBO 규정 위반: 타자만 ${batterCount}명으로 구성할 수 없습니다. (투수 최소 1명 필수)`
    }
  }

  // 최종 마감 처리
  const handleFinalize = () => {
    if (ruleError || !isBudgetValid) return

    // 확정된 4개 슬롯의 선수 객체들 생성
    const finalForeignPlayers: Player[] = []

    slots.forEach(s => {
      if (s.mode === 'EMPTY') {
        // 미사용: 로스터에 추가하지 않음 (방출 처리)
        return
      }

      if (s.mode === 'REPLACED' && s.candidate) {
        // 신규 후보 영입
        finalForeignPlayers.push({
          id: s.candidate.id,
          name: s.candidate.name,
          teamId: team.id,
          position: s.candidate.position,
          age: s.candidate.age,
          salary: s.candidate.salary,
          contractYears: 1,
          isPitcher: s.candidate.isPitcher,
          pitcherStats: s.candidate.pitcherStats,
          batterStats: s.candidate.batterStats,
          overall: s.candidate.overall,
          traits: s.candidate.traits,
          isForeign: true,
          isAsianQuota: s.candidate.isAsianQuota || s.isAsianQuotaSlot
        })
      } else {
        // 기존 선수 재계약
        finalForeignPlayers.push({
          ...s.initialPlayer,
          isForeign: true,
          isAsianQuota: s.initialPlayer.isAsianQuota || s.isAsianQuotaSlot
        })
      }
    })

    const powerPenalty = emptyCount * 10
    const fanPenalty = emptyCount * 6

    onFinalizeStoveLeague(
      finalForeignPlayers,
      releasedPlayerIds,
      netBudgetDelta,
      powerPenalty,
      fanPenalty,
      selectedStance
    )
  }

  const currentYear = 2025 + season

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 space-y-6 overflow-y-auto animate-fade-in">
      {/* 헤더 브리핑 */}
      <div className="text-center py-4 apple-card rounded-3xl p-5">
        <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 tracking-wider uppercase">
          KBO Stove League · {currentYear} Season
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white mt-1">
          {currentYear}년 스토브리그: 구단 기조 & 외국인 엔트리
        </h2>
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1 max-w-xl mx-auto">
          올 시즌 <b>구단 운영 기조(윈나우 vs 리빌딩)</b>를 확립하고, <b>외국인 4인 엔트리</b>(외인 3 + 아시아쿼터 1)를 완성하십시오.
        </p>

        {/* 상태 요약 바 */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mt-4 text-xs font-semibold">
          <span className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-white/[0.06] text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-white/10">
            보유 예산: <b>{team.budget}억</b>
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-white/[0.06] text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-white/10">
            외인 지출: <b className="text-red-600 dark:text-red-400">-{totalExpenditure}억</b>
          </span>
          {totalRefund > 0 && (
            <span className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20">
              베테랑 정리 환급: <b>+{totalRefund}억</b>
            </span>
          )}
          <span className={`px-3 py-1.5 rounded-xl border font-bold ${
            isBudgetValid
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-black border-transparent shadow-sm'
              : 'bg-red-500 text-white border-red-600 animate-pulse'
          }`}>
            마감 후 잔여 예산: {remainingBudget}억원
          </span>
        </div>
      </div>

      {/* 섹션 0: 구단 운영 기조 설정 (윈나우 vs 밸런스 vs 리빌딩) */}
      <div className="apple-card rounded-3xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-black/[0.06] dark:border-white/[0.06] pb-3 gap-2">
          <div>
            <h3 className="font-bold text-base text-neutral-900 dark:text-white flex items-center gap-2">
              <span>🧭 {currentYear} 시즌 구단 운영 기조 결정</span>
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              이번 시즌 목표를 선택하십시오. 우승 확률과 미래 리스크/리턴이 극명하게 갈립니다.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            {team.winNowDebt && team.winNowDebt > 0 ? (
              <span className="px-2.5 py-1 rounded-lg bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-800/40 font-bold">
                ⚡ 윈나우 후폭풍: {team.winNowDebt}단계
              </span>
            ) : null}
            {team.rebuildingStack && team.rebuildingStack > 0 ? (
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 font-bold">
                🌱 리빌딩 누적: {team.rebuildingStack}년차
              </span>
            ) : null}
          </div>
        </div>

        {/* 3대 기조 선택 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* 1. 윈나우 */}
          <button
            type="button"
            onClick={() => setSelectedStance('WIN_NOW')}
            className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
              selectedStance === 'WIN_NOW'
                ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/30 shadow-md dark:bg-amber-400/10 dark:border-amber-400'
                : 'bg-neutral-50 hover:bg-neutral-100/70 dark:bg-white/[0.02] dark:hover:bg-white/[0.04] border-neutral-200/80 dark:border-white/[0.06]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                  🏆 윈나우 (Win-Now)
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white dark:bg-amber-400 dark:text-neutral-950">
                  전력 +4
                </span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                현재 전력을 극대화하여 <b>올 시즌 우승 확률</b>을 대폭 끌어올립니다. (포스트시즌 버프 부여)
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-black/[0.06] dark:border-white/[0.06] text-[11px] text-red-500 dark:text-red-400 font-medium">
              ⚠️ <b>리바운드 후폭풍</b>: 다음 시즌 베테랑 혹사로 에이징 가속 (-1~-3 OVR) 및 팜 피로도 누적
            </div>
          </button>

          {/* 2. 밸런스 */}
          <button
            type="button"
            onClick={() => setSelectedStance('BALANCED')}
            className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
              selectedStance === 'BALANCED'
                ? 'bg-neutral-900 text-white border-neutral-900 ring-2 ring-neutral-900/30 shadow-md dark:bg-white dark:text-black dark:border-white'
                : 'bg-neutral-50 hover:bg-neutral-100/70 dark:bg-white/[0.02] dark:hover:bg-white/[0.04] border-neutral-200/80 dark:border-white/[0.06]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-base font-bold flex items-center gap-1.5 ${
                  selectedStance === 'BALANCED' ? 'text-white dark:text-black' : 'text-neutral-900 dark:text-white'
                }`}>
                  ⚖️ 투트랙 밸런스
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  selectedStance === 'BALANCED' ? 'bg-white/20 text-white dark:bg-black/20 dark:text-black' : 'bg-neutral-200 text-neutral-700 dark:bg-white/10 dark:text-neutral-300'
                }`}>
                  기본 전력
                </span>
              </div>
              <p className={`text-xs leading-relaxed ${
                selectedStance === 'BALANCED' ? 'text-neutral-200 dark:text-neutral-800' : 'text-neutral-600 dark:text-neutral-300'
              }`}>
                안정적인 전력을 유지하며 무리한 혹사나 단기 성적 희생 없이 정상적인 육성과 경기력을 병행합니다.
              </p>
            </div>
            <div className={`mt-3 pt-2.5 border-t text-[11px] font-medium ${
              selectedStance === 'BALANCED'
                ? 'border-white/20 dark:border-black/20 text-neutral-300 dark:text-neutral-700'
                : 'border-black/[0.06] dark:border-white/[0.06] text-neutral-500 dark:text-neutral-400'
            }`}>
              ✓ 후폭풍 1단계 자연 회복, 표준 에이징 커브 유지
            </div>
          </button>

          {/* 3. 리빌딩 */}
          <button
            type="button"
            onClick={() => setSelectedStance('REBUILDING')}
            className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
              selectedStance === 'REBUILDING'
                ? 'bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/30 shadow-md dark:bg-emerald-400/10 dark:border-emerald-400'
                : 'bg-neutral-50 hover:bg-neutral-100/70 dark:bg-white/[0.02] dark:hover:bg-white/[0.04] border-neutral-200/80 dark:border-white/[0.06]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                  🌱 전면 리빌딩 (Rebuild)
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white dark:bg-emerald-400 dark:text-neutral-950">
                  전력 -4
                </span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                당해 시즌 우승 확률을 양보하고, <b>유망주 실전 출전 보장 및 미래 왕조</b>를 위해 투자합니다.
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-black/[0.06] dark:border-white/[0.06] text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              ✨ <b>점진적 누적 효과</b>: 28세 이하 유망주 전원 대폭 성장 (+2~+5 OVR), 팜 시스템 급상승, 특급 신인 발굴
            </div>
          </button>
        </div>
      </div>

      {/* 섹션 1: 4개의 외국인 엔트리 슬롯 */}
      <div className="apple-card rounded-3xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-black/[0.06] dark:border-white/[0.06] pb-3 gap-2">
          <div>
            <h3 className="font-bold text-base text-neutral-900 dark:text-white flex items-center gap-2">
              <span>📋 {currentYear} 우리 구단 외국인 엔트리 (총 4명)</span>
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              현재 구성: 투수 <b>{pitcherCount}명</b> / 타자 <b>{batterCount}명</b>
              {emptyCount > 0 && <span className="text-amber-600 dark:text-amber-400 font-bold ml-1.5">(공백 {emptyCount}개)</span>}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            {ruleError ? (
              <span className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-950/50 px-2.5 py-1 rounded-lg border border-red-200 dark:border-red-800">
                {ruleError}
              </span>
            ) : (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                ✓ KBO 포지션 규정 충족 (투·타 혼합 구성)
              </span>
            )}
          </div>
        </div>

        {/* 4 슬롯 카드 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {slots.map((slot) => {
            const isReSign = slot.mode === 'RE_SIGN'
            const isReplaced = slot.mode === 'REPLACED'
            const isEmpty = slot.mode === 'EMPTY'

            const displayPlayer = isReplaced && slot.candidate
              ? {
                  name: slot.candidate.name,
                  position: slot.candidate.position,
                  age: slot.candidate.age,
                  overall: slot.candidate.overall,
                  traits: slot.candidate.traits,
                  isPitcher: slot.candidate.isPitcher,
                  pitcherStats: slot.candidate.pitcherStats,
                  batterStats: slot.candidate.batterStats,
                  subInfo: slot.candidate.previousTeam
                }
              : {
                  name: slot.initialPlayer.name,
                  position: slot.initialPlayer.position,
                  age: slot.initialPlayer.age,
                  overall: slot.initialPlayer.overall,
                  traits: slot.initialPlayer.traits,
                  isPitcher: slot.initialPlayer.isPitcher,
                  pitcherStats: slot.initialPlayer.pitcherStats,
                  batterStats: slot.initialPlayer.batterStats,
                  subInfo: slot.isAsianQuotaSlot ? '아시아쿼터 주전' : '기존 외인 선수'
                }

            return (
              <div
                key={slot.slotIndex}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                  isEmpty
                    ? 'bg-neutral-100/50 dark:bg-white/[0.02] border-neutral-300 dark:border-white/10 border-dashed opacity-80'
                    : isReplaced
                    ? 'bg-blue-50/70 dark:bg-blue-950/20 border-blue-300 dark:border-blue-500/30 ring-1 ring-blue-400/20 shadow-sm'
                    : 'bg-white dark:bg-[#18181b] border-neutral-200/90 dark:border-white/[0.08] shadow-sm'
                }`}
              >
                <div>
                  {/* 슬롯 헤더 */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-neutral-200/80 dark:bg-white/10 text-neutral-700 dark:text-neutral-300 font-mono uppercase">
                      {slot.label}
                    </span>
                    {slot.isAsianQuotaSlot && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                        아시아쿼터
                      </span>
                    )}
                  </div>

                  {isEmpty ? (
                    <div className="py-6 text-center">
                      <div className="w-10 h-10 mx-auto rounded-full bg-neutral-200/80 dark:bg-white/10 flex items-center justify-center text-neutral-400 dark:text-neutral-500 text-lg mb-2">
                        ✕
                      </div>
                      <h4 className="font-bold text-sm text-neutral-600 dark:text-neutral-400">외인 미사용 슬롯</h4>
                      <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-1">
                        예산 0원 소모 · 전력 -10 OVR 급락
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-white/10 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-white/10">
                              {displayPlayer.position}
                            </span>
                            <h4 className="font-bold text-base text-neutral-900 dark:text-white">
                              {displayPlayer.name}
                            </h4>
                          </div>
                          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono mt-0.5">
                            {displayPlayer.age}세 · {displayPlayer.subInfo}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-bold font-mono text-amber-600 dark:text-amber-400">
                            OVR {displayPlayer.overall}
                          </span>
                        </div>
                      </div>

                      {/* 스탯 미니 바 */}
                      <div className="bg-neutral-100/80 dark:bg-white/[0.04] p-2 rounded-xl text-[10px] font-mono mt-2.5">
                        {displayPlayer.isPitcher && displayPlayer.pitcherStats ? (
                          <div className="flex justify-between text-neutral-700 dark:text-neutral-300">
                            <span>구위 <b>{displayPlayer.pitcherStats.stuff}</b></span>
                            <span>제구 <b>{displayPlayer.pitcherStats.control}</b></span>
                          </div>
                        ) : displayPlayer.batterStats ? (
                          <div className="flex justify-between text-neutral-700 dark:text-neutral-300">
                            <span>컨택 <b>{displayPlayer.batterStats.contact}</b></span>
                            <span>장타 <b>{displayPlayer.batterStats.power}</b></span>
                          </div>
                        ) : null}
                      </div>

                      {/* 상태 배지 */}
                      <div className="mt-2.5">
                        {isReplaced ? (
                          <span className="inline-flex items-center text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-100/70 dark:bg-blue-950/60 px-2 py-0.5 rounded-lg border border-blue-200 dark:border-blue-800">
                            ✈️ 신규 영입 계약 ({slot.cost}억)
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                            ✓ 기존 선수 재계약 ({slot.cost}억)
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* 슬롯 조작 버튼 */}
                <div className="space-y-1.5 pt-2 border-t border-black/[0.04] dark:border-white/[0.04]">
                  {!isReSign && (
                    <button
                      type="button"
                      onClick={() => setSlotReSign(slot.slotIndex)}
                      className="w-full py-1.5 rounded-lg text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 dark:bg-white/10 dark:hover:bg-white/20 text-neutral-800 dark:text-neutral-200 transition"
                    >
                      기존 선수 재계약 ({slot.initialPlayer.salary}억)
                    </button>
                  )}

                  {!isEmpty && (
                    <button
                      type="button"
                      onClick={() => setSlotEmpty(slot.slotIndex)}
                      className="w-full py-1.5 rounded-lg text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/30 dark:hover:bg-red-950/50 dark:text-red-400 border border-red-200 dark:border-red-900/40 transition"
                    >
                      미사용 (0원 / 전력 하락)
                    </button>
                  )}

                  {/* 만약 후보가 선택되어 있다면 이 슬롯에 교체 영입하는 버튼 */}
                  {selectedCandidate && (
                    <button
                      type="button"
                      onClick={() => assignCandidateToSlot(slot.slotIndex, selectedCandidate)}
                      className="w-full py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition animate-pulse"
                    >
                      [{selectedCandidate.name}] 이 슬롯에 영입 ({selectedCandidate.salary}억)
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 섹션 2: ✈️ 2026 해외 & 아시아쿼터 스카우트 풀 */}
      <div className="apple-card rounded-3xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.06] pb-3">
          <div>
            <h3 className="font-bold text-base text-neutral-900 dark:text-white">
              ✈️ 2026 해외 & 아시아쿼터 스카우트 풀 (후보 선수)
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              후보를 선택한 후, 위 슬롯 중 교체하고자 하는 슬롯의 <b>[이 슬롯에 영입]</b> 버튼을 누르십시오.
            </p>
          </div>
          {selectedCandidate && (
            <button
              onClick={() => setSelectedCandidate(null)}
              className="text-xs font-semibold text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-white"
            >
              선택 취소
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {candidates.map((c) => {
            const isSelected = selectedCandidate?.id === c.id
            const isAssigned = slots.some(s => s.candidate?.id === c.id)

            return (
              <div
                key={c.id}
                onClick={() => {
                  if (!isAssigned) {
                    setSelectedCandidate(isSelected ? null : c)
                  }
                }}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 cursor-pointer ${
                  isAssigned
                    ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-300 dark:border-blue-700/50 opacity-60'
                    : isSelected
                    ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-500 ring-2 ring-blue-500/30 shadow-md'
                    : 'bg-white hover:bg-neutral-50 dark:bg-[#18181b] dark:hover:bg-[#202024] border-neutral-200/90 dark:border-white/[0.08] shadow-sm'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-white/10 text-neutral-800 dark:text-neutral-200 font-bold border border-neutral-200 dark:border-white/10">
                        {c.position}
                      </span>
                      {c.isAsianQuota && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                          {c.country || '아시아쿼터'}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 font-mono">
                      OVR {c.overall}
                    </span>
                  </div>

                  <h4 className="font-bold text-base text-neutral-900 dark:text-white">{c.name}</h4>
                  <div className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono mt-0.5">
                    {c.age}세 · 계약 연봉 {c.salary}억
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-1 font-medium truncate">
                    {c.previousTeam}
                  </div>

                  <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-2 leading-relaxed">
                    {c.scoutSummary}
                  </p>
                </div>

                <div>
                  {/* 스탯 표시 */}
                  <div className="bg-neutral-100/80 dark:bg-white/[0.03] p-2 rounded-xl text-[11px] font-mono mb-2">
                    {c.isPitcher && c.pitcherStats ? (
                      <div className="flex justify-between text-neutral-700 dark:text-neutral-300">
                        <span>구위 <b>{c.pitcherStats.stuff}</b></span>
                        <span>제구 <b>{c.pitcherStats.control}</b></span>
                      </div>
                    ) : c.batterStats ? (
                      <div className="flex justify-between text-neutral-700 dark:text-neutral-300">
                        <span>컨택 <b>{c.batterStats.contact}</b></span>
                        <span>장타 <b>{c.batterStats.power}</b></span>
                      </div>
                    ) : null}
                  </div>

                  {isAssigned ? (
                    <div className="text-center text-xs font-bold text-blue-600 dark:text-blue-400 py-1.5">
                      ✓ 슬롯 등록 완료
                    </div>
                  ) : (
                    <button
                      type="button"
                      className={`w-full py-2 rounded-xl text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-neutral-100 dark:bg-white/10 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200'
                      }`}
                    >
                      {isSelected ? '선택 해제 (위 슬롯 버튼 클릭)' : '영입 후보 선택'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 섹션 3: 선수단 정리 (베테랑 방출 & 샐러리 삭감) */}
      <div className="apple-card rounded-3xl p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.06] pb-3">
          <div>
            <h3 className="font-bold text-base text-neutral-900 dark:text-white">
              ✂️ 국내 베테랑 선수단 정리 (방출 및 샐러리 환급)
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              고연봉 베테랑을 방출하면 연봉의 70%가 예산으로 즉시 환급되어 외국인 계약 예산으로 충당할 수 있습니다.
            </p>
          </div>
        </div>

        <div className="space-y-2 text-xs">
          {releasablePlayers.slice(0, 4).map(p => {
            const isReleased = releasedPlayerIds.includes(p.id)
            const refund = Math.round(p.salary * 0.7)
            return (
              <div
                key={p.id}
                className="p-3 rounded-xl bg-neutral-50 dark:bg-white/[0.02] border border-neutral-200/80 dark:border-white/[0.04] flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-neutral-500">{p.position}</span>
                  <span className="font-bold text-neutral-900 dark:text-white">{p.name}</span>
                  <span className="text-neutral-500 font-mono">({p.age}세 · 연봉 {p.salary}억)</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-200 text-neutral-700 dark:bg-white/10 dark:text-neutral-300">
                    OVR {p.overall}
                  </span>
                </div>

                {isReleased ? (
                  <button
                    onClick={() => handleToggleRelease(p)}
                    className="px-3 py-1.5 rounded-lg bg-neutral-200 text-neutral-700 dark:bg-white/10 dark:text-neutral-300 text-xs font-semibold"
                  >
                    방출 취소 (+{refund}억 취소)
                  </button>
                ) : (
                  <button
                    onClick={() => handleToggleRelease(p)}
                    className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-300 dark:border-red-500/20 border border-red-200 text-xs font-semibold transition"
                  >
                    방출 (+{refund}억 확보)
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* 하단 마감 및 진행 버튼 */}
      <div className="pt-2 space-y-2">
        {ruleError && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs font-bold text-red-600 dark:text-red-300 text-center">
            {ruleError}
          </div>
        )}
        {!isBudgetValid && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs font-bold text-red-600 dark:text-red-300 text-center">
            ⚠️ 가용 예산 초과: 현재 지출 계획으로는 {Math.abs(remainingBudget)}억원이 부족합니다. 외인을 미사용 처리하거나 베테랑을 방출하십시오.
          </div>
        )}

        <button
          onClick={handleFinalize}
          disabled={!!ruleError || !isBudgetValid}
          className={`apple-button-primary w-full py-4 text-sm font-semibold shadow-lg transition-transform active:scale-[0.98] ${
            ruleError || !isBudgetValid ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          스토브리그 마감 및 스프링캠프로 이동
        </button>
      </div>
    </div>
  )
}

