import type { Dispatch, SetStateAction } from 'react'
import type { GameLevel } from '../campaign'
import type { ParsedCustomLevelFile, ReferenceSolution } from '../level-format'
import type { FramePropertyName } from '../logic'
import type { MissionAuditFinding } from '../mission-audit'
import { AuthorValidationSummary } from './AuthorValidationSummary'
import type { AuthorStartSnapshot } from './authoring-types'

type AuthorBounds = {
  readonly minimumWorlds: string
  readonly maximumWorlds: string
  readonly minimumEdges: string
  readonly maximumEdges: string
  readonly maximumChanges: string
}

interface AuthoringStepContentProps {
  readonly step: number
  readonly title: string
  readonly instruction: string
  readonly learningObjective: string
  readonly concept: string
  readonly prerequisites: string
  readonly difficulty: NonNullable<GameLevel['estimatedDifficulty']>
  readonly editable: ReadonlySet<string>
  readonly bounds: AuthorBounds
  readonly requiredProperties: ReadonlySet<FramePropertyName>
  readonly forbiddenProperties: ReadonlySet<FramePropertyName>
  readonly requiredEdges: string
  readonly forbiddenEdges: string
  readonly requiredAtoms: string
  readonly forbiddenAtoms: string
  readonly bonusMaximumEdges: string
  readonly predictionKind: 'none' | 'truth' | 'counterexample-world' | 'frame-property'
  readonly predictionProperty: FramePropertyName
  readonly propertyNames: readonly FramePropertyName[]
  readonly preview: 'desktop' | 'mobile'
  readonly startSnapshot: AuthorStartSnapshot | null
  readonly referenceSolution: ReferenceSolution | null
  readonly auditFindings: readonly MissionAuditFinding[]
  readonly canExport: boolean
  readonly campaignTitle: string
  readonly campaignDescription: string
  readonly campaignMissions: readonly ParsedCustomLevelFile[]
  readonly shareLink: string
  readonly setTitle: Dispatch<SetStateAction<string>>
  readonly setInstruction: Dispatch<SetStateAction<string>>
  readonly setLearningObjective: Dispatch<SetStateAction<string>>
  readonly setConcept: Dispatch<SetStateAction<string>>
  readonly setPrerequisites: Dispatch<SetStateAction<string>>
  readonly setDifficulty: Dispatch<SetStateAction<NonNullable<GameLevel['estimatedDifficulty']>>>
  readonly setEditable: Dispatch<SetStateAction<ReadonlySet<string>>>
  readonly setBounds: Dispatch<SetStateAction<AuthorBounds>>
  readonly setRequiredProperties: Dispatch<SetStateAction<ReadonlySet<FramePropertyName>>>
  readonly setForbiddenProperties: Dispatch<SetStateAction<ReadonlySet<FramePropertyName>>>
  readonly setRequiredEdges: Dispatch<SetStateAction<string>>
  readonly setForbiddenEdges: Dispatch<SetStateAction<string>>
  readonly setRequiredAtoms: Dispatch<SetStateAction<string>>
  readonly setForbiddenAtoms: Dispatch<SetStateAction<string>>
  readonly setBonusMaximumEdges: Dispatch<SetStateAction<string>>
  readonly setPredictionKind: Dispatch<SetStateAction<'none' | 'truth' | 'counterexample-world' | 'frame-property'>>
  readonly setPredictionProperty: Dispatch<SetStateAction<FramePropertyName>>
  readonly setPreview: Dispatch<SetStateAction<'desktop' | 'mobile'>>
  readonly setStartSnapshot: Dispatch<SetStateAction<AuthorStartSnapshot | null>>
  readonly setCampaignTitle: Dispatch<SetStateAction<string>>
  readonly setCampaignDescription: Dispatch<SetStateAction<string>>
  readonly setCampaignMissions: Dispatch<SetStateAction<readonly ParsedCustomLevelFile[]>>
  readonly clearImportedMission: () => void
  readonly onOpenStartingModel: () => void
  readonly onOpenReferenceSolution: () => void
  readonly onPlaytest: () => void
  readonly onRunAudit: () => void
  readonly onAuditStep: (step: number) => void
  readonly onDownloadMission: () => void
  readonly onGenerateMissionLink: () => void
  readonly onAddMissionToCampaign: () => void
  readonly onDownloadCampaign: () => void
  readonly onGenerateCampaignLink: () => void
  readonly onCopyShareLink: () => void
}

