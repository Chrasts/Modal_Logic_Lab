import { useState } from 'react'

interface KeyedModelItem {
  readonly key: number
}

interface WorkspaceModelInitialState<World extends KeyedModelItem, Edge extends KeyedModelItem, Scope, Rules> {
  readonly formulaSource: string
  readonly comparisonFormulaSource: string
  readonly worlds: readonly World[]
  readonly edges: readonly Edge[]
  readonly evaluationWorld: string
  readonly targetTruth: boolean
  readonly evaluationScope: Scope
  readonly frameRules: Rules
}

/**
 * Mutable finite-model state and immediate verification UI state. It deliberately
 * does not evaluate formulas or mutate worlds: those domain actions remain in
 * the calling workspace controller.
 */
export function useWorkspaceModel<World extends KeyedModelItem, Edge extends KeyedModelItem, Scope, Rules, Result, EdgeDraft>(initial: WorkspaceModelInitialState<World, Edge, Scope, Rules>) {
  const [formulaSource, setFormulaSource] = useState(initial.formulaSource)
  const [comparisonFormulaSource, setComparisonFormulaSource] = useState(initial.comparisonFormulaSource)
  const [worlds, setWorlds] = useState<World[]>(() => [...initial.worlds])
  const [edges, setEdges] = useState<Edge[]>(() => [...initial.edges])
  const [edgeDraft, setEdgeDraft] = useState<EdgeDraft | null>(null)
  const [edgeEditErrors, setEdgeEditErrors] = useState<Readonly<Record<number, string>>>({})
  const [evaluationWorld, setEvaluationWorld] = useState(initial.evaluationWorld)
  const [targetTruth, setTargetTruth] = useState(initial.targetTruth)
  const [evaluationScope, setEvaluationScope] = useState(initial.evaluationScope)
  const [frameRules, setFrameRules] = useState(initial.frameRules)
  const [result, setResult] = useState<Result | null>(null)
  const [predictionAnswer, setPredictionAnswer] = useState('')
  const [traceStepIndex, setTraceStepIndex] = useState(0)
  const [nextWorldKey, setNextWorldKey] = useState(() => Math.max(-1, ...initial.worlds.map(({ key }) => key)) + 1)
  const [nextEdgeKey, setNextEdgeKey] = useState(() => Math.max(-1, ...initial.edges.map(({ key }) => key)) + 1)

  return {
    formulaSource, setFormulaSource,
    comparisonFormulaSource, setComparisonFormulaSource,
    worlds, setWorlds,
    edges, setEdges,
    edgeDraft, setEdgeDraft,
    edgeEditErrors, setEdgeEditErrors,
    evaluationWorld, setEvaluationWorld,
    targetTruth, setTargetTruth,
    evaluationScope, setEvaluationScope,
    frameRules, setFrameRules,
    result, setResult,
    predictionAnswer, setPredictionAnswer,
    traceStepIndex, setTraceStepIndex,
    nextWorldKey, setNextWorldKey,
    nextEdgeKey, setNextEdgeKey,
  }
}
