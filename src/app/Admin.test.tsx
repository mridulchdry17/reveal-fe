import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { routes } from './routes'
import { env } from '@/config/env'
import { signInAs, testUser } from '@/testing/auth'
import { renderRoutes } from '@/testing/render'
import { server } from '@/testing/server'

const api = `${env.VITE_API_URL}/v1/admin`
const admin = { ...testUser, email: 'mridul@gmail.com', name: 'Mridul', is_admin: true }
const review = {
  id: '11111111-1111-4111-8111-111111111111',
  user: { id: '22222222-2222-4222-8222-222222222222', name: 'Rohan', email: 'rohan@gmail.com' },
  submitted_at: new Date(Date.now() - 2 * 3_600_000).toISOString(),
}

function withReviews(list: (typeof review)[]) {
  server.use(
    http.get(`${api}/reviews`, () => HttpResponse.json(list)),
    http.get(`${api}/reviews/:id/photos/:kind`, () =>
      HttpResponse.arrayBuffer(new Uint8Array([0xff, 0xd8, 0xff]).buffer, {
        headers: { 'Content-Type': 'image/jpeg' },
      }),
    ),
  )
}

describe('AdminScreen', () => {
  it('shows a waiting ID check with both photos and approves it', async () => {
    signInAs(admin)
    let reviews = [review]
    let approved = ''
    withReviews(reviews)
    server.use(
      http.get(`${api}/reviews`, () => HttpResponse.json(reviews)),
      http.post(`${api}/reviews/:id/approve`, ({ params }) => {
        approved = String(params.id)
        reviews = []
        return new HttpResponse(null, { status: 204 })
      }),
      http.get(`${api}/actions`, () => HttpResponse.json([])),
    )
    renderRoutes(routes, '/admin')

    const item = (await screen.findByText('Rohan')).closest('li')
    if (!item) throw new Error('review card missing')
    expect(within(item).getByText('rohan@gmail.com')).toBeInTheDocument()
    expect(await within(item).findByRole('img', { name: 'ID card' })).toBeInTheDocument()
    expect(await within(item).findByRole('img', { name: 'Selfie' })).toBeInTheDocument()

    await userEvent.click(within(item).getByRole('button', { name: 'Approve' }))

    expect(await screen.findByText(/Nothing waiting/)).toBeInTheDocument()
    expect(approved).toBe(review.id)
  })

  it('rejects with a reason the student will see', async () => {
    signInAs(admin)
    withReviews([review])
    let sentReason = ''
    server.use(
      http.post(`${api}/reviews/:id/reject`, async ({ request }) => {
        sentReason = ((await request.json()) as { reason: string }).reason
        return new HttpResponse(null, { status: 204 })
      }),
      http.get(`${api}/actions`, () => HttpResponse.json([])),
    )
    renderRoutes(routes, '/admin')

    await userEvent.click(await screen.findByRole('button', { name: 'Reject' }))
    await userEvent.click(screen.getByRole('radio', { name: 'ID photo is blurry or cut off' }))
    await userEvent.click(screen.getByRole('button', { name: 'Reject' }))

    await expect.poll(() => sentReason).toBe('ID photo is blurry or cut off')
  })

  it('lets someone in by email', async () => {
    signInAs(admin)
    withReviews([])
    let sent: unknown = null
    server.use(
      http.post(`${api}/let-in`, async ({ request }) => {
        sent = await request.json()
        return HttpResponse.json({ id: review.user.id, name: 'Asha', email: 'asha@gmail.com' })
      }),
      http.get(`${api}/actions`, () => HttpResponse.json([])),
    )
    renderRoutes(routes, '/admin?tab=let-in')

    await userEvent.type(await screen.findByLabelText('Their email'), 'asha@gmail.com')
    await userEvent.type(screen.getByLabelText(/Note for the log/), 'First-year, CSE')
    await userEvent.click(screen.getByRole('button', { name: 'Let them in' }))

    expect(await screen.findByRole('status')).toHaveTextContent('Asha (asha@gmail.com) is in.')
    expect(sent).toEqual({ email: 'asha@gmail.com', note: 'First-year, CSE' })
  })

  it('explains when nobody has signed in with that email', async () => {
    signInAs(admin)
    withReviews([])
    server.use(
      http.post(`${api}/let-in`, () =>
        HttpResponse.json({ code: 'account_not_found', detail: 'x' }, { status: 404 }),
      ),
    )
    renderRoutes(routes, '/admin?tab=let-in')

    await userEvent.type(await screen.findByLabelText('Their email'), 'nobody@gmail.com')
    await userEvent.click(screen.getByRole('button', { name: 'Let them in' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Ask them to sign in first')
  })

  it('shows the decision log', async () => {
    signInAs(admin)
    withReviews([])
    server.use(
      http.get(`${api}/actions`, () =>
        HttpResponse.json([
          {
            id: '33333333-3333-4333-8333-333333333333',
            action: 'reject',
            admin_email: 'mridul@gmail.com',
            target_email: 'rohan@gmail.com',
            note: 'Blurry',
            created_at: new Date().toISOString(),
          },
        ]),
      ),
    )
    renderRoutes(routes, '/admin?tab=log')

    expect(await screen.findByText('rohan@gmail.com')).toBeInTheDocument()
    expect(screen.getByText('Rejected')).toBeInTheDocument()
    expect(screen.getByText('“Blurry”')).toBeInTheDocument()
  })

  it('shows reports from students', async () => {
    signInAs(admin)
    withReviews([])
    server.use(
      http.get(`${api}/reports`, () =>
        HttpResponse.json([
          {
            id: '44444444-4444-4444-8444-444444444444',
            reason: 'harassment',
            details: 'kept asking for my number',
            reporter_email: 'aanya@adgips.ac.in',
            reported_email: 'kabir@adgips.ac.in',
            created_at: new Date().toISOString(),
          },
        ]),
      ),
    )
    renderRoutes(routes, '/admin?tab=reports')

    expect(await screen.findByText('Harassment')).toBeInTheDocument()
    expect(screen.getByText('kabir@adgips.ac.in')).toBeInTheDocument()
    expect(screen.getByText('“kept asking for my number”')).toBeInTheDocument()
    expect(screen.getByText(/by aanya@adgips.ac.in/)).toBeInTheDocument()
  })

  it('keeps students out', async () => {
    signInAs()
    server.use(http.get(`${env.VITE_API_URL}/health`, () => HttpResponse.json({ status: 'ok', database: 'ok' })))
    renderRoutes(routes, '/admin')

    expect(await screen.findByRole('navigation', { name: 'Main' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Admin' })).not.toBeInTheDocument()
  })
})
