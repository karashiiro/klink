import { useAtomValue, useSetAtom } from "jotai";
import { linksAtomsAtom, linksAtom } from "../../atoms/profile";
import { YStack, XStack } from "@tamagui/stacks";
import { Paragraph } from "@tamagui/text";
import { Button } from "@tamagui/button";
import { LinkItem } from "./LinkItem";
import type { ReadProfileResult } from "../../hooks/useReadProfile";
import { useAuth } from "@kpaste-app/atproto-auth";

interface ProfileLinkEditorProps {
  profile?: ReadProfileResult["profile"];
}

export function ProfileLinkEditor({ profile }: ProfileLinkEditorProps) {
  const { session } = useAuth();
  const linkAtoms = useAtomValue(linksAtomsAtom);
  const links = useAtomValue(linksAtom);
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
      {linkAtoms.map((linkAtom, index) => {
        const linkValue = links[index];

        // Build existing blob URL if available
        let existingBlobUrl: string | undefined;
        if (
          profile?.value.links?.[index]?.icon?.type === "blob" &&
          session?.endpoint.url &&
          session?.did
        ) {
          const cleanPdsUrl = session.endpoint.url.endsWith("/")
            ? session.endpoint.url.slice(0, -1)
            : session.endpoint.url;
          existingBlobUrl = `${cleanPdsUrl}/xrpc/com.atproto.sync.getBlob?did=${session.did}&cid=${(profile.value.links[index].icon.value as any).ref.$link}`;
        }

        return (
          <LinkItem
            key={`${linkAtom}`}
            linkAtom={linkAtom}
            hasExistingBlobIcon={
              profile?.value.links?.[index]?.icon?.type === "blob" &&
              !(linkValue?.icon instanceof Blob) &&
              typeof linkValue?.icon !== "string"
            }
            existingBlobUrl={existingBlobUrl}
            onRemove={() => removeLink(index)}
            onClearIcon={profile ? () => clearLinkIcon(index) : undefined}
          />
        );
      })}
    </YStack>
  );
}
