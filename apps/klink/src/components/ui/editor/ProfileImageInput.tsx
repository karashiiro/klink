import { type FormEvent } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import {
  profileAtom,
  profileImageAtom,
  profileImageBlobAtom,
} from "../../../atoms/profile";
import { ImageInput } from "./ImageInput";
import type { TextInputChangeEvent } from "react-native";
import { useAuth } from "@kpaste-app/atproto-auth";
import { useImageSource } from "../../../hooks/useImageSource";

export function ProfileImageInput() {
  const { session } = useAuth();
  const profileImage = useAtomValue(profileImageAtom);
  const profileImageBlob = useAtomValue(profileImageBlobAtom);
  const setFormData = useSetAtom(profileAtom);

  // Use the unified hook to resolve the existing image URL
  const existingUrl = useImageSource(
    profileImage,
    session?.endpoint.url,
    session?.did,
  );

  const handleProfileImageChange = (
    e: FormEvent<HTMLInputElement> | TextInputChangeEvent,
  ) => {
    const urlValue = (e.target as HTMLInputElement).value;
    setFormData((prev) => ({
      ...prev,
      profileImage: urlValue
        ? {
            type: "url" as const,
            value: urlValue as `${string}:${string}`,
            $type: "moe.karashiiro.klink.profile#urlImage" as const,
          }
        : undefined,
      profileImageBlob: null,
    }));
  };

  const handleProfileImageFile = (
    e: FormEvent<HTMLInputElement> | TextInputChangeEvent,
  ) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        profileImageBlob: file,
        profileImage: undefined,
      }));
    }
  };

  const clearProfileImage = () => {
    setFormData((prev) => ({
      ...prev,
      profileImage: undefined,
      profileImageBlob: null,
    }));
  };

  return (
    <ImageInput
      label="Profile Image (optional)"
      urlValue={profileImage?.type === "url" ? profileImage.value : ""}
      blob={profileImageBlob}
      hasExistingBlob={profileImage?.type === "blob" && !profileImageBlob}
      existingBlobUrl={existingUrl ?? undefined}
      onUrlChange={handleProfileImageChange}
      onFileChange={handleProfileImageFile}
      onClear={profileImage ? clearProfileImage : undefined}
    />
  );
}
