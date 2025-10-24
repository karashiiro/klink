import { useAtomValue, useSetAtom } from "jotai";
import { linksAtomsAtom, linksAtom } from "../../atoms/profile";
import { YStack, XStack } from "@tamagui/stacks";
import { Paragraph } from "@tamagui/text";
import { Button } from "@tamagui/button";
import { LinkItem } from "./LinkItem";
import type { ReadProfileResult } from "../../hooks/useReadProfile";

interface ProfileLinkEditorProps {
  profile?: ReadProfileResult["profile"];
}

export function ProfileLinkEditor({ profile }: ProfileLinkEditorProps) {
  const linkAtoms = useAtomValue(linksAtomsAtom);
  const setLinks = useSetAtom(linksAtom);

  const addLink = () => {
    setLinks((prev) => [...prev, { icon: "", label: "", href: "" }]);
  };

  const removeLink = (index: number) => {
    setLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const clearLinkIcon = (index: number) => {
    setLinks((prev) => {
      const newLinks = [...prev];
      newLinks[index].icon = "";
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
      {linkAtoms.map((linkAtom, index) => (
        <LinkItem
          key={`${linkAtom}`}
          linkAtom={linkAtom}
          hasExistingBlobIcon={
            profile?.value.links?.[index]?.icon?.type === "blob"
          }
          onRemove={() => removeLink(index)}
          onClearIcon={profile ? () => clearLinkIcon(index) : undefined}
        />
      ))}
    </YStack>
  );
}
