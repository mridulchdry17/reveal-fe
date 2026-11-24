import { CheckIcon } from '@/components/icons'
import { PushDeniedError } from '@/lib/push'
import { isInAppBrowser, isStandalone } from '@/lib/pwa'

import { useInstallPrompt, usePush } from '../hooks/usePush'
import { InstallSteps } from './InstallSteps'

/** The You-tab switch for notifications on this phone, plus how to install if needed. */
export function NotificationsCard() {
  const { state, enable, disable } = usePush()
  const installer = useInstallPrompt()
  if (state === 'loading' || state === 'disabled') return null

  const failed = enable.error && !(enable.error instanceof PushDeniedError)

  return (
    <section
      id="notifications"
      aria-labelledby="notifications-title"
      className="flex flex-col gap-3 rounded-[28px] border border-border bg-surface p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 id="notifications-title" className="m-0 font-display text-[28px] leading-none font-normal">
            {state === 'on' ? (
              <>
                Pings are <em className="text-accent-text">on</em>
              </>
            ) : (
              <>
                Get a ping at <em className="text-accent-text">9.</em>
              </>
            )}
          </h2>
          <p className="m-0 text-sm leading-[1.45] text-muted">
            When the drop lands, when someone likes you, and when a match writes. Your lock screen only ever says
            “Cards”: no names, no messages.
          </p>
        </div>
        {state === 'on' && (
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-open-bg text-open">
            <CheckIcon className="size-5" />
          </span>
        )}
      </div>

      {state === 'install' && (
        <div className="flex flex-col gap-3 rounded-[20px] bg-bg p-4">
          <p className="m-0 text-sm font-semibold">On iPhone, add Reveal to your Home Screen first.</p>
          <InstallSteps />
        </div>
      )}

      {state === 'unavailable' && (
        <p className="m-0 rounded-[20px] bg-bg p-4 text-sm leading-[1.45]">
          {isInAppBrowser()
            ? 'This in-app browser can’t send notifications. Open Reveal in Chrome or Safari.'
            : 'This browser can’t send notifications. Chrome on Android, or Safari on iPhone after Add to Home Screen, can.'}
        </p>
      )}

      {state === 'denied' && (
        <p role="status" className="m-0 rounded-[20px] bg-locked-bg p-4 text-sm leading-[1.45] text-text">
          Notifications are blocked for Reveal. Allow them in your browser’s site settings, then come back here.
        </p>
      )}

      {state === 'off' && (
        <button
          type="button"
          onClick={() => enable.mutate()}
          disabled={enable.isPending}
          className="h-12 rounded-full border-0 bg-text text-[15px] font-bold text-bg disabled:opacity-60"
        >
          {enable.isPending ? 'Asking your phone…' : 'Turn on notifications'}
        </button>
      )}

      {state === 'on' && (
        <button
          type="button"
          onClick={() => disable.mutate()}
          disabled={disable.isPending}
          className="h-11 w-fit rounded-full border-[1.5px] border-border-strong bg-transparent px-5 text-sm font-semibold text-text disabled:opacity-60"
        >
          {disable.isPending ? 'Turning off…' : 'Turn off on this phone'}
        </button>
      )}

      {failed && (
        <p role="alert" className="m-0 text-[13px] font-medium text-accent-text">
          Couldn’t turn them on. Check your connection and try again.
        </p>
      )}

      {installer.available && !isStandalone() && (
        <button
          type="button"
          onClick={() => void installer.install()}
          className="h-11 w-fit rounded-full border-[1.5px] border-border-strong bg-transparent px-5 text-sm font-semibold text-text"
        >
          Add to Home Screen
        </button>
      )}
    </section>
  )
}
