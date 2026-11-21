import { describe, expect, it } from 'vitest'

import { isInAppBrowser } from './inAppBrowser'

describe('isInAppBrowser', () => {
  it('spots Instagram and Facebook', () => {
    expect(isInAppBrowser('Mozilla/5.0 (iPhone) Mobile/15E148 Instagram 312.0.0')).toBe(true)
    expect(isInAppBrowser('Mozilla/5.0 (Linux; Android 14) [FB_IAB/FB4A;FBAV/450.0]')).toBe(true)
  })

  it('leaves Safari and Chrome alone', () => {
    expect(isInAppBrowser('Mozilla/5.0 (iPhone) Version/18.0 Mobile/15E148 Safari/604.1')).toBe(false)
    expect(isInAppBrowser('Mozilla/5.0 (Linux; Android 14) Chrome/131.0 Mobile Safari/537.36')).toBe(false)
  })
})
