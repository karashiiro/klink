import { Button } from "@tamagui/button";
import { useAuth } from "@kpaste-app/atproto-auth";

export function LogoutButton() {
  const { logout } = useAuth();

  return (
    <Button
      flex={1}
      size="$4"
      backgroundColor="$gray8"
      color="white"
      borderColor="$gray7"
      hoverStyle={{
        backgroundColor: "$gray9",
        borderColor: "$gray8",
      }}
      pressStyle={{
        backgroundColor: "$gray10",
        borderColor: "$gray9",
      }}
      onPress={() => logout()}
    >
      Logout
    </Button>
  );
}
