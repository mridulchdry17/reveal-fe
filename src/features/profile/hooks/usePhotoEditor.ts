import { useRef, type ChangeEvent } from 'react'

import { useMyPhoto, useMyProfile, useRemovePhoto, useUploadPhoto } from './useProfile'
import { useObjectUrl } from './useObjectUrl'

/**
 * Add, change or remove my photo: the saved photo as a blob URL, plus handlers for a hidden
 * file input. Shared by the You tab's photo card and the photo setup step.
 */
export function usePhotoEditor() {
  const profile = useMyProfile()
  const hasPhoto = profile.data?.has_photo ?? false
  const photo = useMyPhoto(hasPhoto)
  const upload = useUploadPhoto()
  const remove = useRemovePhoto()
  const input = useRef<HTMLInputElement>(null)
  const url = useObjectUrl(hasPhoto ? photo.data : null)

  const onPick = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = '' // picking the same file again should still upload
    if (file) {
      remove.reset()
      upload.mutate(file)
    }
  }

  return {
    ready: Boolean(profile.data),
    hasPhoto,
    url,
    loading: hasPhoto && photo.isPending,
    input,
    onPick,
    openPicker: () => input.current?.click(),
    removePhoto: () => {
      upload.reset()
      remove.mutate()
    },
    uploading: upload.isPending,
    busy: upload.isPending || remove.isPending,
    error: upload.error ?? remove.error,
  }
}
