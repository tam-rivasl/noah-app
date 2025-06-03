import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import userEvent from '@testing-library/user-event'
import NoaTamagotchi from '../noa-tamagotchi'

describe('Start button behavior', () => {
  it('only Start button initiates the game', async () => {
    render(<NoaTamagotchi />)
    // A and B should be disabled on start screen
    const buttonA = screen.getByRole('button', { name: 'A' })
    const buttonB = screen.getByRole('button', { name: 'B' })
    expect(buttonA).toBeDisabled()
    expect(buttonB).toBeDisabled()

    const start = screen.getByRole('button', { name: /start/i })
    expect(start).toBeEnabled()

    expect(screen.getByText(/Press Start/i)).toBeInTheDocument()
    await userEvent.click(start)
    // After clicking start, the "Press Start" text should disappear
    expect(screen.queryByText(/Press Start/i)).toBeNull()
  })
})
