import { YStack, XStack } from "@tamagui/stacks";
import { Paragraph } from "@tamagui/text";
import { useAtomValue, useSetAtom } from "jotai";
import { primaryColorAtom, secondaryColorAtom } from "../../../atoms/profile";
import { Input } from "@tamagui/input";
import { Slider } from "@tamagui/slider";
import { useState, useEffect, useRef } from "react";

// Helper to convert hex + alpha to rgba
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Helper to extract hex and alpha from rgba or hex
function parseColor(color: string): { hex: string; alpha: number } {
  if (color.startsWith("rgba")) {
    const match = color.match(
      /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/,
    );
    if (match) {
      const r = parseInt(match[1]).toString(16).padStart(2, "0");
      const g = parseInt(match[2]).toString(16).padStart(2, "0");
      const b = parseInt(match[3]).toString(16).padStart(2, "0");
      const alpha = match[4] ? parseFloat(match[4]) : 1;
      return { hex: `#${r}${g}${b}`, alpha };
    }
  }
  // Assume hex format
  return { hex: color.startsWith("#") ? color : `#${color}`, alpha: 1 };
}

export function ThemeColorInput() {
  const primaryColor = useAtomValue(primaryColorAtom);
  const setPrimaryColor = useSetAtom(primaryColorAtom);
  const secondaryColor = useAtomValue(secondaryColorAtom);
  const setSecondaryColor = useSetAtom(secondaryColorAtom);

  const primaryParsed = parseColor(primaryColor);
  const secondaryParsed = parseColor(secondaryColor);

  // Use refs for color hex values during dragging (no re-renders!)
  const primaryHexRef = useRef(primaryParsed.hex);
  const secondaryHexRef = useRef(secondaryParsed.hex);

  // Use state only for alpha (needs to update slider display)
  const [primaryAlpha, setPrimaryAlpha] = useState(primaryParsed.alpha);
  const [secondaryAlpha, setSecondaryAlpha] = useState(secondaryParsed.alpha);

  // Refs for the input elements so we can update them directly
  const primaryInputRef = useRef<HTMLInputElement>(null);
  const secondaryInputRef = useRef<HTMLInputElement>(null);

  // Update refs and inputs when atoms change (e.g., profile load)
  useEffect(() => {
    const parsed = parseColor(primaryColor);
    primaryHexRef.current = parsed.hex;
    setPrimaryAlpha(parsed.alpha);
    if (primaryInputRef.current) {
      primaryInputRef.current.value = parsed.hex;
    }
  }, [primaryColor]);

  useEffect(() => {
    const parsed = parseColor(secondaryColor);
    secondaryHexRef.current = parsed.hex;
    setSecondaryAlpha(parsed.alpha);
    if (secondaryInputRef.current) {
      secondaryInputRef.current.value = parsed.hex;
    }
  }, [secondaryColor]);

  // Commit color to atom on blur (after user finishes picking)
  const commitPrimaryColor = () => {
    const hex = primaryInputRef.current?.value || primaryHexRef.current;
    primaryHexRef.current = hex;
    setPrimaryColor(primaryAlpha < 1 ? hexToRgba(hex, primaryAlpha) : hex);
  };

  const commitSecondaryColor = () => {
    const hex = secondaryInputRef.current?.value || secondaryHexRef.current;
    secondaryHexRef.current = hex;
    setSecondaryColor(
      secondaryAlpha < 1 ? hexToRgba(hex, secondaryAlpha) : hex,
    );
  };

  const handlePrimaryAlphaChange = (alpha: number) => {
    setPrimaryAlpha(alpha);
    setPrimaryColor(
      alpha < 1
        ? hexToRgba(primaryHexRef.current, alpha)
        : primaryHexRef.current,
    );
  };

  const handleSecondaryAlphaChange = (alpha: number) => {
    setSecondaryAlpha(alpha);
    setSecondaryColor(
      alpha < 1
        ? hexToRgba(secondaryHexRef.current, alpha)
        : secondaryHexRef.current,
    );
  };

  return (
    <YStack gap="$3">
      <Paragraph color="white" fontWeight="bold" fontSize="$4">
        Theme Colors
      </Paragraph>

      <YStack gap="$2">
        <Paragraph color="$textMuted" fontSize="$3">
          Primary (Card)
        </Paragraph>
        <XStack gap="$2" alignItems="center">
          <Input
            id="primary-color"
            ref={primaryInputRef}
            type="color"
            defaultValue={primaryParsed.hex}
            onBlur={commitPrimaryColor}
            width="100%"
            size="$4"
          />
        </XStack>
        <XStack gap="$2" alignItems="center">
          <Paragraph color="$textMuted" fontSize="$2" width={60}>
            Opacity
          </Paragraph>
          <Slider
            value={[primaryAlpha * 100]}
            onValueChange={(value) => handlePrimaryAlphaChange(value[0] / 100)}
            min={0}
            max={100}
            step={1}
            flex={1}
            size="$2"
          >
            <Slider.Track backgroundColor="$gray8">
              <Slider.TrackActive backgroundColor="$blue10" />
            </Slider.Track>
            <Slider.Thumb backgroundColor="white" circular index={0} />
          </Slider>
          <Paragraph
            color="$textMuted"
            fontSize="$2"
            width={40}
            textAlign="right"
          >
            {Math.round(primaryAlpha * 100)}%
          </Paragraph>
        </XStack>
      </YStack>

      <YStack gap="$2">
        <Paragraph color="$textMuted" fontSize="$3">
          Secondary (Buttons)
        </Paragraph>
        <XStack gap="$2" alignItems="center">
          <Input
            id="secondary-color"
            ref={secondaryInputRef}
            type="color"
            defaultValue={secondaryParsed.hex}
            onBlur={commitSecondaryColor}
            width="100%"
            size="$4"
          />
        </XStack>
        <XStack gap="$2" alignItems="center">
          <Paragraph color="$textMuted" fontSize="$2" width={60}>
            Opacity
          </Paragraph>
          <Slider
            value={[secondaryAlpha * 100]}
            onValueChange={(value) =>
              handleSecondaryAlphaChange(value[0] / 100)
            }
            min={0}
            max={100}
            step={1}
            flex={1}
            size="$2"
          >
            <Slider.Track backgroundColor="$gray8">
              <Slider.TrackActive backgroundColor="$blue10" />
            </Slider.Track>
            <Slider.Thumb backgroundColor="white" circular index={0} />
          </Slider>
          <Paragraph
            color="$textMuted"
            fontSize="$2"
            width={40}
            textAlign="right"
          >
            {Math.round(secondaryAlpha * 100)}%
          </Paragraph>
        </XStack>
      </YStack>
    </YStack>
  );
}
