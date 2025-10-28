import { useAtomValue } from "jotai";
import { YStack } from "@tamagui/stacks";
import { useAuth } from "@kpaste-app/atproto-auth";
import {
  nameAtom,
  locationAtom,
  bioAtom,
  primaryColorAtom,
  secondaryColorAtom,
  fontFamilyAtom,
  stylesheetAtom,
  linksAtom,
} from "../../../atoms/profile";
import { ProfileDisplay } from "../ProfileDisplay";
import { BackgroundRenderer } from "../BackgroundRenderer";
import { getBackgroundStyle } from "../../../utils/backgroundUtils";
import type { ProfileData } from "../ProfileDisplay";
import { useEditorBackground } from "../../../hooks/useEditorBackground";
import { useEditorProfileImage } from "../../../hooks/useEditorProfileImage";

export function ProfilePreview() {
  const { session } = useAuth();
  const name = useAtomValue(nameAtom);
  const location = useAtomValue(locationAtom);
  const bio = useAtomValue(bioAtom);
  const profileImage = useEditorProfileImage();
  const background = useEditorBackground();
  const primaryColor = useAtomValue(primaryColorAtom);
  const secondaryColor = useAtomValue(secondaryColorAtom);
  const fontFamily = useAtomValue(fontFamilyAtom);
  const stylesheet = useAtomValue(stylesheetAtom);
  const links = useAtomValue(linksAtom);

  if (!session) return null;

  const profileData: ProfileData = {
    $type: "moe.karashiiro.klink.profile",
    name: name || undefined,
    location: location || undefined,
    bio,
    profileImage,
    background,
    theme: {
      primaryColor,
      secondaryColor,
      fontFamily,
      stylesheet,
    },
    links: links.map((link) => ({
      icon:
        link.icon instanceof Blob
          ? {
              type: "blob",
              value: link.icon,
              $type: "moe.karashiiro.klink.profile#blobImage",
            }
          : link.icon,
      label: link.label,
      href: link.href,
      $type: "moe.karashiiro.klink.profile#link",
    })),
  };

  const backgroundStyle = getBackgroundStyle(
    background,
    session.endpoint.url,
    session.did,
  );

  return (
    <YStack
      flex={1}
      style={{
        ...backgroundStyle,
        overflowY: "auto",
        overflowX: "hidden",
      }}
      paddingVertical="$6"
      paddingHorizontal="$4"
      alignItems="center"
      minHeight="100vh"
      width="100%"
    >
      <BackgroundRenderer background={background} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: "auto",
          marginBottom: "auto",
          width: "100%",
        }}
      >
        <ProfileDisplay profileData={profileData} handle={session.handle} />
      </div>
    </YStack>
  );
}
