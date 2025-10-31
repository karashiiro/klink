import { atom } from "jotai";
import { splitAtom } from "jotai/utils";
import { focusAtom } from "jotai-optics";
import type { Main } from "@klink-app/lexicon/types";
import type { ReadProfileResult } from "../hooks/useReadProfile";

// Atom for controlling editor panels visibility (both left and right)
export const editorPanelsOpenAtom = atom(true);

// Atom for tracking which panel is active on mobile (left = profile, right = links)
export const mobileActivePanelAtom = atom<"left" | "right">("left");

// Atom for storing the current user's profile (from useReadProfile)
export const currentProfileAtom = atom<ReadProfileResult["profile"] | null>(
  null,
);

// Atom for tracking profile loading state
export const profileLoadingAtom = atom(false);

export const profileAtom = atom({
  name: "",
  location: "",
  bio: "",
  profileImage: undefined as Main["profileImage"],
  profileImageBlob: null as Blob | null,
  background: undefined as Main["background"] | undefined,
  backgroundImageBlob: null as Blob | null,
  backgroundImageUrl: "",
  backgroundColor: "#1a1a1a",
  backgroundShaderCode: "",
  backgroundType: "color" as "color" | "url" | "blob" | "shader",
  backgroundObjectFit: "cover" as
    | "cover"
    | "contain"
    | "fill"
    | "scale-down"
    | "none",
  theme: {
    primaryColor: "#364163",
    secondaryColor: "#a58431",
    fontFamily: "",
    stylesheet: "",
  },
  links: [] as {
    icon?: Blob | Main["links"][0]["icon"];
    label: string;
    href: string;
  }[],
  logoMode: "none" as "show" | "none",
});

export const nameAtom = atom(
  (get) => get(profileAtom).name,
  (get, set, newValue: string) =>
    set(profileAtom, { ...get(profileAtom), name: newValue }),
);

export const locationAtom = atom(
  (get) => get(profileAtom).location,
  (get, set, newValue: string) =>
    set(profileAtom, { ...get(profileAtom), location: newValue }),
);

export const bioAtom = atom(
  (get) => get(profileAtom).bio,
  (get, set, newValue: string) =>
    set(profileAtom, { ...get(profileAtom), bio: newValue }),
);

export const profileImageAtom = atom((get) => get(profileAtom).profileImage);
export const profileImageBlobAtom = atom(
  (get) => get(profileAtom).profileImageBlob,
);
export const backgroundAtom = atom((get) => get(profileAtom).background);

export const backgroundImageBlobAtom = focusAtom(profileAtom, (optic) =>
  optic.prop("backgroundImageBlob"),
);

export const backgroundImageUrlAtom = focusAtom(profileAtom, (optic) =>
  optic.prop("backgroundImageUrl"),
);

export const backgroundColorAtom = focusAtom(profileAtom, (optic) =>
  optic.prop("backgroundColor"),
);

export const backgroundTypeAtom = focusAtom(profileAtom, (optic) =>
  optic.prop("backgroundType"),
);

export const backgroundObjectFitAtom = focusAtom(profileAtom, (optic) =>
  optic.prop("backgroundObjectFit"),
);

export const backgroundShaderCodeAtom = focusAtom(profileAtom, (optic) =>
  optic.prop("backgroundShaderCode"),
);

export const linksAtom = focusAtom(profileAtom, (optic) => optic.prop("links"));

export const linksAtomsAtom = splitAtom(linksAtom);

export const primaryColorAtom = focusAtom(profileAtom, (optic) =>
  optic.prop("theme").prop("primaryColor"),
);

export const secondaryColorAtom = focusAtom(profileAtom, (optic) =>
  optic.prop("theme").prop("secondaryColor"),
);

export const fontFamilyAtom = focusAtom(profileAtom, (optic) =>
  optic.prop("theme").prop("fontFamily"),
);

export const stylesheetAtom = focusAtom(profileAtom, (optic) =>
  optic.prop("theme").prop("stylesheet"),
);

/**
 * Derived atom that computes metadata for each link in the links array.
 * Used by ProfileLinkEditor to determine if a link has an existing blob icon that hasn't been replaced.
 */
export const linkMetadataAtom = atom((get) => {
  const currentProfile = get(currentProfileAtom);
  const links = get(linksAtom);

  return links.map((link, index) => {
    const existingIcon = currentProfile?.value.links?.[index]?.icon;
    const hasExistingBlobIcon =
      existingIcon?.type === "blob" && !(link.icon instanceof Blob);

    return {
      existingIcon,
      hasExistingBlobIcon,
    };
  });
});

export const logoModeAtom = focusAtom(profileAtom, (optic) =>
  optic.prop("logoMode"),
);
