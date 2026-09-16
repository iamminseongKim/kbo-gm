import { StandingsRecord, Team } from '../types'
import { PRNG } from './prng'

export interface SeriesResult {
  roundName: '와일드카드' | '준플레이오프' | '플레이오프' | '한국시리즈'
  team1: Team
  team2: Team
  team1Wins: number
  team2Wins: number
  winner: Team
  loser: Team
  isUserMatch: boolean
  logs: string[]
}

export type TacticChoice = 'standard' | 'short_rest' | 'early_closer'

/**
 * 포스트시즌 경기 단일 승패 계산
 */
function playPostseasonGame(
  powerA: number,
  powerB: number,
  prng: PRNG,
  tacticA?: TacticChoice,
  tacticB?: TacticChoice,
  stanceA?: string,
  stanceB?: string,
  pressureA = 0,
  pressureB = 0
): boolean {
  let modA = 0
  let modB = 0

  if (tacticA === 'short_rest') modA += 2
  if (tacticA === 'early_closer') modA += 1.5
  if (tacticB === 'short_rest') modB += 2
  if (tacticB === 'early_closer') modB += 1.5

  // 윈나우 시 즉각 전력 집중 및 단기전 버프 / 리빌딩 시 경험 중심
  if (stanceA === 'WIN_NOW') modA += 1.5
  if (stanceB === 'WIN_NOW') modB += 1.5
  if (stanceA === 'REBUILDING') modA -= 2
  if (stanceB === 'REBUILDING') modB -= 2
  modA += pressureA
  modB += pressureB

  const probA = (powerA + modA) / (powerA + modA + powerB + modB)
  return prng.next() < probA
}

/**
 * KBO 5강 포스트시즌 토너먼트 시뮬레이션
 */
