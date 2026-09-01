// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mobileVerificationRequestedEvent } from '../workspace/mobile-workspace-events'
import { VerificationSummary } from './VerificationSummary'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('VerificationSummary', () => {
  it('announces an unmistakable concise success with semantic evidence collapsed', () => {
    render(<VerificationSummary state="success" summary="The requested model satisfies the objective."><p>Truth by world</p></VerificationSummary>)
    expect(screen.getByRole('status')).toHaveTextContent('✓Objective met')
    const details = screen.getByText('Semantic details').closest('details')!
    expect(details.open).toBe(false)
    expect(screen.getByText('Truth by world')).not.toBeVisible()
    fireEvent.click(screen.getByText('Semantic details'))
    expect(details.open).toBe(true)
    expect(screen.getByText('Truth by world')).toBeVisible()
  })

  it('distinguishes an ordinary failure from a technical error without relying on color', () => {
    const first = render(<VerificationSummary state="failure" summary="Add an accessible p-world." />)
    expect(screen.getByRole('status')).toHaveTextContent('!Not yet')
    first.unmount()
    render(<VerificationSummary state="error" summary="The formula is incomplete." />)
    expect(screen.getByRole('alert')).toHaveTextContent('×Verification error')
  })

  it('keeps the idle state out of the live region', () => {
    render(<VerificationSummary state="idle" />)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.getByText('The verification result will appear here.')).toBeVisible()
  })

  it('requests the Result sheet when a verification result appears on a phone', () => {
    vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: true,
      media: '(max-width: 760px)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(() => false),
    })
    const requested = vi.fn()
    window.addEventListener(mobileVerificationRequestedEvent, requested)
    render(<VerificationSummary state="failure" summary="Try again." />)
    expect(requested).toHaveBeenCalledOnce()
    window.removeEventListener(mobileVerificationRequestedEvent, requested)
  })
})
