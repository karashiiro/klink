import type { Main } from "@klink-app/lexicon/types";
import { ATPROTO_ENDPOINTS, ATPROTO_TYPES } from "../../constants";
import { processImage } from "./processImage";
import type { ProfileForm, AtProtoClient } from "./types";

/**
 * Processes a background for ATProto storage.
 * Handles color, shader, URL, and blob backgrounds.
 *
 * @param client - The ATProto client for blob uploads
 * @param background - The background to process
 * @returns Processed background ready for ATProto record
 */
export async function processBackground(
  client: AtProtoClient,
  background: ProfileForm["background"],
): Promise<Main["background"]> {
  if (background.type === "color") {
    return {
      $type: ATPROTO_TYPES.COLOR_BACKGROUND,
      type: "color" as const,
      value: background.value as string,
    };
  }

  if (background.type === "shader") {
    // Check if value is already an ATProto blob
    const shaderValue = background.value;
    const hasRef =
      typeof shaderValue === "object" &&
      shaderValue !== null &&
      "ref" in shaderValue;

    if (hasRef) {
      // Already a blob reference, use as-is
      return {
        $type: ATPROTO_TYPES.SHADER_BACKGROUND,
        type: "shader" as const,
        value: shaderValue,
      };
    }

    // Upload shader code as text blob
    const shaderBlob = new Blob([background.value as string], {
      type: "text/plain",
    });
    const blobResponse = await client.post(ATPROTO_ENDPOINTS.UPLOAD_BLOB, {
      input: shaderBlob,
    });
    if (!blobResponse.ok) {
      throw new Error(`Failed to upload shader: ${blobResponse.status}`);
    }
    return {
      $type: ATPROTO_TYPES.SHADER_BACKGROUND,
      type: "shader" as const,
      value: blobResponse.data.blob,
    };
  }

  // URL or blob background
  const processedBackground = await processImage(
    client,
    background as {
      type: "url" | "blob";
      value: string | Blob;
    },
    true, // isBackground
  );
  if (!processedBackground) {
    throw new Error("Failed to process background");
  }
  return {
    ...processedBackground,
    objectFit: "objectFit" in background ? background.objectFit : "cover",
  } as Main["background"];
}
