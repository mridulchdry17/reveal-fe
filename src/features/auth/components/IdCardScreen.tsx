import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'

import { AlertIcon, CameraIcon, CheckIcon, IdCardIcon } from '@/components/icons'
import { ScreenHeader } from '@/components/ScreenHeader'

import { useMe } from '../hooks/useMe'
import { useSubmitIdCard } from '../hooks/useSubmitIdCard'
import { useVerificationStatus } from '../hooks/useVerificationStatus'
import { uploadErrorMessage } from '../utils/errorMessage'
import { PhotoPicker } from './PhotoPicker'
import { StepHeader } from './StepHeader'

const backClass =
  '-ml-2 flex h-11 items-center rounded-full bg-transparent px-2 text-sm font-semibold text-muted'
const primaryClass =
  'flex h-[54px] w-full items-center justify-center gap-2.5 rounded-full border-0 bg-accent text-base font-bold text-on-accent disabled:opacity-60'

/** ID card photo, then a selfie, then send both for a person to check. */
export function IdCardScreen() {
  const me = useMe()
  const status = useVerificationStatus()
  const submit = useSubmitIdCard()
  const navigate = useNavigate()
  const [step, setStep] = useState<'id' | 'selfie'>('id')
  const [idCard, setIdCard] = useState<File | null>(null)
  const [selfie, setSelfie] = useState<File | null>(null)

  if (me.data?.verified) return <Navigate to="/app" replace />
  if (status.data?.status === 'pending') return <Navigate to="/verify/pending" replace />

  const send = () => {
    if (!idCard || !selfie) return
    submit.mutate({ idCard, selfie }, { onSuccess: () => navigate('/verify/pending') })
  }

  return (
    <div className="min-h-dvh bg-bg text-text">
      <div className="mx-auto flex min-h-dvh max-w-md flex-col gap-5 px-5 pt-3 pb-8">
        {step === 'id' ? (
          <>
            <StepHeader
              step={1}
              left={
                <Link to="/verify" className={backClass}>
                  Back
                </Link>
              }
            />
            <div className="rise">
              <ScreenHeader
                kicker="ID card"
                title="Snap your"
                accent="college ID"
                subtitle="The front side, with your photo and name easy to read."
              />
            </div>
            <PhotoPicker
              file={idCard}
              onChange={setIdCard}
              capture="environment"
              label="Take a photo of your ID card"
              shape="card"
              placeholder={
                <>
                  <IdCardIcon className="size-8" />
                  Tap to take a photo
                </>
              }
            />
            <ul className="m-0 flex list-none flex-col gap-2.5 rounded-[24px] border border-border bg-surface p-4 text-sm">
              {[
                'Lay it flat in good light',
                'No glare over your photo or name',
                'Whole card in the frame',
              ].map((tip) => (
                <li key={tip} className="flex items-center gap-2.5">
                  <CheckIcon className="size-4 shrink-0 text-open" />
                  {tip}
                </li>
              ))}
            </ul>
            <div className="mt-auto flex flex-col gap-3">
              {idCard && (
                <button type="button" onClick={() => setStep('selfie')} className={primaryClass}>
                  Continue
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            <StepHeader
              step={2}
              left={
                <button type="button" onClick={() => setStep('id')} className={backClass}>
                  Back
                </button>
              }
            />
            <div className="rise">
              <ScreenHeader
                kicker="Selfie"
                title="One quick"
                accent="selfie"
                subtitle="So a person can match your face to your ID, and nobody signs up as someone else."
              />
            </div>
            <PhotoPicker
              file={selfie}
              onChange={setSelfie}
              capture="user"
              label="Take selfie"
              shape="oval"
              placeholder={
                <>
                  <CameraIcon className="size-8" />
                  Tap to take a selfie
                </>
              }
            />
            <ul className="m-0 flex list-none flex-col gap-2.5 rounded-[24px] border border-border bg-surface p-4 text-sm">
              {['Face the camera in good light', 'No sunglasses or mask', 'Just you in the photo'].map(
                (tip) => (
                  <li key={tip} className="flex items-center gap-2.5">
                    <CheckIcon className="size-4 shrink-0 text-open" />
                    {tip}
                  </li>
                ),
              )}
            </ul>
            <p className="m-0 text-[13px] leading-5 text-muted">
              Your ID and selfie are only for this check. They're deleted after review and nobody on Reveal
              ever sees them.
            </p>
            <div className="mt-auto flex flex-col gap-3">
              {submit.isError && (
                <p role="alert" className="m-0 flex gap-2 text-sm text-accent-text">
                  <AlertIcon className="mt-0.5 size-4 shrink-0" />
                  {uploadErrorMessage(submit.error)}
                </p>
              )}
              {selfie && (
                <button type="button" onClick={send} disabled={submit.isPending} className={primaryClass}>
                  {submit.isPending ? 'Sending…' : 'Send for review'}
                </button>
              )}
              {!selfie && (
                <p className="m-0 text-center text-[13px] text-muted">
                  Tap the frame to open your front camera.
                </p>
              )}
              {selfie && !submit.isPending && (
                <p className="m-0 text-center text-[13px] text-muted">
                  Not happy with it? Tap the photo to retake.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
