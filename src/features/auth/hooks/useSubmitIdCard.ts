import { useMutation, useQueryClient } from '@tanstack/react-query'

import { compressImage } from '@/utils/compressImage'

import { authKeys } from '../api/keys'
import { submitIdCard } from '../api/verification'

export function useSubmitIdCard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ selfie, idCard }: { selfie: File; idCard: File }) =>
      submitIdCard({
        selfie: await compressImage(selfie),
        idCard: await compressImage(idCard),
      }),
    onSuccess: (status) => {
      queryClient.setQueryData(authKeys.verification, status)
    },
  })
}
