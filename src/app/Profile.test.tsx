import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { env } from '@/config/env'
import type { components } from '@/lib/api/schema'
import { completeProfile, signInAs } from '@/testing/auth'
import { renderRoutes } from '@/testing/render'
import { server } from '@/testing/server'

import { routes } from './routes'

const api = `${env.VITE_API_URL}/v1/profile`
const none = { status: 'none' as const, submitted_at: null, reject_reason: null }
const empty: components['schemas']['MyProfile'] = {
  ...completeProfile,
  nickname: null,
  vibe: null,
  interests: [],
  prompts: [],
  guess_cards: [],
  branch: null,
  year: null,
  hometown: null,
  looking_for: null,
  gender: null,
  interested_in: null,
  basics_done: false,
  prompts_done: false,
  guesses_done: false,
  cards_done: false,
  preferences_done: false,
  complete: false,
}
const options = {
  vibes: ['Calm chaos', 'Night owl'],
  interest_suggestions: ['Music', 'Films', 'Trekking', 'Books'],
  min_interests: 3,
  max_interests: 6,
  prompt_questions: ['My ideal Sunday', 'Hot take', 'Green flag in people', 'Unpopular opinion'],
  prompt_answer_max: 120,
  nickname_suggestions: ['Midnight chai'],
  looking_for: [{ value: 'serious', label: 'Something serious' }],
  guess_kinds: [
    { value: 'everyday', label: 'Everyday choice' },
    { value: 'hot_take', label: 'Hot take' },
    { value: 'little_thing', label: 'Little thing' },
  ],
  guess_suggestions: {
    everyday: ['Chai or coffee?', 'My go-to canteen order'],
    hot_take: ['Pineapple on pizza?'],
    little_thing: ['My comfort show'],
  },
  guess_question_max: 90,
  guess_option_max: 40,
}

function withOptions() {
  server.use(http.get(`${api}/options`, () => HttpResponse.json(options)))
}

