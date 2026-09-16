import { EnvironmentCard } from '../types'

export const ENVIRONMENT_CARDS: EnvironmentCard[] = [
  {
    id: 'hitter_favorable',
    name: '🔥 극심한 타고투저',
    description: '공인구 반발력 증가! 리그 전체 타격과 장타가 폭발하며 투수 체력 소모가 극심해집니다.',
    type: 'hitter_favorable'
  },
  {
    id: 'pitcher_favorable',
    name: '🧊 투고타저의 도래',
    description: '공인구 규격 강화 및 넓은 스트라이크 존! 수비와 마운드의 안정성이 승부를 결정짓습니다.',
    type: 'pitcher_favorable'
  },
  {
    id: 'abs_strict',
    name: '🤖 ABS(로봇 심판) 전면 도입',
    description: '기계 판독 스트라이크 존 도입! 볼넷 유도형 타자와 정밀한 제구형 투수의 가치가 폭등합니다.',
    type: 'abs_strict'
  },
  {
    id: 'salary_cap',
    name: '⚖️ 샐러리캡 긴축 규제',
    description: '구단 연봉 상한제 엄격 적용! 고액 베테랑 계약의 부담이 늘어나고 가성비 육성이 중요해집니다.',
    type: 'salary_cap'
  },
  {
    id: 'rookie_boom',
    name: '🌟 황금 세대 드래프트',
    description: '아마추어 야구 초대어 등장! 유망주 팜과 신인 지명의 효율이 극대화됩니다.',
    type: 'rookie_boom'
  }
]
