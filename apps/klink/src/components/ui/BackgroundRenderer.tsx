import { useEffect, useState } from "react";
import { ShaderCanvas } from "./ShaderCanvas";
import { getAtProtoBlobCid, buildAtProtoBlobUrl } from "../../utils/blobUtils";
import { useSession } from "../../hooks/useSession";
import type { Background } from "../../utils/backgroundUtils";

interface BackgroundRendererProps {
  background: Background;
  pdsUrl?: string;
  did?: string;
  fillViewport?: boolean;
  enableCache?: boolean;
}

export function BackgroundRenderer({
  background,
  pdsUrl: propPdsUrl,
  did: propDid,
  fillViewport = false,
  enableCache = false,
}: BackgroundRendererProps) {
  const session = useSession();
  const [shaderCode, setShaderCode] = useState<string | null>(null);

  // Use prop values if provided (for ProfileView with loader data),
  // otherwise fall back to session context (for authenticated preview)
  const pdsUrl = propPdsUrl || session.pdsUrl;
  const did = propDid || session.did;

  useEffect(() => {
    if (background.type === "shader") {
      // Handle both Blob instances (preview) and blob references (from PDS)
      if (background.value instanceof Blob) {
        // Read blob content
        const reader = new FileReader();
        reader.onload = (e) => {
          const code = e.target?.result as string;
          setShaderCode(code);
        };
        reader.readAsText(background.value);
      } else if (pdsUrl && did) {
        // Fetch from PDS using the helper
        const cid = getAtProtoBlobCid(background.value);

        if (cid) {
          const blobUrl = buildAtProtoBlobUrl(pdsUrl, did, cid);

          fetch(blobUrl)
            .then((res) => res.text())
            .then((code) => {
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
    return (
      <ShaderCanvas
        shaderCode={shaderCode}
        fillViewport={fillViewport}
        enableCache={enableCache}
      />
    );
  }

  return null;
}
