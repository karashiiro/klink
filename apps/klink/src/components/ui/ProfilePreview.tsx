import { useAtomValue } from "jotai";
import { YStack } from "@tamagui/stacks";
import { useAuth } from "@kpaste-app/atproto-auth";
import {
  nameAtom,
  locationAtom,
  bioAtom,
  profileImageUrlAtom,
  profileImageBlobAtom,
  backgroundImageUrlAtom,
  backgroundImageBlobAtom,
  backgroundColorAtom,
  backgroundShaderCodeAtom,
  backgroundTypeAtom,
  backgroundObjectFitAtom,
  primaryColorAtom,
  secondaryColorAtom,
  fontFamilyAtom,
  stylesheetAtom,
  linksAtom,
} from "../../atoms/profile";
import { ProfileDisplay } from "./ProfileDisplay";
import { BackgroundRenderer } from "./BackgroundRenderer";
import { getBackgroundStyle } from "../../utils/backgroundUtils";
import type { Main } from "@klink-app/lexicon/types";

export function ProfilePreview() {
  const { session } = useAuth();
  const name = useAtomValue(nameAtom);
  const location = useAtomValue(locationAtom);
  const bio = useAtomValue(bioAtom);
  const profileImageUrl = useAtomValue(profileImageUrlAtom);
  const profileImageBlob = useAtomValue(profileImageBlobAtom);
  const backgroundImageUrl = useAtomValue(backgroundImageUrlAtom);
  const backgroundImageBlob = useAtomValue(backgroundImageBlobAtom);
  const backgroundColor = useAtomValue(backgroundColorAtom);
  const backgroundShaderCode = useAtomValue(backgroundShaderCodeAtom);
  const backgroundType = useAtomValue(backgroundTypeAtom);
  const backgroundObjectFit = useAtomValue(backgroundObjectFitAtom);
  const primaryColor = useAtomValue(primaryColorAtom);
  const secondaryColor = useAtomValue(secondaryColorAtom);
  const fontFamily = useAtomValue(fontFamilyAtom);
  const stylesheet = useAtomValue(stylesheetAtom);
  const links = useAtomValue(linksAtom);

  if (!session) return null;

  // For preview purposes, we cast Blob instances to the expected types
  // In reality, these would be uploaded and replaced with blob references
  const profileImage: Main["profileImage"] = profileImageBlob
    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (profileImageBlob as any)
    : profileImageUrl
      ? { type: "url", value: profileImageUrl }
      : undefined;

  const background: Main["background"] =
    backgroundType === "color"
      ? {
          $type: "moe.karashiiro.klink.profile#colorBackground",
          type: "color",
          value: backgroundColor,
        }
      : backgroundType === "shader" && backgroundShaderCode
        ? {
            $type: "moe.karashiiro.klink.profile#shaderBackground",
            type: "shader",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            value: new Blob([backgroundShaderCode], { type: "text/plain" }) as any,
          }
        : backgroundType === "blob" && backgroundImageBlob
          ? {
              $type: "moe.karashiiro.klink.profile#blobBackground",
              type: "blob",
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              value: backgroundImageBlob as any,
              objectFit: backgroundObjectFit,
            }
          : backgroundType === "url"
            ? {
                $type: "moe.karashiiro.klink.profile#urlBackground",
                type: "url",
                value: backgroundImageUrl as `${string}:${string}`,
                objectFit: backgroundObjectFit,
              }
            : {
                $type: "moe.karashiiro.klink.profile#colorBackground",
                type: "color",
                value: backgroundColor,
              };

  const profileData: Main = {
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
      icon: link.icon
        ? link.icon instanceof Blob
          ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (link.icon as any)
          : typeof link.icon === "string"
            ? { type: "url", value: link.icon }
            : link.icon
        : undefined,
      label: link.label,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      href: link.href as any, // href validation happens during submission
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
      style={backgroundStyle}
      paddingVertical="$6"
      paddingHorizontal="$4"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      width="100%"
    >
      <BackgroundRenderer
        background={background}
        pdsUrl={session.endpoint.url}
        did={session.did}
      />
      <ProfileDisplay
        profileData={profileData}
        handle={session.handle}
        pdsUrl={session.endpoint.url}
        did={session.did}
      />
    </YStack>
  );
}
