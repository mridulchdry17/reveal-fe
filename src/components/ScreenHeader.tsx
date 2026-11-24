type Props = { title: string; subtitle?: string }

export function ScreenHeader({ title, subtitle }: Props) {
  return (
    <header className="flex flex-col gap-0.5 pb-3">
      <h1 className="m-0 font-display text-[40px] leading-none font-normal tracking-[-0.01em]">{title}</h1>
      {subtitle && <p className="m-0 text-xs text-muted">{subtitle}</p>}
    </header>
  )
}
