import { parseFormula } from '../logic'
import type { AuthorStartSnapshot } from './authoring-types'

interface AuthoringStepValidationOptions {
  readonly step: number
  readonly title: string
  readonly instruction: string
  readonly learningObjective: string
  readonly concept: string
  readonly formulaSource: string
  readonly evaluationWorld: string
  readonly editableCount: number
  readonly startSnapshot: AuthorStartSnapshot | null
  readonly currentSnapshot: () => AuthorStartSnapshot
  readonly hasReferenceSolution: boolean
  readonly validateMission: () => void
}

/** Returns learner-facing authoring errors without mutating the wizard state. */
export function validateAuthoringStep(options: AuthoringStepValidationOptions): readonly string[] {
  if (options.step === 1) return [
    !options.title.trim() && 'Enter a mission title.',
    !options.instruction.trim() && 'Enter a learner-facing instruction.',
    !options.learningObjective.trim() && 'Enter a learning objective.',
    !options.concept.trim() && 'Add at least one concept tag.',
  ].filter((message): message is string => Boolean(message))
  if (options.step === 2) return options.startSnapshot ? [] : ['Capture the initial model before continuing.']
  if (options.step === 3) {
    const errors: string[] = []
    try { parseFormula(options.formulaSource) } catch (error) { errors.push(error instanceof Error ? error.message : 'Enter a valid formula.') }
    const snapshot = options.startSnapshot ?? options.currentSnapshot()
    if (!snapshot.worlds.some(({ id }) => id.trim() === options.evaluationWorld)) errors.push('Select an evaluation world that exists in the captured start.')
    return errors
  }
  if (options.step === 4) return options.editableCount > 0 ? [] : ['Unlock at least one player control.']
  if (options.step === 5) {
    try { options.validateMission(); return [] } catch (error) { return [error instanceof Error ? error.message : 'The constraints are invalid.'] }
  }
  if (options.step === 7) return [
    !options.startSnapshot && 'Capture the initial model first.',
    !options.hasReferenceSolution && 'Capture and verify a reference solution.',
  ].filter((message): message is string => Boolean(message))
  return []
}
