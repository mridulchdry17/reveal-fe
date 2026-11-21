import { afterEach, describe, expect, it } from 'vitest'

import { loadGoogleIdentity } from './googleIdentity'

describe('loadGoogleIdentity', () => {
  afterEach(() => {
    document.head.querySelectorAll('script[src*="accounts.google.com"]').forEach((s) => s.remove())
  })

  it('gives up when the script never arrives', async () => {
    // jsdom never loads external scripts, like a network that blocks Google.
    await expect(loadGoogleIdentity(20)).rejects.toThrow('took too long')
  })

  it('uses Google when it is already on the page', async () => {
    const id = { initialize: () => {}, renderButton: () => {}, disableAutoSelect: () => {} }
    window.google = { accounts: { id } }

    await expect(loadGoogleIdentity()).resolves.toBe(id)
  })
})
