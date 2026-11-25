import { Navigate, useLocation, useNavigate, useParams, useSearchParams } from 'react-router'

import { useObjectUrl } from '@/hooks/useObjectUrl'

import type { LikeRequest } from '../api/drops'
import { useDropPhoto } from '../hooks/useBlurredPhoto'
import { useLikeItem, useTonight } from '../hooks/useTonight'
import { dropErrorMessage } from '../utils/errorMessage'
import { likeOptions } from '../utils/likeOptions'
import { ScreenStatus } from './ScreenStatus'
import { SendLikeForm } from './SendLikeForm'

/** /app/tonight/:itemId/like: pick which answer of theirs to like and add a line. */
export function SendLikeScreen() {
  const { itemId = '' } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const drop = useTonight()
  const like = useLikeItem()
  const item = drop.data?.items.find((i) => i.id === itemId)
  const photo = useDropPhoto(item?.id, item?.profile.has_blurred_photo ?? false, item?.profile.right_guesses ?? 0)
  const photoUrl = useObjectUrl(photo.data)

  if (drop.isPending) return <ScreenStatus loading="Getting tonight's drop…" />
  if (drop.isError) {
    return <ScreenStatus error={dropErrorMessage(drop.error)} onRetry={() => void drop.refetch()} />
  }
  if (!item || (item.decision && !like.isSuccess)) return <Navigate to="/app/tonight" replace />

  const { profile } = item
  const cards = profile.guess_cards
  const guessed = cards.filter((c) => c.answer !== null).length

  const send = (body: LikeRequest) =>
    like.mutate(
      { itemId: item.id, body },
      {
        onSuccess: (result) => {
          if (result.matched) void navigate(result.match_id ? `/app/chats/${result.match_id}` : '/app/chats', { replace: true })
          else void navigate('/app/tonight', { replace: true })
        },
      },
    )

  return (
    <SendLikeForm
      nickname={profile.nickname}
      photoUrl={profile.has_blurred_photo ? photoUrl : null}
      score={guessed > 0 ? { right: profile.right_guesses, total: cards.length } : null}
      options={likeOptions(profile)}
      initial={params.get('answer')}
      sending={like.isPending}
      error={like.isError ? dropErrorMessage(like.error) : undefined}
      onSend={send}
      onCancel={() => {
        if (location.key === 'default') void navigate(`/app/tonight`, { replace: true })
        else void navigate(-1)
      }}
    />
  )
}
