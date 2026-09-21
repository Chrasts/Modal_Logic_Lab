import type { GameLevel } from '../campaign'

interface CreateViewProps {
  readonly templates: readonly GameLevel[]
  readonly selectedTemplateId: string
  readonly onSelectedTemplateChange: (id: string) => void
  readonly onOpenStudio: () => void
  readonly onOpenCampaign: () => void
  readonly onDuplicateTemplate: () => void
  readonly importSource: string
  readonly onImportSourceChange: (value: string) => void
  readonly onImportContent: () => void
}

export function CreateView({ templates, selectedTemplateId, onSelectedTemplateChange, onOpenStudio, onOpenCampaign, onDuplicateTemplate, importSource, onImportSourceChange, onImportContent }: CreateViewProps) {
  return <section className="content-screen create-screen editorial-screen" aria-labelledby="create-screen-title">
    <header className="editorial-heading create-index-heading">
      <div><p className="eyebrow">Mission authoring · validation · sharing</p><h1 id="create-screen-title">Create</h1><p>Author a custom mission or package missions into a shareable custom campaign. Your content remains separate from Learn, General Challenges, and Practice Library.</p></div>
    </header>

    <div className="create-workflows" aria-label="Authoring workflows">
      <section className="create-workflow create-workflow--primary">
        <div><p className="eyebrow">Custom mission</p><h2>Build a constrained objective</h2><p>Capture a starting model, configure its objective and constraints, then verify a reference solution.</p></div>
        <button type="button" className="row-action" onClick={onOpenStudio}>New custom mission <span aria-hidden="true">→</span></button>
      </section>

      <section className="create-workflow">
        <div><p className="eyebrow">Duplicate a built-in mission</p><h2>Start from an existing structure</h2><p>Copy content into the studio without changing the built-in original. The copy must receive its own reference solution.</p></div>
        <div className="workflow-controls"><select aria-label="Built-in mission template" value={selectedTemplateId} onChange={(event) => onSelectedTemplateChange(event.target.value)}>{templates.map((level) => <option value={level.id} key={level.id}>{level.chapter} · {level.title}</option>)}</select><button type="button" className="row-action" onClick={onDuplicateTemplate}>Duplicate into studio <span aria-hidden="true">→</span></button></div>
      </section>

      <section className="create-workflow">
        <div><p className="eyebrow">Custom campaign</p><h2>Package missions</h2><p>Combine authored missions, download a JSON package, or create a browser-shareable link.</p></div>
        <button type="button" className="row-action" onClick={onOpenCampaign}>Manage custom campaigns <span aria-hidden="true">→</span></button>
      </section>
    </div>

    <section className="create-import-card create-import-section">
      <div><p className="eyebrow">External content</p><h2>Import custom content</h2><p>Paste a custom mission or campaign package. A mission opens in the authoring studio and a campaign opens its package.</p></div>
      <label><span>Custom content JSON</span><textarea aria-label="Custom content JSON" value={importSource} onChange={(event) => onImportSourceChange(event.target.value)} spellCheck={false} /></label>
      <button type="button" className="row-action" onClick={onImportContent}>Import into Create <span aria-hidden="true">→</span></button>
    </section>
  </section>
}
