import { useAtomValue, useStore } from "jotai";
import { Button } from "@tamagui/button";
import { bioAtom, profileAtom } from "../../atoms/profile";
import type { UseUpdateProfileReturn } from "../../hooks/useUpdateProfile";
import type { ReadProfileResult } from "../../hooks/useReadProfile";

interface UpdateProfileButtonsProps {
  updateProfile: UseUpdateProfileReturn["updateProfile"];
  updateLoading: boolean;
  profile: ReadProfileResult["profile"];
  onSuccess: () => void;
}

export function UpdateProfileButtons({
  updateProfile,
  updateLoading,
  profile,
  onSuccess,
}: UpdateProfileButtonsProps) {
  const bio = useAtomValue(bioAtom);
  const store = useStore();

  return (
    <Button
      width="100%"
      size="$4"
      backgroundColor="$greenBase"
      hoverStyle={{ backgroundColor: "$greenHover" }}
      pressStyle={{ backgroundColor: "$greenPress" }}
      color="$greenText"
      disabled={updateLoading || !bio.trim()}
      onPress={async () => {
        const data = store.get(profileAtom);
        const result = await updateProfile({
          profileImage: data.profileImageBlob
            ? { type: "blob", value: data.profileImageBlob }
            : data.profileImage?.type === "url"
              ? { type: "url", value: data.profileImage.value as string }
              : profile?.value.profileImage?.type === "blob"
                ? profile.value.profileImage
                : undefined,
          name: data.name || undefined,
          location: data.location || undefined,
          bio: data.bio,
          background:
            data.backgroundType === "color"
              ? {
                  type: "color",
                  value: data.backgroundColor,
                }
              : data.backgroundType === "shader" && data.backgroundShaderCode
                ? {
                    type: "shader",
                    value: data.backgroundShaderCode,
                  }
                : data.backgroundType === "shader" &&
                    !data.backgroundShaderCode &&
                    profile?.value.background.type === "shader"
                  ? profile.value.background
                  : data.backgroundType === "blob" && data.backgroundImageBlob
                    ? {
                        type: "blob",
                        value: data.backgroundImageBlob,
                        objectFit: data.backgroundObjectFit,
                      }
                    : data.backgroundType === "blob" &&
                        !data.backgroundImageBlob &&
                        profile?.value.background.type === "blob"
                      ? profile.value.background
                      : data.backgroundType === "url" &&
                          data.background?.type === "url"
                        ? {
                            type: "url",
                            value: data.background.value as string,
                            objectFit: data.backgroundObjectFit,
                          }
                        : {
                            type: "color",
                            value: data.backgroundColor,
                          },
          theme: data.theme,
          links: data.links.map((link, index) => ({
            icon: link.icon
              ? link.icon instanceof Blob
                ? { type: "blob", value: link.icon }
                : typeof link.icon === "string"
                  ? { type: "url", value: link.icon }
                  : // It's already a Main["profileImage"] object, pass it through

                    link.icon
              : profile?.value.links?.[index]?.icon?.type === "blob"
                ? profile.value.links[index].icon
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
      {updateLoading ? "Updating..." : "Update Profile"}
    </Button>
  );
}
