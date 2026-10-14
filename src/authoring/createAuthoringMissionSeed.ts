import type { GameLevel } from '../campaign'
import type { FramePropertyName } from '../logic'
import type { FrameRules } from '../workspace/model-types'
import type { AuthorStartSnapshot } from './authoring-types'

export interface AuthoringMissionSeed {
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
  readonly predictionProperty?: FramePropertyName
  readonly startSnapshot: AuthorStartSnapshot
}

const atomText = (values?: Readonly<Record<string, readonly string[]>>) => values
  ? Object.entries(values).map(([world, atoms]) => `${world}: ${atoms.join(' ')}`).join('\n')
  : ''

/** Maps a playable mission into the authoring form without parsing presentation state. */
export function createAuthoringMissionSeed(source: GameLevel, defaultFrameRules: FrameRules): AuthoringMissionSeed {
  const predictionKind = source.prediction?.kind === 'truth' || source.prediction?.kind === 'counterexample-world' || source.prediction?.kind === 'frame-property'
    ? source.prediction.kind
    : 'none'
  return {
    title: source.title,
    instruction: source.instruction,
    learningObjective: source.learningObjective ?? '',
    concept: source.conceptTags?.join(', ') || source.concept,
    prerequisites: source.prerequisites?.join(', ') ?? '',
    difficulty: source.estimatedDifficulty ?? 'intermediate',
    editable: new Set(source.editable),
    bounds: {
      minimumWorlds: source.constraints?.minimumWorlds?.toString() ?? '', maximumWorlds: source.constraints?.maximumWorlds?.toString() ?? '',
      minimumEdges: source.constraints?.minimumEdges?.toString() ?? '', maximumEdges: source.constraints?.maximumEdges?.toString() ?? '', maximumChanges: source.constraints?.maximumChanges?.toString() ?? '',
    },
    requiredProperties: new Set(source.constraints?.requiredProperties ?? []),
    forbiddenProperties: new Set(source.constraints?.forbiddenProperties ?? []),
    requiredEdges: source.constraints?.requiredEdges?.map(({ from, to }) => `${from} -> ${to}`).join(', ') ?? '',
    forbiddenEdges: source.constraints?.forbiddenEdges?.map(({ from, to }) => `${from} -> ${to}`).join(', ') ?? '',
    requiredAtoms: atomText(source.constraints?.requiredAtoms),
    forbiddenAtoms: atomText(source.constraints?.forbiddenAtoms),
    bonusMaximumEdges: source.bonusConstraints?.maximumEdges?.toString() ?? '',
    predictionKind,
    predictionProperty: source.prediction?.kind === 'frame-property' ? source.prediction.expectedProperty : undefined,
    startSnapshot: {
      worlds: source.worlds.map((world, key) => ({ ...world, key })),
      edges: source.edges.map((edge, key) => ({ ...edge, key })),
      evaluationWorld: source.evaluationWorld,
      frameRules: { ...defaultFrameRules, ...source.frameRules },
      formulaSource: source.formula ?? '', comparisonFormulaSource: source.comparisonFormula ?? '',
      targetTruth: source.targetTruth ?? true, evaluationScope: source.scope ?? 'pointed', selectedCorrespondence: source.correspondencePreset ?? '',
    },
  }
}
