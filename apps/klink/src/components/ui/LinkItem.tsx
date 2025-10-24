import { type FormEvent } from "react";
import { useAtom } from "jotai";
import { type PrimitiveAtom } from "jotai";
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

interface LinkItemProps {
  linkAtom: PrimitiveAtom<Link>;
  hasExistingBlobIcon?: boolean;
  onRemove: () => void;
  onClearIcon?: () => void;
}

export function LinkItem({
  linkAtom,
  hasExistingBlobIcon = false,
  onRemove,
  onClearIcon,
}: LinkItemProps) {
  const [link, setLink] = useAtom(linkAtom);

  const handleLabelChange = (
    e: FormEvent<HTMLInputElement> | TextInputChangeEvent,
  ) => {
    setLink((prev) => ({
      ...prev,
      label: (e.target as HTMLInputElement).value,
    }));
  };

  const handleHrefChange = (
    e: FormEvent<HTMLInputElement> | TextInputChangeEvent,
  ) => {
    setLink((prev) => ({
      ...prev,
      href: (e.target as HTMLInputElement).value,
    }));
  };

  const handleIconUrlChange = (
    e: FormEvent<HTMLInputElement> | TextInputChangeEvent,
  ) => {
    setLink((prev) => ({
      ...prev,
      icon: (e.target as HTMLInputElement).value,
    }));
  };

  const handleIconFileChange = (
    e: FormEvent<HTMLInputElement> | TextInputChangeEvent,
  ) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      setLink((prev) => ({
        ...prev,
        icon: file,
      }));
    }
  };

  return (
    <YStack gap="$2">
      <XStack gap="$2" alignItems="center">
        <Input
          flex={1}
          placeholder="Label"
          value={link.label}
          onChange={handleLabelChange}
          backgroundColor="$secondary"
          color="$textBody"
          borderColor="$border"
          size="$3"
        />
        <Input
          flex={2}
          placeholder="URL"
          value={link.href}
          onChange={handleHrefChange}
          backgroundColor="$secondary"
          color="$textBody"
          borderColor="$border"
          size="$3"
        />
        <Button size="$3" backgroundColor="$redBase" onPress={onRemove}>
          ✕
        </Button>
      </XStack>
      <YStack gap="$1">
        <Input
          placeholder="Icon URL (optional)"
          value={typeof link.icon === "string" ? link.icon : ""}
          onChange={handleIconUrlChange}
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
          onChange={handleIconFileChange}
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
                onPress={onClearIcon}
              >
                Clear
              </Button>
            )}
          </XStack>
        )}
        {!(link.icon instanceof Blob) && hasExistingBlobIcon && (
          <XStack alignItems="center" gap="$2">
            <Paragraph color="$greenBase" fontSize="$1" flex={1}>
              ✓ Icon uploaded (choose new file to replace)
            </Paragraph>
            {onClearIcon && (
              <Button
                size="$2"
                backgroundColor="$redBase"
                hoverStyle={{ backgroundColor: "$redHover" }}
                onPress={onClearIcon}
              >
                Remove
              </Button>
            )}
          </XStack>
        )}
      </YStack>
    </YStack>
  );
}
