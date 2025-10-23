import { useState } from "react";
import { Outlet, useLocation } from "react-router";
import { YStack } from "@tamagui/stacks";
import { OAuthModal, AuthModalProvider } from "@kpaste-app/ui";

export function App() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const location = useLocation();

  const handleLoginClick = () => {
    // Save current URL for post-login redirect
    localStorage.setItem(
      "klink_return_url",
      location.pathname + location.search + location.hash,
    );
    setShowAuthModal(true);
  };

  return (
    <AuthModalProvider onOpenAuthModal={handleLoginClick}>
      <YStack flex={1} backgroundColor="$background">
        <Outlet />
      </YStack>
      <OAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </AuthModalProvider>
  );
}
