import type { FormEvent, RefObject } from "react";
import { YStack, XStack } from "@tamagui/stacks";
import { Paragraph } from "@tamagui/text";
import { Button } from "@tamagui/button";
import { Input } from "@tamagui/input";
import type { BlurEvent, TextInputChangeEvent } from "react-native";

interface BackgroundSelectorProps {
  backgroundType: "color" | "url" | "blob";
  backgroundColor: string;
  backgroundImageUrl: string;
  backgroundImageBlob: Blob | null;
  colorInputRef: RefObject<HTMLInputElement | null>;
  onTypeChange: (type: "color" | "url" | "blob") => void;
  onColorChange: (e: BlurEvent) => void;
  onUrlChange: (e: FormEvent<HTMLInputElement> | TextInputChangeEvent) => void;
  onFileChange: (e: FormEvent<HTMLInputElement> | TextInputChangeEvent) => void;
}

export function BackgroundSelector({
  backgroundType,
  backgroundColor,
  backgroundImageUrl,
  backgroundImageBlob,
  colorInputRef,
  onTypeChange,
  onColorChange,
  onUrlChange,
  onFileChange,
}: BackgroundSelectorProps) {
  return (
    <YStack gap="$2">
      <Paragraph color="$textBody">Background:</Paragraph>
      <XStack gap="$2">
        <Button
          size="$3"
          flex={1}
          backgroundColor={
            backgroundType === "color" ? "$accent" : "$secondary"
          }
          onPress={() => onTypeChange("color")}
        >
          Color
        </Button>
        <Button
          size="$3"
          flex={1}
          backgroundColor={backgroundType === "url" ? "$accent" : "$secondary"}
          onPress={() => onTypeChange("url")}
        >
          Image URL
        </Button>
        <Button
          size="$3"
          flex={1}
          backgroundColor={backgroundType === "blob" ? "$accent" : "$secondary"}
          onPress={() => onTypeChange("blob")}
        >
          Upload
        </Button>
      </XStack>
      {backgroundType === "color" ? (
        <Input
          ref={colorInputRef}
          type="color"
          defaultValue={backgroundColor}
          onBlur={onColorChange}
          width="100%"
          size="$4"
        />
      ) : backgroundType === "url" ? (
        <Input
          placeholder="Background Image URL"
          value={backgroundImageUrl}
          onChange={onUrlChange}
          backgroundColor="$secondary"
          color="$textBody"
          borderColor="$border"
          size="$4"
        />
      ) : (
        <YStack gap="$2">
          <Input
            type="file"
            accept="image/*"
            onChange={onFileChange}
            backgroundColor="$secondary"
            color="$textBody"
            borderColor="$border"
            size="$4"
          />
          {backgroundImageBlob && (
            <Paragraph color="$accent" fontSize="$2">
              File selected: {(backgroundImageBlob as File).name || "image"}
            </Paragraph>
          )}
        </YStack>
      )}
    </YStack>
  );
}
