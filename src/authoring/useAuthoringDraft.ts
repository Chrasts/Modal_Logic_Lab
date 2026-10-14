import { useState } from 'react'
import type { GameLevel } from '../campaign'
import type { FramePropertyName } from '../logic'
import { authoringDefaults, createAuthoringBounds, createEditableAuthoringPermissions } from './authoring-defaults'

export function useAuthoringDraft(initialTemplateId: string) {
  const [levelTitle, setLevelTitle] = useState(authoringDefaults.title)
  const [levelInstruction, setLevelInstruction] = useState(authoringDefaults.instruction)
  const [levelLearningObjective, setLevelLearningObjective] = useState(authoringDefaults.learningObjective)
  const [levelConcept, setLevelConcept] = useState(authoringDefaults.concept)
  const [levelPrerequisites, setLevelPrerequisites] = useState(authoringDefaults.prerequisites)
  const [levelDifficulty, setLevelDifficulty] = useState<NonNullable<GameLevel['estimatedDifficulty']>>(authoringDefaults.difficulty)
  const [authorTemplateId, setAuthorTemplateId] = useState(initialTemplateId)
  const [authorPreview, setAuthorPreview] = useState<'desktop' | 'mobile'>('desktop')
  const [levelEditable, setLevelEditable] = useState<ReadonlySet<string>>(createEditableAuthoringPermissions)
  const [levelBounds, setLevelBounds] = useState(createAuthoringBounds)
  const [levelRequiredProperties, setLevelRequiredProperties] = useState<ReadonlySet<FramePropertyName>>(new Set())
  const [levelForbiddenProperties, setLevelForbiddenProperties] = useState<ReadonlySet<FramePropertyName>>(new Set())
  const [levelPredictionKind, setLevelPredictionKind] = useState<'none' | 'truth' | 'counterexample-world' | 'frame-property'>(authoringDefaults.predictionKind)
  const [levelPredictionProperty, setLevelPredictionProperty] = useState<FramePropertyName>('reflexive')
  const [levelBonusMaximumEdges, setLevelBonusMaximumEdges] = useState('')
  const [levelRequiredEdges, setLevelRequiredEdges] = useState('')
  const [levelForbiddenEdges, setLevelForbiddenEdges] = useState('')
  const [levelRequiredAtoms, setLevelRequiredAtoms] = useState('')
  const [levelForbiddenAtoms, setLevelForbiddenAtoms] = useState('')

  return {
    levelTitle, setLevelTitle, levelInstruction, setLevelInstruction, levelLearningObjective, setLevelLearningObjective,
    levelConcept, setLevelConcept, levelPrerequisites, setLevelPrerequisites, levelDifficulty, setLevelDifficulty,
    authorTemplateId, setAuthorTemplateId, authorPreview, setAuthorPreview, levelEditable, setLevelEditable,
    levelBounds, setLevelBounds, levelRequiredProperties, setLevelRequiredProperties, levelForbiddenProperties, setLevelForbiddenProperties,
    levelPredictionKind, setLevelPredictionKind, levelPredictionProperty, setLevelPredictionProperty,
    levelBonusMaximumEdges, setLevelBonusMaximumEdges, levelRequiredEdges, setLevelRequiredEdges,
    levelForbiddenEdges, setLevelForbiddenEdges, levelRequiredAtoms, setLevelRequiredAtoms, levelForbiddenAtoms, setLevelForbiddenAtoms,
  }
}
