import { useEffect } from "react";
import { useSetAtom } from "jotai";
import { YStack } from "@tamagui/stacks";
import { H1, Paragraph } from "@tamagui/text";
import { Button } from "@tamagui/button";
import { Card } from "@tamagui/card";
import { useAuth } from "@kpaste-app/atproto-auth";
import { Loader } from "@tamagui/lucide-icons";
import { useAuthModal } from "@kpaste-app/ui";
import { useReadProfile } from "../../hooks/useReadProfile";
import { useCreateProfile } from "../../hooks/useCreateProfile";
import { useUpdateProfile } from "../../hooks/useUpdateProfile";
import { useDeleteProfile } from "../../hooks/useDeleteProfile";
import { ProfilePreview } from "../ui/ProfilePreview";
import { LeftEditorPanel } from "../ui/LeftEditorPanel";
import { RightEditorPanel } from "../ui/RightEditorPanel";
import { EditorPanelToggle } from "../ui/EditorPanelToggle";
import { profileAtom } from "../../atoms/profile";

export function Home() {
  const { authState, session } = useAuth();
  const { openAuthModal } = useAuthModal();

  // Read user's profile
  const {
    profile,
    loading: profileLoading,
    refetch,
  } = useReadProfile(session?.handle);
  const { createProfile, loading: createLoading } = useCreateProfile();
  const { updateProfile, loading: updateLoading } = useUpdateProfile();
  const { deleteProfile, loading: deleteLoading } = useDeleteProfile();

  const setFormData = useSetAtom(profileAtom);

  // Load profile data into form when it exists
  useEffect(() => {
    if (profile && session) {
      const loadShaderCode = async () => {
        let shaderCode = "";
        if (profile.value.background.type === "shader") {
          // Fetch shader blob content
          const cleanPdsUrl = session.endpoint.url.endsWith("/")
            ? session.endpoint.url.slice(0, -1)
            : session.endpoint.url;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const blobUrl = `${cleanPdsUrl}/xrpc/com.atproto.sync.getBlob?did=${session.did}&cid=${(profile.value.background.value as any).ref.$link}`;

          try {
            const response = await fetch(blobUrl);
            shaderCode = await response.text();
          } catch (err) {
            console.error("Failed to fetch shader code:", err);
          }
        }

        setFormData({
          name: profile.value.name || "",
          location: profile.value.location || "",
          bio: profile.value.bio || "",
          profileImageUrl:
            profile.value.profileImage?.type === "url"
              ? profile.value.profileImage.value
              : "",
          profileImageBlob: null,
          backgroundImageUrl:
            profile.value.background.type === "url"
              ? profile.value.background.value
              : "",
          backgroundImageBlob: null,
          backgroundColor:
            profile.value.background.type === "color"
              ? profile.value.background.value
              : "#1a1a1a",
          backgroundShaderCode: shaderCode,
          backgroundType: profile.value.background.type,
          backgroundObjectFit:
            profile.value.background.type !== "color" &&
            profile.value.background.type !== "shader"
              ? profile.value.background.objectFit || "cover"
              : "cover",
          theme: {
            primaryColor: profile.value.theme?.primaryColor || "#364163",
            secondaryColor: profile.value.theme?.secondaryColor || "#a58431",
            fontFamily: profile.value.theme?.fontFamily || "",
            stylesheet: profile.value.theme?.stylesheet || "",
          },
          links: (profile.value.links || []).map((link) => ({
            icon: link.icon,
            label: link.label,
            href: link.href,
          })),
        });
      };

      loadShaderCode();
    }
  }, [profile, session, setFormData]);

  if (authState.state === "authenticated" && session && !profileLoading) {
    return (
      <YStack
        position="relative"
        flex={1}
        width="100%"
        height="100vh"
        overflow="hidden"
      >
        <ProfilePreview />
        <LeftEditorPanel profile={profile} />
        <RightEditorPanel
          profile={profile}
          createProfile={createProfile}
          createLoading={createLoading}
          updateProfile={updateProfile}
          updateLoading={updateLoading}
          deleteProfile={deleteProfile}
          deleteLoading={deleteLoading}
          onSuccess={() => refetch(session.handle)}
        />
        <EditorPanelToggle />
      </YStack>
    );
  }

  return (
    <YStack
      flex={1}
      backgroundColor="$background"
      paddingVertical="$6"
      paddingHorizontal="$4"
      alignItems="center"
      justifyContent="center"
    >
      <Card
        elevate
        size="$4"
        bordered
        backgroundColor="$primary"
        maxWidth={500}
        width="100%"
        padding="$6"
      >
        <YStack gap="$4" alignItems="center">
          <H1 color="$textTitle" textAlign="center">
            Welcome to KLink! ✨
          </H1>

          <Paragraph color="$textMuted" textAlign="center" marginBottom="$2">
            Share all your important links in one place
          </Paragraph>

          {authState.state === "authenticating" && (
            <YStack alignItems="center" gap="$2">
              <Loader size="$2" color="$accent" />
              <Paragraph color="$textMuted">Authenticating...</Paragraph>
            </YStack>
          )}

          {authState.state === "unauthenticated" && (
            <Button
              size="$5"
              backgroundColor="$greenBase"
              hoverStyle={{ backgroundColor: "$greenHover" }}
              pressStyle={{ backgroundColor: "$greenPress" }}
              color="$greenText"
              fontWeight="bold"
              onPress={openAuthModal}
              width="100%"
            >
              Login
            </Button>
          )}

          {authState.state === "authenticated" && session && profileLoading && (
            <YStack gap="$4" width="100%" alignItems="center">
              <Paragraph fontSize="$5" color="$textTitle" textAlign="center">
                Welcome back, {session.handle}!
              </Paragraph>
              <YStack alignItems="center" gap="$2">
                <Loader size="$1" color="$accent" />
                <Paragraph color="$textMuted" fontSize="$2">
                  Loading profile...
                </Paragraph>
              </YStack>
            </YStack>
          )}

          {authState.state === "error" && (
            <YStack gap="$3" alignItems="center">
              <Paragraph color="$redBase" textAlign="center">
                Authentication error. Please try again.
              </Paragraph>
              <Button
                size="$4"
                backgroundColor="$greenBase"
                hoverStyle={{ backgroundColor: "$greenHover" }}
                pressStyle={{ backgroundColor: "$greenPress" }}
                color="$greenText"
                onPress={openAuthModal}
              >
                Retry Login
              </Button>
            </YStack>
          )}
        </YStack>
      </Card>
    </YStack>
  );
}
