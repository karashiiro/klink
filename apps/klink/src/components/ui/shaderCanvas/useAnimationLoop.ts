import { useEffect, type RefObject } from "react";
import type { ShaderUniforms } from "./useShaderUniforms";
import type { MouseState } from "./useMouseTracking";

/**
 * Hook for running the WebGL animation loop.
 * Updates uniforms and renders each frame.
 */
export function useAnimationLoop(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  gl: WebGLRenderingContext | null,
  program: WebGLProgram | null,
  uniforms: ShaderUniforms | null,
  mouseState: MouseState,
): void {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !gl || !program || !uniforms) return;

    gl.useProgram(program);

    // Setup fullscreen quad
    const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Animation loop state
    const startTime = Date.now();
    let frameCount = 0;
    let lastFrameTime = startTime;
    let animationId: number;

    const render = () => {
      const now = Date.now();
      const time = (now - startTime) / 1000;
      const timeDelta = (now - lastFrameTime) / 1000;
      const frameRate = timeDelta > 0 ? 1 / timeDelta : 60;

      // Update date uniform
      const date = new Date();
      const year = date.getFullYear();
      const month = date.getMonth();
      const day = date.getDate();
      const seconds =
        date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();

      // Update all uniforms
      gl.uniform3f(uniforms.iResolution, canvas.width, canvas.height, 1.0);
      gl.uniform1f(uniforms.iTime, time);
      gl.uniform1f(uniforms.iTimeDelta, timeDelta);
      gl.uniform1f(uniforms.iFrameRate, frameRate);
      gl.uniform1i(uniforms.iFrame, frameCount);

      // Channel uniforms (all zeros for now since we don't support textures yet)
      gl.uniform1fv(uniforms.iChannelTime, [0, 0, 0, 0]);
      gl.uniform3fv(
        uniforms.iChannelResolution,
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      );

      gl.uniform4f(
        uniforms.iMouse,
        mouseState.x,
        mouseState.y,
        mouseState.clickX,
        mouseState.clickY,
      );
      gl.uniform4f(uniforms.iDate, year, month, day, seconds);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      frameCount++;
      lastFrameTime = now;
      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [canvasRef, gl, program, uniforms, mouseState]);
}
