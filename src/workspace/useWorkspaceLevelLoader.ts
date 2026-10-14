import type { Dispatch, SetStateAction } from 'react'
import type { GameLevel } from '../campaign'
import type { EditorMode } from './useWorkspacePresentation'
import type { EditableEdge, EditableWorld } from './model-types'

interface WorkspaceLevelLoaderOptions<FrameRules> {
  readonly defaultFrameRules: FrameRules
  readonly setCampaignLevelIndex: Dispatch<SetStateAction<number>>
  readonly setFormulaSource: Dispatch<SetStateAction<string>>
  readonly setComparisonFormulaSource: Dispatch<SetStateAction<string>>
  readonly setWorlds: Dispatch<SetStateAction<EditableWorld[]>>
  readonly setEdges: Dispatch<SetStateAction<EditableEdge[]>>
  readonly setEvaluationWorld: Dispatch<SetStateAction<string>>
  readonly setTargetTruth: Dispatch<SetStateAction<boolean>>
  readonly setEvaluationScope: Dispatch<SetStateAction<NonNullable<GameLevel['scope']>>>
  readonly setSelectedCorrespondence: Dispatch<SetStateAction<string>>
  readonly setFrameRules: Dispatch<SetStateAction<FrameRules>>
  readonly setNextWorldKey: Dispatch<SetStateAction<number>>
  readonly setNextEdgeKey: Dispatch<SetStateAction<number>>
  readonly setSelectedWorldKey: Dispatch<SetStateAction<number | null>>
  readonly setSelectedEdgeKey: Dispatch<SetStateAction<number | null>>
  readonly setHoveredWorldKey: Dispatch<SetStateAction<number | null>>
  readonly setExpandedRelationPairKey: Dispatch<SetStateAction<string | null>>
  readonly setLeftPanelOpen: Dispatch<SetStateAction<boolean>>
  readonly setRightPanelOpen: Dispatch<SetStateAction<boolean>>
  readonly setEditorMode: Dispatch<SetStateAction<EditorMode>>
  readonly clearResult: () => void
  readonly setPredictionAnswer: Dispatch<SetStateAction<string>>
  readonly clearHistory: () => void
}

/** Applies the complete, user-visible state of a campaign, Learn, or custom level. */
export function useWorkspaceLevelLoader<FrameRules>(options: WorkspaceLevelLoaderOptions<FrameRules>) {
  return (index: number, levels: readonly GameLevel[]) => {
    const level = levels[index]
    if (!level) return
    options.setCampaignLevelIndex(index)
    options.setFormulaSource(level.formula ?? '')
    options.setComparisonFormulaSource(level.comparisonFormula ?? '')
    options.setWorlds(level.worlds.map((world, key) => ({ ...world, key })))
    options.setEdges(level.edges.map((edge, key) => ({ ...edge, key })))
    options.setEvaluationWorld(level.evaluationWorld)
    options.setTargetTruth(level.targetTruth ?? true)
    options.setEvaluationScope(level.scope ?? 'pointed')
    options.setSelectedCorrespondence(level.correspondencePreset ?? '')
    options.setFrameRules({ ...options.defaultFrameRules, ...level.frameRules })
    options.setNextWorldKey(level.worlds.length)
    options.setNextEdgeKey(level.edges.length)
    options.setSelectedWorldKey(null)
    options.setSelectedEdgeKey(null)
    options.setHoveredWorldKey(null)
    options.setExpandedRelationPairKey(null)
    options.setLeftPanelOpen(true)
    options.setRightPanelOpen(false)
    options.setEditorMode('edit')
    options.clearResult()
    options.setPredictionAnswer('')
    options.clearHistory()
  }
}
