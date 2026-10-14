import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import {
  Background,
  ConnectionMode,
  MarkerType,
  MiniMap,
  MiniMapNode,
  Panel,
  ReactFlow,
  useNodesState,
  type Connection,
  type Edge as FlowEdge,
  type MiniMapNodeProps,
  type Node as FlowNode,
  type ReactFlowInstance,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { campaignTracks, tutorialLevels, type GameLevel } from './campaign'
import { currentCampaignContentRevision, type AttemptFailureCategory, useCampaignPersistence } from './campaign/useCampaignPersistence'
import { useCampaignSession } from './campaign/useCampaignSession'
import { guidedCampaigns } from './guided-campaigns'
import { learnCourse, learnLessons, learnLessonByTaskId } from './learn'
import { useLearnProgress } from './learn/useLearnProgress'
import { useLearnSession } from './learn/useLearnSession'
import { ModalLogicWelcome } from './ModalLogicWelcome'
import { MissionHeader, type MissionHeaderMode } from './components/MissionHeader'
import { QuestionTaskPanel } from './components/QuestionTaskPanel'
import { WorkspaceQuickHelp } from './components/WorkspaceQuickHelp'
import { WorkspaceToolbar } from './components/WorkspaceToolbar'
import { WorkspaceTour } from './components/WorkspaceTour'
import { MobileUnsupportedGuard } from './components/MobileUnsupportedGuard'
import { flattenEvaluationTraces } from './workspace/EvaluationTrace'
import { MobileWorkspaceTabs } from './workspace/MobileWorkspaceTabs'
import { ReflexiveRelationBadge } from './workspace/ReflexiveRelationBadge'
import { modalEdgeTypes, resolveModalEdgeEndpoints } from './workspace/ModalEdge'
import { MAP_MAX_ZOOM, MAP_MIN_ZOOM, modelMapInteractionProps, resolveMapWheelHandling } from './workspace/map-interactions'
import { buildReflexiveRelationPresentations, buildRelationPresentations, describeRelationPresentation, type RelationDirectionPresentation, type RelationPresentation } from './workspace/relation-presentation'
import { applyCollisionClassNames, resolveWorldVisualCenter } from './workspace/world-placement'
import { assignRelationRouteLanes, RECIPROCAL_ARROWHEAD_SIZE, SINGLE_ARROWHEAD_SIZE, type RelationRouteItem } from './workspace/relation-routing'
import { isTextEntryTarget, resolveDeleteSelection, shouldBeginValuationEdit } from './workspace/selection-keyboard'
import { validateEditableModel } from './workspace/model-integrity'
import { WorldIdInput } from './workspace/WorldIdInput'
import { worldNodeTypes } from './workspace/WorldNode'
import { WorkspaceResizeHandle } from './workspace/WorkspaceResizeHandle'
import { defaultWorkspaceLayout, resizeWorkspaceSide } from './workspace/workspace-layout'
import { clearWorkspaceLayout, useWorkspaceLayout } from './workspace/useWorkspaceLayout'
import { useWorkspaceHistory } from './workspace/useWorkspaceHistory'
import { useWorkspaceChrome } from './workspace/useWorkspaceChrome'
import { useWorkspacePresentation, type EditorMode } from './workspace/useWorkspacePresentation'
import { useWorkspaceSelection } from './workspace/useWorkspaceSelection'
import { useWorkspaceModel } from './workspace/useWorkspaceModel'
import { useWorkspaceEditing } from './workspace/useWorkspaceEditing'
import { useWorkspaceSnapshots } from './workspace/useWorkspaceSnapshots'
import { WorkspaceFormulaPanel } from './workspace/WorkspaceFormulaPanel'
import { WorkspaceModelPanels } from './workspace/WorkspaceModelPanels'
import { WorkspaceModelTable } from './workspace/WorkspaceModelTable'
import { WorkspaceVerificationDetails } from './workspace/WorkspaceVerificationDetails'
import { WorkspaceVerificationPanel } from './workspace/WorkspaceVerificationPanel'
import { KripkeModelLegend } from './workspace/KripkeModelLegend'
import { KripkeWorldInspector } from './workspace/KripkeWorldInspector'
import { KripkeModelCanvas } from './workspace/KripkeModelCanvas'
import { useKripkeGraphInteractions } from './workspace/useKripkeGraphInteractions'
import { useWorkspaceLevelLoader } from './workspace/useWorkspaceLevelLoader'
import { useSandboxSharing } from './workspace/useSandboxSharing'
import { useGuidedWorkspaceLaunchers } from './workspace/useGuidedWorkspaceLaunchers'
import { useSandboxDataExchange } from './workspace/useSandboxDataExchange'
import { recordWorkspaceAttempt } from './workspace/recordWorkspaceAttempt'
import { evaluateWorkspaceVerification, type WorkspaceVerificationResult } from './workspace/evaluateWorkspaceVerification'
import type { EditableEdge, EditableWorld, EdgeDraft, FrameRuleMode, FrameRules } from './workspace/model-types'
import { insertAtSelection, validateFormulaInput } from './formula-input'
import { findFrameRuleConflicts } from './logic/frame-rule-conflicts'
import { ProgressiveHints } from './components/ProgressiveHints'
import { WorkedExampleCard } from './learn/WorkedExampleCard'
import { buildQuestionFeedback } from './learn/question-feedback'
import { playSound } from './audio/sound-effects'
import { parseCustomCampaign } from './campaign-format'
import { createCustomMission } from './authoring/createCustomMission'
import type { AuthorStartSnapshot } from './authoring/authoring-types'
import { createAuthoringMissionSeed, type AuthoringMissionSeed } from './authoring/createAuthoringMissionSeed'
import { validateAuthoringStep } from './authoring/validateAuthoringStep'
import { readSharedJson } from './share-url'
import { isSandboxSharePayload, parseSandboxSharePayload } from './sandbox-share'
import { type MissionAuditFinding } from './mission-audit'
import { MissionAuthorStepper } from './authoring/MissionAuthorStepper'
import { authoringDefaults, createAuthoringBounds, createEditableAuthoringPermissions } from './authoring/authoring-defaults'
import { useAuthoringDraft } from './authoring/useAuthoringDraft'
import { useAuthoringWorkflow } from './authoring/useAuthoringWorkflow'
import { useCustomMissionLibrary } from './authoring/useCustomMissionLibrary'
import { useAuthoringSession } from './authoring/useAuthoringSession'
import { useAuthoringPublishing } from './authoring/useAuthoringPublishing'
import { AuthoringStepContent } from './authoring/AuthoringStepContent'
import { useDialogFocus } from './hooks/useDialogFocus'
import { HomeView } from './app/HomeView'
import { LearnOverview } from './app/LearnOverview'
import { CampaignsView } from './app/CampaignsView'
import { SettingsView } from './app/SettingsView'
import { CreateView } from './app/CreateView'
import { DataManagerDialog } from './app/DataManagerDialog'
import { MissionAuthoringView } from './app/MissionAuthoringView'
import { ReferenceView } from './app/ReferenceView'
import { HelpView } from './app/HelpView'
import { ProfileView } from './app/ProfileView'
import { LabView } from './app/LabView'
import { AppChrome, type AppChromeLabels } from './app/AppChrome'
import { useDataExchangeState } from './app/useDataExchangeState'
import { useProfileDataActions } from './app/useProfileDataActions'
import { useAppNavigation, type AppView } from './app/app-navigation'
import {
  loadInterfaceSettings,
  useInterfacePreferences,
} from './app/interface-settings'
import { LearnRecoveryActions } from './components/LearnRecoveryActions'
import { resolveLearningNavigation, type LearningDestination } from './learn/navigation'
import { assertValidReferenceSolution, parseCustomLevelFile, parseCustomLevelPackage, serializeCustomLevel, type ParsedCustomLevelFile, type ReferenceSolution } from './level-format'
import { serializeProgressBackup } from './local-data'
import {
  applyFrameProperties,
  checkFrameProperty,
  canonicalModelSignature,
  collectAtoms,
  buildSemanticHighlight,
  createModel,
  formulaAtPath,
  listFormulaOccurrences,
  countConstructionChanges,
  DEFAULT_MAXIMUM_VALUATIONS,
  FormulaSyntaxError,
  parseFormula,
  verifyObjective,
  type AccessibilityEdge,
  type FrameProperties,
  type FramePropertyName,
  type FramePropertyWitness,
  type ObjectiveScope,
} from './logic'

type VerificationResult = WorkspaceVerificationResult

type GameMode = 'sandbox' | 'tutorial' | 'learn' | 'campaign' | 'guidedCampaign' | 'custom' | 'author'
type EvaluationScope = ObjectiveScope

const describeFrameWitness = (witness: FramePropertyWitness): string => {
  if (witness.kind === 'missing-reflexive') return `${witness.world} is missing its reflexive relation.`
  if (witness.kind === 'irreflexive-loop') return `${witness.world} accesses itself.`
  if (witness.kind === 'missing-successor') return `${witness.world} has no successor.`
  if (witness.kind === 'missing-symmetric') return `${witness.edge.from} → ${witness.edge.to} exists, but ${witness.missing.from} → ${witness.missing.to} is missing.`
  if (witness.kind === 'missing-transitive') return `${witness.first.from} → ${witness.first.to} → ${witness.second.to} needs ${witness.missing.from} → ${witness.missing.to}.`
  if (witness.kind === 'missing-euclidean') return `The two successors of ${witness.first.from} need ${witness.missing.from} → ${witness.missing.to}.`
  return `Directed cycle: ${witness.worlds.join(' → ')}.`
}

const initialWorlds: EditableWorld[] = [
  { key: 0, id: 'w0', atoms: '', position: { x: 90, y: 110 } },
  { key: 1, id: 'w1', atoms: 'p', position: { x: 390, y: 110 } },
]

const initialEdges: EditableEdge[] = [{ key: 0, from: 'w0', to: 'w1' }]
const storageKey = 'logic-game:sandbox:v1'
const workspaceTourKey = 'logic-game:workspace-tour:v1'
const defaultFrameRules: FrameRules = {
  reflexive: 'off',
  symmetric: 'off',
  transitive: 'off',
  euclidean: 'off',
  serial: 'off',
  irreflexive: 'off',
  acyclic: 'off',
}

interface AuthorWorkspaceSession {
  readonly purpose: 'starting-model' | 'reference-solution'
  readonly returnStep: number
  readonly previousWorkspace: SandboxDraft
  readonly previousGameMode: GameMode
}
const levelPropertyNames = Object.keys(defaultFrameRules) as FramePropertyName[]

const correspondencePresets = [
  { id: 't', name: 'T: Reflexivity', formula: '□p → p', property: 'reflexive' as const },
  { id: 'd', name: 'D: Seriality', formula: '□p → ◇p', property: 'serial' as const },
  { id: 'b', name: 'B: Symmetry', formula: 'p → □◇p', property: 'symmetric' as const },
  { id: '4', name: '4: Transitivity', formula: '□p → □□p', property: 'transitive' as const },
  { id: '5', name: '5: Euclidean', formula: '◇p → □◇p', property: 'euclidean' as const },
]

interface SandboxDraft {
  readonly formulaSource: string
  readonly comparisonFormulaSource?: string
  readonly worlds: EditableWorld[]
  readonly edges: EditableEdge[]
  readonly evaluationWorld: string
  readonly targetTruth: boolean
  readonly frameProperties?: FrameProperties
  readonly frameRules?: FrameRules
  readonly evaluationScope?: EvaluationScope | 'world'
}

function loadDraft(): SandboxDraft | null {
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return null
    const draft = JSON.parse(raw) as Partial<SandboxDraft>
    if (typeof draft.formulaSource !== 'string' || !Array.isArray(draft.worlds) || !Array.isArray(draft.edges)
      || typeof draft.evaluationWorld !== 'string' || typeof draft.targetTruth !== 'boolean') return null
    if (draft.worlds.some((world) => !world || typeof world !== 'object' || typeof world.id !== 'string' || typeof world.atoms !== 'string')) return null
    if (draft.edges.some((edge) => !edge || typeof edge !== 'object' || typeof edge.from !== 'string' || typeof edge.to !== 'string')) return null
    const normalizedWorlds = draft.worlds.map((world, index) => ({
      ...world,
      key: index,
      position: world.position && typeof world.position.x === 'number' && typeof world.position.y === 'number'
        ? world.position
        : { x: 90 + (index % 3) * 240, y: 90 + Math.floor(index / 3) * 150 },
    }))
    const normalizedIds = normalizedWorlds.map((world) => world.id.trim())
    if (normalizedIds.some((id) => !id) || new Set(normalizedIds).size !== normalizedIds.length) return null
    const worldIds = new Set(normalizedIds)
    const validRuleModes = new Set<FrameRuleMode>(['off', 'validate', 'enforce'])
    const enforceableRules = new Set(['reflexive', 'symmetric', 'transitive', 'euclidean'])
    const normalizedFrameRules = Object.fromEntries(Object.entries(draft.frameRules ?? {})
      .filter(([property, mode]) => property in defaultFrameRules && validRuleModes.has(mode as FrameRuleMode))
      .map(([property, mode]) => [property, mode === 'enforce' && !enforceableRules.has(property) ? 'validate' : mode])) as Partial<FrameRules>
    const validScopes = new Set(['pointed', 'model', 'frame', 'correspondence', 'world'])
    const normalizedEdges = draft.edges.filter((edge) => worldIds.has(edge.from.trim()) && worldIds.has(edge.to.trim()))
      .map((edge, index) => ({ ...edge, from: edge.from.trim(), to: edge.to.trim(), key: index }))
    if (validateEditableModel(normalizedWorlds, normalizedEdges).length > 0) return null
    return {
      ...draft,
      worlds: normalizedWorlds,
      edges: normalizedEdges,
      evaluationWorld: worldIds.has(draft.evaluationWorld.trim()) ? draft.evaluationWorld.trim() : normalizedIds[0] ?? '',
      frameRules: { ...defaultFrameRules, ...normalizedFrameRules },
      evaluationScope: typeof draft.evaluationScope === 'string' && validScopes.has(draft.evaluationScope)
        ? draft.evaluationScope as SandboxDraft['evaluationScope']
        : 'pointed',
    } as SandboxDraft
  } catch {
    return null
  }
}

const failureCategoryLabels: Readonly<Record<AttemptFailureCategory, string>> = {
  'missing-answer': 'Missing required answer',
  construction: 'Construction constraint',
  'frame-configuration': 'Frame-rule configuration',
  'frame-property': 'Relational property',
  objective: 'Semantic objective',
  'required-answer': 'Incorrect required answer',
  'syntax-or-model': 'Syntax or model data',
  'wrong-world': 'Truth at the wrong world',
  'missing-diamond-witness': 'Missing witness for diamond',
  'unwanted-diamond-witness': 'Unexpected witness for diamond',
  'box-counterexample': 'Counterexample successor for box',
  'vacuous-box': 'Vacuous truth of box',
  'model-global-counterexample': 'Model-global counterexample',
  'frame-countervaluation': 'Frame countervaluation',
  'frame-validity-quantification': 'All-valuations frame validity',
  'correspondence-mismatch': 'Formula/property mismatch',
}