export function simulatePostseason(
  standings: StandingsRecord[],
  teams: Record<string, Team>,
  prng: PRNG,
  userTeamId: string,
  userTactic: TacticChoice = 'standard',
  season = 1
): {
  seriesList: SeriesResult[]
  champion: Team
  userFinalResult: string
} {
  const top5 = standings.slice(0, 5).map(s => teams[s.teamId])
  const team1 = top5[0]
  const team2 = top5[1]
  const team3 = top5[2]
  const team4 = top5[3]
  const team5 = top5[4]

  const seriesList: SeriesResult[] = []
  const powerFromStanding = (team: Team) => {
    const record = standings.find(s => s.teamId === team.id)
    if (!record) return 80
    const runDiffPerGame = (record.runScored - record.runAllowed) / 144
    return 74 + record.winRate * 12 + Math.max(-3, Math.min(3, runDiffPerGame * 1.4))
  }
  const rookiePressure = (team: Team) => team.id === userTeamId && season === 1 ? -4 : 0

  // 1. 와일드카드 결정전 (4위 vs 5위, 4위에게 1승 어드밴티지, 최대 2경기)
  {
    let team4Wins = 1 // 어드밴티지
    let team5Wins = 0
    const logs: string[] = ['[와일드카드 결정전] 4위 ' + team4.shortName + ' (1승 어드밴티지) vs 5위 ' + team5.shortName]

    // 1차전
    const t4Tactic = team4.id === userTeamId ? userTactic : 'standard'
    const t5Tactic = team5.id === userTeamId ? userTactic : 'standard'
    const game1Win4 = playPostseasonGame(powerFromStanding(team4), powerFromStanding(team5), prng, t4Tactic, t5Tactic, team4.stance, team5.stance, rookiePressure(team4), rookiePressure(team5))

    if (game1Win4) {
      team4Wins++
      logs.push(`1차전: ${team4.shortName} 승리! ${team4.shortName} 준플레이오프 진출 확정!`)
    } else {
      team5Wins++
      logs.push(`1차전: ${team5.shortName} 승리! 시리즈는 최종 2차전으로 이어집니다.`)
      // 2차전
      const game2Win4 = playPostseasonGame(powerFromStanding(team4), powerFromStanding(team5), prng, t4Tactic, t5Tactic, team4.stance, team5.stance, rookiePressure(team4), rookiePressure(team5))
      if (game2Win4) {
        team4Wins++
        logs.push(`2차전: ${team4.shortName} 신승! 최종 승리로 준플레이오프 진출!`)
      } else {
        team5Wins++
        logs.push(`2차전: ${team5.shortName} 기적의 업셋! 5위 팀이 준플레이오프에 진출합니다!`)
      }
    }

    const winner = team4Wins >= 2 ? team4 : team5
    const loser = winner.id === team4.id ? team5 : team4
    seriesList.push({
      roundName: '와일드카드',
      team1: team4,
      team2: team5,
      team1Wins: team4Wins,
      team2Wins: team5Wins,
      winner,
      loser,
      isUserMatch: team4.id === userTeamId || team5.id === userTeamId,
      logs
    })
  }

  // 2. 준플레이오프 (3위 vs 와일드카드 승자, 5전 3선승제)
  const wcWinner = seriesList[0].winner
  {
    let team3Wins = 0
    let wcWins = 0
    const logs: string[] = [`[준플레이오프] 3위 ${team3.shortName} vs ${wcWinner.shortName} (5전 3선승제)`]

    while (team3Wins < 3 && wcWins < 3) {
      const t3Tactic = team3.id === userTeamId ? userTactic : 'standard'
      const wcTactic = wcWinner.id === userTeamId ? userTactic : 'standard'
      const win3 = playPostseasonGame(powerFromStanding(team3) + 1, powerFromStanding(wcWinner), prng, t3Tactic, wcTactic, team3.stance, wcWinner.stance, rookiePressure(team3), rookiePressure(wcWinner))
      if (win3) team3Wins++
      else wcWins++
      logs.push(`${team3Wins + wcWins}차전: ${win3 ? team3.shortName : wcWinner.shortName} 승 (${team3Wins}-${wcWins})`)
    }

    const winner = team3Wins === 3 ? team3 : wcWinner
    const loser = winner.id === team3.id ? wcWinner : team3
    seriesList.push({
      roundName: '준플레이오프',
      team1: team3,
      team2: wcWinner,
      team1Wins: team3Wins,
      team2Wins: wcWins,
      winner,
      loser,
      isUserMatch: team3.id === userTeamId || wcWinner.id === userTeamId,
      logs
    })
  }

  // 3. 플레이오프 (2위 vs 준PO 승자, 5전 3선승제)
  const semiWinner = seriesList[1].winner
  {
    let team2Wins = 0
    let semiWins = 0
    const logs: string[] = [`[플레이오프] 2위 ${team2.shortName} vs ${semiWinner.shortName} (5전 3선승제)`]

    while (team2Wins < 3 && semiWins < 3) {
      const t2Tactic = team2.id === userTeamId ? userTactic : 'standard'
      const semiTactic = semiWinner.id === userTeamId ? userTactic : 'standard'
      const win2 = playPostseasonGame(powerFromStanding(team2) + 1.5, powerFromStanding(semiWinner), prng, t2Tactic, semiTactic, team2.stance, semiWinner.stance, rookiePressure(team2), rookiePressure(semiWinner))
      if (win2) team2Wins++
      else semiWins++
      logs.push(`${team2Wins + semiWins}차전: ${win2 ? team2.shortName : semiWinner.shortName} 승 (${team2Wins}-${semiWins})`)
    }

    const winner = team2Wins === 3 ? team2 : semiWinner
    const loser = winner.id === team2.id ? semiWinner : team2
    seriesList.push({
      roundName: '플레이오프',
      team1: team2,
      team2: semiWinner,
      team1Wins: team2Wins,
      team2Wins: semiWins,
      winner,
      loser,
      isUserMatch: team2.id === userTeamId || semiWinner.id === userTeamId,
      logs
    })
  }

  // 4. 한국시리즈 (1위 vs PO 승자, 7전 4선승제)
  const poWinner = seriesList[2].winner
  {
    let team1Wins = 0
    let poWins = 0
    const logs: string[] = [`[한국시리즈] 페넌트레이스 1위 ${team1.shortName} vs ${poWinner.shortName} (7전 4선승제)`]

    while (team1Wins < 4 && poWins < 4) {
      const t1Tactic = team1.id === userTeamId ? userTactic : 'standard'
      const poTactic = poWinner.id === userTeamId ? userTactic : 'standard'
      const win1 = playPostseasonGame(powerFromStanding(team1) + 2, powerFromStanding(poWinner), prng, t1Tactic, poTactic, team1.stance, poWinner.stance, rookiePressure(team1), rookiePressure(poWinner))
      if (win1) team1Wins++
      else poWins++
      logs.push(`${team1Wins + poWins}차전: ${win1 ? team1.shortName : poWinner.shortName} 승 (${team1Wins}-${poWins})`)
    }

    const winner = team1Wins === 4 ? team1 : poWinner
    const loser = winner.id === team1.id ? poWinner : team1
    seriesList.push({
      roundName: '한국시리즈',
      team1: team1,
      team2: poWinner,
      team1Wins: team1Wins,
      team2Wins: poWins,
      winner,
      loser,
      isUserMatch: team1.id === userTeamId || poWinner.id === userTeamId,
      logs
    })
  }

  const champion = seriesList[3].winner

  // 사용자 최종 성적 판정
  let userFinalResult = '가을야구 탈락'
  if (champion.id === userTeamId) {
    userFinalResult = '🏆 한국시리즈 우승!'
  } else {
    for (let i = seriesList.length - 1; i >= 0; i--) {
      const s = seriesList[i]
      if (s.loser.id === userTeamId) {
        if (s.roundName === '한국시리즈') userFinalResult = '🥈 한국시리즈 준우승'
        else if (s.roundName === '플레이오프') userFinalResult = '🥉 플레이오프 탈락 (3위)'
        else if (s.roundName === '준플레이오프') userFinalResult = '준플레이오프 탈락 (4위)'
        else if (s.roundName === '와일드카드') userFinalResult = '와일드카드 탈락 (5위)'
        break
      }
    }
  }

  return { seriesList, champion, userFinalResult }
}
