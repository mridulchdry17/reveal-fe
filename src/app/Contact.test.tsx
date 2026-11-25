import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { env } from '@/config/env'
import { completeProfile, signInAs } from '@/testing/auth'
import { renderRoutes } from '@/testing/render'
import { server } from '@/testing/server'

import { routes } from './routes'

const url = `${env.VITE_API_URL}/v1/profile/me/contact`

function quietHealth() {
  server.use(http.get(`${env.VITE_API_URL}/health`, () => HttpResponse.json({ status: 'ok', database: 'ok' })))
}

describe('Contact card in the You tab', () => {
  it('saves an Instagram handle and shows it back', async () => {
    quietHealth()
    signInAs()
    let sent: unknown
    server.use(
      http.put(url, async ({ request }) => {
        sent = await request.json()
        return HttpResponse.json({ ...completeProfile, contact: { kind: 'instagram', value: 'aanya.reads' } })
      }),
    )
    renderRoutes(routes, '/app/you/cards/contact')

    const card = await screen.findByRole('region', { name: 'Your last card' })
    await userEvent.type(within(card).getByLabelText('Instagram username'), '@Aanya.Reads')
    await userEvent.click(within(card).getByRole('button', { name: 'Save' }))

    expect(await within(card).findByText('@aanya.reads')).toBeInTheDocument()
    expect(sent).toEqual({ kind: 'instagram', value: '@Aanya.Reads' })
  })

  it('shows the server error under the field', async () => {
    quietHealth()
    signInAs()
    server.use(
      http.put(url, () =>
        HttpResponse.json(
          { detail: [{ loc: ['body', 'value'], msg: 'Value error, Enter a 10-digit Indian mobile number' }] },
          { status: 422 },
        ),
      ),
    )
    renderRoutes(routes, '/app/you/cards/contact')

    const card = await screen.findByRole('region', { name: 'Your last card' })
    await userEvent.click(within(card).getByRole('radio', { name: 'Phone' }))
    await userEvent.type(within(card).getByLabelText('Phone number'), '12345')
    await userEvent.click(within(card).getByRole('button', { name: 'Save' }))

    expect(await within(card).findByText('Enter a 10-digit Indian mobile number')).toBeInTheDocument()
    expect(within(card).getByLabelText('Phone number')).toHaveAttribute('aria-invalid', 'true')
  })

  it('removes a saved number', async () => {
    quietHealth()
    signInAs(undefined, undefined, { ...completeProfile, contact: { kind: 'phone', value: '9876543210' } })
    server.use(http.delete(url, () => HttpResponse.json({ ...completeProfile, contact: null })))
    renderRoutes(routes, '/app/you/cards/contact')

    const card = await screen.findByRole('region', { name: 'Your last card' })
    expect(within(card).getByText('+91 98765 43210')).toBeInTheDocument()
    await userEvent.click(within(card).getByRole('button', { name: 'Remove' }))

    expect(await within(card).findByLabelText('Instagram username')).toBeInTheDocument()
  })
})
