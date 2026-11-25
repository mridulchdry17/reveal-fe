import { AlertIcon } from '@/components/icons'

import { useMyProfile, useMyVoice, useRemoveVoice, useUploadVoice } from '../hooks/useProfile'
import { useObjectUrl } from '../hooks/useObjectUrl'
import { useRecorder } from '../hooks/useRecorder'
import { clock } from '../utils/duration'
import { profileErrorMessage } from '../utils/errorMessage'

const MAX_SECONDS = 30

const primary = 'h-11 rounded-full border-0 bg-text text-sm font-bold text-bg disabled:opacity-60'
const secondary =
  'h-11 rounded-full border-[1.5px] border-border-strong bg-transparent text-sm font-semibold text-text disabled:opacity-60'
const quiet = 'h-11 rounded-full border-0 bg-transparent px-3 text-sm font-semibold text-muted disabled:opacity-60'
const round =
  'flex size-16 shrink-0 items-center justify-center rounded-full border-0 shadow-[0_8px_20px_rgb(40_20_10/0.18)] transition-transform duration-150 active:scale-[0.94] disabled:opacity-50 disabled:shadow-none'

// Decorative waveform heights (percent). Not real audio data: just the shape of a voice note.
const bars = [30, 55, 80, 45, 95, 60, 35, 70, 100, 50, 25, 65, 85, 40, 75, 55, 30, 90, 60, 45, 70, 35, 50, 25]

/** Decorative bars. `filled` (0 to 1) colours the first part, so recording reads as progress. */
function Waveform({ filled, tone }: { filled: number; tone: 'accent' | 'ink' }) {
  const lit = Math.round(filled * bars.length)
  const on = tone === 'accent' ? 'bg-accent' : 'bg-text'
  return (
    <span aria-hidden="true" className="flex h-9 flex-1 items-center gap-[3px]">
      {bars.map((height, i) => (
        <span
          key={i}
          className={`w-[3px] flex-1 rounded-full ${i < lit ? on : 'bg-border-strong'}`}
          style={{ height: `${height}%` }}
        />
      ))}
    </span>
  )
}

function MicIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
      className={className}
    >
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
    </svg>
  )
}

/**
 * Record, preview, save, replay or remove the optional voice note. The You tab's voice card and
 * the photo setup step both wrap it.
 */
export function VoiceRecorder() {
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
      <div className="flex items-center gap-4">
        <button type="button" onClick={stop} aria-label="Stop" className={`${round} bg-text text-bg`}>
          <span aria-hidden="true" className="size-5 rounded-[5px] bg-bg" />
        </button>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <Waveform filled={state.elapsed / MAX_SECONDS} tone="accent" />
          <span className="flex items-center gap-2 text-sm font-semibold tabular-nums" aria-live="polite">
            <span aria-hidden="true" className="pulse-dot size-2.5 rounded-full bg-accent" />
            Recording {clock(state.elapsed)} / {clock(MAX_SECONDS)}
          </span>
        </div>
      </div>
    )
  } else if (draft && draftUrl) {
    body = (
      <>
        <div className="flex items-center gap-3 rounded-[18px] bg-surface-2 px-4 py-3">
          <Waveform filled={1} tone="ink" />
          <span className="font-display text-[26px] leading-none tabular-nums">{clock(draft.seconds)}</span>
        </div>
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
        <div className="flex items-center gap-3 rounded-[18px] bg-surface-2 px-4 py-3">
          <Waveform filled={1} tone="ink" />
          <span className="font-display text-[26px] leading-none tabular-nums">{clock(savedSeconds)}</span>
        </div>
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
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={record}
          disabled={state.status === 'unsupported'}
          aria-label="Record"
          className={`${round} bg-accent text-on-accent`}
        >
          <MicIcon className="size-7" />
        </button>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <Waveform filled={0} tone="accent" />
          <span aria-hidden="true" className="text-[13px] text-muted">
            Tap to record · up to {clock(MAX_SECONDS)}
          </span>
        </div>
      </div>
    )
  }

  return (
    <>
      {body}
      {state.status === 'denied' && (
        <p role="alert" className="m-0 flex items-start gap-1.5 text-[13px] font-medium text-accent-text">
          <AlertIcon className="mt-0.5 size-4 shrink-0" />
          Reveal can't use the microphone. Allow it in your browser settings, then try again.
        </p>
      )}
      {state.status === 'unsupported' && (
        <p className="m-0 text-[13px] text-muted">This browser can't record audio. Try Chrome or Safari.</p>
      )}
      {error && (
        <p role="alert" className="m-0 flex items-start gap-1.5 text-[13px] font-medium text-accent-text">
          <AlertIcon className="mt-0.5 size-4 shrink-0" />
          {profileErrorMessage(error)}
        </p>
      )}
    </>
  )
}
