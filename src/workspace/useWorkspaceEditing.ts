import type { Connection, ReactFlowInstance } from '@xyflow/react'
import type { Dispatch, RefObject, SetStateAction } from 'react'
import { createTidyModelLayout } from './model-layout'
import { deleteWorldFromEditableModel, validateExplicitEdgeCandidate, validateWorldIdCandidate } from './model-integrity'
import type { EditableEdge, EditableWorld, EdgeDraft } from './model-types'
import { findFreeWorldPosition, WORLD_NODE_SIZE, type WorldPosition } from './world-placement'

interface WorkspaceEditingOptions {
  readonly worlds: EditableWorld[]
  readonly edges: EditableEdge[]
  readonly selectedWorld: EditableWorld | null
  readonly evaluationWorld: string
  readonly nextWorldKey: number
  readonly nextEdgeKey: number
  readonly edgeDraft: EdgeDraft | null
  readonly canEditWorlds: boolean
  readonly canEditValuations: boolean
  readonly canEditEdges: boolean
  readonly canEditEvaluation: boolean
  readonly atomVocabulary?: readonly string[]
  readonly graphCanvasRef: RefObject<HTMLDivElement | null>
  readonly flowInstance: ReactFlowInstance | null
  readonly setWorlds: Dispatch<SetStateAction<EditableWorld[]>>
  readonly setEdges: Dispatch<SetStateAction<EditableEdge[]>>
  readonly setEvaluationWorld: Dispatch<SetStateAction<string>>
  readonly setNextWorldKey: Dispatch<SetStateAction<number>>
  readonly setNextEdgeKey: Dispatch<SetStateAction<number>>
  readonly setEdgeDraft: Dispatch<SetStateAction<EdgeDraft | null>>
  readonly setEdgeEditErrors: Dispatch<SetStateAction<Readonly<Record<number, string>>>>
  readonly clearResult: () => void
  readonly saveHistoryPoint: (preserveResultOrEvent?: unknown) => void
  readonly clearGraphSelection: () => void
  readonly setHoveredWorldKey: Dispatch<SetStateAction<number | null>>
  readonly clearCollisions: () => void
  readonly onCreate: () => void
}

