import { useAtomValue, useStore } from "jotai";
import { Button } from "@tamagui/button";
import { bioAtom, profileAtom } from "../../atoms/profile";
import type { UseCreateProfileReturn } from "../../hooks/useCreateProfile";

interface CreateProfileButtonProps {
  createProfile: UseCreateProfileReturn["createProfile"];
  createLoading: boolean;
  onSuccess: () => void;
}

export function CreateProfileButton({
  createProfile,
  createLoading,
  onSuccess,
}: CreateProfileButtonProps) {
  const bio = useAtomValue(bioAtom);
  const store = useStore();

  return (
    <Button
      size="$4"
      backgroundColor="$greenBase"
      hoverStyle={{ backgroundColor: "$greenHover" }}
      pressStyle={{ backgroundColor: "$greenPress" }}
      color="$greenText"
      disabled={createLoading || !bio.trim()}
      onPress={async () => {
        const data = store.get(profileAtom);
        const result = await createProfile({
          profileImage: data.profileImageBlob
            ? { type: "blob", value: data.profileImageBlob }
            : data.profileImageUrl
              ? { type: "url", value: data.profileImageUrl }
              : undefined,
          name: data.name || undefined,
          location: data.location || undefined,
          bio: data.bio,
          background:
            data.backgroundType === "color"
              ? {
                  type: "color" as const,
                  value: data.backgroundColor,
                }
              : data.backgroundType === "blob"
                ? {
                    type: "blob" as const,
                    value: data.backgroundImageBlob!,
                    objectFit: data.backgroundObjectFit,
                  }
                : {
                    type: "url" as const,
                    value: data.backgroundImageUrl,
                    objectFit: data.backgroundObjectFit,
                  },
          theme: data.theme,
          links: data.links.map((link) => ({
            icon: link.icon
              ? link.icon instanceof Blob
                ? { type: "blob", value: link.icon }
                : typeof link.icon === "string"
                  ? { type: "url", value: link.icon }
                  : link.icon.type === "url"
                    ? { type: "url", value: link.icon.value as string }
                    : undefined
              : undefined,
            label: link.label,
            href: link.href,
          })),
        });
        if (result) {
          onSuccess();
        }
      }}
    >
      {createLoading ? "Creating..." : "Create Profile"}
    </Button>
  );
}
