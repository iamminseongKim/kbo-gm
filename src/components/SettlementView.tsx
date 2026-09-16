import React from 'react'
import { SeasonSummary, Team } from '../types'

interface SettlementViewProps {
  season: number
  maxSeasons: number
  summary: SeasonSummary
  team: Team
  isFired: boolean
  firedReason?: string
  onNextSeason: () => void
  onFinalEnding: () => void
}

export const SettlementView: React.FC<SettlementViewProps> = ({
  season,
  maxSeasons,
  summary,
  team,
  isFired,
  firedReason,
  onNextSeason,
  onFinalEnding
}) => {
  const isFinalSeason = season >= maxSeasons

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 space-y-4 overflow-y-auto animate-fade-in">
      {/* 결산 헤더 */}
      <div className="text-center py-4 apple-card rounded-3xl">
        <div className="text-[11px] font-semibold tracking-wider text-neutral-500 dark:text-neutral-400 uppercase mb-1">
          Season {season} Settlement
        </div>
        <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
          {team.name} 결산 리포트
        </h2>
      </div>

      {/* 성적 요약 카드 */}
      <div className="apple-card rounded-3xl p-5 sm:p-6 space-y-4">
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-neutral-50 dark:bg-white/[0.03] p-3 rounded-2xl border border-neutral-200/80 dark:border-white/[0.04]">
            <div className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium uppercase tracking-wider mb-1">최종 순위</div>
            <div className="text-lg font-bold text-neutral-900 dark:text-white">{summary.rank}위</div>
          </div>
          <div className="bg-neutral-50 dark:bg-white/[0.03] p-3 rounded-2xl border border-neutral-200/80 dark:border-white/[0.04]">
            <div className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium uppercase tracking-wider mb-1">전적 / 승률</div>
            <div className="text-xs font-bold text-neutral-800 dark:text-neutral-200 mt-1 font-mono">
              {summary.wins}승 {summary.losses}패 ({summary.winRate.toFixed(3)})
            </div>
          </div>
          <div className="bg-neutral-50 dark:bg-white/[0.03] p-3 rounded-2xl border border-neutral-200/80 dark:border-white/[0.04]">
            <div className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium uppercase tracking-wider mb-1">포스트시즌</div>
            <div className="text-xs font-bold text-neutral-800 dark:text-neutral-200 mt-1 truncate">
              {summary.postseasonResult}
            </div>
          </div>
        </div>

        {/* 구단주 & 팬 평가 피드백 */}
        <div className="bg-neutral-50/70 dark:bg-white/[0.02] p-4 rounded-2xl border border-neutral-200/80 dark:border-white/[0.04] space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-neutral-600 dark:text-neutral-400 font-medium">구단주 신뢰도</span>
            <span className={`font-bold ${summary.ownerTrust <= 30 ? 'text-red-500' : 'text-neutral-900 dark:text-white'}`}>
              {summary.ownerTrust}점 ({summary.rank <= 5 ? '+10 성적 보너스' : '-15 부진 감점'})
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-neutral-600 dark:text-neutral-400 font-medium">팬덤 열기</span>
            <span className="font-bold text-neutral-900 dark:text-white">
              {summary.fanSupport}점 ({summary.rank <= 5 ? '+12 열광' : '-8 실망'})
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-neutral-600 dark:text-neutral-400 font-medium">차기 시즌 예산 배정</span>
            <span className="font-bold text-neutral-900 dark:text-white font-mono">
              +40억원 (지원금 및 수익 배분)
            </span>
          </div>
        </div>

        {/* 해고 알림 또는 경고 */}
        {isFired ? (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-500/30 p-4 rounded-2xl text-center space-y-1">
            <div className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">단장직 경질 통보</div>
            <p className="text-xs text-neutral-700 dark:text-neutral-300 font-normal">{firedReason}</p>
          </div>
        ) : summary.ownerTrust <= 25 ? (
          <div className="bg-amber-50 dark:bg-white/[0.04] border border-amber-200 dark:border-red-500/30 p-3 rounded-2xl text-center text-xs text-amber-800 dark:text-red-300 font-medium">
            구단주의 신뢰가 한계에 다다랐습니다. 차기 시즌 가을야구 진출에 실패할 경우 경질됩니다.
          </div>
        ) : null}

        {/* 다음 단계 버튼 */}
        <div className="pt-2">
          {isFired || isFinalSeason ? (
            <button
              onClick={onFinalEnding}
              className="apple-button-primary w-full py-4 text-sm font-semibold shadow-lg transition-transform active:scale-[0.98]"
            >
              최종 단장 커리어 평가 보기
            </button>
          ) : (
            <button
              onClick={onNextSeason}
              className="apple-button-primary w-full py-4 text-sm font-semibold shadow-lg transition-transform active:scale-[0.98]"
            >
              제 {season + 1}시즌 스토브리그 개막
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
