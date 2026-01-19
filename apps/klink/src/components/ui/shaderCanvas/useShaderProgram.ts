import { useState, useEffect } from "react";
import { shaderCache, getContextId, hashCode } from "./shaderCache";

// Vertex shader (standard fullscreen quad)
const VERTEX_SHADER_SOURCE = `
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

// Fragment shader wrapper for ShaderToy compatibility
function createFragmentShaderSource(shaderCode: string): string {
  return `
    precision mediump float;
    uniform vec3 iResolution;
    uniform float iTime;
    uniform float iTimeDelta;
    uniform float iFrameRate;
    uniform int iFrame;
    uniform float iChannelTime[4];
    uniform vec3 iChannelResolution[4];
    uniform vec4 iMouse;
    uniform vec4 iDate;

    ${shaderCode}

    void main() {
      mainImage(gl_FragColor, gl_FragCoord.xy);
    }
  `;
}

export interface ShaderProgramResult {
  program: WebGLProgram | null;
  vertexShader: WebGLShader | null;
  fragmentShader: WebGLShader | null;
  error: string | null;
  fromCache: boolean;
  cacheKey: string | null;
}

/**
 * Compiles a shader from source.
 */
function compileShader(
  gl: WebGLRenderingContext,
  source: string,
  type: number,
): { shader: WebGLShader | null; error: string | null } {
  const shader = gl.createShader(type);
  if (!shader) return { shader: null, error: "Failed to create shader" };

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    return { shader: null, error: `Shader compilation error: ${info}` };
  }

  return { shader, error: null };
}

/**
 * Hook for compiling and managing a shader program with optional caching.
 */
export function useShaderProgram(
  gl: WebGLRenderingContext | null,
  shaderCode: string,
  enableCache = false,
): ShaderProgramResult {
  const [result, setResult] = useState<ShaderProgramResult>({
    program: null,
    vertexShader: null,
    fragmentShader: null,
    error: null,
    fromCache: false,
    cacheKey: null,
  });

  useEffect(() => {
    if (!gl) {
      setResult({
        program: null,
        vertexShader: null,
        fragmentShader: null,
        error: null,
        fromCache: false,
        cacheKey: null,
      });
      return;
    }

    const fragmentShaderSource = createFragmentShaderSource(shaderCode);

    // Check cache if enabled
    const contextId = getContextId(gl);
    const shaderHash = hashCode(VERTEX_SHADER_SOURCE + fragmentShaderSource);
    const cacheKey = enableCache ? `${contextId}:${shaderHash}` : null;

    let vertexShader: WebGLShader | null = null;
    let fragmentShader: WebGLShader | null = null;
    let program: WebGLProgram | null = null;
    let fromCache = false;

    if (cacheKey && shaderCache.has(cacheKey)) {
      const cached = shaderCache.get(cacheKey)!;
      // Verify the cached program belongs to the same GL context
      if (cached.gl === gl) {
        vertexShader = cached.vertexShader;
        fragmentShader = cached.fragmentShader;
        program = cached.program;
        fromCache = true;
      }
    }

    if (!fromCache) {
      // Compile vertex shader
      const vertexResult = compileShader(gl, VERTEX_SHADER_SOURCE, gl.VERTEX_SHADER);
      if (vertexResult.error || !vertexResult.shader) {
        setResult({
          program: null,
          vertexShader: null,
          fragmentShader: null,
          error: vertexResult.error || "Failed to compile vertex shader",
          fromCache: false,
          cacheKey,
        });
        return;
      }
      vertexShader = vertexResult.shader;

      // Compile fragment shader
      const fragmentResult = compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
      if (fragmentResult.error || !fragmentResult.shader) {
        gl.deleteShader(vertexShader);
        setResult({
          program: null,
          vertexShader: null,
          fragmentShader: null,
          error: fragmentResult.error || "Failed to compile fragment shader",
          fromCache: false,
          cacheKey,
        });
        return;
      }
      fragmentShader = fragmentResult.shader;

      // Create and link program
      program = gl.createProgram();
      if (!program) {
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
        setResult({
          program: null,
          vertexShader: null,
          fragmentShader: null,
          error: "Failed to create program",
          fromCache: false,
          cacheKey,
        });
        return;
      }

      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const info = gl.getProgramInfoLog(program);
        gl.deleteProgram(program);
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
        setResult({
          program: null,
          vertexShader: null,
          fragmentShader: null,
          error: `Program linking error: ${info}`,
          fromCache: false,
          cacheKey,
        });
        return;
      }

      // Cache the compiled shaders if enabled
      if (cacheKey) {
        shaderCache.set(cacheKey, {
          vertexShader,
          fragmentShader,
          program,
          gl,
        });
      }
    }

    setResult({
      program,
      vertexShader,
      fragmentShader,
      error: null,
      fromCache,
      cacheKey,
    });
  }, [gl, shaderCode, enableCache]);

  return result;
}
