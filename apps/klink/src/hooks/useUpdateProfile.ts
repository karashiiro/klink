import { useCallback, useState } from "react";
import { useAuth } from "@kpaste-app/atproto-auth";
import type { Main } from "@klink-app/lexicon/types";
import type { Blob as AtProtoBlob } from "@atcute/lexicons";

export interface UpdateProfileForm {
  profileImage?:
    | { type: "url" | "blob"; value: string | Blob | AtProtoBlob }
    | Main["profileImage"];
  name?: string;
  location?: string;
  bio: string;
  background:
    | { type: "color"; value: string }
    | {
        type: "url" | "blob";
        value: string | Blob | AtProtoBlob;
        objectFit?: "cover" | "contain" | "fill" | "scale-down" | "none";
      }
    | { type: "shader"; value: string | Blob | AtProtoBlob }
    | Main["background"];
  theme: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily?: string;
    stylesheet?: string;
  };
  links: Array<{
    icon?:
      | { type: "url" | "blob"; value: string | Blob | AtProtoBlob }
      | Main["links"][0]["icon"];
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
        const processImage = async (
          image?:
            | { type: "url" | "blob"; value: string | Blob | AtProtoBlob }
            | Main["profileImage"]
            | Main["links"][0]["icon"],
          isBackground = false,
        ) => {
          if (!image) return undefined;
          // If image already has $type, it's an ATProto type - return as-is
          if (typeof image === "object" && "$type" in image) {
            return image;
          }
          if (image.type === "url") {
            if (isBackground) {
              return {
                type: "url" as const,
                value: image.value as `${string}:${string}`,
                $type: "moe.karashiiro.klink.profile#urlBackground" as const,
              };
            } else {
              return {
                type: "url" as const,
                value: image.value as `${string}:${string}`,
                $type: "moe.karashiiro.klink.profile#urlImage" as const,
              };
            }
          }
          // Check if value is an ATProto blob (has ref property)
          const blobValue = image.value;
          if (
            typeof blobValue === "object" &&
            blobValue !== null &&
            "ref" in blobValue
          ) {
            // Already an ATProto blob, return as-is
            return image;
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

          if (isBackground) {
            return {
              type: "blob" as const,
              value: blobResponse.data.blob,
              $type: "moe.karashiiro.klink.profile#blobBackground" as const,
            };
          } else {
            return {
              type: "blob" as const,
              value: blobResponse.data.blob,
              $type: "moe.karashiiro.klink.profile#blobImage" as const,
            };
          }
        };

        // Process all images/blobs
        const profileImage = await processImage(form.profileImage);

        let background: Main["background"];
        if (form.background.type === "color") {
          background = {
            $type: "moe.karashiiro.klink.profile#colorBackground",
            type: "color" as const,
            value: form.background.value as string,
          };
        } else if (form.background.type === "shader") {
          // Check if this is already a blob reference
          const shaderValue = form.background.value;
          const hasRef =
            typeof shaderValue === "object" &&
            shaderValue !== null &&
            "ref" in shaderValue;
          if (hasRef) {
            // Already a blob reference, cast to proper type
            background = {
              $type: "moe.karashiiro.klink.profile#shaderBackground",
              type: "shader" as const,
              value: shaderValue,
            };
          } else {
            // Upload new shader code as text blob
            const shaderBlob = new Blob([form.background.value as string], {
              type: "text/plain",
            });
            const blobResponse = await client.post(
              "com.atproto.repo.uploadBlob",
              {
                input: shaderBlob,
              },
            );
            if (!blobResponse.ok) {
              throw new Error(
                `Failed to upload shader: ${blobResponse.status}`,
              );
            }
            background = {
              $type: "moe.karashiiro.klink.profile#shaderBackground",
              type: "shader" as const,
              value: blobResponse.data.blob,
            };
          }
        } else {
          const processedBackground = await processImage(
            form.background as {
              type: "url" | "blob";
              value: string | Blob;
            },
            true, // isBackground
          );
          if (!processedBackground) {
            throw new Error("Failed to process background");
          }
          background = {
            ...processedBackground,
            objectFit:
              "objectFit" in form.background
                ? form.background.objectFit
                : "cover",
          } as Main["background"];
        }

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
          theme: form.theme,
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
