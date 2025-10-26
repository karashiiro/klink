import { YStack, XStack } from "@tamagui/stacks";
import { Card } from "@tamagui/card";
import { Button } from "@tamagui/button";
import { useAtomValue, useSetAtom } from "jotai";
import {
  editorPanelsOpenAtom,
  mobileActivePanelAtom,
  profileAtom,
} from "../../atoms/profile";
import { ProfileLinkEditor } from "./ProfileLinkEditor";
import { CreateProfileButton } from "./CreateProfileButton";
import { UpdateProfileButtons } from "./UpdateProfileButtons";
import { useAuth } from "@kpaste-app/atproto-auth";
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
  const mobileActivePanel = useAtomValue(mobileActivePanelAtom);
  const { logout } = useAuth();
  const setFormData = useSetAtom(profileAtom);

  return (
    <Card
      position="absolute"
      right={isOpen && mobileActivePanel === "right" ? 0 : -350}
      $md={{
        right: isOpen ? 0 : -350,
      }}
      top={0}
      bottom={0}
      width={350}
      borderTopRightRadius={0}
      borderBottomRightRadius={0}
      paddingLeft="$4"
      paddingRight="$4"
      backgroundColor="rgba(0, 0, 0, 0.7)"
      style={{
        backdropFilter: "blur(10px)",
        transition: "right 0.3s ease",
      }}
      zIndex={10}
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
        <div style={{ marginBottom: 36 }} />
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
            profile={profile}
            onSuccess={onSuccess}
          />
        )}

        {/* Spacer to push buttons to bottom */}
        <YStack flex={1} />

        {/* Bottom action buttons */}
        <XStack gap="$2" marginBottom="$4">
          <Button
            flex={1}
            size="$4"
            backgroundColor="$gray8"
            color="white"
            borderColor="$gray7"
            hoverStyle={{
              backgroundColor: "$gray9",
              borderColor: "$gray8",
            }}
            pressStyle={{
              backgroundColor: "$gray10",
              borderColor: "$gray9",
            }}
            onPress={() => logout()}
          >
            Logout
          </Button>

          {profile && (
            <Button
              size="$4"
              backgroundColor="$redBase"
              hoverStyle={{ backgroundColor: "$redHover" }}
              pressStyle={{ backgroundColor: "$redPress" }}
              color="white"
              disabled={deleteLoading}
              onPress={async () => {
                const success = await deleteProfile();
                if (success) {
                  setFormData({
                    name: "",
                    location: "",
                    bio: "",
                    profileImage: undefined,
                    profileImageBlob: null,
                    background: undefined,
                    backgroundImageBlob: null,
                    backgroundColor: "#1a1a1a",
                    backgroundShaderCode: "",
                    backgroundType: "color",
                    backgroundObjectFit: "cover",
                    theme: {
                      primaryColor: "#364163",
                      secondaryColor: "#a58431",
                      fontFamily: "",
                      stylesheet: "",
                    },
                    links: [],
                  });
                  onSuccess();
                }
              }}
            >
              {deleteLoading ? "Deleting..." : "Delete"}
            </Button>
          )}
        </XStack>
      </YStack>
    </Card>
  );
}
