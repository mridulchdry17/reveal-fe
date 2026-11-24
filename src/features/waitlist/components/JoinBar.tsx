/** Phone-only bar that takes you back to the sign-up form. */
export function JoinBar() {
  return (
    <div className="rise fixed inset-x-0 bottom-0 z-20 border-t border-border bg-bg/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden">
      <a
        href="#join"
        className="flex h-[52px] items-center justify-center gap-2 rounded-full bg-accent text-base font-bold text-on-accent no-underline active:scale-[0.97]"
      >
        Save my spot <span aria-hidden="true">→</span>
      </a>
    </div>
  )
}
