import { useEffect, useState } from "react";
import { Image } from "@tamagui/image";
import type { Main } from "@klink-app/lexicon/types";

interface AtProtoImageProps {
  image: Main["profileImage"] | Blob | null | undefined;
  pdsUrl?: string;
  did?: string;
  width: number;
  height: number;
  borderRadius?: number;
}

export function AtProtoImage({
  image,
  pdsUrl,
  did,
  width,
  height,
  borderRadius,
}: AtProtoImageProps) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (image instanceof Blob) {
      const url = URL.createObjectURL(image);
      setObjectUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    return undefined;
  }, [image]);

  if (!image) return null;

  let imageUrl: string;

  if (image instanceof Blob) {
    imageUrl = objectUrl || "";
  } else if (image.type === "url") {
    imageUrl = image.value;
  } else if (image.type === "blob") {
    if (typeof image.value === "object" && "ref" in image.value) {
      if (!pdsUrl || !did) {
        console.warn("AtProtoImage: pdsUrl and did required for PDS blobs");
        return null;
      }
      const cleanPdsUrl = pdsUrl.endsWith("/") ? pdsUrl.slice(0, -1) : pdsUrl;
      imageUrl = `${cleanPdsUrl}/xrpc/com.atproto.sync.getBlob?did=${did}&cid=${image.value.ref.$link}`;
    } else {
      console.warn("AtProtoImage: Invalid blob format");
      return null;
    }
  } else {
    return null;
  }

  if (!imageUrl) return null;

  return (
    <Image
      source={{ uri: imageUrl }}
      width={width}
      height={height}
      borderRadius={borderRadius}
      backgroundColor="$secondary"
    />
  );
}
