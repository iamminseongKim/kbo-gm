import React, { useState } from 'react'
import { SeasonSummary, Team } from '../types'

interface EndingViewProps {
  team: Team
  history: SeasonSummary[]
  isFired: boolean
  firedReason?: string
  seed: string
  onRestart: () => void
}

export const EndingView: React.FC<EndingViewProps> = ({
  team,
  history,
  isFired,
  firedReason,
  seed,
  onRestart
}) => {
  const [copied, setCopied] = useState(false)

  // 1. 기본 통산 통계 계산
  const totalWins = history.reduce((sum, h) => sum + h.wins, 0)
  const totalLosses = history.reduce((sum, h) => sum + h.losses, 0)
  const totalGames = totalWins + totalLosses
  const totalWinRate = totalGames > 0 ? (totalWins / totalGames) : 0
  const championships = history.filter(h => h.postseasonResult.includes('우승!')).length
  const postseasons = history.filter(h => h.rank <= 5).length

  // 2. 디테일한 단장 종합 점수 (GM Rating System) 계산
  // (1) 페넌트레이스 성적 점수: 승리당 10점 + 순위별 차등 보너스
  let rankBonusTotal = 0
  history.forEach(h => {
    if (h.rank === 1) rankBonusTotal += 350
    else if (h.rank === 2) rankBonusTotal += 250
    else if (h.rank === 3) rankBonusTotal += 180
    else if (h.rank === 4) rankBonusTotal += 120
    else if (h.rank === 5) rankBonusTotal += 70
    else if (h.rank <= 7) rankBonusTotal += 20
    else if (h.rank === 10) rankBonusTotal -= 50
  })
  const pennantScore = (totalWins * 10) + rankBonusTotal

  // (2) 가을야구 & 우승 보너스
  const postseasonScore = (championships * 1200) + (postseasons * 300)

  // (3) 구단 경영 & 신뢰도 점수 (재정 건전성 + 구단주 신뢰 + 팬덤)
  const budgetBonus = Math.max(-500, Math.round(team.budget * 5))
  const trustBonus = team.ownerTrust * 10
  const fanBonus = team.fanSupport * 10
  const farmBonus = team.farmSystem * 8
  const managementScore = budgetBonus + trustBonus + fanBonus + farmBonus

  // (4) 완주 보너스 또는 경질 감점
  const completionBonus = isFired ? -1500 : (history.length >= 7 ? 500 : 0)

  // 총점 합산 (음수 방지)
  const totalGMScore = Math.max(0, pennantScore + postseasonScore + managementScore + completionBonus)

  // 3. 점수 기반 등급 및 상위 백분위 산출
  let grade = 'B급 단장'
  let percentileStr = '상위 50%'
  let gradeColor = 'border-neutral-300 text-neutral-800 bg-neutral-100 dark:border-white/40 dark:text-white dark:bg-white/10'
  let gradeDesc = '구단의 재정과 성적을 무난하게 이끌며 평온한 임기를 마쳤습니다.'

  if (isFired) {
    grade = 'F급 조기 경질'
    percentileStr = '하위 5%'
    gradeColor = 'border-red-300 text-red-700 bg-red-50 dark:border-red-500/50 dark:text-red-400 dark:bg-red-950/30'
    gradeDesc = firedReason || '성적 부진 및 구단주와의 불화로 불명예 퇴진했습니다.'
  } else if (totalGMScore >= 9000) {
    grade = '명예의 전당 (S+)'
    percentileStr = '상위 0.3%'
    gradeColor = 'border-amber-400 text-amber-900 bg-amber-100 dark:border-amber-400/80 dark:text-amber-300 dark:bg-amber-400/20 font-black ring-2 ring-amber-400/40'
    gradeDesc = 'KBO 44년 역사상 가장 위대한 왕조를 건설한 전설적인 단장입니다.'
  } else if (totalGMScore >= 7800) {
    grade = 'S급 전설의 명단장'
    percentileStr = '상위 2.5%'
    gradeColor = 'border-amber-400 text-amber-900 bg-amber-100 dark:border-amber-400/60 dark:text-amber-300 dark:bg-amber-400/20 font-black'
    gradeDesc = '탁월한 스카우팅과 전술로 구단을 황금기로 이끈 역대급 명단장입니다.'
  } else if (totalGMScore >= 6600) {
    grade = 'A+급 명문구단 사령관'
    percentileStr = '상위 9%'
    gradeColor = 'border-blue-400 text-blue-900 bg-blue-100 dark:border-blue-400/60 dark:text-blue-300 dark:bg-blue-500/20 font-bold'
    gradeDesc = '구단과 팬 모두에게 찬사를 받으며 지속 가능한 강팀의 반열에 올렸습니다.'
  } else if (totalGMScore >= 5400) {
    grade = 'A급 유능한 단장'
    percentileStr = '상위 22%'
    gradeColor = 'border-blue-300 text-blue-800 bg-blue-50 dark:border-blue-500/40 dark:text-blue-200 dark:bg-blue-500/10'
    gradeDesc = '합리적인 경영과 안정적인 전력으로 꾸준히 가을야구 경쟁력을 유지했습니다.'
  } else if (totalGMScore >= 4200) {
    grade = 'B급 준수한 살림꾼'
    percentileStr = '상위 45%'
    gradeColor = 'border-neutral-300 text-neutral-800 bg-neutral-100 dark:border-white/40 dark:text-neutral-200 dark:bg-white/10'
    gradeDesc = '한정된 자원으로 5강 경쟁을 펼쳤으나 결정적 승부처에서 아쉬움을 남겼습니다.'
  } else {
    grade = 'C급 평범한 단장'
    percentileStr = '상위 75%'
    gradeColor = 'border-neutral-200 text-neutral-600 bg-neutral-50 dark:border-white/20 dark:text-neutral-400 dark:bg-white/5'
    gradeDesc = '리빌딩의 결실을 맺지 못한 채 아쉽게 임기를 마무리했습니다.'
  }

  // 4. SNS / 커뮤니티 공유용 텍스트 생성 (워들/점수 비교 포맷)
  const generateShareText = () => {
    const lines = [
      `⚾ KBO GM 단장 시뮬레이터 #Daily-${seed}`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `구단: ${team.name} (${history.length}시즌 완주)`,
      `🏆 최종 GM 평점: ${totalGMScore.toLocaleString()}점 [${percentileStr} | ${grade}]`,
      ``,
      `📊 통산 전적: ${totalWins}승 ${totalLosses}패 (승률 ${totalWinRate.toFixed(3)})`,
      `🏆 한국시리즈 우승: ${championships}회 | 🍂 가을야구: ${postseasons}회`,
      `💼 경영 지표: 예산 ${team.budget}억 | 신뢰도 ${team.ownerTrust} | 팬심 ${team.fanSupport}`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━`
    ]

    history.forEach(h => {
      const mark = h.postseasonResult.includes('우승!')
        ? '🏆 우승'
        : h.rank <= 5
        ? '🍂 PS'
        : '❌ 탈락'
      lines.push(`시즌 ${h.season}: ${h.rank}위 (${h.wins}승 ${h.losses}패) ${mark}`)
    })

    lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━`)
    lines.push(`당신도 KBO 단장에 도전해보세요!`)
    return lines.join('\n')
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generateShareText())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 space-y-4 overflow-y-auto animate-fade-in">
      {/* 1. 최상단 점수 스코어보드 */}
      <div className="text-center py-6 apple-card rounded-3xl p-6 relative overflow-hidden">
        <div className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1">
          {history.length} Seasons Final GM Evaluation
        </div>

        {/* 대형 점수 표시 */}
        <div className="my-2">
          <div className="text-4xl sm:text-5xl font-black tracking-tight text-neutral-900 dark:text-white font-mono">
            {totalGMScore.toLocaleString()}
            <span className="text-lg sm:text-xl font-bold ml-1 text-neutral-500 dark:text-neutral-400">점</span>
          </div>
          <div className="text-xs font-bold text-neutral-500 dark:text-neutral-400 mt-0.5">
            전체 단장 중 <span className="text-neutral-900 dark:text-white font-extrabold underline">{percentileStr}</span> 기록
          </div>
        </div>

        {/* 등급 뱃지 */}
        <div className={`text-xl sm:text-2xl font-bold inline-block px-5 py-2 rounded-2xl border my-2 shadow-sm ${gradeColor}`}>
          {grade}
        </div>

        <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 mt-2 max-w-md mx-auto leading-relaxed font-normal">
          {gradeDesc}
        </p>

        {/* 통산 요약 배너 */}
        <div className="mt-4 pt-3 border-t border-black/[0.06] dark:border-white/[0.06] flex justify-center gap-6 text-xs font-semibold">
          <span className="text-neutral-900 dark:text-white">우승 {championships}회</span>
          <span className="text-neutral-400">|</span>
          <span className="text-neutral-700 dark:text-neutral-300">가을야구 {postseasons}회</span>
          <span className="text-neutral-400">|</span>
          <span className="text-neutral-500 font-mono">{totalWins}승 {totalLosses}패 ({totalWinRate.toFixed(3)})</span>
        </div>
      </div>

      {/* 2. 4대 세부 평점 브레이크다운 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
        <div className="apple-card p-3 rounded-2xl border border-neutral-200 dark:border-white/[0.08]">
          <div className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium">정규시즌 성적</div>
          <div className="text-base font-bold text-neutral-900 dark:text-white font-mono mt-0.5">
            +{pennantScore.toLocaleString()}
          </div>
          <div className="text-[10px] text-neutral-400 font-mono mt-0.5">{totalWins}승 · 순위보너스</div>
        </div>

        <div className="apple-card p-3 rounded-2xl border border-neutral-200 dark:border-white/[0.08]">
          <div className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium">가을야구 & 우승</div>
          <div className="text-base font-bold text-amber-600 dark:text-amber-400 font-mono mt-0.5">
            +{postseasonScore.toLocaleString()}
          </div>
          <div className="text-[10px] text-neutral-400 font-mono mt-0.5">우승 {championships}회 · PS {postseasons}회</div>
        </div>

        <div className="apple-card p-3 rounded-2xl border border-neutral-200 dark:border-white/[0.08]">
          <div className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium">구단 경영 실적</div>
          <div className="text-base font-bold text-neutral-900 dark:text-white font-mono mt-0.5">
            +{managementScore.toLocaleString()}
          </div>
          <div className="text-[10px] text-neutral-400 font-mono mt-0.5">예산{team.budget}억 · 신뢰{team.ownerTrust}</div>
        </div>

        <div className="apple-card p-3 rounded-2xl border border-neutral-200 dark:border-white/[0.08]">
          <div className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium">임기 완주 보너스</div>
          <div className={`text-base font-bold font-mono mt-0.5 ${completionBonus < 0 ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {completionBonus > 0 ? `+${completionBonus}` : completionBonus}
          </div>
          <div className="text-[10px] text-neutral-400 font-mono mt-0.5">{isFired ? '중도 해임 감점' : '7시즌 완주'}</div>
        </div>
      </div>

      {/* 3. 시즌별 단장 커리어 기록 테이블 */}
      <div className="apple-card rounded-3xl p-5 sm:p-6 space-y-3 text-xs">
        <h3 className="font-bold text-neutral-900 dark:text-white text-sm border-b border-black/[0.06] dark:border-white/[0.06] pb-3">
          시즌별 단장 커리어 기록
        </h3>
        <div className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
          {history.map(h => (
            <div key={h.season} className="py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-neutral-500 dark:text-neutral-400">시즌 {h.season}</span>
                <span className="font-bold text-neutral-900 dark:text-white">{h.rank}위</span>
                <span className="text-neutral-500 dark:text-neutral-400 font-mono text-[11px]">
                  ({h.wins}승 {h.losses}패)
                </span>
              </div>
              <span className={`text-[11px] font-semibold ${
                h.postseasonResult.includes('우승') ? 'text-amber-600 dark:text-amber-400 font-bold' :
                h.rank <= 5 ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-500 dark:text-neutral-400'
              }`}>
                {h.postseasonResult.includes('우승') ? '🏆 ' : ''}{h.postseasonResult}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. 공유 및 재도전 버튼 */}
      <div className="space-y-2 pt-2">
        <button
          onClick={handleCopy}
          className="apple-button-secondary w-full py-4 text-sm font-semibold transition-transform active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <span>📋</span>
          <span>{copied ? 'GM 평가 리포트 복사 완료! (SNS에 붙여넣기)' : '단장 종합 성적표 클립보드 복사 (친구와 점수 비교)'}</span>
        </button>

        <button
          onClick={onRestart}
          className="apple-button-primary w-full py-4 text-sm font-semibold shadow-lg transition-transform active:scale-[0.98]"
        >
          새로운 구단으로 다시 시작
        </button>
      </div>
    </div>
  )
}
