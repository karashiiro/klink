import { Button } from "@tamagui/button";
import { useAtom } from "jotai";
import { editorPanelsOpenAtom } from "../../../atoms/profile";

export function EditorPanelToggle() {
  const [isOpen, setIsOpen] = useAtom(editorPanelsOpenAtom);

  return (
    <Button
      position="absolute"
      top={16}
      left="50%"
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
        transform: "translateX(-50%)",
      }}
    >
      {isOpen ? "Hide Editor" : "Show Editor"}
    </Button>
  );
}
