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
  const [openSlotPickerCandidateId, setOpenSlotPickerCandidateId] = useState<string | null>(null)
  const [releasedPlayerIds, setReleasedPlayerIds] = useState<string[]>([])

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
        label: `외인 ${i + 1}`,
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
      label: '아시아쿼터',
      isAsianQuotaSlot: true,
      mode: 'RE_SIGN',
      initialPlayer: asianP,
      cost: asianP.salary
    })

    return list
  })

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
      // 기존에 이 후보가 다른 슬롯에 등록되어 있다면 그 슬롯은 재계약으로 복귀
      if (s.candidate?.id === candidate.id && s.slotIndex !== slotIndex) {
        return {
          ...s,
          mode: 'RE_SIGN',
          candidate: undefined,
          cost: s.initialPlayer.salary
        }
      }
      if (s.slotIndex !== slotIndex) return s
      return {
        ...s,
        mode: 'REPLACED',
        candidate,
        cost: candidate.salary
      }
    }))
    setOpenSlotPickerCandidateId(null)
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
      ruleError = '🚫 외국인 투수만 4명(투투투투)으로 구성할 수 없습니다. 타자를 최소 1명 포함하십시오.'
    } else if (batterCount === 4) {
      ruleError = '🚫 외국인 타자만 4명(타타타타)으로 구성할 수 없습니다. 투수를 최소 1명 포함하십시오.'
    }
  } else if (activeCount > 1) {
    if (pitcherCount === activeCount) {
      ruleError = `🚫 투수만 ${pitcherCount}명으로 구성할 수 없습니다. (타자 최소 1명 필수)`
    } else if (batterCount === activeCount) {
      ruleError = `🚫 타자만 ${batterCount}명으로 구성할 수 없습니다. (투수 최소 1명 필수)`
    }
  }

  // 최종 마감 처리
  const handleFinalize = () => {
    if (ruleError || !isBudgetValid) return

    const finalForeignPlayers: Player[] = []

    slots.forEach(s => {
      if (s.mode === 'EMPTY') {
        return
      }

      if (s.mode === 'REPLACED' && s.candidate) {
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
    <div className="flex-1 flex flex-col p-4 sm:p-6 space-y-6 overflow-y-auto animate-fade-in break-keep">
      {/* 1. 헤더 & 재정 요약 카드 */}
      <div className="apple-card rounded-3xl p-5 sm:p-6 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 dark:bg-white/[0.06] text-neutral-600 dark:text-neutral-400 text-[11px] font-mono font-semibold tracking-wider uppercase mb-2">
          <span>KBO STOVE LEAGUE</span>
          <span>·</span>
          <span>{currentYear} SEASON</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
          {currentYear}년 스토브리그 전략 회의
        </h2>
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1.5 max-w-xl mx-auto">
          올 시즌 <b>구단 운영 기조(윈나우 vs 리빌딩)</b>를 확립하고, <b>외국인 4인 엔트리</b>와 <b>선수단 정리</b>를 확정하십시오.
        </p>

        {/* 재정 메트릭 그리드 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mt-5 max-w-3xl mx-auto text-left">
          <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-white/[0.03] border border-neutral-200/80 dark:border-white/[0.06]">
            <div className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">보유 예산</div>
            <div className="text-base sm:text-lg font-bold font-mono text-neutral-900 dark:text-white mt-0.5">
              {team.budget}억원
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-white/[0.03] border border-neutral-200/80 dark:border-white/[0.06]">
            <div className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">외인 계약 총액</div>
            <div className="text-base sm:text-lg font-bold font-mono text-red-600 dark:text-red-400 mt-0.5">
              -{totalExpenditure}억원
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-white/[0.03] border border-neutral-200/80 dark:border-white/[0.06]">
            <div className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">베테랑 정리 환급</div>
            <div className="text-base sm:text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
              +{totalRefund}억원
            </div>
          </div>

          <div className={`p-3 rounded-2xl border transition-all ${
            isBudgetValid
              ? 'bg-neutral-100 dark:bg-white/[0.06] border-neutral-300 dark:border-white/10'
              : 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800 animate-pulse'
          }`}>
            <div className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">마감 후 잔여 예산</div>
            <div className={`text-base sm:text-lg font-bold font-mono mt-0.5 ${
              isBudgetValid ? 'text-neutral-900 dark:text-white' : 'text-red-600 dark:text-red-400'
            }`}>
              {remainingBudget}억원
            </div>
          </div>
        </div>
      </div>

      {/* 2. 구단 운영 기조 결정 (윈나우 vs 밸런스 vs 리빌딩) */}
      <div className="apple-card rounded-3xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-black/[0.06] dark:border-white/[0.06] pb-3 gap-2">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-neutral-900 dark:text-white flex items-center gap-2">
              <span>🧭 {currentYear} 시즌 구단 운영 기조 결정</span>
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              올 시즌 추구할 구단 전략을 선택하십시오. 성적과 미래 성장 곡선에 직결됩니다.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            {team.winNowDebt && team.winNowDebt > 0 ? (
              <span className="px-2.5 py-1 rounded-lg bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-800/40 font-bold whitespace-nowrap">
                ⚡ 윈나우 후폭풍: {team.winNowDebt}단계
              </span>
            ) : null}
            {team.rebuildingStack && team.rebuildingStack > 0 ? (
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 font-bold whitespace-nowrap">
                🌱 리빌딩 누적: {team.rebuildingStack}년차
              </span>
            ) : null}
          </div>
        </div>

        {/* 3대 기조 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* 윈나우 */}
          <button
            type="button"
            onClick={() => setSelectedStance('WIN_NOW')}
            className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 ${
              selectedStance === 'WIN_NOW'
                ? 'bg-amber-500/10 border-amber-500 ring-1 ring-amber-500/40 shadow-sm dark:bg-amber-500/[0.12] dark:border-amber-400'
                : 'bg-neutral-50/70 hover:bg-neutral-100/60 dark:bg-white/[0.02] dark:hover:bg-white/[0.04] border-neutral-200/80 dark:border-white/[0.06]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-1.5 whitespace-nowrap">
                  🏆 윈나우 (Win-Now)
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-500 text-white dark:bg-amber-400 dark:text-neutral-950 whitespace-nowrap shrink-0">
                  전력 +4
                </span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                현재 전력을 극대화하여 <b>올 시즌 한국시리즈 우승</b>을 정조준합니다. (가을야구 클러치 버프)
              </p>
            </div>
            <div className="pt-2.5 border-t border-black/[0.06] dark:border-white/[0.06] text-[11px] text-amber-700 dark:text-amber-300 font-medium">
              ⚠️ <b>리바운드 후폭풍</b>: 다음 시즌 30세 이상 에이징 가속 및 팜 피로도 누적
            </div>
          </button>

          {/* 밸런스 */}
          <button
            type="button"
            onClick={() => setSelectedStance('BALANCED')}
            className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 ${
              selectedStance === 'BALANCED'
                ? 'bg-sky-500/10 border-sky-500 ring-1 ring-sky-500/40 shadow-sm dark:bg-sky-500/[0.12] dark:border-sky-400'
                : 'bg-neutral-50/70 hover:bg-neutral-100/60 dark:bg-white/[0.02] dark:hover:bg-white/[0.04] border-neutral-200/80 dark:border-white/[0.06]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-1.5 whitespace-nowrap">
                  ⚖️ 투트랙 밸런스
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-sky-500 text-white dark:bg-sky-400 dark:text-neutral-950 whitespace-nowrap shrink-0">
                  기본 전력
                </span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                무리한 혹사 없이 안정적인 전력을 유지하며 정상적인 육성과 순위 싸움을 병행합니다.
              </p>
            </div>
            <div className="pt-2.5 border-t border-black/[0.06] dark:border-white/[0.06] text-[11px] text-sky-700 dark:text-sky-300 font-medium">
              ✓ 윈나우 후폭풍 1단계 자연 회복 및 표준 에이징 커브 유지
            </div>
          </button>

          {/* 리빌딩 */}
          <button
            type="button"
            onClick={() => setSelectedStance('REBUILDING')}
            className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 ${
              selectedStance === 'REBUILDING'
                ? 'bg-emerald-500/10 border-emerald-500 ring-1 ring-emerald-500/40 shadow-sm dark:bg-emerald-500/[0.12] dark:border-emerald-400'
                : 'bg-neutral-50/70 hover:bg-neutral-100/60 dark:bg-white/[0.02] dark:hover:bg-white/[0.04] border-neutral-200/80 dark:border-white/[0.06]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-1.5 whitespace-nowrap">
                  🌱 전면 리빌딩 (Rebuild)
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-500 text-white dark:bg-emerald-400 dark:text-neutral-950 whitespace-nowrap shrink-0">
                  전력 -4
                </span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                당해 성적을 양보하고 <b>유망주 실전 출전 기회 보장</b>과 차세대 왕조 구축에 전념합니다.
              </p>
            </div>
            <div className="pt-2.5 border-t border-black/[0.06] dark:border-white/[0.06] text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">
              ✨ <b>점진적 누적</b>: 28세 이하 전원 큰 폭 성장 (+2~+5 OVR) 및 팜 등급 상승
            </div>
          </button>
        </div>
      </div>

      {/* 3. 2026 우리 구단 외국인 엔트리 (총 4명) */}
      <div className="apple-card rounded-3xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-black/[0.06] dark:border-white/[0.06] pb-3 gap-2">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-neutral-900 dark:text-white flex items-center gap-2">
              <span>📋 {currentYear} 우리 구단 외국인 엔트리 (총 4명)</span>
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              현재 엔트리 구성: 투수 <b>{pitcherCount}명</b> / 타자 <b>{batterCount}명</b>
              {emptyCount > 0 && <span className="text-amber-600 dark:text-amber-400 font-bold ml-1.5">(공백 {emptyCount}개)</span>}
            </p>
          </div>

          <div className="shrink-0">
            {ruleError ? (
              <span className="text-xs font-bold text-red-600 bg-red-50 dark:bg-red-950/50 px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-800/60 inline-flex items-center gap-1">
                {ruleError}
              </span>
            ) : (
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800/40 inline-flex items-center gap-1">
                ✓ KBO 포지션 규정 충족 (투·타 혼합 구성)
              </span>
            )}
          </div>
        </div>

        {/* 4개 슬롯 카드 그리드 */}
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
                  subInfo: `신규 영입 (${slot.candidate.previousTeam})`
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
                    ? 'bg-neutral-100/60 dark:bg-white/[0.02] border-neutral-300 dark:border-white/10 border-dashed'
                    : isReplaced
                    ? 'bg-sky-500/[0.05] dark:bg-sky-500/[0.08] border-sky-300 dark:border-sky-500/40 ring-1 ring-sky-400/20'
                    : 'bg-white dark:bg-[#161618] border-neutral-200/90 dark:border-white/[0.08]'
                }`}
              >
                <div>
                  {/* 슬롯 헤더 */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-neutral-200/80 dark:bg-white/10 text-neutral-700 dark:text-neutral-300 font-mono">
                      {slot.label}
                    </span>
                    {isEmpty ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        공백 슬롯
                      </span>
                    ) : isReplaced ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-100 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                        ✈️ 신규 영입 ({slot.cost}억)
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100/80 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
                        ✓ 재계약 ({slot.cost}억)
                      </span>
                    )}
                  </div>

                  {isEmpty ? (
                    <div className="py-5 text-center">
                      <div className="w-9 h-9 mx-auto rounded-full bg-neutral-200/70 dark:bg-white/10 flex items-center justify-center text-neutral-400 dark:text-neutral-500 text-sm mb-2">
                        ✕
                      </div>
                      <h4 className="font-bold text-sm text-neutral-600 dark:text-neutral-400">외인 미사용</h4>
                      <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-0.5">
                        예산 0원 · 전력 -10 OVR 급락
                      </p>
                    </div>
                  ) : (
                    <div>
                      {/* 선수 기본 정보 */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="shrink-0 text-[11px] font-mono font-bold px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-white/10 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-white/10">
                            {displayPlayer.position}
                          </span>
                          <h4 className="font-bold text-base text-neutral-900 dark:text-white truncate">
                            {displayPlayer.name}
                          </h4>
                        </div>
                        <span className="shrink-0 font-mono font-bold text-xs px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-white/10 text-neutral-800 dark:text-neutral-200">
                          OVR {displayPlayer.overall}
                        </span>
                      </div>

                      <div className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono mt-1">
                        {displayPlayer.age}세 · 연봉 {slot.cost}억원
                      </div>

                      {/* 스탯 미니 바 */}
                      <div className="bg-neutral-100/70 dark:bg-white/[0.04] px-2.5 py-1.5 rounded-xl text-[10px] font-mono mt-2.5">
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
                    </div>
                  )}
                </div>

                {/* 슬롯 조작 버튼 */}
                <div className="pt-2 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center gap-2">
                  {!isReSign && (
                    <button
                      type="button"
                      onClick={() => setSlotReSign(slot.slotIndex)}
                      className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 dark:bg-white/10 dark:hover:bg-white/20 text-neutral-800 dark:text-neutral-200 transition"
                    >
                      재계약 복원 ({slot.initialPlayer.salary}억)
                    </button>
                  )}

                  {!isEmpty && (
                    <button
                      type="button"
                      onClick={() => setSlotEmpty(slot.slotIndex)}
                      className="flex-1 py-1.5 rounded-lg text-xs font-medium text-neutral-500 hover:text-red-600 dark:text-neutral-400 dark:hover:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-950/20 transition"
                    >
                      슬롯 비우기 (0원)
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 4. 해외 & 아시아쿼터 스카우트 풀 (6명 후보) */}
      <div className="apple-card rounded-3xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-black/[0.06] dark:border-white/[0.06] pb-3 gap-1">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-neutral-900 dark:text-white flex items-center gap-2">
              <span>✈️ 2026 해외 & 아시아쿼터 스카우트 풀 (후보 선수)</span>
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              영입을 원하는 선수의 <b>[영입할 슬롯 선택]</b>을 누르면 즉시 해당 외인 슬롯이 교체 등록됩니다.
            </p>
          </div>
        </div>

        {/* 6명 후보 카드 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {candidates.map((c) => {
            const assignedSlot = slots.find(s => s.candidate?.id === c.id)
            const isAssigned = !!assignedSlot
            const isPickerOpen = openSlotPickerCandidateId === c.id

            // 이 후보가 들어갈 수 있는 슬롯 목록
            // 아시아쿼터 후보는 슬롯 3(아시아쿼터) 또는 0~2 모두 가능
            // 일반 외인 후보는 슬롯 0, 1, 2 가능
            const eligibleSlots = c.isAsianQuota
              ? slots
              : slots.filter(s => !s.isAsianQuotaSlot)

            return (
              <div
                key={c.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                  isAssigned
                    ? 'bg-sky-500/[0.06] dark:bg-sky-500/[0.09] border-sky-400/80 dark:border-sky-500/50 ring-1 ring-sky-400/20'
                    : 'bg-white dark:bg-[#161618] border-neutral-200/90 dark:border-white/[0.08]'
                }`}
              >
                <div>
                  {/* 카드 상단 배지 */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-white/10 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-white/10">
                        {c.position}
                      </span>
                      {c.isAsianQuota ? (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                          아시아쿼터 ({c.country || '일본/대만'})
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-white/10 text-neutral-600 dark:text-neutral-400">
                          {c.country || '미국'}
                        </span>
                      )}
                    </div>
                    <span className="font-mono font-bold text-xs px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-white/10 text-neutral-800 dark:text-neutral-200">
                      OVR {c.overall}
                    </span>
                  </div>

                  {/* 이름 & 연봉 */}
                  <h4 className="font-bold text-base text-neutral-900 dark:text-white">
                    {c.name}
                  </h4>
                  <div className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono mt-0.5">
                    {c.age}세 · 요구 연봉 {c.salary}억원 · <span className="text-neutral-400">{c.previousTeam}</span>
                  </div>

                  {/* 스카우트 요약 */}
                  <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-2 leading-relaxed italic bg-neutral-50 dark:bg-white/[0.02] p-2 rounded-xl">
                    "{c.scoutSummary}"
                  </p>

                  {/* 스탯 미니 바 */}
                  <div className="bg-neutral-100/70 dark:bg-white/[0.04] px-2.5 py-1.5 rounded-xl text-[10px] font-mono mt-2.5">
                    {c.isPitcher && c.pitcherStats ? (
                      <div className="flex justify-between text-neutral-700 dark:text-neutral-300">
                        <span>구위 <b>{c.pitcherStats.stuff}</b></span>
                        <span>제구 <b>{c.pitcherStats.control}</b></span>
                        <span>체력 <b>{c.pitcherStats.stamina}</b></span>
                      </div>
                    ) : c.batterStats ? (
                      <div className="flex justify-between text-neutral-700 dark:text-neutral-300">
                        <span>컨택 <b>{c.batterStats.contact}</b></span>
                        <span>장타 <b>{c.batterStats.power}</b></span>
                        <span>선구 <b>{c.batterStats.eye}</b></span>
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* 하단 영입 액션 */}
                <div className="pt-2 border-t border-black/[0.06] dark:border-white/[0.06]">
                  {isAssigned ? (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-sky-600 dark:text-sky-400">
                        ✓ {assignedSlot.label}에 등록됨
                      </span>
                      <button
                        type="button"
                        onClick={() => setSlotReSign(assignedSlot.slotIndex)}
                        className="px-2.5 py-1 text-xs font-medium text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-white/10 transition"
                      >
                        영입 취소
                      </button>
                    </div>
                  ) : (
                    <div>
                      {!isPickerOpen ? (
                        <button
                          type="button"
                          onClick={() => setOpenSlotPickerCandidateId(c.id)}
                          className="w-full py-2 rounded-xl text-xs font-semibold bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 transition shadow-sm flex items-center justify-center gap-1.5"
                        >
                          <span>영입할 슬롯 선택</span>
                          <span className="text-[10px]">▾</span>
                        </button>
                      ) : (
                        <div className="space-y-1.5 p-2 rounded-xl bg-neutral-100 dark:bg-white/[0.06] border border-neutral-200 dark:border-white/10 animate-fade-in">
                          <div className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 px-1 flex items-center justify-between">
                            <span>대체할 슬롯 선택</span>
                            <button
                              type="button"
                              onClick={() => setOpenSlotPickerCandidateId(null)}
                              className="text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
                            >
                              ✕
                            </button>
                          </div>
                          <div className="grid grid-cols-1 gap-1">
                            {eligibleSlots.map(s => (
                              <button
                                key={s.slotIndex}
                                type="button"
                                onClick={() => assignCandidateToSlot(s.slotIndex, c)}
                                className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-neutral-200/80 dark:bg-[#202024] dark:hover:bg-[#2c2c30] text-neutral-800 dark:text-neutral-200 transition border border-neutral-200/80 dark:border-white/10 flex items-center justify-between"
                              >
                                <span>{s.label} ({s.initialPlayer.name} 대체)</span>
                                <span className="font-mono text-[10px] text-neutral-500">{s.initialPlayer.salary}억 → {c.salary}억</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 5. 선수단 정리 (베테랑 방출 & 샐러리 삭감) */}
      <div className="apple-card rounded-3xl p-5 sm:p-6 space-y-3">
        <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.06] pb-3">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-neutral-900 dark:text-white flex items-center gap-2">
              <span>✂️ 국내 고연봉 베테랑 선수단 정리 (방출 시 샐러리 70% 환급)</span>
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              32세 이상 또는 연봉 8억 이상의 고액 베테랑을 방출하여 잔여 예산을 확보할 수 있습니다.
            </p>
          </div>
        </div>

        {releasablePlayers.length === 0 ? (
          <div className="text-xs text-neutral-500 py-3 text-center">
            방출 대상 고액 베테랑 선수가 없습니다.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {releasablePlayers.map(p => {
              const isReleased = releasedPlayerIds.includes(p.id)
              const refund = Math.round(p.salary * 0.7)
              return (
                <div
                  key={p.id}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-2 ${
                    isReleased
                      ? 'bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900/40 opacity-75'
                      : 'bg-neutral-50 dark:bg-white/[0.02] border-neutral-200/80 dark:border-white/[0.06]'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="shrink-0 font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-neutral-200/70 dark:bg-white/10 text-neutral-700 dark:text-neutral-300">
                      {p.position}
                    </span>
                    <div className="min-w-0">
                      <div className="font-bold text-neutral-900 dark:text-white truncate">
                        {p.name}
                        {isReleased && <span className="text-[11px] text-red-500 ml-1.5">(방출 예정)</span>}
                      </div>
                      <div className="text-[11px] text-neutral-500 font-mono">
                        {p.age}세 · 연봉 {p.salary}억 · OVR {p.overall}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {isReleased ? (
                      <button
                        type="button"
                        onClick={() => handleToggleRelease(p)}
                        className="px-3 py-1.5 rounded-xl bg-neutral-200 dark:bg-white/10 hover:bg-neutral-300 dark:hover:bg-white/20 text-neutral-800 dark:text-neutral-200 text-xs font-semibold transition"
                      >
                        방출 취소 (+{refund}억)
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleToggleRelease(p)}
                        className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-950/60 border border-red-200 dark:border-red-900/40 text-xs font-semibold transition"
                      >
                        방출 (+{refund}억 확보)
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 6. 하단 마감 및 진행 버튼 */}
      <div className="pt-2 space-y-3">
        {ruleError && (
          <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs font-bold text-red-600 dark:text-red-300 text-center">
            {ruleError}
          </div>
        )}
        {!isBudgetValid && (
          <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs font-bold text-red-600 dark:text-red-300 text-center">
            ⚠️ 가용 예산 초과: 현재 지출 계획으로는 {Math.abs(remainingBudget)}억원이 부족합니다. 외인을 미사용 처리하거나 베테랑을 방출하십시오.
          </div>
        )}

        <button
          type="button"
          onClick={handleFinalize}
          disabled={!!ruleError || !isBudgetValid}
          className={`apple-button-primary w-full py-4 text-base font-semibold shadow-lg transition-transform active:scale-[0.98] ${
            ruleError || !isBudgetValid ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          2026 시즌 스토브리그 확정 및 스프링캠프로 이동 →
        </button>
      </div>
    </div>
  )
}

