import { useRef, useState } from 'react'

interface HistoryEntry<Snapshot> {
  readonly snapshot: Snapshot
  readonly preserveResult: boolean
}

interface WorkspaceHistoryOptions<Snapshot> {
  readonly createSnapshot: () => Snapshot
  readonly restoreSnapshot: (snapshot: Snapshot, preserveResult: boolean) => void
  readonly limit?: number
}

export function useWorkspaceHistory<Snapshot>({ createSnapshot, restoreSnapshot, limit = 50 }: WorkspaceHistoryOptions<Snapshot>) {
  const past = useRef<HistoryEntry<Snapshot>[]>([])
  const future = useRef<HistoryEntry<Snapshot>[]>([])
  const [, setVersion] = useState(0)
  const refresh = () => setVersion((version) => version + 1)

  const saveHistoryPoint = (preserveResultOrEvent?: unknown) => {
    const preserveResult = preserveResultOrEvent === true
    past.current.push({ snapshot: createSnapshot(), preserveResult })
    if (past.current.length > limit) past.current.shift()
    future.current = []
    refresh()
  }

  const undo = () => {
    const previous = past.current.pop()
    if (!previous) return
    future.current.push({ snapshot: createSnapshot(), preserveResult: previous.preserveResult })
    restoreSnapshot(previous.snapshot, previous.preserveResult)
    refresh()
  }

  const redo = () => {
    const next = future.current.pop()
    if (!next) return
    past.current.push({ snapshot: createSnapshot(), preserveResult: next.preserveResult })
    restoreSnapshot(next.snapshot, next.preserveResult)
    refresh()
  }

  const clearHistory = () => {
    past.current = []
    future.current = []
    refresh()
  }

  return {
    saveHistoryPoint,
    undo,
    redo,
    clearHistory,
    undoAvailable: past.current.length > 0,
    redoAvailable: future.current.length > 0,
  }
}
