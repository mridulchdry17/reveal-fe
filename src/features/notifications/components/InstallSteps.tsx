/** Add to Home Screen on an iPhone: the only way iOS lets a web app send notifications. */
export function InstallSteps() {
  return (
    <ol className="m-0 flex list-none flex-col gap-2 p-0">
      {[
        <>
          Tap <ShareGlyph /> <strong>Share</strong> in Safari's toolbar.
        </>,
        <>
          Choose <strong>Add to Home Screen</strong>. It shows up as <strong>Cards</strong>, so nobody can tell.
        </>,
        <>Open it from your Home Screen and turn notifications on here.</>,
      ].map((step, i) => (
        <li key={i} className="flex items-start gap-3 text-sm leading-[1.45]">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-text text-[12px] font-bold text-bg">
            {i + 1}
          </span>
          <span className="pt-0.5">{step}</span>
        </li>
      ))}
    </ol>
  )
}

function ShareGlyph() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="inline size-4 -translate-y-px fill-none stroke-current stroke-2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3v12M7 8l5-5 5 5M5 12v8h14v-8" />
    </svg>
  )
}
