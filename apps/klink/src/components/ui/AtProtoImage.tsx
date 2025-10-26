import { Image } from "@tamagui/image";
import type { Main } from "@klink-app/lexicon/types";
import { useImageSource } from "../../hooks/useImageSource";

interface AtProtoImageProps {
  image:
    | Main["profileImage"]
    | Main["links"][0]["icon"]
    | Blob
    | null
    | undefined;
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
  const imageUrl = useImageSource(image, pdsUrl, did);
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
