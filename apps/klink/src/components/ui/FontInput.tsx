import { YStack } from "@tamagui/stacks";
import { Paragraph } from "@tamagui/text";
import { Input } from "@tamagui/input";
import { useAtomValue, useSetAtom } from "jotai";
import { fontFamilyAtom, stylesheetAtom } from "../../atoms/profile";
import { useState, useEffect, type FormEvent } from "react";
import type { TextInputChangeEvent } from "react-native";

export function FontInput() {
  const fontFamilyValue = useAtomValue(fontFamilyAtom);
  const setFontFamily = useSetAtom(fontFamilyAtom);
  const stylesheetValue = useAtomValue(stylesheetAtom);
  const setStylesheet = useSetAtom(stylesheetAtom);

  const [localFontFamily, setLocalFontFamily] = useState(fontFamilyValue);
  const [localStylesheet, setLocalStylesheet] = useState(stylesheetValue);

  // Sync local value when atom changes (e.g., when profile loads)
  useEffect(() => {
    setLocalFontFamily(fontFamilyValue);
  }, [fontFamilyValue]);

  useEffect(() => {
    setLocalStylesheet(stylesheetValue);
  }, [stylesheetValue]);

  return (
    <YStack gap="$3">
      <Paragraph color="white" fontWeight="bold" fontSize="$4">
        Custom Fonts
      </Paragraph>

      <YStack gap="$2">
        <Paragraph color="$textMuted" fontSize="$3">
          Font Family
        </Paragraph>
        <Input
          value={localFontFamily}
          onChange={(e: FormEvent<HTMLInputElement> | TextInputChangeEvent) => {
            const text = (e.target as HTMLInputElement).value;
            setLocalFontFamily(text);
            setFontFamily(text);
          }}
          placeholder="e.g., 'Roboto', 'Comic Sans MS', sans-serif"
          backgroundColor="rgba(255, 255, 255, 0.1)"
          borderColor="rgba(255, 255, 255, 0.2)"
          color="white"
          style={{ color: "white" }}
        />
        <Paragraph color="rgba(255, 255, 255, 0.6)" fontSize="$2">
          CSS font-family value to apply to your profile
        </Paragraph>
      </YStack>

      <YStack gap="$2">
        <Paragraph color="$textMuted" fontSize="$3">
          Custom Stylesheet
        </Paragraph>
        <textarea
          value={localStylesheet}
          onChange={(e) => {
            const text = e.target.value;
            setLocalStylesheet(text);
            setStylesheet(text);
          }}
          placeholder="@import url('https://fonts.googleapis.com/css2?family=Roboto&display=swap');"
          rows={6}
          style={{
            width: "288px",
            minHeight: 120,
            padding: "12px",
            fontFamily: "monospace",
            fontSize: "14px",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "8px",
            color: "white",
            resize: "vertical",
          }}
        />
        <Paragraph color="rgba(255, 255, 255, 0.6)" fontSize="$2">
          Include @font-face or @import to load custom fonts (max 5000 chars)
        </Paragraph>
      </YStack>
    </YStack>
  );
}
