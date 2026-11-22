import { useCallback, useEffect, useRef, useState } from 'react'

export type Recording = { blob: Blob; seconds: number }
export type RecorderState =
  | { status: 'idle' }
  | { status: 'recording'; elapsed: number }
  | { status: 'recorded'; recording: Recording }
  | { status: 'denied' }
  | { status: 'unsupported' }

// Safari records MP4/AAC, Chrome and Android WebM/Opus. The first one the browser can do wins.
const TYPES = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm', 'audio/ogg;codecs=opus']

function canRecord(): boolean {
  return typeof window !== 'undefined' && 'MediaRecorder' in window && !!navigator.mediaDevices?.getUserMedia
}

/** The phone's microphone: record up to `maxSeconds`, stopping on its own at the limit. */
export function useRecorder(maxSeconds: number) {
  const [state, setState] = useState<RecorderState>(() =>
    canRecord() ? { status: 'idle' } : { status: 'unsupported' },
  )
  const recorder = useRef<MediaRecorder | null>(null)
  const stream = useRef<MediaStream | null>(null)
  const timer = useRef<number | null>(null)
  const startedAt = useRef(0)

  const release = useCallback(() => {
    if (timer.current !== null) window.clearInterval(timer.current)
    timer.current = null
    stream.current?.getTracks().forEach((track) => track.stop())
    stream.current = null
  }, [])

  const stop = useCallback(() => {
    if (recorder.current?.state === 'recording') recorder.current.stop()
  }, [])

  const start = useCallback(async () => {
    if (!canRecord()) return setState({ status: 'unsupported' })
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch {
      return setState({ status: 'denied' })
    }
    const mimeType = TYPES.find((type) => MediaRecorder.isTypeSupported(type))
    const rec = new MediaRecorder(stream.current, mimeType ? { mimeType } : undefined)
    const chunks: Blob[] = []
    rec.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data)
    }
    rec.onstop = () => {
      const seconds = Math.min(maxSeconds, Math.max(1, Math.round((Date.now() - startedAt.current) / 1000)))
      release()
      setState({ status: 'recorded', recording: { blob: new Blob(chunks, { type: rec.mimeType }), seconds } })
    }
    recorder.current = rec
    startedAt.current = Date.now()
    rec.start()
    setState({ status: 'recording', elapsed: 0 })
    timer.current = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt.current) / 1000)
      if (elapsed >= maxSeconds) stop()
      else setState({ status: 'recording', elapsed })
    }, 250)
  }, [maxSeconds, release, stop])

  const reset = useCallback(() => setState(canRecord() ? { status: 'idle' } : { status: 'unsupported' }), [])

  useEffect(
    () => () => {
      if (recorder.current?.state === 'recording') {
        recorder.current.onstop = null
        recorder.current.stop()
      }
      release()
    },
    [release],
  )

  return { state, start, stop, reset }
}
