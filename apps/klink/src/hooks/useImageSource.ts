import { useDebugValue, useMemo } from "react";
import type { Main } from "@klink-app/lexicon/types";
import { useBlobUrl } from "./useBlobUrl";
import { getAtProtoBlobCid, buildAtProtoBlobUrl } from "../utils/blobUtils";

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
    | Main["profileImage"]
    | Main["links"][0]["icon"]
    | string
    | null
    | undefined,
  pdsUrl?: string,
  did?: string,
): string | null {
  useDebugValue(image);

  // Handle browser Blob
  const blobUrl = useBlobUrl(image instanceof Blob ? image : null);

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
      if (!pdsUrl || !did) return null;

      const cid = getAtProtoBlobCid(image.value);
      if (!cid) return null;

      return buildAtProtoBlobUrl(pdsUrl, did, cid);
    }

    return null;
  }, [did, image, pdsUrl]);

  return blobUrl ?? resolvedUrl;
}
