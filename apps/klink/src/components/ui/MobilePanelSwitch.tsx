import { XStack, YStack } from "@tamagui/stacks";
import { Paragraph } from "@tamagui/text";
import { Switch } from "@tamagui/switch";
import { useAtom, useAtomValue } from "jotai";
import {
  editorPanelsOpenAtom,
  mobileActivePanelAtom,
} from "../../atoms/profile";

export function MobilePanelSwitch() {
  const isOpen = useAtomValue(editorPanelsOpenAtom);
  const [activePanel, setActivePanel] = useAtom(mobileActivePanelAtom);

  // Only show on mobile when editor is open
  if (!isOpen) return null;

  return (
    <YStack
      position="absolute"
      bottom={16}
      left="50%"
      zIndex={11}
      style={{
        transform: "translateX(-50%)",
      }}
      display="flex"
      $md={{
        display: "none",
      }}
    >
      <XStack
        backgroundColor="rgba(0, 0, 0, 0.8)"
        borderColor="rgba(255, 255, 255, 0.1)"
        borderWidth={1}
        borderRadius="$4"
        paddingVertical="$2"
        paddingHorizontal="$3"
        alignItems="center"
        gap="$3"
        style={{
          backdropFilter: "blur(10px)",
        }}
      >
        <Paragraph
          color={activePanel === "left" ? "white" : "rgba(255, 255, 255, 0.5)"}
          fontSize="$3"
          fontWeight={activePanel === "left" ? "bold" : "normal"}
        >
          Profile
        </Paragraph>
        <Switch
          size="$3"
          checked={activePanel === "right"}
          onCheckedChange={(checked) =>
            setActivePanel(checked ? "right" : "left")
          }
        >
          <Switch.Thumb animation="quick" />
        </Switch>
        <Paragraph
          color={activePanel === "right" ? "white" : "rgba(255, 255, 255, 0.5)"}
          fontSize="$3"
          fontWeight={activePanel === "right" ? "bold" : "normal"}
        >
          Links
        </Paragraph>
      </XStack>
    </YStack>
  );
}
