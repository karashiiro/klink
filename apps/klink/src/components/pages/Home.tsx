import { useEffect, useRef, type FormEvent } from "react";
import { useAtom } from "jotai";
import { YStack, XStack } from "@tamagui/stacks";
import { H1, H3, Paragraph } from "@tamagui/text";
import { Button } from "@tamagui/button";
import { Card } from "@tamagui/card";
import { Input } from "@tamagui/input";
import { useAuth } from "@kpaste-app/atproto-auth";
import { Loader } from "@tamagui/lucide-icons";
import { useAuthModal } from "@kpaste-app/ui";
import { useReadProfile } from "../../hooks/useReadProfile";
import { useCreateProfile } from "../../hooks/useCreateProfile";
import { useUpdateProfile } from "../../hooks/useUpdateProfile";
import { useDeleteProfile } from "../../hooks/useDeleteProfile";
import { ImageInput } from "../ui/ImageInput";
import { BackgroundSelector } from "../ui/BackgroundSelector";
import { LinkEditor } from "../ui/LinkEditor";
import { profileAtom } from "../../atoms/profile";
import type { BlurEvent, TextInputChangeEvent } from "react-native";

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

  // Form state - now using jotai!! ✨
  const [formData, setFormData] = useAtom(profileAtom);
  const colorInputRef = useRef<HTMLInputElement>(null);

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

      // Update color input ref
      if (profile.value.background.type === "color" && colorInputRef.current) {
        colorInputRef.current.value = profile.value.background.value;
      }
    }
  }, [profile, setFormData]);

  const handleNameChange = (
    e: FormEvent<HTMLInputElement> | TextInputChangeEvent,
  ) =>
    setFormData((prev) => ({
      ...prev,
      name: (e.target as HTMLInputElement).value,
    }));

  const handleLocationChange = (
    e: FormEvent<HTMLInputElement> | TextInputChangeEvent,
  ) =>
    setFormData((prev) => ({
      ...prev,
      location: (e.target as HTMLInputElement).value,
    }));

  const handleBioChange = (
    e: FormEvent<HTMLInputElement> | TextInputChangeEvent,
  ) =>
    setFormData((prev) => ({
      ...prev,
      bio: (e.target as HTMLInputElement).value,
    }));

  const handleProfileImageChange = (
    e: FormEvent<HTMLInputElement> | TextInputChangeEvent,
  ) => {
    setFormData((prev) => ({
      ...prev,
      profileImageUrl: (e.target as HTMLInputElement).value,
      profileImageBlob: null,
    }));
  };

  const handleBackgroundImageChange = (
    e: FormEvent<HTMLInputElement> | TextInputChangeEvent,
  ) => {
    setFormData((prev) => ({
      ...prev,
      backgroundImageUrl: (e.target as HTMLInputElement).value,
      backgroundImageBlob: null,
    }));
  };

  // Color change handler - only update state when done selecting
  const handleColorChange = (e: BlurEvent) => {
    const newColor = (e.target as unknown as HTMLInputElement).value;
    setFormData((prev) => ({ ...prev, backgroundColor: newColor }));
  };

  // File upload handlers
  const handleProfileImageFile = (
    e: FormEvent<HTMLInputElement> | TextInputChangeEvent,
  ) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        profileImageBlob: file,
        profileImageUrl: "",
      }));
    }
  };

  const handleBackgroundImageFile = (
    e: FormEvent<HTMLInputElement> | TextInputChangeEvent,
  ) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        backgroundImageBlob: file,
        backgroundImageUrl: "",
        backgroundType: "blob",
      }));
    }
  };

  const handleLinkIconFile = (
    index: number,
    e: FormEvent<HTMLInputElement> | TextInputChangeEvent,
  ) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      setFormData((prev) => {
        const newLinks = [...prev.links];
        newLinks[index].icon = file;
        return { ...prev, links: newLinks };
      });
    }
  };

  // Link management
  const addLink = () => {
    setFormData((prev) => ({
      ...prev,
      links: [...prev.links, { icon: "", label: "", href: "" }],
    }));
  };

  const updateLink = (
    index: number,
    field: "icon" | "label" | "href",
    value: string,
  ) => {
    setFormData((prev) => {
      const newLinks = [...prev.links];
      newLinks[index][field] = value;
      return { ...prev, links: newLinks };
    });
  };

  const removeLink = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index),
    }));
  };

  // Clear handlers for removing uploaded images
  const clearProfileImage = () => {
    setFormData((prev) => ({
      ...prev,
      profileImageBlob: null,
      profileImageUrl: "",
    }));
  };

  const clearBackgroundImage = () => {
    setFormData((prev) => ({
      ...prev,
      backgroundImageBlob: null,
      backgroundImageUrl: "",
      backgroundType: "color",
    }));
  };

  const clearLinkIcon = (index: number) => {
    setFormData((prev) => {
      const newLinks = [...prev.links];
      newLinks[index].icon = "";
      return { ...prev, links: newLinks };
    });
  };

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

                  <ImageInput
                    label="Profile Image (optional)"
                    urlValue={formData.profileImageUrl}
                    blob={formData.profileImageBlob}
                    onUrlChange={handleProfileImageChange}
                    onFileChange={handleProfileImageFile}
                  />

                  <Input
                    placeholder="Name (optional)"
                    value={formData.name}
                    onChange={handleNameChange}
                    backgroundColor="$secondary"
                    color="$textBody"
                    borderColor="$border"
                    size="$4"
                  />

                  <Input
                    placeholder="Location (optional)"
                    value={formData.location}
                    onChange={handleLocationChange}
                    backgroundColor="$secondary"
                    color="$textBody"
                    borderColor="$border"
                    size="$4"
                  />

                  <Input
                    placeholder="Bio (required)"
                    value={formData.bio}
                    onChange={handleBioChange}
                    backgroundColor="$secondary"
                    color="$textBody"
                    borderColor="$border"
                    size="$4"
                  />

                  <BackgroundSelector
                    backgroundType={formData.backgroundType}
                    backgroundColor={formData.backgroundColor}
                    backgroundImageUrl={formData.backgroundImageUrl}
                    backgroundImageBlob={formData.backgroundImageBlob}
                    backgroundObjectFit={formData.backgroundObjectFit}
                    colorInputRef={colorInputRef}
                    onTypeChange={(type) =>
                      setFormData((prev) => ({ ...prev, backgroundType: type }))
                    }
                    onColorChange={handleColorChange}
                    onUrlChange={handleBackgroundImageChange}
                    onFileChange={handleBackgroundImageFile}
                    onObjectFitChange={(fit) =>
                      setFormData((prev) => ({
                        ...prev,
                        backgroundObjectFit: fit,
                      }))
                    }
                  />

                  <LinkEditor
                    links={formData.links}
                    onAddLink={addLink}
                    onUpdateLink={updateLink}
                    onRemoveLink={removeLink}
                    onIconFileChange={handleLinkIconFile}
                  />

                  <Button
                    size="$4"
                    backgroundColor="$greenBase"
                    hoverStyle={{ backgroundColor: "$greenHover" }}
                    pressStyle={{ backgroundColor: "$greenPress" }}
                    color="$greenText"
                    disabled={createLoading || !formData.bio.trim()}
                    onPress={async () => {
                      const result = await createProfile({
                        profileImage: formData.profileImageBlob
                          ? { type: "blob", value: formData.profileImageBlob }
                          : formData.profileImageUrl
                            ? { type: "url", value: formData.profileImageUrl }
                            : undefined,
                        name: formData.name || undefined,
                        location: formData.location || undefined,
                        bio: formData.bio,
                        background:
                          formData.backgroundType === "color"
                            ? {
                                type: "color" as const,
                                value: formData.backgroundColor,
                              }
                            : formData.backgroundType === "blob"
                              ? {
                                  type: "blob" as const,
                                  value: formData.backgroundImageBlob!,
                                  objectFit: formData.backgroundObjectFit,
                                }
                              : {
                                  type: "url" as const,
                                  value: formData.backgroundImageUrl,
                                  objectFit: formData.backgroundObjectFit,
                                },
                        links: formData.links.map((link) => ({
                          icon: link.icon
                            ? link.icon instanceof Blob
                              ? { type: "blob", value: link.icon }
                              : { type: "url", value: link.icon }
                            : undefined,
                          label: link.label,
                          href: link.href,
                        })),
                      });
                      if (result) {
                        refetch(session.handle);
                      }
                    }}
                  >
                    {createLoading ? "Creating..." : "Create Profile"}
                  </Button>
                </YStack>
              )}

              {!profileLoading && profile && (
                <YStack gap="$3" width="100%">
                  <H3 color="$textTitle" textAlign="center">
                    Edit Your Profile
                  </H3>

                  <ImageInput
                    label="Profile Image (optional)"
                    urlValue={formData.profileImageUrl}
                    blob={formData.profileImageBlob}
                    hasExistingBlob={
                      profile?.value.profileImage?.type === "blob"
                    }
                    onUrlChange={handleProfileImageChange}
                    onFileChange={handleProfileImageFile}
                    onClear={clearProfileImage}
                  />

                  <Input
                    placeholder="Name (optional)"
                    value={formData.name}
                    onChange={handleNameChange}
                    backgroundColor="$secondary"
                    color="$textBody"
                    borderColor="$border"
                    size="$4"
                  />

                  <Input
                    placeholder="Location (optional)"
                    value={formData.location}
                    onChange={handleLocationChange}
                    backgroundColor="$secondary"
                    color="$textBody"
                    borderColor="$border"
                    size="$4"
                  />

                  <Input
                    placeholder="Bio (required)"
                    value={formData.bio}
                    onChange={handleBioChange}
                    backgroundColor="$secondary"
                    color="$textBody"
                    borderColor="$border"
                    size="$4"
                  />

                  <BackgroundSelector
                    backgroundType={formData.backgroundType}
                    backgroundColor={formData.backgroundColor}
                    backgroundImageUrl={formData.backgroundImageUrl}
                    backgroundImageBlob={formData.backgroundImageBlob}
                    backgroundObjectFit={formData.backgroundObjectFit}
                    hasExistingBlob={profile?.value.background.type === "blob"}
                    colorInputRef={colorInputRef}
                    onTypeChange={(type) =>
                      setFormData((prev) => ({ ...prev, backgroundType: type }))
                    }
                    onColorChange={handleColorChange}
                    onUrlChange={handleBackgroundImageChange}
                    onFileChange={handleBackgroundImageFile}
                    onObjectFitChange={(fit) =>
                      setFormData((prev) => ({
                        ...prev,
                        backgroundObjectFit: fit,
                      }))
                    }
                    onClearBlob={clearBackgroundImage}
                  />

                  <LinkEditor
                    links={formData.links}
                    existingBlobIcons={
                      profile?.value.links?.map(
                        (link) => link.icon?.type === "blob",
                      ) || []
                    }
                    onAddLink={addLink}
                    onUpdateLink={updateLink}
                    onRemoveLink={removeLink}
                    onIconFileChange={handleLinkIconFile}
                    onClearIcon={clearLinkIcon}
                  />

                  <XStack gap="$2">
                    <Button
                      flex={1}
                      size="$4"
                      backgroundColor="$accent"
                      hoverStyle={{ opacity: 0.8 }}
                      color="white"
                      disabled={updateLoading || !formData.bio.trim()}
                      onPress={async () => {
                        const result = await updateProfile({
                          profileImage: formData.profileImageBlob
                            ? { type: "blob", value: formData.profileImageBlob }
                            : formData.profileImageUrl
                              ? { type: "url", value: formData.profileImageUrl }
                              : profile?.value.profileImage?.type === "blob"
                                ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                  (profile.value.profileImage as any)
                                : undefined,
                          name: formData.name || undefined,
                          location: formData.location || undefined,
                          bio: formData.bio,
                          background:
                            formData.backgroundType === "color"
                              ? {
                                  type: "color",
                                  value: formData.backgroundColor,
                                }
                              : formData.backgroundType === "blob" &&
                                  formData.backgroundImageBlob
                                ? {
                                    type: "blob",
                                    value: formData.backgroundImageBlob,
                                    objectFit: formData.backgroundObjectFit,
                                  }
                                : formData.backgroundType === "blob" &&
                                    !formData.backgroundImageBlob &&
                                    profile?.value.background.type === "blob"
                                  ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    (profile.value.background as any)
                                  : formData.backgroundType === "url"
                                    ? {
                                        type: "url",
                                        value: formData.backgroundImageUrl,
                                        objectFit: formData.backgroundObjectFit,
                                      }
                                    : {
                                        type: "color",
                                        value: formData.backgroundColor,
                                      },
                          links: formData.links.map((link, index) => ({
                            icon: link.icon
                              ? link.icon instanceof Blob
                                ? { type: "blob", value: link.icon }
                                : { type: "url", value: link.icon }
                              : profile?.value.links?.[index]?.icon?.type ===
                                  "blob"
                                ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                  (profile.value.links[index].icon as any)
                                : undefined,
                            label: link.label,
                            href: link.href,
                          })),
                        });
                        if (result) {
                          refetch(session.handle);
                        }
                      }}
                    >
                      {updateLoading ? "Updating..." : "Update Profile"}
                    </Button>

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
                            profileImageUrl: "",
                            profileImageBlob: null,
                            backgroundImageUrl: "",
                            backgroundImageBlob: null,
                            backgroundColor: "#1a1a1a",
                            backgroundType: "color",
                            backgroundObjectFit: "cover",
                            links: [],
                          });
                          refetch(session.handle);
                        }
                      }}
                    >
                      {deleteLoading ? "Deleting..." : "Delete"}
                    </Button>
                  </XStack>
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
