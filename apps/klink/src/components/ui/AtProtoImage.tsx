import { Image } from "@tamagui/image";
import type { Main } from "@klink-app/lexicon/types";
import { useImageSource } from "../../hooks/useImageSource";
import { useSession } from "../../hooks/useSession";

interface AtProtoImageProps {
  image:
    | Main["profileImage"]
    | Main["links"][0]["icon"]
    | Blob
    | null
    | undefined;
  width: number;
  height: number;
  borderRadius?: number;
}

export function AtProtoImage({
  image,
  width,
  height,
  borderRadius,
}: AtProtoImageProps) {
  const { pdsUrl, did } = useSession();
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
