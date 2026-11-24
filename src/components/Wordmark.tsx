/** "Reveal" with the italic accent, as in the mockups. */
export function Wordmark({ className = 'text-[30px]' }: { className?: string }) {
  return (
    <span className={`font-display leading-none ${className}`}>
      Re<em className="text-accent-text">veal</em>
    </span>
  )
}
