import { YStack, XStack } from "@tamagui/stacks";
import { H1, Paragraph } from "@tamagui/text";
import { Button } from "@tamagui/button";
import { AtProtoImage } from "./AtProtoImage";
import type { Main } from "@klink-app/lexicon/types";

interface ProfileDisplayProps {
  profileData: Main;
  handle: string;
  pdsUrl?: string;
  did?: string;
}

export function ProfileDisplay({
  profileData,
  handle,
  pdsUrl,
  did,
}: ProfileDisplayProps) {
  return (
    <YStack gap="$4">
      <XStack gap="$4" alignItems="flex-start">
        <AtProtoImage
          image={profileData.profileImage}
          pdsUrl={pdsUrl}
          did={did}
          width={120}
          height={120}
          borderRadius={60}
        />

        <YStack gap="$2" flex={1} justifyContent="center">
          {profileData.name ? (
            <>
              <H1 color="$textTitle" size="$9">
                {profileData.name}
              </H1>
              <Paragraph color="$textMuted" fontSize="$6">
                @{handle}
              </Paragraph>
            </>
          ) : (
            <H1 color="$textTitle" size="$9">
              @{handle}
            </H1>
          )}

          {profileData.location && (
            <Paragraph color="$textMuted" fontSize="$3">
              📍 {profileData.location}
            </Paragraph>
          )}
        </YStack>
      </XStack>

      <Paragraph
        color="$textBody"
        textAlign="center"
        fontSize="$5"
        lineHeight="$6"
      >
        {profileData.bio}
      </Paragraph>

      {profileData.links && profileData.links.length > 0 && (
        <YStack gap="$3" width="100%" marginTop="$4">
          {profileData.links.map((link, index) => (
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
              icon={
                <>
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
                </>
              }
            >
              <Paragraph color="white" fontWeight="bold">
                {link.label}
              </Paragraph>
            </Button>
          ))}
        </YStack>
      )}
    </YStack>
  );
}
