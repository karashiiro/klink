import { ATPROTO_ENDPOINTS } from "../constants";
import { useProfileMutation, type ProfileForm } from "./profileMutation";

// Re-export ProfileForm as CreateProfileForm for backwards compatibility
export type CreateProfileForm = ProfileForm;

/**
 * Hook for creating a new profile.
 * Thin wrapper around useProfileMutation configured for creation.
 */
export function useCreateProfile() {
  const { mutateProfile, loading, error } = useProfileMutation({
    endpoint: ATPROTO_ENDPOINTS.CREATE_RECORD,
    errorPrefix: "create",
  });

  return { createProfile: mutateProfile, loading, error };
}

export type UseCreateProfileReturn = ReturnType<typeof useCreateProfile>;
