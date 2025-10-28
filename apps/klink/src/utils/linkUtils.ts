import type { Main } from "@klink-app/lexicon/types";
import type { Blob as AtProtoBlob, LegacyBlob } from "@atcute/lexicons";

export interface Link {
  icon?: LinkIcon;
  label: string;
  href: string;
}

export type LinkIcon =
  | Main["links"][0]["icon"]
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