describe('profile setup', () => {
  it('sends verified students with no profile to the first screen', async () => {
    withOptions()
    signInAs(undefined, none, empty)
    renderRoutes(routes, '/app/tonight')

    expect(
      await screen.findByRole('heading', { name: 'Give yourself a nickname' }),
    ).toBeInTheDocument()
  })

  it('resumes at the first screen not done yet', async () => {
    withOptions()
    signInAs(undefined, none, { ...empty, basics_done: true, nickname: 'Quiet storm' })
    renderRoutes(routes, '/app')

    expect(await screen.findByRole('heading', { name: 'Answer 3 prompts' })).toBeInTheDocument()
  })

  it('saves nickname, vibe and interests, then moves to prompts', async () => {
    withOptions()
    signInAs(undefined, none, empty)
    let sent: unknown = null
    server.use(
      http.put(`${api}/me/basics`, async ({ request }) => {
        sent = await request.json()
        return HttpResponse.json({ ...empty, basics_done: true })
      }),
    )
    renderRoutes(routes, '/profile/setup/basics')

    await userEvent.click(await screen.findByRole('button', { name: 'Midnight chai' }))
    await userEvent.click(screen.getByRole('radio', { name: 'Night owl' }))
    for (const interest of ['Music', 'Films', 'Books']) {
      await userEvent.click(screen.getByRole('checkbox', { name: interest }))
    }
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    expect(await screen.findByRole('heading', { name: 'Answer 3 prompts' })).toBeInTheDocument()
    expect(sent).toEqual({
      nickname: 'Midnight chai',
      vibe: 'Night owl',
      interests: ['Music', 'Films', 'Books'],
    })
  })

  it('asks for at least three interests', async () => {
    withOptions()
    signInAs(undefined, none, empty)
    renderRoutes(routes, '/profile/setup/basics')

    await userEvent.type(await screen.findByLabelText('Nickname'), 'Quiet storm')
    await userEvent.click(screen.getByRole('radio', { name: 'Night owl' }))
    await userEvent.click(screen.getByRole('checkbox', { name: 'Music' }))
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Pick at least 3 interests')
  })

  it("shows the server's reason when a prompt has contact details", async () => {
    withOptions()
    signInAs(undefined, none, { ...empty, basics_done: true })
    server.use(
      http.put(`${api}/me/prompts`, () =>
        HttpResponse.json(
          {
            detail: [
              {
                loc: ['body', 'prompts', 0, 'answer'],
                msg: 'Value error, No numbers, handles or links here. Those go on your last card.',
              },
            ],
          },
          { status: 422 },
        ),
      ),
    )
    renderRoutes(routes, '/profile/setup/prompts')

    await userEvent.type(await screen.findByLabelText('Your answer to prompt 1'), 'Call 98765 43210')
    await userEvent.type(screen.getByLabelText('Your answer to prompt 2'), 'Maggi')
    await userEvent.type(screen.getByLabelText('Your answer to prompt 3'), 'Kindness')
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('No numbers, handles or links')
  })

  it('resumes at the guess cards for a profile finished before them', async () => {
    withOptions()
    signInAs(undefined, none, { ...completeProfile, guess_cards: [], guesses_done: false, complete: false })
    renderRoutes(routes, '/app/tonight')

    expect(await screen.findByRole('heading', { name: 'Make them guess you.' })).toBeInTheDocument()
    expect(screen.getByText('Step 4 of 7')).toBeInTheDocument()
  })

  it('writes the guess cards one at a time and saves all three once, from the last', async () => {
    withOptions()
    signInAs(undefined, none, { ...empty, basics_done: true, prompts_done: true })
    const sent: unknown[] = []
    server.use(
      http.put(`${api}/me/guesses`, async ({ request }) => {
        sent.push(await request.json())
        return HttpResponse.json({ ...empty, basics_done: true, prompts_done: true, guesses_done: true })
      }),
    )
    renderRoutes(routes, '/profile/setup/guesses')

    const answers = [
      ['Chai', 'Coffee', 'Neither'],
      ['Yes', 'Never', 'Only at 2am'],
      ['Friends', 'Panchayat', 'The Office'],
    ]
    const truths = [0, 2, 1]
    const fill = async (i: number, question: string | null) => {
      if (question) await userEvent.type(screen.getByLabelText(`Question ${i + 1}`), question)
      for (const [j, option] of (answers[i] ?? []).entries()) {
        await userEvent.type(screen.getByLabelText(`Answer ${'ABC'[j]}`), option)
      }
      const row = within(screen.getByRole('group', { name: `Option ${'ABC'[truths[i] ?? 0]}` }))
      await userEvent.click(row.getByRole('radio', { name: 'Mark true' }))
      expect(row.getByRole('radio', { name: 'True' })).toBeChecked()
    }

    expect(await screen.findByText('01 · Everyday')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Chai or coffee?' }))
    await fill(0, null)
    await userEvent.click(screen.getByRole('button', { name: 'Next card' }))

    expect(await screen.findByText('02 · Hot take')).toBeInTheDocument()
    expect(screen.getByRole('listitem', { current: 'step' })).toHaveTextContent('Hot take')
    expect(screen.queryByLabelText('Question 1')).not.toBeInTheDocument()
    await fill(1, 'Pineapple on pizza?')
    await userEvent.click(screen.getByRole('button', { name: 'Next card' }))

    expect(await screen.findByText('03 · Little thing')).toBeInTheDocument()
    await fill(2, 'My comfort show')
    expect(sent).toHaveLength(0)
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    expect(await screen.findByRole('heading', { name: 'Your 7 cards' })).toBeInTheDocument()
    expect(sent).toEqual([
      {
        cards: [
          { kind: 'everyday', question: 'Chai or coffee?', options: answers[0], answer: 0 },
          { kind: 'hot_take', question: 'Pineapple on pizza?', options: answers[1], answer: 2 },
          { kind: 'little_thing', question: 'My comfort show', options: answers[2], answer: 1 },
        ],
      },
    ])
  })

  it('keeps earlier cards when going back a card', async () => {
    withOptions()
    signInAs(undefined, none, { ...completeProfile, guesses_done: false })
    renderRoutes(routes, '/profile/setup/guesses')

    await userEvent.click(await screen.findByRole('button', { name: 'Next card' }))
    expect(await screen.findByLabelText('Question 2')).toHaveValue('Pineapple on pizza?')
    await userEvent.click(screen.getByRole('button', { name: 'Back' }))

    expect(await screen.findByLabelText('Question 1')).toHaveValue('Chai or coffee?')
    expect(screen.getByLabelText('Answer A')).toHaveValue('Chai')
    expect(
      within(screen.getByRole('group', { name: 'Option A' })).getByRole('radio', { name: 'True' }),
    ).toBeChecked()
  })

  it('stays on a card until it is filled in', async () => {
    withOptions()
    signInAs(undefined, none, { ...completeProfile, guesses_done: false })
    let saved = false
    server.use(
      http.put(`${api}/me/guesses`, () => {
        saved = true
        return HttpResponse.json(completeProfile)
      }),
    )
    renderRoutes(routes, '/profile/setup/guesses')

    await userEvent.clear(await screen.findByLabelText('Answer C'))
    await userEvent.click(screen.getByRole('button', { name: 'Next card' }))

    expect(await screen.findByText('Fill this one in.')).toBeInTheDocument()
    expect(screen.getByText('01 · Everyday')).toBeInTheDocument()
    expect(saved).toBe(false)
  })

  it("shows the card the server's reason is about, under the answer", async () => {
    withOptions()
    signInAs(undefined, none, { ...completeProfile, guesses_done: false })
    server.use(
      http.put(`${api}/me/guesses`, () =>
        HttpResponse.json(
          {
            detail: [
              {
                loc: ['body', 'cards', 0, 'options', 0],
                msg: 'Value error, No numbers, handles or links here. Those go on your last card.',
              },
            ],
          },
          { status: 422 },
        ),
      ),
    )
    renderRoutes(routes, '/profile/setup/guesses')

    await userEvent.click(await screen.findByRole('button', { name: 'Next card' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Next card' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Next' }))

    expect(await screen.findByText('01 · Everyday')).toBeInTheDocument()
    const answerA = within(screen.getByRole('group', { name: 'Option A' }))
    expect(await answerA.findByText(/No numbers, handles or links here/)).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('Fix the marked bits')
  })

  it('shows the same layout for everyone, with no choice to make', async () => {
    withOptions()
    signInAs(undefined, none, { ...empty, basics_done: true, prompts_done: true, guesses_done: true })
    renderRoutes(routes, '/profile/setup/cards')

    const cards = await screen.findByRole('list', { name: 'Your cards' })
    const row = (title: string) => within(cards).getByText(title).closest('li')
    expect(row('Looking for')).toHaveTextContent('Shown')
    expect(row('First name')).toHaveTextContent('Hidden')
    expect(row('Branch')).toHaveTextContent('Hidden')
    expect(row('Hometown')).toHaveTextContent('Hidden')
    expect(row('Photo')).toHaveTextContent('Swap only')
    expect(within(cards).queryByRole('button')).not.toBeInTheDocument()
  })

  it('finishes the profile and opens the app', async () => {
    withOptions()
    signInAs(undefined, none, { ...empty, basics_done: true, prompts_done: true, guesses_done: true, cards_done: true })
    let profile: components['schemas']['MyProfile'] = {
      ...empty,
      basics_done: true,
      prompts_done: true,
      guesses_done: true,
      cards_done: true,
    }
    server.use(
      http.get(`${api}/me`, () => HttpResponse.json(profile)),
      http.put(`${api}/me/preferences`, () => {
        profile = completeProfile
        return HttpResponse.json(completeProfile)
      }),
    )
    renderRoutes(routes, '/profile/setup/preferences')

    await userEvent.click(await screen.findByRole('radio', { name: 'Woman' }))
    await userEvent.click(screen.getByRole('radio', { name: 'Men' }))
    expect(screen.queryByRole('switch')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    expect(await screen.findByRole('heading', { name: 'Your face, earned slowly.' })).toBeInTheDocument()
    expect(screen.getByText('Step 7 of 7')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Skip for now' }))

    expect(await screen.findByRole('navigation', { name: 'Main' })).toBeInTheDocument()
  })

  it('shows how my photo looks to them at each stage, with a voice note card', async () => {
    withOptions()
    signInAs()
    renderRoutes(routes, '/profile/setup/photo')

    const stages = await screen.findByRole('list', { name: 'How your photo looks to them' })
    expect(within(stages).getAllByRole('listitem').map((li) => li.textContent)).toEqual([
      'In the drop',
      'After right guesses',
      'After card swaps',
      'Both said yes',
    ])
    expect(screen.getByRole('button', { name: 'Add a photo' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Finish profile' })).not.toBeInTheDocument()
    const voice = screen.getByRole('region', { name: 'Voice note' })
    expect(voice).toHaveTextContent('Optional · up to 30s')
    expect(voice).toHaveTextContent("Say hi the way you'd say it in the canteen.")
  })

  it('adds a photo on the last step, then finishes', async () => {
    withOptions()
    signInAs()
    server.use(
      http.put(`${api}/me/photo`, () => HttpResponse.json({ ...completeProfile, has_photo: true })),
      http.get(`${api}/me/photo`, () =>
        new HttpResponse(new Blob(['jpeg']), { headers: { 'Content-Type': 'image/jpeg' } }),
      ),
    )
    renderRoutes(routes, '/profile/setup/photo')

    await screen.findByRole('button', { name: 'Add a photo' })
    const input = document.querySelector<HTMLInputElement>('input[type="file"]')
    if (!input) throw new Error('no file input')
    await userEvent.upload(input, new File(['fake-jpeg'], 'me.jpg', { type: 'image/jpeg' }))

    expect(await screen.findByRole('button', { name: 'Change photo' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Skip for now' })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Finish profile' }))

    expect(await screen.findByRole('navigation', { name: 'Main' })).toBeInTheDocument()
  })

  it('links back to the profile screens from the You tab', async () => {
    withOptions()
    signInAs()
    renderRoutes(routes, '/app/you')

    expect(await screen.findByText('Quiet storm')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('link', { name: 'Edit profile' }))

    expect(
      await screen.findByRole('heading', { name: 'Give yourself a nickname' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Nickname')).toHaveValue('Quiet storm')
  })

  it('lists my guess cards in the You tab with a way to edit them', async () => {
    withOptions()
    signInAs()
    renderRoutes(routes, '/app/you')

    const list = await screen.findByRole('list', { name: 'Your guess cards' })
    const card = within(list).getByText('Pineapple on pizza?').closest('li')
    expect(card).toHaveTextContent('02 · Hot take')
    // Question only: the answer isn't repeated on the You tab.
    expect(card).not.toHaveTextContent('Only at 2am')
    await userEvent.click(screen.getByRole('link', { name: 'Edit guess cards' }))

    expect(await screen.findByRole('heading', { name: 'Make them guess you.' })).toBeInTheDocument()
    expect(screen.getByLabelText('Question 1')).toHaveValue('Chai or coffee?')
  })
})
