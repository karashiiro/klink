import { useLoaderData } from "react-router";
import { YStack } from "@tamagui/stacks";
import { H1, Paragraph } from "@tamagui/text";
import { Card } from "@tamagui/card";
import type { ProfileRecord } from "../../hooks/useReadProfile";
import { ProfileDisplay } from "../ui/ProfileDisplay";
import { BackgroundRenderer } from "../ui/BackgroundRenderer";
import { getBackgroundStyle } from "../../utils/backgroundUtils";

export function ProfileView() {
  const data = useLoaderData() as
    | (ProfileRecord & { pdsUrl: string; did: string; handle: string })
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

  const { value, pdsUrl, did, handle } = data;
  const backgroundStyle = getBackgroundStyle(value.background, pdsUrl, did);
  const primaryColor = value.theme?.primaryColor || "#364163";

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
      <BackgroundRenderer
        background={value.background}
        pdsUrl={pdsUrl}
        did={did}
      />
      <Card
        elevate
        size="$4"
        bordered
        backgroundColor={primaryColor}
        maxWidth={600}
        width="100%"
        padding="$6"
      >
        <ProfileDisplay
          profileData={value}
          handle={handle}
          pdsUrl={pdsUrl}
          did={did}
        />
      </Card>
    </YStack>
  );
}
