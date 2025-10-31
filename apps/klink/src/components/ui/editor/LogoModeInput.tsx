import { useAtomValue, useSetAtom } from "jotai";
import { logoModeAtom } from "../../../atoms/profile";
import { Button } from "@tamagui/button";
import { YStack, XStack } from "@tamagui/stacks";
import { Paragraph } from "@tamagui/text";

export function LogoModeInput() {
  const atomValue = useAtomValue(logoModeAtom);
  const setLogoMode = useSetAtom(logoModeAtom);

  return (
    <YStack gap="$2">
      <Paragraph>Logo Display:</Paragraph>
      <XStack gap="$2" flexWrap="wrap">
        {(["show", "none"] as const).map((logoMode) => (
          <Button
            key={logoMode}
            size="$2"
            backgroundColor={atomValue === logoMode ? "$accent" : "unset"}
            onPress={() => setLogoMode(logoMode)}
          >
            {logoMode}
          </Button>
        ))}
      </XStack>
    </YStack>
  );
}
