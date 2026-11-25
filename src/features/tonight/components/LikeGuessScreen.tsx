import { Navigate, useNavigate, useParams } from 'react-router'

import { useObjectUrl } from '@/hooks/useObjectUrl'

import { useLikePhoto } from '../hooks/useBlurredPhoto'
import { useLikeGuessed } from '../hooks/useGuessed'
import { useLikes, useMatchBack, usePassLike } from '../hooks/useLikes'
import { useTonight } from '../hooks/useTonight'
import type { GuessGameSlot } from '../types/guessSlot'
import { dropErrorMessage } from '../utils/errorMessage'
import { aboutLine } from '../utils/likeOptions'
import { PhotoBackdrop } from './PhotoBackdrop'
import { ScreenStatus } from './ScreenStatus'

type Props = {
  /** The guess game, composed in from the guess feature. */
  game: GuessGameSlot
}

/** /app/likes/:likeId: "Guess first" on someone who liked me, then match or pass. */
export function LikeGuessScreen({ game }: Props) {
  const { likeId = '' } = useParams()
  const navigate = useNavigate()
  const likes = useLikes()
  // The hint is one per night for the drop and likes alike; the drop says whether it's gone.
  const hintUsed = useTonight().data?.hint_used ?? false
  const matchBack = useMatchBack()
  const pass = usePassLike()
  const guessed = useLikeGuessed()
  const like = likes.data?.find((l) => l.id === likeId)
  const photo = useLikePhoto(likeId, like?.profile.has_blurred_photo ?? false, like?.profile.right_guesses ?? 0)
  const photoUrl = useObjectUrl(photo.data)

  if (likes.isPending) return <ScreenStatus loading="Getting your likes…" />
  if (likes.isError) {
    return <ScreenStatus error={dropErrorMessage(likes.error)} onRetry={() => void likes.refetch()} />
  }
  if (!like) return <Navigate to="/app/likes" replace />

  const { profile } = like
  const failed = matchBack.error ?? pass.error
  return game({
    nickname: profile.nickname,
    about: aboutLine(profile),
    cards: profile.guess_cards,
    hintUsed,
    reward: profile.has_blurred_photo ? 'blur' : null,
    backdrop: <PhotoBackdrop url={profile.has_blurred_photo ? photoUrl : null} />,
    like: {
      label: 'Match with',
      cta: 'Match',
      body: 'They already liked one of your answers. Match and you can start talking.',
    },
    backLabel: 'Back to likes',
    busy: matchBack.isPending || pass.isPending,
    error: failed ? dropErrorMessage(failed) : undefined,
    onBack: () => void navigate('/app/likes'),
    onPass: () => pass.mutate(like.id, { onSuccess: () => void navigate('/app/likes', { replace: true }) }),
    onLike: () =>
      matchBack.mutate(like.id, {
        onSuccess: (result) => void navigate(`/app/chats/${result.match_id}`, { replace: true }),
      }),
    onGuessed: (cardId, result) => guessed.onGuessed(like.id, cardId, result),
    onHinted: (cardId, struck) => guessed.onHinted(like.id, cardId, struck),
    onHintGone: guessed.onHintGone,
    onStale: guessed.onStale,
  })
}
