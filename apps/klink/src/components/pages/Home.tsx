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
import { ProfileDisplay } from "../ui/ProfileDisplay";
import { LeftEditorPanel } from "../ui/LeftEditorPanel";
import { RightEditorPanel } from "../ui/RightEditorPanel";
import { EditorPanelToggle } from "../ui/EditorPanelToggle";
import { MobilePanelSwitch } from "../ui/MobilePanelSwitch";
import { profileAtom } from "../../atoms/profile";
import type { Main } from "@klink-app/lexicon/types";

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
        <MobilePanelSwitch />
      </YStack>
    );
  }

  // Demo profile data for logged-out preview
  const demoProfile: Main = {
    $type: "moe.karashiiro.klink.profile",
    name: "Your Name Here",
    location: "The Internet",
    bio: "Share all your important links in one beautiful place! Customize your profile with colors, backgrounds, shaders, and more. Login to create your own personalized link page.",
    profileImage: {
      $type: "moe.karashiiro.klink.profile#urlImage",
      type: "url",
      value: "https://api.dicebear.com/7.x/shapes/svg?seed=klink",
    },
    background: {
      $type: "moe.karashiiro.klink.profile#colorBackground",
      type: "color",
      value: "#1a1a2e",
    },
    theme: {
      primaryColor: "#364163",
      secondaryColor: "#a58431",
      fontFamily: "sans-serif",
    },
    links: [
      {
        label: "Website",
        href: "https://example.com",
      },
      {
        label: "GitHub",
        href: "https://github.com",
      },
      {
        label: "Twitter",
        href: "https://twitter.com",
      },
      {
        label: "Portfolio",
        href: "https://example.com/portfolio",
      },
    ],
  };

  return (
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
      {authState.state === "authenticating" && (
        <YStack alignItems="center" gap="$4">
          <Loader size="$2" color="$accent" />
          <Paragraph color="white" fontSize="$5">
            Authenticating...
          </Paragraph>
        </YStack>
      )}

      {authState.state === "authenticated" && session && profileLoading && (
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
      )}

      {(authState.state === "unauthenticated" ||
        authState.state === "error") && (
        <YStack gap="$6" alignItems="center" width="100%" maxWidth={700}>
          <YStack gap="$2" alignItems="center">
            <H1 color="white" textAlign="center" size="$10">
              Welcome to KLink!
            </H1>
            <Paragraph
              color="rgba(255, 255, 255, 0.8)"
              textAlign="center"
              fontSize="$6"
            >
              Create your personalized link page in seconds
            </Paragraph>
          </YStack>

          <ProfileDisplay
            profileData={demoProfile}
            handle="yourhandle.bsky.social"
          />

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
            {authState.state === "error"
              ? "Retry Login"
              : "Get Started - Login"}
          </Button>

          <Paragraph
            color="rgba(255, 255, 255, 0.5)"
            textAlign="center"
            fontSize="$3"
          >
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
        </YStack>
      )}
    </YStack>
  );
}
