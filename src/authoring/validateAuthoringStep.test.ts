import { describe, expect, it } from 'vitest'
import type { AuthorStartSnapshot } from './authoring-types'
import { validateAuthoringStep } from './validateAuthoringStep'

const snapshot: AuthorStartSnapshot = {
  formulaSource: 'p', comparisonFormulaSource: '', targetTruth: true, evaluationScope: 'pointed', selectedCorrespondence: '', evaluationWorld: 'w0',
  worlds: [{ key: 0, id: 'w0', atoms: '', position: { x: 0, y: 0 } }], edges: [],
  frameRules: { reflexive: 'off', symmetric: 'off', transitive: 'off', euclidean: 'off', serial: 'off', irreflexive: 'off', acyclic: 'off' },
}

const options = (step: number) => ({
  step, title: 'Mission', instruction: 'Do this.', learningObjective: 'Learn this.', concept: 'atoms', formulaSource: 'p', evaluationWorld: 'w0', editableCount: 1,
  startSnapshot: snapshot, currentSnapshot: () => snapshot, hasReferenceSolution: true, validateMission: () => undefined,
})

describe('authoring step validation', () => {
  it('requires non-redundant mission fields and a captured start at the appropriate steps', () => {
    expect(validateAuthoringStep({ ...options(1), title: '', concept: '' })).toEqual(['Enter a mission title.', 'Add at least one concept tag.'])
    expect(validateAuthoringStep({ ...options(2), startSnapshot: null })).toEqual(['Capture the initial model before continuing.'])
  })

  it('keeps formula, evaluation-world, and constraint validation deterministic', () => {
    expect(validateAuthoringStep({ ...options(3), formulaSource: '□(' })[0]).toMatch(/expected|formula/i)
    expect(validateAuthoringStep({ ...options(3), evaluationWorld: 'missing' })).toEqual(['Select an evaluation world that exists in the captured start.'])
    expect(validateAuthoringStep({ ...options(5), validateMission: () => { throw new Error('Conflicting constraints') } })).toEqual(['Conflicting constraints'])
  })
})
