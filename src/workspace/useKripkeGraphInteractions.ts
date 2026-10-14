import type { Connection, Edge as FlowEdge, IsValidConnection, Node as FlowNode, NodeMouseHandler, OnEdgesDelete, OnNodeDrag, ReactFlowInstance, ReactFlowProps } from '@xyflow/react'
import type { Dispatch, SetStateAction } from 'react'
import { validateExplicitEdgeCandidate } from './model-integrity'
import type { EditableEdge, EditableWorld } from './model-types'
import { commitWorldPosition, findOverlappingWorldKeys, shouldCreateWorldFromPaneClick, WORLD_NODE_SIZE, type WorldPosition } from './world-placement'

const explicitKeyFromFlowEdgeId = (id: string) => id.startsWith('explicit:') ? Number(id.slice(9)) : null

interface KripkeGraphInteractionOptions {
  readonly worlds: readonly EditableWorld[]
  readonly edges: readonly EditableEdge[]
  readonly canEditWorlds: boolean
  readonly canEditEdges: boolean
  readonly canRepositionWorlds: boolean
  readonly chooseWorldAnswer: boolean
  readonly flowInstance: ReactFlowInstance | null
  readonly saveHistoryPoint: (preserveResultOrEvent?: unknown) => void
  readonly setWorlds: Dispatch<SetStateAction<EditableWorld[]>>
  readonly setCollidingWorldKeys: Dispatch<SetStateAction<ReadonlySet<number>>>
  readonly setHoveredWorldKey: Dispatch<SetStateAction<number | null>>
  readonly clearGraphSelection: () => void
  readonly clearFrameWitness: () => void
  readonly selectWorld: (key: number) => void
  readonly selectExplicitEdge: (key: number | null) => void
  readonly selectReciprocalPair: (key: string) => void
  readonly choosePredictionAnswer: (worldId: string) => void
  readonly connectWorlds: (connection: Connection) => void
  readonly deleteEdge: (key: number) => void
  readonly addWorld: (position?: WorldPosition) => void
}

/** UI-only React Flow event wiring for the finite-model workspace. */
export function useKripkeGraphInteractions(options: KripkeGraphInteractionOptions) {
  const onNodeDragStart: OnNodeDrag<FlowNode> = () => {
    if (!options.canRepositionWorlds) return
    options.saveHistoryPoint(true)
    options.setCollidingWorldKeys(new Set())
  }
  const onNodeDrag: OnNodeDrag<FlowNode> = (_event, node) => {
    options.setCollidingWorldKeys(findOverlappingWorldKeys(options.worlds, Number(node.id), node.position))
  }
  const onNodeDragStop: OnNodeDrag<FlowNode> = (_event, node) => {
    options.setWorlds((current) => commitWorldPosition(current, Number(node.id), node.position) as EditableWorld[])
    options.setCollidingWorldKeys(new Set())
  }
  const onNodeMouseEnter: NodeMouseHandler<FlowNode> = (_event, node) => options.setHoveredWorldKey(Number(node.id))
  const onNodeMouseLeave: NodeMouseHandler<FlowNode> = () => options.setHoveredWorldKey(null)
  const onNodeClick: NodeMouseHandler<FlowNode> = (_event, node) => {
    const world = options.worlds.find(({ key }) => key === Number(node.id))
    if (world && options.chooseWorldAnswer) options.choosePredictionAnswer(world.id.trim())
    else options.selectWorld(Number(node.id))
  }
  const isValidConnection: IsValidConnection = (connection) => {
    if (!options.canEditEdges || !connection.source || !connection.target) return false
    const source = options.worlds.find(({ key }) => String(key) === connection.source)?.id.trim()
    const target = options.worlds.find(({ key }) => String(key) === connection.target)?.id.trim()
    return Boolean(source && target && !validateExplicitEdgeCandidate(options.worlds, options.edges, source, target))
  }
  const onEdgeClick: NonNullable<ReactFlowProps['onEdgeClick']> = (_event, edge) => {
    const pairKey = (edge.data as { pairKey?: string } | undefined)?.pairKey
    if (edge.id.startsWith('pair:') && pairKey) {
      options.selectReciprocalPair(pairKey)
      return
    }
    options.selectExplicitEdge(options.canEditEdges ? explicitKeyFromFlowEdgeId(edge.id) : null)
  }
  const onEdgesDelete: OnEdgesDelete<FlowEdge> = (deleted) => deleted.forEach(({ id }) => {
    const key = explicitKeyFromFlowEdgeId(id)
    if (key !== null) options.deleteEdge(key)
  })
  const onPaneClick: NonNullable<ReactFlowProps['onPaneClick']> = (event) => {
    options.clearGraphSelection()
    options.clearFrameWitness()
    if (shouldCreateWorldFromPaneClick({ detail: event.detail, canEditWorlds: options.canEditWorlds, pointerType: 'pointerType' in event ? String(event.pointerType) : 'mouse' }) && options.flowInstance) {
      const position = options.flowInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY })
      options.addWorld({ x: position.x - WORLD_NODE_SIZE / 2, y: position.y - WORLD_NODE_SIZE / 2 })
    }
  }

  return { onNodeDragStart, onNodeDrag, onNodeDragStop, onNodeMouseEnter, onNodeMouseLeave, onNodeClick, isValidConnection, onEdgeClick, onEdgesDelete, onPaneClick }
}