function AppContent({ initialView = 'home' }: { readonly initialView?: AppView } = {}) {
  const [initialDraft] = useState(loadDraft)
  const { appView, setAppView, restorePreviousView } = useAppNavigation(initialView)
  const [gameMode, setGameMode] = useState<GameMode>('sandbox')
  const { learnProgress, setLearnProgress } = useLearnProgress()
  const { learnHintLevel, setLearnHintLevel, learnTransferActive, setLearnTransferActive, learnConceptOpen, setLearnConceptOpen, expandedLearnChapterId, setExpandedLearnChapterId } = useLearnSession()
  const formulaInputRef = useRef<HTMLInputElement>(null)
  const selectedValuationInputRef = useRef<HTMLInputElement>(null)
  const verificationResultRef = useRef<HTMLDivElement>(null)
  const workspaceRef = useRef<HTMLElement>(null)
  const { workspaceLayout, setWorkspaceLayout } = useWorkspaceLayout(workspaceRef, appView === 'workspace')
  const { customLevels, setCustomLevels, customCampaignTitle, setCustomCampaignTitle, customCampaignDescription, setCustomCampaignDescription, authoredCampaignMissions, setAuthoredCampaignMissions } = useCustomMissionLibrary()
  const { campaignSection, setCampaignSection, campaignLevelIndex, setCampaignLevelIndex, campaignTrackIndex, setCampaignTrackIndex, playingTrackIndex, setPlayingTrackIndex, guidedCampaignIndex, setGuidedCampaignIndex, guidedHintLevel, setGuidedHintLevel } = useCampaignSession()
  const { referenceSolutionViewed, setReferenceSolutionViewed, completedLevelIds, setCompletedLevelIds, guestProfile, setGuestProfile } = useCampaignPersistence()
  const initialFrameRules: FrameRules = (() => {
    if (initialDraft?.frameRules) return { ...defaultFrameRules, ...initialDraft.frameRules }
    const legacy = initialDraft?.frameProperties
    return legacy ? {
      ...defaultFrameRules,
      reflexive: legacy.reflexive ? 'enforce' : 'off',
      symmetric: legacy.symmetric ? 'enforce' : 'off',
      transitive: legacy.transitive ? 'enforce' : 'off',
      euclidean: legacy.euclidean ? 'enforce' : 'off',
    } : defaultFrameRules
  })()
  const { formulaSource, setFormulaSource, comparisonFormulaSource, setComparisonFormulaSource, worlds, setWorlds, edges, setEdges, edgeDraft, setEdgeDraft, edgeEditErrors, setEdgeEditErrors, evaluationWorld, setEvaluationWorld, targetTruth, setTargetTruth, evaluationScope, setEvaluationScope, frameRules, setFrameRules, result, setResult, predictionAnswer, setPredictionAnswer, traceStepIndex, setTraceStepIndex, nextWorldKey, setNextWorldKey, nextEdgeKey, setNextEdgeKey } = useWorkspaceModel<EditableWorld, EditableEdge, EvaluationScope, FrameRules, VerificationResult, EdgeDraft>({
    formulaSource: initialDraft?.formulaSource ?? '◇p', comparisonFormulaSource: initialDraft?.comparisonFormulaSource ?? '', worlds: initialDraft?.worlds ?? initialWorlds, edges: initialDraft?.edges ?? initialEdges, evaluationWorld: initialDraft?.evaluationWorld ?? 'w0', targetTruth: initialDraft?.targetTruth ?? true, evaluationScope: initialDraft?.evaluationScope === 'world' ? 'pointed' : initialDraft?.evaluationScope ?? 'pointed', frameRules: initialFrameRules,
  })
  const { levelTitle, setLevelTitle, levelInstruction, setLevelInstruction, levelLearningObjective, setLevelLearningObjective, levelConcept, setLevelConcept, levelPrerequisites, setLevelPrerequisites, levelDifficulty, setLevelDifficulty, authorTemplateId, setAuthorTemplateId, authorPreview, setAuthorPreview, levelEditable, setLevelEditable, levelBounds, setLevelBounds, levelRequiredProperties, setLevelRequiredProperties, levelForbiddenProperties, setLevelForbiddenProperties, levelPredictionKind, setLevelPredictionKind, levelPredictionProperty, setLevelPredictionProperty, levelBonusMaximumEdges, setLevelBonusMaximumEdges, levelRequiredEdges, setLevelRequiredEdges, levelForbiddenEdges, setLevelForbiddenEdges, levelRequiredAtoms, setLevelRequiredAtoms, levelForbiddenAtoms, setLevelForbiddenAtoms } = useAuthoringDraft(tutorialLevels[0]?.id ?? '')
  const { levelStartSnapshot, setLevelStartSnapshot, levelReferenceSolution, setLevelReferenceSolution, importedAuthorFile, setImportedAuthorFile, missionAuditFindings, setMissionAuditFindings, authorWorkspaceSession, setAuthorWorkspaceSession, authorPlaytest, setAuthorPlaytest } = useAuthoringSession<AuthorStartSnapshot, ReferenceSolution, ParsedCustomLevelFile, MissionAuditFinding, AuthorWorkspaceSession>()
  const { authorStep, setAuthorStep, visitedAuthorSteps, setVisitedAuthorSteps, authorStepErrors, setAuthorStepErrors, authorStudioOpen, setAuthorStudioOpen, openNewMission, openCampaignPackage } = useAuthoringWorkflow()

  useEffect(() => {
    if (levelStartSnapshot?.evaluationScope !== 'model' && levelPredictionKind === 'counterexample-world') setLevelPredictionKind('none')
  }, [levelStartSnapshot?.evaluationScope, levelPredictionKind])
  const { showHelp, setShowHelp, showDataManager, setShowDataManager, importSource, setImportSource, backupImportSource, setBackupImportSource, customImportSource, setCustomImportSource, dataMessage, setDataMessage, shareLink, setShareLink, sandboxShareMessage, setSandboxShareMessage } = useDataExchangeState()
  const { showEvaluationExplorer, setShowEvaluationExplorer, selectedFormulaPath, setSelectedFormulaPath, showFrameRules, setShowFrameRules, selectedCorrespondence, setSelectedCorrespondence, editorMode, setEditorMode, modelView, setModelView, mobileWorkspaceTab, setMobileWorkspaceTab } = useWorkspacePresentation(formulaSource)
  const [minimapPinned, setMinimapPinned] = useState(false)
  const { showDerivedEdges, setShowDerivedEdges, showMinimap, setShowMinimap, interfaceDensity, setInterfaceDensity, reduceMotion, setReduceMotion, soundEffects, setSoundEffects, leftPanelOpen, setLeftPanelOpen, rightPanelOpen, setRightPanelOpen, interfaceLanguage, setInterfaceLanguage, resetInterfacePreferences: resetStoredInterfacePreferences } = useInterfacePreferences()
  const resetInterfacePreferences = () => {
    resetStoredInterfacePreferences()
    setWorkspaceLayout(defaultWorkspaceLayout)
    clearWorkspaceLayout()
  }
  const { showWorkspaceTour, workspaceTourStep, setWorkspaceTourStep, isFullscreen, openWorkspaceTour: revealWorkspaceTour, dismissWorkspaceTour, toggleFullscreen } = useWorkspaceChrome({
    initialWorkspace: initialView === 'workspace', workspaceActive: appView === 'workspace', authoringActive: gameMode === 'author', conceptOpen: learnConceptOpen, tourStorageKey: workspaceTourKey,
  })
  const { selectedEdgeKey, setSelectedEdgeKey, selectedWorldKey, setSelectedWorldKey, activeFrameWitness, setActiveFrameWitness, hoveredWorldKey, setHoveredWorldKey, collidingWorldKeys, setCollidingWorldKeys, expandedRelationPairKey, setExpandedRelationPairKey, flowInstance, setFlowInstance, clearGraphSelection, selectWorld, selectExplicitEdge, selectReciprocalPair } = useWorkspaceSelection<FramePropertyWitness, ReactFlowInstance>()
  const graphCanvasRef = useRef<HTMLDivElement>(null)
  const sandboxBeforeCampaign = useRef<SandboxDraft | null>(null)
  const sharedSandboxSession = useRef(false)
  const authorPlaytestReturnMode = useRef<GameMode>('sandbox')

  const { currentSnapshot, restoreSnapshot } = useWorkspaceSnapshots({
    worlds, edges, evaluationWorld, frameRules, setWorlds, setEdges, setEvaluationWorld, setFrameRules,
    setEdgeDraft, setEdgeEditErrors, setActiveFrameWitness, clearGraphSelection, clearResult: () => setResult(null),
  })

  const { saveHistoryPoint, undo, redo, clearHistory, undoAvailable, redoAvailable } = useWorkspaceHistory({
    createSnapshot: currentSnapshot,
    restoreSnapshot,
  })

  useEffect(() => {
    if (gameMode !== 'sandbox' || authorWorkspaceSession || sharedSandboxSession.current) return
    const draft: SandboxDraft = { formulaSource, comparisonFormulaSource, worlds, edges, evaluationWorld, targetTruth, frameRules, evaluationScope }
    try { localStorage.setItem(storageKey, JSON.stringify(draft)) } catch { /* Persistence is optional in restricted browsers. */ }
  }, [formulaSource, comparisonFormulaSource, worlds, edges, evaluationWorld, targetTruth, frameRules, evaluationScope, gameMode, authorWorkspaceSession])

  useEffect(() => {
    document.documentElement.lang = interfaceLanguage
    document.documentElement.dataset.theme = 'light'
  }, [interfaceLanguage])

  useEffect(() => {
    if (!showHelp && !showFrameRules && !showDataManager) return
    const closeDialog = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setShowHelp(false)
      setShowFrameRules(false)
      setShowDataManager(false)
    }
    window.addEventListener('keydown', closeDialog)
    return () => window.removeEventListener('keydown', closeDialog)
  }, [showHelp, showFrameRules, showDataManager])

  const usableWorldIds = useMemo(() => worlds.map(({ id }) => id.trim()), [worlds])

  const effectiveEdges = useMemo(
    () => applyFrameProperties(usableWorldIds, edges, {
      reflexive: frameRules.reflexive === 'enforce',
      symmetric: frameRules.symmetric === 'enforce',
      transitive: frameRules.transitive === 'enforce',
      euclidean: frameRules.euclidean === 'enforce',
    }),
    [usableWorldIds, edges, frameRules],
  )

  const frameRuleResults = useMemo(
    () => Object.entries(frameRules)
      .filter(([, mode]) => mode !== 'off')
      .map(([property]) => checkFrameProperty(usableWorldIds, effectiveEdges, property as FramePropertyName)),
    [frameRules, usableWorldIds, effectiveEdges],
  )
  const frameRuleConflicts = useMemo(() => findFrameRuleConflicts(frameRules, usableWorldIds.length), [frameRules, usableWorldIds.length])

  const formulaValidation = useMemo(() => validateFormulaInput(formulaSource), [formulaSource])
  const comparisonFormulaValidation = useMemo(() => validateFormulaInput(comparisonFormulaSource), [comparisonFormulaSource])
  const explorerModel = useMemo(() => {
    try {
      const ids = worlds.map(({ id }) => id.trim())
      if (ids.some((id) => !id) || new Set(ids).size !== ids.length) return null
      return createModel(Object.fromEntries(worlds.map(({ id, atoms }) => [id.trim(), atoms.split(/[\s,]+/u).filter(Boolean)])), effectiveEdges)
    } catch { return null }
  }, [worlds, effectiveEdges])
  const explorerFormula = formulaValidation.kind === 'valid' ? formulaValidation.formula : undefined
  const selectedExplorerFormula = useMemo(() => {
    if (!explorerFormula) return undefined
    const occurrence = listFormulaOccurrences(explorerFormula).find(({ key }) => key === selectedFormulaPath)
    return occurrence?.formula ?? formulaAtPath(explorerFormula, []) ?? undefined
  }, [explorerFormula, selectedFormulaPath])
  const explorerHighlight = useMemo(() => gameMode === 'sandbox' && showEvaluationExplorer && explorerModel && selectedExplorerFormula
    ? buildSemanticHighlight(explorerModel, selectedExplorerFormula, evaluationWorld)
    : undefined, [gameMode, showEvaluationExplorer, explorerModel, selectedExplorerFormula, evaluationWorld])
  const explorerRelevantEdges = useMemo(() => explorerHighlight?.relevantEdges ?? new Set<string>(), [explorerHighlight])

  useEffect(() => { setActiveFrameWitness(null) }, [worlds, edges, evaluationWorld, frameRules])

  const explicitEdgeKeyByPair = useMemo(
    () => new Map(edges.map((edge) => [`${edge.from}\u0000${edge.to}`, edge.key])),
    [edges],
  )

  const evaluationTraceSteps = result && 'verdict' in result && result.verdict
    ? flattenEvaluationTraces([result.verdict.formula, result.verdict.relation, result.verdict.correspondence]
      .filter(Boolean).flatMap((section) => section?.evaluationTraces ?? []))
    : []
  const activeTraceEntry = evaluationTraceSteps[Math.min(traceStepIndex, Math.max(0, evaluationTraceSteps.length - 1))]
  const activeTrace = activeTraceEntry?.trace
  const traceWitnessWorld = activeTrace?.rule === 'possibility' && activeTrace.value
    ? activeTrace.children.find(({ value }) => value)?.worldId
    : undefined
  const traceCounterexampleWorld = activeTrace?.rule === 'necessity' && !activeTrace.value
    ? activeTrace.children.find(({ value }) => !value)?.worldId
    : undefined
  const traceRelatedWorlds = useMemo(() => new Set([
    activeTrace?.worldId,
    activeTraceEntry?.parent?.worldId,
    ...(activeTrace?.children.map(({ worldId }) => worldId) ?? []),
  ].filter((id): id is string => Boolean(id))), [activeTrace, activeTraceEntry?.parent])
  const traceCheckedEdges = useMemo(() => new Set([
    ...(activeTrace?.children.map(({ worldId }) => `${activeTrace.worldId}\u0000${worldId}`) ?? []),
    ...(activeTraceEntry?.parent && (activeTraceEntry.parent.rule === 'necessity' || activeTraceEntry.parent.rule === 'possibility')
      ? [`${activeTraceEntry.parent.worldId}\u0000${activeTrace?.worldId}`]
      : []),
  ]), [activeTrace, activeTraceEntry?.parent])
  const derivedPairKeys = useMemo(() => new Set(effectiveEdges
    .map(({ from, to }) => `${from}\u0000${to}`)
    .filter((pair) => !explicitEdgeKeyByPair.has(pair))), [effectiveEdges, explicitEdgeKeyByPair])
  const displayedEdges = useMemo(
    () => showDerivedEdges
      ? effectiveEdges
      : effectiveEdges.filter((edge) => {
        const pair = `${edge.from}\u0000${edge.to}`
        return explicitEdgeKeyByPair.has(pair) || traceCheckedEdges.has(pair) || explorerRelevantEdges.has(pair)
      }),
    [effectiveEdges, explicitEdgeKeyByPair, showDerivedEdges, traceCheckedEdges, explorerRelevantEdges],
  )
  const traceForcedDerivedPairKeys = useMemo(() => new Set([...traceCheckedEdges].filter((pair) => !showDerivedEdges && derivedPairKeys.has(pair))), [derivedPairKeys, showDerivedEdges, traceCheckedEdges])
  const reflexiveRelations = useMemo(
    () => buildReflexiveRelationPresentations(displayedEdges, explicitEdgeKeyByPair),
    [displayedEdges, explicitEdgeKeyByPair],
  )

  const activeMapLevel = gameMode === 'tutorial' ? tutorialLevels[campaignLevelIndex]
    : gameMode === 'learn' ? (learnTransferActive ? learnLessons[campaignLevelIndex]?.transferTask : undefined) ?? learnLessons[campaignLevelIndex]?.task
      : gameMode === 'campaign' ? campaignTracks[playingTrackIndex ?? campaignTrackIndex]?.levels[campaignLevelIndex]
        : gameMode === 'guidedCampaign' ? guidedCampaigns[guidedCampaignIndex]?.levels[campaignLevelIndex]
          : gameMode === 'custom' ? customLevels[campaignLevelIndex] : undefined
  const mapQuestionMode = activeMapLevel?.interactionMode === 'question'
  const graphEdgesEditable = !mapQuestionMode
    && editorMode === 'edit'
    && !(activeMapLevel && learnLessonByTaskId.has(activeMapLevel.id) && result?.kind === 'success')
    && (!activeMapLevel || activeMapLevel.editable.includes('edges'))
  const focusedWorldKey = hoveredWorldKey ?? selectedWorldKey
  const focusedWorldId = worlds.find((world) => world.key === focusedWorldKey)?.id.trim()
  const frameWitnessPresentation = useMemo(() => {
    const worldIds = new Set<string>()
    const premiseEdges = new Set<string>()
    let missingEdge: AccessibilityEdge | null = null
    const addEdge = (edge: AccessibilityEdge) => { worldIds.add(edge.from); worldIds.add(edge.to); premiseEdges.add(`${edge.from}\u0000${edge.to}`) }
    const witness = activeFrameWitness
    if (!witness) return { worldIds, premiseEdges, missingEdge }
    if (witness.kind === 'missing-reflexive' || witness.kind === 'irreflexive-loop' || witness.kind === 'missing-successor') worldIds.add(witness.world)
    else if (witness.kind === 'missing-symmetric') { addEdge(witness.edge); missingEdge = witness.missing }
    else if (witness.kind === 'missing-transitive' || witness.kind === 'missing-euclidean') { addEdge(witness.first); addEdge(witness.second); missingEdge = witness.missing }
    else witness.worlds.forEach((world, index) => { worldIds.add(world); if (index < witness.worlds.length - 1) premiseEdges.add(`${world}\u0000${witness.worlds[index + 1]}`) })
    if (missingEdge) { worldIds.add(missingEdge.from); worldIds.add(missingEdge.to) }
    return { worldIds, premiseEdges, missingEdge }
  }, [activeFrameWitness])

  const nodeBlueprints = useMemo<FlowNode[]>(() => worlds.map((world) => ({
    id: String(world.key),
    type: 'world',
    position: world.position,
    data: {
      isEvaluation: world.id.trim() === evaluationWorld,
      label: (
        <div className="node-label">
          <strong>{world.id || 'unnamed'}</strong>
          <span>{world.atoms.trim() || '∅'}</span>
          {(() => {
            const reflexive = reflexiveRelations.get(world.id.trim())
            if (!reflexive) return null
            const selected = reflexive.explicitKey !== undefined && reflexive.explicitKey === selectedEdgeKey
            const checked = traceCheckedEdges.has(`${world.id.trim()}\u0000${world.id.trim()}`)
            return <ReflexiveRelationBadge presentation={reflexive} selected={selected} checked={checked} editable={graphEdgesEditable} onSelect={selectExplicitEdge} />
          })()}
          {activeFrameWitness?.kind === 'missing-reflexive' && activeFrameWitness.world === world.id.trim() && <span className="frame-witness-ghost-reflexive" title="Missing for reflexivity">↻</span>}
          {activeTrace?.rule === 'atom' && activeTrace.worldId === world.id.trim() && <span className="trace-atom-badge">ATOM {activeTrace.formula} {activeTrace.value ? '✓' : '✕'}</span>}
          {world.id.trim() === traceWitnessWorld && <span className="trace-role-badge witness">WITNESS</span>}
          {world.id.trim() === traceCounterexampleWorld && <span className="trace-role-badge counterexample">COUNTEREXAMPLE</span>}
          {explorerHighlight?.trueWorlds.has(world.id.trim()) && <span className="explorer-truth-badge true">✓ TRUE</span>}
          {explorerHighlight?.falseWorlds.has(world.id.trim()) && <span className="explorer-truth-badge false">✕ FALSE</span>}
          {explorerHighlight?.witnessWorlds.has(world.id.trim()) && <span className="explorer-role-badge witness">WITNESS</span>}
          {explorerHighlight?.counterexampleWorlds.has(world.id.trim()) && <span className="explorer-role-badge counterexample">COUNTEREXAMPLE</span>}
        </div>
      ),
    },
    className: [
      world.id.trim() === evaluationWorld ? 'evaluation-node' : '',
      world.key === selectedWorldKey ? 'selected-world-node' : '',
      mapQuestionMode && predictionAnswer === world.id.trim() ? 'question-answer-node' : '',
      world.id.trim() === activeTrace?.worldId ? 'trace-current-node' : '',
      world.id.trim() === traceWitnessWorld ? 'trace-witness-node' : '',
      world.id.trim() === traceCounterexampleWorld ? 'trace-counterexample-node' : '',
      activeTrace && !explorerHighlight && !traceRelatedWorlds.has(world.id.trim()) ? 'trace-irrelevant-node' : '',
      frameWitnessPresentation.worldIds.has(world.id.trim()) ? 'frame-witness-node' : '',
      explorerHighlight?.sourceWorld === world.id.trim() ? 'explorer-source-node' : '',
      explorerHighlight?.trueWorlds.has(world.id.trim()) ? 'explorer-true-node' : '',
      explorerHighlight?.falseWorlds.has(world.id.trim()) ? 'explorer-false-node' : '',
      explorerHighlight?.witnessWorlds.has(world.id.trim()) ? 'explorer-witness-node' : '',
      explorerHighlight?.counterexampleWorlds.has(world.id.trim()) ? 'explorer-counterexample-node' : '',
    ].filter(Boolean).join(' '),
    ariaLabel: `${mapQuestionMode ? 'Answer option, ' : ''}World ${world.id || 'without a name'}, atoms ${world.atoms || 'none'}${reflexiveRelations.has(world.id.trim()) ? `, ${reflexiveRelations.get(world.id.trim())?.derived ? 'derived' : 'explicit'} reflexive accessibility` : ''}${mapQuestionMode && predictionAnswer === world.id.trim() ? ', selected' : ''}${explorerHighlight?.trueWorlds.has(world.id.trim()) ? ', selected subformula true' : explorerHighlight?.falseWorlds.has(world.id.trim()) ? ', selected subformula false' : ''}`,
    domAttributes: mapQuestionMode ? { 'aria-pressed': predictionAnswer === world.id.trim() } : undefined,
  })), [worlds, evaluationWorld, selectedWorldKey, selectedEdgeKey, reflexiveRelations, graphEdgesEditable, traceCheckedEdges, activeTrace, traceWitnessWorld, traceCounterexampleWorld, traceRelatedWorlds, mapQuestionMode, predictionAnswer, activeFrameWitness, frameWitnessPresentation.worldIds, explorerHighlight])

  const graphNeedsOverview = useMemo(() => {
    if (worlds.length < 3) return false
    const xValues = worlds.map(({ position }) => position.x)
    const yValues = worlds.map(({ position }) => position.y)
    const horizontalSpan = Math.max(...xValues) - Math.min(...xValues)
    const verticalSpan = Math.max(...yValues) - Math.min(...yValues)
    return worlds.length > 5 || Math.max(horizontalSpan, verticalSpan) > 760
  }, [worlds])
  const shouldShowMinimap = showMinimap && (minimapPinned || graphNeedsOverview)

  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState(nodeBlueprints)

  useEffect(() => {
    setFlowNodes(nodeBlueprints)
  }, [nodeBlueprints, setFlowNodes])

  useEffect(() => {
    setFlowNodes((current) => applyCollisionClassNames(current, collidingWorldKeys) as FlowNode[])
  }, [collidingWorldKeys, setFlowNodes])

  const worldKeyById = useMemo(
    () => new Map(worlds.map((world) => [world.id.trim(), String(world.key)])),
    [worlds],
  )

  const relationPresentations = useMemo(
    () => buildRelationPresentations(displayedEdges, explicitEdgeKeyByPair),
    [displayedEdges, explicitEdgeKeyByPair],
  )

  useEffect(() => {
    if (expandedRelationPairKey && !relationPresentations.some(({ pairKey, kind }) => kind === 'bidirectional' && pairKey === expandedRelationPairKey)) {
      setExpandedRelationPairKey(null)
    }
  }, [expandedRelationPairKey, relationPresentations])

  const flowEdges = useMemo<FlowEdge[]>(() => {
    const directionId = (direction: RelationDirectionPresentation) => direction.explicitKey === undefined ? `derived:${direction.from}:${direction.to}` : `explicit:${direction.explicitKey}`
    const routeItems = relationPresentations.flatMap<RelationRouteItem>((presentation) => {
      if (presentation.kind === 'bidirectional' && presentation.reverse && expandedRelationPairKey === presentation.pairKey) {
        return [
          { id: directionId(presentation.forward), source: presentation.forward.from, target: presentation.forward.to, kind: 'expanded' },
          { id: directionId(presentation.reverse), source: presentation.reverse.from, target: presentation.reverse.to, kind: 'expanded' },
        ]
      }
      if (presentation.kind === 'bidirectional') return [{ id: `pair:${presentation.source}:${presentation.target}`, source: presentation.source, target: presentation.target, kind: 'reciprocal' }]
      return [{ id: directionId(presentation.forward), source: presentation.source, target: presentation.target, kind: 'single' }]
    })
    const routeLanes = assignRelationRouteLanes(routeItems, worlds.map((world) => ({ id: world.id.trim(), position: world.position })))
    const marker = (derived: boolean, reciprocal = false) => ({
      type: derived ? MarkerType.Arrow : MarkerType.ArrowClosed,
      color: derived ? '#7a4d26' : '#285f67',
      width: reciprocal ? RECIPROCAL_ARROWHEAD_SIZE : SINGLE_ARROWHEAD_SIZE,
      height: reciprocal ? RECIPROCAL_ARROWHEAD_SIZE : SINGLE_ARROWHEAD_SIZE,
    })
    const focusClasses = (presentation: RelationPresentation, selected: boolean) => {
      const incident = Boolean(focusedWorldId && (presentation.source === focusedWorldId || presentation.target === focusedWorldId))
      return [
        incident ? 'relation-focus' : '',
        focusedWorldId && !incident && !selected ? 'relation-dimmed' : '',
        selected ? 'relation-selected' : '',
      ]
    }
    const directionEdge = (presentation: RelationPresentation, direction: RelationDirectionPresentation, reversePair: boolean): FlowEdge | null => {
      const endpoints = resolveModalEdgeEndpoints(worldKeyById.get(direction.from), worldKeyById.get(direction.to))
      if (!endpoints) return null
      const editable = direction.explicitKey !== undefined && graphEdgesEditable
      const selected = direction.explicitKey === selectedEdgeKey
      const directionPair = `${direction.from}\u0000${direction.to}`
      const id = directionId(direction)
      const lane = routeLanes.get(id)
      return {
        id,
        source: endpoints.source,
        target: endpoints.target,
        type: 'modal',
        data: {
          reversePair,
          routeSign: 1,
          sourceOffset: lane?.sourceOffset,
          targetOffset: lane?.targetOffset,
          curveOffset: lane?.curveOffset,
          pairKey: presentation.pairKey,
          description: direction.derived ? `Accessibility from ${direction.from} to ${direction.to}, derived by an enforced frame rule` : `Accessibility from ${direction.from} to ${direction.to}, explicit`,
        },
        interactionWidth: 22,
        markerEnd: marker(direction.derived),
        selectable: editable,
        focusable: true,
        selected,
        ariaLabel: direction.derived ? `${direction.from} to ${direction.to}, derived by an enforced frame rule` : `${direction.from} to ${direction.to}, explicit`,
        className: [
          'model-edge', reversePair ? 'expanded-relation' : '', direction.derived ? 'derived-edge' : '', selected ? 'selected-edge' : '',
          ...focusClasses(presentation, selected),
          traceCheckedEdges.has(directionPair) ? 'trace-checked-edge' : '',
          traceForcedDerivedPairKeys.has(directionPair) ? 'trace-forced-derived-edge' : '',
          frameWitnessPresentation.premiseEdges.has(directionPair) ? 'frame-witness-premise-edge' : '',
          direction.to === traceWitnessWorld && activeTrace?.worldId === direction.from ? 'trace-witness-edge' : '',
          direction.to === traceCounterexampleWorld && activeTrace?.worldId === direction.from ? 'trace-counterexample-edge' : '',
          activeTrace && !explorerHighlight && !traceCheckedEdges.has(directionPair) ? 'trace-irrelevant-edge' : '',
          explorerRelevantEdges.has(directionPair) ? 'explorer-relevant-edge' : '',
          explorerHighlight?.witnessWorlds.has(direction.to) && explorerHighlight.sourceWorld === direction.from ? 'explorer-witness-edge' : '',
          explorerHighlight?.counterexampleWorlds.has(direction.to) && explorerHighlight.sourceWorld === direction.from ? 'explorer-counterexample-edge' : '',
        ].filter(Boolean).join(' '),
      }
    }

    const normalEdges = relationPresentations.flatMap<FlowEdge>((presentation) => {
      if (presentation.kind === 'bidirectional' && expandedRelationPairKey !== presentation.pairKey) {
        const endpoints = resolveModalEdgeEndpoints(worldKeyById.get(presentation.source), worldKeyById.get(presentation.target))
        if (!endpoints || !presentation.reverse) return []
        const selected = presentation.forward.explicitKey === selectedEdgeKey || presentation.reverse.explicitKey === selectedEdgeKey
        const bothDerived = presentation.forward.derived && presentation.reverse.derived
        const checked = traceCheckedEdges.has(`${presentation.forward.from}\u0000${presentation.forward.to}`)
          || traceCheckedEdges.has(`${presentation.reverse.from}\u0000${presentation.reverse.to}`)
        const explorerChecked = explorerRelevantEdges.has(`${presentation.forward.from}\u0000${presentation.forward.to}`)
          || explorerRelevantEdges.has(`${presentation.reverse.from}\u0000${presentation.reverse.to}`)
        const id = `pair:${presentation.source}:${presentation.target}`
        const lane = routeLanes.get(id)
        return [{
          id,
          source: endpoints.source,
          target: endpoints.target,
          type: 'modal',
          data: { pairKey: presentation.pairKey, description: describeRelationPresentation(presentation), sourceOffset: lane?.sourceOffset, targetOffset: lane?.targetOffset, curveOffset: lane?.curveOffset },
          interactionWidth: 24,
          markerEnd: marker(presentation.forward.derived, true),
          markerStart: marker(presentation.reverse.derived, true),
          selectable: true,
          focusable: true,
          ariaLabel: describeRelationPresentation(presentation),
          className: [
            'model-edge', 'bidirectional-edge', bothDerived ? 'derived-edge' : '',
            presentation.forward.derived !== presentation.reverse.derived ? 'mixed-relation' : '',
            ...focusClasses(presentation, selected), checked ? 'trace-checked-edge' : '', activeTrace && !explorerHighlight && !checked ? 'trace-irrelevant-edge' : '', explorerChecked ? 'explorer-relevant-edge' : '',
            (frameWitnessPresentation.premiseEdges.has(`${presentation.forward.from}\u0000${presentation.forward.to}`) || frameWitnessPresentation.premiseEdges.has(`${presentation.reverse.from}\u0000${presentation.reverse.to}`)) ? 'frame-witness-premise-edge' : '',
          ].filter(Boolean).join(' '),
        }]
      }
      if (presentation.kind === 'bidirectional' && presentation.reverse) {
        return [directionEdge(presentation, presentation.forward, true), directionEdge(presentation, presentation.reverse, true)].filter((edge): edge is FlowEdge => Boolean(edge))
      }
      const edge = directionEdge(presentation, presentation.forward, false)
      return edge ? [edge] : []
    })
    const missing = frameWitnessPresentation.missingEdge
    if (!missing || missing.from === missing.to) return normalEdges
    const endpoints = resolveModalEdgeEndpoints(worldKeyById.get(missing.from), worldKeyById.get(missing.to))
    if (!endpoints) return normalEdges
    return [...normalEdges, {
      id: `frame-witness-missing:${missing.from}:${missing.to}`,
      source: endpoints.source,
      target: endpoints.target,
      type: 'modal',
      data: { description: `Missing relation from ${missing.from} to ${missing.to} for the selected frame-property witness` },
      markerEnd: { type: MarkerType.Arrow, color: '#a43f2d', width: SINGLE_ARROWHEAD_SIZE, height: SINGLE_ARROWHEAD_SIZE },
      selectable: false,
      focusable: false,
      className: 'model-edge frame-witness-missing-edge',
    }]
  }, [relationPresentations, expandedRelationPairKey, worldKeyById, worlds, selectedEdgeKey, focusedWorldId, traceCheckedEdges, traceForcedDerivedPairKeys, traceWitnessWorld, traceCounterexampleWorld, activeTrace, graphEdgesEditable, frameWitnessPresentation, explorerRelevantEdges, explorerHighlight])

  const MiniMapWithRelations = useMemo(() => {
    const worldByKey = new Map(worlds.map((world) => [String(world.key), world]))
    const keyByWorldId = new Map(worlds.map((world) => [world.id.trim(), String(world.key)]))
    const relationPairs = displayedEdges
      .filter((edge) => edge.from !== edge.to)
      .map((edge) => ({ source: keyByWorldId.get(edge.from), target: keyByWorldId.get(edge.to) }))

    return function RelationMiniMapNode(props: MiniMapNodeProps) {
      const sourceWorld = worldByKey.get(props.id)
      const diameter = Math.min(props.width, props.height) * 0.62
      const circleX = props.x + props.width / 2 - diameter / 2
      const circleY = props.y + props.height / 2 - diameter / 2
      return (
        <g>
          {sourceWorld && relationPairs
            .filter((pair) => pair.source === props.id && pair.target)
            .map((pair) => {
              const targetWorld = worldByKey.get(pair.target!)
              if (!targetWorld) return null
              return (
                <line
                  key={`${pair.source}-${pair.target}`}
                  x1={props.x + props.width / 2}
                  y1={props.y + props.height / 2}
                  x2={resolveWorldVisualCenter(targetWorld.position).x}
                  y2={resolveWorldVisualCenter(targetWorld.position).y}
                  className="minimap-relation"
                />
              )
            })}
          <MiniMapNode
            {...props}
            x={circleX}
            y={circleY}
            width={diameter}
            height={diameter}
          />
        </g>
      )
    }
  }, [worlds, displayedEdges])

  const selectedWorld = worlds.find((world) => world.key === selectedWorldKey) ?? null
  const playingTrack = campaignTracks[playingTrackIndex ?? campaignTrackIndex]
  const selectedGuidedCampaign = guidedCampaigns[guidedCampaignIndex]
  const learnTaskLevels = learnLessons.map(({ task }) => task)
  const activeLevels = gameMode === 'tutorial' ? tutorialLevels : gameMode === 'learn' ? learnTaskLevels : gameMode === 'campaign' ? playingTrack.levels : gameMode === 'guidedCampaign' ? selectedGuidedCampaign.levels : gameMode === 'custom' ? customLevels : []
  const activeLevel = gameMode === 'sandbox' ? null : activeMapLevel ?? null
  useEffect(() => { setMinimapPinned(false) }, [activeLevel?.id])
  const customSequenceLabel = customLevels.length > 1 ? 'Custom campaign' : 'Custom mission'
  const tutorialCompleted = tutorialLevels.filter((level) => completedLevelIds.has(level.id)).length
  const nextTutorialIndex = tutorialLevels.findIndex((level) => !completedLevelIds.has(level.id))
  const introCompleted = learnProgress.completedLessonIds.length
  const playableLearningCompleted = tutorialCompleted + introCompleted
  const availableLearningTotal = tutorialLevels.length + learnLessons.length
  const overallCampaignLevels = campaignTracks.reduce((total, track) => total + track.levels.length, 0)
  const overallCampaignCompleted = campaignTracks.reduce((total, track) => total + track.levels.filter((level) => completedLevelIds.has(level.id)).length, 0)
  const successfulAttempts = guestProfile.history.filter((entry) => entry.success).length
  const completedHistoryLevels = new Set(guestProfile.history.filter((entry) => entry.success && entry.levelId).map((entry) => entry.levelId)).size
  const distinctSolutions = Object.values(guestProfile.solutionSignatures).reduce((total, signatures) => total + signatures.length, 0)
  const activeDistinctSolutionCount = activeLevel ? guestProfile.solutionSignatures[activeLevel.id]?.length ?? 0 : 0
  const currentValuation = Object.fromEntries(worlds.map(({ id, atoms }) => [id.trim(), atoms.split(/[\s,]+/u).filter(Boolean)]))
  const insertFormulaSymbol = (symbol: string) => {
    const input = formulaInputRef.current
    const insertion = insertAtSelection(formulaSource, symbol, input?.selectionStart ?? formulaSource.length, input?.selectionEnd ?? formulaSource.length)
    setFormulaSource(insertion.value)
    setResult(null)
    setTimeout(() => { formulaInputRef.current?.focus(); formulaInputRef.current?.setSelectionRange(insertion.selectionStart, insertion.selectionEnd) }, 0)
  }
  const scopeComparison = (() => {
    const configuredWorld = activeLevel?.scopeComparison?.evaluationWorld ?? (activeLevel?.showScopeComparison ? evaluationWorld : undefined)
    if (!configuredWorld || !result || !formulaSource.trim() || usableWorldIds.length === 0) return null
    try {
      const formula = parseFormula(formulaSource)
      return (['pointed', 'model', 'frame'] as const).map((scope) => {
        const verdict = verifyObjective({ scope, targetTruth: true, evaluationWorld: configuredWorld }, {
          worldIds: usableWorldIds,
          edges: effectiveEdges,
          valuation: currentValuation,
          formula,
        }).formula
        return {
          scope,
          holds: verdict.holds,
          reason: scope === 'pointed'
            ? `${configuredWorld} ${verdict.holds ? 'satisfies' : 'does not satisfy'} the formula under the shown valuation.`
            : scope === 'model'
              ? verdict.holds ? 'Every world satisfies the formula under the shown valuation.' : 'At least one world fails under the shown valuation.'
              : verdict.holds ? 'Every world satisfies the formula under every valuation.' : 'Frame validity checks every valuation. A world and countervaluation refute it.',
        }
      })
    } catch {
      return null
    }
  })()
  const currentTrueAtomCount = Object.values(currentValuation).reduce((total, atoms) => total + atoms.length, 0)
  const activeBaseline = activeLevel ? {
    worldIds: activeLevel.worlds.map(({ id }) => id), explicitEdges: activeLevel.edges,
    valuation: Object.fromEntries(activeLevel.worlds.map(({ id, atoms }) => [id, atoms.split(/[\s,]+/u).filter(Boolean)])),
  } : undefined
  const currentSemanticChanges = activeBaseline ? countConstructionChanges({
    worldIds: usableWorldIds, explicitEdges: edges, effectiveEdges, valuation: currentValuation, baseline: activeBaseline,
  }) : undefined
  const frameValuationEstimate = useMemo(() => {
    if (evaluationScope !== 'frame' && evaluationScope !== 'correspondence') return null
    try {
      const atoms = new Set(collectAtoms(parseFormula(formulaSource)))
      if (comparisonFormulaSource.trim()) for (const atom of collectAtoms(parseFormula(comparisonFormulaSource))) atoms.add(atom)
      const slots = usableWorldIds.length * atoms.size
      return { atoms: atoms.size, valuations: 2 ** slots }
    } catch {
      return null
    }
  }, [evaluationScope, formulaSource, comparisonFormulaSource, usableWorldIds.length])
  const frameValuationLimitExceeded = Boolean(frameValuationEstimate && (!Number.isSafeInteger(frameValuationEstimate.valuations) || frameValuationEstimate.valuations > DEFAULT_MAXIMUM_VALUATIONS))
  const failureSummary = Object.entries(guestProfile.history.reduce<Partial<Record<AttemptFailureCategory, number>>>((counts, entry) => {
    if (entry.failureCategory) counts[entry.failureCategory] = (counts[entry.failureCategory] ?? 0) + 1
    return counts
  }, {})).sort(([, left], [, right]) => (right ?? 0) - (left ?? 0)) as [AttemptFailureCategory, number][]
  const conceptSummary = [...guestProfile.history.reduce<Map<string, { attempts: number; successes: number }>>((summary, entry) => {
    const concept = entry.concept ?? entry.scope
    const current = summary.get(concept) ?? { attempts: 0, successes: 0 }
    summary.set(concept, { attempts: current.attempts + 1, successes: current.successes + (entry.success ? 1 : 0) })
    return summary
  }, new Map()).entries()].sort(([, left], [, right]) => right.attempts - left.attempts).slice(0, 6)
  const courseLesson = activeLevel ? learnLessonByTaskId.get(activeLevel.id) : undefined
  const revealLearnHint = (index: number) => {
    if (!courseLesson) return
    const bounded = Math.max(1, Math.min(courseLesson.hints.length, index))
    setLearnHintLevel((current) => Math.max(current, bounded))
    setLearnProgress((current) => {
      const used = current.hintsUsed[courseLesson.id] ?? []
      if (used.includes(bounded)) return current
      return { ...current, hintsUsed: { ...current.hintsUsed, [courseLesson.id]: [...used, bounded] } }
    })
  }
  const isQuestionTask = activeLevel?.interactionMode === 'question'
  const previousSoundResultRef = useRef<VerificationResult>(null)
  useEffect(() => {
    if (result && result !== previousSoundResultRef.current) {
      playSound(result.kind === 'success' ? 'success' : 'failure', soundEffects)
    }
    previousSoundResultRef.current = result
  }, [result, soundEffects])
  useEffect(() => {
    if (result && !isQuestionTask) verificationResultRef.current?.focus()
  }, [isQuestionTask, result])
  useEffect(() => {
    if (!isQuestionTask) return
    setModelView('graph')
    setSelectedWorldKey(null)
    setSelectedEdgeKey(null)
  }, [activeLevel?.id, isQuestionTask])
  const activeLevelFailureCount = activeLevel ? guestProfile.history.filter((entry) => entry.levelId === activeLevel.id && !entry.success).length : 0
  const relatedLearnLesson = courseLesson?.relatedLessonIds?.map((id) => learnLessons.find((lesson) => lesson.id === id)).find(Boolean)
  const semanticFeedbackLevel = result?.kind === 'failure' && activeLevel ? Math.max(1, Math.min(3, activeLevelFailureCount)) : 3
  const resizeWorkspacePanel = (side: 'left' | 'right', desiredWidth: number) => {
    const measuredWidth = workspaceRef.current?.clientWidth
    const totalWidth = measuredWidth && measuredWidth > 0 ? measuredWidth : 1280
    setWorkspaceLayout((current) => resizeWorkspaceSide(current, side, desiredWidth, Math.max(0, totalWidth - 40)))
  }
  const workspaceGridStyle = {
    '--workspace-left-width': `${workspaceLayout.left}px`,
    '--workspace-right-width': `${workspaceLayout.right}px`,
  } as CSSProperties
  const anyDialogOpen = showHelp || showFrameRules || showDataManager || learnConceptOpen || showWorkspaceTour
  useDialogFocus(anyDialogOpen, () => {
    if (showWorkspaceTour) dismissWorkspaceTour()
    else if (learnConceptOpen) setLearnConceptOpen(false)
    else { setShowHelp(false); setShowFrameRules(false); setShowDataManager(false) }
  })
  const activeLearnChapter = courseLesson ? learnCourse.chapters.find((chapter) => chapter.id === courseLesson.chapterId) : undefined
  const activeLearnChapterIndex = activeLearnChapter && courseLesson ? activeLearnChapter.lessons.findIndex((lesson) => lesson.id === courseLesson.id) : -1
  const isGuidedMode = gameMode !== 'sandbox' && gameMode !== 'author'
  const isHowToPlay = gameMode === 'tutorial'
  const isConstructionObjective = activeLevel?.objectiveKind === 'construction'
  const focusedIntroWorkspace = isHowToPlay || gameMode === 'learn'
  const presentation = activeLevel?.workspacePresentation
  const showFormulaPanel = !isGuidedMode
  const showWorldPanel = !isGuidedMode || Boolean(presentation?.worlds || presentation?.valuations || activeLevel?.editable.some((permission) => permission === 'worlds' || permission === 'valuations'))
  const showValuations = !isGuidedMode || Boolean(presentation?.valuations || activeLevel?.editable.includes('valuations'))
  const showEdgePanel = !isGuidedMode || Boolean(presentation?.edges || activeLevel?.editable.includes('edges'))
  const showEvaluationControl = !isQuestionTask && (!isGuidedMode || Boolean(presentation?.evaluation || activeLevel?.editable.includes('evaluation') || activeLevel?.scope === 'pointed'))
  const choosePredictionAnswer = (answer: string) => {
    setPredictionAnswer(answer)
    setResult(null)
    if (!courseLesson || !activeLevel?.prediction) return
    const expected = activeLevel.prediction.kind === 'frame-property' ? activeLevel.prediction.expectedProperty : activeLevel.prediction.expectedChoice
    const correct = activeLevel.prediction.kind === 'truth' || !expected ? undefined : answer === expected
    setLearnProgress((current) => ({
      ...current,
      predictionAnswers: { ...current.predictionAnswers, [courseLesson.id]: answer },
      predictionCorrectness: correct === undefined ? current.predictionCorrectness : { ...current.predictionCorrectness, [courseLesson.id]: correct },
    }))
  }
  const tutorialAllows = (control: import('./campaign').TutorialControl) => !isHowToPlay || Boolean(activeLevel?.tutorialControls?.includes(control))
  const completedGuidedTask = Boolean(activeLevel && result?.kind === 'success')
  const inlineObjectiveControl = Boolean(
    isGuidedMode
    && !isQuestionTask
    && !completedGuidedTask
    && result === null
    && showEvaluationControl
    && !showWorldPanel
    && !showEdgePanel
    && (isConstructionObjective || evaluationScope === 'pointed'),
  )
  const showVerificationPanel = !completedGuidedTask && (!isGuidedMode || !inlineObjectiveControl)
  const workspaceLeftPanelOpen = leftPanelOpen && (showFormulaPanel || showVerificationPanel)
  const workspaceRightPanelOpen = rightPanelOpen && (showWorldPanel || showEdgePanel)
  const taskIsLocked = Boolean(isQuestionTask || completedGuidedTask)
  const canEditWorlds = !taskIsLocked && editorMode === 'edit' && (!activeLevel || activeLevel.editable.includes('worlds'))
  const canEditValuations = !taskIsLocked && editorMode === 'edit' && (!activeLevel || activeLevel.editable.includes('valuations'))
  const canEditEdges = !taskIsLocked && editorMode === 'edit' && (!activeLevel || activeLevel.editable.includes('edges'))
  const canEditConstraints = !taskIsLocked && (!activeLevel || activeLevel.editable.includes('constraints'))
  const canEditEvaluation = !taskIsLocked && (!activeLevel || activeLevel.editable.includes('evaluation'))
  const canRepositionWorlds = !completedGuidedTask && editorMode === 'edit' && !isQuestionTask && activeLevel?.workspacePresentation?.lockLayout !== true
  const canUseHistory = !isHowToPlay || tutorialAllows('history')
  const tutorialAtomVocabulary = isHowToPlay ? activeLevel?.atomVocabulary : undefined
  const { renameWorld, updateWorldAtoms, addWorld, tidyModel, removeWorld, addEdge, commitEdgeDraft, replaceEdgeEndpoint, connectWorlds, deleteEdge, selectEvaluationWorld } = useWorkspaceEditing({
    worlds, edges, selectedWorld, evaluationWorld, nextWorldKey, nextEdgeKey, edgeDraft, canEditWorlds, canEditValuations, canEditEdges, canEditEvaluation, atomVocabulary: tutorialAtomVocabulary, graphCanvasRef, flowInstance,
    setWorlds, setEdges, setEvaluationWorld, setNextWorldKey, setNextEdgeKey, setEdgeDraft, setEdgeEditErrors,
    clearResult: () => setResult(null), saveHistoryPoint, clearGraphSelection, setHoveredWorldKey, clearCollisions: () => setCollidingWorldKeys(new Set()), onCreate: () => playSound('create', soundEffects),
  })
  const graphInteractions = useKripkeGraphInteractions({
    worlds, edges, canEditWorlds, canEditEdges, canRepositionWorlds,
    chooseWorldAnswer: isQuestionTask && (activeLevel?.prediction?.kind === 'world-choice' || activeLevel?.prediction?.kind === 'counterexample-world'),
    flowInstance, saveHistoryPoint, setWorlds, setCollidingWorldKeys, setHoveredWorldKey,
    clearGraphSelection, clearFrameWitness: () => setActiveFrameWitness(null), selectWorld,
    selectExplicitEdge, selectReciprocalPair, choosePredictionAnswer, connectWorlds, deleteEdge, addWorld,
  })

  useEffect(() => {
    const handleWorkspaceShortcut = (event: KeyboardEvent) => {
      const overlayOpen = showHelp || showFrameRules || showDataManager || showWorkspaceTour || learnConceptOpen
      if (appView !== 'workspace' || overlayOpen || isTextEntryTarget(event.target)) return
      if (shouldBeginValuationEdit({
        key: event.key,
        target: event.target,
        ctrlKey: event.ctrlKey,
        metaKey: event.metaKey,
        altKey: event.altKey,
        isComposing: event.isComposing,
        hasSelectedWorld: selectedWorldKey !== null,
        valuationsVisible: showValuations && tutorialAllows('valuations'),
        canEditValuations,
        overlayOpen,
      })) {
        const input = selectedValuationInputRef.current
        input?.focus()
        const end = input?.value.length ?? 0
        input?.setSelectionRange(end, end)
        return
      }
      if (isQuestionTask && (event.key === 'Enter' || event.key === ' ')) {
        const nodeElement = event.target instanceof HTMLElement ? event.target.closest<HTMLElement>('.react-flow__node[data-id]') : null
        const world = nodeElement ? worlds.find(({ key }) => String(key) === nodeElement.dataset.id) : undefined
        if (world && (activeLevel?.prediction?.kind === 'world-choice' || activeLevel?.prediction?.kind === 'counterexample-world')) {
          event.preventDefault()
          choosePredictionAnswer(world.id.trim())
          return
        }
      }
      if (event.key === 'Escape') {
        clearGraphSelection()
        setActiveFrameWitness(null)
        return
      }
      const deleteSelection = resolveDeleteSelection({ key: event.key, target: event.target, selectedWorldKey, selectedEdgeKey, canEditWorlds, canEditEdges })
      if (deleteSelection) {
        event.preventDefault()
        if (deleteSelection.kind === 'world') removeWorld(deleteSelection.key)
        else deleteEdge(deleteSelection.key)
        return
      }
      if (event.altKey && evaluationTraceSteps.length > 0 && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
        event.preventDefault()
        setTraceStepIndex((current) => event.key === 'ArrowLeft' ? Math.max(0, current - 1) : Math.min(evaluationTraceSteps.length - 1, current + 1))
        return
      }
      if (!canUseHistory || !event.ctrlKey) return
      if (event.key.toLowerCase() === 'z') {
        event.preventDefault()
        if (event.shiftKey) redo()
        else undo()
      } else if (event.key.toLowerCase() === 'y') {
        event.preventDefault()
        redo()
      }
    }
    window.addEventListener('keydown', handleWorkspaceShortcut)
    return () => window.removeEventListener('keydown', handleWorkspaceShortcut)
  })

  useEffect(() => {
    const canvas = graphCanvasRef.current
    if (!canvas) return
    let previousDebugTime = 0
    const handleMapWheel = (event: WheelEvent) => {
      if (!(event.target instanceof Element) || !event.target.closest('.react-flow')) return
      if (event.target.closest('.react-flow__minimap')) {
        event.preventDefault()
        event.stopPropagation()
        return
      }
      if (event.target.closest('.react-flow__panel, button, input, select, textarea, [role="button"], [role="slider"]')) {
        event.preventDefault()
        event.stopPropagation()
        return
      }
      if (!flowInstance) return
      const bounds = canvas.getBoundingClientRect()
      event.preventDefault()
      event.stopPropagation()
      const handling = resolveMapWheelHandling(event, flowInstance.getViewport(), {
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      })
      if (import.meta.env.DEV && localStorage.getItem('logic-game:debug-map-wheel') === '1') {
        const now = performance.now()
        console.debug('[map-wheel]', { dt: Math.round(now - previousDebugTime), deltaX: event.deltaX, deltaY: event.deltaY, deltaMode: event.deltaMode, ctrlKey: event.ctrlKey, gesture: handling.gesture })
        previousDebugTime = now
      }
      void flowInstance.setViewport(handling.viewport, { duration: 0 })
    }
    canvas.addEventListener('wheel', handleMapWheel, { passive: false, capture: true })
    return () => canvas.removeEventListener('wheel', handleMapWheel, true)
  }, [flowInstance])

  const loadLevel = useWorkspaceLevelLoader({
    defaultFrameRules, setCampaignLevelIndex, setFormulaSource, setComparisonFormulaSource, setWorlds, setEdges,
    setEvaluationWorld, setTargetTruth, setEvaluationScope, setSelectedCorrespondence, setFrameRules,
    setNextWorldKey, setNextEdgeKey, setSelectedWorldKey, setSelectedEdgeKey, setHoveredWorldKey,
    setExpandedRelationPairKey, setLeftPanelOpen, setRightPanelOpen, setEditorMode, clearResult: () => setResult(null),
    setPredictionAnswer, clearHistory,
  })

  useEffect(() => {
    try {
      const shared = readSharedJson()
      if (!shared) return
      const imported = JSON.parse(shared) as Record<string, unknown>
      if (isSandboxSharePayload(imported)) {
        const sandbox = parseSandboxSharePayload(imported)
        sharedSandboxSession.current = true
        setGameMode('sandbox')
        setAppView('workspace')
        setFormulaSource(sandbox.formula)
        setComparisonFormulaSource(sandbox.comparisonFormula)
        setWorlds(sandbox.worlds.map((world, key) => ({ key, id: world.id, atoms: world.atoms.join(' '), position: { x: 90 + (key % 3) * 240, y: 90 + Math.floor(key / 3) * 160 } })))
        setEdges(sandbox.edges.map((edge, key) => ({ key, ...edge })))
        setEvaluationWorld(sandbox.evaluationWorld)
        setTargetTruth(sandbox.targetTruth)
        setEvaluationScope(sandbox.scope)
        setFrameRules(sandbox.frameRules)
        setNextWorldKey(sandbox.worlds.length)
        setNextEdgeKey(sandbox.edges.length)
        setResult(null)
        setSandboxShareMessage('Shared Sandbox loaded for this session. Your saved local Sandbox is still available.')
        return
      }
      const levels = imported.format === 'logic-model-builder-campaign'
        ? parseCustomCampaign(imported).missions.map(({ level }) => level)
        : [parseCustomLevelFile(imported)]
      sandboxBeforeCampaign.current = { formulaSource, comparisonFormulaSource, worlds, edges, evaluationWorld, targetTruth, frameRules, evaluationScope }
      setCustomLevels(levels)
      setGameMode('custom')
      setAppView('workspace')
      loadLevel(0, levels)
    } catch (error) {
      setDataMessage(error instanceof Error ? error.message : 'Could not open the shared mission.')
      setShowDataManager(true)
    }
    // A share fragment is an initial navigation instruction, not reactive app state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const captureSandboxBeforeGuided = () => {
    sandboxBeforeCampaign.current = { formulaSource, comparisonFormulaSource, worlds, edges, evaluationWorld, targetTruth, frameRules, evaluationScope }
  }
  const { startGuidedLevel, startGuidedCampaign, startLearnLesson, startLearnTransfer } = useGuidedWorkspaceLaunchers({
    gameMode, campaignTrackIndex, guidedCampaignIndex, completedLevelIds, learnProgress, captureSandbox: captureSandboxBeforeGuided,
    loadLevel, setGameMode, setCampaignTrackIndex, setPlayingTrackIndex, setGuidedCampaignIndex, setGuidedHintLevel,
    setLearnTransferActive, setLearnHintLevel, setPredictionAnswer, setLearnProgress, setLearnConceptOpen, setAppView,
  })

  const restartControlsSection = () => {
    if (!window.confirm('Restart Learn the Controls from its first lesson? Existing attempt history will be kept.')) return
    const tutorialIds = new Set(tutorialLevels.map(({ id }) => id))
    setCompletedLevelIds((current) => new Set([...current].filter((id) => !tutorialIds.has(id))))
    startGuidedLevel('tutorial', 0)
  }

  const restartLearnChapter = (chapterId: string) => {
    const chapter = learnCourse.chapters.find(({ id }) => id === chapterId)
    if (!chapter?.lessons[0] || !window.confirm(`Restart ${chapter.title} from its first lesson? Existing attempt history will be kept.`)) return
    const lessonIds = new Set(chapter.lessons.map(({ id }) => id))
    setLearnProgress((current) => ({
      ...current,
      completedLessonIds: current.completedLessonIds.filter((id) => !lessonIds.has(id)),
      completedChapterIds: current.completedChapterIds.filter((id) => id !== chapter.id),
    }))
    startLearnLesson(learnLessons.findIndex(({ id }) => id === chapter.lessons[0].id))
  }

  const markWelcomeViewed = () => setLearnProgress((current) => current.welcomeViewed ? current : { ...current, welcomeViewed: true })

  const continueLearningPath = () => {
    if (!learnProgress.welcomeViewed) { setAppView('welcome'); return }
    if (nextTutorialIndex >= 0) { startGuidedLevel('tutorial', nextTutorialIndex); return }
    for (const chapter of learnCourse.chapters.filter((item) => item.lessons.length > 0)) {
      const lesson = chapter.lessons.find((item) => !learnProgress.completedLessonIds.includes(item.id))
      if (lesson) { startLearnLesson(learnLessons.findIndex((item) => item.id === lesson.id)); return }
    }
    setAppView('learn')
  }

  const returnToSandbox = () => {
    if (isGuidedMode) exitCampaign()
    setAppView('workspace')
  }

  const openWorkspaceTour = () => {
    setLearnConceptOpen(false)
    setAppView('workspace')
    revealWorkspaceTour()
  }

  const applySandboxPreset = (preset: 'build' | 'evaluate' | 'frame') => {
    if (preset === 'build') {
      setEditorMode('edit')
      setRightPanelOpen(true)
      setLeftPanelOpen(false)
      return
    }
    if (preset === 'evaluate') {
      setEditorMode('evaluate')
      setLeftPanelOpen(true)
      setTimeout(() => formulaInputRef.current?.focus(), 0)
      return
    }
    setEditorMode('edit')
    setLeftPanelOpen(true)
    setShowFrameRules(true)
  }

  const selectCampaignTrack = (index: number) => {
    setCampaignTrackIndex(index)
    setPlayingTrackIndex(index)
    loadLevel(0, campaignTracks[index].levels)
  }

  const exitCampaign = () => {
    const draft = sandboxBeforeCampaign.current
    setGameMode('sandbox')
    const settings = loadInterfaceSettings()
    setLeftPanelOpen(settings.leftPanelOpen)
    setRightPanelOpen(settings.rightPanelOpen)
    if (!draft) return
    setFormulaSource(draft.formulaSource)
    setComparisonFormulaSource(draft.comparisonFormulaSource ?? '')
    setWorlds(draft.worlds)
    setEdges(draft.edges)
    setEvaluationWorld(draft.evaluationWorld)
    setTargetTruth(draft.targetTruth)
    setFrameRules({ ...defaultFrameRules, ...draft.frameRules })
    setEvaluationScope(draft.evaluationScope === 'world' ? 'pointed' : draft.evaluationScope ?? 'pointed')
    setNextWorldKey(Math.max(-1, ...draft.worlds.map(({ key }) => key)) + 1)
    setNextEdgeKey(Math.max(-1, ...draft.edges.map(({ key }) => key)) + 1)
    setSelectedCorrespondence('')
    setResult(null)
  }

  const resetSandbox = () => {
    if (gameMode !== 'sandbox') {
      loadLevel(campaignLevelIndex, activeLevels)
      return
    }
    if (!window.confirm('Reset the sandbox? The current model will be replaced.')) return
    saveHistoryPoint()
    setFormulaSource('◇p')
    setWorlds(initialWorlds)
    setEdges(initialEdges)
    setEvaluationWorld('w0')
    setTargetTruth(true)
    setFrameRules(defaultFrameRules)
    setEvaluationScope('pointed')
    setComparisonFormulaSource('')
    setSelectedCorrespondence('')
    setNextWorldKey(2)
    setNextEdgeKey(1)
    setSelectedEdgeKey(null)
    setResult(null)
  }

  const loadCorrespondencePreset = (presetId: string) => {
    setSelectedCorrespondence(presetId)
    const preset = correspondencePresets.find(({ id }) => id === presetId)
    if (!preset) return
    saveHistoryPoint()
    setFormulaSource(preset.formula)
    setComparisonFormulaSource('')
    setEvaluationScope('correspondence')
    setTargetTruth(true)
    setResult(null)
  }

  const recordAttempt = (success: boolean, bonusAchieved?: boolean, failureCategory?: AttemptFailureCategory) => recordWorkspaceAttempt({
    authorWorkspaceActive: Boolean(authorWorkspaceSession), authorPlaytest, gameMode, activeLevel: activeLevel ?? undefined, evaluationScope, worldCount: worlds.length,
    edgeCount: new Set(edges.map(({ from, to }) => `${from}\u0000${to}`)).size, trueAtomCount: currentTrueAtomCount, semanticChanges: currentSemanticChanges,
    courseLesson, learnTransferActive, setGuestProfile, setGuidedHintLevel, setLearnProgress,
  }, success, bonusAchieved, failureCategory)

  const verify = () => {
    try {
      setTraceStepIndex(0)
      const preset = correspondencePresets.find(({ id }) => id === selectedCorrespondence)
      const outcome = evaluateWorkspaceVerification({
        activeLevel: activeLevel ?? undefined, activeLevelFailureCount, formulaSource, comparisonFormulaSource, worlds, edges,
        effectiveEdges: effectiveEdges.map(({ from, to }) => ({ from, to })), evaluationWorld, targetTruth, evaluationScope,
        frameRules, frameRuleResults, correspondenceProperty: preset?.property, predictionAnswer, isConstructionObjective,
        diagnosticFeedback: courseLesson?.diagnosticFeedback,
      })
      setResult(outcome.result)
      recordAttempt(outcome.success, outcome.bonusAchieved, outcome.failureCategory)
      if (outcome.success && activeLevel && !authorPlaytest) {
        const ids = worlds.map(({ id }) => id.trim())
        const valuation = Object.fromEntries(worlds.map(({ id, atoms }) => [id.trim(), atoms.split(/[\s,]+/u).map((value) => value.trim()).filter(Boolean)]))
        setCompletedLevelIds((current) => new Set([...current, activeLevel.id]))
        try {
          const signature = canonicalModelSignature({ worldIds: ids, edges: effectiveEdges.map(({ from, to }) => ({ from, to })), valuation, evaluationWorld }, {
            includeValuation: evaluationScope === 'pointed' || evaluationScope === 'model',
            preserveEvaluationWorld: evaluationScope === 'pointed',
          })
          setGuestProfile((current) => {
            const existing = current.solutionSignatures[activeLevel.id] ?? []
            return existing.includes(signature) ? current : {
              ...current,
              solutionSignatures: { ...current.solutionSignatures, [activeLevel.id]: [...existing, signature].slice(0, 25) },
            }
          })
        } catch { /* Diversity tracking is optional for models above the canonicalization limit. */ }
      }
    } catch (error) {
      setResult({ kind: 'error', message: error instanceof Error ? error.message : 'Verification failed.' })
      recordAttempt(false, undefined, 'syntax-or-model')
      if (error instanceof FormulaSyntaxError) {
        setLeftPanelOpen(true)
        setTimeout(() => {
          formulaInputRef.current?.focus()
          formulaInputRef.current?.setSelectionRange(error.position, Math.min(error.position + 1, formulaSource.length))
        }, 0)
      }
    }
  }

  const serializedModel = () => JSON.stringify({
    format: 'logic-model-builder',
    version: 1,
    formula: formulaSource,
    comparisonFormula: comparisonFormulaSource.trim() || undefined,
    scope: evaluationScope,
    targetTruth,
    evaluationWorld,
    correspondencePreset: selectedCorrespondence,
    worlds: worlds.map(({ id, atoms, position }) => ({ id, atoms, position })),
    edges: edges.map(({ from, to }) => ({ from, to })),
    frameRules,
  }, null, 2)

  const currentAuthorSnapshot = (): AuthorStartSnapshot => ({
    ...currentSnapshot(), formulaSource, comparisonFormulaSource, targetTruth, evaluationScope, selectedCorrespondence,
  })

  const currentWorkspaceDraft = (): SandboxDraft => ({ formulaSource, comparisonFormulaSource, worlds: structuredClone(worlds), edges: structuredClone(edges), evaluationWorld, targetTruth, frameRules: { ...frameRules }, evaluationScope })

  const restoreWorkspaceDraft = (draft: SandboxDraft) => {
    setFormulaSource(draft.formulaSource)
    setComparisonFormulaSource(draft.comparisonFormulaSource ?? '')
    setWorlds(structuredClone(draft.worlds))
    setEdges(structuredClone(draft.edges))
    setEvaluationWorld(draft.evaluationWorld)
    setTargetTruth(draft.targetTruth)
    setFrameRules({ ...defaultFrameRules, ...draft.frameRules })
    setEvaluationScope(draft.evaluationScope === 'world' ? 'pointed' : draft.evaluationScope ?? 'pointed')
    setNextWorldKey(Math.max(-1, ...draft.worlds.map(({ key }) => key)) + 1)
    setNextEdgeKey(Math.max(-1, ...draft.edges.map(({ key }) => key)) + 1)
    setResult(null)
  }

  const openAuthorWorkspace = (purpose: AuthorWorkspaceSession['purpose']) => {
    if (purpose === 'reference-solution' && !levelStartSnapshot) { setDataMessage('Capture the starting model before building a reference solution.'); return }
    const previousWorkspace = currentWorkspaceDraft()
    const previousGameMode = gameMode
    const source = levelStartSnapshot ?? currentAuthorSnapshot()
    setFormulaSource(source.formulaSource)
    setComparisonFormulaSource(source.comparisonFormulaSource)
    setTargetTruth(source.targetTruth)
    setEvaluationScope(source.evaluationScope)
    setSelectedCorrespondence(source.selectedCorrespondence)
    restoreSnapshot(source)
    setNextWorldKey(Math.max(-1, ...source.worlds.map(({ key }) => key)) + 1)
    setNextEdgeKey(Math.max(-1, ...source.edges.map(({ key }) => key)) + 1)
    setAuthorWorkspaceSession({ purpose, returnStep: purpose === 'starting-model' ? 2 : 7, previousWorkspace, previousGameMode })
    setGameMode('author')
    setAppView('workspace')
  }

  const leaveAuthorWorkspace = (save: boolean) => {
    const session = authorWorkspaceSession
    if (!session) return
    if (save && session.purpose === 'starting-model') {
      setImportedAuthorFile(null)
      setLevelStartSnapshot(currentAuthorSnapshot())
      setLevelReferenceSolution(null)
      setDataMessage('Starting model saved. The previous workspace remains unchanged.')
    }
    if (save && session.purpose === 'reference-solution') {
      try {
        const solution: ReferenceSolution = { worlds: worlds.map(({ id, atoms, position }) => ({ id: id.trim(), atoms, position })), edges: edges.map(({ from, to }) => ({ from, to })), evaluationWorld, frameRules }
        assertValidReferenceSolution(customLevelFromSandbox(), solution)
        setLevelReferenceSolution(solution)
        setDataMessage('Reference solution verified and saved.')
      } catch (error) {
        setResult({ kind: 'error', message: error instanceof Error ? error.message : 'The reference solution is not valid.' })
        return
      }
    }
    restoreWorkspaceDraft(session.previousWorkspace)
    setGameMode(session.previousGameMode)
    setAuthorStep(session.returnStep)
    setAuthorWorkspaceSession(null)
    setAuthorStudioOpen(true)
    setAppView('create')
  }

  const customLevelFromSandbox = (): GameLevel => {
    const start = levelStartSnapshot ?? currentAuthorSnapshot()
    return createCustomMission(start, {
      title: levelTitle, instruction: levelInstruction, learningObjective: levelLearningObjective, concept: levelConcept,
      prerequisites: levelPrerequisites, difficulty: levelDifficulty, editable: levelEditable, bounds: levelBounds,
      requiredProperties: levelRequiredProperties, forbiddenProperties: levelForbiddenProperties,
      requiredEdges: levelRequiredEdges, forbiddenEdges: levelForbiddenEdges,
      requiredAtoms: levelRequiredAtoms, forbiddenAtoms: levelForbiddenAtoms,
      bonusMaximumEdges: levelBonusMaximumEdges, predictionKind: levelPredictionKind,
      predictionProperty: levelPredictionProperty, framePropertyNames: levelPropertyNames,
    })
  }

  const serializedCustomLevel = () => serializeCustomLevel(customLevelFromSandbox(), levelReferenceSolution ?? undefined)

  const captureMissionStart = () => {
    setLevelStartSnapshot(currentAuthorSnapshot())
    setLevelReferenceSolution(null)
    setDataMessage('Mission start captured. Close this dialog, construct a solution, then capture it here.')
  }

  const captureReferenceSolution = () => {
    try {
      if (!levelStartSnapshot) throw new Error('Capture the mission start before capturing its solution.')
      const solution: ReferenceSolution = {
        worlds: worlds.map(({ id, atoms, position }) => ({ id: id.trim(), atoms, position })),
        edges: edges.map(({ from, to }) => ({ from, to })), evaluationWorld, frameRules,
      }
      assertValidReferenceSolution(customLevelFromSandbox(), solution)
      setLevelReferenceSolution(solution)
      setDataMessage('Valid reference solution captured. Players will still begin from the captured mission start.')
    } catch (error) {
      setDataMessage(error instanceof Error ? error.message : 'Could not capture the reference solution.')
    }
  }

  const restoreCapturedMissionStart = () => {
    if (!levelStartSnapshot) return
    if (!window.confirm('Restore the captured mission start in the workspace? Unsaved workspace changes will be replaced.')) return
    setFormulaSource(levelStartSnapshot.formulaSource)
    setComparisonFormulaSource(levelStartSnapshot.comparisonFormulaSource)
    setTargetTruth(levelStartSnapshot.targetTruth)
    setEvaluationScope(levelStartSnapshot.evaluationScope)
    setSelectedCorrespondence(levelStartSnapshot.selectedCorrespondence)
    restoreSnapshot(levelStartSnapshot)
    setNextWorldKey(Math.max(-1, ...levelStartSnapshot.worlds.map(({ key }) => key)) + 1)
    setNextEdgeKey(Math.max(-1, ...levelStartSnapshot.edges.map(({ key }) => key)) + 1)
    setDataMessage('Captured mission start restored in the workspace.')
    setShowDataManager(false)
  }

  const playtestCustomMission = () => {
    try {
      if (!levelStartSnapshot) throw new Error('Capture the mission start before playtesting.')
      // Imported packages may contain prediction variants that the form does
      // not edit yet. Keep the complete package intact for direct playtests.
      const contents = importedAuthorFile
        ? serializeCustomLevel(importedAuthorFile.level, importedAuthorFile.referenceSolution)
        : serializedCustomLevel()
      const level = parseCustomLevelFile(JSON.parse(contents))
      sandboxBeforeCampaign.current = { formulaSource, comparisonFormulaSource, worlds, edges, evaluationWorld, targetTruth, frameRules, evaluationScope }
      authorPlaytestReturnMode.current = gameMode
      setAuthorPlaytest(true)
      setCustomLevels([level])
      setGameMode('custom')
      loadLevel(0, [level])
      setAppView('workspace')
      setShowDataManager(false)
    } catch (error) {
      setDataMessage(error instanceof Error ? error.message : 'Could not start the custom mission playtest.')
    }
  }

  const serializedProgressBackup = () => serializeProgressBackup({
    contentRevision: currentCampaignContentRevision,
    guest: guestProfile,
    completedLevelIds: [...completedLevelIds],
    learnProgress,
    referenceSolutionViewed: [...referenceSolutionViewed],
    sandbox: JSON.parse(serializedModel()),
  })

  const applyAuthoringMissionSeed = (seed: AuthoringMissionSeed) => {
    setLevelTitle(seed.title)
    setLevelInstruction(seed.instruction)
    setLevelLearningObjective(seed.learningObjective)
    setLevelConcept(seed.concept)
    setLevelPrerequisites(seed.prerequisites)
    setLevelDifficulty(seed.difficulty)
    setLevelEditable(seed.editable)
    setLevelBounds(seed.bounds)
    setLevelRequiredProperties(seed.requiredProperties)
    setLevelForbiddenProperties(seed.forbiddenProperties)
    setLevelRequiredEdges(seed.requiredEdges)
    setLevelForbiddenEdges(seed.forbiddenEdges)
    setLevelRequiredAtoms(seed.requiredAtoms)
    setLevelForbiddenAtoms(seed.forbiddenAtoms)
    setLevelBonusMaximumEdges(seed.bonusMaximumEdges)
    setLevelPredictionKind(seed.predictionKind)
    if (seed.predictionProperty) setLevelPredictionProperty(seed.predictionProperty)
    setLevelStartSnapshot(seed.startSnapshot)
  }

  const duplicateBuiltInMission = () => {
    const templates = [...tutorialLevels, ...campaignTracks.flatMap((track) => track.levels), ...guidedCampaigns.flatMap((campaign) => campaign.levels)]
    const source = templates.find(({ id }) => id === authorTemplateId)
    if (!source) return
    const seed = createAuthoringMissionSeed(source, defaultFrameRules)
    applyAuthoringMissionSeed({ ...seed, title: `${source.title} copy` })
    setLevelReferenceSolution(null)
    setMissionAuditFindings([])
    setImportedAuthorFile(null)
    setDataMessage(`Duplicated “${source.title}”. Build and verify a new reference solution before export.`)
    setAuthorStep(1)
    setVisitedAuthorSteps(new Set([1]))
    setAuthorStudioOpen(true)
    setAppView('create')
  }

  const importCustomContent = () => {
    try {
      const parsed = JSON.parse(customImportSource) as Record<string, unknown>
      if (parsed.format === 'logic-model-builder-campaign') {
        const campaign = parseCustomCampaign(parsed)
        setCustomCampaignTitle(campaign.title)
        setCustomCampaignDescription(campaign.description)
        setAuthoredCampaignMissions(campaign.missions)
        setAuthorStep(9)
        setVisitedAuthorSteps(new Set([1, 9]))
        setAuthorStudioOpen(true)
        setDataMessage(`Imported campaign package “${campaign.title}”.`)
        return
      }
      const imported = parseCustomLevelPackage(parsed)
      const source = imported.level
      applyAuthoringMissionSeed(createAuthoringMissionSeed(source, defaultFrameRules))
      setLevelReferenceSolution(imported.referenceSolution ?? null)
      setImportedAuthorFile(imported)
      setAuthorStep(7)
      setVisitedAuthorSteps(new Set([1, 2, 3, 4, 5, 6, 7]))
      setAuthorStudioOpen(true)
      setDataMessage(`Imported “${source.title}” into the creation studio.`)
    } catch (error) {
      setDataMessage(error instanceof Error ? error.message : 'Could not import custom content.')
    }
  }

  const validateAuthorStep = (step: number) => validateAuthoringStep({
    step, title: levelTitle, instruction: levelInstruction, learningObjective: levelLearningObjective, concept: levelConcept,
    formulaSource, evaluationWorld, editableCount: levelEditable.size, startSnapshot: levelStartSnapshot,
    currentSnapshot: currentAuthorSnapshot, hasReferenceSolution: Boolean(levelReferenceSolution), validateMission: customLevelFromSandbox,
  })

  const goToAuthorStep = (step: number) => {
    if (!visitedAuthorSteps.has(step) && step !== authorStep) return
    setAuthorStep(step)
    setAuthorStepErrors([])
  }

  const advanceAuthorStep = () => {
    const errors = validateAuthorStep(authorStep)
    if (errors.length > 0) { setAuthorStepErrors(errors); return }
    if (authorStep === 8 && !runMissionAudit()) { setAuthorStepErrors(['Resolve the blocking audit findings before export/share.']); return }
    const next = Math.min(9, authorStep + 1)
    setVisitedAuthorSteps((current) => new Set([...current, next]))
    setAuthorStep(next)
    setAuthorStepErrors([])
  }

  const authorCanExport = missionAuditFindings.length > 0 && !missionAuditFindings.some(({ severity }) => severity === 'error')

  const shareSandbox = useSandboxSharing({
    formulaIsValid: formulaValidation.kind === 'valid', comparisonFormulaIsInvalid: comparisonFormulaValidation.kind === 'invalid',
    formulaSource, comparisonFormulaSource, worlds, edges, evaluationWorld, evaluationScope, targetTruth, frameRules,
    setShareLink, setSandboxShareMessage,
  })

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink)
      setDataMessage('Share link copied to the clipboard.')
    } catch {
      setDataMessage('Clipboard access was unavailable. Select and copy the visible link manually.')
    }
  }

  const downloadFile = (contents: string, filename: string, type: string) => {
    const url = URL.createObjectURL(new Blob([contents], { type }))
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  const downloadJson = (contents: string, filename: string) => downloadFile(contents, filename, 'application/json')

  const { downloadProfile, downloadEducatorResults, clearLocalHistory } = useProfileDataActions({
    guestProfile, completedLevelIds, contentRevision: currentCampaignContentRevision, setGuestProfile, downloadFile,
  })

  const { runMissionAudit, downloadCustomLevel, addMissionToCustomCampaign, downloadCustomCampaign, generateMissionShareLink, generateCampaignShareLink } = useAuthoringPublishing({
    currentMission: customLevelFromSandbox, serializeCurrentMission: serializedCustomLevel,
    referenceSolution: levelReferenceSolution, importedMission: importedAuthorFile,
    campaignTitle: customCampaignTitle, campaignDescription: customCampaignDescription, campaignMissions: authoredCampaignMissions,
    setCampaignMissions: setAuthoredCampaignMissions, setAuditFindings: setMissionAuditFindings,
    setDataMessage, setShareLink, downloadJson,
  })

  const { openDataManager, resetSavedProgress, resetSavedSandbox, importProgress, importModel, downloadModel } = useSandboxDataExchange({
    initialWorlds, initialEdges, defaultFrameRules, knownCorrespondencePresetIds: new Set(correspondencePresets.map(({ id }) => id)),
    serializedModel, serializedProgressBackup, importSource, backupImportSource, setImportSource, setBackupImportSource,
    setDataMessage, setShowDataManager, setGameMode, setFormulaSource, setComparisonFormulaSource, setWorlds, setEdges,
    setEvaluationWorld, setEvaluationScope, setTargetTruth, setFrameRules, setSelectedCorrespondence, setNextWorldKey,
    setNextEdgeKey, clearResult: () => setResult(null), setGuestProfile, setCompletedLevelIds, setReferenceSolutionViewed,
    setLearnProgress, setAppView, clearSandboxReturnState: () => { sandboxBeforeCampaign.current = null }, downloadJson,
  })

  const returnToGuidedBrowser = () => {
    if (gameMode === 'learn' || gameMode === 'tutorial') setAppView('learn')
    else if (gameMode === 'guidedCampaign') { setCampaignSection('challenges'); setAppView('campaigns') }
    else if (gameMode === 'custom') {
      exitCampaign()
      if (authorPlaytest) {
        setGameMode(authorPlaytestReturnMode.current)
        setAuthorPlaytest(false)
        setAuthorStudioOpen(true)
        setAppView('create')
      } else setAppView('workspace')
    }
    else {
      setCampaignTrackIndex(playingTrackIndex ?? campaignTrackIndex)
      setCampaignSection('practice')
      setAppView('campaigns')
    }
  }

  const goBack = () => {
    if (appView === 'workspace') {
      if (authorWorkspaceSession) { leaveAuthorWorkspace(false); return }
      if (isGuidedMode) returnToGuidedBrowser()
      else setAppView('lab')
      return
    }
    if (appView === 'create' && authorStudioOpen) { setAuthorStudioOpen(false); return }
    restorePreviousView()
  }

  const nextIncompleteLearnLesson = learnLessons.find((lesson) => !learnProgress.completedLessonIds.includes(lesson.id))
  const nextLearningTitle = !learnProgress.welcomeViewed
    ? 'Welcome to Modal Logic'
    : nextTutorialIndex >= 0
      ? tutorialLevels[nextTutorialIndex].title
      : nextIncompleteLearnLesson?.title
  const currentLearningDestination: LearningDestination | null = activeLevel && isHowToPlay
    ? { kind: 'control', id: activeLevel.id, index: campaignLevelIndex }
    : courseLesson
      ? { kind: 'lesson', id: courseLesson.id, index: learnLessons.findIndex(({ id }) => id === courseLesson.id) }
      : null
  const learningNavigation = currentLearningDestination
    ? resolveLearningNavigation(currentLearningDestination, tutorialLevels, learnLessons)
    : { previous: null, next: null }
  const openLearningDestination = (destination: LearningDestination) => {
    if (destination.kind === 'control') startGuidedLevel('tutorial', destination.index)
    else startLearnLesson(destination.index)
  }
  const missionHeaderMode: MissionHeaderMode = gameMode === 'guidedCampaign' ? 'campaign' : gameMode === 'campaign' ? 'practice' : gameMode === 'custom' ? 'custom' : 'learn'
  const questionFeedback = isQuestionTask && result && 'prediction' in result && result.prediction
    ? { correct: result.prediction.correct, detail: buildQuestionFeedback({ attemptCount: activeLevelFailureCount + (result.prediction.correct ? 0 : 1), detail: result.prediction.detail, correct: result.prediction.correct, lesson: courseLesson }) }
    : undefined
  const missionSectionTitle = courseLesson && activeLearnChapter
    ? activeLearnChapter.title
    : isHowToPlay
      ? 'Learn the Controls'
      : gameMode === 'guidedCampaign'
        ? selectedGuidedCampaign.title
        : gameMode === 'campaign'
          ? playingTrack.title
          : gameMode === 'custom'
            ? customSequenceLabel
            : activeLevel?.chapter ?? ''
  const missionProgressLabel = courseLesson && activeLearnChapter
    ? `Lesson ${activeLearnChapterIndex + 1} of ${activeLearnChapter.lessons.length}`
    : isHowToPlay
      ? `Lesson ${campaignLevelIndex + 1} of ${tutorialLevels.length}`
      : `Mission ${campaignLevelIndex + 1} of ${activeLevels.length}`
  const missionNavigationUnit = focusedIntroWorkspace ? 'lesson' : 'mission'
  const hasMissionDetails = Boolean(activeLevel && (
    activeLevel.briefing
    || activeLevel.learningObjective
    || activeLevel.workspacePresentation?.visibleConstraints?.length
    || activeLevel.targetAnalysis?.length
    || activeLevel.hints?.length
    || activeLevel.referenceSolution
    || courseLesson?.hints.length
    || activeLevel.formula
  ))
  const backLabelEn = appView !== 'workspace'
    ? appView === 'create' && authorStudioOpen ? 'Back to Create' : 'Back'
    : authorWorkspaceSession
      ? 'Cancel and return to authoring'
    : gameMode === 'learn' || gameMode === 'tutorial'
      ? 'Back to Learn'
      : gameMode === 'guidedCampaign'
        ? 'Back to Campaigns'
        : gameMode === 'campaign'
          ? 'Back to Practice'
          : gameMode === 'custom'
            ? 'Return to Model Sandbox'
          : 'Back to Lab'
  const backLabel = interfaceLanguage === 'cs'
    ? ({
        'Back to Create': 'Zpět k tvorbě',
        Back: 'Zpět',
        'Cancel and return to authoring': 'Zrušit a vrátit se k tvorbě',
        'Back to Learn': 'Zpět k výuce',
        'Back to Campaigns': 'Zpět ke kampaním',
        'Back to Practice': 'Zpět k procvičování',
        'Return to Model Sandbox': 'Zpět do modelové laboratoře',
        'Back to Lab': 'Zpět do laboratoře',
      } as Record<string, string>)[backLabelEn] ?? backLabelEn
    : backLabelEn
  const ui: AppChromeLabels = interfaceLanguage === 'cs'
    ? { home: 'Domů', learn: 'Výuka', campaigns: 'Kampaně', lab: 'Laboratoř', more: 'Více', create: 'Vytvořit', reference: 'Přehled modální logiky', help: 'Nápověda a ovládání', profile: 'Profil', data: 'Data', settings: 'Nastavení', language: 'Jazyk rozhraní', light: 'Světlý režim', dark: 'Tmavý režim', skip: 'Přeskočit na hlavní obsah' }
    : { home: 'Home', learn: 'Learn', campaigns: 'Campaigns', lab: 'Lab', more: 'More', create: 'Create', reference: 'Modal Logic Reference', help: 'Help & Controls', profile: 'Profile', data: 'Data', settings: 'Settings', language: 'Interface language', light: 'Light mode', dark: 'Dark mode', skip: 'Skip to main content' }

  return (
    <div className={`page-shell density-${interfaceDensity} ${reduceMotion ? 'force-reduced-motion' : ''} ${gameMode === 'custom' && authorPreview === 'mobile' ? 'author-preview-mobile' : ''}`}>
      <AppChrome
        activeArea={appView === 'home' ? 'home' : appView === 'learn' || appView === 'welcome' || (appView === 'workspace' && (gameMode === 'learn' || gameMode === 'tutorial')) ? 'learn' : appView === 'campaigns' || (appView === 'workspace' && (gameMode === 'guidedCampaign' || gameMode === 'campaign')) ? 'campaigns' : appView === 'lab' || (appView === 'workspace' && gameMode === 'sandbox') ? 'lab' : undefined}
        showBack={appView !== 'home'} backLabel={backLabel} labels={ui} language={interfaceLanguage}
        showResume={appView !== 'home' && appView !== 'workspace' && isGuidedMode && Boolean(activeLevel)} resumeLabel={interfaceLanguage === 'cs' ? (gameMode === 'learn' || gameMode === 'tutorial' ? 'Pokračovat v lekci' : 'Pokračovat v misi') : `Resume ${gameMode === 'learn' || gameMode === 'tutorial' ? 'lesson' : 'mission'}`}
        showWorkspaceReset={appView === 'workspace'} workspaceResetLabel={interfaceLanguage === 'cs' ? (isGuidedMode ? (missionNavigationUnit === 'lesson' ? 'Znovu začít lekci' : 'Znovu začít misi') : 'Obnovit výchozí model') : (isGuidedMode ? `Restart ${missionNavigationUnit}` : 'Reset model')} showQuickHelp={appView === 'workspace'}
        fullscreenEnabled={document.fullscreenEnabled} isFullscreen={isFullscreen} showWorkspaceTour={appView === 'workspace'} compactWorkspaceNavigation={appView === 'workspace'}
        onNavigate={setAppView} onBack={goBack} onLanguageChange={setInterfaceLanguage} onResume={() => setAppView('workspace')} onResetWorkspace={resetSandbox} onOpenQuickHelp={() => setShowHelp(true)} onToggleFullscreen={() => void toggleFullscreen()}
        onOpenWorkspaceTour={openWorkspaceTour} onOpenCreate={() => setAppView('create')} onOpenReference={() => setAppView('reference')} onOpenHelp={() => setAppView('help')} onOpenProfile={() => setAppView('profile')} onOpenData={openDataManager} onOpenSettings={() => setAppView('settings')}
      />

      <main id="main-content" className="main-content" tabIndex={-1}>

      {appView === 'home' && (
        <HomeView language={interfaceLanguage} completed={playableLearningCompleted} total={availableLearningTotal} nextTitle={nextLearningTitle} currentSession={isGuidedMode && activeLevel ? { kind: gameMode === 'learn' || gameMode === 'tutorial' ? 'lesson' : 'mission', title: activeLevel.title, context: activeLevel.chapter } : undefined} onResume={() => setAppView('workspace')} onLearn={continueLearningPath} onCampaigns={() => setAppView('campaigns')} onLab={() => setAppView('lab')} />
      )}

      {appView === 'lab' && <LabView language={interfaceLanguage} onOpenModelSandbox={returnToSandbox} />}

      {appView === 'learn' && (
        <LearnOverview completed={playableLearningCompleted} total={availableLearningTotal} progress={learnProgress} tutorialLevels={tutorialLevels} tutorialCompleted={tutorialCompleted} nextTutorialIndex={nextTutorialIndex} expandedChapterId={expandedLearnChapterId} completedLevelIds={completedLevelIds} course={learnCourse} lessons={learnLessons} onContinue={continueLearningPath} onWelcome={() => setAppView('welcome')} onOpenControl={(index) => startGuidedLevel('tutorial', index)} onRestartControls={restartControlsSection} onOpenLesson={startLearnLesson} onRestartChapter={restartLearnChapter} onToggleChapter={(chapterId) => setExpandedLearnChapterId((current) => current === chapterId ? null : chapterId)} />
      )}
      {appView === 'welcome' && <ModalLogicWelcome onBegin={() => { markWelcomeViewed(); startGuidedLevel('tutorial', nextTutorialIndex < 0 ? 0 : nextTutorialIndex) }} onSkip={() => { markWelcomeViewed(); startGuidedLevel('tutorial', nextTutorialIndex < 0 ? 0 : nextTutorialIndex) }} onBack={() => setAppView('learn')} />}
      {appView === 'settings' && (
        <SettingsView language={interfaceLanguage} density={interfaceDensity} showMinimap={showMinimap} showDerivedRelations={showDerivedEdges} reduceMotion={reduceMotion} soundEffects={soundEffects} onLanguageChange={setInterfaceLanguage} onDensityChange={setInterfaceDensity} onShowMinimapChange={setShowMinimap} onShowDerivedRelationsChange={setShowDerivedEdges} onReduceMotionChange={setReduceMotion} onSoundEffectsChange={setSoundEffects} onManageData={openDataManager} onReset={resetInterfacePreferences} />
      )}

      {appView === 'campaigns' && (
        <CampaignsView section={campaignSection} guidedCampaigns={guidedCampaigns} practiceTracks={campaignTracks} selectedTrackIndex={campaignTrackIndex} completedLevelIds={completedLevelIds} overallPracticeCompleted={overallCampaignCompleted} overallPracticeLevels={overallCampaignLevels} activePracticeTrackIndex={playingTrackIndex ?? campaignTrackIndex} activePracticeLevelIndex={campaignLevelIndex} practiceSessionActive={gameMode === 'campaign'} onSectionChange={setCampaignSection} onOpenLearn={() => setAppView('learn')} onStartCampaign={startGuidedCampaign} onSelectPracticeTrack={setCampaignTrackIndex} onStartPractice={(levelIndex, trackIndex) => startGuidedLevel('campaign', levelIndex, trackIndex)} onResumePractice={() => setAppView('workspace')} />
      )}

      {appView === 'create' && !authorStudioOpen && (
        <CreateView templates={[...tutorialLevels, ...campaignTracks.flatMap((track) => track.levels), ...guidedCampaigns.flatMap((campaign) => campaign.levels)]} selectedTemplateId={authorTemplateId} onSelectedTemplateChange={setAuthorTemplateId} onOpenStudio={() => { setDataMessage(''); setImportedAuthorFile(null); setLevelTitle(authoringDefaults.title); setLevelInstruction(authoringDefaults.instruction); setLevelLearningObjective(authoringDefaults.learningObjective); setLevelConcept(authoringDefaults.concept); setLevelPrerequisites(authoringDefaults.prerequisites); setLevelDifficulty(authoringDefaults.difficulty); setLevelEditable(createEditableAuthoringPermissions()); setLevelBounds(createAuthoringBounds()); setLevelRequiredProperties(new Set()); setLevelForbiddenProperties(new Set()); setLevelRequiredEdges(''); setLevelForbiddenEdges(''); setLevelRequiredAtoms(''); setLevelForbiddenAtoms(''); setLevelBonusMaximumEdges(''); setLevelPredictionKind(authoringDefaults.predictionKind); setLevelStartSnapshot(null); setLevelReferenceSolution(null); setMissionAuditFindings([]); openNewMission() }} onOpenCampaign={() => { setDataMessage(''); openCampaignPackage() }} onDuplicateTemplate={duplicateBuiltInMission} importSource={customImportSource} onImportSourceChange={(value) => { setCustomImportSource(value); setDataMessage('') }} onImportContent={importCustomContent} />
      )}

      {appView === 'create' && authorStudioOpen && <MissionAuthoringView title={levelTitle || 'Custom mission'} status={dataMessage} onBack={() => setAuthorStudioOpen(false)}>
        <MissionAuthorStepper currentStep={authorStep} visitedSteps={visitedAuthorSteps} errors={authorStepErrors} onSelectStep={goToAuthorStep} onBack={() => { setAuthorStep((step) => Math.max(1, step - 1)); setAuthorStepErrors([]) }} onNext={advanceAuthorStep}>
        <AuthoringStepContent
        step={authorStep} title={levelTitle} instruction={levelInstruction} learningObjective={levelLearningObjective} concept={levelConcept} prerequisites={levelPrerequisites} difficulty={levelDifficulty}
        editable={levelEditable} bounds={levelBounds} requiredProperties={levelRequiredProperties} forbiddenProperties={levelForbiddenProperties} requiredEdges={levelRequiredEdges} forbiddenEdges={levelForbiddenEdges} requiredAtoms={levelRequiredAtoms} forbiddenAtoms={levelForbiddenAtoms} bonusMaximumEdges={levelBonusMaximumEdges} predictionKind={levelPredictionKind} predictionProperty={levelPredictionProperty} propertyNames={levelPropertyNames} preview={authorPreview}
        startSnapshot={levelStartSnapshot} referenceSolution={levelReferenceSolution} auditFindings={missionAuditFindings} canExport={authorCanExport} campaignTitle={customCampaignTitle} campaignDescription={customCampaignDescription} campaignMissions={authoredCampaignMissions} shareLink={shareLink}
        setTitle={setLevelTitle} setInstruction={setLevelInstruction} setLearningObjective={setLevelLearningObjective} setConcept={setLevelConcept} setPrerequisites={setLevelPrerequisites} setDifficulty={setLevelDifficulty} setEditable={setLevelEditable} setBounds={setLevelBounds} setRequiredProperties={setLevelRequiredProperties} setForbiddenProperties={setLevelForbiddenProperties} setRequiredEdges={setLevelRequiredEdges} setForbiddenEdges={setLevelForbiddenEdges} setRequiredAtoms={setLevelRequiredAtoms} setForbiddenAtoms={setLevelForbiddenAtoms} setBonusMaximumEdges={setLevelBonusMaximumEdges} setPredictionKind={setLevelPredictionKind} setPredictionProperty={setLevelPredictionProperty} setPreview={setAuthorPreview} setStartSnapshot={setLevelStartSnapshot} setCampaignTitle={setCustomCampaignTitle} setCampaignDescription={setCustomCampaignDescription} setCampaignMissions={setAuthoredCampaignMissions}
        clearImportedMission={() => setImportedAuthorFile(null)} onOpenStartingModel={() => openAuthorWorkspace('starting-model')} onOpenReferenceSolution={() => openAuthorWorkspace('reference-solution')} onPlaytest={playtestCustomMission} onRunAudit={runMissionAudit} onAuditStep={(step) => { setVisitedAuthorSteps((current) => new Set([...current, step])); setAuthorStep(step); setAuthorStepErrors([]) }} onDownloadMission={downloadCustomLevel} onGenerateMissionLink={generateMissionShareLink} onAddMissionToCampaign={addMissionToCustomCampaign} onDownloadCampaign={downloadCustomCampaign} onGenerateCampaignLink={generateCampaignShareLink} onCopyShareLink={copyShareLink}
        />
        </MissionAuthorStepper>
      </MissionAuthoringView>}

      {appView === 'reference' && <ReferenceView onOpenLearn={() => setAppView('learn')} onOpenLab={() => setAppView('lab')} />}
      {appView === 'help' && <HelpView hasCurrentMission={isGuidedMode} onReturnToMission={() => setAppView('workspace')} onReplayWelcome={() => setAppView('welcome')} onReplayControls={() => startGuidedLevel('tutorial', 0)} onReplayTour={openWorkspaceTour} />}

      {appView === 'profile' && (
        <ProfileView guestId={guestProfile.id} createdAt={guestProfile.createdAt} history={guestProfile.history} successfulAttempts={successfulAttempts} completedHistoryLevels={completedHistoryLevels} savedCompletedLevels={completedLevelIds.size} distinctSolutions={distinctSolutions} conceptSummary={conceptSummary} failureSummary={failureSummary} failureLabel={(category) => failureCategoryLabels[category as AttemptFailureCategory]} onDownloadProfile={downloadProfile} onImportBackup={openDataManager} onDownloadResults={downloadEducatorResults} onClearHistory={clearLocalHistory} />
      )}

      {appView === 'workspace' && authorWorkspaceSession && <section className="mission-header mission-header-custom author-workspace-header" aria-label="Authoring workspace"><div className="mission-header-context"><span>Creation studio</span><strong>{authorWorkspaceSession.purpose === 'starting-model' ? 'Editing custom mission starting model' : 'Building reference solution'}</strong></div><div className="mission-header-objective"><span>Authoring context</span><p>{authorWorkspaceSession.purpose === 'starting-model' ? 'Edit the state that learners will receive.' : 'Build a state that satisfies the configured objective and constraints.'}</p></div><div className="mission-header-actions"><button type="button" className="verify-button" onClick={() => leaveAuthorWorkspace(true)}>{authorWorkspaceSession.purpose === 'starting-model' ? 'Save starting model and return' : 'Verify solution and return'}</button><button type="button" onClick={() => leaveAuthorWorkspace(false)}>Cancel</button></div></section>}

      {appView === 'workspace' && activeLevel && (
        <MissionHeader
          mode={missionHeaderMode}
          sectionTitle={missionSectionTitle}
          itemTitle={activeLevel.title}
          progressLabel={missionProgressLabel}
          objective={activeLevel.instruction}
          state={completedGuidedTask ? 'completed' : isQuestionTask ? 'question' : 'active'}
          content={completedGuidedTask && courseLesson ? <div className="mission-complete-content" role="status"><strong>{learnTransferActive ? 'Transfer complete' : courseLesson.title}</strong><p>{courseLesson.successExplanation}</p>{!learningNavigation.next && <div className="course-next-links"><span>Course complete. Continue with:</span><button type="button" onClick={() => { setCampaignSection('challenges'); setAppView('campaigns') }}>Campaigns</button><button type="button" onClick={returnToSandbox}>Model Sandbox</button><button type="button" onClick={() => setAppView('reference')}>Reference</button></div>}</div>
            : completedGuidedTask ? <div className="mission-complete-content" role="status"><strong>{campaignLevelIndex === activeLevels.length - 1 ? (isHowToPlay ? 'Controls complete' : gameMode === 'guidedCampaign' ? 'Campaign complete' : gameMode === 'campaign' ? 'Practice complete' : courseLesson ? 'Lesson complete' : 'Mission complete') : courseLesson ? 'Lesson complete' : 'Mission complete'}</strong><p>{activeLevel.successDebrief ?? (result && 'detail' in result ? result.detail : 'The objective is satisfied.')}</p>{!focusedIntroWorkspace && <><small>Distinct solutions recorded for this mission: <b>{activeDistinctSolutionCount}</b>.</small><div className="mission-completion-metrics" aria-label="Construction metrics"><span>{worlds.length} worlds</span><span>{new Set(edges.map(({ from, to }) => `${from}\u0000${to}`)).size} explicit relations</span><span>{currentTrueAtomCount} true atoms</span>{currentSemanticChanges !== undefined && <span>{currentSemanticChanges} changes from start</span>}</div></>}{gameMode === 'guidedCampaign' && referenceSolutionViewed.has(activeLevel.id) && <small><b>Assisted completion:</b> You viewed a reference construction before completing this mission.</small>}{result && 'prediction' in result && result.prediction && <small><b>{result.prediction.correct ? 'Prediction correct.' : 'Prediction incorrect.'}</b> {result.prediction.detail}</small>}{result && 'bonus' in result && result.bonus && <small><b>{result.bonus.achieved ? 'Bonus achieved.' : 'Optional bonus.'}</b> {result.bonus.detail}</small>}</div>
            : isQuestionTask ? <div className="mission-question-content"><QuestionTaskPanel level={activeLevel} answer={predictionAnswer} feedback={questionFeedback} onAnswer={choosePredictionAnswer} /></div>
              : undefined}
          previouslyCompleted={completedLevelIds.has(activeLevel.id)}
          taskSteps={isHowToPlay ? activeLevel.taskSteps : undefined}
          actions={<>
            {authorPlaytest && <button type="button" onClick={returnToGuidedBrowser}>Return to authoring</button>}
            {focusedIntroWorkspace && currentLearningDestination ? completedGuidedTask ? <>
              {courseLesson && !learnTransferActive && courseLesson.transferTask && <button type="button" className="secondary-button" onClick={() => startLearnTransfer(courseLesson.id)}>Try optional transfer</button>}
              {learningNavigation.next && <button type="button" className="verify-button" onClick={() => openLearningDestination(learningNavigation.next!)}>Next lesson</button>}
              <button type="button" onClick={() => setAppView('learn')}>Back to Learn overview</button>
              <button type="button" onClick={() => currentLearningDestination.kind === 'control' ? loadLevel(currentLearningDestination.index, tutorialLevels) : startLearnLesson(currentLearningDestination.index)}>Replay lesson</button>
            </> : <>
              <div className="mission-navigation-actions"><button type="button" disabled={!learningNavigation.previous} onClick={() => learningNavigation.previous && openLearningDestination(learningNavigation.previous)}>Previous lesson</button><button type="button" disabled={!completedLevelIds.has(activeLevel.id) || !learningNavigation.next} onClick={() => learningNavigation.next && openLearningDestination(learningNavigation.next)}>Next lesson</button></div>
              <div className="mission-work-actions">{inlineObjectiveControl && <label className="mission-evaluation-control"><span>Evaluation world</span><select disabled={!canEditEvaluation} value={evaluationWorld} onChange={(event) => selectEvaluationWorld(event.target.value)}><option value="">Select a world</option>{usableWorldIds.map((id) => <option key={id}>{id}</option>)}</select></label>}<button type="button" className="verify-button" onClick={verify} disabled={(isQuestionTask && !predictionAnswer) || (!isConstructionObjective && frameValuationLimitExceeded)}>{isQuestionTask ? 'Confirm answer' : 'Verify objective'}</button></div>
            </> : completedGuidedTask ? <>
              {campaignLevelIndex < activeLevels.length - 1
                ? <button type="button" className="verify-button" onClick={() => loadLevel(campaignLevelIndex + 1, activeLevels)}>Next mission</button>
                : authorPlaytest ? null : <button type="button" className="verify-button" onClick={returnToGuidedBrowser}>{gameMode === 'custom' ? 'Return to Model Sandbox' : gameMode === 'guidedCampaign' ? 'Back to Campaigns' : 'Back to Practice'}</button>}
              <button type="button" onClick={() => loadLevel(campaignLevelIndex, activeLevels)}>Replay mission</button>
              {campaignLevelIndex < activeLevels.length - 1 && <button type="button" onClick={returnToGuidedBrowser}>Back to overview</button>}
            </> : <>
              <div className="mission-navigation-actions"><button type="button" disabled={campaignLevelIndex === 0} onClick={() => loadLevel(campaignLevelIndex - 1, activeLevels)}>Previous {missionNavigationUnit}</button><button type="button" disabled={!completedLevelIds.has(activeLevel.id) || campaignLevelIndex === activeLevels.length - 1} onClick={() => loadLevel(campaignLevelIndex + 1, activeLevels)}>Next {missionNavigationUnit}</button></div>
              <div className="mission-work-actions">{inlineObjectiveControl && <label className="mission-evaluation-control"><span>Evaluation world</span><select disabled={!canEditEvaluation} value={evaluationWorld} onChange={(event) => selectEvaluationWorld(event.target.value)}><option value="">Select a world</option>{usableWorldIds.map((id) => <option key={id}>{id}</option>)}</select></label>}<button type="button" className="verify-button" onClick={verify} disabled={(isQuestionTask && !predictionAnswer) || (!isConstructionObjective && frameValuationLimitExceeded)}>{isQuestionTask ? 'Confirm answer' : 'Verify objective'}</button></div>
            </>}
          </>}
          details={hasMissionDetails ? <div className="mission-detail-sections">
            {courseLesson && <section><strong>Concept</strong><button type="button" className="secondary-button" onClick={() => setLearnConceptOpen(true)}>Review concept</button></section>}
            {activeLevel.formula && <section><strong>Target formula</strong><code>{activeLevel.formula}</code>{activeLevel.comparisonFormula && <code>{activeLevel.comparisonFormula}</code>}</section>}
            {activeLevel.briefing && <section><strong>{isHowToPlay ? 'Control help' : courseLesson ? 'Lesson details' : 'Mission details'}</strong><p>{activeLevel.briefing}</p></section>}
            {activeLevel.learningObjective && <section><strong>Learning objective</strong><p>{activeLevel.learningObjective}</p></section>}
            {(courseLesson?.chapterId === 'semantic-scopes' || activeLevel.scopeComparison) && <section className="scope-definition-card"><strong>Three semantic scopes</strong><p><b>Pointed · M,w ⊨ φ:</b> one selected world under the displayed valuation.</p><p><b>Model-global · M ⊨ φ:</b> every world under the current displayed valuation.</p><p><b>Frame-valid · F ⊨ φ:</b> every world under every valuation on the fixed frame.</p></section>}
            {activeLevel.workspacePresentation?.visibleConstraints?.length && <section><strong>Remember</strong><p>{activeLevel.workspacePresentation.visibleConstraints.join(' ')}</p></section>}
            {activeLevel.targetAnalysis && <section><strong>Analyse the target</strong>{activeLevel.targetAnalysis.map((item) => <p key={item}>{item}</p>)}</section>}
            {courseLesson?.hints && <section className="mission-hints"><strong>Lesson hints</strong><ProgressiveHints hints={courseLesson.hints} revealed={learnHintLevel} onReveal={revealLearnHint} /></section>}
            {activeLevel.hints && <section className="mission-hints"><strong>Strategic hints</strong><div>{activeLevel.hints.map((hint, index) => <button type="button" key={hint} disabled={index + 1 > guidedHintLevel} onClick={() => setGuidedHintLevel((level) => Math.max(level, index + 1))}>Hint {index + 1}</button>)}</div>{guidedHintLevel > 0 && <p>{activeLevel.hints[guidedHintLevel - 1]}</p>}</section>}
            {activeLevel.referenceSolution && <section className="reference-solution"><strong>Reference solution</strong><p>One validated construction, revealed separately from ordinary hints.</p>{(guidedHintLevel >= 3 || guestProfile.history.filter((entry) => entry.levelId === activeLevel.id && !entry.success).length >= 3) ? <><button type="button" className="secondary-button" onClick={() => { if (window.confirm('Showing the reference solution will reveal one complete construction. You can still complete the mission, but it will be recorded as assisted.')) setReferenceSolutionViewed((current) => new Set([...current, activeLevel.id])) }}>Show reference solution</button>{referenceSolutionViewed.has(activeLevel.id) && <code>Worlds: {activeLevel.referenceSolution.worlds.map((world) => `${world.id}${world.atoms ? `:{${world.atoms}}` : ':∅'}`).join(' · ')}<br />Relations: {activeLevel.referenceSolution.edges.map((edge) => `${edge.from} → ${edge.to}`).join(' · ') || '∅'}</code>}</> : <p>Available after Hint 3 or three unsuccessful attempts.</p>}</section>}
          </div> : undefined}
        />
      )}

      {appView === 'workspace' && <section ref={workspaceRef} style={workspaceGridStyle} className={`workspace mobile-tab-${mobileWorkspaceTab} ${isGuidedMode ? 'guided-workspace' : ''} ${inlineObjectiveControl ? 'objective-inline' : ''} ${evaluationScope === 'frame' ? 'frame-scope' : ''} ${showWorldPanel && !showEdgePanel ? 'world-panel-only' : ''} ${showEdgePanel && !showWorldPanel ? 'edge-panel-only' : ''} ${!workspaceLeftPanelOpen ? 'left-collapsed' : ''} ${!workspaceRightPanelOpen ? 'right-collapsed' : ''}`} aria-label="Kripke model editor">
        <MobileWorkspaceTabs activeTab={mobileWorkspaceTab} showFormula={showFormulaPanel} onChange={setMobileWorkspaceTab} />
        {workspaceLeftPanelOpen && <WorkspaceResizeHandle side="left" value={workspaceLayout.left} onResize={(value) => resizeWorkspacePanel('left', value)} />}
        {workspaceRightPanelOpen && <WorkspaceResizeHandle side="right" value={workspaceLayout.right} onResize={(value) => resizeWorkspacePanel('right', value)} />}
        {showFormulaPanel && <WorkspaceFormulaPanel formulaInputRef={formulaInputRef} formulaSource={formulaSource} comparisonFormulaSource={comparisonFormulaSource} formulaValidation={formulaValidation} comparisonFormulaValidation={comparisonFormulaValidation} evaluationScope={evaluationScope} targetTruth={targetTruth} selectedCorrespondence={selectedCorrespondence} correspondencePresets={correspondencePresets} sandbox={gameMode === 'sandbox'} guided={isGuidedMode} explorerOpen={showEvaluationExplorer} explorerFormula={explorerFormula} selectedFormulaPath={selectedFormulaPath} explorerHighlight={explorerHighlight} sandboxShareMessage={sandboxShareMessage} shareLink={shareLink} onFormulaChange={(value) => { setFormulaSource(value); setResult(null) }} onComparisonFormulaChange={(value) => { setComparisonFormulaSource(value); if (value.trim() && evaluationScope === 'correspondence') setEvaluationScope('frame'); setResult(null) }} onInsertSymbol={insertFormulaSymbol} onScopeChange={(scope) => { setEvaluationScope(scope); setResult(null) }} onTargetTruthChange={(value) => { setTargetTruth(value); setResult(null) }} onCorrespondenceChange={loadCorrespondencePreset} onShareSandbox={() => void shareSandbox()} onExplorerToggle={() => setShowEvaluationExplorer((open) => !open)} onExplorerSelect={setSelectedFormulaPath} onCopyShareLink={() => void copyShareLink()} />}

        <KripkeModelCanvas
          modelView={modelView}
          onModelViewChange={setModelView}
          graphCanvasRef={graphCanvasRef}
          table={<WorkspaceModelTable worlds={worlds} effectiveEdges={effectiveEdges} explicitEdgePairKeys={explicitEdgeKeyByPair} activeTraceWorldId={activeTrace?.worldId} canEditWorlds={canEditWorlds} canEditValuations={canEditValuations} canEditEvaluation={canEditEvaluation} questionWorldChoice={isQuestionTask && (activeLevel?.prediction?.kind === 'world-choice' || activeLevel?.prediction?.kind === 'counterexample-world')} predictionAnswer={predictionAnswer} onRenameWorld={renameWorld} onUpdateWorldAtoms={updateWorldAtoms} onSaveHistory={saveHistoryPoint} onChooseWorld={choosePredictionAnswer} onSelectEvaluationWorld={selectEvaluationWorld} onRemoveWorld={removeWorld} onAddWorld={() => addWorld()} />}
        >
            <ReactFlow
              nodes={flowNodes}
              edges={flowEdges}
              nodeTypes={worldNodeTypes}
              edgeTypes={modalEdgeTypes}
              connectionMode={ConnectionMode.Loose}
              onInit={setFlowInstance}
              onNodesChange={onNodesChange}
              nodesDraggable={canRepositionWorlds}
              nodesConnectable={canEditEdges}
              edgesFocusable
              nodesFocusable
              onNodeDragStart={graphInteractions.onNodeDragStart}
              onNodeDrag={graphInteractions.onNodeDrag}
              onNodeDragStop={graphInteractions.onNodeDragStop}
              onNodeMouseEnter={graphInteractions.onNodeMouseEnter}
              onNodeMouseLeave={graphInteractions.onNodeMouseLeave}
              onNodeClick={graphInteractions.onNodeClick}
              onConnect={connectWorlds}
              isValidConnection={graphInteractions.isValidConnection}
              onEdgeClick={graphInteractions.onEdgeClick}
              onEdgesDelete={graphInteractions.onEdgesDelete}
              onPaneClick={graphInteractions.onPaneClick}
              deleteKeyCode={null}
              fitView
              fitViewOptions={{ padding: 0.25 }}
              minZoom={MAP_MIN_ZOOM}
              maxZoom={MAP_MAX_ZOOM}
              {...modelMapInteractionProps}
              colorMode="light"
            >
              <Panel position="top-left" className="map-toolbar">
                <WorkspaceToolbar sandbox={gameMode === 'sandbox'} editorMode={editorMode} rightPanelOpen={workspaceRightPanelOpen} showWorldPanel={showWorldPanel} showEdgePanel={showEdgePanel} leftPanelOpen={workspaceLeftPanelOpen} evaluationPanelAvailable={Boolean(showFormulaPanel || showVerificationPanel)} canAddWorld={(!focusedIntroWorkspace || Boolean(presentation?.worlds)) && tutorialAllows('worlds')} canEditWorlds={canEditWorlds} canEditRelations={canEditEdges} canUseHistory={canUseHistory} canRepositionWorlds={canRepositionWorlds} selectedRelation={selectedEdgeKey !== null} undoAvailable={undoAvailable} redoAvailable={redoAvailable} worldCount={worlds.length} focusedIntro={focusedIntroWorkspace} showDerivedRelations={showDerivedEdges} derivedRelationCount={derivedPairKeys.size} frameRuleCount={frameRuleResults.length} flowInstance={flowInstance} minimapVisible={shouldShowMinimap} minimapAvailable={worlds.length > 1} onApplyPreset={applySandboxPreset} onAddWorld={() => addWorld()} onDeleteRelation={() => selectedEdgeKey !== null && deleteEdge(selectedEdgeKey)} onToggleEvaluationPanel={() => setLeftPanelOpen((open) => !open)} onToggleModelPanel={() => setRightPanelOpen((open) => !open)} onUndo={undo} onRedo={redo} onTidy={tidyModel} onToggleDerived={() => setShowDerivedEdges((show) => !show)} onOpenFrameRules={() => setShowFrameRules(true)} onVerify={verify} onToggleMinimap={() => { setShowMinimap((visible) => !visible); setMinimapPinned(true) }} />
              </Panel>
              <KripkeModelLegend
                hasExplorerHighlight={Boolean(explorerHighlight)}
                traceWitnessWorld={traceWitnessWorld}
                traceCounterexampleWorld={traceCounterexampleWorld}
                derivedRelationCount={derivedPairKeys.size}
                hasBidirectionalRelation={relationPresentations.some(({ kind }) => kind === 'bidirectional')}
                hasDerivedReflexiveRelation={[...reflexiveRelations.values()].some(({ derived }) => derived)}
                hasActiveTrace={Boolean(activeTrace)}
              />
              {!showDerivedEdges && derivedPairKeys.size > 0 && <Panel position="bottom-right" className="derived-hidden-note">{derivedPairKeys.size} derived relation{derivedPairKeys.size === 1 ? '' : 's'} hidden. <span>Display only. Verification still uses enforced relations.</span></Panel>}
              {traceForcedDerivedPairKeys.size > 0 && <Panel position="top-center" className="trace-derived-note">A hidden derived relation is temporarily shown because the current trace uses it.</Panel>}
              {activeTrace?.rule === 'necessity' && activeTrace.children.length === 0 && <Panel position="top-center" className="vacuous-trace-note"><b>0 successors</b><span>□ is vacuously true: there is no counterexample branch.</span></Panel>}
              {worlds.length === 0 && (
                <Panel position="top-center" className="empty-graph-state">
                  <strong>Start with a world</strong><span>Then connect worlds to define accessibility.</span>
                  <button type="button" onClick={() => addWorld()} disabled={!canEditWorlds}>Add first world</button>
                </Panel>
              )}
              <KripkeWorldInspector
                world={selectedWorld}
                worlds={worlds}
                canEditWorlds={canEditWorlds}
                canEditValuations={canEditValuations}
                canEditEdges={canEditEdges}
                canEditEvaluation={canEditEvaluation}
                showValuations={showValuations}
                showEvaluationControl={showEvaluationControl}
                valuationsAllowed={tutorialAllows('valuations')}
                evaluationAllowed={tutorialAllows('evaluation')}
                valuationInputRef={selectedValuationInputRef}
                onClose={() => setSelectedWorldKey(null)}
                onRename={renameWorld}
                onUpdateAtoms={updateWorldAtoms}
                onSaveHistory={saveHistoryPoint}
                onSelectEvaluationWorld={selectEvaluationWorld}
                onRemoveWorld={removeWorld}
                onConnect={(sourceKey, targetKey) => connectWorlds({ source: String(sourceKey), target: String(targetKey), sourceHandle: null, targetHandle: null })}
              />
              <Background color="#b9b6aa" gap={24} size={1} />
              {shouldShowMinimap && <MiniMap
                nodeComponent={MiniMapWithRelations}
                nodeColor={(node) => node.data.isEvaluation === true ? '#14647a' : '#7a4d26'}
                nodeStrokeColor="#f8f7f1"
                nodeStrokeWidth={2}
                nodeBorderRadius={50}
                maskColor="rgba(236, 233, 223, .62)"
                ariaLabel="Model overview"
              />}
            </ReactFlow>
        </KripkeModelCanvas>
        <WorkspaceModelPanels
          showWorldPanel={showWorldPanel}
          showEdgePanel={showEdgePanel}
          worlds={worlds}
          edges={edges}
          canShowWorldAdd={!focusedIntroWorkspace || Boolean(presentation?.worlds)}
          tutorialAllows={tutorialAllows}
          canEditWorlds={canEditWorlds}
          canEditValuations={canEditValuations}
          canEditEdges={canEditEdges}
          showValuations={showValuations}
          howToPlay={isHowToPlay}
          usableWorldIds={usableWorldIds}
          edgeEditErrors={edgeEditErrors}
          edgeDraft={edgeDraft}
          derivedRelationCount={derivedPairKeys.size}
          showDerivedEdges={showDerivedEdges}
          onSelectWorld={selectWorld}
          onRenameWorld={renameWorld}
          onUpdateWorldAtoms={updateWorldAtoms}
          onSaveHistory={saveHistoryPoint}
          onRemoveWorld={removeWorld}
          onAddWorld={() => addWorld()}
          onSelectEdge={selectExplicitEdge}
          onReplaceEdgeEndpoint={replaceEdgeEndpoint}
          onDeleteEdge={deleteEdge}
          onEdgeDraftChange={setEdgeDraft}
          onCommitEdgeDraft={commitEdgeDraft}
          onCancelEdgeDraft={() => setEdgeDraft(null)}
          onAddEdge={addEdge}
        />

        {showVerificationPanel && <WorkspaceVerificationPanel
          guided={isGuidedMode}
          constructionObjective={isConstructionObjective}
          questionTask={isQuestionTask}
          formulaSource={formulaSource}
          comparisonFormulaSource={comparisonFormulaSource}
          evaluationScope={evaluationScope}
          evaluationWorld={evaluationWorld}
          worldIds={usableWorldIds}
          canEditEvaluation={canEditEvaluation}
          showEvaluationControl={showEvaluationControl && !inlineObjectiveControl}
          frameValuationEstimate={frameValuationEstimate}
          frameValuationLimitExceeded={frameValuationLimitExceeded}
          valuationLimit={DEFAULT_MAXIMUM_VALUATIONS}
          scopeComparison={scopeComparison}
          prediction={activeLevel?.prediction}
          predictionScope={activeLevel?.scope}
          predictionAnswer={predictionAnswer}
          propertyChoices={levelPropertyNames}
          result={result}
          resultRef={verificationResultRef}
          recoveryActions={result?.kind === 'failure' && courseLesson && activeLevelFailureCount >= 3 ? <LearnRecoveryActions relatedTitle={relatedLearnLesson?.title} onReview={() => setLearnConceptOpen(true)} onHint={() => revealLearnHint(Math.min(learnHintLevel + 1, 3))} onRelated={relatedLearnLesson ? () => startLearnLesson(learnLessons.findIndex(({ id }) => id === relatedLearnLesson.id)) : undefined} /> : undefined}
          details={<WorkspaceVerificationDetails
            result={result}
            semanticFeedbackLevel={semanticFeedbackLevel}
            evaluationTraceSteps={evaluationTraceSteps}
            traceStepIndex={traceStepIndex}
            activeTrace={activeTrace}
            onTraceStepChange={setTraceStepIndex}
            onTraceSelect={(selected) => {
              const step = evaluationTraceSteps.findIndex(({ trace: candidate }) => candidate === selected)
              if (step >= 0) setTraceStepIndex(step)
            }}
          />}
          onEvaluationWorldChange={selectEvaluationWorld}
          onPredictionAnswer={choosePredictionAnswer}
          onVerify={verify}
        />}
      </section>}

      {appView === 'workspace' && courseLesson && learnConceptOpen && (
        <div className="dialog-backdrop concept-backdrop" role="presentation" onMouseDown={() => setLearnConceptOpen(false)}>
          <section className="help-dialog lesson-concept-dialog" role="dialog" aria-modal="true" aria-labelledby="lesson-concept-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="dialog-heading"><div><p className="dialog-context">Lesson {activeLearnChapterIndex + 1} in Learn Modal Logic</p><h2 id="lesson-concept-title">{courseLesson.title}</h2></div><button type="button" className="dialog-close" onClick={() => setLearnConceptOpen(false)} aria-label="Close lesson concept">×</button></div>
            <div className="lesson-concept-grid"><article><h3>Learning objective</h3><p>{courseLesson.learningObjective}</p></article><article><h3>{courseLesson.concept.heading}</h3><p>{courseLesson.concept.intuitive}</p>{courseLesson.concept.formal && <code>{courseLesson.concept.formal}</code>}<ul>{courseLesson.concept.keyPoints.map((point) => <li key={point}>{point}</li>)}</ul>{courseLesson.concept.warning && <p className="lesson-warning"><strong>Common pitfall:</strong> {courseLesson.concept.warning}</p>}</article>{courseLesson.workedExample && <details className="worked-example-disclosure"><summary>Show worked example</summary><WorkedExampleCard lessonId={courseLesson.id} example={courseLesson.workedExample} /></details>}</div>
            <button type="button" className="primary-action" autoFocus onClick={() => setLearnConceptOpen(false)}>Begin lesson</button>
          </section>
        </div>
      )}

      {appView === 'workspace' && showWorkspaceTour && <WorkspaceTour sandbox={gameMode === 'sandbox'} initialStep={workspaceTourStep} onStepChange={setWorkspaceTourStep} onClose={dismissWorkspaceTour} onDone={dismissWorkspaceTour} />}

      {showFrameRules && (
        <div className="dialog-backdrop" role="presentation" onMouseDown={() => setShowFrameRules(false)}>
          <section className="help-dialog frame-rules-dialog" role="dialog" aria-modal="true" aria-labelledby="frame-rules-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="dialog-heading">
              <div><p className="dialog-context">Accessibility relation</p><h2 id="frame-rules-title">Frame constraints</h2></div>
              <button type="button" className="dialog-close" onClick={() => setShowFrameRules(false)} aria-label="Close frame rules">×</button>
            </div>
            <p className="dialog-intro">Constraints are input conditions, separate from the active objective. <strong>Validate</strong> requires a property without changing the relation. <strong>Enforce</strong> computes the least closure and displays generated relations as dashed arrows.</p>
            {frameRuleConflicts.length > 0 && <div className="frame-rule-conflicts" role="status"><strong>Conflicting finite-frame requirements</strong>{frameRuleConflicts.map((conflict) => <p key={conflict.id}>{conflict.properties.join(' + ')}: {conflict.message}</p>)}</div>}
            <div className="frame-rule-grid">
              {([
                ['reflexive', 'Reflexive', 'wRw for every world', true],
                ['symmetric', 'Symmetric', 'wRv implies vRw', true],
                ['transitive', 'Transitive', 'wRv and vRu imply wRu', true],
                ['euclidean', 'Euclidean', 'wRv and wRu imply vRu', true],
                ['serial', 'Serial', 'Every world has a successor', false],
                ['irreflexive', 'Irreflexive', 'No world accesses itself', false],
                ['acyclic', 'Acyclic', 'The relation has no directed cycle', false],
              ] as const).map(([property, name, description, canEnforce]) => {
                const status = frameRuleResults.find((result) => result.property === property)
                return (
                  <div className="frame-rule-card" key={property}>
                    <div><strong>{name}</strong><span>{description}</span></div>
                    <select
                      disabled={!canEditConstraints}
                      aria-label={`${name} rule mode`}
                      value={frameRules[property]}
                      onChange={(event) => {
                        saveHistoryPoint()
                        setFrameRules((current) => ({ ...current, [property]: event.target.value as FrameRuleMode }))
                        setResult(null)
                      }}
                    >
                      <option value="off">Off</option>
                      <option value="validate">Validate</option>
                      {canEnforce && <option value="enforce">Enforce</option>}
                    </select>
                    {status && <div className={`rule-status ${status.holds ? 'pass' : 'fail'}`}><span>{status.holds ? 'Pass' : `Fail · ${status.violations.length} violation${status.violations.length === 1 ? '' : 's'}`}</span>{!status.holds && <details><summary>Inspect violations</summary><ol>{status.witnesses.map((witness, index) => <li key={`${witness.kind}:${index}`}><span>{describeFrameWitness(witness)}</span><button type="button" className="text-button" onClick={() => { clearGraphSelection(); setActiveFrameWitness(witness); setShowFrameRules(false) }}>Show on map</button></li>)}</ol></details>}</div>}
                  </div>
                )
              })}
            </div>
          </section>
        </div>
      )}

      {showDataManager && <DataManagerDialog backupSource={backupImportSource} modelSource={importSource} message={dataMessage} onBackupSourceChange={(value) => { setBackupImportSource(value); setDataMessage('') }} onModelSourceChange={(value) => { setImportSource(value); setDataMessage('') }} onDownloadBackup={() => downloadJson(serializedProgressBackup(), 'logic-model-builder-progress-backup.json')} onImportBackup={importProgress} onDownloadModel={downloadModel} onImportModel={importModel} onResetProgress={resetSavedProgress} onResetSandbox={resetSavedSandbox} onClose={() => setShowDataManager(false)} />}

      {showHelp && <WorkspaceQuickHelp onClose={() => setShowHelp(false)} onOpenHelp={() => { setShowHelp(false); setAppView('help') }} onReplayTour={() => { setShowHelp(false); openWorkspaceTour() }} />}
      </main>
    </div>
  )
}

export function App(props: { readonly initialView?: AppView } = {}) {
  return <MobileUnsupportedGuard><AppContent {...props} /></MobileUnsupportedGuard>
}
