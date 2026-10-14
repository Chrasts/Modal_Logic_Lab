import { useEffect, useState } from 'react'

export type EditorMode = 'edit' | 'evaluate'
export type ModelView = 'graph' | 'table'
export type MobileWorkspaceTab = 'model' | 'formula' | 'result'

/**
 * Interaction and display state for the Kripke workspace. Semantic model data
 * stays with its evaluator/controller; this hook owns only how it is exposed.
 */
export function useWorkspacePresentation(formulaSource: string) {
  const [showEvaluationExplorer, setShowEvaluationExplorer] = useState(false)
  const [selectedFormulaPath, setSelectedFormulaPath] = useState('root')
  const [showFrameRules, setShowFrameRules] = useState(false)
  const [selectedCorrespondence, setSelectedCorrespondence] = useState('')
  const [editorMode, setEditorMode] = useState<EditorMode>('edit')
  const [modelView, setModelView] = useState<ModelView>('graph')
  const [mobileWorkspaceTab, setMobileWorkspaceTab] = useState<MobileWorkspaceTab>('model')

  useEffect(() => { setSelectedFormulaPath('root') }, [formulaSource])

  return {
    showEvaluationExplorer, setShowEvaluationExplorer,
    selectedFormulaPath, setSelectedFormulaPath,
    showFrameRules, setShowFrameRules,
    selectedCorrespondence, setSelectedCorrespondence,
    editorMode, setEditorMode,
    modelView, setModelView,
    mobileWorkspaceTab, setMobileWorkspaceTab,
  }
}
