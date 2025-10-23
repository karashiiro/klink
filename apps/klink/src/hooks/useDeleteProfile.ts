import { useCallback, useState } from "react";
import { useAuth } from "@kpaste-app/atproto-auth";

export function useDeleteProfile() {
  const { getClient, isAuthenticated, session } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteProfile = useCallback(async () => {
    const client = getClient();
    if (!client || !isAuthenticated || !session?.did) {
      setError("Not authenticated");
      return false;
    }

    if (
      !confirm(
        "Are you sure you want to delete your profile? This cannot be undone.",
      )
    ) {
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await client.post("com.atproto.repo.deleteRecord", {
        input: {
          repo: session.did,
          collection: "moe.karashiiro.klink.profile",
          rkey: "self", // literal:self means always use "self"
        },
      });

      if (response.ok) {
        return true;
      } else {
        console.error("Delete error:", response.data);
        setError(`Failed to delete profile: ${response.status}`);
        return false;
      }
    } catch (err) {
      console.error("Failed to delete profile:", err);
      setError(err instanceof Error ? err.message : "Failed to delete profile");
      return false;
    } finally {
      setLoading(false);
    }
  }, [getClient, isAuthenticated, session?.did]);

  return { deleteProfile, loading, error };
}
