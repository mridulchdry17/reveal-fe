import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { afterEach, describe, expect, it } from 'vitest'

import { env } from '@/config/env'
import { completeProfile, signInAs } from '@/testing/auth'
import { renderRoutes } from '@/testing/render'
import { server } from '@/testing/server'

import { routes } from './routes'

const url = `${env.VITE_API_URL}/v1/profile/me/voice`

/** Just enough of MediaRecorder: stop() hands back one chunk of "audio". */
class FakeRecorder {
  static isTypeSupported = (type: string) => type === 'audio/webm;codecs=opus'
  state: 'inactive' | 'recording' = 'inactive'
  mimeType = 'audio/webm;codecs=opus'
  ondataavailable: ((event: { data: Blob }) => void) | null = null
  onstop: (() => void) | null = null
  start() {
    this.state = 'recording'
  }
  stop() {
    this.state = 'inactive'
    this.ondataavailable?.({ data: new Blob(['opus'], { type: this.mimeType }) })
    this.onstop?.()
  }
}

function withMicrophone(allowed = true) {
  Object.assign(window, { MediaRecorder: FakeRecorder })
  Object.defineProperty(navigator, 'mediaDevices', {
    configurable: true,
    value: {
      getUserMedia: () =>
        allowed ? Promise.resolve({ getTracks: () => [{ stop() {} }] }) : Promise.reject(new Error('denied')),
    },
  })
}

function quietHealth() {
  server.use(http.get(`${env.VITE_API_URL}/health`, () => HttpResponse.json({ status: 'ok', database: 'ok' })))
}

afterEach(() => {
  Reflect.deleteProperty(window, 'MediaRecorder')
  Reflect.deleteProperty(navigator, 'mediaDevices')
})

describe('Voice note in the You tab', () => {
  it('records, previews and saves a voice note', async () => {
    quietHealth()
    withMicrophone()
    signInAs()
    let sent = ''
    server.use(
      http.put(url, async ({ request }) => {
        sent = await request.text()
        return HttpResponse.json({ ...completeProfile, voice_seconds: 1 })
      }),
      http.get(url, () => new HttpResponse(new Blob(['opus']), { headers: { 'Content-Type': 'audio/webm' } })),
    )
    renderRoutes(routes, '/app/you')

    const card = await screen.findByRole('region', { name: 'Your voice note' })
    await userEvent.click(within(card).getByRole('button', { name: 'Record' }))
    expect(within(card).getByText(/Recording 0:00/)).toBeInTheDocument()
    await userEvent.click(within(card).getByRole('button', { name: 'Stop' }))
    expect(within(card).getByLabelText('Your new recording')).toBeInTheDocument()
    await userEvent.click(within(card).getByRole('button', { name: 'Save' }))

    expect(await within(card).findByLabelText('Your voice note')).toBeInTheDocument()
    expect(sent).toContain('name="voice"')
    expect(sent).toContain('name="seconds"')
  })

  it('removes a saved voice note', async () => {
    quietHealth()
    withMicrophone()
    signInAs(undefined, undefined, { ...completeProfile, voice_seconds: 12 })
    server.use(
      http.get(url, () => new HttpResponse(new Blob(['opus']), { headers: { 'Content-Type': 'audio/webm' } })),
      http.delete(url, () => HttpResponse.json({ ...completeProfile, voice_seconds: null })),
    )
    renderRoutes(routes, '/app/you')

    const card = await screen.findByRole('region', { name: 'Your voice note' })
    expect(await within(card).findByLabelText('Your voice note')).toBeInTheDocument()
    await userEvent.click(within(card).getByRole('button', { name: 'Remove' }))

    expect(await within(card).findByRole('button', { name: 'Record' })).toBeInTheDocument()
  })

  it('explains when the microphone is blocked', async () => {
    quietHealth()
    withMicrophone(false)
    signInAs()
    renderRoutes(routes, '/app/you')

    const card = await screen.findByRole('region', { name: 'Your voice note' })
    await userEvent.click(within(card).getByRole('button', { name: 'Record' }))

    expect(await within(card).findByRole('alert')).toHaveTextContent("Reveal can't use the microphone")
  })

  it('says so when the browser cannot record', async () => {
    quietHealth()
    signInAs()
    renderRoutes(routes, '/app/you')

    const card = await screen.findByRole('region', { name: 'Your voice note' })

    expect(within(card).getByRole('button', { name: 'Record' })).toBeDisabled()
    expect(within(card).getByText(/can't record audio/)).toBeInTheDocument()
  })
})
