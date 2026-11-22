import { useEffect, useMemo, useRef, type ChangeEvent } from 'react'

import { LockIcon } from '@/components/icons'

import { useMyPhoto, useMyProfile, useRemovePhoto, useUploadPhoto } from '../hooks/useProfile'
import { profileErrorMessage } from '../utils/errorMessage'

/** Card 6 in the You tab: add, change or remove your photo. Only you see it here. */
export function PhotoSection() {
  const profile = useMyProfile()
  const hasPhoto = profile.data?.has_photo ?? false
  const photo = useMyPhoto(hasPhoto)
  const upload = useUploadPhoto()
  const remove = useRemovePhoto()
  const input = useRef<HTMLInputElement>(null)

  const url = useMemo(() => (hasPhoto && photo.data ? URL.createObjectURL(photo.data) : null), [hasPhoto, photo.data])
  useEffect(
    () => () => {
      if (url) URL.revokeObjectURL(url)
    },
    [url],
  )

  if (!profile.data) return null

  const pick = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = '' // picking the same file again should still upload
    if (file) {
      remove.reset()
      upload.mutate(file)
    }
  }
  const error = upload.error ?? remove.error
  const busy = upload.isPending || remove.isPending

  return (
    <section aria-labelledby="photo-title" className="rounded-2xl border border-border bg-surface p-4">
      <div className="flex gap-4">
        <div className="flex aspect-[3/4] w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl">
          {url ? (
            <img
              src={url}
              alt="Your photo"
              draggable={false}
              className="size-full object-cover select-none"
              onContextMenu={(event) => event.preventDefault()}
            />
          ) : (
            <span className="hatch flex size-full items-center justify-center rounded-xl border border-dashed border-locked text-locked">
              {hasPhoto && photo.isPending ? (
                <span className="text-xs">Loading…</span>
              ) : (
                <LockIcon className="size-5" />
              )}
            </span>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div>
            <h2 id="photo-title" className="m-0 text-[15px] font-bold">
              Your photo
            </h2>
            <p className="m-0 text-[13px] leading-5 text-muted">
              Only you can see it. Swaps open it to a match piece by piece, all of it only when you both agree.
            </p>
          </div>

          <input
            ref={input}
            type="file"
            accept="image/*"
            onChange={pick}
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
          />
          <div className="mt-auto flex gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => input.current?.click()}
              className={
                hasPhoto
                  ? 'h-11 flex-1 rounded-full border-[1.5px] border-border-strong bg-transparent text-sm font-semibold text-text disabled:opacity-60'
                  : 'h-11 flex-1 rounded-full border-0 bg-accent text-sm font-bold text-on-accent disabled:opacity-60'
              }
            >
              {upload.isPending ? 'Uploading…' : hasPhoto ? 'Change' : 'Add a photo'}
            </button>
            {hasPhoto && (
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  upload.reset()
                  remove.mutate()
                }}
                className="h-11 rounded-full border-0 bg-transparent px-3 text-sm font-semibold text-muted disabled:opacity-60"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </div>
      {error && (
        <p role="alert" className="mt-3 mb-0 text-[13px] font-medium text-accent-text">
          {profileErrorMessage(error)}
        </p>
      )}
    </section>
  )
}
