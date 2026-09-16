import { Player, Team, TradeOffer } from '../types'
import { PRNG } from './prng'

const RATIONALES = [
  '상대 구단이 포지션 중복을 해소하기 위해 먼저 전화를 걸어왔습니다.',
  '스카우트팀은 이 선수가 우리 팀에서 한 단계 더 성장할 수 있다고 확신합니다.',
  '계약 기간과 연봉을 고려하면 지금이 가장 현실적인 교환 시점이라는 평가입니다.',
  '가을야구 경쟁을 위한 즉시전력과 상대의 필요가 정확히 맞아떨어진 제안입니다.',
  '팬들의 반발 가능성은 있지만 전력 구성의 약점을 메울 수 있는 거래입니다.'
]

export function generateTradeOffers(
  teams: Record<string, Team>,
  players: Player[],
  userTeamId: string,
  prng: PRNG,
  season: number
): TradeOffer[] {
  const userPool = players.filter(p =>
    p.teamId === userTeamId && !p.isForeign && !p.isRookie && p.overall >= 72
  )
  const partnerIds = prng.sample(Object.keys(teams).filter(id => id !== userTeamId), 3)

  return partnerIds.flatMap((partnerTeamId, index) => {
    const partnerPool = players.filter(p =>
      p.teamId === partnerTeamId && !p.isForeign && !p.isRookie && p.overall >= 72
    )
    if (!userPool.length || !partnerPool.length) return []

    const incoming = prng.choice(partnerPool)
    const sortedOutgoing = [...userPool].sort((a, b) => {
      const fitA = Math.abs(a.overall - incoming.overall) + Math.abs(a.salary - incoming.salary) * 0.15
      const fitB = Math.abs(b.overall - incoming.overall) + Math.abs(b.salary - incoming.salary) * 0.15
      return fitA - fitB
    })
    const outgoing = sortedOutgoing[Math.min(index, sortedOutgoing.length - 1)]
    const powerDelta = incoming.overall - outgoing.overall

    return [{
      id: `trade_${season}_${partnerTeamId}_${index}`,
      partnerTeamId,
      outgoingPlayerId: outgoing.id,
      incomingPlayerId: incoming.id,
      rationale: prng.choice(RATIONALES),
      urgency: powerDelta >= 2 ? 'BUYER' : powerDelta <= -2 ? 'SELLER' : 'BALANCED'
    }]
  })
}
