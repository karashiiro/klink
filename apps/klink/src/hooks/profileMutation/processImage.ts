import type { Main } from "@klink-app/lexicon/types";
import type { Blob as AtProtoBlob } from "@atcute/lexicons";
import { ATPROTO_ENDPOINTS, ATPROTO_TYPES } from "../../constants";
import type { AtProtoClient } from "./types";

type ImageInput =
  | { type: "url" | "blob"; value: string | Blob | AtProtoBlob }
  | Main["profileImage"]
  | Main["links"][0]["icon"];

/**
 * Processes an image for ATProto storage.
 * Handles URL images, existing blobs, and new blob uploads.
 *
 * @param client - The ATProto client for blob uploads
 * @param image - The image to process
 * @param isBackground - Whether this image is a background (affects $type)
 * @returns Processed image ready for ATProto record, or undefined
 */
export async function processImage(
  client: AtProtoClient,
  image?: ImageInput,
  isBackground = false,
): Promise<
  | Main["profileImage"]
  | Main["links"][0]["icon"]
  | {
      type: "url" | "blob";
      value: AtProtoBlob | `${string}:${string}`;
      $type: string;
    }
  | undefined
> {
  if (!image) return undefined;

  // If image already has $type, it's an ATProto type - return as-is
  if (typeof image === "object" && "$type" in image) {
    return image;
  }

  if (image.type === "url") {
    if (isBackground) {
      return {
        type: "url" as const,
        value: image.value as `${string}:${string}`,
        $type: ATPROTO_TYPES.URL_BACKGROUND,
      };
    } else {
      return {
        type: "url" as const,
        value: image.value as `${string}:${string}`,
        $type: ATPROTO_TYPES.URL_IMAGE,
      };
    }
  }

  // Check if value is an ATProto blob (has ref property)
  const blobValue = image.value;
  if (
    typeof blobValue === "object" &&
    blobValue !== null &&
    "ref" in blobValue
  ) {
    // Already an ATProto blob, return as-is
    return image as Main["profileImage"];
  }

  // Upload blob
  const blobResponse = await client.post(ATPROTO_ENDPOINTS.UPLOAD_BLOB, {
    input: image.value as Blob,
  });
  if (!blobResponse.ok) {
    throw new Error(`Failed to upload image: ${blobResponse.status}`);
  }

  if (isBackground) {
    return {
      type: "blob" as const,
      value: blobResponse.data.blob,
      $type: ATPROTO_TYPES.BLOB_BACKGROUND,
    };
  } else {
    return {
      type: "blob" as const,
      value: blobResponse.data.blob,
      $type: ATPROTO_TYPES.BLOB_IMAGE,
    };
  }
}
