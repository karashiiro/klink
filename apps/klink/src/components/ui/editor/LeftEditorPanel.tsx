import { YStack } from "@tamagui/stacks";
import { Card } from "@tamagui/card";
import { useAtomValue } from "jotai";
import {
  editorPanelsOpenAtom,
  mobileActivePanelAtom,
} from "../../../atoms/profile";
import { ProfileImageInput } from "./ProfileImageInput";
import { NameInput } from "./NameInput";
import { LocationInput } from "./LocationInput";
import { BioInput } from "./BioInput";
import { ProfileBackgroundSelector } from "./ProfileBackgroundSelector";
import { ThemeColorInput } from "./ThemeColorInput";
import { FontInput } from "./FontInput";
import { Separator } from "@tamagui/separator";

export function LeftEditorPanel() {
  const isOpen = useAtomValue(editorPanelsOpenAtom);
  const mobileActivePanel = useAtomValue(mobileActivePanelAtom);

  return (
    <Card
      position="absolute"
      left={isOpen && mobileActivePanel === "left" ? 0 : -350}
      $md={{
        left: isOpen ? 0 : -350,
      }}
      top={0}
      bottom={0}
      width={350}
      borderTopLeftRadius={0}
      borderBottomLeftRadius={0}
      paddingLeft="$4"
      paddingRight="$4"
      backgroundColor="rgba(0, 0, 0, 0.7)"
      style={{
        backdropFilter: "blur(10px)",
        transition: "left 0.3s ease",
      }}
      zIndex={10}
    >
      <YStack
        gap="$3"
        height="100%"
        style={{
          overflowY: "auto",
          overflowX: "hidden",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
        // Hide webkit scrollbar
        className="hide-scrollbar"
      >
        <div style={{ marginBottom: 36 }} />
        <ProfileImageInput />
        <NameInput />
        <LocationInput />
        <BioInput />
        <Separator />
        <ProfileBackgroundSelector />
        <Separator />
        <ThemeColorInput />
        <Separator />
        <FontInput />
      </YStack>
    </Card>
  );
}
