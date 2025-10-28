import { useRef, type FormEvent } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  backgroundImageBlobAtom,
  backgroundImageUrlAtom,
  backgroundColorAtom,
  backgroundTypeAtom,
  backgroundObjectFitAtom,
} from "../../../atoms/profile";
import { YStack, XStack } from "@tamagui/stacks";
import { Paragraph } from "@tamagui/text";
import { Button } from "@tamagui/button";
import { Input } from "@tamagui/input";
import { ShaderBackgroundSelector } from "./ShaderBackgroundSelector";
import type { TextInputChangeEvent, BlurEvent } from "react-native";

export function ProfileBackgroundSelector() {
  const backgroundImageBlob = useAtomValue(backgroundImageBlobAtom);
  const backgroundImageUrl = useAtomValue(backgroundImageUrlAtom);
  const backgroundColor = useAtomValue(backgroundColorAtom);
  const [backgroundType, setBackgroundType] = useAtom(backgroundTypeAtom);
  const [backgroundObjectFit, setBackgroundObjectFit] = useAtom(
    backgroundObjectFitAtom,
  );
  const setBackgroundColor = useSetAtom(backgroundColorAtom);
  const setBackgroundImageUrl = useSetAtom(backgroundImageUrlAtom);
  const setBackgroundImageBlob = useSetAtom(backgroundImageBlobAtom);
  const colorInputRef = useRef<HTMLInputElement>(null);

  const handleColorChange = (e: BlurEvent) => {
    const newColor = (e.target as unknown as HTMLInputElement).value;
    setBackgroundColor(newColor);
  };

  const handleUrlChange = (e: BlurEvent) => {
    const newUrl = (e.target as unknown as HTMLInputElement).value;
    setBackgroundImageUrl(newUrl);
  };

  const handleBackgroundImageFile = (
    e: FormEvent<HTMLInputElement> | TextInputChangeEvent,
  ) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      setBackgroundImageBlob(file);
      setBackgroundType("blob");
    }
  };

  const clearBackgroundImage = () => {
    setBackgroundImageBlob(null);
    setBackgroundType("color");
  };

  return (
    <YStack gap="$2">
      <Paragraph color="$textBody">Background:</Paragraph>
      <XStack gap="$2">
        <Button
          size="$3"
          flex={1}
          backgroundColor={
            backgroundType === "color" ? "$accent" : "$secondary"
          }
          onPress={() => setBackgroundType("color")}
        >
          Color
        </Button>
        <Button
          size="$3"
          flex={1}
          backgroundColor={backgroundType === "url" ? "$accent" : "$secondary"}
          onPress={() => setBackgroundType("url")}
        >
          Image URL
        </Button>
        <Button
          size="$3"
          flex={1}
          backgroundColor={backgroundType === "blob" ? "$accent" : "$secondary"}
          onPress={() => setBackgroundType("blob")}
        >
          Upload
        </Button>
        <Button
          size="$3"
          flex={1}
          backgroundColor={
            backgroundType === "shader" ? "$accent" : "$secondary"
          }
          onPress={() => setBackgroundType("shader")}
        >
          Shader
        </Button>
      </XStack>
      {backgroundType === "color" ? (
        <Input
          ref={colorInputRef}
          type="color"
          defaultValue={backgroundColor}
          onBlur={handleColorChange}
          width="100%"
          size="$4"
        />
      ) : backgroundType === "url" ? (
        <YStack gap="$2">
          <Input
            placeholder="Background Image URL"
            defaultValue={backgroundImageUrl}
            onBlur={handleUrlChange}
            backgroundColor="$secondary"
            color="$textBody"
            borderColor="$border"
            size="$4"
          />
          <Paragraph color="$textMuted" fontSize="$2">
            Image fit:
          </Paragraph>
          <XStack gap="$2" flexWrap="wrap">
            {(["cover", "contain", "fill", "scale-down", "none"] as const).map(
              (fit) => (
                <Button
                  key={fit}
                  size="$2"
                  backgroundColor={
                    backgroundObjectFit === fit ? "$accent" : "$secondary"
                  }
                  onPress={() => setBackgroundObjectFit(fit)}
                >
                  {fit}
                </Button>
              ),
            )}
          </XStack>
        </YStack>
      ) : backgroundType === "shader" ? (
        <ShaderBackgroundSelector />
      ) : (
        <YStack gap="$2">
          <Input
            type="file"
            accept="image/*"
            onChange={handleBackgroundImageFile}
            backgroundColor="$secondary"
            color="$textBody"
            borderColor="$border"
            size="$4"
          />
          {backgroundImageBlob && (
            <XStack alignItems="center" gap="$2">
              <Paragraph color="$accent" fontSize="$2" flex={1}>
                File selected: {(backgroundImageBlob as File).name || "image"}
              </Paragraph>
              <Button
                size="$2"
                backgroundColor="$redBase"
                hoverStyle={{ backgroundColor: "$redHover" }}
                onPress={clearBackgroundImage}
              >
                Clear
              </Button>
            </XStack>
          )}
          <Paragraph color="$textMuted" fontSize="$2">
            Image fit:
          </Paragraph>
          <XStack gap="$2" flexWrap="wrap">
            {(["cover", "contain", "fill", "scale-down", "none"] as const).map(
              (fit) => (
                <Button
                  key={fit}
                  size="$2"
                  backgroundColor={
                    backgroundObjectFit === fit ? "$accent" : "$secondary"
                  }
                  onPress={() => setBackgroundObjectFit(fit)}
                >
                  {fit}
                </Button>
              ),
            )}
          </XStack>
        </YStack>
      )}
    </YStack>
  );
}
