import { describe, expect, it } from 'vitest'

import { freshBoard } from '@/testing/chats'
import { kabir } from '@/testing/drops'

import type { ChatThread } from '../api/chats'
import { listTime } from './time'
import { buildTimeline, cardProgress } from './timeline'

// Local times, so the day boundaries hold in any time zone.
const at = (day: number, hour: number, minute = 0) => new Date(2026, 10, day, hour, minute).toISOString()
const now = new Date(2026, 10, 25, 23, 0)

describe('buildTimeline', () => {
  it('merges opened swaps with messages by time, with a separator per day', () => {
    const swaps: ChatThread['swaps'] = {
      ...freshBoard,
      cards: freshBoard.cards.map((c) =>
        c.card === 'first_name'
          ? { ...c, state: 'open', decided_at: at(25, 9) }
          : c.card === 'hometown'
            ? { ...c, state: 'open', decided_at: at(25, 22) }
            : c,
      ),
    }
    const profile = { ...kabir, first_name: 'Kabir', hometown: 'Dehradun' }
    const messages = [
      { id: 'a', body: 'hey', mine: false, sent_at: at(24, 20) },
      { id: 'b', body: 'hi!', mine: true, sent_at: at(25, 10) },
    ]

    const items = buildTimeline(messages, swaps, profile, now).map((i) =>
      i.kind === 'day' ? `[${i.label}]` : i.kind === 'swap' ? i.text : i.message.body,
    )

    expect(items).toEqual([
      '[Yesterday]',
      'hey',
      '[Today]',
      'You swapped first names',
      'hi!',
      'You swapped hometowns · Kabir is from Dehradun',
    ])
  })

  it('leaves out swaps that are not open yet', () => {
    expect(buildTimeline([], freshBoard, kabir, now)).toEqual([])
  })
})

describe('listTime', () => {
  it('says the time today, Yesterday, the weekday this week, else the date', () => {
    expect(listTime(at(25, 22, 18), now)).toBe('10:18 PM')
    expect(listTime(at(24, 9), now)).toBe('Yesterday')
    expect(listTime(at(23, 9), now)).toBe('Mon')
    expect(listTime(at(10, 9), now)).toBe('10 Nov')
  })
})

describe('cardProgress', () => {
  it('counts open cards out of the pair’s cards', () => {
    expect(cardProgress(kabir)).toEqual({ open: 1, total: 6 })
  })
})
