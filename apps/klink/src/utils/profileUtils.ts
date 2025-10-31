import type { Main } from "@klink-app/lexicon/types";
import type { Blob as AtProtoBlob, LegacyBlob } from "@atcute/lexicons";
import type { ReadProfileResult } from "../hooks/useReadProfile";
import type { CreateProfileForm } from "../hooks/useCreateProfile";
import type { UpdateProfileForm } from "../hooks/useUpdateProfile";

export type ProfileImage =
  | Main["profileImage"]
  | {
      $type: "moe.karashiiro.klink.profile#urlImage";
      type: "url";
      value: string;
    }
  | {
      $type: "moe.karashiiro.klink.profile#blobImage";
      type: "blob";
      value: AtProtoBlob<string> | LegacyBlob<string> | Blob;
    };

/**
 * Type representing the profileAtom state structure
 */
export interface ProfileAtomData {
  name: string;
  location: string;
  bio: string;
  profileImage: Main["profileImage"];
  profileImageBlob: Blob | null;
  background: Main["background"] | undefined;
  backgroundImageBlob: Blob | null;
  backgroundImageUrl: string;
  backgroundColor: string;
  backgroundShaderCode: string;
  backgroundType: "color" | "url" | "blob" | "shader";
  backgroundObjectFit: "cover" | "contain" | "fill" | "scale-down" | "none";
  theme: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    stylesheet: string;
  };
  links: {
    icon?: Blob | Main["links"][0]["icon"];
    label: string;
    href: string;
  }[];
  logoMode: "show" | "none";
}

/**
 * Transform profile image data for create/update operations
 * Returns the flexible form type that the hooks expect
 */
export function transformProfileImage(
  data: ProfileAtomData,
  existingProfile?: ReadProfileResult["profile"],
):
  | { type: "url" | "blob"; value: string | Blob | AtProtoBlob }
  | Main["profileImage"]
  | undefined {
  // New blob takes priority
  if (data.profileImageBlob) {
    return { type: "blob", value: data.profileImageBlob };
  }

  // URL image from atom
  if (data.profileImage?.type === "url") {
    return { type: "url", value: data.profileImage.value };
  }

  // For updates: preserve existing blob if no new image
  if (existingProfile?.value.profileImage?.type === "blob") {
    return existingProfile.value.profileImage;
  }

  return undefined;
}

/**
 * Transform background data for create operations
 * Returns the flexible form type that the hooks expect
 */
export function transformBackgroundForCreate(data: ProfileAtomData):
  | { type: "color"; value: string }
  | {
      type: "url" | "blob";
      value: string | Blob | AtProtoBlob;
      objectFit?: "cover" | "contain" | "fill" | "scale-down" | "none";
    }
  | { type: "shader"; value: string | Blob | AtProtoBlob }
  | Main["background"] {
  // Color background
  if (data.backgroundType === "color") {
    return {
      type: "color",
      value: data.backgroundColor,
    };
  }

  // New blob background
  if (data.backgroundType === "blob" && data.backgroundImageBlob) {
    return {
      type: "blob",
      value: data.backgroundImageBlob,
      objectFit: data.backgroundObjectFit,
    };
  }

  // URL background from atom
  if (data.background?.type === "url") {
    return {
      type: "url",
      value: data.background.value,
      objectFit: data.backgroundObjectFit,
    };
  }

  // Default to color if nothing else matches
  return {
    type: "color",
    value: data.backgroundColor,
  };
}

/**
 * Transform background data for update operations (handles preserving existing blobs/shaders)
 * Returns the flexible form type that the hooks expect
 */
