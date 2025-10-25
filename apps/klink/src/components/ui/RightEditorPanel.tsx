import { useState } from "react";
import { YStack } from "@tamagui/stacks";
import { Card } from "@tamagui/card";
import { Button } from "@tamagui/button";
import { H3 } from "@tamagui/text";
import { useMedia } from "@tamagui/core";
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
  const media = useMedia();
  const [isOpen, setIsOpen] = useState(media.gtMd);

  return (
    <>
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

      <Button
        position="absolute"
        right={isOpen ? 350 : 0}
        top={16}
        size="$3"
        backgroundColor="rgba(0, 0, 0, 0.7)"
        borderColor="rgba(255, 255, 255, 0.1)"
        borderWidth={1}
        color="white"
        hoverStyle={{
          backgroundColor: "rgba(0, 0, 0, 0.8)",
        }}
        pressStyle={{
          backgroundColor: "rgba(0, 0, 0, 0.9)",
        }}
        zIndex={11}
        onPress={() => setIsOpen(!isOpen)}
        style={{
          backdropFilter: "blur(10px)",
          transition: "right 0.3s ease",
        }}
      >
        {isOpen ? "Hide" : "Links"}
      </Button>
    </>
  );
}
