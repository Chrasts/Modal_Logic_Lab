import { describe, expect, it } from 'vitest'
import type { GameLevel } from '../campaign'
import { createAuthoringMissionSeed } from './createAuthoringMissionSeed'

const source: GameLevel = {
  id: 'source', chapter: 'Campaign', title: 'Source mission', concept: 'Possibility', conceptTags: ['possibility'], prerequisites: ['atoms'], estimatedDifficulty: 'advanced', learningObjective: 'Build a witness.', instruction: 'Make ◇p true.',
  formula: '◇p', scope: 'pointed', targetTruth: true, evaluationWorld: 'w0', worlds: [{ id: 'w0', atoms: '', position: { x: 0, y: 0 } }, { id: 'w1', atoms: 'p', position: { x: 200, y: 0 } }], edges: [{ from: 'w0', to: 'w1' }],
  constraints: { minimumWorlds: 2, requiredEdges: [{ from: 'w0', to: 'w1' }], requiredAtoms: { w1: ['p'] } }, bonusConstraints: { maximumEdges: 1 },
  prediction: { kind: 'frame-property', prompt: 'Which property?', expectedProperty: 'serial' }, editable: ['edges'],
}

const rules = { reflexive: 'off', symmetric: 'off', transitive: 'off', euclidean: 'off', serial: 'off', irreflexive: 'off', acyclic: 'off' } as const

describe('authoring mission seed', () => {
  it('preserves editable, prediction, bonus, and semantic data from a source mission', () => {
    const seed = createAuthoringMissionSeed(source, rules)
    expect(seed).toMatchObject({
      title: 'Source mission', difficulty: 'advanced', requiredEdges: 'w0 -> w1', requiredAtoms: 'w1: p', bonusMaximumEdges: '1',
      predictionKind: 'frame-property', predictionProperty: 'serial', startSnapshot: { formulaSource: '◇p', worlds: [{ id: 'w0', key: 0 }, { id: 'w1', key: 1 }] },
    })
    expect(seed.editable).toEqual(new Set(['edges']))
  })
})
