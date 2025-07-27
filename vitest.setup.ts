import '@testing-library/jest-dom/vitest'
import React from 'react'
import { vi } from 'vitest'

// Make React available globally for components compiled with the classic runtime
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
globalThis.React = React

// Mock Supabase client to avoid network requests during tests
vi.mock('@/lib/supabase', () => {
  return {
    supabase: {
      from() {
        return {
          select() {
            return {
              eq() {
                return {
                  order() {
                    return {
                      limit: () => Promise.resolve({ data: [], error: null }),
                    }
                  },
                }
              },
              order() {
                return {
                  limit: () => Promise.resolve({ data: [], error: null }),
                }
              },
            }
          },
          insert: () => Promise.resolve({ data: null, error: null }),
          delete() {
            return {
              eq: () => Promise.resolve({ error: null }),
              neq: () => Promise.resolve({ error: null }),
            }
          },
        }
      },
    },
  }
})

// Stub audio methods not implemented in jsdom
Object.defineProperty(HTMLMediaElement.prototype, 'play', {
  configurable: true,
  value: () => Promise.resolve(),
})
Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
  configurable: true,
  value: () => {},
})
