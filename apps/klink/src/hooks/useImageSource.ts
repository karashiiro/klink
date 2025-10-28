import { useDebugValue, useMemo } from "react";
import { useBlobUrl } from "./useBlobUrl";
import { getAtProtoBlobCid, buildAtProtoBlobUrl } from "../utils/blobUtils";
import type { ProfileImage } from "../utils/profileUtils";
import type { Background } from "../utils/backgroundUtils";
import type { LinkIcon } from "../utils/linkUtils";

/**
 * Unified hook to resolve an image source from multiple possible formats:
 * - Browser Blob (creates and manages object URL)
 * - ATProto blob reference (fetches from PDS)
 * - URL string
 * - Main["profileImage"] or Main["links"][0]["icon"] types
 *
 * Returns a URL string ready to use in img src, or null if no valid source
 */
export function useImageSource(
  image:
    | Blob
    | ProfileImage
    | Background
    | LinkIcon
    | string
    | null
    | undefined,
  pdsUrl?: string,
  did?: string,
): string | null {
  useDebugValue(image);

  // Handle browser Blob
  const blob =
    image instanceof Blob
      ? image
      : image &&
          typeof image === "object" &&
          "type" in image &&
          image.type === "blob" &&
          image.value instanceof Blob
        ? image.value
        : null;
  const blobUrl = useBlobUrl(blob);

  // Handle ATProto blob reference or URL
  const resolvedUrl = useMemo(() => {
    if (!image) return null;
    if (image instanceof Blob) return null; // Handled by blobUrl above
    if (typeof image === "string") return image;

    // Image is an object - check if it's a URL or blob type
    if (image.type === "url") {
      return image.value;
    }
    if (image.type === "blob") {
      if (!pdsUrl || !did || image.value instanceof Blob) return null;

      const cid = getAtProtoBlobCid(image.value);
      if (!cid) return null;

      return buildAtProtoBlobUrl(pdsUrl, did, cid);
    }

    return null;
  }, [did, image, pdsUrl]);

  return blobUrl ?? resolvedUrl;
}
