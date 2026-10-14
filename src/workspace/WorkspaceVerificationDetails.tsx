import { EvaluationDiagnostics, EvaluationTree, type EvaluationTraceEntry } from './EvaluationTrace'
import type { EvaluationTrace } from '../logic'
import type { WorkspaceVerificationResult } from './evaluateWorkspaceVerification'

interface WorkspaceVerificationDetailsProps {
  readonly result: WorkspaceVerificationResult
  readonly semanticFeedbackLevel: number
  readonly evaluationTraceSteps: readonly EvaluationTraceEntry[]
  readonly traceStepIndex: number
  readonly activeTrace?: EvaluationTrace
  readonly onTraceStepChange: (step: number) => void
  readonly onTraceSelect: (trace: EvaluationTrace) => void
}

/** Progressive semantic evidence shown after a workspace verification. */
export function WorkspaceVerificationDetails({
  result, semanticFeedbackLevel, evaluationTraceSteps, traceStepIndex, activeTrace,
  onTraceStepChange, onTraceSelect,
}: WorkspaceVerificationDetailsProps) {
  if (!result || !('verdict' in result) || !result.verdict) return null

  const sections = [result.verdict.formula, result.verdict.relation, result.verdict.correspondence].filter(Boolean)
  return <>
    <div className="verdict-sections">
      {semanticFeedbackLevel === 1 && <p className="feedback-disclosure"><strong>Feedback level 1 · Try again.</strong> The objective is not met. Recheck the target scope and the part of the model relevant to the formula.</p>}
      {semanticFeedbackLevel === 2 && <p className="feedback-disclosure"><strong>Feedback level 2 · Diagnostic hint.</strong> The failing semantic section is identified below. A full world-by-world trace unlocks after another unsuccessful attempt.</p>}
      {sections.map((section) => section && (
        <div className={`verdict-section ${section.holds ? 'pass' : 'fail'}`} key={section.label}>
          <div><span>{section.label}</span><b>{section.holds ? 'Pass' : 'Fail'}</b></div>
          {semanticFeedbackLevel >= 2 && <strong>{section.summary}</strong>}
          {semanticFeedbackLevel >= 3 && <small>{section.detail}</small>}
          {semanticFeedbackLevel >= 3 && section.witnessValuation && <div className="valuation-diagnostic"><span>Countervaluation</span>{Object.entries(section.witnessValuation).map(([world, atoms]) => <code key={world}>{world}: {atoms.length ? `{${atoms.join(', ')}}` : '∅'}</code>)}</div>}
          {semanticFeedbackLevel >= 3 && section.truthByWorld && <div className="truth-diagnostic"><span>{section.witnessValuation ? 'Truth under countervaluation' : 'Truth by world'}</span><div>{section.truthByWorld.map(({ worldId, value }) => <code className={value ? 'true' : 'false'} key={worldId}>{worldId} <b>{value ? 'T' : 'F'}</b></code>)}</div></div>}
          {semanticFeedbackLevel >= 3 && section.evaluationTraces && <div className="evaluation-diagnostic">
            <EvaluationDiagnostics traces={section.evaluationTraces} />
            <div className="semantic-debugger-heading"><span>Evaluation tree · semantic debugger</span><small>formula → subformula → world → rule → truth</small></div>
            {evaluationTraceSteps.length > 0 && <div className="trace-stepper"><button type="button" disabled={traceStepIndex <= 0} onClick={() => onTraceStepChange(Math.max(0, traceStepIndex - 1))}>Previous step</button><span>Step {Math.min(traceStepIndex + 1, evaluationTraceSteps.length)} of {evaluationTraceSteps.length}</span><button type="button" disabled={traceStepIndex >= evaluationTraceSteps.length - 1} onClick={() => onTraceStepChange(Math.min(evaluationTraceSteps.length - 1, traceStepIndex + 1))}>Next step</button><small>Alt + ← / →</small></div>}
            {activeTrace && <div className="active-trace-summary"><code>{activeTrace.formula}</code><span>at <b>{activeTrace.worldId}</b></span><span>rule: <b>{activeTrace.rule}</b></span><strong>{activeTrace.value ? 'TRUE' : 'FALSE'}</strong></div>}
            {section.evaluationTraces.map((trace, index) => <EvaluationTree trace={trace} root={section.evaluationTraces?.length === 1} activeTrace={activeTrace} onSelect={onTraceSelect} key={`${trace.worldId}:${index}`} />)}
          </div>}
        </div>
      ))}
    </div>
    {result.bonus && <div className={`bonus-result ${result.bonus.achieved ? 'achieved' : ''}`}><strong>{result.bonus.achieved ? 'Bonus achieved' : 'Optional bonus'}</strong><span>{result.bonus.detail}</span></div>}
    {result.prediction && <div className={`prediction-result ${result.prediction.correct ? 'correct' : 'incorrect'}`}><strong>{result.prediction.correct ? 'Prediction correct' : 'Prediction incorrect'}</strong><span>{result.prediction.detail}</span></div>}
  </>
}
