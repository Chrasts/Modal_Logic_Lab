// @vitest-environment jsdom

import { act, cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { MobileWorkspaceTabs, type MobileWorkspaceTab } from './MobileWorkspaceTabs'
import { mobileVerificationRequestedEvent } from './mobile-workspace-events'

afterEach(cleanup)

function Harness() {
  const [tab, setTab] = useState<MobileWorkspaceTab>('model')
  return <MobileWorkspaceTabs activeTab={tab} showFormula onChange={setTab} />
}

describe('MobileWorkspaceTabs', () => {
  it('switches the visible Formula and Result panels by keyboard while Model stays implicit', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    expect(screen.queryByRole('tab', { name: 'model' })).toBeNull()

    const formula = screen.getByRole('tab', { name: 'formula' })
    formula.focus()
    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('tab', { name: 'result' })).toHaveAttribute('aria-selected', 'true')
    await user.keyboard('{ArrowLeft}')
    expect(formula).toHaveAttribute('aria-selected', 'true')
    await user.click(formula)
    expect(formula).toHaveAttribute('aria-selected', 'false')
    expect(screen.getByRole('tab', { name: 'result' })).toHaveAttribute('aria-selected', 'false')
  })

  it('opens the result tab after a mobile verification request', () => {
    render(<Harness />)
    act(() => window.dispatchEvent(new Event(mobileVerificationRequestedEvent)))
    expect(screen.getByRole('tab', { name: 'result' })).toHaveAttribute('aria-selected', 'true')
  })

  it('closes an already open result sheet when Result is tapped again', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    const result = screen.getByRole('tab', { name: 'result' })
    await user.click(result)
    expect(result).toHaveAttribute('aria-selected', 'true')
    await user.click(result)
    expect(result).toHaveAttribute('aria-selected', 'false')
    expect(screen.getByRole('tab', { name: 'formula' })).toHaveAttribute('aria-selected', 'false')
    expect(screen.queryByRole('tab', { name: 'model' })).toBeNull()
  })
})
