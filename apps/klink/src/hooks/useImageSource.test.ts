import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useImageSource } from "./useImageSource";

describe("useImageSource", () => {
  let urlCounter = 0;

  beforeEach(() => {
    urlCounter = 0;

    vi.spyOn(URL, "createObjectURL").mockImplementation(() => {
      return `blob:mock-url-${urlCounter++}`;
    });

    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("null/undefined handling", () => {
    it("returns null for null image", () => {
      const { result } = renderHook(() => useImageSource(null));
      expect(result.current).toBeNull();
    });

    it("returns null for undefined image", () => {
      const { result } = renderHook(() => useImageSource(undefined));
      expect(result.current).toBeNull();
    });
  });

  describe("browser Blob handling", () => {
    it("creates object URL for browser Blob", () => {
      const blob = new Blob(["test"], { type: "image/png" });
      const { result } = renderHook(() => useImageSource(blob));

      expect(URL.createObjectURL).toHaveBeenCalledWith(blob);
      expect(result.current).toBe("blob:mock-url-0");
    });

    it("handles Blob wrapped in object with type blob", () => {
      const blob = new Blob(["test"], { type: "image/png" });
      const wrappedBlob = {
        $type: "moe.karashiiro.klink.profile#blobImage",
        type: "blob" as const,
        value: blob,
      };

      const { result } = renderHook(() => useImageSource(wrappedBlob));

      expect(URL.createObjectURL).toHaveBeenCalledWith(blob);
      expect(result.current).toBe("blob:mock-url-0");
    });
  });

  describe("string URL handling", () => {
    it("returns string URL directly", () => {
      const url = "https://example.com/image.jpg";
      const { result } = renderHook(() => useImageSource(url));

      expect(result.current).toBe(url);
      expect(URL.createObjectURL).not.toHaveBeenCalled();
    });

    it("handles various URL formats", () => {
      const urls = [
        "https://example.com/image.png",
        "http://localhost:3000/avatar.jpg",
        "data:image/png;base64,iVBORw0KGgo=",
      ];

      urls.forEach((url) => {
        const { result } = renderHook(() => useImageSource(url));
        expect(result.current).toBe(url);
      });
    });
  });

  describe("URL image object handling", () => {
    it("extracts URL from urlImage object", () => {
      const urlImage = {
        $type: "moe.karashiiro.klink.profile#urlImage",
        type: "url" as const,
        value: "https://example.com/avatar.jpg",
      };

      const { result } = renderHook(() => useImageSource(urlImage));

      expect(result.current).toBe("https://example.com/avatar.jpg");
    });

    it("handles URL background type", () => {
      const urlBackground = {
        $type: "moe.karashiiro.klink.profile#urlBackground",
        type: "url" as const,
        value: "https://example.com/bg.jpg",
        objectFit: "cover",
      };

      const { result } = renderHook(() => useImageSource(urlBackground));

      expect(result.current).toBe("https://example.com/bg.jpg");
    });
  });

  describe("ATProto blob reference handling", () => {
    const pdsUrl = "https://bsky.social";
    const did = "did:plc:test123";

    it("constructs blob URL from ATProto blob reference", () => {
      const blobRef = {
        $type: "moe.karashiiro.klink.profile#blobImage",
        type: "blob" as const,
        value: {
          ref: { $link: "bafyreicid12345" },
          mimeType: "image/png",
          size: 1000,
        },
      };

      const { result } = renderHook(() => useImageSource(blobRef, pdsUrl, did));

      expect(result.current).toBe(
        "https://bsky.social/xrpc/com.atproto.sync.getBlob?did=did:plc:test123&cid=bafyreicid12345",
      );
    });

    it("handles legacy blob format", () => {
      const legacyBlob = {
        $type: "moe.karashiiro.klink.profile#blobImage",
        type: "blob" as const,
        value: {
          cid: "bafyreilegacy",
          mimeType: "image/jpeg",
        },
      };

      const { result } = renderHook(() =>
        useImageSource(legacyBlob, pdsUrl, did),
      );

      expect(result.current).toBe(
        "https://bsky.social/xrpc/com.atproto.sync.getBlob?did=did:plc:test123&cid=bafyreilegacy",
      );
    });

    it("returns null for blob reference when pdsUrl is missing", () => {
      const blobRef = {
        $type: "moe.karashiiro.klink.profile#blobImage",
        type: "blob" as const,
        value: {
          ref: { $link: "bafyreicid" },
          mimeType: "image/png",
          size: 100,
        },
      };

      const { result } = renderHook(() =>
        useImageSource(blobRef, undefined, did),
      );

      expect(result.current).toBeNull();
    });

    it("returns null for blob reference when did is missing", () => {
      const blobRef = {
        $type: "moe.karashiiro.klink.profile#blobImage",
        type: "blob" as const,
        value: {
          ref: { $link: "bafyreicid" },
          mimeType: "image/png",
          size: 100,
        },
      };

      const { result } = renderHook(() =>
        useImageSource(blobRef, pdsUrl, undefined),
      );

      expect(result.current).toBeNull();
    });
  });

  describe("priority handling", () => {
    it("prefers blob URL over resolved URL when both could apply", () => {
      // When a Blob is provided directly, blobUrl should take precedence
      const blob = new Blob(["test"], { type: "image/png" });

      const { result } = renderHook(() =>
        useImageSource(blob, "https://pds.com", "did:plc:test"),
      );

      // Should return blob URL, not try to construct ATProto URL
      expect(result.current).toBe("blob:mock-url-0");
    });
  });

  describe("rerender behavior", () => {
    it("updates when image changes", () => {
      const { result, rerender } = renderHook(
        ({ image }) => useImageSource(image),
        {
          initialProps: { image: "https://example.com/1.jpg" as string | null },
        },
      );

      expect(result.current).toBe("https://example.com/1.jpg");

      rerender({ image: "https://example.com/2.jpg" });

      expect(result.current).toBe("https://example.com/2.jpg");
    });

    it("updates when pdsUrl changes", () => {
      const blobRef = {
        $type: "moe.karashiiro.klink.profile#blobImage",
        type: "blob" as const,
        value: {
          ref: { $link: "bafyreicid" },
          mimeType: "image/png",
          size: 100,
        },
      };

      const { result, rerender } = renderHook(
        ({ pdsUrl }) => useImageSource(blobRef, pdsUrl, "did:plc:test"),
        { initialProps: { pdsUrl: "https://pds1.com" } },
      );

      expect(result.current).toContain("pds1.com");

      rerender({ pdsUrl: "https://pds2.com" });

      expect(result.current).toContain("pds2.com");
    });

    it("cleans up blob URL when image changes from Blob to URL", () => {
      const blob = new Blob(["test"], { type: "image/png" });

      const { result, rerender } = renderHook(
        ({ image }) => useImageSource(image),
        {
          initialProps: { image: blob as Blob | string },
        },
      );

      expect(result.current).toBe("blob:mock-url-0");

      rerender({ image: "https://example.com/image.jpg" });

      expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url-0");
      expect(result.current).toBe("https://example.com/image.jpg");
    });
  });

  describe("edge cases", () => {
    it("handles color background type gracefully", () => {
      // Color backgrounds shouldn't return an image URL
      // Using unknown type since color backgrounds are not valid image sources
      const colorBg = {
        $type: "moe.karashiiro.klink.profile#colorBackground",
        type: "color" as const,
        value: "#ff0000",
      } as unknown as Parameters<typeof useImageSource>[0];

      const { result } = renderHook(() => useImageSource(colorBg));

      // Should return null since color is not url or blob
      expect(result.current).toBeNull();
    });

    it("handles shader background type gracefully", () => {
      // Using unknown type since shader backgrounds are not valid image sources
      const shaderBg = {
        $type: "moe.karashiiro.klink.profile#shaderBackground",
        type: "shader" as const,
        value: {
          ref: { $link: "bafyrei..." },
          mimeType: "text/plain",
          size: 200,
        },
      } as unknown as Parameters<typeof useImageSource>[0];

      const { result } = renderHook(() => useImageSource(shaderBg));

      // Shader type is not handled as image source
      expect(result.current).toBeNull();
    });
  });
});
