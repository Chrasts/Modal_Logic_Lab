// @vitest-environment jsdom

import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { HomeView } from './HomeView'

afterEach(cleanup)

describe('HomeView', () => {
  it('keeps progress available on the Learn destination and makes each primary destination a single action', async () => {
    const onLearn = vi.fn()
    const onCampaigns = vi.fn()
    const onLab = vi.fn()
    const user = userEvent.setup()

    render(<HomeView completed={4} total={53} nextTitle="Necessity" onLearn={onLearn} onCampaigns={onCampaigns} onLab={onLab} />)

    expect(screen.getByText('4/53 complete')).toBeInTheDocument()
    expect(screen.getByText('Next: Necessity')).toBeInTheDocument()
    expect(screen.getByText('Missions for countermodels and frame construction.')).toBeVisible()
    expect(screen.getByText('Your own model, formula, relations, and evaluation trace.')).toBeVisible()

    const mainActivities = screen.getByRole('navigation', { name: 'Main activities' })
    expect(within(mainActivities).getAllByRole('button')).toHaveLength(3)

    await user.click(screen.getByRole('button', { name: 'Start or continue Learn Modal Logic' }))
    expect(onLearn).toHaveBeenCalledOnce()

    await user.click(screen.getByRole('button', { name: 'Campaigns: missions and practice' }))
    expect(onCampaigns).toHaveBeenCalledOnce()

    await user.click(screen.getByRole('button', { name: 'Lab: experiment with models and formulas' }))
    expect(onLab).toHaveBeenCalledOnce()

    expect(screen.queryByRole('button', { name: /profile|settings|data/i })).not.toBeInTheDocument()
  })

  it('uses precise Czech semantic terminology and localized navigation labels', async () => {
    render(<HomeView language="cs" completed={4} total={53} nextTitle="Necessity" onLearn={vi.fn()} onCampaigns={vi.fn()} onLab={vi.fn()} />)

    expect(screen.getByText(/zkoumejte pravdivost modálních formulí ve vybraném světě/)).toBeVisible()
    expect(screen.getByText('Splněno 4 z 53')).toBeVisible()
    expect(screen.getByText(/Tematické úlohy s kontramodely/)).toBeVisible()
    expect(screen.getByRole('navigation', { name: 'Hlavní části aplikace' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Začít nebo pokračovat ve výuce modální logiky' })).toBeVisible()
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
