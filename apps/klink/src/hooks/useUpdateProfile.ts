import { ATPROTO_ENDPOINTS } from "../constants";
import { useProfileMutation, type ProfileForm } from "./profileMutation";

// Re-export ProfileForm as UpdateProfileForm for backwards compatibility
export type UpdateProfileForm = ProfileForm;

/**
 * Hook for updating an existing profile.
 * Thin wrapper around useProfileMutation configured for updates.
 */
export function useUpdateProfile() {
  const { mutateProfile, loading, error } = useProfileMutation({
    endpoint: ATPROTO_ENDPOINTS.PUT_RECORD,
    errorPrefix: "update",
  });

  return { updateProfile: mutateProfile, loading, error };
}

export type UseUpdateProfileReturn = ReturnType<typeof useUpdateProfile>;
