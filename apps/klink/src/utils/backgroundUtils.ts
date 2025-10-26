import type { Main } from "@klink-app/lexicon/types";

export function getBackgroundStyle(
  background: Main["background"],
  pdsUrl: string,
  did: string,
): React.CSSProperties {
  if (background.type === "color") {
    return { backgroundColor: background.value };
  }

  if (background.type === "shader") {
    // Shader backgrounds are rendered via ShaderCanvas component
    return { position: "relative" };
  }

  let imageUrl: string;
  if (background.type === "url") {
    imageUrl = background.value;
  } else {
    // Handle both Blob instances (preview) and blob references (from PDS)
    if (background.value instanceof Blob) {
      imageUrl = URL.createObjectURL(background.value);
    } else {
      const cleanPdsUrl = pdsUrl.endsWith("/") ? pdsUrl.slice(0, -1) : pdsUrl;

      const blob = background.value;
      const blobCid = "ref" in blob ? blob.ref.$link : blob.cid;
      imageUrl = `${cleanPdsUrl}/xrpc/com.atproto.sync.getBlob?did=${did}&cid=${blobCid}`;
    }
  }

  const objectFit = background.objectFit || "cover";

  return {
    backgroundImage: `url(${imageUrl})`,
    backgroundSize: objectFit,
    backgroundPosition: "center",
  };
}
