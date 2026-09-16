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
    const batters = teamPlayers.filter(p => !p.isPitcher)
    const pitchers = teamPlayers.filter(p => p.isPitcher)
    
    if (batters.length > 0) {
      avgBatterPower = batters.reduce((acc, b) => acc + b.overall, 0) / batters.length
    }
    if (pitchers.length > 0) {
      avgPitcherPower = pitchers.reduce((acc, p) => acc + p.overall, 0) / pitchers.length
    }
  }

  // 케미스트리 및 팀 보정
  const chemistryBonus = (team.chemistry - 80) * 0.15
  let batting = avgBatterPower + chemistryBonus + modifierDelta
  let pitching = avgPitcherPower + chemistryBonus + modifierDelta

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
  userTeamId = ''
): StandingsRecord[] {
  const teamList = Object.values(teams)
  const powerMap: Record<string, TeamPower> = {}

  teamList.forEach(t => {
    const mod = (t.id === userTeamId) ? userModifierDelta : 0
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

      for (let game = 0; game < 16; game++) {
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
