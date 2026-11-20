import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import type { ReactElement } from 'react'
import { describe, expect, it } from 'vitest'

import { env } from '@/config/env'
import { renderRoutes } from '@/testing/render'
import { server } from '@/testing/server'

import { WaitlistScreen } from './WaitlistScreen'

const joinUrl = `${env.VITE_API_URL}/v1/waitlist`

function renderAt(url: string, ui: ReactElement = <WaitlistScreen />) {
  return renderRoutes([{ path: '/', element: ui }], url)
}

async function fillAndSubmit({ enrollment = '22EC1047', email = 'aanya@gmail.com', adult = true } = {}) {
  const user = userEvent.setup()
  await user.type(screen.getByLabelText('Enrollment number'), enrollment)
  await user.type(screen.getByLabelText('Email'), email)
  if (adult) await user.click(screen.getByLabelText("I'm 18 or older"))
  await user.click(screen.getByRole('button', { name: /save my spot/i }))
}

function respondWith(position: number, alreadyJoined = false) {
  server.use(
    http.post(joinUrl, () =>
      HttpResponse.json({ position, already_joined: alreadyJoined }, { status: alreadyJoined ? 200 : 201 }),
    ),
  )
}

describe('WaitlistScreen', () => {
  it('sends the details, the 18+ confirmation and the link source', async () => {
    let sent: unknown
    server.use(
      http.post(joinUrl, async ({ request }) => {
        sent = await request.json()
        return HttpResponse.json({ position: 3, already_joined: false }, { status: 201 })
      }),
    )
    renderAt('/?src=wa')

    await fillAndSubmit()

    expect(await screen.findByRole('heading', { name: "You're in." })).toBeInTheDocument()
    expect(sent).toEqual({
      enrollment_number: '22EC1047',
      email: 'aanya@gmail.com',
      confirmed_adult: true,
      source: 'wa',
    })
  })

  it('calls the first 50 founding members instead of showing a small number', async () => {
    respondWith(3)
    renderAt('/')

    await fillAndSubmit()

    expect(await screen.findByRole('img', { name: /one of the first 50/i })).toBeInTheDocument()
    expect(screen.queryByText('3')).not.toBeInTheDocument()
  })

  it('shows the real number after the first 50', async () => {
    respondWith(142)
    renderAt('/')

    await fillAndSubmit()

    expect(await screen.findByRole('img', { name: 'Your place in line is 142' })).toBeInTheDocument()
  })

  it('tells returning students they were already in', async () => {
    respondWith(7, true)
    renderAt('/')

    await fillAndSubmit()

    expect(await screen.findByRole('heading', { name: "You're already in." })).toBeInTheDocument()
  })

  it('checks empty fields, email shape and the 18+ box before calling the server', async () => {
    renderAt('/')
    const user = userEvent.setup()

    await user.type(screen.getByLabelText('Email'), 'not-an-email')
    await user.click(screen.getByRole('button', { name: /save my spot/i }))

    expect(await screen.findByText('Enter your enrollment number')).toBeInTheDocument()
    expect(screen.getByText("That email doesn't look right")).toBeInTheDocument()
    expect(screen.getByText('Reveal is only for people 18 or older')).toBeInTheDocument()
  })

  it('shows the server field error under the enrollment number', async () => {
    server.use(
      http.post(joinUrl, () =>
        HttpResponse.json(
          {
            detail: [
              { loc: ['body', 'enrollment_number'], msg: 'Value error, Check it against your ID card', type: 'value_error' },
            ],
          },
          { status: 422 },
        ),
      ),
    )
    renderAt('/')

    await fillAndSubmit({ enrollment: 'abc' })

    expect(await screen.findByText('Check it against your ID card')).toBeInTheDocument()
    expect(screen.getByLabelText('Enrollment number')).toHaveAttribute('aria-invalid', 'true')
  })

  it('explains a rate limit in plain words', async () => {
    server.use(
      http.post(joinUrl, () => HttpResponse.json({ code: 'rate_limited', detail: 'x' }, { status: 429 })),
    )
    renderAt('/')

    await fillAndSubmit()

    expect(await screen.findByRole('alert')).toHaveTextContent('Probably hostel Wi-Fi')
  })

  it('says when the network is down', async () => {
    server.use(http.post(joinUrl, () => HttpResponse.error()))
    renderAt('/')

    await fillAndSubmit()

    expect(await screen.findByRole('alert')).toHaveTextContent("Couldn't reach Reveal")
  })
})
