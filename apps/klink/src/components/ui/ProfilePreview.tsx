import { useAtomValue } from "jotai";
import { YStack } from "@tamagui/stacks";
import { useAuth } from "@kpaste-app/atproto-auth";
import {
  nameAtom,
  locationAtom,
  bioAtom,
  profileImageAtom,
  profileImageBlobAtom,
  backgroundAtom,
  backgroundImageBlobAtom,
  backgroundColorAtom,
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
import { useImageSource } from "../../hooks/useImageSource";
import { useBlobUrl } from "../../hooks/useBlobUrl";
import type { Main } from "@klink-app/lexicon/types";
import type { ProfileDataWithBlobs } from "./ProfileDisplay";

export function ProfilePreview() {
  const { session } = useAuth();
  const name = useAtomValue(nameAtom);
  const location = useAtomValue(locationAtom);
  const bio = useAtomValue(bioAtom);
  const profileImageValue = useAtomValue(profileImageAtom);
  const profileImageBlob = useAtomValue(profileImageBlobAtom);
  const backgroundValue = useAtomValue(backgroundAtom);
  const backgroundImageBlob = useAtomValue(backgroundImageBlobAtom);
  const backgroundColor = useAtomValue(backgroundColorAtom);
  const backgroundObjectFit = useAtomValue(backgroundObjectFitAtom);
  const primaryColor = useAtomValue(primaryColorAtom);
  const secondaryColor = useAtomValue(secondaryColorAtom);
  const fontFamily = useAtomValue(fontFamilyAtom);
  const stylesheet = useAtomValue(stylesheetAtom);
  const links = useAtomValue(linksAtom);

  // IMPORTANT: Call all hooks BEFORE any conditional returns (React rules of hooks)
  // Use hook to resolve profile image URL (handles browser Blob with automatic cleanup)
  const profileImageUrl = useImageSource(
    profileImageBlob ?? profileImageValue,
    session?.endpoint.url,
    session?.did,
  );

  // Handle background browser Blob separately (different type from images)
  const backgroundBlobUrl = useBlobUrl(backgroundImageBlob);

  // Now we can safely return early
  if (!session) return null;

  const profileImage: Main["profileImage"] = profileImageUrl
    ? {
        type: "url",
        value: profileImageUrl as `${string}:${string}`,
        $type: "moe.karashiiro.klink.profile#urlImage" as const,
      }
    : undefined;

  const background: Main["background"] = backgroundBlobUrl
    ? {
        type: "url",
        value: backgroundBlobUrl as `${string}:${string}`,
        $type: "moe.karashiiro.klink.profile#urlBackground" as const,
        objectFit: backgroundObjectFit,
      }
    : (backgroundValue ?? {
        type: "color",
        value: backgroundColor,
        $type: "moe.karashiiro.klink.profile#colorBackground" as const,
      });

  const profileData: ProfileDataWithBlobs = {
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
      icon: link.icon,
      label: link.label,
      href: (link.href || "https://example.com") as `${string}:${string}`,
      $type: "moe.karashiiro.klink.profile#link" as const,
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
