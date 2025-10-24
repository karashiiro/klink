import { useEffect } from "react";
import { useSetAtom } from "jotai";
import { YStack } from "@tamagui/stacks";
import { H1, H3, Paragraph } from "@tamagui/text";
import { Button } from "@tamagui/button";
import { Card } from "@tamagui/card";
import { useAuth } from "@kpaste-app/atproto-auth";
import { Loader } from "@tamagui/lucide-icons";
import { useAuthModal } from "@kpaste-app/ui";
import { useReadProfile } from "../../hooks/useReadProfile";
import { useCreateProfile } from "../../hooks/useCreateProfile";
import { useUpdateProfile } from "../../hooks/useUpdateProfile";
import { useDeleteProfile } from "../../hooks/useDeleteProfile";
import { NameInput } from "../ui/NameInput";
import { LocationInput } from "../ui/LocationInput";
import { BioInput } from "../ui/BioInput";
import { ProfileImageInput } from "../ui/ProfileImageInput";
import { ProfileBackgroundSelector } from "../ui/ProfileBackgroundSelector";
import { ProfileLinkEditor } from "../ui/ProfileLinkEditor";
import { CreateProfileButton } from "../ui/CreateProfileButton";
import { UpdateProfileButtons } from "../ui/UpdateProfileButtons";
import { profileAtom } from "../../atoms/profile";

export function Home() {
  const { authState, logout, session } = useAuth();
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
    if (profile) {
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
        backgroundType: profile.value.background.type,
        backgroundObjectFit:
          profile.value.background.type !== "color"
            ? profile.value.background.objectFit || "cover"
            : "cover",
        links: (profile.value.links || []).map((link) => ({
          icon: link.icon?.type === "url" ? link.icon.value : undefined,
          label: link.label,
          href: link.href,
        })),
      });
    }
  }, [profile, setFormData]);

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
              Login with ATProto
            </Button>
          )}

          {authState.state === "authenticated" && session && (
            <YStack gap="$4" width="100%" alignItems="center">
              <Paragraph fontSize="$5" color="$textTitle" textAlign="center">
                Welcome back, {session.handle}!
              </Paragraph>

              {profileLoading && (
                <YStack alignItems="center" gap="$2">
                  <Loader size="$1" color="$accent" />
                  <Paragraph color="$textMuted" fontSize="$2">
                    Loading profile...
                  </Paragraph>
                </YStack>
              )}

              {!profileLoading && !profile && (
                <YStack gap="$3" width="100%">
                  <H3 color="$textTitle" textAlign="center">
                    Create Your Profile
                  </H3>

                  <ProfileImageInput />

                  <NameInput />

                  <LocationInput />

                  <BioInput />

                  <ProfileBackgroundSelector />

                  <ProfileLinkEditor />

                  <CreateProfileButton
                    createProfile={createProfile}
                    createLoading={createLoading}
                    onSuccess={() => refetch(session.handle)}
                  />
                </YStack>
              )}

              {!profileLoading && profile && (
                <YStack gap="$3" width="100%">
                  <H3 color="$textTitle" textAlign="center">
                    Edit Your Profile
                  </H3>

                  <ProfileImageInput profile={profile} />

                  <NameInput />

                  <LocationInput />

                  <BioInput />

                  <ProfileBackgroundSelector profile={profile} />

                  <ProfileLinkEditor profile={profile} />

                  <UpdateProfileButtons
                    updateProfile={updateProfile}
                    updateLoading={updateLoading}
                    deleteProfile={deleteProfile}
                    deleteLoading={deleteLoading}
                    profile={profile}
                    onSuccess={() => refetch(session.handle)}
                  />
                </YStack>
              )}

              <Button
                size="$3"
                backgroundColor="$redBase"
                hoverStyle={{ backgroundColor: "$redHover" }}
                pressStyle={{ backgroundColor: "$redPress" }}
                color="white"
                onPress={logout}
                marginTop="$2"
              >
                Logout
              </Button>
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
