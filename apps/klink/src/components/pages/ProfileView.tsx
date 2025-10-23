import { useLoaderData } from "react-router";
import { YStack, XStack } from "@tamagui/stacks";
import { H1, H2, Paragraph } from "@tamagui/text";
import { Card } from "@tamagui/card";
import { Image } from "@tamagui/image";
import { Button } from "@tamagui/button";
import type { ProfileRecord } from "../../hooks/useReadProfile";

export function ProfileView() {
  const profile = useLoaderData() as ProfileRecord | null;

  if (!profile) {
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
          maxWidth={600}
          width="100%"
          padding="$6"
        >
          <YStack gap="$4" alignItems="center">
            <H1 color="$textTitle">Profile Not Found</H1>
            <Paragraph color="$textMuted" textAlign="center">
              This user hasn't created a KLink profile yet.
            </Paragraph>
          </YStack>
        </Card>
      </YStack>
    );
  }

  const { value } = profile;
  const backgroundStyle =
    value.background.type === "color"
      ? { backgroundColor: value.background.value }
      : value.background.type === "url"
        ? {
            backgroundImage: `url(${value.background.value})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }
        : {};

  return (
    <YStack
      flex={1}
      style={backgroundStyle}
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
        maxWidth={600}
        width="100%"
        padding="$6"
      >
        <YStack gap="$4" alignItems="center">
          {/* Profile Image */}
          {value.profileImage?.type === "url" && (
            <Image
              source={{ uri: value.profileImage.value }}
              width={120}
              height={120}
              borderRadius="$12"
              backgroundColor="$secondary"
            />
          )}

          {/* Name */}
          {value.name && (
            <H1 color="$textTitle" textAlign="center">
              {value.name}
            </H1>
          )}

          {/* Location */}
          {value.location && (
            <Paragraph color="$textMuted" textAlign="center">
              📍 {value.location}
            </Paragraph>
          )}

          {/* Bio */}
          <Paragraph color="$textBody" textAlign="center" fontSize="$5">
            {value.bio}
          </Paragraph>

          {/* Links */}
          {value.links && value.links.length > 0 && (
            <YStack gap="$3" width="100%" marginTop="$4">
              {value.links.map((link, index) => (
                <Button
                  key={index}
                  size="$5"
                  backgroundColor="$accent"
                  hoverStyle={{ opacity: 0.8 }}
                  pressStyle={{ opacity: 0.6 }}
                  onPress={() => {
                    if (typeof window !== "undefined") {
                      window.open(link.href, "_blank");
                    }
                  }}
                >
                  <XStack gap="$2" alignItems="center">
                    {link.icon?.type === "url" && (
                      <Image
                        source={{ uri: link.icon.value }}
                        width={20}
                        height={20}
                        borderRadius="$2"
                      />
                    )}
                    <Paragraph color="white" fontWeight="bold">
                      {link.label}
                    </Paragraph>
                  </XStack>
                </Button>
              ))}
            </YStack>
          )}
        </YStack>
      </Card>
    </YStack>
  );
}
