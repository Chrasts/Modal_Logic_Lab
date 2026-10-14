import type { ReactNode, RefObject } from 'react'
import type { GameLevel } from '../campaign'
import { PredictionInput } from '../components/PredictionInput'
import { VerificationSummary } from '../components/VerificationSummary'
import type { FramePropertyName, ObjectiveScope } from '../logic'
import type { WorkspaceVerificationResult } from './evaluateWorkspaceVerification'

interface ScopeComparisonEntry {
  readonly scope: 'pointed' | 'model' | 'frame'
  readonly holds: boolean
  readonly reason: string
}

interface WorkspaceVerificationPanelProps {
  readonly guided: boolean
  readonly constructionObjective: boolean
  readonly questionTask: boolean
  readonly formulaSource: string
  readonly comparisonFormulaSource: string
  readonly evaluationScope: ObjectiveScope
  readonly evaluationWorld: string
  readonly worldIds: readonly string[]
  readonly canEditEvaluation: boolean
  readonly showEvaluationControl: boolean
  readonly frameValuationEstimate: { readonly valuations: number; readonly atoms: number } | null
  readonly frameValuationLimitExceeded: boolean
  readonly valuationLimit: number
  readonly scopeComparison: readonly ScopeComparisonEntry[] | null
  readonly prediction?: GameLevel['prediction']
  readonly predictionScope?: GameLevel['scope']
  readonly predictionAnswer: string
  readonly propertyChoices: readonly FramePropertyName[]
  readonly result: WorkspaceVerificationResult
  readonly resultRef: RefObject<HTMLDivElement | null>
  readonly recoveryActions?: ReactNode
  readonly details: ReactNode
  readonly onEvaluationWorldChange: (worldId: string) => void
  readonly onPredictionAnswer: (answer: string) => void
  readonly onVerify: () => void
}

/** Goal, prediction and result surface for verifying a finite Kripke model. */
export function WorkspaceVerificationPanel({
  guided, constructionObjective, questionTask, formulaSource, comparisonFormulaSource, evaluationScope,
  evaluationWorld, worldIds, canEditEvaluation, showEvaluationControl, frameValuationEstimate,
  frameValuationLimitExceeded, valuationLimit, scopeComparison, prediction, predictionScope,
  predictionAnswer, propertyChoices, result, resultRef, recoveryActions, details,
  onEvaluationWorldChange, onPredictionAnswer, onVerify,
}: WorkspaceVerificationPanelProps) {
  const scopeTitle = evaluationScope === 'pointed' ? 'Pointed model'
    : evaluationScope === 'model' ? 'Model-global truth'
      : evaluationScope === 'frame' ? 'Frame validity'
        : 'Formula–relation correspondence'
  const scopeDescription = evaluationScope === 'pointed' ? 'One world · current valuation'
    : evaluationScope === 'model' ? 'Every world · current valuation'
      : evaluationScope === 'frame' ? 'Every world · every valuation'
        : 'Frame validity ↔ relational property'

  return <div className="panel verify-panel" data-tour-target="formula-controls">
    <div className="panel-heading"><div><h2>Verification</h2></div></div>
    {guided && comparisonFormulaSource.trim() && <div className="formula-comparison-chips" aria-label="Formula comparison"><span><small>Formula A</small><code>{formulaSource}</code></span><span><small>Formula B</small><code>{comparisonFormulaSource}</code></span></div>}
    {!constructionObjective && <div className="objective-summary"><span>Active target</span><strong>{scopeTitle}</strong><small>{scopeDescription}</small></div>}
    {!constructionObjective && frameValuationEstimate && <div className={`valuation-cost ${frameValuationLimitExceeded ? 'limit' : ''}`} role="status"><span>Frame search</span><strong>{frameValuationEstimate.valuations.toLocaleString('en-US')} valuations</strong><small>{worldIds.length} worlds × {frameValuationEstimate.atoms} atoms · limit {valuationLimit.toLocaleString('en-US')}</small>{frameValuationLimitExceeded && <em>Reduce the number of worlds or distinct atoms before verification.</em>}</div>}
    {!constructionObjective && evaluationScope === 'frame' && <p className="frame-valuation-note"><strong>Frame validity checks every world under every valuation.</strong> Atoms shown on the graph are one example, not the only valuation used.</p>}
    {scopeComparison && <div className="scope-comparison" aria-label="Scope comparison results"><span>Side-by-side semantics</span>{scopeComparison.map(({ scope, holds, reason }) => <div key={scope}><strong>{scope === 'pointed' ? 'Pointed truth' : scope === 'model' ? 'Model-global truth' : 'Frame validity'}</strong><b className={holds ? 'true' : 'false'}>{holds ? 'PASS' : 'FAIL'}</b><small>{reason}</small></div>)}</div>}
    {showEvaluationControl && (constructionObjective || evaluationScope === 'pointed') && <label className="field"><span>Evaluation world</span><select disabled={(!constructionObjective && evaluationScope !== 'pointed') || !canEditEvaluation} value={evaluationWorld} onChange={(event) => onEvaluationWorldChange(event.target.value)}><option value="">Select a world</option>{worldIds.map((id) => <option key={id}>{id}</option>)}</select></label>}
    {evaluationScope === 'pointed' && !worldIds.includes(evaluationWorld) && <div className="empty-card"><strong>Choose an evaluation world</strong><span>Pointed truth needs one existing world. Select it above or from the synchronized model table.</span></div>}
    {prediction && !questionTask && <div className="prediction-panel"><span>{prediction.kind === 'world-choice' ? 'Choose before verification' : 'Predict before verification'}</span><strong>{prediction.prompt}</strong><PredictionInput prediction={prediction} answer={predictionAnswer} onAnswer={onPredictionAnswer} scope={predictionScope} availableWorldIds={worldIds} propertyChoices={propertyChoices} /></div>}
    {!guided && <button type="button" className="verify-button" onClick={onVerify} disabled={!constructionObjective && frameValuationLimitExceeded}>Verify objective</button>}
    {!questionTask && <VerificationSummary ref={resultRef} state={result?.kind ?? 'idle'} summary={result?.kind === 'error' ? result.message : result ? result.diagnostic ?? result.detail : undefined} actions={recoveryActions}>{details}</VerificationSummary>}
  </div>
}
