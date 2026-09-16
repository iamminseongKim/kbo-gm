import { Player, Team } from '../types'
import { PRNG } from './prng'

export interface AgingRecord {
  playerId: string
  name: string
  teamId: string
  position: string
  prevAge: number
  newAge: number
  prevOverall: number
  newOverall: number
  delta: number
  category: 'GROWTH' | 'PRIME' | 'AGING' | 'DECLINE'
  summary: string
}

/**
 * 시즌 전환 시 모든 선수의 나이를 1살 증가시키고,
 * 나이대(유망주, 전성기, 에이징 커브, 노쇠화) 및 구단 팜 시스템에 따른 기량 변화를 적용합니다.
 */
export function advanceSeasonAndApplyAging(
  players: Player[],
  teams: Record<string, Team>,
  prng: PRNG,
  _newSeason?: number
): {
  updatedPlayers: Player[]
  agingRecords: AgingRecord[]
} {
  const agingRecords: AgingRecord[] = []

  const updatedPlayers = players.map(p => {
    const prevAge = p.age
    const newAge = prevAge + 1
    const prevOverall = p.overall

    // 팀의 팜 시스템 (육성군) 수준 (0~100, 기본 70)
    const teamFarm = teams[p.teamId]?.farmSystem ?? 70
    const farmBonus = (teamFarm - 70) * 0.05 // -1.0 ~ +1.5

    let delta = 0
    let category: 'GROWTH' | 'PRIME' | 'AGING' | 'DECLINE' = 'PRIME'
    let summary = '전성기 기량 유지'

    const team = teams[p.teamId]
    const winNowDebt = team?.winNowDebt || 0
    const rebuildingStack = team?.rebuildingStack || 0

    // ====================================================
    // 나이대별 성장 및 에이징 커브 확률 모델 (리빌딩 누적 및 윈나우 후폭풍 반영)
    // ====================================================
    if (newAge <= 24) {
      // 1. 유망주 / 급성장기 (만 19 ~ 24세)
      category = 'GROWTH'
      if (rebuildingStack > 0) {
        // [리빌딩 누적 효과]: 실전 출전 보장 및 집중 육성으로 포텐셜 폭발
        const extraGrowth = Math.min(3, rebuildingStack)
        delta = prng.nextInt(2 + Math.floor(rebuildingStack / 2), 3 + extraGrowth)
        summary = rebuildingStack >= 2
          ? `🌱 리빌딩 누적 ${rebuildingStack}년차 특급 유망주 대폭발 (+${delta} OVR)`
          : `🌱 리빌딩 실전 경험 축적 (+${delta} OVR)`
      } else {
        const roll = prng.nextInt(1, 100) + farmBonus * 5
        if (roll >= 85) {
          delta = prng.nextInt(2, 4) // 폭풍 성장
          summary = `유망주 포텐셜 폭발 (+${delta} OVR)`
        } else if (roll >= 30) {
          delta = prng.nextInt(1, 2) // 안정적 성장
          summary = `기량 성장세 지속 (+${delta} OVR)`
        } else if (roll >= 15) {
          delta = 0 // 기량 유지
          summary = '성장 정체기 (유지)'
        } else {
          delta = -1 // 소포모어 징크스
          summary = '소포모어 징크스 (-1 OVR)'
        }
      }
    } else if (newAge <= 28) {
      // 2. 도약기 ~ 전성기 초입 (만 25 ~ 28세)
      if (rebuildingStack > 0 && prng.nextInt(1, 100) <= 75) {
        category = 'GROWTH'
        delta = prng.nextInt(1, 2 + Math.min(1, Math.floor(rebuildingStack / 2)))
        summary = `🌱 리빌딩 코어 주전 도약 (+${delta} OVR)`
      } else {
        const roll = prng.nextInt(1, 100)
        if (roll >= 65) {
          category = 'GROWTH'
          delta = prng.nextInt(1, 2)
          summary = `커리어 하이 도약 (+${delta} OVR)`
        } else if (roll >= 20) {
          category = 'PRIME'
          delta = 0
          summary = '주전급 전성기 기량 유지'
        } else {
          category = 'PRIME'
          delta = -1
          summary = '체력 및 잔부상 여파 (-1 OVR)'
        }
      }
    } else if (newAge <= 32) {
      // 3. 완숙한 전성기 피크 (만 29 ~ 32세)
      category = 'PRIME'
      if (winNowDebt > 0 && prng.nextInt(1, 100) <= 60) {
        // 윈나우 후폭풍: 혹사와 연투로 인한 피로도 누적
        delta = -1 - Math.min(2, Math.floor(winNowDebt / 2))
        summary = `⚠️ 윈나우 혹사 후폭풍 (${delta} OVR)`
      } else {
        const roll = prng.nextInt(1, 100)
        if (roll >= 75) {
          delta = 1
          summary = '베테랑 노하우 축적 (+1 OVR)'
        } else if (roll >= 25) {
          delta = 0
          summary = '리그 최고 수준 전성기 유지'
        } else {
          delta = -1
          summary = '서서히 나타나는 피로도 (-1 OVR)'
        }
      }
    } else if (newAge <= 35) {
      // 4. 에이징 커브 진입기 (만 33 ~ 35세)
      category = 'AGING'
      const baseRoll = prng.nextInt(1, 100)
      if (baseRoll >= 85 && winNowDebt === 0) {
        delta = 0
        summary = '철저한 자기관리로 기량 방어 (유지)'
      } else if (baseRoll >= 40 && winNowDebt === 0) {
        delta = -1
        summary = '에이징 커브 진입, 소폭 하락 (-1 OVR)'
      } else {
        const hangover = winNowDebt > 0 ? Math.min(3, Math.max(1, Math.floor(winNowDebt * 0.8))) : 0
        delta = prng.nextInt(-2, -3) - hangover
        summary = winNowDebt > 0
          ? `⚠️ 윈나우 혹사 여파 (에이징 가속 ${delta} OVR)`
          : `구속/배트스피드 저하 (${delta} OVR)`
      }
    } else {
      // 5. 완연한 노쇠화 / 베테랑 (만 36세 이상)
      category = 'DECLINE'
      const hangover = winNowDebt > 0 ? Math.min(3, Math.max(1, Math.floor(winNowDebt * 0.8))) : 0
      const roll = prng.nextInt(1, 100)
      if (roll >= 85 && newAge <= 38 && winNowDebt === 0) {
        delta = -1
        summary = '노익장 과시, 완만한 하락 (-1 OVR)'
      } else if (roll >= 40) {
        delta = prng.nextInt(-2, -3) - hangover
        summary = winNowDebt > 0
          ? `⚠️ 윈나우 후폭풍 직격탄 (${delta} OVR)`
          : `노쇠화 가속 및 신체능력 저하 (${delta} OVR)`
      } else {
        delta = prng.nextInt(-3, -5) - hangover
        summary = winNowDebt > 0
          ? `⚠️ 윈나우 혹사로 급격한 전력 붕괴 (${delta} OVR)`
          : `급격한 에이징 커브 직격탄 (${delta} OVR)`
      }
    }

    const newOverall = Math.max(50, Math.min(99, prevOverall + delta))

    // 세부 스탯 비례 조정
    let updatedPitcherStats = p.pitcherStats ? { ...p.pitcherStats } : undefined
    let updatedBatterStats = p.batterStats ? { ...p.batterStats } : undefined

    if (delta !== 0) {
      if (p.isPitcher && updatedPitcherStats) {
        if (delta < 0) {
          updatedPitcherStats.stuff = Math.max(40, updatedPitcherStats.stuff + delta - 1)
          updatedPitcherStats.stamina = Math.max(40, updatedPitcherStats.stamina + delta)
          updatedPitcherStats.control = Math.max(40, updatedPitcherStats.control + Math.round(delta * 0.5))
        } else {
          updatedPitcherStats.stuff = Math.min(99, updatedPitcherStats.stuff + delta)
          updatedPitcherStats.control = Math.min(99, updatedPitcherStats.control + delta)
          updatedPitcherStats.breaking = Math.min(99, updatedPitcherStats.breaking + delta)
        }
      } else if (!p.isPitcher && updatedBatterStats) {
        if (delta < 0) {
          updatedBatterStats.speed = Math.max(30, updatedBatterStats.speed + delta - 1)
          updatedBatterStats.power = Math.max(40, updatedBatterStats.power + delta)
          updatedBatterStats.eye = Math.max(40, updatedBatterStats.eye + Math.round(delta * 0.4))
          updatedBatterStats.contact = Math.max(40, updatedBatterStats.contact + delta)
        } else {
          updatedBatterStats.contact = Math.min(99, updatedBatterStats.contact + delta)
          updatedBatterStats.power = Math.min(99, updatedBatterStats.power + delta)
          updatedBatterStats.eye = Math.min(99, updatedBatterStats.eye + delta)
        }
      }
    }

    agingRecords.push({
      playerId: p.id,
      name: p.name,
      teamId: p.teamId,
      position: p.position,
      prevAge,
      newAge,
      prevOverall,
      newOverall,
      delta,
      category,
      summary
    })

    return {
      ...p,
      age: newAge,
      overall: newOverall,
      pitcherStats: updatedPitcherStats,
      batterStats: updatedBatterStats,
      lastSeasonDelta: delta,
      contractYears: Math.max(0, p.contractYears - 1)
    }
  })

  return {
    updatedPlayers,
    agingRecords
  }
}
