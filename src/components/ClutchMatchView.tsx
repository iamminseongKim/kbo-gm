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

type TacticType = 'PINCH_HITTER' | 'PINCH_RUNNER' | 'BUNT' | 'HIT_AND_RUN' | 'CONTACT_SWING'

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
    description: '2루의 둔한 주자를 전문 대주자로 교체합니다. 단타에도 동점 주자가 홈을 밟을 수 있도록 리드를 크게 가져갑니다.',
    riskReward: '단숨에 득점권 찬스 창출 vs 도루 저사 횡사 위험',
    successRate: 64
  },
  {
    type: 'BUNT',
    icon: '🎯',
    title: '희생 번트(Sacrifice Bunt)',
    subtitle: '동점과 역전 주자를 모두 득점권으로',
    description: '1사 1·2루에서 아웃 하나를 주고 두 주자를 진루시킵니다. 성공해도 2사 2·3루가 되므로 다음 타자의 적시타가 반드시 필요합니다.',
    riskReward: '주자 진루는 안정적 vs 2아웃 이후 단 한 번의 승부',
    successRate: 70
  },
  {
    type: 'HIT_AND_RUN',
    icon: '⚡',
    title: '히트 앤드 런(Hit and Run)',
    subtitle: '주자를 움직여 수비 시프트를 흔드는 승부수',
    description: '투구와 동시에 두 주자를 출발시키고 타자에게 반드시 인플레이 타구를 주문합니다. 내야가 움직인 빈 공간을 노립니다.',
    riskReward: '단타에도 동점 가능 vs 헛스윙 시 병살보다 치명적인 주루사',
    successRate: 54
  },
  {
    type: 'CONTACT_SWING',
    icon: '🎯',
    title: '강공 유지 & 컨택 스윙',
    subtitle: '작전 없이 타자의 타격 능력을 믿는다',
    description: '도루나 번트 사인 없이 타자에게 스트라이크 존을 좁혀 치게 합니다. 가장 정석적이지만 병살 위험이 남습니다.',
    riskReward: '장타와 끝내기 가능 vs 내야 땅볼 병살 위험',
    successRate: 61
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

  // 공격 상황에 필요한 우리 팀의 최고 타자 찾기
  const teamPlayers = players.filter(p => p.teamId === userTeam.id)
  const bestBatter = teamPlayers.filter(p => !p.isPitcher).sort((a, b) => b.overall - a.overall)[0]

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
            `2사가 된 뒤 후속 타자마저 중견수 뜬공으로 물러나며 경기가 종료됩니다.`
          ]
        }
      } else if (selectedTactic.type === 'PINCH_RUNNER') {
        if (isSuccess) {
          headline = `⚡ [대주자 적중!] 짧은 안타에 2루에서 홈까지 파고들어 동점!!`
          commentary = [
            `대주자가 타구 판단과 동시에 스타트를 끊었습니다!`,
            `중견수 앞에 떨어진 짧은 안타지만 3루 코치가 거침없이 팔을 돌립니다!`,
            `홈에서 승부... 절묘하게 포수의 태그를 피해 세이프! 이어진 송구 실책으로 1루 주자까지 홈인합니다!`
          ]
        } else {
          headline = `❌ [주루사] 무리한 홈 승부, 포수의 정확한 태그에 아웃!`
          commentary = [
            `짧은 안타에 대주자가 3루를 돌아 홈까지 파고듭니다!`,
            `하지만 상대 중견수의 정확한 송구가 먼저 도착하며 홈에서 태그 아웃, 2사가 됩니다.`,
            `후속 타자의 잘 맞은 타구도 우익수 정면으로 향하며 경기가 끝납니다.`
          ]
        }
      } else if (selectedTactic.type === 'BUNT') {
        if (isSuccess) {
          headline = `🎯 [번트 성공!] 2사 2·3루에서 후속 타자의 끝내기 안타!!`
          commentary = [
            `초구 투수 앞에 부드럽게 떨군 완벽한 롤링 번트!`,
            `타자 주자가 1루에서 아웃되는 사이 두 주자가 진루해 2사 2·3루가 됩니다.`,
            `후속 타자가 2스트라이크에서 우전 적시타! 두 주자가 모두 홈을 밟으며 경기를 끝냅니다!`
          ]
        } else {
          headline = `⚠️ [번트 실패] 선행 주자 3루 포스 아웃, 2사 1·2루`
          commentary = [
            `번트 타구가 너무 강하게 투수 정면으로 굴러갔습니다!`,
            `투수가 빠르게 3루로 송구하여 2루 주자가 3루에서 포스 아웃됩니다.`,
            `2사 1·2루에서 후속 타자가 삼진으로 물러나며 마지막 기회가 무산됩니다.`
          ]
        }
      } else if (selectedTactic.type === 'HIT_AND_RUN') {
        if (isSuccess) {
          headline = `🔥 [히트 앤드 런 적중!] 비어 있는 2루 베이스 옆을 꿰뚫는 끝내기 안타!!`
          commentary = [
            `두 주자가 동시에 스타트를 끊자 2루수와 유격수가 베이스 커버를 들어갑니다!`,
            `타구가 비어 버린 2루수 자리로 빠져나갑니다! 2루 주자에 이어 1루 주자까지 홈으로!`,
            `과감한 작전이 만든 짜릿한 끝내기 역전승입니다!`
          ]
        } else {
          headline = `💧 [작전 실패] 타자 헛스윙, 2루 주자 3루에서 태그 아웃`
          commentary = [
            `바깥쪽 변화구에 배트가 허공을 가르고 두 주자는 이미 스타트를 끊었습니다.`,
            `포수의 3루 송구가 정확히 도착하며 동점 주자가 태그 아웃, 2사가 됩니다.`,
            `이어진 풀카운트 승부에서 다시 헛스윙 삼진, 경기가 그대로 끝납니다.`
          ]
        }
      } else {
        // CONTACT_SWING
        if (isSuccess) {
          headline = `🧠 [정면 승부 적중!] ${bestBatter?.name || '주전 타자'}의 우중간 끝내기 2루타!!`
          commentary = [
            `볼카운트 2-1, 타자가 가운데 낮은 실투를 놓치지 않습니다!`,
            `타구가 우중간을 완전히 가르며 2루 주자와 1루 주자가 차례로 홈을 밟습니다!`,
            `작전 없이 타자의 능력을 믿은 벤치의 선택이 적중했습니다!`
          ]
        } else {
          headline = `⚠️ [병살타] 유격수 정면 땅볼, 6-4-3으로 경기 종료`
          commentary = [
            `초구 싱커를 잡아당겼지만 타구가 유격수 정면으로 향합니다.`,
            `유격수에서 2루수, 다시 1루수로 이어지는 병살타로 마지막 기회가 사라집니다.`
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
          ⚡ 9회말 공격: 끝내기 작전 지휘
        </h2>
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1 max-w-xl mx-auto">
          1점 뒤진 9회말, 1사 1·2루입니다. 지금은 <b>우리 팀의 공격 상황</b>입니다.
          대타, 대주자, 번트, 히트 앤드 런 또는 강공 중 하나를 지시하십시오.
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
              <div className="text-lg font-bold tracking-tight">라이벌 구단 <span className="text-neutral-500">vs</span> {userTeam.name}</div>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white/[0.06] px-4 py-2 rounded-2xl border border-white/10 font-mono">
            <div className="text-center">
              <div className="text-[10px] text-neutral-400">INNING</div>
              <div className="text-sm font-bold text-amber-400">9회말</div>
            </div>
            <div className="text-center border-l border-white/10 pl-4">
              <div className="text-[10px] text-neutral-400">AWAY : HOME</div>
              <div className="text-sm font-bold text-white">5 : 4 <span className="text-rose-400">(-1)</span></div>
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
              2루 주자가 동점 주자, 1루 주자가 끝내기 주자입니다. 단타 하나면 동점, 장타면 그대로 역전승이 가능합니다.
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
              {outcome.isVictory ? '승리 달성! (후반기 모멘텀 상승)' : '석패 (작전 불발)'}
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
              {outcome.isVictory ? '팀 전력 모멘텀 +1.5 & 케미스트리 +8 & 팬심 +10' : '페넌트레이스 패배 기록'}
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
              공격 전술 선택 (택 1)
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
