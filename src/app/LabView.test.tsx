// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LabView } from './LabView'

afterEach(cleanup)

describe('LabView', () => {
  it('describes semantic exploration rather than claiming models prove missions in Czech', () => {
    render(<LabView language="cs" onOpenModelSandbox={vi.fn()} />)
    expect(screen.getByText(/bez zadání konkrétní mise/)).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Modelová laboratoř' })).toBeVisible()
    expect(screen.queryByText('Zkoumání vlastností Kripkeho rámců')).not.toBeInTheDocument()
  })

  it('presents only the real shared Model Sandbox and delegates opening it', async () => {
    const onOpenModelSandbox = vi.fn()
    const user = userEvent.setup()
    render(<LabView onOpenModelSandbox={onOpenModelSandbox} />)
    expect(screen.getByRole('heading', { name: 'Lab' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Model Sandbox' })).toBeVisible()
    expect(screen.queryByText('Inspect evaluation traces')).not.toBeInTheDocument()
    expect(screen.queryByText(/coming soon/i)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Open Model Sandbox' }))
    expect(onOpenModelSandbox).toHaveBeenCalledOnce()
  })
})
