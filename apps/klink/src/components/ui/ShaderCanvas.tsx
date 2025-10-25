import { useEffect, useRef, useState } from "react";

interface ShaderCanvasProps {
  shaderCode: string;
}

export function ShaderCanvas({ shaderCode }: ShaderCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("[ShaderCanvas] Initializing with shader code length:", shaderCode?.length);
    const canvas = canvasRef.current;
    if (!canvas) {
      console.log("[ShaderCanvas] No canvas ref!");
      return;
    }

    const gl = canvas.getContext("webgl");
    if (!gl) {
      setError("WebGL not supported");
      return;
    }

    // Vertex shader (standard fullscreen quad)
    const vertexShaderSource = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    // Fragment shader wrapper for ShaderToy compatibility
    const fragmentShaderSource = `
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

    // Compile shader
    function compileShader(source: string, type: number): WebGLShader | null {
      const shader = gl.createShader(type);
      if (!shader) return null;

      gl.shaderSource(shader, source);
      gl.compileShader(shader);

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const info = gl.getShaderInfoLog(shader);
        setError(`Shader compilation error: ${info}`);
        gl.deleteShader(shader);
        return null;
      }

      return shader;
    }

    // Create program
    const vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);

    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const info = gl.getProgramInfoLog(program);
      setError(`Program linking error: ${info}`);
      return;
    }

    gl.useProgram(program);

    // Setup fullscreen quad
    const positions = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
       1,  1,
    ]);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Get uniform locations
    const iResolutionLocation = gl.getUniformLocation(program, "iResolution");
    const iTimeLocation = gl.getUniformLocation(program, "iTime");
    const iTimeDeltaLocation = gl.getUniformLocation(program, "iTimeDelta");
    const iFrameRateLocation = gl.getUniformLocation(program, "iFrameRate");
    const iFrameLocation = gl.getUniformLocation(program, "iFrame");
    const iChannelTimeLocation = gl.getUniformLocation(program, "iChannelTime");
    const iChannelResolutionLocation = gl.getUniformLocation(program, "iChannelResolution");
    const iMouseLocation = gl.getUniformLocation(program, "iMouse");
    const iDateLocation = gl.getUniformLocation(program, "iDate");

    // Mouse tracking
    let mouseX = 0;
    let mouseY = 0;
    let mouseClickX = 0;
    let mouseClickY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = rect.height - (e.clientY - rect.top); // Flip Y
    };

    const handleMouseDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseClickX = e.clientX - rect.left;
      mouseClickY = rect.height - (e.clientY - rect.top);
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mousedown", handleMouseDown);

    // Resize handler
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const displayWidth = canvas.clientWidth * dpr;
      const displayHeight = canvas.clientHeight * dpr;

      if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
        console.log("[ShaderCanvas] Canvas resized to:", canvas.width, "x", canvas.height, "clientSize:", canvas.clientWidth, "x", canvas.clientHeight);
      }
    };

    window.addEventListener("resize", resize);
    resize();

    // Animation loop
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
      const seconds = date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();

      // Update all uniforms
      gl.uniform3f(iResolutionLocation, canvas.width, canvas.height, 1.0);
      gl.uniform1f(iTimeLocation, time);
      gl.uniform1f(iTimeDeltaLocation, timeDelta);
      gl.uniform1f(iFrameRateLocation, frameRate);
      gl.uniform1i(iFrameLocation, frameCount);

      // Channel uniforms (all zeros for now since we don't support textures yet)
      gl.uniform1fv(iChannelTimeLocation, [0, 0, 0, 0]);
      gl.uniform3fv(iChannelResolutionLocation, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

      gl.uniform4f(iMouseLocation, mouseX, mouseY, mouseClickX, mouseClickY);
      gl.uniform4f(iDateLocation, year, month, day, seconds);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      frameCount++;
      lastFrameTime = now;
      animationId = requestAnimationFrame(render);
    };

    render();
    setError(null);
    console.log("[ShaderCanvas] Shader compiled and rendering!");

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("resize", resize);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
    };
  }, [shaderCode]);

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
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
