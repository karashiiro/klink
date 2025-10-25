import type { FormEvent } from "react";
import { useState, useEffect } from "react";
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
  existingBlobUrl?: string;
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
  existingBlobUrl,
  onUrlChange,
  onFileChange,
  onClear,
  placeholder = "Image URL",
}: ImageInputProps) {
  // Determine initial mode based on current state
  const [mode, setMode] = useState<"url" | "upload">(
    blob || hasExistingBlob ? "upload" : "url"
  );

  // Create object URL for blob preview
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (blob) {
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [blob]);

  return (
    <YStack gap="$2">
      <Paragraph color="$textBody">{label}:</Paragraph>

      {/* Mode selection buttons */}
      <XStack gap="$2">
        <Button
          size="$3"
          flex={1}
          backgroundColor={mode === "url" ? "$accent" : "$secondary"}
          onPress={() => setMode("url")}
        >
          URL
        </Button>
        <Button
          size="$3"
          flex={1}
          backgroundColor={mode === "upload" ? "$accent" : "$secondary"}
          onPress={() => setMode("upload")}
        >
          Upload
        </Button>
      </XStack>

      {/* URL input */}
      {mode === "url" ? (
        <Input
          placeholder={placeholder}
          value={urlValue}
          onChange={onUrlChange}
          backgroundColor="$secondary"
          color="$textBody"
          borderColor="$border"
          size="$4"
        />
      ) : (
        /* File upload input */
        <>
          {!blob && !hasExistingBlob && (
            <Input
              type="file"
              accept="image/*"
              onChange={onFileChange}
              backgroundColor="$secondary"
              color="$textBody"
              borderColor="$border"
              size="$4"
            />
          )}
          {blob && (
            <XStack alignItems="center" gap="$2">
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Preview"
                  style={{
                    width: "48px",
                    height: "48px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                  }}
                />
              )}
              <Paragraph color="$accent" fontSize="$2" flex={1}>
                {(blob as File).name || "image"}
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
              {existingBlobUrl && (
                <img
                  src={existingBlobUrl}
                  alt="Preview"
                  style={{
                    width: "48px",
                    height: "48px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                  }}
                />
              )}
              <Paragraph color="$greenBase" fontSize="$2" flex={1}>
                ✓ Image uploaded
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
        </>
      )}
    </YStack>
  );
}
