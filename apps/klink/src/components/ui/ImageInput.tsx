import type { FormEvent } from "react";
import { YStack, XStack } from "@tamagui/stacks";
import { Paragraph } from "@tamagui/text";
import { Input } from "@tamagui/input";
import { Button } from "@tamagui/button";
import type { TextInputChangeEvent } from "react-native";

interface ImageInputProps {
  label: string;
  urlValue: string;
  blob: Blob | null;
  hasExistingBlob?: boolean;
  onUrlChange: (e: FormEvent<HTMLInputElement> | TextInputChangeEvent) => void;
  onFileChange: (e: FormEvent<HTMLInputElement> | TextInputChangeEvent) => void;
  onClear?: () => void;
  placeholder?: string;
}

export function ImageInput({
  label,
  urlValue,
  blob,
  hasExistingBlob = false,
  onUrlChange,
  onFileChange,
  onClear,
  placeholder = "Image URL",
}: ImageInputProps) {
  return (
    <YStack gap="$2">
      <Paragraph color="$textBody">{label}:</Paragraph>
      <Input
        placeholder={placeholder}
        value={urlValue}
        onChange={onUrlChange}
        backgroundColor="$secondary"
        color="$textBody"
        borderColor="$border"
        size="$4"
        disabled={!!blob || hasExistingBlob}
      />
      <Paragraph color="$textMuted" fontSize="$2">
        - or -
      </Paragraph>
      <Input
        type="file"
        accept="image/*"
        onChange={onFileChange}
        backgroundColor="$secondary"
        color="$textBody"
        borderColor="$border"
        size="$4"
      />
      {blob && (
        <XStack alignItems="center" gap="$2">
          <Paragraph color="$accent" fontSize="$2" flex={1}>
            File selected: {(blob as File).name || "image"}
          </Paragraph>
          {onClear && (
            <Button
              size="$2"
              backgroundColor="$redBase"
              hoverStyle={{ backgroundColor: "$redHover" }}
              onPress={onClear}
            >
              Clear
            </Button>
          )}
        </XStack>
      )}
      {!blob && hasExistingBlob && (
        <XStack alignItems="center" gap="$2">
          <Paragraph color="$greenBase" fontSize="$2" flex={1}>
            ✓ Image uploaded (choose new file to replace)
          </Paragraph>
          {onClear && (
            <Button
              size="$2"
              backgroundColor="$redBase"
              hoverStyle={{ backgroundColor: "$redHover" }}
              onPress={onClear}
            >
              Remove
            </Button>
          )}
        </XStack>
      )}
    </YStack>
  );
}
