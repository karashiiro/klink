import { YStack, XStack } from "@tamagui/stacks";
import { Paragraph } from "@tamagui/text";
import { useAtomValue, useSetAtom } from "jotai";
import { primaryColorAtom, secondaryColorAtom } from "../../atoms/profile";

export function ThemeColorInput() {
  const primaryColor = useAtomValue(primaryColorAtom);
  const setPrimaryColor = useSetAtom(primaryColorAtom);
  const secondaryColor = useAtomValue(secondaryColorAtom);
  const setSecondaryColor = useSetAtom(secondaryColorAtom);

  return (
    <YStack gap="$3">
      <Paragraph color="white" fontWeight="bold" fontSize="$4">
        Theme Colors
      </Paragraph>

      <YStack gap="$2">
        <Paragraph color="$textMuted" fontSize="$3">
          Primary (Card)
        </Paragraph>
        <XStack gap="$2" alignItems="center">
          <input
            id="primary-color"
            type="color"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
            style={{
              width: "100%",
              height: "48px",
              borderRadius: "8px",
              border: "2px solid rgba(255, 255, 255, 0.2)",
              cursor: "pointer",
            }}
          />
        </XStack>
      </YStack>

      <YStack gap="$2">
        <Paragraph color="$textMuted" fontSize="$3">
          Secondary (Buttons)
        </Paragraph>
        <XStack gap="$2" alignItems="center">
          <input
            id="secondary-color"
            type="color"
            value={secondaryColor}
            onChange={(e) => setSecondaryColor(e.target.value)}
            style={{
              width: "100%",
              height: "48px",
              borderRadius: "8px",
              border: "2px solid rgba(255, 255, 255, 0.2)",
              cursor: "pointer",
            }}
          />
        </XStack>
      </YStack>
    </YStack>
  );
}
