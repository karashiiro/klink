import type { FormEvent, RefObject } from "react";
import { YStack, XStack } from "@tamagui/stacks";
import { Paragraph } from "@tamagui/text";
import { Button } from "@tamagui/button";
import { Input } from "@tamagui/input";
import { ShaderBackgroundSelector } from "./ShaderBackgroundSelector";
import type { BlurEvent, TextInputChangeEvent } from "react-native";

interface BackgroundSelectorProps {
  backgroundType: "color" | "url" | "blob" | "shader";
  backgroundColor: string;
  backgroundImageUrl: string;
  backgroundImageBlob: Blob | null;
  backgroundObjectFit: "cover" | "contain" | "fill" | "scale-down" | "none";
  hasExistingBlob?: boolean;
  colorInputRef: RefObject<HTMLInputElement | null>;
  onTypeChange: (type: "color" | "url" | "blob" | "shader") => void;
  onColorChange: (e: BlurEvent) => void;
  onUrlChange: (e: FormEvent<HTMLInputElement> | TextInputChangeEvent) => void;
  onFileChange: (e: FormEvent<HTMLInputElement> | TextInputChangeEvent) => void;
  onObjectFitChange: (
    objectFit: "cover" | "contain" | "fill" | "scale-down" | "none",
  ) => void;
  onClearBlob?: () => void;
}

export function BackgroundSelector({
  backgroundType,
  backgroundColor,
  backgroundImageUrl,
  backgroundImageBlob,
  backgroundObjectFit,
  hasExistingBlob = false,
  colorInputRef,
  onTypeChange,
  onColorChange,
  onUrlChange,
  onFileChange,
  onObjectFitChange,
  onClearBlob,
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
        <Button
          size="$3"
          flex={1}
          backgroundColor={
            backgroundType === "shader" ? "$accent" : "$secondary"
          }
          onPress={() => onTypeChange("shader")}
        >
          Shader
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
        <YStack gap="$2">
          <Input
            placeholder="Background Image URL"
            value={backgroundImageUrl}
            onChange={onUrlChange}
            backgroundColor="$secondary"
            color="$textBody"
            borderColor="$border"
            size="$4"
          />
          <Paragraph color="$textMuted" fontSize="$2">
            Image fit:
          </Paragraph>
          <XStack gap="$2" flexWrap="wrap">
            {(["cover", "contain", "fill", "scale-down", "none"] as const).map(
              (fit) => (
                <Button
                  key={fit}
                  size="$2"
                  backgroundColor={
                    backgroundObjectFit === fit ? "$accent" : "$secondary"
                  }
                  onPress={() => onObjectFitChange(fit)}
                >
                  {fit}
                </Button>
              ),
            )}
          </XStack>
        </YStack>
      ) : backgroundType === "shader" ? (
        <ShaderBackgroundSelector />
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
            <XStack alignItems="center" gap="$2">
              <Paragraph color="$accent" fontSize="$2" flex={1}>
                File selected: {(backgroundImageBlob as File).name || "image"}
              </Paragraph>
              {onClearBlob && (
                <Button
                  size="$2"
                  backgroundColor="$redBase"
                  hoverStyle={{ backgroundColor: "$redHover" }}
                  onPress={onClearBlob}
                >
                  Clear
                </Button>
              )}
            </XStack>
          )}
          {!backgroundImageBlob && hasExistingBlob && (
            <XStack alignItems="center" gap="$2">
              <Paragraph color="$greenBase" fontSize="$2" flex={1}>
                ✓ Image uploaded (choose new file to replace)
              </Paragraph>
              {onClearBlob && (
                <Button
                  size="$2"
                  backgroundColor="$redBase"
                  hoverStyle={{ backgroundColor: "$redHover" }}
                  onPress={onClearBlob}
                >
                  Remove
                </Button>
              )}
            </XStack>
          )}
          <Paragraph color="$textMuted" fontSize="$2">
            Image fit:
          </Paragraph>
          <XStack gap="$2" flexWrap="wrap">
            {(["cover", "contain", "fill", "scale-down", "none"] as const).map(
              (fit) => (
                <Button
                  key={fit}
                  size="$2"
                  backgroundColor={
                    backgroundObjectFit === fit ? "$accent" : "$secondary"
                  }
                  onPress={() => onObjectFitChange(fit)}
                >
                  {fit}
                </Button>
              ),
            )}
          </XStack>
        </YStack>
      )}
    </YStack>
  );
}
