import type { GameLevel } from '../campaign'
import type { FramePropertyName, ObjectiveScope } from '../logic'
import { assertCompatibleAuthoredConstraints, parseAuthoredAtoms, parseAuthoredEdges } from '../author-constraints'

export interface AuthoringMissionStart {
  readonly formulaSource: string
  readonly comparisonFormulaSource: string
  readonly targetTruth: boolean
  readonly evaluationScope: ObjectiveScope
  readonly selectedCorrespondence: string
  readonly evaluationWorld: string
  readonly worlds: readonly { readonly id: string; readonly atoms: string; readonly position: { readonly x: number; readonly y: number } }[]
  readonly edges: readonly { readonly from: string; readonly to: string }[]
  readonly frameRules: NonNullable<GameLevel['frameRules']>
}

export interface AuthoringMissionDraft {
  readonly title: string
  readonly instruction: string
  readonly learningObjective: string
  readonly concept: string
  readonly prerequisites: string
  readonly difficulty: NonNullable<GameLevel['estimatedDifficulty']>
  readonly editable: ReadonlySet<string>
  readonly bounds: { readonly minimumWorlds: string; readonly maximumWorlds: string; readonly minimumEdges: string; readonly maximumEdges: string; readonly maximumChanges: string }
  readonly requiredProperties: ReadonlySet<FramePropertyName>
  readonly forbiddenProperties: ReadonlySet<FramePropertyName>
  readonly requiredEdges: string
  readonly forbiddenEdges: string
  readonly requiredAtoms: string
  readonly forbiddenAtoms: string
  readonly bonusMaximumEdges: string
  readonly predictionKind: 'none' | 'truth' | 'counterexample-world' | 'frame-property'
  readonly predictionProperty: FramePropertyName
  readonly framePropertyNames: readonly FramePropertyName[]
}

const numericBound = (value: string) => value.trim() === '' ? undefined : Number(value)

/** Converts authoring form data and a captured editor state into one playable mission. */
export function createCustomMission(start: AuthoringMissionStart, draft: AuthoringMissionDraft): GameLevel {
  const worldIds = start.worlds.map(({ id }) => id.trim())
  const constraints = {
    minimumWorlds: numericBound(draft.bounds.minimumWorlds), maximumWorlds: numericBound(draft.bounds.maximumWorlds),
    minimumEdges: numericBound(draft.bounds.minimumEdges), maximumEdges: numericBound(draft.bounds.maximumEdges),
    maximumChanges: numericBound(draft.bounds.maximumChanges),
    requiredProperties: [...draft.requiredProperties], forbiddenProperties: [...draft.forbiddenProperties],
    requiredEdges: parseAuthoredEdges(draft.requiredEdges, worldIds), forbiddenEdges: parseAuthoredEdges(draft.forbiddenEdges, worldIds),
    requiredAtoms: parseAuthoredAtoms(draft.requiredAtoms, worldIds), forbiddenAtoms: parseAuthoredAtoms(draft.forbiddenAtoms, worldIds),
  }
  assertCompatibleAuthoredConstraints(constraints)
  return {
    id: `custom-${draft.title.toLowerCase().replace(/[^a-z0-9]+/gu, '-').replace(/^-|-$/gu, '') || 'mission'}`,
    chapter: 'Custom mission',
    title: draft.title.trim() || 'Custom mission',
    concept: draft.concept.trim() || 'User-authored modal logic objective',
    conceptTags: draft.concept.split(',').map((tag) => tag.trim()).filter(Boolean),
    prerequisites: draft.prerequisites.split(',').map((item) => item.trim()).filter(Boolean),
    estimatedDifficulty: draft.difficulty,
    learningObjective: draft.learningObjective.trim() || undefined,
    instruction: draft.instruction.trim() || 'Satisfy the configured objective.',
    formula: start.formulaSource,
    comparisonFormula: start.comparisonFormulaSource.trim() || undefined,
    scope: start.evaluationScope,
    targetTruth: start.targetTruth,
    evaluationWorld: start.evaluationWorld,
    correspondencePreset: start.selectedCorrespondence as GameLevel['correspondencePreset'] || undefined,
    worlds: start.worlds.map(({ id, atoms, position }) => ({ id: id.trim(), atoms, position })),
    edges: start.edges.map(({ from, to }) => ({ from, to })),
    frameRules: start.frameRules,
    constraints,
    bonusConstraints: draft.bonusMaximumEdges.trim() === '' ? undefined : { maximumEdges: Number(draft.bonusMaximumEdges) },
    prediction: draft.predictionKind === 'none' ? undefined : {
      kind: draft.predictionKind,
      prompt: draft.predictionKind === 'truth' ? `Will ${start.formulaSource} satisfy the configured semantic target?` : draft.predictionKind === 'counterexample-world' ? `Which world will falsify ${start.formulaSource}?` : 'Which relational property is the intended answer?',
      expectedProperty: draft.predictionKind === 'frame-property' ? draft.predictionProperty : undefined,
      propertyChoices: draft.predictionKind === 'frame-property' ? draft.framePropertyNames : undefined,
      mustBeCorrect: draft.predictionKind === 'frame-property' ? true : undefined,
    },
    editable: [...draft.editable] as GameLevel['editable'],
  }
}
