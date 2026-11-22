import { useEffect, useMemo } from 'react'

import { useMyProfile, useMyVoice, useRemoveVoice, useUploadVoice } from '../hooks/useProfile'
import { useRecorder } from '../hooks/useRecorder'
import { clock } from '../utils/duration'
import { profileErrorMessage } from '../utils/errorMessage'

const MAX_SECONDS = 30

const primary =
  'h-11 rounded-full border-0 bg-accent text-sm font-bold text-on-accent disabled:opacity-60'
const secondary =
  'h-11 rounded-full border-[1.5px] border-border-strong bg-transparent text-sm font-semibold text-text disabled:opacity-60'
const quiet = 'h-11 rounded-full border-0 bg-transparent px-3 text-sm font-semibold text-muted disabled:opacity-60'

function useObjectUrl(blob: Blob | undefined | null) {
  const url = useMemo(() => (blob ? URL.createObjectURL(blob) : null), [blob])
  useEffect(
    () => () => {
      if (url) URL.revokeObjectURL(url)
    },
    [url],
  )
  return url
}

/** Card 5 in the You tab: record, save, replay or remove an optional voice note. */
export function VoiceSection() {
  const profile = useMyProfile()
  const savedSeconds = profile.data?.voice_seconds ?? null
  const saved = useMyVoice(savedSeconds !== null)
  const upload = useUploadVoice()
  const remove = useRemoveVoice()
  const { state, start, stop, reset } = useRecorder(MAX_SECONDS)

  const draft = state.status === 'recorded' ? state.recording : null
  const draftUrl = useObjectUrl(draft?.blob)
  const savedUrl = useObjectUrl(savedSeconds !== null ? saved.data : null)

  if (!profile.data) return null

  const busy = upload.isPending || remove.isPending
  const error = upload.error ?? remove.error
  const record = () => {
    upload.reset()
    remove.reset()
    void start()
  }

  let body
  if (state.status === 'recording') {
    body = (
      <div className="flex items-center gap-3">
        <span className="flex flex-1 items-center gap-2 text-sm font-semibold" aria-live="polite">
          <span aria-hidden="true" className="size-2.5 rounded-full bg-accent" />
          Recording {clock(state.elapsed)} / {clock(MAX_SECONDS)}
        </span>
        <button type="button" onClick={stop} className={`${primary} w-28`}>
          Stop
        </button>
      </div>
    )
  } else if (draft && draftUrl) {
    body = (
      <>
        <audio controls src={draftUrl} aria-label="Your new recording" className="w-full" />
        <div className="flex gap-2">
          <button type="button" disabled={busy} onClick={record} className={`${secondary} flex-1`}>
            Record again
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              upload.mutate({ recording: draft.blob, seconds: draft.seconds }, { onSuccess: () => reset() })
            }
            className={`${primary} flex-1`}
          >
            {upload.isPending ? 'Saving…' : 'Save'}
          </button>
        </div>
      </>
    )
  } else if (savedSeconds !== null) {
    body = (
      <>
        {savedUrl ? (
          <audio controls src={savedUrl} aria-label="Your voice note" className="w-full" />
        ) : (
          <p className="m-0 text-[13px] text-muted">{saved.isError ? "Couldn't load it." : 'Loading…'}</p>
        )}
        <div className="flex gap-2">
          <button type="button" disabled={busy} onClick={record} className={`${secondary} flex-1`}>
            Record a new one
          </button>
          <button type="button" disabled={busy} onClick={() => remove.mutate()} className={quiet}>
            Remove
          </button>
        </div>
      </>
    )
  } else {
    body = (
      <button type="button" onClick={record} disabled={state.status === 'unsupported'} className={`${primary} w-full`}>
        Record
      </button>
    )
  }

  return (
    <section aria-labelledby="voice-title" className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4">
      <div>
        <h2 id="voice-title" className="m-0 text-[15px] font-bold">
          Your voice note
        </h2>
        <p className="m-0 text-[13px] leading-5 text-muted">
          Optional. Up to 30 seconds. Opens only when you both swap voice notes.
        </p>
      </div>
      {body}
      {state.status === 'denied' && (
        <p role="alert" className="m-0 text-[13px] font-medium text-accent-text">
          Reveal can't use the microphone. Allow it in your browser settings, then try again.
        </p>
      )}
      {state.status === 'unsupported' && (
        <p className="m-0 text-[13px] text-muted">This browser can't record audio. Try Chrome or Safari.</p>
      )}
      {error && (
        <p role="alert" className="m-0 text-[13px] font-medium text-accent-text">
          {profileErrorMessage(error)}
        </p>
      )}
    </section>
  )
}
