import { useAtomValue, useStore } from "jotai";
import { Button } from "@tamagui/button";
import { bioAtom, profileAtom } from "../../../atoms/profile";
import { useUpdateProfile } from "../../../hooks/useUpdateProfile";
import { transformProfileForUpdate } from "../../../utils/profileTransformations";
import type { ReadProfileResult } from "../../../hooks/useReadProfile";

interface UpdateProfileButtonsProps {
  profile: ReadProfileResult["profile"];
  onSuccess: () => void;
}

export function UpdateProfileButtons({
  profile,
  onSuccess,
}: UpdateProfileButtonsProps) {
  const bio = useAtomValue(bioAtom);
  const store = useStore();
  const { updateProfile, loading: updateLoading } = useUpdateProfile();

  return (
    <Button
      width="100%"
      size="$4"
      backgroundColor="$greenBase"
      hoverStyle={{ backgroundColor: "$greenHover" }}
      pressStyle={{ backgroundColor: "$greenPress" }}
      color="$greenText"
      disabled={updateLoading || !bio.trim()}
      onPress={async () => {
        const data = store.get(profileAtom);
        const profileData = transformProfileForUpdate(data, profile);
        const result = await updateProfile(profileData);
        if (result) {
          onSuccess();
        }
      }}
    >
      {updateLoading ? "Updating..." : "Update Profile"}
    </Button>
  );
}
