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
}

export function LinkEditor({
  links,
  onAddLink,
  onUpdateLink,
  onRemoveLink,
  onIconFileChange,
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
              <Paragraph color="$accent" fontSize="$1">
                File: {(link.icon as File).name || "image"}
              </Paragraph>
            )}
          </YStack>
        </YStack>
      ))}
    </YStack>
  );
}
