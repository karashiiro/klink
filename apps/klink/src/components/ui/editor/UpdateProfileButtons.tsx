import { useAtomValue, useStore } from "jotai";
import { useNavigate } from "react-router";
import { Button } from "@tamagui/button";
import { XStack } from "@tamagui/stacks";
import { bioAtom, profileAtom } from "../../../atoms/profile";
import { useUpdateProfile } from "../../../hooks/useUpdateProfile";
import { transformProfileForUpdate } from "../../../utils/profileUtils";
import type { ReadProfileResult } from "../../../hooks/useReadProfile";
import { useSession } from "../../../hooks/useSession";

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
  const { handle } = useSession();
  const navigate = useNavigate();

  return (
    <XStack gap="$2" width="100%">
      <Button
        flex={1}
        size="$4"
        fontWeight={600}
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
      <Button
        flex={1}
        size="$4"
        fontWeight={600}
        backgroundColor="$blueBase"
        hoverStyle={{ backgroundColor: "$blueHover" }}
        pressStyle={{ backgroundColor: "$bluePress" }}
        color="$blueText"
        onPress={() => {
          if (handle) {
            navigate(`/p/${handle}`);
          }
        }}
      >
        View Profile
      </Button>
    </XStack>
  );
}
