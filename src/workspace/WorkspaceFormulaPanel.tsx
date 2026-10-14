import type { RefObject } from 'react'
import { EvaluationExplorer } from '../components/EvaluationExplorer'
import type { FormulaInputValidation } from '../formula-input'
import type { Formula, ObjectiveScope } from '../logic'
import type { SemanticHighlight } from '../logic/evaluation-explorer'

interface WorkspaceFormulaPanelProps {
  readonly formulaInputRef: RefObject<HTMLInputElement | null>
  readonly formulaSource: string
  readonly comparisonFormulaSource: string
  readonly formulaValidation: FormulaInputValidation
  readonly comparisonFormulaValidation: FormulaInputValidation
  readonly evaluationScope: ObjectiveScope
  readonly targetTruth: boolean
  readonly selectedCorrespondence: string
  readonly correspondencePresets: readonly { readonly id: string; readonly name: string }[]
  readonly sandbox: boolean
  readonly guided: boolean
  readonly explorerOpen: boolean
  readonly explorerFormula?: Formula
  readonly selectedFormulaPath: string
  readonly explorerHighlight?: SemanticHighlight
  readonly sandboxShareMessage: string
  readonly shareLink: string
  readonly onFormulaChange: (value: string) => void
  readonly onComparisonFormulaChange: (value: string) => void
  readonly onInsertSymbol: (symbol: string) => void
  readonly onScopeChange: (scope: ObjectiveScope) => void
  readonly onTargetTruthChange: (value: boolean) => void
  readonly onCorrespondenceChange: (id: string) => void
  readonly onShareSandbox: () => void
  readonly onExplorerToggle: () => void
  readonly onExplorerSelect: (path: string) => void
  readonly onCopyShareLink: () => void
}

/** Formula editing and semantic-goal controls for the finite-model workspace. */
export function WorkspaceFormulaPanel({
  formulaInputRef, formulaSource, comparisonFormulaSource, formulaValidation, comparisonFormulaValidation,
  evaluationScope, targetTruth, selectedCorrespondence, correspondencePresets, sandbox, guided,
  explorerOpen, explorerFormula, selectedFormulaPath, explorerHighlight, sandboxShareMessage, shareLink,
  onFormulaChange, onComparisonFormulaChange, onInsertSymbol, onScopeChange, onTargetTruthChange,
  onCorrespondenceChange, onShareSandbox, onExplorerToggle, onExplorerSelect, onCopyShareLink,
}: WorkspaceFormulaPanelProps) {
  const resetFormula = () => {
    onFormulaChange('p')
    setTimeout(() => formulaInputRef.current?.focus(), 0)
  }
  return <div className="panel formula-panel" data-tour-target="formula-controls">
    <div className="panel-heading"><div><h2>Formula and goal</h2></div>{sandbox && <button type="button" className="secondary-button share-sandbox-button" onClick={onShareSandbox}>Share Sandbox</button>}</div>
    <label className="field"><span>Modal formula</span><input ref={formulaInputRef} aria-label="Modal formula" aria-invalid={formulaValidation.kind === 'invalid'} disabled={guided} value={formulaSource} onChange={(event) => onFormulaChange(event.target.value)} spellCheck={false} />{formulaValidation.kind === 'valid' && <small className="parse-status valid">✓ Formula valid</small>}{formulaValidation.kind === 'invalid' && <small className="parse-status invalid" role="alert">{formulaValidation.message}</small>}</label>
    {!guided && !formulaSource.trim() && <div className="empty-card"><strong>No formula yet</strong><span>Enter an atom such as p, or start with □p / ◇p, then Verify.</span><button type="button" onClick={resetFormula}>Use p</button></div>}
    <label className="field comparison-formula"><span>Comparison formula <small>optional</small></span><input aria-label="Comparison formula" aria-invalid={comparisonFormulaValidation.kind === 'invalid'} disabled={guided} value={comparisonFormulaSource} placeholder="e.g. box p" onChange={(event) => onComparisonFormulaChange(event.target.value)} spellCheck={false} />{comparisonFormulaValidation.kind === 'invalid' && <small className="parse-status invalid" role="alert">{comparisonFormulaValidation.message}</small>}</label>
    <div className="symbol-row" aria-label="Insert symbol">{['¬', '∧', '∨', '→', '□', '◇'].map((symbol) => <button key={symbol} type="button" disabled={guided} className="symbol-button" aria-label={`Insert ${symbol}`} onClick={() => onInsertSymbol(symbol)}>{symbol}</button>)}</div>
    <label className="field scope-picker"><span>Semantic target</span><select disabled={guided} aria-label="Semantic target" value={evaluationScope} onChange={(event) => onScopeChange(event.target.value as ObjectiveScope)}><option value="pointed">Pointed model: selected world, current valuation</option><option value="model">Model: all worlds, current valuation</option><option value="frame">Frame: all worlds and all valuations</option><option value="correspondence" disabled={Boolean(comparisonFormulaSource.trim())}>Correspondence: formula validity vs. relation</option></select></label>
    {evaluationScope !== 'correspondence' ? <fieldset className="target-choice"><legend>Construction goal</legend><label><input type="radio" disabled={guided} checked={targetTruth} onChange={() => onTargetTruthChange(true)} /> {comparisonFormulaSource.trim() ? 'Make formulas equivalent' : evaluationScope === 'frame' ? 'Make valid on frame' : 'Make formula true'}</label><label><input type="radio" disabled={guided} checked={!targetTruth} onChange={() => onTargetTruthChange(false)} /> {comparisonFormulaSource.trim() ? 'Make formulas differ' : evaluationScope === 'frame' ? 'Find countervaluation' : 'Build a counterexample'}</label></fieldset> : <p className="objective-explainer">Compare validity under every valuation with a characteristic property of the accessibility relation.</p>}
    <label className={`field correspondence-picker ${evaluationScope === 'correspondence' ? 'active' : ''}`}><span>Correspondence lab</span><select disabled={guided} value={selectedCorrespondence} onChange={(event) => onCorrespondenceChange(event.target.value)}><option value="">Choose a modal axiom</option>{correspondencePresets.map((preset) => <option key={preset.id} value={preset.id}>{preset.name}</option>)}</select></label>
    {selectedCorrespondence && <p className="correspondence-note">Compare frame validity with the selected relational property. Finite examples provide evidence. General correspondence theorems require a proof.</p>}
    <p className="notation">Precedence: ¬ □ ◇ &gt; ∧ &gt; ∨ &gt; →. Aliases: ! or ~ or \neg, [] or \Box, &lt;&gt; or \Diamond, &amp; or \land, | or \lor, -&gt; or \to or \implies.</p>
    {sandbox && <EvaluationExplorer open={explorerOpen} formula={explorerFormula} selectedPath={selectedFormulaPath} highlight={explorerHighlight} onToggle={onExplorerToggle} onSelect={onExplorerSelect} />}
    {sandbox && sandboxShareMessage && <p className="sandbox-share-status" role="status">{sandboxShareMessage}</p>}
    {sandbox && shareLink && <div className="share-link-output sandbox-share-output"><label><span>Shareable Sandbox URL</span><input aria-label="Shareable Sandbox URL" readOnly value={shareLink} onFocus={(event) => event.currentTarget.select()} /></label><button type="button" className="secondary-button" onClick={onCopyShareLink}>Copy link</button><small>The mathematical experiment is encoded after # and is not sent to a server.</small></div>}
  </div>
}
