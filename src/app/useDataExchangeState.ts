import { useState } from 'react'

/** Ephemeral dialog, source text, status, and link state for local data exchange. */
export function useDataExchangeState() {
  const [showHelp, setShowHelp] = useState(false)
  const [showDataManager, setShowDataManager] = useState(false)
  const [importSource, setImportSource] = useState('')
  const [backupImportSource, setBackupImportSource] = useState('')
  const [customImportSource, setCustomImportSource] = useState('')
  const [dataMessage, setDataMessage] = useState('')
  const [shareLink, setShareLink] = useState('')
  const [sandboxShareMessage, setSandboxShareMessage] = useState('')

  return {
    showHelp, setShowHelp,
    showDataManager, setShowDataManager,
    importSource, setImportSource,
    backupImportSource, setBackupImportSource,
    customImportSource, setCustomImportSource,
    dataMessage, setDataMessage,
    shareLink, setShareLink,
    sandboxShareMessage, setSandboxShareMessage,
  }
}
