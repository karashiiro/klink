import { vi } from "vitest";
import "@testing-library/jest-dom";

// Mock URL.createObjectURL and URL.revokeObjectURL for blob handling
const mockObjectURLs = new Map<string, Blob>();
let urlCounter = 0;

globalThis.URL.createObjectURL = vi.fn((blob: Blob) => {
  const url = `blob:test-url-${urlCounter++}`;
  mockObjectURLs.set(url, blob);
  return url;
});

globalThis.URL.revokeObjectURL = vi.fn((url: string) => {
  mockObjectURLs.delete(url);
});

// Helper to access mocked blob URLs in tests
export { mockObjectURLs };

// Reset mocks between tests
beforeEach(() => {
  mockObjectURLs.clear();
  urlCounter = 0;
});

// Mock WebGL context for ShaderCanvas tests
const mockWebGLContext = {
  createShader: vi.fn(() => ({})),
  shaderSource: vi.fn(),
  compileShader: vi.fn(),
  getShaderParameter: vi.fn(() => true),
  getShaderInfoLog: vi.fn(() => ""),
  createProgram: vi.fn(() => ({})),
  attachShader: vi.fn(),
  linkProgram: vi.fn(),
  getProgramParameter: vi.fn(() => true),
  getProgramInfoLog: vi.fn(() => ""),
  useProgram: vi.fn(),
  getUniformLocation: vi.fn(() => ({})),
  uniform1f: vi.fn(),
  uniform2f: vi.fn(),
  uniform3f: vi.fn(),
  uniform4f: vi.fn(),
  clearColor: vi.fn(),
  clear: vi.fn(),
  drawArrays: vi.fn(),
  viewport: vi.fn(),
  enable: vi.fn(),
  disable: vi.fn(),
  createBuffer: vi.fn(() => ({})),
  bindBuffer: vi.fn(),
  bufferData: vi.fn(),
  getAttribLocation: vi.fn(() => 0),
  enableVertexAttribArray: vi.fn(),
  vertexAttribPointer: vi.fn(),
  deleteShader: vi.fn(),
  deleteProgram: vi.fn(),
  deleteBuffer: vi.fn(),
  VERTEX_SHADER: 35633,
  FRAGMENT_SHADER: 35632,
  COMPILE_STATUS: 35713,
  LINK_STATUS: 35714,
  ARRAY_BUFFER: 34962,
  STATIC_DRAW: 35044,
  FLOAT: 5126,
  TRIANGLES: 4,
  COLOR_BUFFER_BIT: 16384,
};

HTMLCanvasElement.prototype.getContext = vi.fn(
  (type: string): RenderingContext | null => {
    if (type === "webgl" || type === "webgl2") {
      return mockWebGLContext as unknown as WebGLRenderingContext;
    }
    return null;
  },
);

// Mock FileReader for shader blob reading
class MockFileReader {
  onload: ((e: ProgressEvent<FileReader>) => void) | null = null;
  onerror: ((e: ProgressEvent<FileReader>) => void) | null = null;
  result: string | ArrayBuffer | null = null;

  readAsText(blob: Blob) {
    blob.text().then((text) => {
      this.result = text;
      this.onload?.({ target: { result: text } } as ProgressEvent<FileReader>);
    });
  }

  readAsArrayBuffer(blob: Blob) {
    blob.arrayBuffer().then((buffer) => {
      this.result = buffer;
      this.onload?.({
        target: { result: buffer },
      } as ProgressEvent<FileReader>);
    });
  }
}

globalThis.FileReader = MockFileReader as unknown as typeof FileReader;

// Mock window.open for link clicks
beforeEach(() => {
  vi.spyOn(window, "open").mockImplementation(() => null);
});

afterEach(() => {
  vi.restoreAllMocks();
});
