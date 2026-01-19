import type { Main } from "@klink-app/lexicon/types";
import type { Blob as AtProtoBlob } from "@atcute/lexicons";
import type { Client } from "@atcute/client";

/**
 * The ATProto client type used for API calls.
 * Imported from @atcute/client with default type parameters.
 */
export type AtProtoClient = Client;

/**
 * Unified profile form interface for both create and update operations.
 * Previously duplicated as CreateProfileForm and UpdateProfileForm.
 */
export interface ProfileForm {
  profileImage?:
    | { type: "url" | "blob"; value: string | Blob | AtProtoBlob }
    | Main["profileImage"];
  name?: string;
  location?: string;
  bio: string;
  background:
    | { type: "color"; value: string }
    | {
        type: "url" | "blob";
        value: string | Blob | AtProtoBlob;
        objectFit?: "cover" | "contain" | "fill" | "scale-down" | "none";
      }
    | { type: "shader"; value: string | Blob | AtProtoBlob }
    | Main["background"];
  theme: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily?: string;
    stylesheet?: string;
  };
  links: Array<{
    icon?:
      | { type: "url" | "blob"; value: string | Blob | AtProtoBlob }
      | Main["links"][0]["icon"];
    label: string;
    href: string;
  }>;
  logoMode: "show" | "none";
}

/**
 * Configuration for profile mutation operations.
 */
export interface MutationConfig {
  endpoint: "com.atproto.repo.createRecord" | "com.atproto.repo.putRecord";
  errorPrefix: "create" | "update";
}
