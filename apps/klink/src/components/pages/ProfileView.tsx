import { useLoaderData } from "react-router";
import { YStack } from "@tamagui/stacks";
import { H1, Paragraph } from "@tamagui/text";
import { Card } from "@tamagui/card";
import { Button } from "@tamagui/button";
import type { ProfileRecord } from "../../hooks/useReadProfile";
import { AtProtoImage } from "../ui/AtProtoImage";
import { getBackgroundStyle } from "../../utils/backgroundUtils";

export function ProfileView() {
  const data = useLoaderData() as
    | (ProfileRecord & { pdsUrl: string; did: string })
    | null;

  if (!data) {
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

  const { value, pdsUrl, did } = data;
  const backgroundStyle = getBackgroundStyle(value.background, pdsUrl, did);

  return (
    <YStack
      flex={1}
      style={backgroundStyle}
      paddingVertical="$6"
      paddingHorizontal="$4"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      width="100%"
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
          <AtProtoImage
            image={value.profileImage}
            pdsUrl={pdsUrl}
            did={did}
            width={120}
            height={120}
            borderRadius={60}
          />

          {/* Name */}
          {value.name && (
            <H1 color="$textTitle" textAlign="center" size="$9">
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
                  position="relative"
                  onPress={() => {
                    if (typeof window !== "undefined") {
                      window.open(link.href, "_blank");
                    }
                  }}
                >
                  {link.icon && (
                    <div
                      style={{
                        position: "absolute",
                        left: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                      }}
                    >
                      <AtProtoImage
                        image={link.icon}
                        pdsUrl={pdsUrl}
                        did={did}
                        width={40}
                        height={40}
                      />
                    </div>
                  )}
                  <Paragraph color="white" fontWeight="bold">
                    {link.label}
                  </Paragraph>
                </Button>
              ))}
            </YStack>
          )}
        </YStack>
      </Card>
    </YStack>
  );
}
