import { useAtomValue, useSetAtom } from "jotai";
import {
  linksAtomsAtom,
  linksAtom,
  currentProfileAtom,
  linkMetadataAtom,
} from "../../atoms/profile";
import { YStack, XStack } from "@tamagui/stacks";
import { Paragraph } from "@tamagui/text";
import { Button } from "@tamagui/button";
import { LinkItem } from "./LinkItem";

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
        <Paragraph color="$textBody">Links ({linkAtoms.length})</Paragraph>
        <Button size="$3" backgroundColor="$accent" onPress={addLink}>
          + Add Link
        </Button>
      </XStack>
      {linkAtoms.map((linkAtom, index) => {
        const metadata = linkMetadata[index];

        return (
          <LinkItem
            key={`${linkAtom}`}
            linkAtom={linkAtom}
            hasExistingBlobIcon={metadata?.hasExistingBlobIcon ?? false}
            existingIcon={metadata?.existingIcon}
            onRemove={() => removeLink(index)}
            onClearIcon={profile ? () => clearLinkIcon(index) : undefined}
          />
        );
      })}
    </YStack>
  );
}
