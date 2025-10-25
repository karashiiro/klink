import { YStack } from "@tamagui/stacks";
import { Card } from "@tamagui/card";
import { H3 } from "@tamagui/text";
import { useAtomValue } from "jotai";
import { editorPanelsOpenAtom } from "../../atoms/profile";
import { ProfileLinkEditor } from "./ProfileLinkEditor";
import { CreateProfileButton } from "./CreateProfileButton";
import { UpdateProfileButtons } from "./UpdateProfileButtons";
import type { ReadProfileResult } from "../../hooks/useReadProfile";
import type { UseCreateProfileReturn } from "../../hooks/useCreateProfile";
import type { UseUpdateProfileReturn } from "../../hooks/useUpdateProfile";
import type { UseDeleteProfileReturn } from "../../hooks/useDeleteProfile";

interface RightEditorPanelProps {
  profile?: ReadProfileResult["profile"];
  createProfile: UseCreateProfileReturn["createProfile"];
  createLoading: boolean;
  updateProfile: UseUpdateProfileReturn["updateProfile"];
  updateLoading: boolean;
  deleteProfile: UseDeleteProfileReturn["deleteProfile"];
  deleteLoading: boolean;
  onSuccess: () => void;
}

export function RightEditorPanel({
  profile,
  createProfile,
  createLoading,
  updateProfile,
  updateLoading,
  deleteProfile,
  deleteLoading,
  onSuccess,
}: RightEditorPanelProps) {
  const isOpen = useAtomValue(editorPanelsOpenAtom);

  return (
    <Card
      position="absolute"
      right={isOpen ? 0 : -350}
      top={0}
      bottom={0}
      width={350}
      padding="$4"
      backgroundColor="rgba(0, 0, 0, 0.7)"
      style={{
        backdropFilter: "blur(10px)",
        transition: "right 0.3s ease",
      }}
      zIndex={10}
      $gtMd={{
        position: "absolute",
      }}
      $sm={{
        position: "absolute",
      }}
    >
      <YStack
        gap="$4"
        height="100%"
        style={{
          overflowY: "auto",
          overflowX: "hidden",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
        // Hide webkit scrollbar
        className="hide-scrollbar"
      >
        <H3 color="white" textAlign="center">
          Links
        </H3>
        <ProfileLinkEditor profile={profile} />

        {!profile && (
          <CreateProfileButton
            createProfile={createProfile}
            createLoading={createLoading}
            onSuccess={onSuccess}
          />
        )}

        {profile && (
          <UpdateProfileButtons
            updateProfile={updateProfile}
            updateLoading={updateLoading}
            deleteProfile={deleteProfile}
            deleteLoading={deleteLoading}
            profile={profile}
            onSuccess={onSuccess}
          />
        )}
      </YStack>
    </Card>
  );
}
