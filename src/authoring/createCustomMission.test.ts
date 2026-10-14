import { describe, expect, it } from 'vitest'
import { createCustomMission, type AuthoringMissionDraft, type AuthoringMissionStart } from './createCustomMission'

const start: AuthoringMissionStart = {
  formulaSource: '◇p', comparisonFormulaSource: '', targetTruth: true, evaluationScope: 'pointed', selectedCorrespondence: '', evaluationWorld: 'w0',
  worlds: [{ id: ' w0 ', atoms: '', position: { x: 0, y: 0 } }, { id: 'w1', atoms: 'p', position: { x: 200, y: 0 } }],
  edges: [{ from: 'w0', to: 'w1' }],
  frameRules: { reflexive: 'off', symmetric: 'off', transitive: 'off', euclidean: 'off', serial: 'off', irreflexive: 'off', acyclic: 'off' },
}

const draft = (overrides: Partial<AuthoringMissionDraft> = {}): AuthoringMissionDraft => ({
  title: '  Reach p  ', instruction: 'Make ◇p true at w0.', learningObjective: 'Use an accessible witness.', concept: 'possibility, witness', prerequisites: 'atoms', difficulty: 'introductory',
  editable: new Set(['edges']), bounds: { minimumWorlds: '2', maximumWorlds: '', minimumEdges: '', maximumEdges: '', maximumChanges: '' },
  requiredProperties: new Set(), forbiddenProperties: new Set(), requiredEdges: 'w0 -> w1', forbiddenEdges: '', requiredAtoms: 'w1: p', forbiddenAtoms: '',
  bonusMaximumEdges: '', predictionKind: 'frame-property', predictionProperty: 'serial', framePropertyNames: ['reflexive', 'serial'],
  ...overrides,
})

describe('custom mission builder', () => {
  it('turns captured editor data and authoring fields into a normalized mission', () => {
    const mission = createCustomMission(start, draft())
    expect(mission).toMatchObject({
      id: 'custom-reach-p', title: 'Reach p', evaluationWorld: 'w0', worlds: [{ id: 'w0' }, { id: 'w1' }],
      constraints: { minimumWorlds: 2, requiredEdges: [{ from: 'w0', to: 'w1' }], requiredAtoms: { w1: ['p'] } },
      prediction: { kind: 'frame-property', expectedProperty: 'serial', mustBeCorrect: true },
    })
  })

  it('keeps contradictory authored constraints invalid at the data boundary', () => {
    expect(() => createCustomMission(start, draft({ forbiddenEdges: 'w0 -> w1' }))).toThrow(/both required and forbidden/i)
  })
})
