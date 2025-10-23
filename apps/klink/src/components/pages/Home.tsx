import { useState, useEffect, useRef, type FormEvent } from "react";
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
import type { BlurEvent, TextInputChangeEvent } from "react-native";

export function Home() {
  const { authState, startLogin, logout, session } = useAuth();
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

  // Form state
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [profileImageBlob, setProfileImageBlob] = useState<Blob | null>(null);
  const [backgroundImageUrl, setBackgroundImageUrl] = useState("");
  const [backgroundImageBlob, setBackgroundImageBlob] = useState<Blob | null>(
    null,
  );
  const [backgroundColor, setBackgroundColor] = useState("#1a1a1a");
  const [backgroundType, setBackgroundType] = useState<
    "color" | "url" | "blob"
  >("color");
  const [links, setLinks] = useState<
    Array<{ icon?: string | Blob; label: string; href: string }>
  >([]);
  const colorInputRef = useRef<HTMLInputElement>(null);

  // Load profile data into form when it exists
  useEffect(() => {
    if (profile) {
      setName(profile.value.name || "");
      setLocation(profile.value.location || "");
      setBio(profile.value.bio || "");

      // Profile image
      if (profile.value.profileImage?.type === "url") {
        setProfileImageUrl(profile.value.profileImage.value);
      }

      // Background
      if (profile.value.background.type === "color") {
        setBackgroundType("color");
        const newColor = profile.value.background.value;
        setBackgroundColor(newColor);
        if (colorInputRef.current) {
          colorInputRef.current.value = newColor;
        }
      } else if (profile.value.background.type === "url") {
        setBackgroundType("url");
        setBackgroundImageUrl(profile.value.background.value);
      }

      // Links
      const loadedLinks = (profile.value.links || []).map((link) => ({
        icon: link.icon?.type === "url" ? link.icon.value : undefined,
        label: link.label,
        href: link.href,
      }));
      setLinks(loadedLinks);
    }
  }, [profile]);

  // Input handlers
  const handleNameChange = (
    e: FormEvent<HTMLInputElement> | TextInputChangeEvent,
  ) => setName((e.target as HTMLInputElement).value);

  const handleLocationChange = (
    e: FormEvent<HTMLInputElement> | TextInputChangeEvent,
  ) => setLocation((e.target as HTMLInputElement).value);

  const handleBioChange = (
    e: FormEvent<HTMLInputElement> | TextInputChangeEvent,
  ) => setBio((e.target as HTMLInputElement).value);

  const handleProfileImageChange = (
    e: FormEvent<HTMLInputElement> | TextInputChangeEvent,
  ) => {
    setProfileImageUrl((e.target as HTMLInputElement).value);
    setProfileImageBlob(null); // Clear blob when URL is entered
  };

  const handleBackgroundImageChange = (
    e: FormEvent<HTMLInputElement> | TextInputChangeEvent,
  ) => {
    setBackgroundImageUrl((e.target as HTMLInputElement).value);
    setBackgroundImageBlob(null); // Clear blob when URL is entered
  };

  // Color change handler - only update state when done selecting
  const handleColorChange = (e: BlurEvent) => {
    const newColor = (e.target as unknown as HTMLInputElement).value;
    setBackgroundColor(newColor);
  };

  // File upload handlers
  const handleProfileImageFile = (
    e: FormEvent<HTMLInputElement> | TextInputChangeEvent,
  ) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      setProfileImageBlob(file);
      setProfileImageUrl(""); // Clear URL when file is selected
    }
  };

  const handleBackgroundImageFile = (
    e: FormEvent<HTMLInputElement> | TextInputChangeEvent,
  ) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      setBackgroundImageBlob(file);
      setBackgroundImageUrl(""); // Clear URL when file is selected
      setBackgroundType("blob");
    }
  };

  const handleLinkIconFile = (
    index: number,
    e: FormEvent<HTMLInputElement> | TextInputChangeEvent,
  ) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      const newLinks = [...links];
      newLinks[index].icon = file;
      setLinks(newLinks);
    }
  };

  // Link management
  const addLink = () => {
    setLinks([...links, { icon: "", label: "", href: "" }]);
  };

  const updateLink = (
    index: number,
    field: "icon" | "label" | "href",
    value: string,
  ) => {
    const newLinks = [...links];
    newLinks[index][field] = value;
    setLinks(newLinks);
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
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
                    urlValue={profileImageUrl}
                    blob={profileImageBlob}
                    onUrlChange={handleProfileImageChange}
                    onFileChange={handleProfileImageFile}
                  />

                  <Input
                    placeholder="Name (optional)"
                    value={name}
                    onChange={handleNameChange}
                    backgroundColor="$secondary"
                    color="$textBody"
                    borderColor="$border"
                    size="$4"
                  />

                  <Input
                    placeholder="Location (optional)"
                    value={location}
                    onChange={handleLocationChange}
                    backgroundColor="$secondary"
                    color="$textBody"
                    borderColor="$border"
                    size="$4"
                  />

                  <Input
                    placeholder="Bio (required)"
                    value={bio}
                    onChange={handleBioChange}
                    backgroundColor="$secondary"
                    color="$textBody"
                    borderColor="$border"
                    size="$4"
                  />

                  <BackgroundSelector
                    backgroundType={backgroundType}
                    backgroundColor={backgroundColor}
                    backgroundImageUrl={backgroundImageUrl}
                    backgroundImageBlob={backgroundImageBlob}
                    colorInputRef={colorInputRef}
                    onTypeChange={setBackgroundType}
                    onColorChange={handleColorChange}
                    onUrlChange={handleBackgroundImageChange}
                    onFileChange={handleBackgroundImageFile}
                  />

                  <LinkEditor
                    links={links}
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
                    disabled={createLoading || !bio.trim()}
                    onPress={async () => {
                      const result = await createProfile({
                        profileImage: profileImageBlob
                          ? { type: "blob", value: profileImageBlob }
                          : profileImageUrl
                            ? { type: "url", value: profileImageUrl }
                            : undefined,
                        name: name || undefined,
                        location: location || undefined,
                        bio,
                        background:
                          backgroundType === "color"
                            ? { type: "color", value: backgroundColor }
                            : backgroundType === "blob"
                              ? { type: "blob", value: backgroundImageBlob! }
                              : { type: "url", value: backgroundImageUrl },
                        links: links.map((link) => ({
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
                    urlValue={profileImageUrl}
                    blob={profileImageBlob}
                    onUrlChange={handleProfileImageChange}
                    onFileChange={handleProfileImageFile}
                  />

                  <Input
                    placeholder="Name (optional)"
                    value={name}
                    onChange={handleNameChange}
                    backgroundColor="$secondary"
                    color="$textBody"
                    borderColor="$border"
                    size="$4"
                  />

                  <Input
                    placeholder="Location (optional)"
                    value={location}
                    onChange={handleLocationChange}
                    backgroundColor="$secondary"
                    color="$textBody"
                    borderColor="$border"
                    size="$4"
                  />

                  <Input
                    placeholder="Bio (required)"
                    value={bio}
                    onChange={handleBioChange}
                    backgroundColor="$secondary"
                    color="$textBody"
                    borderColor="$border"
                    size="$4"
                  />

                  <BackgroundSelector
                    backgroundType={backgroundType}
                    backgroundColor={backgroundColor}
                    backgroundImageUrl={backgroundImageUrl}
                    backgroundImageBlob={backgroundImageBlob}
                    colorInputRef={colorInputRef}
                    onTypeChange={setBackgroundType}
                    onColorChange={handleColorChange}
                    onUrlChange={handleBackgroundImageChange}
                    onFileChange={handleBackgroundImageFile}
                  />

                  <LinkEditor
                    links={links}
                    onAddLink={addLink}
                    onUpdateLink={updateLink}
                    onRemoveLink={removeLink}
                    onIconFileChange={handleLinkIconFile}
                  />

                  <XStack gap="$2">
                    <Button
                      flex={1}
                      size="$4"
                      backgroundColor="$accent"
                      hoverStyle={{ opacity: 0.8 }}
                      color="white"
                      disabled={updateLoading || !bio.trim()}
                      onPress={async () => {
                        const result = await updateProfile({
                          profileImage: profileImageBlob
                            ? { type: "blob", value: profileImageBlob }
                            : profileImageUrl
                              ? { type: "url", value: profileImageUrl }
                              : undefined,
                          name: name || undefined,
                          location: location || undefined,
                          bio,
                          background:
                            backgroundType === "color"
                              ? { type: "color", value: backgroundColor }
                              : backgroundType === "blob"
                                ? { type: "blob", value: backgroundImageBlob! }
                                : { type: "url", value: backgroundImageUrl },
                          links: links.map((link) => ({
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
                          setProfileImageUrl("");
                          setProfileImageBlob(null);
                          setName("");
                          setLocation("");
                          setBio("");
                          setBackgroundColor("#1a1a1a");
                          setBackgroundImageUrl("");
                          setBackgroundImageBlob(null);
                          setBackgroundType("color");
                          setLinks([]);
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
                onPress={() => startLogin({ handle: "user.bsky.social" })}
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
