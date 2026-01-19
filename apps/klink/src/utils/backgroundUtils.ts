import type { Blob as AtProtoBlob, LegacyBlob } from "@atcute/lexicons";
import type { Main } from "@klink-app/lexicon/types";
import { getAtProtoBlobCid, buildAtProtoBlobUrl } from "./blobUtils";

export type Background =
  | Main["background"]
  | {
      $type: "moe.karashiiro.klink.profile#urlBackground";
      type: "url";
      value: string;
      objectFit: string;
    }
  | {
      $type: "moe.karashiiro.klink.profile#blobBackground";
      type: "blob";
      value: AtProtoBlob<string> | LegacyBlob<string> | Blob;
      objectFit: string;
    }
  | {
      $type: "moe.karashiiro.klink.profile#shaderBackground";
      type: "shader";
      value: AtProtoBlob<string> | LegacyBlob<string> | Blob;
    };

export function getBackgroundStyle(
  background: Background,
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
      const cid = getAtProtoBlobCid(background.value);
      imageUrl = buildAtProtoBlobUrl(pdsUrl, did, cid);
    }
  }

  const objectFit = background.objectFit || "cover";

  return {
    backgroundImage: `url(${imageUrl})`,
    backgroundSize: objectFit,
    backgroundPosition: "center",
  };
}
