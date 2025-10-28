import { useEffect, useRef, useState } from "react";

// Global shader cache to avoid recompiling the same shaders
// Key format: "contextId:shaderHash"
interface CachedShader {
  vertexShader: WebGLShader;
  fragmentShader: WebGLShader;
  program: WebGLProgram;
  gl: WebGLRenderingContext;
}

const shaderCache = new Map<string, CachedShader>();
let contextIdCounter = 0;
const contextIds = new WeakMap<WebGLRenderingContext, number>();

function getContextId(gl: WebGLRenderingContext): number {
  if (!contextIds.has(gl)) {
    contextIds.set(gl, contextIdCounter++);
  }
  return contextIds.get(gl)!;
}

// Simple hash function for shader code
function hashCode(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(36);
}

interface ShaderCanvasProps {
  shaderCode: string;
  fillViewport?: boolean;
  enableCache?: boolean;
}

export function ShaderCanvas({
  shaderCode,
  fillViewport = false,
  enableCache = false,
}: ShaderCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
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

    // Check cache if enabled
    const contextId = getContextId(gl);
    const shaderHash = hashCode(vertexShaderSource + fragmentShaderSource);
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
      // Compile shader
      function compileShader(source: string, type: number): WebGLShader | null {
        if (!gl) return null;
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
      vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER);
      fragmentShader = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);

      if (!vertexShader || !fragmentShader) return;

      program = gl.createProgram();
      if (!program) return;

      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const info = gl.getProgramInfoLog(program);
        setError(`Program linking error: ${info}`);
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

    gl.useProgram(program);

    // Setup fullscreen quad
    const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    if (!program) return;

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
    const iChannelResolutionLocation = gl.getUniformLocation(
      program,
      "iChannelResolution",
    );
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
      const seconds =
        date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();

      // Update all uniforms
      gl.uniform3f(iResolutionLocation, canvas.width, canvas.height, 1.0);
      gl.uniform1f(iTimeLocation, time);
      gl.uniform1f(iTimeDeltaLocation, timeDelta);
      gl.uniform1f(iFrameRateLocation, frameRate);
      gl.uniform1i(iFrameLocation, frameCount);

      // Channel uniforms (all zeros for now since we don't support textures yet)
      gl.uniform1fv(iChannelTimeLocation, [0, 0, 0, 0]);
      gl.uniform3fv(
        iChannelResolutionLocation,
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      );

      gl.uniform4f(iMouseLocation, mouseX, mouseY, mouseClickX, mouseClickY);
      gl.uniform4f(iDateLocation, year, month, day, seconds);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      frameCount++;
      lastFrameTime = now;
      animationId = requestAnimationFrame(render);
    };

    render();
    setError(null);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("resize", resize);

      // Only delete shaders if they're not in the cache
      // Check if the shader is CURRENTLY cached, not just if it was loaded from cache
      const isCurrentlyCached = cacheKey && shaderCache.has(cacheKey);
      if (!isCurrentlyCached && program && vertexShader && fragmentShader) {
        gl.deleteProgram(program);
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
      }
    };
  }, [shaderCode, enableCache]);

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
