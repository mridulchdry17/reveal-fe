import { AlertIcon, LockIcon } from '@/components/icons'

import { usePhotoEditor } from '../hooks/usePhotoEditor'
import { profileErrorMessage } from '../utils/errorMessage'

/** Card 6 in the You tab: add, change or remove your photo. Only you see it here. */
export function PhotoSection() {
  const { ready, hasPhoto, url, loading, input, onPick, openPicker, removePhoto, uploading, busy, error } =
    usePhotoEditor()

  if (!ready) return null

  return (
    <section
      aria-labelledby="photo-title"
      className="rounded-[28px] border border-border bg-surface p-5 shadow-[0_10px_28px_rgb(40_20_10/0.06)]"
    >
      <p className="m-0 text-[11px] font-bold tracking-[0.16em] text-accent-text uppercase">Only you see this</p>
      <h2 id="photo-title" className="mt-1.5 mb-0 font-display text-[30px] leading-none font-normal">
        Your <em>photo</em>
      </h2>
      <p className="mt-2 mb-0 text-sm leading-[1.45] text-muted">
        Nobody gets it up front. A match opens it piece by piece through swaps, and the whole thing only when you
        both agree.
      </p>

      <div className="mt-4 flex gap-4">
        <div className="relative flex aspect-[3/4] w-28 shrink-0 items-center justify-center overflow-hidden rounded-[18px]">
          {url ? (
            <img
              src={url}
              alt="Your photo"
              draggable={false}
              className="size-full object-cover select-none"
              onContextMenu={(event) => event.preventDefault()}
            />
          ) : (
            <span className="hatch flex size-full flex-col items-center justify-center gap-1.5 rounded-[18px] border-[1.5px] border-dashed border-locked text-locked">
              {loading ? (
                <span className="text-xs font-semibold">Loading…</span>
              ) : (
                <>
                  <LockIcon className="size-5" />
                  <span className="text-[11px] font-bold tracking-[0.06em] uppercase">No photo</span>
                </>
              )}
            </span>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-end gap-2">
          <p className="m-0 text-[13px] leading-5 text-muted">
            {hasPhoto ? 'Looking good. Swap it any time.' : 'A clear one of just you works best.'}
          </p>
          <input
            ref={input}
            type="file"
            accept="image/*"
            onChange={onPick}
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
          />
          <button
            type="button"
            disabled={busy}
            onClick={openPicker}
            className="h-11 rounded-full border-0 bg-text px-4 text-sm font-bold text-bg disabled:opacity-60"
          >
            {uploading ? 'Uploading…' : hasPhoto ? 'Change' : 'Add a photo'}
          </button>
          {hasPhoto && (
            <button
              type="button"
              disabled={busy}
              onClick={removePhoto}
              className="h-11 rounded-full border-[1.5px] border-border-strong bg-transparent px-4 text-sm font-semibold text-text disabled:opacity-60"
            >
              Remove
            </button>
          )}
        </div>
      </div>
      {error && (
        <p role="alert" className="mt-3 mb-0 flex items-start gap-1.5 text-[13px] font-medium text-accent-text">
          <AlertIcon className="mt-0.5 size-4 shrink-0" />
          {profileErrorMessage(error)}
        </p>
      )}
    </section>
  )
}
