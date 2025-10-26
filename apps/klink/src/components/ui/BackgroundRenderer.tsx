import { useEffect, useState } from "react";
import { ShaderCanvas } from "./ShaderCanvas";
import type { Main } from "@klink-app/lexicon/types";
import { getAtProtoBlobCid, buildAtProtoBlobUrl } from "../../utils/blobUtils";

interface BackgroundRendererProps {
  background: Main["background"];
  pdsUrl?: string;
  did?: string;
}

export function BackgroundRenderer({
  background,
  pdsUrl,
  did,
}: BackgroundRendererProps) {
  const [shaderCode, setShaderCode] = useState<string | null>(null);

  useEffect(() => {
    if (background.type === "shader") {
      console.log(
        "[BackgroundRenderer] Shader background detected",
        background,
      );
      // Handle both Blob instances (preview) and blob references (from PDS)
      if (background.value instanceof Blob) {
        console.log("[BackgroundRenderer] Reading shader from Blob");
        // Read blob content
        const reader = new FileReader();
        reader.onload = (e) => {
          const code = e.target?.result as string;
          console.log(
            "[BackgroundRenderer] Shader code loaded from Blob, length:",
            code?.length,
          );
          setShaderCode(code);
        };
        reader.readAsText(background.value);
      } else if (pdsUrl && did) {
        // Fetch from PDS using the helper
        const cid = getAtProtoBlobCid(background.value);

        if (cid) {
          const blobUrl = buildAtProtoBlobUrl(pdsUrl, did, cid);

          console.log(
            "[BackgroundRenderer] Fetching shader from PDS:",
            blobUrl,
          );
          fetch(blobUrl)
            .then((res) => res.text())
            .then((code) => {
              console.log(
                "[BackgroundRenderer] Shader code loaded from PDS, length:",
                code?.length,
              );
              setShaderCode(code);
            })
            .catch((err) => console.error("Failed to fetch shader:", err));
        }
      }
    } else {
      setShaderCode(null);
    }
  }, [background, pdsUrl, did]);

  if (background.type === "shader" && shaderCode) {
    return <ShaderCanvas shaderCode={shaderCode} />;
  }

  return null;
}
