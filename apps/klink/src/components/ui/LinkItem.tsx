import { type FormEvent } from "react";
import { useAtom } from "jotai";
import { type PrimitiveAtom } from "jotai";
import { YStack, XStack } from "@tamagui/stacks";
import { Button } from "@tamagui/button";
import { Input } from "@tamagui/input";
import type { TextInputChangeEvent } from "react-native";
import type { Main } from "@klink-app/lexicon/types";
import { ImageInput } from "./ImageInput";

interface Link {
  icon?: string | Blob | Main["profileImage"];
  label: string;
  href: string;
}

interface LinkItemProps {
  linkAtom: PrimitiveAtom<Link>;
  hasExistingBlobIcon?: boolean;
  existingBlobUrl?: string;
  onRemove: () => void;
  onClearIcon?: () => void;
}

export function LinkItem({
  linkAtom,
  hasExistingBlobIcon = false,
  existingBlobUrl,
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

      <ImageInput
        label="Icon (optional)"
        urlValue={typeof link.icon === "string" ? link.icon : ""}
        blob={link.icon instanceof Blob ? link.icon : null}
        hasExistingBlob={hasExistingBlobIcon}
        existingBlobUrl={existingBlobUrl}
        onUrlChange={handleIconUrlChange}
        onFileChange={handleIconFileChange}
        onClear={onClearIcon}
        placeholder="Icon URL"
      />
    </YStack>
  );
}
