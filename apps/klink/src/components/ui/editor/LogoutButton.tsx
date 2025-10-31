import { Button } from "@tamagui/button";
import { useAuth } from "@kpaste-app/atproto-auth";

export function LogoutButton() {
  const { logout } = useAuth();

  return (
    <Button flex={1} size="$4" onPress={() => logout()}>
      Logout
    </Button>
  );
}
