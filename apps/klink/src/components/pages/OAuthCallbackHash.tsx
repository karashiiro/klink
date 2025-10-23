import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router";
import { YStack } from "@tamagui/stacks";
import { H2 } from "@tamagui/text";
import { Loader } from "@tamagui/lucide-icons";
import { useAuth } from "@kpaste-app/atproto-auth";

export function OAuthCallbackHash() {
  const navigate = useNavigate();
  const { handleOAuthCallback } = useAuth();

  // Helper function to handle navigation with return URL cleanup
  const navigateWithReturnUrl = useCallback(
    (defaultPath: string = "/") => {
      const returnUrl = localStorage.getItem("kpaste_return_url");
      localStorage.removeItem("kpaste_return_url");
      navigate(returnUrl || defaultPath, { replace: true });
    },
    [navigate],
  );

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Retrieve OAuth parameters from localStorage
        const oauthDataStr = localStorage.getItem("klink_oauth_callback");
        if (!oauthDataStr) {
          navigateWithReturnUrl();
          return;
        }

        const { params, timestamp } = JSON.parse(oauthDataStr);

        // Check if the data is not too old (5 minutes)
        const now = Date.now();
        if (now - timestamp > 5 * 60 * 1000) {
          localStorage.removeItem("klink_oauth_callback");
          navigateWithReturnUrl();
          return;
        }

        // Clean up the stored data
        localStorage.removeItem("klink_oauth_callback");

        // Convert params string back to URLSearchParams
        const oauthParams = new URLSearchParams(params);

        // Handle the OAuth callback
        await handleOAuthCallback(oauthParams);

        // Small delay to ensure auth state is updated
        setTimeout(() => {
          navigateWithReturnUrl();
        }, 100);
      } catch {
        // Redirect to original page after delay
        setTimeout(() => {
          navigateWithReturnUrl();
        }, 3000);
      }
    };

    processCallback();
  }, [handleOAuthCallback, navigateWithReturnUrl]);

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
