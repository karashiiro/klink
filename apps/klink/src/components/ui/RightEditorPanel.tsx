import { YStack, XStack } from "@tamagui/stacks";
import { Card } from "@tamagui/card";
import { Button } from "@tamagui/button";
import { useAtomValue } from "jotai";
import {
  editorPanelsOpenAtom,
  mobileActivePanelAtom,
} from "../../atoms/profile";
import { ProfileLinkEditor } from "./ProfileLinkEditor";
import { CreateProfileButton } from "./CreateProfileButton";
import { UpdateProfileButtons } from "./UpdateProfileButtons";
import { DeleteProfileButton } from "./DeleteProfileButton";
import { useAuth } from "@kpaste-app/atproto-auth";
import { useReadProfile } from "../../hooks/useReadProfile";

interface RightEditorPanelProps {
  onSuccess: () => void;
}

export function RightEditorPanel({ onSuccess }: RightEditorPanelProps) {
  const isOpen = useAtomValue(editorPanelsOpenAtom);
  const mobileActivePanel = useAtomValue(mobileActivePanelAtom);
  const { session, logout } = useAuth();
  const { profile } = useReadProfile(session?.handle);

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
        <ProfileLinkEditor />

        {!profile && <CreateProfileButton onSuccess={onSuccess} />}

        {profile && (
          <UpdateProfileButtons profile={profile} onSuccess={onSuccess} />
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

          {profile && <DeleteProfileButton onSuccess={onSuccess} />}
        </XStack>
      </YStack>
    </Card>
  );
}
