import { useAtomValue } from "jotai";
import { profileImageAtom, profileImageBlobAtom } from "../atoms/profile";
import type { ProfileImage } from "../utils/profileUtils";
import { useImageSource } from "./useImageSource";
import { useSession } from "./useSession";

export function useEditorProfileImage(): ProfileImage {
  const { pdsUrl, did } = useSession();
  const profileImageValue = useAtomValue(profileImageAtom);
  const profileImageBlob = useAtomValue(profileImageBlobAtom);
  const profileImageUrl = useImageSource(
    profileImageBlob ?? profileImageValue,
    pdsUrl,
    did,
  );
  return profileImageUrl
    ? {
        type: "url",
        value: profileImageUrl,
        $type: "moe.karashiiro.klink.profile#urlImage",
      }
    : profileImageValue;
}
