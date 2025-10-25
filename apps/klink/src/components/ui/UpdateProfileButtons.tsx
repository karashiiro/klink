import { useAtomValue, useStore, useSetAtom } from "jotai";
import { XStack } from "@tamagui/stacks";
import { Button } from "@tamagui/button";
import { bioAtom, profileAtom } from "../../atoms/profile";
import type { UseUpdateProfileReturn } from "../../hooks/useUpdateProfile";
import type { UseDeleteProfileReturn } from "../../hooks/useDeleteProfile";
import type { ReadProfileResult } from "../../hooks/useReadProfile";

interface UpdateProfileButtonsProps {
  updateProfile: UseUpdateProfileReturn["updateProfile"];
  updateLoading: boolean;
  deleteProfile: UseDeleteProfileReturn["deleteProfile"];
  deleteLoading: boolean;
  profile: ReadProfileResult["profile"];
  onSuccess: () => void;
}

export function UpdateProfileButtons({
  updateProfile,
  updateLoading,
  deleteProfile,
  deleteLoading,
  profile,
  onSuccess,
}: UpdateProfileButtonsProps) {
  const bio = useAtomValue(bioAtom);
  const store = useStore();
  const setFormData = useSetAtom(profileAtom);

  return (
    <XStack gap="$2">
      <Button
        flex={1}
        size="$4"
        backgroundColor="$accent"
        hoverStyle={{ opacity: 0.8 }}
        color="white"
        disabled={updateLoading || !bio.trim()}
        onPress={async () => {
          const data = store.get(profileAtom);
          const result = await updateProfile({
            profileImage: data.profileImageBlob
              ? { type: "blob", value: data.profileImageBlob }
              : data.profileImageUrl
                ? { type: "url", value: data.profileImageUrl }
                : profile?.value.profileImage?.type === "blob"
                  ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (profile.value.profileImage as any)
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
                : data.backgroundType === "blob" && data.backgroundImageBlob
                  ? {
                      type: "blob",
                      value: data.backgroundImageBlob,
                      objectFit: data.backgroundObjectFit,
                    }
                  : data.backgroundType === "blob" &&
                      !data.backgroundImageBlob &&
                      profile?.value.background.type === "blob"
                    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      (profile.value.background as any)
                    : data.backgroundType === "url"
                      ? {
                          type: "url",
                          value: data.backgroundImageUrl,
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
                      (link.icon as any)
                : profile?.value.links?.[index]?.icon?.type === "blob"
                  ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (profile.value.links[index].icon as any)
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

      <Button
        size="$4"
        backgroundColor="$redBase"
        hoverStyle={{ backgroundColor: "$redHover" }}
        pressStyle={{ backgroundColor: "$redPress" }}
        color="white"
        disabled={deleteLoading}
        onPress={async () => {
          const success = await deleteProfile();
          if (success) {
            setFormData({
              name: "",
              location: "",
              bio: "",
              profileImageUrl: "",
              profileImageBlob: null,
              backgroundImageUrl: "",
              backgroundImageBlob: null,
              backgroundColor: "#1a1a1a",
              backgroundType: "color",
              backgroundObjectFit: "cover",
              theme: {
                primaryColor: "#364163",
                secondaryColor: "#a58431",
                fontFamily: "",
                stylesheet: "",
              },
              links: [],
            });
            onSuccess();
          }
        }}
      >
        {deleteLoading ? "Deleting..." : "Delete"}
      </Button>
    </XStack>
  );
}
