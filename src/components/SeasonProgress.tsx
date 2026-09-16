import React from 'react'
import { GamePhase } from '../types'

interface SeasonProgressProps {
  phase: GamePhase
}

const STEPS: { label: string; phases: GamePhase[] }[] = [
  { label: '구성', phases: ['STOVE_LEAGUE', 'PRESEASON'] },
  { label: '전반기', phases: ['FIRST_HALF_EVENTS', 'MIDSEASON_REPORT', 'FOREIGN_REPLACEMENT', 'CALLUP_DECISION'] },
  { label: '시장', phases: ['ROOKIE_DRAFT', 'TRADE_DEADLINE', 'SECOND_HALF_EVENTS'] },
  { label: '승부처', phases: ['CLUTCH_MATCH'] },
  { label: '정규시즌', phases: ['PENNANT_RACE'] },
  { label: '가을야구', phases: ['POSTSEASON', 'SEASON_SETTLEMENT'] }
]

export const SeasonProgress: React.FC<SeasonProgressProps> = ({ phase }) => {
  const activeIndex = Math.max(0, STEPS.findIndex(step => step.phases.includes(phase)))

  return (
    <div className="season-progress" aria-label="시즌 진행 단계">
      {STEPS.map((step, index) => {
        const state = index < activeIndex ? 'done' : index === activeIndex ? 'active' : 'upcoming'
        return (
          <div className={`season-progress__step ${state}`} key={step.label}>
            <span className="season-progress__dot">{state === 'done' ? '✓' : index + 1}</span>
            <span className="season-progress__label">{step.label}</span>
          </div>
        )
      })}
    </div>
  )
}
