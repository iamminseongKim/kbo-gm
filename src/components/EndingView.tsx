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

  // 통계 계산
  const championships = history.filter(h => h.postseasonResult.includes('우승!')).length
  const postseasons = history.filter(h => h.rank <= 5).length

  // 단장 등급 산출
  let grade = 'B급 단장'
  let gradeColor = 'border-neutral-300 text-neutral-800 bg-neutral-100 dark:border-white/40 dark:text-white dark:bg-white/10'
  let gradeDesc = '구단의 재정과 성적을 무난하게 이끌었습니다.'

  if (isFired) {
    grade = 'F급 조기 경질'
    gradeColor = 'border-red-300 text-red-700 bg-red-50 dark:border-red-500/50 dark:text-red-400 dark:bg-red-950/30'
    gradeDesc = firedReason || '성적 부진 및 구단주와의 불화로 중도 해임되었습니다.'
  } else if (championships >= 2) {
    grade = 'S급 전설의 명단장'
    gradeColor = 'border-amber-400 text-amber-900 bg-amber-100 dark:border-amber-400/60 dark:text-amber-300 dark:bg-amber-400/20 font-black'
    gradeDesc = 'KBO 역사에 남을 왕조를 구축한 역대 최고의 명단장입니다.'
  } else if (championships >= 1 || postseasons >= 5) {
    grade = 'A급 명문구단 사령관'
    gradeColor = 'border-blue-400 text-blue-900 bg-blue-100 dark:border-blue-400/60 dark:text-blue-300 dark:bg-blue-500/20'
    gradeDesc = '구단과 팬 모두에게 인정받으며 강팀의 기틀을 확립했습니다.'
  } else if (postseasons >= 3) {
    grade = 'B급 준수한 살림꾼'
    gradeColor = 'border-neutral-300 text-neutral-800 bg-neutral-100 dark:border-white/40 dark:text-neutral-200 dark:bg-white/10'
    gradeDesc = '한정된 자원으로 꾸준히 5강 경쟁을 펼쳤습니다.'
  } else {
    grade = 'C급 단장'
    gradeColor = 'border-neutral-200 text-neutral-600 bg-neutral-50 dark:border-white/20 dark:text-neutral-400 dark:bg-white/5'
    gradeDesc = '가을야구의 문턱에서 매번 아쉽게 고배를 마셨습니다.'
  }

  // 워들 스타일 공유 텍스트 생성
  const generateShareText = () => {
    const lines = [
      `KBO GM SIMULATOR — Daily #${seed}`,
      `Club: ${team.name} (${history.length} Seasons)`,
      `Record: 우승 ${championships}회 · 가을야구 ${postseasons}회`,
      ''
    ]

    history.forEach(h => {
      const mark = h.postseasonResult.includes('우승!')
        ? '[CHAMP]'
        : h.rank <= 5
        ? '[PS]'
        : '[OUT]'
      lines.push(`${mark} 시즌 ${h.season}: ${h.rank}위 (${h.wins}승 ${h.losses}패)`)
    })

    lines.push('')
    lines.push(`Rating: ${grade}`)
    return lines.join('\n')
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generateShareText())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 space-y-4 overflow-y-auto animate-fade-in">
      {/* 등급 배너 */}
      <div className="text-center py-6 apple-card rounded-3xl p-6">
        <div className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
          {history.length} Seasons Career Summary
        </div>
        <div className={`text-2xl font-bold inline-block px-5 py-2 rounded-2xl border my-2 ${gradeColor}`}>
          {grade}
        </div>
        <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 mt-2 max-w-sm mx-auto leading-relaxed font-normal">
          {gradeDesc}
        </p>

        <div className="mt-4 flex justify-center gap-6 text-xs font-semibold">
          <span className="text-neutral-900 dark:text-white">우승 {championships}회</span>
          <span className="text-neutral-400">|</span>
          <span className="text-neutral-700 dark:text-neutral-300">포스트시즌 {postseasons}회</span>
        </div>
      </div>

      {/* 시즌별 성적 히스토리 */}
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
                {h.postseasonResult}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 공유 및 재도전 버튼 */}
      <div className="space-y-2 pt-2">
        <button
          onClick={handleCopy}
          className="apple-button-secondary w-full py-4 text-sm font-semibold transition-transform active:scale-[0.98]"
        >
          {copied ? '리포트 복사 완료' : '커리어 결과 클립보드 복사'}
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
