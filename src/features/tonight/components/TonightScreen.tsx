import { ScreenHeader } from '@/components/ScreenHeader'

export function TonightScreen() {
  return (
    <section>
      <ScreenHeader title="Tonight" subtitle="Drop at 9:00 pm" />
      <div className="rounded-3xl border border-border bg-surface p-6 text-center">
        <p className="m-0 text-sm text-muted">
          Five people arrive at 9. They're picked for you tonight and gone at 9am.
        </p>
      </div>
    </section>
  )
}
