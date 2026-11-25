import type { FormEvent } from 'react'

import { AlertIcon, CameraIcon } from '@/components/icons'

import { usePhotoEditor } from '../hooks/usePhotoEditor'
import { profileErrorMessage } from '../utils/errorMessage'
import { PhotoStages } from './PhotoStages'
import { StepLayout } from './StepLayout'
import { VoiceRecorder } from './VoiceRecorder'

type Props = {
  /** Leave setup for the app. The photo and voice note save as soon as they're picked. */
  onDone: () => void
}

/** Last setup step: add a photo (encouraged, not required) and an optional voice note. */
export function PhotoStep({ onDone }: Props) {
  const { hasPhoto, url, input, onPick, openPicker, uploading, busy, error } = usePhotoEditor()

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onDone()
  }

  return (
    <form onSubmit={submit} noValidate>
      <StepLayout
        step="photo"
        title="Your face,"
        accent="earned slowly."
        subtitle="Nobody sees this photo clearly unless you both say yes. Here's how it looks to them along the way."
        submitLabel={hasPhoto ? 'Finish profile' : undefined}
        submitting={busy}
        secondary={
          hasPhoto ? null : (
            <>
              <button
                type="submit"
                className="h-[54px] rounded-full border-[1.5px] border-border-strong bg-transparent text-base font-semibold text-text"
              >
                Skip for now
              </button>
              <p className="m-0 text-center text-[13px] text-muted">You can add a photo later from the You tab.</p>
            </>
          )
        }
      >
        <div className="-mt-2 flex flex-col gap-4">
          <PhotoStages url={url} />
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
            className="flex h-12 items-center justify-center gap-2 rounded-full border-0 bg-text text-sm font-bold text-bg disabled:opacity-60"
          >
            <CameraIcon className="size-[18px]" />
            {uploading ? 'Uploading…' : hasPhoto ? 'Change photo' : 'Add a photo'}
          </button>
          {error && (
            <p role="alert" className="m-0 flex items-start gap-1.5 text-[13px] font-medium text-accent-text">
              <AlertIcon className="mt-0.5 size-4 shrink-0" />
              {profileErrorMessage(error)}
            </p>
          )}
        </div>

        <section
          aria-labelledby="voice-step-title"
          className="flex flex-col gap-3 rounded-[24px] border border-border bg-surface p-4 shadow-[0_10px_24px_rgb(40_20_10/0.06)]"
        >
          <div className="flex items-center justify-between gap-2">
            <h2 id="voice-step-title" className="m-0 text-[11px] font-bold tracking-[0.16em] text-muted uppercase">
              Voice note
            </h2>
            <span className="text-xs text-muted">Optional · up to 30s</span>
          </div>
          <p className="m-0 font-display text-[21px] leading-[1.2] font-normal">
            Say hi the way you'd say it in the canteen.
          </p>
          <VoiceRecorder />
        </section>
      </StepLayout>
    </form>
  )
}
