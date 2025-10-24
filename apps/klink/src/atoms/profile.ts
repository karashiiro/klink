import { atom } from "jotai";

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
  links: [] as { icon?: string | Blob; label: string; href: string }[],
});
