import React, { useState } from 'react'
import { Team, Player } from '../types'
import { PRNG } from '../engine/prng'

interface ClutchMatchViewProps {
  season: number
  userTeam: Team
  players: Player[]
  prng: PRNG
  onFinishClutchMatch: (isVictory: boolean, outcomeDesc: string) => void
}

type TacticType = 'PINCH_HITTER' | 'PINCH_RUNNER' | 'BUNT' | 'PITCHER_CHANGE' | 'INTENTIONAL_WALK'

interface TacticOption {
  type: TacticType
  icon: string
  title: string
  subtitle: string
  description: string
  riskReward: string
  successRate: number // 0~100
}

const TACTIC_OPTIONS: TacticOption[] = [
  {
    type: 'PINCH_HITTER',
    icon: '💥',
    title: '대타(Pinch Hitter) 전격 투입',
    subtitle: '장타와 끝내기를 노리는 빅볼 승부수',
    description: '벤치에 대기 중이던 클러치 거포를 대타로 내세워 단숨에 담장을 넘기거나 주자를 쓸어담는 장타를 노립니다.',
    riskReward: '높은 리턴(역전타/홈런) vs 삼진 및 헛스윙 위험',
    successRate: 58
  },
  {
    type: 'PINCH_RUNNER',
    icon: '🏃',
    title: '대주자(Pinch Runner) & 기습 도루',
    subtitle: '발 빠른 스피드스타의 허를 찌르는 주루',
    description: '1루의 둔한 주자를 빼고 전문 대주자를 투입하여, 상대 배터리의 방심을 틈타 2루/3루 기습 도루를 감행합니다.',
    riskReward: '단숨에 득점권 찬스 창출 vs 도루 저사 횡사 위험',
    successRate: 64
  },
  {
    type: 'BUNT',
    icon: '🎯',
    title: '희생 번트(Sacrifice Bunt) 작전',
    subtitle: '확실한 스몰볼로 주자 득점권 이동',
    description: '타자에게 안전한 희생 번트를 지시하여 아웃카운트 하나와 주자의 진루를 맞바꿔 1사 2,3루 찬스를 만듭니다.',
    riskReward: '가장 높은 성공률(80%+) vs 잔루 발생 가능성',
    successRate: 78
  },
  {
    type: 'PITCHER_CHANGE',
    icon: '🛡️',
    title: '투수 교체 & 수호신 전격 조기 등판',
    subtitle: '155km 돌직구 마무리 투수로 승부 봉쇄',
    description: '흔들리는 선발/불펜을 즉시 내리고 팀의 가장 강력한 클로저를 조기 등판시켜 위기를 삼진으로 잠재웁니다.',
    riskReward: '압도적인 구위로 탈삼진 vs 연투 피로도 위험',
    successRate: 68
  },
  {
    type: 'INTENTIONAL_WALK',
    icon: '🚫',
    title: '자동 고의사구(Intentional Walk) 만루 작전',
    subtitle: '상대 4번 타자를 거르고 병살타 유도',
    description: '폭발적인 상대 간판 슬러거와의 정면 승부를 피하고 만루를 채운 뒤, 6-4-3 내야 땅볼 병살타를 노립니다.',
    riskReward: '수비 포스 아웃 용이 vs 밀어내기 실점 압박',
    successRate: 62
  }
]

