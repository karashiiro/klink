import { Image } from "@tamagui/image";
import type { Main } from "@klink-app/lexicon/types";

interface AtProtoImageProps {
  image: Main["profileImage"];
  pdsUrl: string;
  did: string;
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
  if (!image) return null;

  const imageUrl =
    image.type === "url"
      ? image.value
      : `${pdsUrl}/xrpc/com.atproto.sync.getBlob?did=${did}&cid=${image.value.ref.$link}`;

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