/** Form and publishing content for one Create step; workflow state remains in its controller. */
export function AuthoringStepContent(props: AuthoringStepContentProps) {
  const updateStart = (update: (start: AuthorStartSnapshot) => AuthorStartSnapshot) => {
    props.clearImportedMission()
    props.setStartSnapshot((start) => start ? update(start) : start)
  }
  const toggle = <Value extends string>(set: Dispatch<SetStateAction<ReadonlySet<Value>>>, value: Value) => set((current) => {
    const next = new Set(current)
    if (next.has(value)) next.delete(value)
    else next.add(value)
    return next
  })

  if (props.step === 1) return <div className="author-step-fields">
    <label><span>Mission title</span><input aria-label="Custom mission title" value={props.title} onChange={(event) => props.setTitle(event.target.value)} /></label>
    <label><span>Instruction</span><input aria-label="Custom mission instruction" value={props.instruction} onChange={(event) => props.setInstruction(event.target.value)} /></label>
    <label><span>Learning objective</span><input aria-label="Custom mission learning objective" value={props.learningObjective} onChange={(event) => props.setLearningObjective(event.target.value)} /></label>
    <label><span>Concept tags</span><input aria-label="Custom mission concept tags" value={props.concept} onChange={(event) => props.setConcept(event.target.value)} placeholder="necessity, countermodel" /></label>
    <div className="author-pairs"><label><span>Prerequisites</span><input aria-label="Custom mission prerequisites" value={props.prerequisites} onChange={(event) => props.setPrerequisites(event.target.value)} placeholder="possibility, propositional connectives" /></label><label><span>Estimated difficulty</span><select aria-label="Custom mission difficulty" value={props.difficulty} onChange={(event) => props.setDifficulty(event.target.value as NonNullable<GameLevel['estimatedDifficulty']>)}><option value="introductory">Introductory</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></label></div>
  </div>

  if (props.step === 2) return <div className="author-snapshots"><p>Edit the learner's starting state in the same workspace used by the game.</p><button type="button" className="primary-action" onClick={props.onOpenStartingModel}>Edit starting model</button><span className={props.startSnapshot ? 'pass' : ''}>{props.startSnapshot ? `Start saved: ${props.startSnapshot.worlds.length} world(s), ${props.startSnapshot.edges.length} relation(s)` : 'No saved starting model'}</span></div>

  if (props.step === 3) return <div className="author-step-fields">
    <label><span>Formula</span><input aria-label="Authored mission formula" value={props.startSnapshot?.formulaSource ?? ''} onChange={(event) => updateStart((start) => ({ ...start, formulaSource: event.target.value }))} /></label>
    <label><span>Comparison formula (optional)</span><input aria-label="Authored comparison formula" value={props.startSnapshot?.comparisonFormulaSource ?? ''} onChange={(event) => updateStart((start) => ({ ...start, comparisonFormulaSource: event.target.value }))} /></label>
    <div className="author-pairs"><label><span>Scope</span><select aria-label="Authored mission scope" value={props.startSnapshot?.evaluationScope ?? 'pointed'} onChange={(event) => updateStart((start) => ({ ...start, evaluationScope: event.target.value as AuthorStartSnapshot['evaluationScope'] }))}><option value="pointed">At one world</option><option value="model">Throughout this model</option><option value="frame">On this finite frame</option></select></label><label><span>Target</span><select aria-label="Authored mission target truth" value={(props.startSnapshot?.targetTruth ?? true) ? 'true' : 'false'} onChange={(event) => updateStart((start) => ({ ...start, targetTruth: event.target.value === 'true' }))}><option value="true">True</option><option value="false">False</option></select></label></div>
    <label><span>Evaluation world</span><select aria-label="Authored mission evaluation world" value={props.startSnapshot?.evaluationWorld ?? ''} onChange={(event) => updateStart((start) => ({ ...start, evaluationWorld: event.target.value }))}>{(props.startSnapshot?.worlds ?? []).map((world) => <option key={world.id} value={world.id}>{world.id}</option>)}</select></label>
  </div>

  if (props.step === 4) return <fieldset><legend>Player may edit</legend>{(['worlds', 'valuations', 'edges', 'constraints', 'evaluation'] as readonly string[]).map((permission) => <label key={permission}><input type="checkbox" checked={props.editable.has(permission)} onChange={() => toggle(props.setEditable, permission)} /> {permission}</label>)}</fieldset>

  if (props.step === 5) return <div className="author-step-fields">
    <div className="author-bounds">{([['minimumWorlds', 'Min worlds'], ['maximumWorlds', 'Max worlds'], ['minimumEdges', 'Min edges'], ['maximumEdges', 'Max edges'], ['maximumChanges', 'Max changes']] as const).map(([key, label]) => <label key={key}><span>{label}</span><input type="number" min="0" step="1" aria-label={label} value={props.bounds[key]} onChange={(event) => props.setBounds((current) => ({ ...current, [key]: event.target.value }))} /></label>)}</div>
    <div className="author-pairs"><label><span>Required edges</span><input aria-label="Required custom mission edges" placeholder="w0 -> w1, w1 -> w2" value={props.requiredEdges} onChange={(event) => props.setRequiredEdges(event.target.value)} /></label><label><span>Forbidden edges</span><input aria-label="Forbidden custom mission edges" placeholder="w1 -> w0" value={props.forbiddenEdges} onChange={(event) => props.setForbiddenEdges(event.target.value)} /></label><label><span>Required atoms, one world per line</span><textarea aria-label="Required custom mission atoms" placeholder={'w0: p q\nw1: r'} value={props.requiredAtoms} onChange={(event) => props.setRequiredAtoms(event.target.value)} /></label><label><span>Forbidden atoms, one world per line</span><textarea aria-label="Forbidden custom mission atoms" placeholder={'w0: r\nw1: p'} value={props.forbiddenAtoms} onChange={(event) => props.setForbiddenAtoms(event.target.value)} /></label></div>
    <fieldset><legend>Required frame properties</legend>{props.propertyNames.map((property) => <label key={property}><input type="checkbox" checked={props.requiredProperties.has(property)} onChange={() => toggle(props.setRequiredProperties, property)} /> {property}</label>)}</fieldset>
    <fieldset><legend>Forbidden frame properties</legend>{props.propertyNames.map((property) => <label key={property}><input type="checkbox" checked={props.forbiddenProperties.has(property)} onChange={() => toggle(props.setForbiddenProperties, property)} /> {property}</label>)}</fieldset>
    <label><span>Optional bonus: maximum edges</span><input type="number" min="0" step="1" aria-label="Bonus maximum edges" value={props.bonusMaximumEdges} onChange={(event) => props.setBonusMaximumEdges(event.target.value)} /></label>
  </div>

  if (props.step === 6) return <div className="author-step-fields"><label><span>Prediction interaction</span><select aria-label="Custom mission prediction" value={props.predictionKind} onChange={(event) => props.setPredictionKind(event.target.value as typeof props.predictionKind)}><option value="none">None</option><option value="truth">Predict truth value</option>{props.startSnapshot?.evaluationScope === 'model' && <option value="counterexample-world">Predict counterexample world</option>}<option value="frame-property">Identify relational property</option></select></label>{props.predictionKind === 'frame-property' && <label><span>Required property answer</span><select aria-label="Required property answer" value={props.predictionProperty} onChange={(event) => props.setPredictionProperty(event.target.value as FramePropertyName)}>{props.propertyNames.map((property) => <option key={property}>{property}</option>)}</select></label>}<p>Predictions are optional feedback.</p></div>

  if (props.step === 7) return <div className="author-snapshots"><p>Build a passing state from the saved start and verify it before storing the reference.</p><button type="button" className="primary-action" onClick={props.onOpenReferenceSolution} disabled={!props.startSnapshot}>Build reference solution</button><span className={props.referenceSolution ? 'pass' : ''}>{props.referenceSolution ? 'Solution verified' : 'No verified reference solution'}</span><button type="button" className="secondary-button" onClick={props.onPlaytest} disabled={!props.startSnapshot}>Playtest as player</button></div>

  if (props.step === 8) return <section className="mission-audit" aria-label="Mission audit"><div><button type="button" className="primary-action" onClick={props.onRunAudit}>Run mission audit</button></div><div className="settings-choice" aria-label="Preview viewport"><button type="button" className={props.preview === 'desktop' ? 'active' : ''} aria-pressed={props.preview === 'desktop'} onClick={() => props.setPreview('desktop')}>Desktop preview</button><button type="button" className={props.preview === 'mobile' ? 'active' : ''} aria-pressed={props.preview === 'mobile'} onClick={() => props.setPreview('mobile')}>Mobile preview</button></div><AuthorValidationSummary findings={props.auditFindings} onGoToStep={props.onAuditStep} /></section>

  if (props.step === 9) return <div className="author-export-step"><p className={props.canExport ? 'pass' : 'fail'}>{props.canExport ? 'Audit passed: this draft can be exported or shared.' : 'Run validation and resolve every blocking error before export or sharing.'}</p><div className="author-final-actions"><button type="button" className="secondary-button" onClick={props.onDownloadMission} disabled={!props.canExport}>Download custom mission</button><button type="button" className="secondary-button" onClick={props.onGenerateMissionLink} disabled={!props.canExport}>Generate mission link</button></div>
    <div className="campaign-packager"><h4>Campaign package</h4><label><span>Campaign title</span><input aria-label="Custom campaign title" value={props.campaignTitle} onChange={(event) => props.setCampaignTitle(event.target.value)} /></label><label><span>Description</span><input aria-label="Custom campaign description" value={props.campaignDescription} onChange={(event) => props.setCampaignDescription(event.target.value)} /></label><button type="button" className="secondary-button" onClick={props.onAddMissionToCampaign} disabled={!props.canExport}>Add current mission to package</button>{props.campaignMissions.length > 0 && <ol>{props.campaignMissions.map(({ level }, index) => <li key={level.id}><span>{index + 1}. {level.title}</span><button type="button" aria-label={`Remove ${level.title} from package`} onClick={() => props.setCampaignMissions((current) => current.filter(({ level: candidate }) => candidate.id !== level.id))}>Remove</button></li>)}</ol>}<div><button type="button" className="primary-action" disabled={props.campaignMissions.length === 0} onClick={props.onDownloadCampaign}>Download campaign package</button><button type="button" className="secondary-button" disabled={props.campaignMissions.length === 0} onClick={props.onGenerateCampaignLink}>Generate campaign link</button></div></div>
    {props.shareLink && <div className="share-link-output"><label><span>Shareable URL</span><input aria-label="Shareable URL" readOnly value={props.shareLink} onFocus={(event) => event.currentTarget.select()} /></label><button type="button" className="secondary-button" onClick={props.onCopyShareLink}>Copy link</button><small>The mission data is encoded after # and is not sent to the hosting server.</small></div>}
  </div>

  return null
}
