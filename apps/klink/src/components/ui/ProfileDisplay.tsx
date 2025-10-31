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
import { Card } from "@tamagui/card";
import { MapPin } from "@tamagui/lucide-icons";
import type { Background } from "../../utils/backgroundUtils";
import type { ProfileImage } from "../../utils/profileUtils";
import type { Link } from "../../utils/linkUtils";
import { LogoLink } from "./LogoLink";

// Extended type that allows browser Blobs for preview mode
// This is needed because during editing, we have browser Blob objects
// before they're uploaded to the PDS as ATProto blobs
export type ProfileData = Omit<
  Main,
  "background" | "links" | "profileImage"
> & {
  profileImage?: ProfileImage;
  background: Background;
  links: Link[];
};

interface ProfileDisplayProps {
  profileData: ProfileData;
  handle: string;
}

export function ProfileDisplay({ profileData, handle }: ProfileDisplayProps) {
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
    <YStack width="100%" alignItems="center" gap="$8">
      <Card
        elevate
        size="$4"
        bordered
        backgroundColor={primaryColor}
        borderColor={textColor}
        maxWidth={600}
        width="100%"
        padding="$6"
      >
        <CustomStylesheet stylesheet={stylesheet} id={`profile-${handle}`} />
        <YStack gap="$4">
          <XStack
            gap="$4"
            flexDirection="column"
            alignItems="center"
            $md={{ flexDirection: "row", alignItems: "flex-start" }}
          >
            <AtProtoImage
              image={profileData.profileImage}
              width={120}
              height={120}
              borderRadius={60}
            />

            <YStack
              gap="$2"
              flex={1}
              justifyContent="center"
              alignItems="center"
              $md={{ alignItems: "flex-start" }}
            >
              {profileData.name ? (
                <>
                  <H1
                    color={textColor}
                    size="$9"
                    style={{ fontFamily }}
                    textAlign="center"
                    $md={{ textAlign: "left" }}
                  >
                    {profileData.name}
                  </H1>
                  <Paragraph
                    color={mutedTextColor}
                    fontSize="$6"
                    style={{ fontFamily }}
                    textAlign="center"
                    $md={{ textAlign: "left" }}
                  >
                    @{handle}
                  </Paragraph>
                </>
              ) : (
                <H1
                  color={textColor}
                  size="$9"
                  style={{ fontFamily }}
                  textAlign="center"
                  $md={{ textAlign: "left" }}
                >
                  @{handle}
                </H1>
              )}

              {profileData.location && (
                <Paragraph
                  color={mutedTextColor}
                  fontSize="$3"
                  style={{ fontFamily }}
                  textAlign="center"
                  $md={{ textAlign: "left" }}
                >
                  <MapPin width={16} height={16} color={mutedTextColor} />
                  &nbsp;{profileData.location}
                </Paragraph>
              )}
            </YStack>
          </XStack>

          <Paragraph
            color={textColor}
            textAlign="center"
            fontSize="$5"
            lineHeight="$6"
            style={{ fontFamily }}
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
                  borderColor={buttonTextColor}
                  hoverStyle={{
                    backgroundColor: secondaryColor,
                    borderColor: buttonTextColor,
                    opacity: 0.8,
                  }}
                  pressStyle={{
                    backgroundColor: secondaryColor,
                    borderColor: buttonTextColor,
                    opacity: 0.6,
                  }}
                  position="relative"
                  onPress={() => {
                    if (link.href && typeof window !== "undefined") {
                      window.open(link.href, "_blank");
                    }
                  }}
                  icon={() => (
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
                            width={40}
                            height={40}
                          />
                        </div>
                      )}
                    </>
                  )}
                >
                  <Paragraph
                    color={buttonTextColor}
                    fontWeight="bold"
                    style={{ fontFamily }}
                  >
                    {link.label}
                  </Paragraph>
                </Button>
              ))}
            </YStack>
          )}
        </YStack>
      </Card>
      {profileData.logoMode === "show" && <LogoLink opacity={0.7} />}
    </YStack>
  );
}
