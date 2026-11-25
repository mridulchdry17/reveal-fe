import { useMyProfile } from '../hooks/useProfile'
import { VoiceRecorder } from './VoiceRecorder'

/** Card 5 in the You tab: record, save, replay or remove an optional voice note. */
export function VoiceSection() {
  const profile = useMyProfile()
  if (!profile.data) return null

  return (
    <section
      aria-labelledby="voice-title"
      className="flex flex-col gap-4 rounded-[28px] border border-border bg-surface p-5 shadow-[0_10px_28px_rgb(40_20_10/0.06)]"
    >
      <div>
        <div className="flex items-center justify-between gap-3">
          <p className="m-0 text-[11px] font-bold tracking-[0.16em] text-accent-text uppercase">Say hi, out loud</p>
          <span className="rounded-full border border-border px-2.5 py-1 text-[11px] font-bold tracking-[0.06em] text-muted uppercase">
            Optional
          </span>
        </div>
        <h2 id="voice-title" className="mt-1.5 mb-0 font-display text-[30px] leading-none font-normal">
          Your voice <em>note</em>
        </h2>
        <p className="mt-2 mb-0 text-sm leading-[1.45] text-muted">
          Up to 30 seconds. Stays Hidden until you both swap voice notes.
        </p>
      </div>
      <VoiceRecorder />
    </section>
  )
}
