import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { AuthContext } from '@/auth/useAuth'
import { HomePage } from './HomePage'

describe('HomePage', () => {
  it('renders the Reclo card with a button', () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <AuthContext.Provider
            value={{ user: null, isLoading: false, setUser: () => {}, signOut: async () => {} }}
          >
            <HomePage />
          </AuthContext.Provider>
        </MemoryRouter>
      </QueryClientProvider>,
    )

    expect(screen.getByText('Reclo')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Check API' })).toBeInTheDocument()
  })
})
