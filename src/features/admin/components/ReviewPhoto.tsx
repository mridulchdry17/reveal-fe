import { useEffect, useMemo } from 'react'

import type { PhotoKind } from '../api/admin'
import { useReviewPhoto } from '../hooks/useReviewPhoto'

type Props = { reviewId: string; kind: PhotoKind; label: string }

export function ReviewPhoto({ reviewId, kind, label }: Props) {
  const photo = useReviewPhoto(reviewId, kind)
  const url = useMemo(() => (photo.data ? URL.createObjectURL(photo.data) : null), [photo.data])
  useEffect(
    () => () => {
      if (url) URL.revokeObjectURL(url)
    },
    [url],
  )

  return (
    <figure className="m-0 flex min-w-0 flex-1 flex-col gap-1.5">
      <div className="flex aspect-[3/4] items-center justify-center overflow-hidden rounded-xl bg-surface-2 text-xs text-muted">
        {url ? (
          <a href={url} target="_blank" rel="noreferrer" className="size-full">
            <img src={url} alt={label} className="size-full object-cover" />
          </a>
        ) : photo.isError ? (
          'Photo missing'
        ) : (
          'Loading…'
        )}
      </div>
      <figcaption className="text-xs text-muted">{label}</figcaption>
    </figure>
  )
}
