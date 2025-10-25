import { useState } from "react";
import { YStack } from "@tamagui/stacks";
import { Card } from "@tamagui/card";
import { Button } from "@tamagui/button";
import { useMedia } from "@tamagui/core";
import { ProfileImageInput } from "./ProfileImageInput";
import { NameInput } from "./NameInput";
import { LocationInput } from "./LocationInput";
import { BioInput } from "./BioInput";
import { ProfileBackgroundSelector } from "./ProfileBackgroundSelector";
import { ThemeColorInput } from "./ThemeColorInput";
import type { ReadProfileResult } from "../../hooks/useReadProfile";

interface LeftEditorPanelProps {
  profile?: ReadProfileResult["profile"];
}

export function LeftEditorPanel({ profile }: LeftEditorPanelProps) {
  const media = useMedia();
  const [isOpen, setIsOpen] = useState(media.gtMd);

  return (
    <>
      <Card
        position="absolute"
        left={isOpen ? 0 : -350}
        top={0}
        bottom={0}
        width={350}
        padding="$4"
        backgroundColor="rgba(0, 0, 0, 0.7)"
        style={{
          backdropFilter: "blur(10px)",
          transition: "left 0.3s ease",
        }}
        zIndex={10}
        $gtMd={{
          position: "absolute",
        }}
        $sm={{
          position: "absolute",
        }}
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
          <ProfileImageInput profile={profile} />
          <NameInput />
          <LocationInput />
          <BioInput />
          <ProfileBackgroundSelector profile={profile} />
          <ThemeColorInput />
        </YStack>
      </Card>

      <Button
        position="absolute"
        left={isOpen ? 350 : 0}
        top={16}
        size="$3"
        backgroundColor="rgba(0, 0, 0, 0.7)"
        borderColor="rgba(255, 255, 255, 0.1)"
        borderWidth={1}
        color="white"
        hoverStyle={{
          backgroundColor: "rgba(0, 0, 0, 0.8)",
        }}
        pressStyle={{
          backgroundColor: "rgba(0, 0, 0, 0.9)",
        }}
        zIndex={11}
        onPress={() => setIsOpen(!isOpen)}
        style={{
          backdropFilter: "blur(10px)",
          transition: "left 0.3s ease",
        }}
      >
        {isOpen ? "Hide" : "Profile"}
      </Button>
    </>
  );
}
