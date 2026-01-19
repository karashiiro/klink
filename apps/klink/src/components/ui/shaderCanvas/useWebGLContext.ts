import { useState, useEffect, type RefObject } from "react";

export interface WebGLContextResult {
  gl: WebGLRenderingContext | null;
  error: string | null;
}

/**
 * Hook for creating and managing a WebGL context from a canvas element.
 */
export function useWebGLContext(
  canvasRef: RefObject<HTMLCanvasElement | null>,
): WebGLContextResult {
  const [gl, setGl] = useState<WebGLRenderingContext | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("webgl");
    if (!context) {
      setError("WebGL not supported");
      setGl(null);
      return;
    }

    setGl(context);
    setError(null);
  }, [canvasRef]);

  return { gl, error };
}
