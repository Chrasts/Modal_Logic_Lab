import { describe, expect, it } from 'vitest'
import type { GameLevel } from '../campaign'
import { evaluateWorkspaceVerification } from './evaluateWorkspaceVerification'

const level = (overrides: Partial<GameLevel> = {}): GameLevel => ({
  id: 'verification-test', chapter: 'Test', title: 'Verification test', concept: 'Test objective',
  instruction: 'Make ◇p true at w0.', formula: '◇p', scope: 'pointed', targetTruth: true,
  evaluationWorld: 'w0', worlds: [{ id: 'w0', atoms: '', position: { x: 0, y: 0 } }], edges: [], editable: ['edges'],
  ...overrides,
})

const baseInput = () => ({
  activeLevel: level(), activeLevelFailureCount: 0, formulaSource: '◇p', comparisonFormulaSource: '',
  worlds: [{ key: 0, id: 'w0', atoms: '', position: { x: 0, y: 0 } }], edges: [], effectiveEdges: [],
  evaluationWorld: 'w0', targetTruth: true, evaluationScope: 'pointed' as const,
  frameRules: { reflexive: 'off', symmetric: 'off', transitive: 'off', euclidean: 'off', serial: 'off', irreflexive: 'off', acyclic: 'off' },
  frameRuleResults: [], predictionAnswer: '', isConstructionObjective: false,
})

describe('workspace verification controller', () => {
  it('keeps the semantic failure category and lesson diagnostic separate from UI state', () => {
    const outcome = evaluateWorkspaceVerification({
      ...baseInput(),
      diagnosticFeedback: { 'missing-diamond-witness': 'Add an accessible p-world.' },
    })
    expect(outcome).toMatchObject({
      success: false,
      failureCategory: 'missing-diamond-witness',
      result: { kind: 'failure', diagnostic: 'Add an accessible p-world.' },
    })
  })

  it('requires a mission prediction before evaluating a first attempt', () => {
    const outcome = evaluateWorkspaceVerification({
      ...baseInput(),
      activeLevel: level({ prediction: { kind: 'truth', prompt: 'Will it hold?' } }),
    })
    expect(outcome).toMatchObject({
      success: false,
      failureCategory: 'missing-answer',
      result: { message: 'Make a prediction first' },
    })
  })

  it('rejects construction constraints before semantic verification', () => {
    const outcome = evaluateWorkspaceVerification({
      ...baseInput(),
      activeLevel: level({ constraints: { minimumEdges: 1 } }),
    })
    expect(outcome).toMatchObject({
      success: false,
      failureCategory: 'construction',
      result: { message: 'Construction constraint not met' },
    })
  })
})
