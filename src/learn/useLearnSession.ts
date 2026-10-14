import { useState } from 'react'

/** Transient lesson and curriculum-navigation state, separate from persisted progress. */
export function useLearnSession() {
  const [learnHintLevel, setLearnHintLevel] = useState(0)
  const [learnTransferActive, setLearnTransferActive] = useState(false)
  const [learnConceptOpen, setLearnConceptOpen] = useState(false)
  const [expandedLearnChapterId, setExpandedLearnChapterId] = useState<string | null>(null)

  return {
    learnHintLevel, setLearnHintLevel,
    learnTransferActive, setLearnTransferActive,
    learnConceptOpen, setLearnConceptOpen,
    expandedLearnChapterId, setExpandedLearnChapterId,
  }
}
