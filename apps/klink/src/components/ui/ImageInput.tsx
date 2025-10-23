import type { FormEvent } from "react";
import { YStack } from "@tamagui/stacks";
import { Paragraph } from "@tamagui/text";
import { Input } from "@tamagui/input";
import type { TextInputChangeEvent } from "react-native";

interface ImageInputProps {
  label: string;
  urlValue: string;
  blob: Blob | null;
  onUrlChange: (e: FormEvent<HTMLInputElement> | TextInputChangeEvent) => void;
  onFileChange: (e: FormEvent<HTMLInputElement> | TextInputChangeEvent) => void;
  placeholder?: string;
}

export function ImageInput({
  label,
  urlValue,
  blob,
  onUrlChange,
  onFileChange,
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
        disabled={!!blob}
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
        <Paragraph color="$accent" fontSize="$2">
          File selected: {(blob as File).name || "image"}
        </Paragraph>
      )}
    </YStack>
  );
}
