import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { env } from '@/config/env'
import { signInAs } from '@/testing/auth'
import { freshBoard, matchId, mockThread } from '@/testing/chats'
import { kabir } from '@/testing/drops'
import { renderRoutes } from '@/testing/render'
import { server } from '@/testing/server'

import { ChatScreen } from './ChatScreen'

const api = `${env.VITE_API_URL}/v1/chats/${matchId}`
const routes = [{ path: '/app/chats/:matchId', element: <ChatScreen /> }]

function board(overrides: Record<string, string>, photo_pieces: number[] = []) {
  return {
    cards: freshBoard.cards.map((c) => ({ ...c, state: (overrides[c.card] ?? c.state) as typeof c.state })),
    photo_pieces,
  }
}

describe('Swaps in a chat', () => {
  it('asks to swap names after a confirm that says both open at once', async () => {
    signInAs()
    mockThread()
    let asked: unknown
    server.use(
      http.post(`${api}/swaps`, async ({ request }) => {
        asked = await request.json()
        mockThread([], { swaps: board({ first_name: 'you_asked' }) })
        return HttpResponse.json(board({ first_name: 'you_asked' }))
      }),
    )
    renderRoutes(routes, `/app/chats/${matchId}`)

    await userEvent.click(await screen.findByRole('button', { name: 'Swap names' }))
    const sheet = screen.getByRole('dialog', { name: 'Swap names?' })
    expect(sheet).toHaveTextContent("You each see the other's name, at the same moment. Can't be undone.")
    await userEvent.click(within(sheet).getByRole('button', { name: 'Swap' }))

    expect(await screen.findByText('Name · waiting')).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(asked).toEqual({ card: 'first_name' })
  })

  it('"Not yet" on the confirm asks nothing', async () => {
    signInAs()
    mockThread()
    renderRoutes(routes, `/app/chats/${matchId}`)

    await userEvent.click(await screen.findByRole('button', { name: 'Swap hometowns' }))
    await userEvent.click(screen.getByRole('button', { name: 'Not yet' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Swap hometowns' })).toBeInTheDocument()
  })

  it('answers their request with Swap, and their name shows', async () => {
    signInAs()
    mockThread([], { swaps: board({ first_name: 'they_asked' }) })
    server.use(
      http.post(`${api}/swaps/first_name/accept`, () => {
        mockThread([], {
          profile: { ...kabir, first_name: 'Kabir', shown_cards: ['first_name', 'looking_for'] },
          swaps: board({ first_name: 'open' }),
        })
        return HttpResponse.json(board({ first_name: 'open' }))
      }),
    )
    renderRoutes(routes, `/app/chats/${matchId}`)

    const request = await screen.findByRole('region', { name: 'Swap request' })
    expect(request).toHaveTextContent('Sunset chaser wants to swap names.')
    await userEvent.click(within(request).getByRole('button', { name: 'Swap' }))

    const cards = screen.getByRole('list', { name: 'Their cards' })
    expect(await within(cards).findByText('Kabir')).toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'Swap request' })).not.toBeInTheDocument()
  })

  it('answers their request with Not yet', async () => {
    signInAs()
    mockThread([], { swaps: board({ branch: 'they_asked' }) })
    let declined = false
    server.use(
      http.post(`${api}/swaps/branch/decline`, () => {
        declined = true
        mockThread()
        return HttpResponse.json(freshBoard)
      }),
    )
    renderRoutes(routes, `/app/chats/${matchId}`)

    const request = await screen.findByRole('region', { name: 'Swap request' })
    await userEvent.click(within(request).getByRole('button', { name: 'Not yet' }))

    expect(await screen.findByRole('button', { name: 'Swap branches' })).toBeInTheDocument()
    expect(declined).toBe(true)
  })

  it('shows their photo with closed pieces locked', async () => {
    signInAs()
    mockThread([], { swaps: board({ first_name: 'open', photo: 'can_ask' }, [6]) })
    server.use(
      http.get(`${api}/photo`, () => new HttpResponse(new Blob(['jpeg']), { headers: { 'Content-Type': 'image/jpeg' } })),
    )
    renderRoutes(routes, `/app/chats/${matchId}`)

    await userEvent.click(await screen.findByRole('button', { name: "See Sunset chaser's photo" }))

    const viewer = screen.getByRole('dialog', { name: "Sunset chaser's photo" })
    expect(within(viewer).getByRole('img', { name: /1 of 9 pieces open/ })).toBeInTheDocument()
    expect(viewer).toHaveTextContent('Each card you swap or guess right opens one, up to 6; swapping photos opens the rest.')
  })

  it('shows their contact once swapped', async () => {
    signInAs()
    mockThread([], {
      profile: { ...kabir, contact: { kind: 'instagram', value: 'kabir.k' } },
      swaps: board({ first_name: 'open', photo: 'open', contact: 'open' }),
    })
    server.use(
      http.get(`${api}/photo`, () => new HttpResponse(new Blob(['jpeg']), { headers: { 'Content-Type': 'image/jpeg' } })),
    )
    renderRoutes(routes, `/app/chats/${matchId}`)

    expect(await screen.findByText('@kabir.k')).toBeInTheDocument()
  })
})
