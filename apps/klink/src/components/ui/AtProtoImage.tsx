import { Image } from "@tamagui/image";
import { useImageSource } from "../../hooks/useImageSource";
import { useSession } from "../../hooks/useSession";
import type { ProfileImage } from "../../utils/profileUtils";
import type { LinkIcon } from "../../utils/linkUtils";

interface AtProtoImageProps {
  image: ProfileImage | LinkIcon | null | undefined;
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
    />
  );
}
