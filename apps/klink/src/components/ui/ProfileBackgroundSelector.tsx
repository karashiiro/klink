import { useEffect, useRef, type FormEvent } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import {
  profileAtom,
  backgroundImageBlobAtom,
  backgroundColorAtom,
  backgroundTypeAtom,
  backgroundObjectFitAtom,
} from "../../atoms/profile";
import { BackgroundSelector } from "./BackgroundSelector";
import type { TextInputChangeEvent, BlurEvent } from "react-native";
import type { ReadProfileResult } from "../../hooks/useReadProfile";

interface ProfileBackgroundSelectorProps {
  profile?: ReadProfileResult["profile"];
}

export function ProfileBackgroundSelector({
  profile,
}: ProfileBackgroundSelectorProps) {
  const backgroundImageBlob = useAtomValue(backgroundImageBlobAtom);
  const backgroundColor = useAtomValue(backgroundColorAtom);
  const backgroundType = useAtomValue(backgroundTypeAtom);
  const backgroundObjectFit = useAtomValue(backgroundObjectFitAtom);
  const setFormData = useSetAtom(profileAtom);
  const colorInputRef = useRef<HTMLInputElement>(null);

  // Sync color input value when profile loads
  useEffect(() => {
    if (profile?.value.background.type === "color" && colorInputRef.current) {
      colorInputRef.current.value = profile.value.background.value;
    }
  }, [profile]);

  // URL input is handled by BackgroundSelector directly via atoms
  const handleBackgroundImageChange = () => {
    // This would need to create a background object, but for now we just handle blobs
    setFormData((prev) => ({
      ...prev,
      backgroundImageBlob: null,
    }));
  };

  const handleColorChange = (e: BlurEvent) => {
    const newColor = (e.target as unknown as HTMLInputElement).value;
    setFormData((prev) => ({ ...prev, backgroundColor: newColor }));
  };

  const handleBackgroundImageFile = (
    e: FormEvent<HTMLInputElement> | TextInputChangeEvent,
  ) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        backgroundImageBlob: file,
        backgroundType: "blob",
      }));
    }
  };

  const clearBackgroundImage = () => {
    setFormData((prev) => ({
      ...prev,
      backgroundImageBlob: null,
      backgroundType: "color",
    }));
  };

  return (
    <BackgroundSelector
      backgroundType={backgroundType}
      backgroundColor={backgroundColor}
      backgroundImageUrl=""
      backgroundImageBlob={backgroundImageBlob}
      backgroundObjectFit={backgroundObjectFit}
      hasExistingBlob={profile?.value.background.type === "blob"}
      colorInputRef={colorInputRef}
      onTypeChange={(type) =>
        setFormData((prev) => ({ ...prev, backgroundType: type }))
      }
      onColorChange={handleColorChange}
      onUrlChange={handleBackgroundImageChange}
      onFileChange={handleBackgroundImageFile}
      onObjectFitChange={(fit) =>
        setFormData((prev) => ({
          ...prev,
          backgroundObjectFit: fit,
        }))
      }
      onClearBlob={profile ? clearBackgroundImage : undefined}
    />
  );
}
