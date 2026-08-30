// @vitest-environment jsdom

import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { HomeView } from './HomeView'

afterEach(cleanup)

describe('HomeView', () => {
  it('shows data-driven progress and makes each primary destination a single action', async () => {
    const onLearn = vi.fn()
    const onCampaigns = vi.fn()
    const onLab = vi.fn()
    const user = userEvent.setup()

    render(<HomeView completed={4} total={53} nextTitle="Necessity" onLearn={onLearn} onCampaigns={onCampaigns} onLab={onLab} />)

    expect(screen.getByText('4/53 complete')).toBeVisible()
    expect(screen.getByText('Next: Necessity')).toBeVisible()

    const mainActivities = screen.getByRole('navigation', { name: 'Main activities' })
    expect(within(mainActivities).getAllByRole('button')).toHaveLength(3)

    await user.click(screen.getByRole('button', { name: 'Start or continue Learn Modal Logic' }))
    expect(onLearn).toHaveBeenCalledOnce()

    await user.click(screen.getByRole('button', { name: 'Campaigns: longer challenges and focused practice' }))
    expect(onCampaigns).toHaveBeenCalledOnce()

    await user.click(screen.getByRole('button', { name: 'Lab: experiment with models and formulas' }))
    expect(onLab).toHaveBeenCalledOnce()

    expect(screen.queryByRole('button', { name: /profile|settings|data/i })).not.toBeInTheDocument()
  })

  it('renders the active session as one compact resume action', async () => {
    const onResume = vi.fn()
    render(<HomeView completed={0} total={10} currentSession={{ kind: 'lesson', title: 'Necessity', context: 'Learn' }} onResume={onResume} onLearn={vi.fn()} onCampaigns={vi.fn()} onLab={vi.fn()} />)

    expect(screen.getByText('Continue')).toBeVisible()
    expect(screen.getByText('Necessity')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Resume lesson: Necessity' }))
    expect(onResume).toHaveBeenCalledOnce()
  })
})
