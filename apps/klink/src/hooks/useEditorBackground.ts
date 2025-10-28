import { useAtomValue } from "jotai";
import {
  backgroundTypeAtom,
  backgroundAtom,
  backgroundImageBlobAtom,
  backgroundColorAtom,
  backgroundObjectFitAtom,
  backgroundShaderCodeAtom,
} from "../atoms/profile";
import type { Background } from "../utils/backgroundUtils";
import { useImageSource } from "./useImageSource";
import { useSession } from "./useSession";

export function useEditorBackground(): Background {
  const { pdsUrl, did } = useSession();
  const backgroundType = useAtomValue(backgroundTypeAtom);
  const backgroundValue = useAtomValue(backgroundAtom);
  const backgroundImageBlob = useAtomValue(backgroundImageBlobAtom);
  const backgroundColor = useAtomValue(backgroundColorAtom);
  const backgroundObjectFit = useAtomValue(backgroundObjectFitAtom);
  const backgroundShaderCode = useAtomValue(backgroundShaderCodeAtom);
  const backgroundImageUrl = useImageSource(
    backgroundImageBlob ?? backgroundValue,
    pdsUrl,
    did,
  );
  return (backgroundType === "blob" || backgroundType === "url") &&
    backgroundImageUrl
    ? {
        type: "url",
        value: backgroundImageUrl,
        $type: "moe.karashiiro.klink.profile#urlBackground",
        objectFit: backgroundObjectFit,
      }
    : backgroundType === "shader"
      ? {
          type: "shader",
          value: new Blob([backgroundShaderCode]),
          $type: "moe.karashiiro.klink.profile#shaderBackground",
        }
      : (backgroundValue ?? {
          type: "color",
          value: backgroundColor,
          $type: "moe.karashiiro.klink.profile#colorBackground",
        });
}
