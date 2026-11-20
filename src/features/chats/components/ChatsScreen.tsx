import { ScreenHeader } from '@/components/ScreenHeader'

export function ChatsScreen() {
  return (
    <section>
      <ScreenHeader title="Chats" subtitle="Most alive on top. Quiet chats fade after 7 days." />
      <p className="text-sm text-muted">No matches yet. Like a line in tonight's drop to start.</p>
    </section>
  )
}
