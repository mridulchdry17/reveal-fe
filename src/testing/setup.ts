import '@testing-library/jest-dom/vitest'

import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vitest'

import { server } from './server'

// jsdom has no object URLs; photo previews only need a string.
URL.createObjectURL ??= () => 'blob:test-preview'
URL.revokeObjectURL ??= () => {}

// jsdom's Blob has no stream(), which fetch needs to send a file in FormData.
if (!('stream' in Blob.prototype)) {
  Object.defineProperty(Blob.prototype, 'stream', {
    value(this: Blob) {
      return new ReadableStream<Uint8Array>({
        start: async (controller) => {
          controller.enqueue(new Uint8Array(await this.arrayBuffer()))
          controller.close()
        },
      })
    },
  })
}

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }))
afterEach(() => {
  server.resetHandlers()
  cleanup()
  localStorage.clear()
  delete window.google
})
afterAll(() => server.close())
