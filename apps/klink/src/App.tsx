import { Outlet } from "react-router";
import { YStack } from "@tamagui/stacks";

export function App() {
  return (
    <YStack flex={1} backgroundColor="$background">
      <Outlet />
    </YStack>
  );
}
