import { useEffect, useMemo } from 'react'

/** A blob URL for a Blob, revoked when the blob changes or the component goes away. */
export function useObjectUrl(blob: Blob | undefined | null) {
  const url = useMemo(() => (blob ? URL.createObjectURL(blob) : null), [blob])
  useEffect(
    () => () => {
      if (url) URL.revokeObjectURL(url)
    },
    [url],
  )
  return url
}
