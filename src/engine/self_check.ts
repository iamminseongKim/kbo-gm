import { PRNG } from './prng'
import { KBO_TEAMS } from '../data/teams'
import { INITIAL_PLAYERS } from '../data/players'
import { simulatePennantRace } from './simulation'
import { simulatePostseason } from './postseason'

export function runSelfCheck(): boolean {
  console.log('--- KBO GM Engine Self-Check Start ---')

  // 1. PRNG 재현성 테스트
  const p1 = new PRNG('20260916')
  const p2 = new PRNG('20260916')
  const v1 = p1.next()
  const v2 = p2.next()
  if (v1 !== v2) throw new Error(`PRNG reproducibility failed: ${v1} !== ${v2}`)
  console.log('✓ PRNG reproducibility check passed')

  // 2. 페넌트레이스 144경기 검증
  const standings = simulatePennantRace(KBO_TEAMS, INITIAL_PLAYERS, new PRNG(12345), undefined, 0, 'kia')
  if (standings.length !== 10) throw new Error(`Expected 10 teams, got ${standings.length}`)

  standings.forEach(st => {
    const totalGames = st.wins + st.losses + st.draws
    if (totalGames !== 144) {
      throw new Error(`Team ${st.teamName} played ${totalGames} games, expected 144`)
    }
  })
  if (standings[0].rank !== 1 || standings[9].rank !== 10) {
    throw new Error('Standings rank assignment failed')
  }
  console.log('✓ Pennant Race 144-game simulation check passed')

  // 3. 포스트시즌 5강 토너먼트 검증
  const post = simulatePostseason(standings, KBO_TEAMS, new PRNG(6789), 'kia', 'standard')
  if (!post.champion) throw new Error('No champion generated in postseason')
  if (post.seriesList.length !== 4) throw new Error(`Expected 4 postseason series, got ${post.seriesList.length}`)
  console.log(`✓ Postseason check passed (Champion: ${post.champion.name}, User Result: ${post.userFinalResult})`)

  console.log('--- All Engine Self-Checks Passed! ---')
  return true
}
