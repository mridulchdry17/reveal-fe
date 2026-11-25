import { useEffect, useMemo, useRef } from 'react'

/**
 * An object URL for a fetched file, released when it changes or the screen closes.
 * Release waits a tick and is cancelled if the same URL comes straight back
 * (StrictMode's cleanup-then-rerun, quick remounts), so the image never points at a revoked URL.
 */
export function useObjectUrl(blob: Blob | undefined) {
  const url = useMemo(() => (blob ? URL.createObjectURL(blob) : null), [blob])
  const pending = useRef<{ url: string; timer: ReturnType<typeof setTimeout> } | null>(null)
  useEffect(() => {
    if (!url) return
    if (pending.current?.url === url) {
      clearTimeout(pending.current.timer)
      pending.current = null
    }
    return () => {
      pending.current = { url, timer: setTimeout(() => URL.revokeObjectURL(url), 0) }
    }
  }, [url])
  return url
}
