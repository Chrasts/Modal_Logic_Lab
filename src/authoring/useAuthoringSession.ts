import { useState } from 'react'

/**
 * Ephemeral authoring-session state. Types remain supplied by the caller so
 * this controller does not import workspace implementation details.
 */
export function useAuthoringSession<StartSnapshot, ReferenceSolution, ImportedFile, AuditFinding, WorkspaceSession>() {
  const [levelStartSnapshot, setLevelStartSnapshot] = useState<StartSnapshot | null>(null)
  const [levelReferenceSolution, setLevelReferenceSolution] = useState<ReferenceSolution | null>(null)
  const [importedAuthorFile, setImportedAuthorFile] = useState<ImportedFile | null>(null)
  const [missionAuditFindings, setMissionAuditFindings] = useState<readonly AuditFinding[]>([])
  const [authorWorkspaceSession, setAuthorWorkspaceSession] = useState<WorkspaceSession | null>(null)
  const [authorPlaytest, setAuthorPlaytest] = useState(false)

  return {
    levelStartSnapshot, setLevelStartSnapshot,
    levelReferenceSolution, setLevelReferenceSolution,
    importedAuthorFile, setImportedAuthorFile,
    missionAuditFindings, setMissionAuditFindings,
    authorWorkspaceSession, setAuthorWorkspaceSession,
    authorPlaytest, setAuthorPlaytest,
  }
}
