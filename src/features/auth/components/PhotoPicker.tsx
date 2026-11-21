import { useEffect, useId, useMemo, type ReactNode } from 'react'

type Props = {
  file: File | null
  onChange: (file: File) => void
  /** Which camera the phone opens: 'user' = front (selfie), 'environment' = back. */
  capture: 'user' | 'environment'
  /** Accessible name for the file input, e.g. "Take selfie". */
  label: string
  /** Shape of the frame: an oval for faces, a card shape for the ID. */
  shape: 'oval' | 'card'
  placeholder: ReactNode
}

/** Tap the frame to open the camera; shows the photo once taken. */
export function PhotoPicker({ file, onChange, capture, label, shape, placeholder }: Props) {
  const id = useId()
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview)
    },
    [preview],
  )

  const frame =
    shape === 'oval'
      ? 'h-[196px] w-[150px] rounded-[50%]'
      : 'aspect-[1.586] w-full max-w-[300px] rounded-xl'

  return (
    <label
      htmlFor={id}
      className="flex h-[280px] cursor-pointer items-center justify-center rounded-[20px] border border-border bg-surface-2 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent"
    >
      <input
        id={id}
        type="file"
        accept="image/*"
        capture={capture}
        aria-label={label}
        className="sr-only"
        onChange={(event) => {
          const picked = event.target.files?.[0]
          if (picked) onChange(picked)
          event.target.value = ''
        }}
      />
      {preview ? (
        <img src={preview} alt="" className={`${frame} object-cover`} />
      ) : (
        <span
          className={`${frame} flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border-strong p-4 text-center text-sm text-muted`}
        >
          {placeholder}
        </span>
      )}
    </label>
  )
}
