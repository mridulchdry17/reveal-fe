/** The answer a like was about, with whose it was: "YOUR HOT TAKE" + the line. */
export function LikedAnswer({ kicker, answer }: { kicker: string; answer: string }) {
  return (
    <div className="rounded-[14px] bg-bg px-3.5 py-3">
      <p className="m-0 text-[10px] font-bold tracking-[0.14em] text-muted uppercase">{kicker}</p>
      <p className="m-0 mt-1 font-display text-[17px] leading-[1.25] italic">“{answer}”</p>
    </div>
  )
}
