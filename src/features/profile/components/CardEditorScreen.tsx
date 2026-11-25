import { Link, Navigate, useParams } from 'react-router'

import { BackIcon } from '@/components/icons'

import { ContactSection } from './ContactSection'
import { PhotoSection } from './PhotoSection'
import { VoiceSection } from './VoiceSection'

const editors = { photo: PhotoSection, voice: VoiceSection, contact: ContactSection }

const isCard = (value: string | undefined): value is keyof typeof editors =>
  value !== undefined && Object.hasOwn(editors, value)

/** One swap card's editor (photo, voice note or contact), opened from its row in the You tab. */
export function CardEditorScreen() {
  const { card } = useParams()
  if (!isCard(card)) return <Navigate to="/app/you" replace />
  const Editor = editors[card]

  return (
    <section className="rise pb-8">
      <Link
        to="/app/you"
        className="mb-3 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-muted no-underline"
      >
        <BackIcon className="size-4" /> You
      </Link>
      <Editor />
    </section>
  )
}
