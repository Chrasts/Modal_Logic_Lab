import { describe, expect, it } from 'vitest'
import { snakeSequence } from './snakeSequence'

describe('snakeSequence', () => {
  it('densely renders complete rows in alternating directions', () => {
    const sequence = snakeSequence([1, 2, 3, 4, 5, 6, 7, 8])
    expect(sequence.map(({ item }) => item)).toEqual([1, 2, 3, 6, 5, 4, 7, 8])
    expect(sequence.map(({ link }) => link)).toEqual(['right', 'right', 'down', 'down', 'left', 'left', 'right', undefined])
  })

  it('packs a partial final row instead of creating empty cells', () => {
    const sequence = snakeSequence([1, 2, 3, 4, 5])
    expect(sequence.map(({ item }) => item)).toEqual([1, 2, 3, 5, 4])
    expect(sequence[2]?.link).toBe('down-left')
  })
})
