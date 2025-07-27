import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import ScoreBoard from '../score-board'

describe('ScoreBoard basic behavior', () => {
  it('shows empty state when no records', () => {
    render(<ScoreBoard onClose={() => {}} />)
    expect(
      screen.getByText(/No hay puntuaciones registradas/i),
    ).toBeInTheDocument()
  })
})
