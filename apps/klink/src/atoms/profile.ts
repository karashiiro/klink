import { atom } from "jotai";
import { splitAtom } from "jotai/utils";
import type { Main } from "@klink-app/lexicon/types";

// Atom for controlling editor panels visibility (both left and right)
export const editorPanelsOpenAtom = atom(true);

export const profileAtom = atom({
  name: "",
  location: "",
  bio: "",
  profileImageUrl: "",
  profileImageBlob: null as Blob | null,
  backgroundImageUrl: "",
  backgroundImageBlob: null as Blob | null,
  backgroundColor: "#1a1a1a",
  backgroundType: "color" as "color" | "url" | "blob",
  backgroundObjectFit: "cover" as
    | "cover"
    | "contain"
    | "fill"
    | "scale-down"
    | "none",
  theme: {
    primaryColor: "#364163",
    secondaryColor: "#a58431",
  },
  links: [] as {
    icon?: string | Blob | Main["profileImage"];
    label: string;
    href: string;
  }[],
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

export const profileImageUrlAtom = atom(
  (get) => get(profileAtom).profileImageUrl,
);
export const profileImageBlobAtom = atom(
  (get) => get(profileAtom).profileImageBlob,
);
export const backgroundImageUrlAtom = atom(
  (get) => get(profileAtom).backgroundImageUrl,
);
export const backgroundImageBlobAtom = atom(
  (get) => get(profileAtom).backgroundImageBlob,
);
export const backgroundColorAtom = atom(
  (get) => get(profileAtom).backgroundColor,
);
export const backgroundTypeAtom = atom(
  (get) => get(profileAtom).backgroundType,
);
export const backgroundObjectFitAtom = atom(
  (get) => get(profileAtom).backgroundObjectFit,
);

export const linksAtom = atom(
  (get) => get(profileAtom).links,
  (
    get,
    set,
    newValue:
      | {
          icon?: string | Blob | Main["profileImage"];
          label: string;
          href: string;
        }[]
      | ((
          prev: {
            icon?: string | Blob | Main["profileImage"];
            label: string;
            href: string;
          }[],
        ) => {
          icon?: string | Blob | Main["profileImage"];
          label: string;
          href: string;
        }[]),
  ) => {
    const updatedValue =
      typeof newValue === "function"
        ? newValue(get(profileAtom).links)
        : newValue;
    set(profileAtom, { ...get(profileAtom), links: updatedValue });
  },
);

export const linksAtomsAtom = splitAtom(linksAtom);

export const primaryColorAtom = atom(
  (get) => get(profileAtom).theme.primaryColor,
  (get, set, newValue: string) =>
    set(profileAtom, {
      ...get(profileAtom),
      theme: { ...get(profileAtom).theme, primaryColor: newValue },
    }),
);

export const secondaryColorAtom = atom(
  (get) => get(profileAtom).theme.secondaryColor,
  (get, set, newValue: string) =>
    set(profileAtom, {
      ...get(profileAtom),
      theme: { ...get(profileAtom).theme, secondaryColor: newValue },
    }),
);
