import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { env } from '@/config/env'
import { completeProfile, signInAs } from '@/testing/auth'
import { renderRoutes } from '@/testing/render'
import { server } from '@/testing/server'

import { routes } from './routes'

const url = `${env.VITE_API_URL}/v1/profile/me/photo`
const photoFile = new File(['fake-jpeg'], 'me.jpg', { type: 'image/jpeg' })

function quietHealth() {
  server.use(http.get(`${env.VITE_API_URL}/health`, () => HttpResponse.json({ status: 'ok', database: 'ok' })))
}

function servePhoto() {
  server.use(
    http.get(url, () => new HttpResponse(new Blob(['jpeg']), { headers: { 'Content-Type': 'image/jpeg' } })),
  )
}

function fileInput(): HTMLInputElement {
  const input = document.querySelector<HTMLInputElement>('input[type="file"]')
  if (!input) throw new Error('no file input')
  return input
}

describe('Photo card in the You tab', () => {
  it('uploads a photo and shows it back', async () => {
    quietHealth()
    signInAs()
    servePhoto()
    let sent = ''
    server.use(
      http.put(url, async ({ request }) => {
        sent = await request.text()
        return HttpResponse.json({ ...completeProfile, has_photo: true })
      }),
    )
    renderRoutes(routes, '/app/you/cards/photo')

    const card = await screen.findByRole('region', { name: 'Your photo' })
    expect(within(card).getByRole('button', { name: 'Add a photo' })).toBeInTheDocument()
    await userEvent.upload(fileInput(), photoFile)

    expect(await within(card).findByRole('img', { name: 'Your photo' })).toBeInTheDocument()
    expect(within(card).getByRole('button', { name: 'Change' })).toBeInTheDocument()
    expect(sent).toContain('name="photo"')
  })

  it('says when the photo is too large', async () => {
    quietHealth()
    signInAs()
    server.use(
      http.put(url, () =>
        HttpResponse.json({ code: 'photo_too_large', detail: 'That photo is too large' }, { status: 413 }),
      ),
    )
    renderRoutes(routes, '/app/you/cards/photo')

    await screen.findByRole('region', { name: 'Your photo' })
    await userEvent.upload(fileInput(), photoFile)

    expect(await screen.findByRole('alert')).toHaveTextContent('That photo is too large. Try another one.')
  })

  it('removes the photo', async () => {
    quietHealth()
    signInAs(undefined, undefined, { ...completeProfile, has_photo: true })
    servePhoto()
    server.use(http.delete(url, () => HttpResponse.json({ ...completeProfile, has_photo: false })))
    renderRoutes(routes, '/app/you/cards/photo')

    const card = await screen.findByRole('region', { name: 'Your photo' })
    expect(await within(card).findByRole('img', { name: 'Your photo' })).toBeInTheDocument()
    await userEvent.click(within(card).getByRole('button', { name: 'Remove' }))

    expect(await within(card).findByRole('button', { name: 'Add a photo' })).toBeInTheDocument()
    expect(within(card).queryByRole('img', { name: 'Your photo' })).not.toBeInTheDocument()
  })
})
