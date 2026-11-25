import { Navigate, useNavigate, useParams } from 'react-router'

import { useObjectUrl } from '@/hooks/useObjectUrl'

import { useDropPhoto } from '../hooks/useBlurredPhoto'
import { useDropGuessed } from '../hooks/useGuessed'
import { usePassItem, useTonight } from '../hooks/useTonight'
import type { GuessGameSlot } from '../types/guessSlot'
import { dropErrorMessage } from '../utils/errorMessage'
import { aboutLine } from '../utils/likeOptions'
import { PhotoBackdrop } from './PhotoBackdrop'
import { ScreenStatus } from './ScreenStatus'

type Props = {
  /** The guess game, composed in from the guess feature. */
  game: GuessGameSlot
}

/** /app/tonight/:itemId: guess one person's cards over their blurred photo, then like or pass. */
export function DropGuessScreen({ game }: Props) {
  const { itemId = '' } = useParams()
  const navigate = useNavigate()
  const drop = useTonight()
  const pass = usePassItem()
  const guessed = useDropGuessed()
  const item = drop.data?.items.find((i) => i.id === itemId)
  const photo = useDropPhoto(item?.id, item?.profile.has_blurred_photo ?? false, item?.profile.right_guesses ?? 0)
  const photoUrl = useObjectUrl(photo.data)

  if (drop.isPending) return <ScreenStatus loading="Getting tonight's drop…" />
  if (drop.isError) {
    return <ScreenStatus error={dropErrorMessage(drop.error)} onRetry={() => void drop.refetch()} />
  }
  // Gone from the drop, or already answered: back to whoever is next.
  if (!item || item.decision) return <Navigate to="/app/tonight" replace />

  const { profile } = item
  return game({
    nickname: profile.nickname,
    about: aboutLine(profile),
    cards: profile.guess_cards,
    hintUsed: drop.data.hint_used,
    reward: profile.has_blurred_photo ? 'blur' : null,
    backdrop: <PhotoBackdrop url={profile.has_blurred_photo ? photoUrl : null} />,
    like: {
      label: 'Like',
      cta: 'Like an answer',
      body: 'Like one of their answers to say hi. If they like you back, you match.',
    },
    backLabel: 'Back to the drop',
    busy: pass.isPending,
    error: pass.isError ? dropErrorMessage(pass.error) : undefined,
    onBack: () => void navigate('/app/tonight'),
    onPass: () => pass.mutate({ itemId: item.id }, { onSuccess: () => void navigate('/app/tonight', { replace: true }) }),
    onLike: () => void navigate(`/app/tonight/${item.id}/like`),
    onGuessed: (cardId, result) => guessed.onGuessed(item.id, cardId, result),
    onHinted: (cardId, struck) => guessed.onHinted(item.id, cardId, struck),
    onHintGone: guessed.onHintGone,
    onStale: guessed.onStale,
  })
}
