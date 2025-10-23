import { YStack, XStack } from "@tamagui/stacks";
import { H1, Paragraph } from "@tamagui/text";
import { Button } from "@tamagui/button";
import { Card } from "@tamagui/card";
import { useAuth } from "@kpaste-app/atproto-auth";
import { Loader } from "@tamagui/lucide-icons";

export function Home() {
  const { authState, startLogin, logout, session } = useAuth();

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
              onPress={() => startLogin({ handle: "user.bsky.social" })}
              width="100%"
            >
              Login with ATProto
            </Button>
          )}

          {authState.state === "authenticated" && session && (
            <YStack gap="$3" width="100%" alignItems="center">
              <Paragraph fontSize="$5" color="$textTitle" textAlign="center">
                Welcome back, {session.profile?.handle ?? "User"}!
              </Paragraph>

              <Paragraph fontSize="$3" color="$textMuted" textAlign="center">
                Your profile DID: {session.profile?.did ?? "Unknown"}
              </Paragraph>

              <XStack gap="$3" marginTop="$2">
                <Button
                  size="$4"
                  backgroundColor="$redBase"
                  hoverStyle={{ backgroundColor: "$redHover" }}
                  pressStyle={{ backgroundColor: "$redPress" }}
                  color="white"
                  onPress={logout}
                >
                  Logout
                </Button>
              </XStack>
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
