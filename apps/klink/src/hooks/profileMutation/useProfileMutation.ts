import { useCallback, useState } from "react";
import { useAuth } from "@kpaste-app/atproto-auth";
import type { Main } from "@klink-app/lexicon/types";
import { KLINK_COLLECTION, KLINK_RECORD_KEY } from "../../constants";
import { processImage } from "./processImage";
import { processBackground } from "./processBackground";
import { processLinks } from "./processLinks";
import type { ProfileForm, MutationConfig } from "./types";

/**
 * Shared hook for profile mutation operations (create/update).
 * Extracts common logic to eliminate duplication between useCreateProfile and useUpdateProfile.
 *
 * @param config - Configuration specifying the endpoint and error prefix
 * @returns Mutation function, loading state, and error state
 */
export function useProfileMutation(config: MutationConfig) {
  const { getClient, isAuthenticated, session } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutateProfile = useCallback(
    async (form: ProfileForm) => {
      const client = getClient();
      if (!client || !isAuthenticated || !session?.did) {
        setError("Not authenticated");
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        // Process all images/blobs
        const profileImage = await processImage(client, form.profileImage);
        const background = await processBackground(client, form.background);
        const links = await processLinks(client, form.links);

        // Create the profile record
        const record = {
          profileImage,
          name: form.name,
          location: form.location,
          bio: form.bio || "",
          background,
          theme: form.theme,
          links,
          logoMode: form.logoMode,
        } as Omit<Main, "$type">;

        const response = await client.post(config.endpoint, {
          input: {
            repo: session.did,
            collection: KLINK_COLLECTION,
            rkey: KLINK_RECORD_KEY,
            record: {
              $type: KLINK_COLLECTION,
              ...record,
            },
          },
        });

        if (response.ok) {
          return response.data;
        } else {
          console.error(`${config.errorPrefix} error:`, response.data);
          setError(
            `Failed to ${config.errorPrefix} profile: ${response.status}`,
          );
          return null;
        }
      } catch (err) {
        console.error(`Failed to ${config.errorPrefix} profile:`, err);
        setError(
          err instanceof Error
            ? err.message
            : `Failed to ${config.errorPrefix} profile`,
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    [
      getClient,
      isAuthenticated,
      session?.did,
      config.endpoint,
      config.errorPrefix,
    ],
  );

  return { mutateProfile, loading, error };
}
