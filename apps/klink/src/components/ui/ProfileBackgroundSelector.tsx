import { useEffect, useRef, type FormEvent } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import {
  profileAtom,
  backgroundImageUrlAtom,
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
  const backgroundImageUrl = useAtomValue(backgroundImageUrlAtom);
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

  const handleBackgroundImageChange = (
    e: FormEvent<HTMLInputElement> | TextInputChangeEvent,
  ) => {
    setFormData((prev) => ({
      ...prev,
      backgroundImageUrl: (e.target as HTMLInputElement).value,
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
        backgroundImageUrl: "",
        backgroundType: "blob",
      }));
    }
  };

  const clearBackgroundImage = () => {
    setFormData((prev) => ({
      ...prev,
      backgroundImageBlob: null,
      backgroundImageUrl: "",
      backgroundType: "color",
    }));
  };

  return (
    <BackgroundSelector
      backgroundType={backgroundType}
      backgroundColor={backgroundColor}
      backgroundImageUrl={backgroundImageUrl}
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
