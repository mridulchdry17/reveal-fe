import { Link } from 'react-router'

import { AlertIcon, BackIcon } from '@/components/icons'
import { ScreenHeader } from '@/components/ScreenHeader'

import { useMyPhoto, useMyProfile } from '../hooks/useProfile'
import { useObjectUrl } from '../hooks/useObjectUrl'
import { profileErrorMessage } from '../utils/errorMessage'
import { DropPreview } from './DropPreview'

/** /app/you/preview: my own profile, read-only, the way it shows up in someone's drop. */
export function ProfilePreviewScreen() {
  const profile = useMyProfile()
  const photo = useMyPhoto(profile.data?.has_photo ?? false)
  const url = useObjectUrl(profile.data?.has_photo ? photo.data : null)

  return (
    <section className="rise pb-8">
      <Link
        to="/app/you"
        className="mb-3 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-muted no-underline"
      >
        <BackIcon className="size-4" /> You
      </Link>
      <ScreenHeader
        kicker="Only you see this preview"
        title="How the drop"
        accent="sees you."
        subtitle="This is what someone gets when you land in their drop. Everything else opens only by swapping."
      />
      {profile.isPending ? (
        <p role="status" className="m-0 text-sm text-muted">
          Loading…
        </p>
      ) : profile.isError ? (
        <p role="alert" className="m-0 flex gap-2 text-sm text-accent-text">
          <AlertIcon className="mt-0.5 size-4 shrink-0" />
          {profileErrorMessage(profile.error)}
        </p>
      ) : (
        <DropPreview profile={profile.data} photoUrl={url} />
      )}
    </section>
  )
}
