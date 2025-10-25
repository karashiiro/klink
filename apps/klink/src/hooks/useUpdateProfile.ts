import { useCallback, useState } from "react";
import { useAuth } from "@kpaste-app/atproto-auth";
import type { Main } from "@klink-app/lexicon/types";

export interface UpdateProfileForm {
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

export function useUpdateProfile() {
  const { getClient, isAuthenticated, session } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProfile = useCallback(
    async (form: UpdateProfileForm) => {
      const client = getClient();
      if (!client || !isAuthenticated || !session?.did) {
        setError("Not authenticated");
        return null;
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
          // Check if this is already an ATProto blob reference (has ref.$link)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if ((image.value as any)?.ref?.$link) {
            // Already a blob reference, return as-is
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return image as any;
          }
          // Upload new blob
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

        // Create the updated profile record
        const record = {
          profileImage,
          name: form.name,
          location: form.location,
          bio: form.bio || "",
          background,
          links,
        } as Omit<Main, "$type">;

        // Use putRecord to update the existing profile (always at "self")
        const updateResponse = await client.post("com.atproto.repo.putRecord", {
          input: {
            repo: session.did,
            collection: "moe.karashiiro.klink.profile",
            rkey: "self", // literal:self means always use "self"
            record: {
              $type: "moe.karashiiro.klink.profile",
              ...record,
            },
          },
        });

        if (updateResponse.ok) {
          return updateResponse.data;
        } else {
          console.error("Update error:", updateResponse.data);
          setError(`Failed to update profile: ${updateResponse.status}`);
          return null;
        }
      } catch (err) {
        console.error("Failed to update profile:", err);
        setError(
          err instanceof Error ? err.message : "Failed to update profile",
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    [getClient, isAuthenticated, session?.did],
  );

  return { updateProfile, loading, error };
}

export type UseUpdateProfileReturn = ReturnType<typeof useUpdateProfile>;
