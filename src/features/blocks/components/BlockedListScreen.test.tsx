import { screen, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { env } from '@/config/env'
import { renderWithQuery } from '@/testing/render'
import { server } from '@/testing/server'

import type { Blocked } from '../api/blocks'
import { BlockedListScreen } from './BlockedListScreen'

const url = `${env.VITE_API_URL}/v1/blocks`

function withBlocks(list: Blocked[]) {
  server.use(http.get(url, () => HttpResponse.json(list)))
}

describe('BlockedListScreen', () => {
  it('lists blocked people by nickname with the day they were blocked', async () => {
    withBlocks([
      { id: 'b1', nickname: 'Loud thunder', blocked_at: '2026-11-20T10:00:00Z' },
      { id: 'b2', nickname: 'Late bloomer', blocked_at: '2026-10-02T18:30:00Z' },
    ])
    renderWithQuery(<BlockedListScreen />)

    const list = await screen.findByRole('list', { name: 'Blocked people' })
    const rows = within(list).getAllByRole('listitem')
    expect(rows).toHaveLength(2)
    expect(rows[0]).toHaveTextContent('Loud thunder')
    expect(rows[0]).toHaveTextContent('20 Nov 2026')
    expect(rows[1]).toHaveTextContent('Late bloomer')
    // List only: nothing to unblock with.
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('says so when nobody is blocked', async () => {
    withBlocks([])
    renderWithQuery(<BlockedListScreen />)

    expect(await screen.findByText(/No one blocked\./)).toBeInTheDocument()
  })

  it('offers a retry when the list fails to load', async () => {
    server.use(http.get(url, () => HttpResponse.json({ code: 'oops', detail: 'boom' }, { status: 500 })))
    renderWithQuery(<BlockedListScreen />)

    expect(await screen.findByRole('alert')).toHaveTextContent("That one's on us")
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
  })
})
