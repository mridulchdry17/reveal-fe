import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { env } from '@/config/env'
import { renderWithQuery } from '@/testing/render'
import { server } from '@/testing/server'

import { WaitlistScreen } from './WaitlistScreen'

const joinUrl = `${env.VITE_API_URL}/v1/waitlist`

async function fillAndSubmit(enrollment = '22EC1047', email = 'aanya@gmail.com') {
  const user = userEvent.setup()
  await user.type(screen.getByLabelText('Enrollment number'), enrollment)
  await user.type(screen.getByLabelText('Email'), email)
  await user.click(screen.getByRole('button', { name: 'Join the waitlist' }))
}

describe('WaitlistScreen', () => {
  it('shows the place in line after joining', async () => {
    let sent: unknown
    server.use(
      http.post(joinUrl, async ({ request }) => {
        sent = await request.json()
        return HttpResponse.json({ position: 142, already_joined: false }, { status: 201 })
      }),
    )
    renderWithQuery(<WaitlistScreen />)

    await fillAndSubmit()

    expect(await screen.findByText('#142')).toBeInTheDocument()
    expect(screen.getByText("You're on the list")).toBeInTheDocument()
    expect(sent).toEqual({ enrollment_number: '22EC1047', email: 'aanya@gmail.com' })
  })

  it('tells returning students they were already on the list', async () => {
    server.use(http.post(joinUrl, () => HttpResponse.json({ position: 7, already_joined: true })))
    renderWithQuery(<WaitlistScreen />)

    await fillAndSubmit()

    expect(await screen.findByText('Already on the list')).toBeInTheDocument()
    expect(screen.getByText('#7')).toBeInTheDocument()
  })

  it('checks empty and malformed fields before calling the server', async () => {
    renderWithQuery(<WaitlistScreen />)
    const user = userEvent.setup()

    await user.type(screen.getByLabelText('Email'), 'not-an-email')
    await user.click(screen.getByRole('button', { name: 'Join the waitlist' }))

    expect(await screen.findByText('Enter your enrollment number')).toBeInTheDocument()
    expect(screen.getByText('Enter a valid email')).toBeInTheDocument()
  })

  it('shows the server field error under the enrollment number', async () => {
    server.use(
      http.post(joinUrl, () =>
        HttpResponse.json(
          {
            detail: [
              {
                loc: ['body', 'enrollment_number'],
                msg: 'Value error, Enter your enrollment number as it appears on your ID card',
                type: 'value_error',
              },
            ],
          },
          { status: 422 },
        ),
      ),
    )
    renderWithQuery(<WaitlistScreen />)

    await fillAndSubmit('abc')

    expect(
      await screen.findByText('Enter your enrollment number as it appears on your ID card'),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Enrollment number')).toHaveAttribute('aria-invalid', 'true')
  })

  it('explains a conflict without naming whose details matched', async () => {
    server.use(
      http.post(joinUrl, () =>
        HttpResponse.json({ code: 'already_registered', detail: 'x' }, { status: 409 }),
      ),
    )
    renderWithQuery(<WaitlistScreen />)

    await fillAndSubmit()

    expect(await screen.findByRole('alert')).toHaveTextContent('already on the list with different details')
  })

  it('says when the network is down', async () => {
    server.use(http.post(joinUrl, () => HttpResponse.error()))
    renderWithQuery(<WaitlistScreen />)

    await fillAndSubmit()

    expect(await screen.findByRole('alert')).toHaveTextContent("Can't reach Reveal right now")
  })
})
