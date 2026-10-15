// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LabView } from './LabView'

afterEach(cleanup)

describe('LabView', () => {
  it('describes the six implemented Sandbox tool areas in Czech', () => {
    render(<LabView language="cs" onOpenModelSandbox={vi.fn()} />)
    expect(screen.getByText(/bez omezení konkrétní misí/)).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Modelová laboratoř' })).toBeVisible()
    expect(screen.getAllByRole('listitem')).toHaveLength(6)
    expect(screen.getByText('Vyhodnocování formulí')).toBeVisible()
    expect(screen.getByText(/na konečném rámci přes všechny valuace/)).toBeVisible()
    expect(screen.getByText('Porovnávání formulí')).toBeVisible()
    expect(screen.getByText('Analýza rámců')).toBeVisible()
    expect(screen.getByText(/sdílejte stav laboratoře odkazem/)).toBeVisible()
  })

  it('presents only the real shared Model Sandbox and delegates opening it', async () => {
    const onOpenModelSandbox = vi.fn()
    const user = userEvent.setup()
    render(<LabView onOpenModelSandbox={onOpenModelSandbox} />)
    expect(screen.getByRole('heading', { name: 'Lab' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Model Sandbox' })).toBeVisible()
    expect(screen.getAllByRole('listitem')).toHaveLength(6)
    expect(screen.getByText('Evaluation Explorer')).toBeVisible()
    expect(screen.getByText('Frame analysis')).toBeVisible()
    expect(screen.queryByText('Inspect evaluation traces')).not.toBeInTheDocument()
    expect(screen.queryByText(/coming soon/i)).not.toBeInTheDocument()
    const openButton = screen.getByRole('button', { name: 'Open Model Sandbox' })
    expect(openButton).toHaveClass('lab-open-action')
    expect(openButton.closest('.lab-heading')).not.toBeNull()
    expect(document.querySelector('.lab-instrument .lab-open-action')).toBeNull()
    expect(openButton.querySelector('.chapter-diamond-label')).toHaveTextContent('Open Sandbox')
    await user.click(openButton)
    expect(onOpenModelSandbox).toHaveBeenCalledOnce()
  })
})
