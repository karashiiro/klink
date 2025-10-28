import { useAtomValue, useStore } from "jotai";
import { Button } from "@tamagui/button";
import { bioAtom, profileAtom } from "../../../atoms/profile";
import { useCreateProfile } from "../../../hooks/useCreateProfile";
import { transformProfileForCreate } from "../../../utils/profileTransformations";

interface CreateProfileButtonProps {
  onSuccess: () => void;
}

export function CreateProfileButton({ onSuccess }: CreateProfileButtonProps) {
  const bio = useAtomValue(bioAtom);
  const store = useStore();
  const { createProfile, loading: createLoading } = useCreateProfile();

  return (
    <Button
      size="$4"
      backgroundColor="$greenBase"
      hoverStyle={{ backgroundColor: "$greenHover" }}
      pressStyle={{ backgroundColor: "$greenPress" }}
      color="$greenText"
      disabled={createLoading || !bio.trim()}
      onPress={async () => {
        const data = store.get(profileAtom);
        const profileData = transformProfileForCreate(data);
        const result = await createProfile(profileData);
        if (result) {
          onSuccess();
        }
      }}
    >
      {createLoading ? "Creating..." : "Create Profile"}
    </Button>
  );
}
