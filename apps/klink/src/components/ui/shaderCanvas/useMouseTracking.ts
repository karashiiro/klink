import { useState, useEffect, type RefObject } from "react";

export interface MouseState {
  x: number;
  y: number;
  clickX: number;
  clickY: number;
}

/**
 * Hook for tracking mouse position and clicks on a canvas element.
 * Y coordinate is flipped for WebGL coordinate system.
 */
export function useMouseTracking(
  canvasRef: RefObject<HTMLCanvasElement | null>,
): MouseState {
  const [mouseState, setMouseState] = useState<MouseState>({
    x: 0,
    y: 0,
    clickX: 0,
    clickY: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      setMouseState((prev) => ({
        ...prev,
        x: e.clientX - rect.left,
        y: rect.height - (e.clientY - rect.top), // Flip Y for WebGL
      }));
    };

    const handleMouseDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      setMouseState((prev) => ({
        ...prev,
        clickX: e.clientX - rect.left,
        clickY: rect.height - (e.clientY - rect.top), // Flip Y for WebGL
      }));
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mousedown", handleMouseDown);

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mousedown", handleMouseDown);
    };
  }, [canvasRef]);

  return mouseState;
}
