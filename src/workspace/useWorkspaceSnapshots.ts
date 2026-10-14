import type { Dispatch, SetStateAction } from 'react'
import type { EdgeDraft, EditableEdge, EditableWorld, FrameRules, ModelSnapshot } from './model-types'

interface WorkspaceSnapshotsOptions<FrameWitness> {
  readonly worlds: readonly EditableWorld[]
  readonly edges: readonly EditableEdge[]
  readonly evaluationWorld: string
  readonly frameRules: FrameRules
  readonly setWorlds: Dispatch<SetStateAction<EditableWorld[]>>
  readonly setEdges: Dispatch<SetStateAction<EditableEdge[]>>
  readonly setEvaluationWorld: Dispatch<SetStateAction<string>>
  readonly setFrameRules: Dispatch<SetStateAction<FrameRules>>
  readonly setEdgeDraft: Dispatch<SetStateAction<EdgeDraft | null>>
  readonly setEdgeEditErrors: Dispatch<SetStateAction<Readonly<Record<number, string>>>>
  readonly setActiveFrameWitness: Dispatch<SetStateAction<FrameWitness | null>>
  readonly clearGraphSelection: () => void
  readonly clearResult: () => void
}

/** Creates immutable history snapshots and restores the editor-only state around them. */
export function useWorkspaceSnapshots<FrameWitness>({
  worlds, edges, evaluationWorld, frameRules, setWorlds, setEdges, setEvaluationWorld, setFrameRules,
  setEdgeDraft, setEdgeEditErrors, setActiveFrameWitness, clearGraphSelection, clearResult,
}: WorkspaceSnapshotsOptions<FrameWitness>) {
  const currentSnapshot = (): ModelSnapshot => ({
    worlds: structuredClone([...worlds]),
    edges: structuredClone([...edges]),
    evaluationWorld,
    frameRules: { ...frameRules },
  })

  const restoreSnapshot = (snapshot: ModelSnapshot, preserveResult = false) => {
    setWorlds(structuredClone(snapshot.worlds))
    setEdges(structuredClone(snapshot.edges))
    setEvaluationWorld(snapshot.evaluationWorld)
    setFrameRules({ ...snapshot.frameRules })
    clearGraphSelection()
    setEdgeDraft(null)
    setEdgeEditErrors({})
    setActiveFrameWitness(null)
    if (!preserveResult) clearResult()
  }

  return { currentSnapshot, restoreSnapshot }
}
