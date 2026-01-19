import { useEffect, type RefObject } from "react";

/**
 * Hook for handling canvas resize with device pixel ratio support.
 * Automatically resizes the canvas to match its display size.
 */
export function useCanvasResize(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  gl: WebGLRenderingContext | null,
): void {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !gl) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const displayWidth = canvas.clientWidth * dpr;
      const displayHeight = canvas.clientHeight * dpr;

      if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
      }
    };

    window.addEventListener("resize", resize);
    resize(); // Initial resize

    return () => {
      window.removeEventListener("resize", resize);
    };
  }, [canvasRef, gl]);
}
