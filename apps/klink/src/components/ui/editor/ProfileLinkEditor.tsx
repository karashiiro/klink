import { useAtomValue, useSetAtom } from "jotai";
import {
  linksAtomsAtom,
  linksAtom,
  currentProfileAtom,
  linkMetadataAtom,
} from "../../../atoms/profile";
import { YStack, XStack } from "@tamagui/stacks";
import { Paragraph } from "@tamagui/text";
import { Button } from "@tamagui/button";
import { Separator } from "@tamagui/separator";
import { LinkItem } from "./LinkItem";
import React from "react";

export function ProfileLinkEditor() {
  const profile = useAtomValue(currentProfileAtom);
  const linkAtoms = useAtomValue(linksAtomsAtom);
  const linkMetadata = useAtomValue(linkMetadataAtom);
  const setLinks = useSetAtom(linksAtom);

  const addLink = () => {
    setLinks((prev) => [...prev, { icon: undefined, label: "", href: "" }]);
  };

  const removeLink = (index: number) => {
    setLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const clearLinkIcon = (index: number) => {
    setLinks((prev) => {
      const newLinks = [...prev];
      newLinks[index] = { ...newLinks[index], icon: undefined };
      return newLinks;
    });
  };

  return (
    <YStack gap="$2">
      <XStack justifyContent="space-between" alignItems="center">
        <Paragraph>Links ({linkAtoms.length})</Paragraph>
        <Button size="$3" backgroundColor="$accent" onPress={addLink}>
          + Add Link
        </Button>
      </XStack>
      {linkAtoms.map((linkAtom, index) => {
        const metadata = linkMetadata[index];

        return (
          <React.Fragment key={`${linkAtom}`}>
            <Separator marginVertical={10} borderColor="rgba(0, 0, 0, 0.4)" />
            <LinkItem
              linkAtom={linkAtom}
              hasExistingBlobIcon={metadata?.hasExistingBlobIcon ?? false}
              existingIcon={metadata?.existingIcon}
              onRemove={() => removeLink(index)}
              onClearIcon={profile ? () => clearLinkIcon(index) : undefined}
            />
          </React.Fragment>
        );
      })}
    </YStack>
  );
}
