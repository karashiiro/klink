import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useBlobUrl } from "./useBlobUrl";

describe("useBlobUrl", () => {
  const mockUrls: string[] = [];
  let urlCounter = 0;

  beforeEach(() => {
    urlCounter = 0;
    mockUrls.length = 0;

    vi.spyOn(URL, "createObjectURL").mockImplementation(() => {
      const url = `blob:mock-url-${urlCounter++}`;
      mockUrls.push(url);
      return url;
    });

    vi.spyOn(URL, "revokeObjectURL").mockImplementation((url) => {
      const idx = mockUrls.indexOf(url);
      if (idx > -1) mockUrls.splice(idx, 1);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns null when blob is null", () => {
    const { result } = renderHook(() => useBlobUrl(null));
    expect(result.current).toBeNull();
  });

  it("returns null when blob is undefined", () => {
    const { result } = renderHook(() => useBlobUrl(undefined));
    expect(result.current).toBeNull();
  });

  it("creates object URL for blob", () => {
    const blob = new Blob(["test content"], { type: "text/plain" });
    const { result } = renderHook(() => useBlobUrl(blob));

    expect(URL.createObjectURL).toHaveBeenCalledWith(blob);
    expect(result.current).toBe("blob:mock-url-0");
  });

  it("revokes URL on unmount", () => {
    const blob = new Blob(["test"], { type: "text/plain" });
    const { unmount } = renderHook(() => useBlobUrl(blob));

    expect(mockUrls).toContain("blob:mock-url-0");

    unmount();

    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url-0");
    expect(mockUrls).not.toContain("blob:mock-url-0");
  });

  it("revokes old URL and creates new when blob changes", () => {
    const blob1 = new Blob(["test1"], { type: "text/plain" });
    const blob2 = new Blob(["test2"], { type: "text/plain" });

    const { result, rerender } = renderHook(({ blob }) => useBlobUrl(blob), {
      initialProps: { blob: blob1 as Blob | null },
    });

    expect(result.current).toBe("blob:mock-url-0");
    expect(mockUrls).toContain("blob:mock-url-0");

    rerender({ blob: blob2 });

    // Old URL should be revoked
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url-0");
    // New URL should be created
    expect(result.current).toBe("blob:mock-url-1");
  });

  it("cleans up when blob becomes null", () => {
    const blob = new Blob(["test"], { type: "image/png" });

    const { result, rerender } = renderHook(({ blob }) => useBlobUrl(blob), {
      initialProps: { blob: blob as Blob | null },
    });

    expect(result.current).toBe("blob:mock-url-0");

    rerender({ blob: null });

    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url-0");
    expect(result.current).toBeNull();
  });

  it("handles rapid blob changes", () => {
    const blob1 = new Blob(["1"], { type: "text/plain" });
    const blob2 = new Blob(["2"], { type: "text/plain" });
    const blob3 = new Blob(["3"], { type: "text/plain" });

    const { result, rerender } = renderHook(({ blob }) => useBlobUrl(blob), {
      initialProps: { blob: blob1 as Blob | null },
    });

    expect(result.current).toBe("blob:mock-url-0");

    rerender({ blob: blob2 });
    expect(result.current).toBe("blob:mock-url-1");

    rerender({ blob: blob3 });
    expect(result.current).toBe("blob:mock-url-2");

    // Should have revoked the first two URLs
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url-0");
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url-1");
  });

  it("does not create URL for same blob reference", () => {
    const blob = new Blob(["test"], { type: "text/plain" });

    const { result, rerender } = renderHook(({ blob }) => useBlobUrl(blob), {
      initialProps: { blob },
    });

    expect(result.current).toBe("blob:mock-url-0");
    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);

    // Rerender with same blob reference
    rerender({ blob });

    // Should not create a new URL
    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
    expect(result.current).toBe("blob:mock-url-0");
  });

  it("works with different blob types", () => {
    const imageBlob = new Blob(["fake image data"], { type: "image/png" });
    const { result: imageResult } = renderHook(() => useBlobUrl(imageBlob));
    expect(imageResult.current).toBe("blob:mock-url-0");

    const jsonBlob = new Blob(['{"key": "value"}'], {
      type: "application/json",
    });
    const { result: jsonResult } = renderHook(() => useBlobUrl(jsonBlob));
    expect(jsonResult.current).toBe("blob:mock-url-1");
  });
});
