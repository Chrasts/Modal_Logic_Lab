import { useEffect, useState } from 'react'
import { learnProgressKey, loadLearnProgress, type LearnProgress } from '../learn-progress'

export function useLearnProgress() {
  const [learnProgress, setLearnProgress] = useState<LearnProgress>(loadLearnProgress)

  useEffect(() => {
    try {
      localStorage.setItem(learnProgressKey, JSON.stringify(learnProgress))
    } catch {
      // Course progress remains available for this session.
    }
  }, [learnProgress])

  return { learnProgress, setLearnProgress }
}
