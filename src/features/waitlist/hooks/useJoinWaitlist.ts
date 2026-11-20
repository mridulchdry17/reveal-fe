import { useMutation } from '@tanstack/react-query'

import { joinWaitlist } from '../api/joinWaitlist'

export function useJoinWaitlist() {
  return useMutation({ mutationFn: joinWaitlist })
}
