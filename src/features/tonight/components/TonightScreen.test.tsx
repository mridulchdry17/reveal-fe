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
    expect(cards).toHaveTextContent('Lucknow')
    expect(cards).toHaveTextContent('Something serious')
    expect(cards).toHaveTextContent('4 hidden')
    expect(within(card).getByText('Photo opens through swaps')).toBeInTheDocument()
    expect(within(card).getByText('Mess food is underrated')).toBeInTheDocument()
  })

  it('shows name and branch when they are shown', async () => {
    signInAs()
    mockDrop([dropItem('i2', dev)])
    renderWithQuery(<TonightScreen />)

    const card = await screen.findByRole('article', { name: 'Lost playlist' })
    expect(within(card).getByText('Dev')).toBeInTheDocument()
    expect(within(card).getByText('ECE · 3rd year')).toBeInTheDocument()
  })

  it('likes a prompt with a comment', async () => {
    signInAs()
    mockDrop([dropItem('i1', kabir), dropItem('i2', dev)])
    let sent: unknown
    server.use(
      http.post(`${api}/i1/like`, async ({ request }) => {
        sent = await request.json()
        return HttpResponse.json({ matched: false })
      }),
    )
    renderWithQuery(<TonightScreen />)

    await userEvent.click(await screen.findByRole('button', { name: 'Like "Unpopular opinion"' }))
    const sheet = screen.getByRole('dialog', { name: 'Like Sunset chaser' })
    expect(within(sheet).getByRole('radio', { name: /Mess food is underrated/ })).toBeChecked()
    await userEvent.type(within(sheet).getByLabelText(/Add a comment/), 'Thursday rajma though')
    await userEvent.click(within(sheet).getByRole('button', { name: 'Send like' }))

    expect(await screen.findByRole('article', { name: 'Lost playlist' })).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(sent).toEqual({ prompt_id: 'k2', comment: 'Thursday rajma though' })
    expect(screen.getByRole('img', { name: '1 of 2 seen' })).toBeInTheDocument()
  })

  it('sends a like without a comment as null', async () => {
    signInAs()
    mockDrop([dropItem('i1', kabir)])
    let sent: unknown
    server.use(
      http.post(`${api}/i1/like`, async ({ request }) => {
        sent = await request.json()
        return HttpResponse.json({ matched: false })
      }),
    )
    renderWithQuery(<TonightScreen />)

    await userEvent.click(await screen.findByRole('button', { name: 'Like Sunset chaser' }))
    await userEvent.click(screen.getByRole('button', { name: 'Send like' }))

    expect(await screen.findByRole('heading', { name: "That's everyone for tonight" })).toBeInTheDocument()
    expect(sent).toEqual({ prompt_id: 'k1', comment: null })
  })

  it('says when a like is a match', async () => {
    signInAs()
    mockDrop([dropItem('i1', kabir)])
    server.use(http.post(`${api}/i1/like`, () => HttpResponse.json({ matched: true })))
    renderWithQuery(<TonightScreen />)

    await userEvent.click(await screen.findByRole('button', { name: 'Like Sunset chaser' }))
    await userEvent.click(screen.getByRole('button', { name: 'Send like' }))

    expect(await screen.findByRole('status')).toHaveTextContent("It's a match with Sunset chaser")
  })

  it('explains a comment the server refuses, without closing the sheet', async () => {
    signInAs()
    mockDrop([dropItem('i1', kabir)])
    server.use(
      http.post(`${api}/i1/like`, () =>
        HttpResponse.json(
          { detail: [{ loc: ['body', 'comment'], msg: 'Value error, x', type: 'value_error' }] },
          { status: 422 },
        ),
      ),
    )
    renderWithQuery(<TonightScreen />)

    await userEvent.click(await screen.findByRole('button', { name: 'Like Sunset chaser' }))
    await userEvent.type(screen.getByLabelText(/Add a comment/), 'insta me')
    await userEvent.click(screen.getByRole('button', { name: 'Send like' }))

    const sheet = screen.getByRole('dialog')
    expect(await within(sheet).findByRole('alert')).toHaveTextContent('No numbers, handles or links')
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
    expect(screen.getByText(/Next drop in 20h 14m\./)).toBeInTheDocument()
  })

  it('is honest when no one is in the drop yet', async () => {
    signInAs()
    mockDrop([])
    renderWithQuery(<TonightScreen />)

    expect(await screen.findByRole('heading', { name: 'No one new right now' })).toBeInTheDocument()
  })
})
