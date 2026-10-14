import type { GameLevel } from '../campaign'
import type { AttemptFailureCategory } from '../campaign/useCampaignPersistence'
import {
  checkConstructionConstraints,
  parseFormula,
  verifyConstructionObjective,
  verifyObjective,
  type AccessibilityEdge,
  type FramePropertyName,
  type FramePropertyResult,
  type ObjectiveScope,
  type ObjectiveVerdict,
  type EvaluationTrace,
} from '../logic'
import { validateEditableModel } from './model-integrity'
import type { EditableEdge, EditableWorld } from './model-types'

export type WorkspaceVerificationResult =
  | { readonly kind: 'success' | 'failure'; readonly message: string; readonly detail: string; readonly diagnostic?: string; readonly verdict?: ObjectiveVerdict; readonly bonus?: { achieved: boolean; detail: string }; readonly prediction?: { correct: boolean; detail: string } }
  | { readonly kind: 'error'; readonly message: string }
  | null

export interface WorkspaceVerificationOutcome {
  readonly result: NonNullable<WorkspaceVerificationResult>
  readonly success: boolean
  readonly bonusAchieved?: boolean
  readonly failureCategory?: AttemptFailureCategory
}

interface VerificationInput {
  readonly activeLevel?: GameLevel
  readonly activeLevelFailureCount: number
  readonly formulaSource: string
  readonly comparisonFormulaSource: string
  readonly worlds: readonly EditableWorld[]
  readonly edges: readonly EditableEdge[]
  readonly effectiveEdges: readonly AccessibilityEdge[]
  readonly evaluationWorld: string
  readonly targetTruth: boolean
  readonly evaluationScope: ObjectiveScope
  readonly frameRules: Readonly<Record<FramePropertyName, string>>
  readonly frameRuleResults: readonly FramePropertyResult[]
  readonly correspondenceProperty?: FramePropertyName
  readonly predictionAnswer: string
  readonly isConstructionObjective: boolean
  readonly diagnosticFeedback?: Readonly<Record<string, string>>
}

function classifyObjectiveFailure(verdict: ObjectiveVerdict, scope: ObjectiveScope, targetTruth: boolean, evaluationWorld: string): AttemptFailureCategory {
  const traces: EvaluationTrace[] = []
  const visit = (trace: EvaluationTrace): void => {
    traces.push(trace)
    trace.children.forEach(visit)
  }
  verdict.formula.evaluationTraces?.forEach(visit)

  if (scope === 'pointed' && verdict.formula.truthByWorld?.some(({ worldId, value }) => worldId !== evaluationWorld && value === targetTruth)) return 'wrong-world'
  const isEquivalence = verdict.formula.label.toLowerCase().includes('equivalence')
  if (!isEquivalence && traces.some(({ rule, value }) => rule === 'possibility' && !value) && targetTruth) return 'missing-diamond-witness'
  if (!isEquivalence && traces.some(({ rule, value }) => rule === 'possibility' && value) && !targetTruth) return 'unwanted-diamond-witness'
  if (!isEquivalence && traces.some(({ rule, value }) => rule === 'necessity' && !value) && targetTruth) return 'box-counterexample'
  if (!isEquivalence && traces.some(({ rule, value, children }) => rule === 'necessity' && value && children.length === 0) && !targetTruth) return 'vacuous-box'
  if (scope === 'model') return 'model-global-counterexample'
  if (scope === 'frame' && verdict.formula.witnessValuation) return 'frame-countervaluation'
  if (scope === 'frame') return 'frame-validity-quantification'
  if (scope === 'correspondence') return 'correspondence-mismatch'
  return 'objective'
}

function evaluatePrediction(level: GameLevel, answer: string, verdict: ObjectiveVerdict) {
  const { prediction } = level
  if (!prediction || !answer) return undefined
  const correct = prediction.kind === 'truth'
    ? answer === String(verdict.formula.holds)
    : prediction.kind === 'counterexample-world'
      ? Boolean(verdict.formula.truthByWorld?.some(({ worldId, value }) => worldId === answer && !value))
      : prediction.kind === 'world-choice'
        ? answer === prediction.expectedChoice
        : prediction.kind === 'frame-property'
          ? answer === prediction.expectedProperty
          : answer === prediction.expectedChoice
  const detail = correct
    ? 'Your prediction matched the semantic evaluation.'
    : prediction.kind === 'truth'
      ? `You predicted ${answer}, but the formula evaluated as ${verdict.formula.holds}.`
      : prediction.kind === 'counterexample-world'
        ? `${answer} is not a counterexample world under the evaluated valuation.`
        : prediction.kind === 'world-choice'
          ? `${answer} is not the accessible witness required here.`
          : prediction.kind === 'frame-property'
            ? `${answer} is not the required relational property.`
            : prediction.kind === 'scope-truth'
              ? 'At least one of your local, global, or frame-valid predictions did not match.'
              : prediction.kind === 'countervaluation'
                ? `${answer} is not the countervaluation that refutes the formula.`
                : prediction.kind === 'statement-choice'
                  ? 'That interpretation is not correct for this model.'
                  : `${answer} is not the required candidate model.`
  return { correct, detail }
}

