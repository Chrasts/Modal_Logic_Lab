export type SequenceLink = 'right' | 'left' | 'down' | 'down-left' | 'down-right'

export interface SnakeSequenceEntry<T> {
  readonly item: T
  readonly index: number
  readonly link?: SequenceLink
}

/**
 * Places a chronological sequence into connected rows without leaving empty
 * grid cells: 1,2,3 / 6,5,4 / 7,8,9. The final partial row is packed from
 * the left while retaining the order relation in its link direction.
 */
export function snakeSequence<T>(items: readonly T[], columns = 3): readonly SnakeSequenceEntry<T>[] {
  const positionFor = (index: number) => {
    const row = Math.floor(index / columns)
    const offset = index % columns
    const rowLength = Math.min(columns, items.length - row * columns)
    return { row, column: row % 2 === 0 ? offset : rowLength - offset - 1 }
  }

  return items.map((item, index) => {
    const position = positionFor(index)
    const next = index < items.length - 1 ? positionFor(index + 1) : undefined
    const link: SequenceLink | undefined = !next
      ? undefined
      : next.row > position.row
        ? next.column === position.column ? 'down' : next.column < position.column ? 'down-left' : 'down-right'
        : next.column > position.column ? 'right' : 'left'
    return { item, index, position, link }
  }).sort((left, right) => left.position.row - right.position.row || left.position.column - right.position.column).map(({ item, index, link }) => ({ item, index, link }))
}
