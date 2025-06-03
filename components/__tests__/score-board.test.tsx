import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import ScoreBoard, { RecordEntry } from '../score-board'

describe('ScoreBoard icons', () => {
  const records: RecordEntry[] = Array.from({ length: 4 }, (_, i) => ({
    date: '01/01/2025',
    time: '00:10',
    score: i * 10,
  }))

  it('shows crown for first and star for second and third', () => {
    render(<ScoreBoard records={records} onClose={() => {}} onReset={() => {}} />)
    const rows = screen.getAllByText(/°/)
    expect(rows[0]).toHaveTextContent('1°')
    expect(rows[0].textContent).toContain('👑')
    expect(rows[1].textContent).toContain('⭐')
    expect(rows[2].textContent).toContain('⭐')
    expect(rows[3].textContent).not.toContain('⭐')
    expect(rows[3].textContent).not.toContain('👑')
  })

  it('applies padding to cells', () => {
    render(<ScoreBoard records={records} onClose={() => {}} onReset={() => {}} />)
    const row = screen.getAllByTestId('score-row')[0]
    const className = row.className
    expect(className).toContain('px-2')
    expect(className).toContain('py-1')
  })
})
