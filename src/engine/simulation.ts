import { Team, StandingsRecord, EnvironmentCard, Player } from '../types'
import { PRNG } from './prng'

export interface TeamPower {
  batting: number
  pitching: number
  overall: number
}

export function calculateTeamPower(
  team: Team,
  players: Player[],
  environment?: EnvironmentCard,
  modifierDelta = 0
): TeamPower {
  const teamPlayers = players.filter(p => p.teamId === team.id)
  
  // 평균 오버롤 및 스탯
  let avgBatterPower = 78
  let avgPitcherPower = 78
  
  if (teamPlayers.length > 0) {
    // 부상 선수는 엔트리에는 남지만 실제 전력 계산에서는 대체선수 수준으로 하락한다.
    const effectiveOverall = (player: Player) => player.overall + (player.formDelta || 0) - (player.isInjured ? 12 : 0)
    const batters = teamPlayers.filter(p => !p.isPitcher)
    const pitchers = teamPlayers.filter(p => p.isPitcher)
    
    if (batters.length > 0) {
      avgBatterPower = batters.reduce((acc, b) => acc + effectiveOverall(b), 0) / batters.length
    }
    if (pitchers.length > 0) {
      avgPitcherPower = pitchers.reduce((acc, p) => acc + effectiveOverall(p), 0) / pitchers.length
    }
  }

  // 윈나우 vs 리빌딩 기조 보정
  let stanceDelta = 0
  if (team.stance === 'WIN_NOW') {
    stanceDelta = 2 // 즉각적인 도움은 주지만 우승을 보장하지는 않음
  } else if (team.stance === 'REBUILDING') {
    stanceDelta = -3 // 리빌딩: 유망주 출전 기회 보장으로 당해 승률 희생
  }

  // 케미스트리 및 팀 보정
  const chemistryBonus = (team.chemistry - 80) * 0.08
  let batting = avgBatterPower + chemistryBonus + modifierDelta + stanceDelta
  let pitching = avgPitcherPower + chemistryBonus + modifierDelta + stanceDelta

  // 환경 카드 보정
  if (environment) {
    if (environment.type === 'hitter_favorable') {
      batting += 3
      pitching -= 2
    } else if (environment.type === 'pitcher_favorable') {
      pitching += 3
      batting -= 2
    } else if (environment.type === 'abs_strict') {
      pitching += 1
      batting += 1
    }
  }

  const overall = (batting + pitching) / 2
  return { batting, pitching, overall }
}

/**
 * 10개 구단 144경기(구단간 16차전) 페넌트레이스 시뮬레이션
 */
export function simulatePennantRace(
  teams: Record<string, Team>,
  rosters: Player[],
  prng: PRNG,
  environment?: EnvironmentCard,
  userModifierDelta = 0,
  userTeamId = '',
  season = 1,
  gamesPerOpponent = 16
): StandingsRecord[] {
  const teamList = Object.values(teams)
  const powerMap: Record<string, TeamPower> = {}

  teamList.forEach(t => {
    // 선택 보너스는 의미가 있되 선수 한 명 이상의 격차를 만들지 않도록 제한한다.
    // 첫 시즌은 신임 단장의 시행착오와 프런트 적응 기간을 반영한다.
    const rookieGmPenalty = t.id === userTeamId && season === 1 ? -3.5 : 0
    const mod = t.id === userTeamId
      ? Math.max(-6, Math.min(6, userModifierDelta * 0.65)) + rookieGmPenalty
      : 0
    powerMap[t.id] = calculateTeamPower(t, rosters, environment, mod)
  })

  const records: Record<string, {
    wins: number
    losses: number
    draws: number
    runScored: number
    runAllowed: number
  }> = {}

  teamList.forEach(t => {
    records[t.id] = { wins: 0, losses: 0, draws: 0, runScored: 0, runAllowed: 0 }
  })

  // 각 팀간 16경기 시뮬레이션 (총 9상대 * 16 = 144경기)
  for (let i = 0; i < teamList.length; i++) {
    for (let j = i + 1; j < teamList.length; j++) {
      const teamA = teamList[i]
      const teamB = teamList[j]
      const powerA = powerMap[teamA.id]
      const powerB = powerMap[teamB.id]

      for (let game = 0; game < gamesPerOpponent; game++) {
        // 홈/원정
        const isAHome = game % 2 === 0
        const homeAdvantage = 1.05

        const expectedRunsA = (powerA.batting / (powerB.pitching * 0.95)) * 4.6 * (isAHome ? homeAdvantage : 1.0)
        const expectedRunsB = (powerB.batting / (powerA.pitching * 0.95)) * 4.6 * (!isAHome ? homeAdvantage : 1.0)

        // 가우시안 느낌의 득점 생성
        const runsA = Math.max(0, Math.round(expectedRunsA + (prng.next() - 0.48) * 4.5))
        const runsB = Math.max(0, Math.round(expectedRunsB + (prng.next() - 0.48) * 4.5))

        records[teamA.id].runScored += runsA
        records[teamA.id].runAllowed += runsB
        records[teamB.id].runScored += runsB
        records[teamB.id].runAllowed += runsA

        if (runsA > runsB) {
          records[teamA.id].wins += 1
          records[teamB.id].losses += 1
        } else if (runsB > runsA) {
          records[teamB.id].wins += 1
          records[teamA.id].losses += 1
        } else {
          // KBO 무승부 규정
          records[teamA.id].draws += 1
          records[teamB.id].draws += 1
        }
      }
    }
  }

  // 순위표 생성
  const standings: StandingsRecord[] = teamList.map(t => {
    const rec = records[t.id]
    const decidedGames = rec.wins + rec.losses
    const winRate = decidedGames > 0 ? rec.wins / decidedGames : 0
    return {
      teamId: t.id,
      teamName: t.name,
      wins: rec.wins,
      losses: rec.losses,
      draws: rec.draws,
      winRate: Math.round(winRate * 1000) / 1000,
      runScored: rec.runScored,
      runAllowed: rec.runAllowed,
      rank: 0,
      gamesBehind: 0
    }
  })

  // 승률 내림차순, 득실차 내림차순 정렬
  standings.sort((a, b) => {
    if (b.winRate !== a.winRate) return b.winRate - a.winRate
    const diffA = a.runScored - a.runAllowed
    const diffB = b.runScored - b.runAllowed
    return diffB - diffA
  })

  // 순위 및 게임차 부여
  const leaderWins = standings[0].wins
  const leaderLosses = standings[0].losses

  standings.forEach((st, idx) => {
    st.rank = idx + 1
    if (idx === 0) {
      st.gamesBehind = 0
    } else {
      const gb = ((leaderWins - st.wins) + (st.losses - leaderLosses)) / 2
      st.gamesBehind = Math.max(0, gb)
    }
  })

  return standings
}
