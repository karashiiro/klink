import { useCallback, useState, useEffect } from "react";
import { resolveUser, getRecord } from "@kpaste-app/atproto-utils";
import type { Main } from "@klink-app/lexicon/types";

export interface ProfileRecord {
  uri: string;
  cid: string;
  value: Main;
}

export function useReadProfile(handle?: string) {
  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async (targetHandle: string) => {
    setLoading(true);
    setError(null);

    try {
      // Resolve handle to DID and PDS
      const { did, pdsUrl } = await resolveUser(targetHandle);

      // Get the profile record (always at "self")
      const record = await getRecord(
        pdsUrl,
        "moe.karashiiro.klink.profile",
        did,
        "self",
      );

      const profileData: ProfileRecord = {
        uri: record.uri,
        cid: record.cid ?? "",
        value: record.value as Main,
      };
      setProfile(profileData);
      return profileData;
    } catch (err) {
      console.error("Failed to fetch profile:", err);

      // Check if it's a 404 (profile doesn't exist)
      if (
        err &&
        typeof err === "object" &&
        "status" in err &&
        err.status === 404
      ) {
        setProfile(null);
        return null;
      }

      setError(err instanceof Error ? err.message : "Failed to fetch profile");
      setProfile(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch when handle changes
  useEffect(() => {
    if (handle) {
      fetchProfile(handle);
    }
  }, [handle, fetchProfile]);

  return { profile, loading, error, refetch: fetchProfile };
}
