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
              +45억원 (지원금 및 수익 배분)
            </span>
          </div>
        </div>

        {/* 구단 운영 기조 결산 & 차기 시즌 영향 리포트 */}
        <div className={`p-4 rounded-2xl border text-xs space-y-1.5 ${
          team.stance === 'WIN_NOW'
            ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-800/40 text-amber-900 dark:text-amber-200'
            : team.stance === 'REBUILDING'
            ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-800/40 text-emerald-900 dark:text-emerald-200'
            : 'bg-neutral-50 dark:bg-white/[0.03] border-neutral-200/80 dark:border-white/[0.06] text-neutral-800 dark:text-neutral-200'
        }`}>
          <div className="flex items-center justify-between font-bold">
            <span className="flex items-center gap-1.5 text-sm">
              {team.stance === 'WIN_NOW' && '🏆 윈나우(Win-Now) 기조 결산'}
              {team.stance === 'REBUILDING' && '🌱 리빌딩(Rebuilding) 기조 결산'}
              {(!team.stance || team.stance === 'BALANCED') && '⚖️ 투트랙 밸런스 운영 결산'}
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white dark:bg-black/40 border border-current">
              {team.stance === 'WIN_NOW' && `⚡ 후폭풍 ${team.winNowDebt || 1}단계 누적`}
              {team.stance === 'REBUILDING' && `✨ 리빌딩 ${team.rebuildingStack || 1}년차 누적`}
              {(!team.stance || team.stance === 'BALANCED') && '안정적 기조 유지'}
            </span>
          </div>
          <p className="text-xs leading-relaxed opacity-90">
            {team.stance === 'WIN_NOW' && (
              <>
                올 시즌 우승을 위해 모든 전력을 집중시켰습니다. 그러나 무리한 연투와 출전으로 인해 <b>차기 시즌 베테랑 에이징 커브 가속(추가 하락) 및 팜 피로도</b> 후폭풍이 발생합니다.
              </>
            )}
            {team.stance === 'REBUILDING' && (
              <>
                단기 우승을 양보하고 미래 왕조를 위해 유망주 출전 기회를 극대화했습니다! <b>다음 시즌 스토브리그에서 28세 이하 영건 전원이 대폭 성장(+2~+5 OVR)</b>하여 전력 폭발이 시작됩니다!
              </>
            )}
            {(!team.stance || team.stance === 'BALANCED') && (
              <>
                무리한 베팅이나 성적 희생 없이 균형 있게 시즌을 마쳤습니다. 누적된 후폭풍이 경감되며 정상적인 성장 곡선이 이어집니다.
              </>
            )}
          </p>
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
