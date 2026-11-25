import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { env } from '@/config/env'
import type { components } from '@/lib/api/schema'
import { completeProfile, signInAs } from '@/testing/auth'
import { renderRoutes } from '@/testing/render'
import { server } from '@/testing/server'

import { routes } from './routes'

type MyProfile = components['schemas']['MyProfile']

const api = env.VITE_API_URL

function serveTab({ hidden = 0, blocked = 0 } = {}) {
  server.use(
    http.get(`${api}/v1/hides`, () =>
      HttpResponse.json({
        items: Array.from({ length: hidden }, (_, i) => ({
          id: `h${i}`,
          kind: 'phone',
          hint: '98••••••10',
          created_at: '2026-11-25T10:00:00Z',
        })),
        max: 200,
      }),
    ),
    http.get(`${api}/v1/blocks`, () =>
      HttpResponse.json(
        Array.from({ length: blocked }, (_, i) => ({
          id: `b${i}`,
          nickname: `Someone ${i}`,
          blocked_at: '2026-11-20T10:00:00Z',
        })),
      ),
    ),
    http.get(`${api}/v1/profile/me/photo`, () =>
      new HttpResponse(new Blob(['jpeg']), { headers: { 'Content-Type': 'image/jpeg' } }),
    ),
  )
}

const filled: MyProfile = {
  ...completeProfile,
  voice_seconds: 22,
  has_photo: true,
  contact: { kind: 'instagram', value: 'aanya.reads' },
  guess_cards: completeProfile.guess_cards.map((card, i) =>
    i === 0 ? { ...card, guessed_count: 18, right_count: 11 } : card,
  ),
}

describe('You tab', () => {
  it('shows my photo, nickname and one line of vibe and interests', async () => {
    serveTab()
    signInAs(undefined, undefined, filled)
    renderRoutes(routes, '/app/you')

    expect(await screen.findByRole('heading', { name: 'Quiet storm' })).toBeInTheDocument()
    expect(screen.getByText('Night owl · Music · Films · Trekking')).toBeInTheDocument()
    expect(await screen.findByRole('img', { name: 'Your photo' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Edit profile' })).toHaveAttribute('href', '/profile/setup/basics')
  })

  it('offers to add a photo in place of the avatar when there is none', async () => {
    serveTab()
    signInAs()
    renderRoutes(routes, '/app/you')

    await userEvent.click(await screen.findByRole('link', { name: 'Add a photo' }))

    expect(await screen.findByRole('region', { name: 'Your photo' })).toBeInTheDocument()
  })

  it('lists the swap cards with what is on each, and "Not added" for the rest', async () => {
    serveTab()
    signInAs()
    renderRoutes(routes, '/app/you')

    const section = await screen.findByRole('region', { name: 'Swap cards · open only by swapping' })
    expect(within(section).getByText('First name').parentElement?.parentElement).toHaveTextContent('Aanya')
    expect(within(section).getByRole('link', { name: 'Branch and year: CSE · 2nd year' })).toBeInTheDocument()
    expect(within(section).getByRole('link', { name: 'Hometown: Jaipur' })).toBeInTheDocument()
    expect(within(section).getByRole('link', { name: 'Voice note: Not added' })).toBeInTheDocument()
    expect(within(section).getByRole('link', { name: 'Photo: Not added' })).toBeInTheDocument()
    expect(within(section).getByRole('link', { name: 'Contact: Not added' })).toBeInTheDocument()
  })

  it('shows the voice length, photo and contact kind once added', async () => {
    serveTab()
    signInAs(undefined, undefined, filled)
    renderRoutes(routes, '/app/you')

    const section = await screen.findByRole('region', { name: 'Swap cards · open only by swapping' })
    expect(within(section).getByRole('link', { name: 'Voice note: 0:22' })).toBeInTheDocument()
    expect(within(section).getByRole('link', { name: 'Photo: Added' })).toBeInTheDocument()
    // The kind only, not the handle.
    expect(within(section).getByRole('link', { name: 'Contact: Instagram' })).toBeInTheDocument()
    expect(section).not.toHaveTextContent('aanya.reads')
  })

  it('opens each card editor from its row and comes back', async () => {
    serveTab()
    signInAs()
    renderRoutes(routes, '/app/you')

    await userEvent.click(await screen.findByRole('link', { name: 'Contact: Not added' }))
    expect(await screen.findByRole('region', { name: 'Your last card' })).toBeInTheDocument()

    await userEvent.click(within(screen.getByRole('main')).getByRole('link', { name: 'You' }))
    await userEvent.click(await screen.findByRole('link', { name: 'Voice note: Not added' }))
    expect(await screen.findByRole('region', { name: 'Your voice note' })).toBeInTheDocument()
  })

  it('shows how often each guess card is guessed right, or that nobody has tried', async () => {
    serveTab()
    signInAs(undefined, undefined, filled)
    renderRoutes(routes, '/app/you')

    const list = await screen.findByRole('list', { name: 'Your guess cards' })
    const [first, second] = within(list).getAllByRole('listitem')
    expect(first).toHaveTextContent('01 · Everyday choice')
    expect(first).toHaveTextContent('61% guess right')
    expect(first).toHaveTextContent('Chai or coffee?')
    expect(second).toHaveTextContent('No guesses yet')
  })

  it('counts hidden and blocked people in the settings rows', async () => {
    serveTab({ hidden: 4, blocked: 2 })
    signInAs()
    renderRoutes(routes, '/app/you')

    expect(await screen.findByText('Exes, classmates, your cousin. 4 hidden')).toBeInTheDocument()
    const blocked = screen.getByRole('link', { name: /Blocked and reported/ })
    expect(await within(blocked).findByText('2')).toBeInTheDocument()

    await userEvent.click(blocked)
    expect(await screen.findByRole('list', { name: 'Blocked people' })).toBeInTheDocument()
  })

  it('previews my profile the way the drop shows it, without guess answers', async () => {
    serveTab()
    signInAs(undefined, undefined, filled)
    renderRoutes(routes, '/app/you')

    await userEvent.click(await screen.findByRole('link', { name: 'See yourself the way the drop does' }))

    const preview = await screen.findByRole('article', { name: 'Quiet storm, as the drop shows it' })
    expect(within(preview).getByRole('heading', { name: 'Quiet storm' })).toBeInTheDocument()
    expect(within(preview).getByText('Night owl')).toBeInTheDocument()
    expect(await within(preview).findByRole('img', { name: 'Your photo, blurred' })).toBeInTheDocument()
    expect(within(preview).getByText('“Maggi is a full meal”')).toBeInTheDocument()
    expect(within(preview).getByText('Pineapple on pizza?')).toBeInTheDocument()
    expect(within(preview).getByText('Only at 2am')).toBeInTheDocument()
    expect(preview).not.toHaveTextContent('True')
    // Only "Looking for" is shown; first name, branch, hometown, voice, photo and contact are hidden.
    expect(within(preview).getByText('Something serious')).toBeInTheDocument()
    expect(within(preview).getByText('6 hidden')).toBeInTheDocument()
    expect(preview).not.toHaveTextContent('Aanya')
    expect(preview).not.toHaveTextContent('Jaipur')
  })
})
