import { useState } from 'react'

export function useAuthoringWorkflow() {
  const [authorStep, setAuthorStep] = useState(1)
  const [visitedAuthorSteps, setVisitedAuthorSteps] = useState<ReadonlySet<number>>(new Set([1]))
  const [authorStepErrors, setAuthorStepErrors] = useState<readonly string[]>([])
  const [authorStudioOpen, setAuthorStudioOpen] = useState(false)

  const openNewMission = () => {
    setAuthorStep(1)
    setVisitedAuthorSteps(new Set([1]))
    setAuthorStepErrors([])
    setAuthorStudioOpen(true)
  }

  const openCampaignPackage = () => {
    setAuthorStep(9)
    setVisitedAuthorSteps(new Set([1, 9]))
    setAuthorStepErrors([])
    setAuthorStudioOpen(true)
  }

  return {
    authorStep, setAuthorStep, visitedAuthorSteps, setVisitedAuthorSteps, authorStepErrors, setAuthorStepErrors,
    authorStudioOpen, setAuthorStudioOpen, openNewMission, openCampaignPackage,
  }
}
