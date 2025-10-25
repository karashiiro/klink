import { useCallback, useState } from "react";
import { useAuth } from "@kpaste-app/atproto-auth";
import type { Main } from "@klink-app/lexicon/types";

export interface CreateProfileForm {
  profileImage?: { type: "url" | "blob"; value: string | Blob };
  name?: string;
  location?: string;
  bio: string;
  background:
    | { type: "color"; value: string }
    | {
        type: "url" | "blob";
        value: string | Blob;
        objectFit?: "cover" | "contain" | "fill" | "scale-down" | "none";
      };
  links: Array<{
    icon?: { type: "url" | "blob"; value: string | Blob };
    label: string;
    href: string;
  }>;
}

export function useCreateProfile() {
  const { getClient, isAuthenticated, session } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createProfile = useCallback(
    async (form: CreateProfileForm) => {
      const client = getClient();
      if (!client || !isAuthenticated || !session?.did) {
        setError("Not authenticated");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Helper to upload blob if needed
        const processImage = async (image?: {
          type: "url" | "blob";
          value: string | Blob;
        }) => {
          if (!image) return undefined;
          if (image.type === "url") {
            return {
              type: "url" as const,
              value: image.value as `${string}:${string}`,
            };
          }
          // Upload blob
          const blobResponse = await client.post(
            "com.atproto.repo.uploadBlob",
            {
              input: image.value as Blob,
            },
          );
          if (!blobResponse.ok) {
            throw new Error(`Failed to upload image: ${blobResponse.status}`);
          }
          return { type: "blob" as const, value: blobResponse.data.blob };
        };

        // Process all images/blobs
        const profileImage = await processImage(form.profileImage);

        const background =
          form.background.type === "color"
            ? { type: "color" as const, value: form.background.value as string }
            : (await processImage(
                form.background as {
                  type: "url" | "blob";
                  value: string | Blob;
                },
              ))!;

        const links = await Promise.all(
          form.links.map(async (link) => ({
            icon: await processImage(link.icon),
            label: link.label,
            href: link.href as `${string}:${string}`,
          })),
        );

        // Create the profile record
        const record = {
          profileImage,
          name: form.name,
          location: form.location,
          bio: form.bio || "",
          background,
          links,
        } as Omit<Main, "$type">;

        const createResponse = await client.post(
          "com.atproto.repo.createRecord",
          {
            input: {
              repo: session.did,
              collection: "moe.karashiiro.klink.profile",
              rkey: "self", // literal:self means always use "self"
              record: {
                $type: "moe.karashiiro.klink.profile",
                ...record,
              },
            },
          },
        );

        if (createResponse.ok) {
          return createResponse.data;
        } else {
          console.error("Create error:", createResponse.data);
          setError(`Failed to create profile: ${createResponse.status}`);
          return null;
        }
      } catch (err) {
        console.error("Failed to create profile:", err);
        setError(
          err instanceof Error ? err.message : "Failed to create profile",
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    [getClient, isAuthenticated, session?.did],
  );

  return { createProfile, loading, error };
}

export type UseCreateProfileReturn = ReturnType<typeof useCreateProfile>;
