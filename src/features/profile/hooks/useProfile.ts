import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  getMyProfile,
  getProfileOptions,
  saveBasics,
  saveCards,
  savePreferences,
  savePrompts,
  type MyProfile,
} from '../api/profile'
import { profileKeys } from '../api/keys'

export function useProfileOptions() {
  return useQuery({ queryKey: profileKeys.options, queryFn: getProfileOptions, staleTime: Infinity })
}

export function useMyProfile() {
  return useQuery({ queryKey: profileKeys.mine, queryFn: getMyProfile })
}

function useSave<T>(save: (body: T) => Promise<MyProfile>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: save,
    onSuccess: (profile) => queryClient.setQueryData(profileKeys.mine, profile),
  })
}

export const useSaveBasics = () => useSave(saveBasics)
export const useSavePrompts = () => useSave(savePrompts)
export const useSaveCards = () => useSave(saveCards)
export const useSavePreferences = () => useSave(savePreferences)
