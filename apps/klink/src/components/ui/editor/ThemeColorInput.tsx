import { YStack, XStack } from "@tamagui/stacks";
import { Paragraph } from "@tamagui/text";
import { useAtomValue, useSetAtom } from "jotai";
import { primaryColorAtom, secondaryColorAtom } from "../../../atoms/profile";
import { useRef } from "react";
import { Input } from "@tamagui/input";

export function ThemeColorInput() {
  const primaryColor = useAtomValue(primaryColorAtom);
  const setPrimaryColor = useSetAtom(primaryColorAtom);
  const secondaryColor = useAtomValue(secondaryColorAtom);
  const setSecondaryColor = useSetAtom(secondaryColorAtom);
  const primaryColorInputRef = useRef<HTMLInputElement>(null);
  const secondaryColorInputRef = useRef<HTMLInputElement>(null);

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
          <Input
            id="primary-color"
            ref={primaryColorInputRef}
            type="color"
            defaultValue={primaryColor}
            onBlur={(e) =>
              setPrimaryColor((e.target as unknown as HTMLInputElement).value)
            }
            width="100%"
            size="$4"
          />
        </XStack>
      </YStack>

      <YStack gap="$2">
        <Paragraph color="$textMuted" fontSize="$3">
          Secondary (Buttons)
        </Paragraph>
        <XStack gap="$2" alignItems="center">
          <Input
            id="secondary-color"
            ref={secondaryColorInputRef}
            type="color"
            defaultValue={secondaryColor}
            onBlur={(e) =>
              setSecondaryColor((e.target as unknown as HTMLInputElement).value)
            }
            width="100%"
            size="$4"
          />
        </XStack>
      </YStack>
    </YStack>
  );
}
