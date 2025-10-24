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

interface ProfileImageInputProps {
  profile?: ReadProfileResult["profile"];
}

export function ProfileImageInput({ profile }: ProfileImageInputProps) {
  const profileImageUrl = useAtomValue(profileImageUrlAtom);
  const profileImageBlob = useAtomValue(profileImageBlobAtom);
  const setFormData = useSetAtom(profileAtom);

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
      hasExistingBlob={profile?.value.profileImage?.type === "blob"}
      onUrlChange={handleProfileImageChange}
      onFileChange={handleProfileImageFile}
      onClear={profile ? clearProfileImage : undefined}
    />
  );
}
