import type { Main } from "@klink-app/lexicon/types";

export function getBackgroundStyle(
  background: Main["background"],
  pdsUrl: string,
  did: string,
): React.CSSProperties {
  if (background.type === "color") {
    return { backgroundColor: background.value };
  }

  const imageUrl =
    background.type === "url"
      ? background.value
      : `${pdsUrl}/xrpc/com.atproto.sync.getBlob?did=${did}&cid=${background.value.ref.$link}`;

  const objectFit = background.objectFit || "cover";

  return {
    backgroundImage: `url(${imageUrl})`,
    backgroundSize: objectFit,
    backgroundPosition: "center",
  };
}
