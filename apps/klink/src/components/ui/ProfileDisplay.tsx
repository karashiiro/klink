import { YStack, XStack } from "@tamagui/stacks";
import { H1, Paragraph } from "@tamagui/text";
import { Button } from "@tamagui/button";
import { AtProtoImage } from "./AtProtoImage";
import { CustomStylesheet } from "./CustomStylesheet";
import {
  getContrastTextColor,
  getMutedTextColor,
} from "../../utils/colorUtils";
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
  // Get theme colors with fallbacks
  const primaryColor = profileData.theme?.primaryColor || "#364163";
  const secondaryColor = profileData.theme?.secondaryColor || "#a58431";
  const fontFamily = profileData.theme?.fontFamily;
  const stylesheet = profileData.theme?.stylesheet;

  // Calculate contrast colors
  const textColor = getContrastTextColor(primaryColor);
  const mutedTextColor = getMutedTextColor(primaryColor);
  const buttonTextColor = getContrastTextColor(secondaryColor);

  return (
    <>
      <CustomStylesheet stylesheet={stylesheet} id={`profile-${did || handle}`} />
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
              <H1 color={textColor} size="$9" style={fontFamily ? { fontFamily } : undefined}>
                {profileData.name}
              </H1>
              <Paragraph color={mutedTextColor} fontSize="$6" style={fontFamily ? { fontFamily } : undefined}>
                @{handle}
              </Paragraph>
            </>
          ) : (
            <H1 color={textColor} size="$9" style={fontFamily ? { fontFamily } : undefined}>
              @{handle}
            </H1>
          )}

          {profileData.location && (
            <Paragraph color={mutedTextColor} fontSize="$3" style={fontFamily ? { fontFamily } : undefined}>
              📍 {profileData.location}
            </Paragraph>
          )}
        </YStack>
      </XStack>

      <Paragraph
        color={textColor}
        textAlign="center"
        fontSize="$5"
        lineHeight="$6"
        style={fontFamily ? { fontFamily } : undefined}
      >
        {profileData.bio}
      </Paragraph>

      {profileData.links && profileData.links.length > 0 && (
        <YStack gap="$3" width="100%" marginTop="$4">
          {profileData.links.map((link, index) => (
            <Button
              key={index}
              size="$5"
              backgroundColor={secondaryColor}
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
              <Paragraph color={buttonTextColor} fontWeight="bold" style={fontFamily ? { fontFamily } : undefined}>
                {link.label}
              </Paragraph>
            </Button>
          ))}
        </YStack>
      )}
    </YStack>
    </>
  );
}
