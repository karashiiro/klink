import { useEffect } from "react";

interface CustomStylesheetProps {
  stylesheet?: string;
  id: string;
}

export function CustomStylesheet({ stylesheet, id }: CustomStylesheetProps) {
  useEffect(() => {
    if (!stylesheet) {
      return;
    }

    const styleId = `custom-stylesheet-${id}`;
    let styleElement = document.getElementById(styleId);

    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    styleElement.textContent = stylesheet;

    return () => {
      styleElement?.remove();
    };
  }, [stylesheet, id]);

  return null;
}
