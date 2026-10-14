import type { ObjectiveScope } from '../logic'
import type { ModelSnapshot } from '../workspace/model-types'

export interface AuthorStartSnapshot extends ModelSnapshot {
  readonly formulaSource: string
  readonly comparisonFormulaSource: string
  readonly targetTruth: boolean
  readonly evaluationScope: ObjectiveScope
  readonly selectedCorrespondence: string
}
