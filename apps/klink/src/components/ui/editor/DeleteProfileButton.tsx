import { useSetAtom } from "jotai";
import { Button } from "@tamagui/button";
import { profileAtom } from "../../../atoms/profile";
import { useDeleteProfile } from "../../../hooks/useDeleteProfile";

interface DeleteProfileButtonProps {
  onSuccess: () => void;
}

export function DeleteProfileButton({ onSuccess }: DeleteProfileButtonProps) {
  const setFormData = useSetAtom(profileAtom);
  const { deleteProfile, loading: deleteLoading } = useDeleteProfile();

  return (
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
            profileImage: undefined,
            profileImageBlob: null,
            background: undefined,
            backgroundImageBlob: null,
            backgroundImageUrl: "",
            backgroundColor: "#1a1a1a",
            backgroundShaderCode: "",
            backgroundType: "color",
            backgroundObjectFit: "cover",
            theme: {
              primaryColor: "#364163",
              secondaryColor: "#a58431",
              fontFamily: "",
              stylesheet: "",
            },
            links: [],
            logoMode: "none",
          });
          onSuccess();
        }
      }}
    >
      {deleteLoading ? "Deleting..." : "Delete"}
    </Button>
  );
}
