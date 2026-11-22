import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { env } from '@/config/env'
import { signInAs } from '@/testing/auth'
import { chatSummary, matchId, message, mockChats, mockThread } from '@/testing/chats'
import { renderRoutes } from '@/testing/render'
import { server } from '@/testing/server'

import { ChatScreen } from './ChatScreen'
import { ChatsScreen } from './ChatsScreen'

const api = env.VITE_API_URL
const routes = [
  { path: '/app/chats', element: <ChatsScreen /> },
  { path: '/app/chats/:matchId', element: <ChatScreen /> },
]

function allowRead() {
  server.use(
    http.post(`${api}/v1/chats/${matchId}/read`, () => new HttpResponse(null, { status: 204 })),
  )
}

describe('Chats tab', () => {
  it('lists matches with the last message and marks new ones', async () => {
    signInAs()
    mockChats([chatSummary({ last_message: message('x', 'hey you', false), unread: true })])
    renderRoutes(routes, '/app/chats')

    const row = await screen.findByRole('link', { name: /Sunset chaser/ })
    expect(row).toHaveTextContent('hey you')
    expect(row).toHaveTextContent('New')
  })

  it('invites a new match to say hi', async () => {
    signInAs()
    mockChats([chatSummary()])
    renderRoutes(routes, '/app/chats')

    expect(await screen.findByRole('link', { name: /Sunset chaser/ })).toHaveTextContent(
      'New match. Say hi!',
    )
  })

  it('explains how to get a match when there are none', async () => {
    signInAs()
    mockChats([])
    renderRoutes(routes, '/app/chats')

    expect(await screen.findByText(/No matches yet/)).toBeInTheDocument()
  })
})

describe('Chat', () => {
  it('shows the conversation and only their shown cards', async () => {
    signInAs()
    allowRead()
    mockThread([message('1', 'ok wait you also like films??', false), message('2', 'obviously', true)])
    renderRoutes(routes, `/app/chats/${matchId}`)

    expect(await screen.findByRole('heading', { name: 'Sunset chaser' })).toBeInTheDocument()
    const messages = screen.getByRole('list', { name: 'Messages' })
    expect(messages).toHaveTextContent('ok wait you also like films??')
    expect(messages).toHaveTextContent('obviously')
    const cards = screen.getByRole('list', { name: 'Their cards' })
    expect(cards).not.toHaveTextContent('Lucknow')
    expect(cards).toHaveTextContent('5 hidden')
  })

  it('marks their latest message as seen', async () => {
    signInAs()
    let read = false
    server.use(
      http.post(`${api}/v1/chats/${matchId}/read`, () => {
        read = true
        return new HttpResponse(null, { status: 204 })
      }),
    )
    mockThread([message('1', 'hello', false)])
    renderRoutes(routes, `/app/chats/${matchId}`)

    await screen.findByText('hello')
    await expect.poll(() => read).toBe(true)
  })

  it('sends a message with Enter', async () => {
    signInAs()
    allowRead()
    mockThread([])
    let sent: unknown
    server.use(
      http.post(`${api}/v1/chats/${matchId}/messages`, async ({ request }) => {
        sent = await request.json()
        return HttpResponse.json(message('9', 'hi! loved your sunday prompt', true), { status: 201 })
      }),
    )
    renderRoutes(routes, `/app/chats/${matchId}`)

    expect(await screen.findByText(/Either of you can say hi first/)).toBeInTheDocument()
    await userEvent.type(screen.getByLabelText('Message'), '  hi! loved your sunday prompt {Enter}')

    expect(await screen.findByText('hi! loved your sunday prompt')).toBeInTheDocument()
    expect(sent).toEqual({ body: 'hi! loved your sunday prompt' })
    expect(screen.getByLabelText('Message')).toHaveValue('')
  })

  it('explains a message the server refuses and keeps the draft', async () => {
    signInAs()
    allowRead()
    mockThread([])
    server.use(
      http.post(`${api}/v1/chats/${matchId}/messages`, () =>
        HttpResponse.json(
          { detail: [{ loc: ['body', 'body'], msg: 'Value error, x', type: 'value_error' }] },
          { status: 422 },
        ),
      ),
    )
    renderRoutes(routes, `/app/chats/${matchId}`)

    await userEvent.type(await screen.findByLabelText('Message'), 'insta me')
    await userEvent.click(screen.getByRole('button', { name: 'Send' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('No numbers, handles or links')
    expect(screen.getByLabelText('Message')).toHaveValue('insta me')
  })

  it('says when the chat has ended', async () => {
    signInAs()
    server.use(
      http.get(`${api}/v1/chats/${matchId}`, () =>
        HttpResponse.json({ code: 'match_not_found', detail: 'x' }, { status: 404 }),
      ),
    )
    renderRoutes(routes, `/app/chats/${matchId}`)

    expect(await screen.findByRole('heading', { name: 'This chat has ended' })).toBeInTheDocument()
  })
})

describe('Report, block, unmatch', () => {
  async function openSafety() {
    signInAs()
    allowRead()
    mockThread([message('1', 'hello', false)])
    renderRoutes(routes, `/app/chats/${matchId}`)
    await userEvent.click(await screen.findByRole('button', { name: 'Report, block or unmatch' }))
    return screen.getByRole('dialog')
  }

  it('blocks after confirming, and goes back to Chats', async () => {
    let blocked = false
    server.use(
      http.post(`${api}/v1/matches/${matchId}/block`, () => {
        blocked = true
        return new HttpResponse(null, { status: 204 })
      }),
    )
    mockChats([])
    const sheet = await openSafety()

    await userEvent.click(within(sheet).getByRole('button', { name: /Block/ }))
    expect(within(sheet).getByText(/Can't be undone/)).toBeInTheDocument()
    expect(blocked).toBe(false)
    await userEvent.click(within(sheet).getByRole('button', { name: 'Block' }))

    expect(await screen.findByRole('status')).toHaveTextContent('Blocked')
    expect(blocked).toBe(true)
  })

  it('"Not yet" goes back without doing anything', async () => {
    const sheet = await openSafety()

    await userEvent.click(within(sheet).getByRole('button', { name: /Unmatch/ }))
    await userEvent.click(within(sheet).getByRole('button', { name: 'Not yet' }))

    expect(within(sheet).getByRole('button', { name: /Report/ })).toBeInTheDocument()
  })

  it('reports with a reason and details', async () => {
    let sent: unknown
    server.use(
      http.post(`${api}/v1/matches/${matchId}/report`, async ({ request }) => {
        sent = await request.json()
        return new HttpResponse(null, { status: 204 })
      }),
    )
    mockChats([])
    const sheet = await openSafety()

    await userEvent.click(within(sheet).getByRole('button', { name: /Report/ }))
    const submit = within(sheet).getByRole('button', { name: 'Report and block' })
    expect(submit).toBeDisabled()
    await userEvent.click(within(sheet).getByRole('radio', { name: 'Harassment or threats' }))
    await userEvent.type(within(sheet).getByRole('textbox'), 'kept asking for my number')
    await userEvent.click(submit)

    expect(await screen.findByRole('status')).toHaveTextContent('Reported and blocked')
    expect(sent).toEqual({ reason: 'harassment', details: 'kept asking for my number' })
  })
})
