import { useEffect, useState } from 'react'

/** True once every element with these ids has scrolled off screen. False where IntersectionObserver is missing. */
export function useOffScreen(ids: readonly string[]): boolean {
  const [offScreen, setOffScreen] = useState(false)
  const key = ids.join(' ')

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const elements = key
      .split(' ')
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null)
    const visible = new Map<Element, boolean>()
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => visible.set(entry.target, entry.isIntersecting))
      setOffScreen(elements.every((element) => visible.get(element) === false))
    })
    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [key])

  return offScreen
}
