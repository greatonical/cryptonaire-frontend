"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchProfile,
  updateProfile,
  // type ProfileDTO,
  type Profile,
} from "../services/profile.client";

export function useProfile() {
  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["profile", "me"],
    queryFn: fetchProfile,
    staleTime: 60_000,
  });

  const { mutateAsync, isPending: isUpdating } = useMutation({
    mutationKey: ["profile", "update"],
    // mutationFn: (patch: ProfileDTO) => updateProfile(patch),
    onSuccess: (next) => {
      qc.setQueryData<Profile>(["profile", "me"], (prev) => ({ ...(prev ?? {} as any), ...(next as any) }));
    },
  });

  return {
    data,
    isLoading,
    error: error as Error | null,
    isUpdating,
    update: mutateAsync,
  };
}