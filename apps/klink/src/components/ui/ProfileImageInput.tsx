import { type FormEvent } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import {
  profileAtom,
  profileImageUrlAtom,
  profileImageBlobAtom,
} from "../../atoms/profile";
import { ImageInput } from "./ImageInput";
import type { TextInputChangeEvent } from "react-native";
import type { ReadProfileResult } from "../../hooks/useReadProfile";
import { useAuth } from "@kpaste-app/atproto-auth";

interface ProfileImageInputProps {
  profile?: ReadProfileResult["profile"];
}

export function ProfileImageInput({ profile }: ProfileImageInputProps) {
  const { session } = useAuth();
  const profileImageUrl = useAtomValue(profileImageUrlAtom);
  const profileImageBlob = useAtomValue(profileImageBlobAtom);
  const setFormData = useSetAtom(profileAtom);

  // Build existing blob URL if available
  let existingBlobUrl: string | undefined;
  if (
    profile?.value.profileImage?.type === "blob" &&
    session?.endpoint.url &&
    session?.did
  ) {
    const cleanPdsUrl = session.endpoint.url.endsWith("/")
      ? session.endpoint.url.slice(0, -1)
      : session.endpoint.url;
    existingBlobUrl = `${cleanPdsUrl}/xrpc/com.atproto.sync.getBlob?did=${session.did}&cid=${(profile.value.profileImage.value as any).ref.$link}`;
  }

  const handleProfileImageChange = (
    e: FormEvent<HTMLInputElement> | TextInputChangeEvent,
  ) => {
    setFormData((prev) => ({
      ...prev,
      profileImageUrl: (e.target as HTMLInputElement).value,
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
        profileImageUrl: "",
      }));
    }
  };

  const clearProfileImage = () => {
    setFormData((prev) => ({
      ...prev,
      profileImageUrl: "",
      profileImageBlob: null,
    }));
  };

  return (
    <ImageInput
      label="Profile Image (optional)"
      urlValue={profileImageUrl}
      blob={profileImageBlob}
      hasExistingBlob={
        profile?.value.profileImage?.type === "blob" &&
        !profileImageBlob &&
        !profileImageUrl
      }
      existingBlobUrl={existingBlobUrl}
      onUrlChange={handleProfileImageChange}
      onFileChange={handleProfileImageFile}
      onClear={profile ? clearProfileImage : undefined}
    />
  );
}
