import { vi } from "vitest";

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
