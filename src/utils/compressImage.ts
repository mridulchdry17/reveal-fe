/**
 * Shrink a camera photo before upload: longest side ≤ 1600px, JPEG.
 * Re-encoding through a canvas also drops EXIF data, including the GPS location
 * phones put in photos. Falls back to the original file where the browser can't
 * decode it (old browsers, tests).
 */
export async function compressImage(file: Blob, maxSide = 1600, quality = 0.85): Promise<Blob> {
  if (typeof createImageBitmap !== 'function') return file
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    const context = canvas.getContext('2d')
    if (!context) return file
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', quality),
    )
    return blob ?? file
  } catch {
    return file
  }
}
