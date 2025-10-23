import { useEffect } from "react";
import { useNavigate } from "react-router";
import { YStack } from "@tamagui/stacks";
import { H2 } from "@tamagui/text";
import { Loader } from "@tamagui/lucide-icons";
import { useAuth } from "@kpaste-app/atproto-auth";

export function OAuthCallbackHash() {
  const navigate = useNavigate();
  const { handleOAuthCallback } = useAuth();

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Retrieve OAuth parameters from localStorage
        const storedData = localStorage.getItem("klink_oauth_callback");

        if (!storedData) {
          console.error("No OAuth callback data found");
          navigate("/");
          return;
        }

        const { params, timestamp } = JSON.parse(storedData);

        // Check if the data is not too old (5 minutes)
        const now = Date.now();
        if (now - timestamp > 5 * 60 * 1000) {
          console.error("OAuth callback data expired");
          localStorage.removeItem("klink_oauth_callback");
          navigate("/");
          return;
        }

        // Clean up the stored data
        localStorage.removeItem("klink_oauth_callback");

        // Convert params string back to URLSearchParams
        const oauthParams = new URLSearchParams(params);

        // Handle the OAuth callback
        await handleOAuthCallback(oauthParams);

        // Navigate to home page after successful authentication
        navigate("/");
      } catch (error) {
        console.error("Error processing OAuth callback:", error);
        navigate("/");
      }
    };

    processCallback();
  }, [handleOAuthCallback, navigate]);

  return (
    <YStack
      flex={1}
      backgroundColor="$background"
      alignItems="center"
      justifyContent="center"
      gap="$4"
    >
      <Loader size="$2" color="$accent" />
      <H2 color="$textTitle">Completing authentication...</H2>
    </YStack>
  );
}
