import { useObjectUrl } from '@/hooks/useObjectUrl'

import { useMyPhoto, useMyProfile } from '../hooks/useProfile'

/** My own photo filling a round frame (the chat's Full picture sheet), or "You" without one. */
export function MyPhotoAvatar() {
  const profile = useMyProfile()
  const photo = useMyPhoto(profile.data?.has_photo ?? false)
  const url = useObjectUrl(photo.data)
  if (!url) return <>You</>
  return <img src={url} alt="Your photo" draggable={false} className="absolute inset-0 size-full object-cover" />
}