export const ClutchMatchView: React.FC<ClutchMatchViewProps> = ({
  season,
  userTeam,
  players,
  prng,
  onFinishClutchMatch
}) => {
  const [selectedTactic, setSelectedTactic] = useState<TacticOption | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)
  const [outcome, setOutcome] = useState<{
    isVictory: boolean
    headline: string
    commentary: string[]
  } | null>(null)

  // 우리 팀의 에이스/거포/클로저 찾기
  const teamPlayers = players.filter(p => p.teamId === userTeam.id)
  const bestBatter = teamPlayers.filter(p => !p.isPitcher).sort((a, b) => b.overall - a.overall)[0]
  const bestPitcher = teamPlayers.filter(p => p.isPitcher).sort((a, b) => b.overall - a.overall)[0]

  // 작전 실행
  const handleExecuteTactic = () => {
    if (!selectedTactic || isSimulating) return
    setIsSimulating(true)

    setTimeout(() => {
      // 성공 확률 판정 (구단 케미스트리 및 선수 스탯 보정)
      const chemistryBoost = (userTeam.chemistry - 80) * 0.2
      const roll = prng.nextInt(1, 100)
      const adjustedRate = Math.min(92, Math.max(25, selectedTactic.successRate + chemistryBoost))
      const isSuccess = roll <= adjustedRate

      let headline = ''
      let commentary: string[] = []

      if (selectedTactic.type === 'PINCH_HITTER') {
        if (isSuccess) {
          headline = `🎉 [대타 적중!] ${bestBatter?.name || '대타 요원'}의 통렬한 역전 결승타 폭발!!`
          commentary = [
            `볼카운트 2-2에서 5구째 실투성 패스트볼을 놓치지 않았습니다!`,
            `경쾌한 타구음과 함께 타구가 좌중간 펜스를 직접 강타합니다!`,
            `2루 주자 홈인! 1루 주자도 거침없이 3루를 돌아 홈으로 쇄도... 세이프!!`,
            `더그아웃 전원이 뛰어나옵니다! 관중석이 열광의 도가니에 빠집니다!`
          ]
        } else {
          headline = `💧 [대타 범타] 날카로운 삼진 아웃... 찬스 무산`
          commentary = [
            `상대 투수의 152km 몸쪽 꽉 찬 하이 패스트볼에 헛스윙 삼진!`,
            `대타 카드가 무위로 돌아가며 아쉽게 이닝이 종료됩니다.`
          ]
        }
      } else if (selectedTactic.type === 'PINCH_RUNNER') {
        if (isSuccess) {
          headline = `⚡ [대주자 대성공!] 기습 3루 도루 성공 & 상대 포수 송구 실책으로 홈인!!`
          commentary = [
            `투수의 투구 동작이 시작되자마자 2루 주자가 번개처럼 스타트를 끊었습니다!`,
            `포수가 급하게 3루로 송구하지만 완벽한 헤드퍼스트 슬라이딩 세이프!!`,
            `송구가 외야로 빠진 틈을 타 대주자가 홈까지 질주하여 득점에 성공합니다!`
          ]
        } else {
          headline = `❌ [도루 저사] 상대 배터리의 피치아웃에 걸려 태그 아웃!`
          commentary = [
            `상대 벤치에서 도루를 정확히 간파하고 피치아웃을 지시했습니다!`,
            `2루에서 억울하게 태그아웃되며 공격의 흐름이 끊깁니다.`
          ]
        }
      } else if (selectedTactic.type === 'BUNT') {
        if (isSuccess) {
          headline = `🎯 [번트 완벽 성공!] 3루 라인 타고 흐르는 절묘한 희생 번트!`
          commentary = [
            `초구 투수 앞에 부드럽게 떨군 완벽한 롤링 번트!`,
            `1루에 타자가 던져지는 사이 1, 2루 주자가 모두 안전하게 득점권 진루 성공!`,
            `이어지는 후속 타자의 희생 플라이로 천금 같은 결승점을 뽑아냅니다!`
          ]
        } else {
          headline = `⚠️ [번트 실패] 타구가 투수 정면으로 향하며 3루 포스 아웃`
          commentary = [
            `번트 타구가 너무 강하게 투수 정면으로 굴러갔습니다!`,
            `투수가 빠르게 3루로 송구하여 2루 주자가 3루에서 포스 아웃됩니다.`
          ]
        }
      } else if (selectedTactic.type === 'PITCHER_CHANGE') {
        if (isSuccess) {
          headline = `🔥 [수호신 등판 성공!] ${bestPitcher?.name || '마무리 투수'}의 3타자 연속 K-K-K 클로징!!`
          commentary = [
            `마운드에 오른 수호신이 155km 묵직한 돌직구로 상대 4번 타자를 헛스윙 삼진 처리합니다!`,
            `이어지는 타자마저 예리한 명품 슬라이더로 3구 삼진!`,
            `포효하는 마무리 투수! 짜릿한 1점차 승리를 완벽하게 지켜냅니다!`
          ]
        } else {
          headline = `⚡ [혈투] 빗맞은 바가지 안타를 허용하며 동점 헌납`
          commentary = [
            `완벽하게 먹힌 타구였으나 빗맞아 1루수와 우익수 사이에 떨어지는 행운의 안타가 됩니다.`,
            `아쉽게 승리를 지키지 못하고 경기는 팽팽한 연장으로 이어집니다.`
          ]
        }
      } else {
        // INTENTIONAL_WALK
        if (isSuccess) {
          headline = `🧠 [고의사구 적중!] 그림 같은 6-4-3 내야 땅볼 병살타 완성!!`
          commentary = [
            `만루를 채운 벤치의 승부수가 완벽하게 적중했습니다!`,
            `낮게 제구된 싱커볼에 상대 5번 타자의 방망이가 덜컥 걸렸습니다!`,
            `유격수 포구 -> 2루수 토스 -> 1루 송구 아웃! 깔끔한 6-4-3 더블플레이로 경기 종료!!`
          ]
        } else {
          headline = `⚠️ [밀어내기 위기] 풀카운트 승부 끝 밀어내기 볼넷 허용`
          commentary = [
            `만루의 중압감 속에 제구가 흔들리며 풀카운트 끝에 아쉬운 밀어내기 볼넷을 내줍니다.`
          ]
        }
      }

      setOutcome({
        isVictory: isSuccess,
        headline,
        commentary
      })
      setIsSimulating(false)
    }, 1100)
  }

  const handleProceed = () => {
    if (!outcome) return
    onFinishClutchMatch(outcome.isVictory, outcome.headline)
  }

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 space-y-5 overflow-y-auto animate-fade-in">
      {/* 헤더 브리핑 */}
      <div className="text-center py-4 apple-card rounded-3xl p-5">
        <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 tracking-wider uppercase">
          Mid-Season Clutch Tactical Command · {2025 + season}
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white mt-1">
          ⚡ 9회말 승부처: 현장 작전 지휘
        </h2>
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1 max-w-xl mx-auto">
          페넌트레이스 순위를 좌우할 운명의 1점차 승부처 경기입니다. 
          더그아웃의 최고 사령탑으로서 <b>대타, 대주자, 번트, 투수교체</b> 등 결정적인 승부수를 던지십시오!
        </p>
      </div>

      {/* 실시간 전광판 & 다이아몬드 그래픽 카드 */}
      <div className="apple-card rounded-3xl p-5 sm:p-6 bg-gradient-to-b from-neutral-900 to-neutral-950 text-white shadow-xl border border-white/10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <span
              className="w-4 h-4 rounded-full ring-2 ring-white/30"
              style={{ backgroundColor: userTeam.primaryColor }}
            />
            <div>
              <div className="text-xs text-neutral-400 font-mono">2026 KBO 정규리그 승부처 라이벌전</div>
              <div className="text-lg font-bold tracking-tight">{userTeam.name} vs 라이벌 구단</div>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white/[0.06] px-4 py-2 rounded-2xl border border-white/10 font-mono">
            <div className="text-center">
              <div className="text-[10px] text-neutral-400">INNING</div>
              <div className="text-sm font-bold text-amber-400">9회말</div>
            </div>
            <div className="text-center border-l border-white/10 pl-4">
              <div className="text-[10px] text-neutral-400">SCORE</div>
              <div className="text-sm font-bold text-white">4 : 5 (1점차)</div>
            </div>
            <div className="text-center border-l border-white/10 pl-4">
              <div className="text-[10px] text-neutral-400">OUT</div>
              <div className="text-sm font-bold text-red-400">1 OUT</div>
            </div>
          </div>
        </div>

        {/* 주자 상황 그래픽 다이어그램 */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-around gap-4">
          <div className="relative w-28 h-28 flex items-center justify-center">
            {/* 2루 주자 (점등) */}
            <div className="absolute top-2 w-7 h-7 rounded-md bg-amber-400 border-2 border-white shadow-[0_0_12px_rgba(251,191,36,0.8)] rotate-45 flex items-center justify-center">
              <span className="-rotate-45 text-[10px] font-bold text-neutral-950">2루</span>
            </div>
            {/* 3루 (비어있음) */}
            <div className="absolute left-2 w-7 h-7 rounded-md bg-white/10 border border-white/20 rotate-45 flex items-center justify-center">
              <span className="-rotate-45 text-[10px] text-neutral-400">3루</span>
            </div>
            {/* 1루 주자 (점등) */}
            <div className="absolute right-2 w-7 h-7 rounded-md bg-amber-400 border-2 border-white shadow-[0_0_12px_rgba(251,191,36,0.8)] rotate-45 flex items-center justify-center">
              <span className="-rotate-45 text-[10px] font-bold text-neutral-950">1루</span>
            </div>
            {/* 홈 베이스 */}
            <div className="absolute bottom-2 w-7 h-7 rounded-md bg-white/20 border border-white/40 rotate-45 flex items-center justify-center">
              <span className="-rotate-45 text-[10px] text-white">홈</span>
            </div>
          </div>

          <div className="text-xs space-y-1 text-neutral-300 max-w-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span className="font-bold text-white">1사 주자 1, 2루 역전 찬스!</span>
            </div>
            <p className="text-neutral-400 leading-relaxed text-[11px]">
              안타 하나면 동점, 장타면 그대로 끝내기 역전승이 가능한 절체절명의 찬스입니다.
              단장의 전술 지시 하나에 팀의 운명이 걸려 있습니다.
            </p>
          </div>
        </div>
      </div>

      {/* 결과 화면 (작전 실행 완료 후) */}
      {outcome ? (
        <div className="apple-card rounded-3xl p-5 sm:p-6 space-y-4 animate-fade-in border-2 border-neutral-900 dark:border-white">
          <div className="text-center space-y-1.5 pb-3 border-b border-black/[0.06] dark:border-white/[0.06]">
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${
              outcome.isVictory
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                : 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
            }`}>
              {outcome.isVictory ? '승리 달성! (+3승 모멘텀)' : '석패 (작전 불발)'}
            </span>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white tracking-tight pt-1">
              {outcome.headline}
            </h3>
          </div>

          <div className="bg-neutral-50 dark:bg-white/[0.02] p-4 rounded-2xl border border-neutral-200/80 dark:border-white/[0.06] space-y-2 font-mono text-xs text-neutral-700 dark:text-neutral-300">
            {outcome.commentary.map((line, idx) => (
              <div key={idx} className="flex items-start gap-2 leading-relaxed">
                <span className="text-amber-500 font-bold shrink-0">🎙️</span>
                <span>{line}</span>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-2xl bg-neutral-100 dark:bg-white/[0.04] text-xs flex items-center justify-between">
            <span className="text-neutral-600 dark:text-neutral-400">경기 결과 반영:</span>
            <span className="font-bold text-neutral-900 dark:text-white">
              {outcome.isVictory ? '페넌트레이스 +3승 & 케미스트리 +8 & 팬심 +10' : '페넌트레이스 패배 기록'}
            </span>
          </div>

          <button
            onClick={handleProceed}
            className="apple-button-primary w-full py-4 text-sm font-semibold shadow-lg transition-transform active:scale-[0.98]"
          >
            144경기 페넌트레이스 최종 순위 시뮬레이션 결과 보기 →
          </button>
        </div>
      ) : (
        /* 작전 선택 카드 리스트 */
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
              더그아웃 전술 선택 (택 1)
            </span>
            <span className="text-xs text-neutral-500">
              구단 케미스트리: {userTeam.chemistry}점 (성공률 보정 적용)
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {TACTIC_OPTIONS.map((opt) => {
              const isSelected = selectedTactic?.type === opt.type
              return (
                <button
                  key={opt.type}
                  type="button"
                  onClick={() => setSelectedTactic(opt)}
                  className={`p-4 rounded-2xl border text-left transition-all flex flex-col gap-1.5 ${
                    isSelected
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-black border-transparent ring-2 ring-neutral-900/30 dark:ring-white/40 shadow-md'
                      : 'bg-neutral-50 hover:bg-neutral-100 dark:bg-white/[0.02] dark:hover:bg-white/[0.04] border-neutral-200/80 dark:border-white/[0.06]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{opt.icon}</span>
                      <div>
                        <span className={`text-sm font-bold ${isSelected ? 'text-white dark:text-black' : 'text-neutral-900 dark:text-white'}`}>
                          {opt.title}
                        </span>
                        <span className={`text-xs ml-2 ${isSelected ? 'text-neutral-300 dark:text-neutral-700' : 'text-neutral-500'}`}>
                          ({opt.subtitle})
                        </span>
                      </div>
                    </div>
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                      isSelected
                        ? 'bg-white/20 text-white dark:bg-black/20 dark:text-black'
                        : 'bg-neutral-200 text-neutral-800 dark:bg-white/10 dark:text-neutral-200'
                    }`}>
                      성공률 ~{opt.successRate}%
                    </span>
                  </div>

                  <p className={`text-xs leading-relaxed ${isSelected ? 'text-neutral-200 dark:text-neutral-800' : 'text-neutral-600 dark:text-neutral-400'}`}>
                    {opt.description}
                  </p>

                  <div className={`text-[11px] font-semibold mt-0.5 ${isSelected ? 'text-amber-300 dark:text-amber-700' : 'text-neutral-500 dark:text-neutral-400'}`}>
                    ⚖️ {opt.riskReward}
                  </div>
                </button>
              )
            })}
          </div>

          <div className="pt-2">
            <button
              onClick={handleExecuteTactic}
              disabled={!selectedTactic || isSimulating}
              className={`apple-button-primary w-full py-4 text-sm font-semibold shadow-lg transition-transform active:scale-[0.98] ${
                !selectedTactic || isSimulating ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSimulating ? '현장 작전 전개 중... 타석 진행...' : selectedTactic ? `"${selectedTactic.title}" 작전 지시 내리기` : '작전을 선택하십시오'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
