/**
 * Global shader cache to avoid recompiling the same shaders.
 * Key format: "contextId:shaderHash"
 */
export interface CachedShader {
  vertexShader: WebGLShader;
  fragmentShader: WebGLShader;
  program: WebGLProgram;
  gl: WebGLRenderingContext;
}

export const shaderCache = new Map<string, CachedShader>();

let contextIdCounter = 0;
const contextIds = new WeakMap<WebGLRenderingContext, number>();

/**
 * Gets or assigns a unique ID for a WebGL context.
 */
export function getContextId(gl: WebGLRenderingContext): number {
  if (!contextIds.has(gl)) {
    contextIds.set(gl, contextIdCounter++);
  }
  return contextIds.get(gl)!;
}

/**
 * Simple hash function for shader code.
 */
export function hashCode(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(36);
}
