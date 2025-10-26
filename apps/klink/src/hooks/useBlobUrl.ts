import { useEffect, useState } from "react";

/**
 * Hook to manage object URLs for browser Blobs with automatic cleanup
 * Returns a URL that can be used in img src or background-image
 */
export function useBlobUrl(blob: Blob | null | undefined): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!blob) {
      setUrl(null);
      return;
    }

    // Create object URL for the blob
    const objectUrl = URL.createObjectURL(blob);
    setUrl(objectUrl);

    // Cleanup: revoke the object URL when component unmounts or blob changes
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [blob]);

  return url;
}