export function transformBackgroundForUpdate(
  data: ProfileAtomData,
  existingProfile: ReadProfileResult["profile"],
):
  | { type: "color"; value: string }
  | {
      type: "url" | "blob";
      value: string | Blob | AtProtoBlob;
      objectFit?: "cover" | "contain" | "fill" | "scale-down" | "none";
    }
  | { type: "shader"; value: string | Blob | AtProtoBlob }
  | Main["background"] {
  // Color background
  if (data.backgroundType === "color") {
    return {
      type: "color",
      value: data.backgroundColor,
    };
  }

  // Shader background
  if (data.backgroundType === "shader") {
    // New shader code
    if (data.backgroundShaderCode) {
      return {
        type: "shader",
        value: data.backgroundShaderCode,
      };
    }

    // Preserve existing shader blob
    if (existingProfile?.value.background.type === "shader") {
      return existingProfile.value.background;
    }
  }

  // Blob background
  if (data.backgroundType === "blob") {
    // New blob
    if (data.backgroundImageBlob) {
      return {
        type: "blob",
        value: data.backgroundImageBlob,
        objectFit: data.backgroundObjectFit,
      };
    }

    // Preserve existing blob
    if (existingProfile?.value.background.type === "blob") {
      return existingProfile.value.background;
    }
  }

  // URL background
  if (data.backgroundType === "url" && data.background?.type === "url") {
    return {
      type: "url",
      value: data.background.value,
      objectFit: data.backgroundObjectFit,
    };
  }

  // Default to color if nothing else matches
  return {
    type: "color",
    value: data.backgroundColor,
  };
}

/**
 * Transform link icon data for create operations
 * Returns the flexible form type that the hooks expect
 */
export function transformLinkIcon(
  icon: Blob | Main["links"][0]["icon"] | undefined,
):
  | { type: "url" | "blob"; value: string | Blob | AtProtoBlob }
  | Main["links"][0]["icon"]
  | undefined {
  if (!icon) {
    return undefined;
  }

  // New blob icon
  if (icon instanceof Blob) {
    return { type: "blob", value: icon };
  }

  // String URL icon (legacy?)
  if (typeof icon === "string") {
    return { type: "url", value: icon };
  }

  // URL icon object
  if (icon.type === "url") {
    return { type: "url", value: icon.value };
  }

  // Already transformed icon object (blob reference), pass through
  return icon;
}

/**
 * Transform link icon data for update operations (handles preserving existing blobs)
 * Returns the flexible form type that the hooks expect
 */
export function transformLinkIconForUpdate(
  icon: Blob | Main["links"][0]["icon"] | undefined,
  existingIcon: Main["links"][0]["icon"] | undefined,
):
  | { type: "url" | "blob"; value: string | Blob | AtProtoBlob }
  | Main["links"][0]["icon"]
  | undefined {
  // New icon data
  if (icon) {
    return transformLinkIcon(icon);
  }

  // Preserve existing blob icon
  if (existingIcon?.type === "blob") {
    return existingIcon;
  }

  return undefined;
}

/**
 * Transform complete profile data for create operation
 * Returns CreateProfileForm that the hook expects
 */
export function transformProfileForCreate(
  data: ProfileAtomData,
): CreateProfileForm {
  return {
    profileImage: transformProfileImage(data),
    name: data.name || undefined,
    location: data.location || undefined,
    bio: data.bio,
    background: transformBackgroundForCreate(data),
    theme: data.theme,
    links: data.links.map((link) => ({
      icon: transformLinkIcon(link.icon),
      label: link.label,
      href: link.href,
    })),
    logoMode: data.logoMode,
  };
}

/**
 * Transform complete profile data for update operation (preserves existing blobs where appropriate)
 * Returns UpdateProfileForm that the hook expects
 */
export function transformProfileForUpdate(
  data: ProfileAtomData,
  existingProfile: ReadProfileResult["profile"],
): UpdateProfileForm {
  if (!existingProfile) {
    // Fallback to create logic if no existing profile
    return transformProfileForCreate(data);
  }

  return {
    profileImage: transformProfileImage(data, existingProfile),
    name: data.name || undefined,
    location: data.location || undefined,
    bio: data.bio,
    background: transformBackgroundForUpdate(data, existingProfile),
    theme: data.theme,
    links: data.links.map((link, index) => ({
      icon: transformLinkIconForUpdate(
        link.icon,
        existingProfile.value.links?.[index]?.icon,
      ),
      label: link.label,
      href: link.href,
    })),
    logoMode: data.logoMode,
  };
}
