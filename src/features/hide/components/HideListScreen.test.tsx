import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { env } from '@/config/env'
import { renderWithQuery } from '@/testing/render'
import { server } from '@/testing/server'

import type { HideList } from '../api/hides'
import { HideListScreen } from './HideListScreen'

const url = `${env.VITE_API_URL}/v1/hides`
const entry = { id: 'h1', kind: 'phone', hint: '98••••••10', created_at: '2026-11-25T10:00:00Z' } as const

function withList(list: HideList) {
  server.use(http.get(url, () => HttpResponse.json(list)))
}

describe('HideListScreen', () => {
  it('hides a phone number and shows only the masked hint', async () => {
    withList({ items: [], max: 200 })
    let sent: unknown
    server.use(
      http.post(url, async ({ request }) => {
        sent = await request.json()
        return HttpResponse.json({ items: [entry], max: 200 })
      }),
    )
    renderWithQuery(<HideListScreen />)

    expect(await screen.findByText(/Nobody yet/)).toBeInTheDocument()
    await userEvent.type(screen.getByLabelText('Their phone number'), '98765 43210')
    await userEvent.click(screen.getByRole('button', { name: 'Hide them' }))

    expect(await screen.findByText('98••••••10')).toBeInTheDocument()
    expect(sent).toEqual({ kind: 'phone', value: '98765 43210' })
    expect(screen.getByLabelText('Their phone number')).toHaveValue('')
    expect(screen.getByText('1 of 200')).toBeInTheDocument()
  })

  it('shows the API’s message next to the field', async () => {
    withList({ items: [], max: 200 })
    server.use(
      http.post(url, () =>
        HttpResponse.json(
          { detail: [{ loc: ['body', 'value'], msg: 'Value error, Enter a 10-digit Indian mobile number' }] },
          { status: 422 },
        ),
      ),
    )
    renderWithQuery(<HideListScreen />)

    await userEvent.type(await screen.findByLabelText('Their phone number'), '123')
    await userEvent.click(screen.getByRole('button', { name: 'Hide them' }))

    expect(await screen.findByText('Enter a 10-digit Indian mobile number')).toBeInTheDocument()
    expect(screen.getByLabelText('Their phone number')).toHaveAttribute('aria-invalid', 'true')
  })

  it('switches the field for email', async () => {
    withList({ items: [], max: 200 })
    renderWithQuery(<HideListScreen />)

    await userEvent.click(await screen.findByLabelText('Email'))
    expect(screen.getByLabelText('Their email')).toHaveAttribute('type', 'email')
  })

  it('stops hiding someone', async () => {
    withList({ items: [entry], max: 200 })
    server.use(http.delete(`${url}/h1`, () => HttpResponse.json({ items: [], max: 200 })))
    renderWithQuery(<HideListScreen />)

    await userEvent.click(await screen.findByRole('button', { name: 'Stop hiding 98••••••10' }))
    await waitFor(() => expect(screen.queryByText('98••••••10')).not.toBeInTheDocument())
    expect(screen.getByText(/Nobody yet/)).toBeInTheDocument()
  })
})
