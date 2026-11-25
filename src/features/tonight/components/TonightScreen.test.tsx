import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { env } from '@/config/env'
import { signInAs } from '@/testing/auth'
import { dev, dropItem, kabir, mockDrop } from '@/testing/drops'
import { renderWithQuery } from '@/testing/render'
import { server } from '@/testing/server'

import { TonightScreen } from './TonightScreen'

const api = `${env.VITE_API_URL}/v1/drops/tonight`

describe('TonightScreen', () => {
  it('shows the first profile with only its shown cards', async () => {
    signInAs()
    mockDrop([dropItem('i1', kabir), dropItem('i2', dev)])
    renderWithQuery(<TonightScreen />)

    const card = await screen.findByRole('article', { name: 'Sunset chaser' })
    expect(screen.getByText('Next drop in 20h 14m')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: '0 of 2 seen' })).toBeInTheDocument()
    const cards = within(card).getByRole('list', { name: 'Cards' })
    expect(cards).not.toHaveTextContent('Lucknow')
    expect(cards).toHaveTextContent('Something serious')
    expect(cards).toHaveTextContent('5 hidden')
    expect(within(card).getByText('Photo opens through swaps')).toBeInTheDocument()
    expect(within(card).getByText('Mess food is underrated')).toBeInTheDocument()
    expect(within(card).getByRole('link', { name: "Guess Sunset chaser's cards" })).toHaveAttribute(
      'href',
      '/app/tonight/i1',
    )
  })

  it('shows name and branch once they are open', async () => {
    signInAs()
    mockDrop([dropItem('i2', dev)])
    renderWithQuery(<TonightScreen />)

    const card = await screen.findByRole('article', { name: 'Lost playlist' })
    expect(within(card).getByText('Dev')).toBeInTheDocument()
    expect(within(card).getByText('ECE · 3rd year')).toBeInTheDocument()
  })

  it('passes and moves to the next person', async () => {
    signInAs()
    mockDrop([dropItem('i1', kabir), dropItem('i2', dev)])
    let passed = false
    server.use(
      http.post(`${api}/i1/pass`, () => {
        passed = true
        return new HttpResponse(null, { status: 204 })
      }),
    )
    renderWithQuery(<TonightScreen />)

    await userEvent.click(await screen.findByRole('button', { name: 'Pass on Sunset chaser' }))

    expect(await screen.findByRole('article', { name: 'Lost playlist' })).toBeInTheDocument()
    expect(passed).toBe(true)
  })

  it('says when the drop is done', async () => {
    signInAs()
    mockDrop([dropItem('i1', kabir, 'liked'), dropItem('i2', dev, 'passed')])
    renderWithQuery(<TonightScreen />)

    expect(
      await screen.findByRole('heading', { name: "That's everyone for tonight" }),
    ).toBeInTheDocument()
    expect(screen.getByText('Your next drop')).toBeInTheDocument()
    expect(screen.getByRole('timer')).toHaveAccessibleName('20 hours 13 minutes left')
    expect(screen.getByText(/No endless scroll, no swiping/)).toBeInTheDocument()
  })

  it('is honest when no one is in the drop yet', async () => {
    signInAs()
    mockDrop([])
    renderWithQuery(<TonightScreen />)

    expect(await screen.findByRole('heading', { name: 'No one new right now' })).toBeInTheDocument()
    expect(screen.getByText(/Your drop fills up/)).toBeInTheDocument()
  })

  it('shows my interests and the reminder on the countdown', async () => {
    signInAs()
    mockDrop([])
    renderWithQuery(<TonightScreen interests={<span>Films</span>} reminder={<aside aria-label="Ping" />} />)

    expect(await screen.findByText('Films')).toBeInTheDocument()
    expect(screen.getByRole('complementary', { name: 'Ping' })).toBeInTheDocument()
  })
})
