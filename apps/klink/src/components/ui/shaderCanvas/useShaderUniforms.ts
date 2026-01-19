import { useMemo } from "react";

export interface ShaderUniforms {
  iResolution: WebGLUniformLocation | null;
  iTime: WebGLUniformLocation | null;
  iTimeDelta: WebGLUniformLocation | null;
  iFrameRate: WebGLUniformLocation | null;
  iFrame: WebGLUniformLocation | null;
  iChannelTime: WebGLUniformLocation | null;
  iChannelResolution: WebGLUniformLocation | null;
  iMouse: WebGLUniformLocation | null;
  iDate: WebGLUniformLocation | null;
}

/**
 * Hook for getting uniform locations from a shader program.
 */
export function useShaderUniforms(
  gl: WebGLRenderingContext | null,
  program: WebGLProgram | null,
): ShaderUniforms | null {
  return useMemo(() => {
    if (!gl || !program) return null;

    return {
      iResolution: gl.getUniformLocation(program, "iResolution"),
      iTime: gl.getUniformLocation(program, "iTime"),
      iTimeDelta: gl.getUniformLocation(program, "iTimeDelta"),
      iFrameRate: gl.getUniformLocation(program, "iFrameRate"),
      iFrame: gl.getUniformLocation(program, "iFrame"),
      iChannelTime: gl.getUniformLocation(program, "iChannelTime"),
      iChannelResolution: gl.getUniformLocation(program, "iChannelResolution"),
      iMouse: gl.getUniformLocation(program, "iMouse"),
      iDate: gl.getUniformLocation(program, "iDate"),
    };
  }, [gl, program]);
}
