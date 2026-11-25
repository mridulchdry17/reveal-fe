import type { ChatProfile, ChatThread, Message } from '../api/chats'
import { dayLabel } from './time'
import { swapEventLine } from './swapCopy'

export type TimelineItem =
  | { kind: 'day'; key: string; label: string }
  | { kind: 'message'; key: string; message: Message }
  | { kind: 'swap'; key: string; text: string }

type Dated = { at: string; item: Exclude<TimelineItem, { kind: 'day' }> }

/**
 * Messages and opened swaps in time order, with a separator whenever the day changes.
 * A swap and a message at the same moment: the swap goes first, since the message reacts to it.
 */
export function buildTimeline(
  messages: Message[],
  swaps: ChatThread['swaps'],
  profile: ChatProfile,
  now: Date = new Date(),
): TimelineItem[] {
  const dated: Dated[] = [
    ...swaps.cards.flatMap((c) =>
      c.state === 'open' && c.decided_at
        ? [{ at: c.decided_at, item: { kind: 'swap' as const, key: `swap-${c.card}`, text: swapEventLine(c.card, profile) } }]
        : [],
    ),
    ...messages.map((m) => ({ at: m.sent_at, item: { kind: 'message' as const, key: m.id, message: m } })),
  ]
  dated.sort((a, b) => Date.parse(a.at) - Date.parse(b.at))

  const items: TimelineItem[] = []
  let lastDay = ''
  for (const { at, item } of dated) {
    const label = dayLabel(at, now)
    if (label !== lastDay) {
      items.push({ kind: 'day', key: `day-${at}`, label })
      lastDay = label
    }
    items.push(item)
  }
  return items
}

/** "4 of 7": cards open between the two of you, out of all the cards this pair has. */
export function cardProgress(profile: ChatProfile): { open: number; total: number } {
  const open = profile.shown_cards.length
  return { open, total: open + profile.hidden_cards.length }
}
