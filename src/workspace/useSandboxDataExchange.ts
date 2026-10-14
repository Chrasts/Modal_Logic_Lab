import type { Dispatch, SetStateAction } from 'react'
import type { AppView } from '../app/app-navigation'
import { filterCampaignProgressIds, isKnownCampaignLevelId, normalizeGuestProfile, type GuestProfile } from '../campaign/useCampaignPersistence'
import { emptyLearnProgress, type LearnProgress } from '../learn-progress'
import { parseProgressBackup, parseSandboxModel, type ParsedSandboxModel } from '../local-data'
import { parseFormula, type ObjectiveScope } from '../logic'
import type { EditableEdge, EditableWorld, FrameRules } from './model-types'

type SandboxGameMode = 'sandbox' | 'tutorial' | 'learn' | 'campaign' | 'guidedCampaign' | 'custom' | 'author'

interface SandboxDataExchangeOptions {
  readonly initialWorlds: readonly EditableWorld[]
  readonly initialEdges: readonly EditableEdge[]
  readonly defaultFrameRules: FrameRules
  readonly knownCorrespondencePresetIds: ReadonlySet<string>
  readonly serializedModel: () => string
  readonly serializedProgressBackup: () => string
  readonly importSource: string
  readonly backupImportSource: string
  readonly setImportSource: Dispatch<SetStateAction<string>>
  readonly setBackupImportSource: Dispatch<SetStateAction<string>>
  readonly setDataMessage: Dispatch<SetStateAction<string>>
  readonly setShowDataManager: Dispatch<SetStateAction<boolean>>
  readonly setGameMode: Dispatch<SetStateAction<SandboxGameMode>>
  readonly setFormulaSource: Dispatch<SetStateAction<string>>
  readonly setComparisonFormulaSource: Dispatch<SetStateAction<string>>
  readonly setWorlds: Dispatch<SetStateAction<EditableWorld[]>>
  readonly setEdges: Dispatch<SetStateAction<EditableEdge[]>>
  readonly setEvaluationWorld: Dispatch<SetStateAction<string>>
  readonly setEvaluationScope: Dispatch<SetStateAction<ObjectiveScope>>
  readonly setTargetTruth: Dispatch<SetStateAction<boolean>>
  readonly setFrameRules: Dispatch<SetStateAction<FrameRules>>
  readonly setSelectedCorrespondence: Dispatch<SetStateAction<string>>
  readonly setNextWorldKey: Dispatch<SetStateAction<number>>
  readonly setNextEdgeKey: Dispatch<SetStateAction<number>>
  readonly clearResult: () => void
  readonly setGuestProfile: Dispatch<SetStateAction<GuestProfile>>
  readonly setCompletedLevelIds: Dispatch<SetStateAction<ReadonlySet<string>>>
  readonly setReferenceSolutionViewed: Dispatch<SetStateAction<ReadonlySet<string>>>
  readonly setLearnProgress: Dispatch<SetStateAction<LearnProgress>>
  readonly setAppView: Dispatch<SetStateAction<AppView>>
  readonly clearSandboxReturnState: () => void
  readonly downloadJson: (contents: string, filename: string) => void
}

/** Owns validated local Sandbox and learner-progress exchange, not its dialog markup. */
export function useSandboxDataExchange(options: SandboxDataExchangeOptions) {
  const applyParsedSandbox = (imported: ParsedSandboxModel) => {
    parseFormula(imported.formula)
    if (imported.comparisonFormula) parseFormula(imported.comparisonFormula)
    const worlds = imported.worlds.map((world, key) => ({ ...world, key }))
    const edges = imported.edges.map((edge, key) => ({ ...edge, key }))
    options.setGameMode('sandbox')
    options.setFormulaSource(imported.formula)
    options.setComparisonFormulaSource(imported.comparisonFormula)
    options.setWorlds(worlds)
    options.setEdges(edges)
    options.setEvaluationWorld(imported.evaluationWorld)
    options.setEvaluationScope(imported.scope)
    options.setTargetTruth(imported.targetTruth)
    options.setFrameRules(imported.frameRules as FrameRules)
    options.setSelectedCorrespondence(options.knownCorrespondencePresetIds.has(imported.correspondencePreset) ? imported.correspondencePreset : '')
    options.setNextWorldKey(worlds.length)
    options.setNextEdgeKey(edges.length)
    options.clearResult()
  }

  const openDataManager = () => {
    options.setImportSource(options.serializedModel())
    options.setBackupImportSource(options.serializedProgressBackup())
    options.setDataMessage('')
    options.setShowDataManager(true)
  }

  const resetSavedProgress = () => {
    if (!window.confirm('Reset all tutorial and campaign progress?')) return
    options.setCompletedLevelIds(new Set())
    options.setReferenceSolutionViewed(new Set())
    options.setLearnProgress(emptyLearnProgress())
    options.setDataMessage('Tutorial, course, and campaign progress was reset.')
  }

  const resetSavedSandbox = () => {
    if (!window.confirm('Reset the sandbox to its initial model?')) return
    options.setGameMode('sandbox')
    options.setFormulaSource('◇p')
    options.setWorlds([...options.initialWorlds])
    options.setEdges([...options.initialEdges])
    options.setEvaluationWorld('w0')
    options.setTargetTruth(true)
    options.setEvaluationScope('pointed')
    options.setComparisonFormulaSource('')
    options.setFrameRules(options.defaultFrameRules)
    options.setNextWorldKey(2)
    options.setNextEdgeKey(1)
    options.clearResult()
    options.clearSandboxReturnState()
    options.setDataMessage('The sandbox was reset.')
  }

  const importProgress = () => {
    try {
      const imported = parseProgressBackup(options.backupImportSource)
      const guest = normalizeGuestProfile(imported.guest)
      const progress = filterCampaignProgressIds(imported.completedLevelIds, imported.contentRevision)
      const sandbox = imported.format === 'logic-model-builder-progress-backup' && imported.sandbox ? parseSandboxModel(imported.sandbox) : null
      if (!window.confirm('Replace the local progress and history with this validated backup?')) return
      options.setGuestProfile(guest)
      options.setCompletedLevelIds(new Set(progress))
      if (imported.format === 'logic-model-builder-progress-backup') {
        options.setLearnProgress(imported.learnProgress)
        options.setReferenceSolutionViewed(new Set(imported.referenceSolutionViewed.filter(isKnownCampaignLevelId)))
        if (sandbox) applyParsedSandbox(sandbox)
      }
      options.setDataMessage(imported.format === 'logic-model-builder-profile' ? 'Legacy profile and Campaign progress imported. Existing Learn and sandbox data were preserved.' : 'Progress backup imported successfully.')
    } catch (error) {
      options.setDataMessage(error instanceof Error ? error.message : 'Could not import the progress backup.')
    }
  }

  const importModel = () => {
    try {
      const imported = parseSandboxModel(options.importSource)
      parseFormula(imported.formula)
      if (imported.comparisonFormula) parseFormula(imported.comparisonFormula)
      if (!window.confirm('Replace the saved Model Sandbox with this validated model?')) return
      applyParsedSandbox(imported)
      options.setAppView('workspace')
      options.setShowDataManager(false)
    } catch (error) {
      options.setDataMessage(error instanceof Error ? error.message : 'Could not import the model.')
    }
  }

  return { openDataManager, resetSavedProgress, resetSavedSandbox, importProgress, importModel, downloadModel: () => options.downloadJson(options.serializedModel(), 'kripke-model.json') }
}