/** Model-editing commands. Formula verification remains outside this hook. */
export function useWorkspaceEditing(options: WorkspaceEditingOptions) {
  const preferredWorldSpawn = (): WorldPosition => {
    if (options.selectedWorld) return { x: options.selectedWorld.position.x + WORLD_NODE_SIZE + 54, y: options.selectedWorld.position.y }
    const bounds = options.graphCanvasRef.current?.getBoundingClientRect()
    if (options.flowInstance && bounds) {
      const center = options.flowInstance.screenToFlowPosition({ x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 })
      return { x: center.x - WORLD_NODE_SIZE / 2, y: center.y - WORLD_NODE_SIZE / 2 }
    }
    return { x: 90, y: 90 }
  }

  const renameWorld = (key: number, nextId: string): string | null => {
    if (!options.canEditWorlds) return 'World names are locked for this activity.'
    const index = options.worlds.findIndex((world) => world.key === key)
    if (index < 0) return 'This world no longer exists.'
    const error = validateWorldIdCandidate(options.worlds, index, nextId)
    if (error) return error
    const previous = options.worlds[index]
    const oldId = previous.id.trim()
    const newId = nextId.trim()
    if (oldId === newId && previous.id === newId) return null
    options.saveHistoryPoint()
    options.setWorlds((current) => current.map((world) => world.key === key ? { ...world, id: newId } : world))
    options.setEdges((current) => current.map((edge) => ({ ...edge, from: edge.from === oldId ? newId : edge.from, to: edge.to === oldId ? newId : edge.to })))
    if (options.evaluationWorld === oldId) options.setEvaluationWorld(newId)
    options.clearResult()
    return null
  }

  const updateWorldAtoms = (key: number, value: string) => {
    if (!options.canEditValuations) return
    if (options.atomVocabulary) value = value.split(/[\s,]+/u).filter((atom) => options.atomVocabulary?.includes(atom)).join(' ')
    options.setWorlds((current) => current.map((world) => world.key === key ? { ...world, atoms: value } : world))
    options.clearResult()
  }

  const addWorld = (preferredPosition?: WorldPosition) => {
    if (!options.canEditWorlds) return
    options.saveHistoryPoint()
    const used = new Set(options.worlds.map(({ id }) => id))
    let number = options.worlds.length
    while (used.has(`w${number}`)) number += 1
    const position = findFreeWorldPosition(options.worlds, preferredPosition ?? preferredWorldSpawn())
    options.setWorlds((current) => [...current, { key: options.nextWorldKey, id: `w${number}`, atoms: '', position }])
    options.setNextWorldKey((key) => key + 1)
    options.clearResult()
    options.onCreate()
  }

  const tidyModel = () => {
    if (options.worlds.length < 2) return
    const positions = createTidyModelLayout(options.worlds, options.edges, options.evaluationWorld)
    options.saveHistoryPoint(true)
    options.setWorlds((current) => current.map((world) => ({ ...world, position: positions.get(world.key) ?? world.position })))
    options.clearCollisions()
  }

  const removeWorld = (key: number) => {
    if (!options.canEditWorlds) return
    const deletion = deleteWorldFromEditableModel(options.worlds, options.edges, key, options.evaluationWorld)
    if (!deletion) return
    options.saveHistoryPoint()
    options.setWorlds([...deletion.worlds])
    options.setEdges([...deletion.edges])
    options.setEvaluationWorld(deletion.evaluationWorld)
    options.clearGraphSelection()
    options.setHoveredWorldKey(null)
    options.clearCollisions()
    options.setEdgeDraft(null)
    options.clearResult()
  }

  const addEdge = () => {
    if (options.canEditEdges) options.setEdgeDraft({ from: '', to: '' })
  }

  const commitEdgeDraft = () => {
    if (!options.canEditEdges || !options.edgeDraft) return
    const error = validateExplicitEdgeCandidate(options.worlds, options.edges, options.edgeDraft.from, options.edgeDraft.to)
    if (error) { options.setEdgeDraft({ ...options.edgeDraft, error }); return }
    options.saveHistoryPoint()
    options.setEdges((current) => [...current, { key: options.nextEdgeKey, from: options.edgeDraft!.from, to: options.edgeDraft!.to }])
    options.setNextEdgeKey((key) => key + 1)
    options.setEdgeDraft(null)
    options.clearResult()
    options.onCreate()
  }

  const replaceEdgeEndpoint = (edgeKey: number, field: 'from' | 'to', nextWorldId: string): string | null => {
    if (!options.canEditEdges) return 'Relations are locked for this activity.'
    const edgeIndex = options.edges.findIndex((edge) => edge.key === edgeKey)
    if (edgeIndex < 0) return 'This relation no longer exists.'
    const candidate: EditableEdge = { ...options.edges[edgeIndex], [field]: nextWorldId }
    const error = validateExplicitEdgeCandidate(options.worlds, options.edges, candidate.from, candidate.to, edgeIndex)
    if (error) { options.setEdgeEditErrors((current) => ({ ...current, [edgeKey]: error })); return error }
    if (options.edges[edgeIndex][field] === nextWorldId) return null
    options.saveHistoryPoint()
    options.setEdges((current) => current.map((edge) => edge.key === edgeKey ? candidate : edge))
    options.setEdgeEditErrors((current) => { const next = { ...current }; delete next[edgeKey]; return next })
    options.clearResult()
    return null
  }

  const connectWorlds = (connection: Connection) => {
    if (!options.canEditEdges) return
    const source = options.worlds.find(({ key }) => String(key) === connection.source)?.id.trim()
    const target = options.worlds.find(({ key }) => String(key) === connection.target)?.id.trim()
    if (!source || !target || options.edges.some((edge) => edge.from === source && edge.to === target)) return
    options.saveHistoryPoint()
    options.setEdges((current) => [...current, { key: options.nextEdgeKey, from: source, to: target }])
    options.setNextEdgeKey((key) => key + 1)
    options.clearResult()
    options.onCreate()
  }

  const deleteEdge = (key: number) => {
    if (!options.canEditEdges || !options.edges.some((edge) => edge.key === key)) return
    options.saveHistoryPoint()
    options.setEdges((current) => current.filter((edge) => edge.key !== key))
    options.clearGraphSelection()
    options.clearResult()
  }

  const selectEvaluationWorld = (worldId: string) => {
    if (!options.canEditEvaluation || !worldId) return
    options.saveHistoryPoint()
    options.setEvaluationWorld(worldId)
    options.clearResult()
  }

  return { renameWorld, updateWorldAtoms, addWorld, tidyModel, removeWorld, addEdge, commitEdgeDraft, replaceEdgeEndpoint, connectWorlds, deleteEdge, selectEvaluationWorld }
}
