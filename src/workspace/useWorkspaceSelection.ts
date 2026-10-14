import { useState } from 'react'

/** Ephemeral graph selection and highlighting; it never changes model semantics. */
export function useWorkspaceSelection<FrameWitness, FlowInstance>() {
  const [selectedEdgeKey, setSelectedEdgeKey] = useState<number | null>(null)
  const [selectedWorldKey, setSelectedWorldKey] = useState<number | null>(null)
  const [activeFrameWitness, setActiveFrameWitness] = useState<FrameWitness | null>(null)
  const [hoveredWorldKey, setHoveredWorldKey] = useState<number | null>(null)
  const [collidingWorldKeys, setCollidingWorldKeys] = useState<ReadonlySet<number>>(new Set())
  const [expandedRelationPairKey, setExpandedRelationPairKey] = useState<string | null>(null)
  const [flowInstance, setFlowInstance] = useState<FlowInstance | null>(null)
  const clearGraphSelection = () => {
    setSelectedWorldKey(null)
    setSelectedEdgeKey(null)
    setExpandedRelationPairKey(null)
  }
  const selectWorld = (key: number) => {
    setSelectedWorldKey(key)
    setSelectedEdgeKey(null)
    setExpandedRelationPairKey(null)
  }
  const selectExplicitEdge = (key: number | null) => {
    setSelectedWorldKey(null)
    setSelectedEdgeKey(key)
    setExpandedRelationPairKey(null)
  }
  const selectReciprocalPair = (pairKey: string) => {
    setSelectedWorldKey(null)
    setSelectedEdgeKey(null)
    setExpandedRelationPairKey(pairKey)
  }

  return {
    selectedEdgeKey, setSelectedEdgeKey,
    selectedWorldKey, setSelectedWorldKey,
    activeFrameWitness, setActiveFrameWitness,
    hoveredWorldKey, setHoveredWorldKey,
    collidingWorldKeys, setCollidingWorldKeys,
    expandedRelationPairKey, setExpandedRelationPairKey,
    flowInstance, setFlowInstance,
    clearGraphSelection, selectWorld, selectExplicitEdge, selectReciprocalPair,
  }
}
