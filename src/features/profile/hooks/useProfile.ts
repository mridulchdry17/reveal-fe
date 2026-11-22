import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { compressImage } from '@/utils/compressImage'

import {
  getMyPhoto,
  getMyProfile,
  getProfileOptions,
  removeContact,
  removePhoto,
  saveBasics,
  saveCards,
  saveContact,
  savePreferences,
  savePrompts,
  uploadPhoto,
  type MyProfile,
} from '../api/profile'
import { profileKeys } from '../api/keys'

export function useProfileOptions() {
  return useQuery({ queryKey: profileKeys.options, queryFn: getProfileOptions, staleTime: Infinity })
}

export function useMyProfile() {
  return useQuery({ queryKey: profileKeys.mine, queryFn: getMyProfile })
}

function useSave<T = void>(save: (body: T) => Promise<MyProfile>) {
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
export const useSaveContact = () => useSave(saveContact)
export const useRemoveContact = () => useSave(removeContact)

/** My photo as a Blob, only once the profile says there is one. */
export function useMyPhoto(hasPhoto: boolean) {
  return useQuery({
    queryKey: profileKeys.photo,
    queryFn: getMyPhoto,
    enabled: hasPhoto,
    staleTime: Infinity,
  })
}

/** Shrinks the photo on the phone (drops GPS too), then uploads it. */
export function useUploadPhoto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (file: File) => uploadPhoto(await compressImage(file)),
    onSuccess: (profile) => {
      queryClient.setQueryData(profileKeys.mine, profile)
      void queryClient.invalidateQueries({ queryKey: profileKeys.photo })
    },
  })
}

export function useRemovePhoto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: removePhoto,
    onSuccess: (profile) => {
      queryClient.setQueryData(profileKeys.mine, profile)
      queryClient.removeQueries({ queryKey: profileKeys.photo })
    },
  })
}
