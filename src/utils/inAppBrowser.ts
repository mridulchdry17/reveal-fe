/**
 * Instagram, Facebook, Snapchat and similar apps open links in their own browser.
 * Google refuses to sign in there, and Add to Home Screen and push don't work, so we
 * ask people to open Reveal in Chrome or Safari first. User-agent checks are the only
 * way to tell; keep them to this one place.
 */
const IN_APP = /Instagram|FBAN|FBAV|FB_IAB|Snapchat|LinkedInApp|Line\//i

export function isInAppBrowser(userAgent: string = navigator.userAgent): boolean {
  return IN_APP.test(userAgent)
}