/** Evaluates a model objective without mutating UI, progress, or persistence state. */
export function evaluateWorkspaceVerification(input: VerificationInput): WorkspaceVerificationOutcome {
  const missingScopePrediction = input.activeLevel?.prediction?.kind === 'scope-truth' && input.predictionAnswer.split(',').filter(Boolean).length !== 3
  if (input.activeLevel?.prediction && input.activeLevelFailureCount === 0 && (!input.predictionAnswer || missingScopePrediction)) {
    return { success: false, failureCategory: 'missing-answer', result: { kind: 'failure', message: 'Make a prediction first', detail: input.activeLevel.prediction.prompt } }
  }

  const ids = input.worlds.map(({ id }) => id.trim())
  if (validateEditableModel(input.worlds, input.edges).length > 0) throw new Error('The editable model contains an invalid world name or explicit relation. Repair it before verification.')
  if (ids.length === 0) throw new Error('Add at least one world before verification.')
  if (ids.some((id) => !id)) throw new Error('Every world must have a name.')
  if (new Set(ids).size !== ids.length) throw new Error('World names must be unique.')
  if (input.evaluationScope === 'pointed' && !ids.includes(input.evaluationWorld)) throw new Error('Select an existing evaluation world.')

  const valuation = Object.fromEntries(input.worlds.map(({ id, atoms }) => [id.trim(), atoms.split(/[\s,]+/u).map((value) => value.trim()).filter(Boolean)]))
  const explicitEdges: AccessibilityEdge[] = input.edges.map(({ from, to }) => ({ from, to }))
  const constraintInput = {
    worldIds: ids,
    explicitEdges,
    effectiveEdges: input.effectiveEdges,
    valuation,
    baseline: input.activeLevel ? {
      worldIds: input.activeLevel.worlds.map(({ id }) => id),
      explicitEdges: input.activeLevel.edges,
      valuation: Object.fromEntries(input.activeLevel.worlds.map(({ id, atoms }) => [id, atoms.split(/[\s,]+/u).filter(Boolean)])),
    } : undefined,
  }
  const constraintViolation = input.activeLevel?.constraints && checkConstructionConstraints(constraintInput, input.activeLevel.constraints)[0]
  if (constraintViolation) return { success: false, failureCategory: 'construction', result: { kind: 'failure', message: 'Construction constraint not met', detail: constraintViolation } }

  const requiredRule = Object.entries(input.activeLevel?.requiredFrameRules ?? {}).find(([property, mode]) => input.frameRules[property as FramePropertyName] !== mode)
  if (requiredRule) {
    const [property, mode] = requiredRule
    return { success: false, failureCategory: 'frame-configuration', result: { kind: 'failure', message: 'Frame constraint not configured', detail: `Set ${property} to ${mode}.` } }
  }
  const failedRule = input.frameRuleResults.find((result) => !result.holds)
  if (failedRule) return { success: false, failureCategory: 'frame-property', result: { kind: 'failure', message: `The frame is not ${failedRule.property}.`, detail: failedRule.violations[0] ?? 'The selected frame rule is violated.' } }

  const comparisonFormula = input.comparisonFormulaSource.trim() ? parseFormula(input.comparisonFormulaSource) : undefined
  const verdict = input.isConstructionObjective
    ? verifyConstructionObjective(input.activeLevel?.structuralObjective ?? {}, { evaluationWorld: input.evaluationWorld })
    : verifyObjective({ scope: input.evaluationScope, targetTruth: input.targetTruth, evaluationWorld: input.evaluationWorld, correspondenceProperty: input.correspondenceProperty, comparisonTarget: input.activeLevel?.comparisonTarget }, {
      worldIds: ids, edges: input.effectiveEdges, valuation, formula: parseFormula(input.formulaSource), comparisonFormula,
    })
  const bonusViolations = verdict.success && input.activeLevel?.bonusConstraints ? checkConstructionConstraints(constraintInput, input.activeLevel.bonusConstraints) : []
  const prediction = input.activeLevel ? evaluatePrediction(input.activeLevel, input.predictionAnswer, verdict) : undefined
  const predictionRequiredAndWrong = Boolean(input.activeLevel?.prediction?.mustBeCorrect && prediction && !prediction.correct)
  const success = verdict.success && !predictionRequiredAndWrong
  const failureCategory = predictionRequiredAndWrong ? 'required-answer' : verdict.success ? undefined : classifyObjectiveFailure(verdict, input.evaluationScope, input.targetTruth, input.evaluationWorld)
  const bonusAchieved = success && input.activeLevel?.bonusConstraints ? bonusViolations.length === 0 : undefined
  return {
    success,
    bonusAchieved,
    failureCategory,
    result: {
      kind: success ? 'success' : 'failure', message: predictionRequiredAndWrong ? 'Required answer incorrect' : verdict.headline, detail: verdict.formula.summary,
      diagnostic: failureCategory ? input.diagnosticFeedback?.[failureCategory] : undefined, verdict,
      bonus: verdict.success && input.activeLevel?.bonusConstraints ? { achieved: bonusViolations.length === 0, detail: bonusViolations.length === 0 ? 'Optional bonus challenge achieved.' : `Bonus challenge not achieved: ${bonusViolations[0]}` } : undefined,
      prediction,
    },
  }
}
