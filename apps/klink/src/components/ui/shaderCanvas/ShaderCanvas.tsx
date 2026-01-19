import { useRef, useEffect } from "react";
import { useWebGLContext } from "./useWebGLContext";
import { useShaderProgram } from "./useShaderProgram";
import { useShaderUniforms } from "./useShaderUniforms";
import { useMouseTracking } from "./useMouseTracking";
import { useCanvasResize } from "./useCanvasResize";
import { useAnimationLoop } from "./useAnimationLoop";
import { shaderCache } from "./shaderCache";

interface ShaderCanvasProps {
  shaderCode: string;
  fillViewport?: boolean;
  enableCache?: boolean;
}

/**
 * Renders a ShaderToy-compatible GLSL shader on a canvas.
 * Supports iResolution, iTime, iMouse, and other standard uniforms.
 */
export function ShaderCanvas({
  shaderCode,
  fillViewport = false,
  enableCache = false,
}: ShaderCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Set up WebGL context
  const { gl, error: contextError } = useWebGLContext(canvasRef);

  // Compile shader program (with optional caching)
  const {
    program,
    vertexShader,
    fragmentShader,
    error: shaderError,
    cacheKey,
  } = useShaderProgram(gl, shaderCode, enableCache);

  // Get uniform locations
  const uniforms = useShaderUniforms(gl, program);

  // Track mouse position
  const mouseState = useMouseTracking(canvasRef);

  // Handle canvas resize
  useCanvasResize(canvasRef, gl);

  // Run animation loop
  useAnimationLoop(canvasRef, gl, program, uniforms, mouseState);

  // Cleanup shaders when unmounting (if not cached)
  useEffect(() => {
    return () => {
      if (!gl || !program || !vertexShader || !fragmentShader) return;

      // Only delete shaders if they're not in the cache
      const isCurrentlyCached = cacheKey && shaderCache.has(cacheKey);
      if (!isCurrentlyCached) {
        gl.deleteProgram(program);
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
      }
    };
  }, [gl, program, vertexShader, fragmentShader, cacheKey]);

  const error = contextError || shaderError;

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{
          position: fillViewport ? "fixed" : "absolute",
          top: 0,
          left: 0,
          width: fillViewport ? "100vw" : "100%",
          height: fillViewport ? "100vh" : "100%",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
      {error && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            padding: "20px",
            backgroundColor: "rgba(255, 0, 0, 0.8)",
            color: "white",
            borderRadius: "8px",
            maxWidth: "80%",
            zIndex: 1000,
          }}
        >
          <strong>Shader Error:</strong>
          <pre style={{ marginTop: "10px", fontSize: "12px" }}>{error}</pre>
        </div>
      )}
    </>
  );
}
