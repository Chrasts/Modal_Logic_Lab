export const authoringDefaults = {
  title: 'My custom mission',
  instruction: 'Satisfy the configured objective.',
  learningObjective: 'Explore this modal construction.',
  concept: 'User-authored modal logic objective',
  prerequisites: 'propositional connectives',
  difficulty: 'introductory' as const,
  predictionKind: 'none' as const,
}

export const createAuthoringBounds = () => ({
  minimumWorlds: '',
  maximumWorlds: '',
  minimumEdges: '',
  maximumEdges: '',
  maximumChanges: '',
})

export const createEditableAuthoringPermissions = () => new Set(['worlds', 'valuations', 'edges', 'constraints', 'evaluation'])
