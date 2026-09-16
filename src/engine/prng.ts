/**
 * Mulberry32 32-bit PRNG
 * 외부 라이브러리 없이 시드 기반의 완벽한 재현성을 제공하는 초경량 난수 생성기
 */
export class PRNG {
  private s: number

  constructor(seed: number | string) {
    if (typeof seed === 'string') {
      let h = 2166136261 >>> 0
      for (let i = 0; i < seed.length; i++) {
        h = Math.imul(h ^ seed.charCodeAt(i), 16777619)
      }
      this.s = h >>> 0
    } else {
      this.s = seed >>> 0
    }
  }

  // 0 이상 1 미만의 부동소수점 반환
  next(): number {
    let t = (this.s += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  // min 이상 max 이하의 정수 반환
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min
  }

  // 배열에서 1개 무작위 선택
  choice<T>(array: T[]): T {
    return array[this.nextInt(0, array.length - 1)]
  }

  // 배열에서 무작위 n개 선택 (비복원 추출)
  sample<T>(array: T[], count = 1): T[] {
    const copy = [...array]
    const result: T[] = []
    for (let i = 0; i < count && copy.length > 0; i++) {
      const idx = this.nextInt(0, copy.length - 1)
      result.push(copy.splice(idx, 1)[0])
    }
    return result
  }

  // 배열 셔플 (Fisher-Yates)
  shuffle<T>(array: T[]): T[] {
    const copy = [...array]
    for (let i = copy.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i)
      const temp = copy[i]
      copy[i] = copy[j]
      copy[j] = temp
    }
    return copy
  }
}
