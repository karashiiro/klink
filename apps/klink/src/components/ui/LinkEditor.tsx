import type { FormEvent } from "react";
import { YStack, XStack } from "@tamagui/stacks";
import { Paragraph } from "@tamagui/text";
import { Button } from "@tamagui/button";
import { Input } from "@tamagui/input";
import type { TextInputChangeEvent } from "react-native";

interface Link {
  icon?: string | Blob;
  label: string;
  href: string;
}

interface LinkEditorProps {
  links: Link[];
  existingBlobIcons?: boolean[];
  onAddLink: () => void;
  onUpdateLink: (
    index: number,
    field: "icon" | "label" | "href",
    value: string,
  ) => void;
  onRemoveLink: (index: number) => void;
  onIconFileChange: (
    index: number,
    e: FormEvent<HTMLInputElement> | TextInputChangeEvent,
  ) => void;
  onClearIcon?: (index: number) => void;
}

export function LinkEditor({
  links,
  existingBlobIcons = [],
  onAddLink,
  onUpdateLink,
  onRemoveLink,
  onIconFileChange,
  onClearIcon,
}: LinkEditorProps) {
  return (
    <YStack gap="$2">
      <XStack justifyContent="space-between" alignItems="center">
        <Paragraph color="$textBody">Links ({links.length})</Paragraph>
        <Button size="$3" backgroundColor="$accent" onPress={onAddLink}>
          + Add Link
        </Button>
      </XStack>
      {links.map((link, index) => (
        <YStack key={index} gap="$2">
          <XStack gap="$2" alignItems="center">
            <Input
              flex={1}
              placeholder="Label"
              value={link.label}
              onChange={(e) =>
                onUpdateLink(
                  index,
                  "label",
                  (e.target as HTMLInputElement).value,
                )
              }
              backgroundColor="$secondary"
              color="$textBody"
              borderColor="$border"
              size="$3"
            />
            <Input
              flex={2}
              placeholder="URL"
              value={link.href}
              onChange={(e) =>
                onUpdateLink(
                  index,
                  "href",
                  (e.target as HTMLInputElement).value,
                )
              }
              backgroundColor="$secondary"
              color="$textBody"
              borderColor="$border"
              size="$3"
            />
            <Button
              size="$3"
              backgroundColor="$redBase"
              onPress={() => onRemoveLink(index)}
            >
              ✕
            </Button>
          </XStack>
          <YStack gap="$1">
            <Input
              placeholder="Icon URL (optional)"
              value={typeof link.icon === "string" ? link.icon : ""}
              onChange={(e) =>
                onUpdateLink(
                  index,
                  "icon",
                  (e.target as HTMLInputElement).value,
                )
              }
              backgroundColor="$secondary"
              color="$textBody"
              borderColor="$border"
              size="$3"
              disabled={link.icon instanceof Blob}
            />
            <Paragraph color="$textMuted" fontSize="$1">
              - or -
            </Paragraph>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => onIconFileChange(index, e)}
              backgroundColor="$secondary"
              color="$textBody"
              borderColor="$border"
              size="$3"
            />
            {link.icon instanceof Blob && (
              <XStack alignItems="center" gap="$2">
                <Paragraph color="$accent" fontSize="$1" flex={1}>
                  File: {(link.icon as File).name || "image"}
                </Paragraph>
                {onClearIcon && (
                  <Button
                    size="$2"
                    backgroundColor="$redBase"
                    hoverStyle={{ backgroundColor: "$redHover" }}
                    onPress={() => onClearIcon(index)}
                  >
                    Clear
                  </Button>
                )}
              </XStack>
            )}
            {!(link.icon instanceof Blob) && existingBlobIcons[index] && (
              <XStack alignItems="center" gap="$2">
                <Paragraph color="$greenBase" fontSize="$1" flex={1}>
                  ✓ Icon uploaded (choose new file to replace)
                </Paragraph>
                {onClearIcon && (
                  <Button
                    size="$2"
                    backgroundColor="$redBase"
                    hoverStyle={{ backgroundColor: "$redHover" }}
                    onPress={() => onClearIcon(index)}
                  >
                    Remove
                  </Button>
                )}
              </XStack>
            )}
          </YStack>
        </YStack>
      ))}
    </YStack>
  );
}
