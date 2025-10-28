import { useEffect } from "react";
import { useSetAtom } from "jotai";
import { XStack, YStack } from "@tamagui/stacks";
import { H1, Paragraph } from "@tamagui/text";
import { Button } from "@tamagui/button";
import { Card } from "@tamagui/card";
import { useAuth } from "@kpaste-app/atproto-auth";
import { Loader } from "@tamagui/lucide-icons";
import { useAuthModal } from "@kpaste-app/ui";
import { useReadProfile } from "../../hooks/useReadProfile";
import { ProfilePreview } from "../ui/editor/ProfilePreview";
import { LeftEditorPanel } from "../ui/editor/LeftEditorPanel";
import { RightEditorPanel } from "../ui/editor/RightEditorPanel";
import { EditorPanelToggle } from "../ui/editor/EditorPanelToggle";
import { MobilePanelSwitch } from "../ui/editor/MobilePanelSwitch";
import { ExampleCarousel } from "../ui/ExampleCarousel";
import {
  profileAtom,
  currentProfileAtom,
  profileLoadingAtom,
} from "../../atoms/profile";

function HomeHeader() {
  return (
    <XStack
      width="100%"
      justifyContent="center"
      alignItems="center"
      paddingVertical="$4"
      paddingHorizontal="$4"
      borderBottomWidth={2}
      borderBottomColor="$primary"
      borderStyle="dashed"
      backgroundColor="$background"
    >
      <H1 color="white" textAlign="center" size="$10">
        KLink
      </H1>
    </XStack>
  );
}

function HomeFooter() {
  return (
    <XStack
      width="100%"
      justifyContent="center"
      alignItems="center"
      paddingVertical="$3"
      paddingHorizontal="$4"
      borderTopWidth={2}
      borderTopColor="$primary"
      borderStyle="dashed"
      backgroundColor="$background"
    >
      <Paragraph fontSize="$2" color="rgba(255, 255, 255, 0.5)">
        View on{" "}
        <a
          href="https://github.com/karashiiro/klink"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "rgba(255, 255, 255, 0.5)" }}
        >
          GitHub
        </a>
      </Paragraph>
    </XStack>
  );
}

export function Home() {
  const { authState, session } = useAuth();
  const { openAuthModal } = useAuthModal();

  // Read user's profile
  const {
    profile,
    loading: profileLoading,
    refetch,
  } = useReadProfile(session?.handle);

  const setFormData = useSetAtom(profileAtom);
  const setCurrentProfile = useSetAtom(currentProfileAtom);
  const setProfileLoading = useSetAtom(profileLoadingAtom);

  // Update profile atoms when profile loads
  useEffect(() => {
    setCurrentProfile(profile);
    setProfileLoading(profileLoading);
  }, [profile, profileLoading, setCurrentProfile, setProfileLoading]);

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

          const blob = profile.value.background.value;
          const blobCid = "ref" in blob ? blob.ref.$link : blob.cid;
          const blobUrl = `${cleanPdsUrl}/xrpc/com.atproto.sync.getBlob?did=${session.did}&cid=${blobCid}`;

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
          profileImage: profile.value.profileImage,
          profileImageBlob: null,
          background: profile.value.background,
          backgroundImageBlob: null,
          backgroundImageUrl:
            profile.value.background.type === "url"
              ? profile.value.background.value
              : "",
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
        <LeftEditorPanel />
        <RightEditorPanel
          onSuccess={async () => {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            await refetch(session.handle);
          }}
        />
        <EditorPanelToggle />
        <MobilePanelSwitch />
      </YStack>
    );
  }

  return (
    <YStack>
      {authState.state === "authenticating" && (
        <YStack
          flex={1}
          backgroundColor="#1a1a2e"
          paddingVertical="$6"
          paddingHorizontal="$4"
          alignItems="center"
          justifyContent="center"
          minHeight="100vh"
          width="100%"
          position="relative"
        >
          <YStack alignItems="center" gap="$4">
            <Loader size="$2" color="$accent" />
            <Paragraph color="white" fontSize="$5">
              Authenticating...
            </Paragraph>
          </YStack>
        </YStack>
      )}

      {authState.state === "authenticated" && session && profileLoading && (
        <YStack
          flex={1}
          backgroundColor="#1a1a2e"
          paddingVertical="$6"
          paddingHorizontal="$4"
          alignItems="center"
          justifyContent="center"
          minHeight="100vh"
          width="100%"
          position="relative"
        >
          <YStack gap="$4" alignItems="center">
            <Paragraph fontSize="$7" color="white" textAlign="center">
              Welcome back, {session.handle}!
            </Paragraph>
            <YStack alignItems="center" gap="$2">
              <Loader size="$2" color="$accent" />
              <Paragraph color="rgba(255, 255, 255, 0.7)" fontSize="$4">
                Loading profile...
              </Paragraph>
            </YStack>
          </YStack>
        </YStack>
      )}

      {(authState.state === "unauthenticated" ||
        authState.state === "error") && (
        <>
          <HomeHeader />
          <YStack
            backgroundColor="#1a1a2e"
            paddingVertical="$4"
            paddingHorizontal="$4"
            alignItems="center"
            width="100%"
            position="relative"
          >
            <YStack gap="$6" alignItems="center" width="100%" maxWidth={700}>
              <ExampleCarousel autoRotateInterval={5000} />

              {authState.state === "error" && (
                <Card
                  backgroundColor="rgba(255, 0, 0, 0.1)"
                  borderColor="rgba(255, 0, 0, 0.3)"
                  borderWidth={1}
                  padding="$3"
                  width="100%"
                >
                  <Paragraph color="#ff6b6b" textAlign="center">
                    Authentication error. Please try again.
                  </Paragraph>
                </Card>
              )}

              <Button
                size="$6"
                backgroundColor="$greenBase"
                hoverStyle={{ backgroundColor: "$greenHover" }}
                pressStyle={{ backgroundColor: "$greenPress" }}
                color="$greenText"
                fontWeight="bold"
                onPress={openAuthModal}
                width="100%"
                maxWidth={600}
              >
                {authState.state === "error" ? "Retry Login" : "Get Started"}
              </Button>
            </YStack>
          </YStack>
          <HomeFooter />
        </>
      )}
    </YStack>
  );
}
