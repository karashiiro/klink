import { type FormEvent } from "react";
import { useAtom } from "jotai";
import { type PrimitiveAtom } from "jotai";
import { YStack, XStack } from "@tamagui/stacks";
import { Button } from "@tamagui/button";
import { Input } from "@tamagui/input";
import type { TextInputChangeEvent } from "react-native";
import type { Main } from "@klink-app/lexicon/types";
import { ImageInput } from "./ImageInput";
import { useImageSource } from "../../../hooks/useImageSource";
import { useSession } from "../../../hooks/useSession";

// Link type matching the atom definition
interface Link {
  icon?: Blob | Main["links"][0]["icon"];
  label: string;
  href: string;
}

interface LinkItemProps {
  linkAtom: PrimitiveAtom<Link>;
  hasExistingBlobIcon?: boolean;
  existingIcon?: Main["links"][0]["icon"]; // Raw icon data from profile
  onRemove: () => void;
  onClearIcon?: () => void;
}

export function LinkItem({
  linkAtom,
  hasExistingBlobIcon = false,
  existingIcon,
  onRemove,
  onClearIcon,
}: LinkItemProps) {
  const [link, setLink] = useAtom(linkAtom);
  const { pdsUrl, did } = useSession();
  const existingBlobUrl = useImageSource(existingIcon, pdsUrl, did);

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
    const urlValue = (e.target as HTMLInputElement).value;
    setLink((prev) => ({
      ...prev,
      icon: urlValue
        ? {
            type: "url" as const,
            value: urlValue as `${string}:${string}`,
            $type: "moe.karashiiro.klink.profile#urlImage" as const,
          }
        : undefined,
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
        urlValue={
          !(link.icon instanceof Blob) && link.icon?.type === "url"
            ? link.icon.value
            : ""
        }
        blob={link.icon instanceof Blob ? link.icon : null}
        hasExistingBlob={hasExistingBlobIcon}
        existingBlobUrl={existingBlobUrl ?? undefined}
        onUrlChange={handleIconUrlChange}
        onFileChange={handleIconFileChange}
        onClear={onClearIcon}
        placeholder="Icon URL"
      />
    </YStack>
  );
}
