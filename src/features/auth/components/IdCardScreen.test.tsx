import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { env } from '@/config/env'
import { signInAs, unverifiedUser } from '@/testing/auth'
import { renderRoutes } from '@/testing/render'
import { server } from '@/testing/server'

import { IdCardScreen } from './IdCardScreen'

const submitUrl = `${env.VITE_API_URL}/v1/verification/id-card`

const routes = [
  { path: '/verify/id-card', element: <IdCardScreen /> },
  { path: '/verify/pending', element: <h1>Waiting for review</h1> },
  { path: '/verify', element: <h1>Verify</h1> },
  { path: '/app/*', element: <h1>App home</h1> },
]

const idPhoto = new File(['id-card-bytes'], 'id.jpg', { type: 'image/jpeg' })
const selfiePhoto = new File(['selfie-bytes'], 'selfie.jpg', { type: 'image/jpeg' })

async function takeBothPhotos() {
  await userEvent.upload(
    await screen.findByLabelText('Take a photo of your ID card'),
    idPhoto,
  )
  await userEvent.click(screen.getByRole('button', { name: 'Continue' }))
  await userEvent.upload(screen.getByLabelText('Take selfie'), selfiePhoto)
}

describe('IdCardScreen', () => {
  it('sends the ID card and selfie, then shows the waiting screen', async () => {
    signInAs(unverifiedUser)
    let sent = ''
    server.use(
      http.post(submitUrl, async ({ request }) => {
        // Raw multipart text: jsdom's files don't survive Node's fetch with their bytes,
        // so this checks both fields are sent; real browsers send the photos themselves.
        sent = await request.text()
        return HttpResponse.json(
          { status: 'pending', submitted_at: '2026-11-22T10:00:00Z', reject_reason: null },
          { status: 201 },
        )
      }),
    )
    renderRoutes(routes, '/verify/id-card')

    expect(
      await screen.findByRole('heading', { name: 'Snap your college ID' }),
    ).toBeInTheDocument()
    await takeBothPhotos()
    expect(screen.getByRole('heading', { name: 'One quick selfie' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Send for review' }))

    expect(await screen.findByRole('heading', { name: 'Waiting for review' })).toBeInTheDocument()
    expect(sent).toContain('name="id_card"')
    expect(sent).toContain('name="selfie"')
    expect(sent).toContain('Content-Type: image/jpeg')
  })

  it('asks for the ID photo before moving on', async () => {
    signInAs(unverifiedUser)
    renderRoutes(routes, '/verify/id-card')

    await screen.findByRole('heading', { name: 'Snap your college ID' })
    expect(screen.queryByRole('button', { name: 'Continue' })).not.toBeInTheDocument()
  })

  it('explains when a file is not a photo', async () => {
    signInAs(unverifiedUser)
    server.use(
      http.post(submitUrl, () =>
        HttpResponse.json({ code: 'not_a_photo', detail: 'x' }, { status: 422 }),
      ),
    )
    renderRoutes(routes, '/verify/id-card')

    await takeBothPhotos()
    await userEvent.click(screen.getByRole('button', { name: 'Send for review' }))

    expect(await screen.findByRole('alert')).toHaveTextContent("That file isn't a photo")
  })

  it('goes to the waiting screen if photos were already sent', async () => {
    signInAs(unverifiedUser, { status: 'pending', submitted_at: null, reject_reason: null })
    renderRoutes(routes, '/verify/id-card')

    expect(await screen.findByRole('heading', { name: 'Waiting for review' })).toBeInTheDocument()
  })
})
