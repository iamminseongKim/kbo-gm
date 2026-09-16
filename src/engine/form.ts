import { Player, PlayerForm } from '../types'
import { PRNG } from './prng'

const BATTER_HOT_REASONS = [
  '타격 폼 수정 성공 및 스윗스팟 타구 폭발',
  '벌크업 성공으로 배트 스피드 급상승 및 홈런포 가동',
  '물오른 선구안과 득점권 4할 맹타 질주',
  '밀어치기 완벽 터득, 3할 5푼 안타 제조기 변신'
]

const PITCHER_HOT_REASONS = [
  '신구종 스위퍼 완벽 마스터로 탈삼진 머신 각성',
  '팔 각도 교정으로 패스트볼 구속 4km 증가',
  '스트라이크존 구석을 찌르는 핀포인트 칼제구 각성',
  '0점대 방어율 언터처블 철벽 모드 가동'
]

const BATTER_SLUMP_REASONS = [
  '타격 밸런스 붕괴 및 결정구 타이밍 난조',
  '유인구 대처 불가 및 삼진 늪에 빠짐',
  '허리 잔부상 여파로 배트 스피드 급감',
  '극심한 멘탈 압박으로 득점권 침묵 지속'
]

const PITCHER_SLUMP_REASONS = [
  '릴리스 포인트 흔들림으로 인한 제구 난조 및 볼넷 남발',
  '구위 저하로 인한 피홈런 및 장타 허용 급증',
  '체력 방전으로 패스트볼 구속 및 회전수 급감',
  '주자 출루 시 멘탈 붕괴 및 폭투 급증'
]

/**
 * 매 시즌 각 구단 선수단에 불타오름(대폭발/커리어하이)과 슬럼프를 무작위 부여합니다.
 */
export function assignSeasonPlayerForms(players: Player[], prng: PRNG): Player[] {
  // 팀별로 분할
  const teamMap: Record<string, Player[]> = {}
  players.forEach(p => {
    if (!teamMap[p.teamId]) teamMap[p.teamId] = []
    teamMap[p.teamId].push(p)
  })

  const updated: Player[] = []

  Object.values(teamMap).forEach(teamPlayers => {
    // 셔플하여 롤 분배
    const shuffled = prng.shuffle([...teamPlayers])

    // 1명 HOT (대폭발)
    const hotPlayer = shuffled[0]
    // 1명 SLUMP (극심한 슬럼프)
    const slumpPlayer = shuffled[1]
    // 1명 GOOD (상승세)
    const goodPlayer = shuffled[2]
    // 1명 COLD (부진)
    const coldPlayer = shuffled[3]

    teamPlayers.forEach(p => {
      let form: PlayerForm = 'NORMAL'
      let formDelta = 0
      let formReason = '안정적인 정규 페이스'

      if (hotPlayer && p.id === hotPlayer.id) {
        form = 'HOT'
        formDelta = prng.nextInt(3, 5) // +3 ~ +5
        const reasons = p.isPitcher ? PITCHER_HOT_REASONS : BATTER_HOT_REASONS
        formReason = `🔥 ${prng.choice(reasons)} (+${formDelta} OVR)`
      } else if (slumpPlayer && p.id === slumpPlayer.id) {
        form = 'SLUMP'
        formDelta = prng.nextInt(-5, -3) // -3 ~ -5
        const reasons = p.isPitcher ? PITCHER_SLUMP_REASONS : BATTER_SLUMP_REASONS
        formReason = `❄️ ${prng.choice(reasons)} (${formDelta} OVR)`
      } else if (goodPlayer && p.id === goodPlayer.id) {
        form = 'GOOD'
        formDelta = 2
        formReason = '⚡ 좋은 컨디션과 타격/투구 감각 (+2 OVR)'
      } else if (coldPlayer && p.id === coldPlayer.id) {
        form = 'COLD'
        formDelta = -2
        formReason = '💧 잔부상 및 피로 누적으로 인한 컨디션 난조 (-2 OVR)'
      }

      updated.push({
        ...p,
        form,
        formDelta,
        formReason
      })
    })
  })

  return updated
}
