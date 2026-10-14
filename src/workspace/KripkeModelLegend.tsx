import { Panel } from '@xyflow/react'

interface KripkeModelLegendProps {
  readonly hasExplorerHighlight: boolean
  readonly traceWitnessWorld?: string
  readonly traceCounterexampleWorld?: string
  readonly derivedRelationCount: number
  readonly hasBidirectionalRelation: boolean
  readonly hasDerivedReflexiveRelation: boolean
  readonly hasActiveTrace: boolean
}

/** Semantic map legend; every entry corresponds to a visible model state. */
export function KripkeModelLegend({
  hasExplorerHighlight, traceWitnessWorld, traceCounterexampleWorld, derivedRelationCount,
  hasBidirectionalRelation, hasDerivedReflexiveRelation, hasActiveTrace,
}: KripkeModelLegendProps) {
  return <Panel position="bottom-center" className="trace-legend" aria-label="Model state legend">
    <details><summary>Legend</summary><div>
      <span><i className="selected" />SELECTED</span>
      <span><i className="current" />EVALUATION WORLD</span>
      {hasExplorerHighlight && <><span><i className="explorer-true" />✓ SUBFORMULA TRUE</span><span><i className="explorer-false" />✕ SUBFORMULA FALSE</span></>}
      {traceWitnessWorld && <span><i className="witness" />WITNESS</span>}
      {traceCounterexampleWorld && <span><i className="counterexample" />COUNTEREXAMPLE</span>}
      <span><i className="explicit-edge" />EXPLICIT RELATION</span>
      {derivedRelationCount > 0 && <span><i className="derived" />DERIVED RELATION</span>}
      {hasBidirectionalRelation && <span><i className="two-way" />TWO-WAY</span>}
      <span><i className="reflexive" />EXPLICIT ↻</span>
      {hasDerivedReflexiveRelation && <span><i className="reflexive derived-reflexive" />DERIVED ↻</span>}
      {hasActiveTrace && <><span><i className="checked" />CHECKED</span><span><i className="irrelevant" />IRRELEVANT</span></>}
    </div></details>
  </Panel>
}
