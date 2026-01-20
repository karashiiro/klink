import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getBackgroundStyle } from "./backgroundUtils";

describe("backgroundUtils", () => {
  describe("getBackgroundStyle", () => {
    const pdsUrl = "https://bsky.social";
    const did = "did:plc:test123";

    beforeEach(() => {
      vi.spyOn(URL, "createObjectURL").mockImplementation(
        () => "blob:mock-url-123",
      );
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    describe("color backgrounds", () => {
      it("returns backgroundColor for color type", () => {
        const background = {
          $type: "moe.karashiiro.klink.profile#colorBackground" as const,
          type: "color" as const,
          value: "#ff5500",
        };

        const result = getBackgroundStyle(background, pdsUrl, did);

        expect(result).toEqual({ backgroundColor: "#ff5500" });
      });

      it("handles various color formats", () => {
        const colors = ["#000000", "#ffffff", "#123abc", "#ABC123"];

        colors.forEach((color) => {
          const background = {
            $type: "moe.karashiiro.klink.profile#colorBackground" as const,
            type: "color" as const,
            value: color,
          };

          const result = getBackgroundStyle(background, pdsUrl, did);
          expect(result).toEqual({ backgroundColor: color });
        });
      });
    });

    describe("shader backgrounds", () => {
      it("returns position relative for shader type", () => {
        const background = {
          $type: "moe.karashiiro.klink.profile#shaderBackground" as const,
          type: "shader" as const,
          value: {
            ref: { $link: "bafyrei..." },
            mimeType: "text/plain",
            size: 100,
          },
        };

        const result = getBackgroundStyle(background, pdsUrl, did);

        expect(result).toEqual({ position: "relative" });
      });
    });

    describe("URL backgrounds", () => {
      it("returns backgroundImage for url type", () => {
        const background = {
          $type: "moe.karashiiro.klink.profile#urlBackground" as const,
          type: "url" as const,
          value: "https://example.com/image.jpg",
          objectFit: "cover",
        };

        const result = getBackgroundStyle(background, pdsUrl, did);

        expect(result).toEqual({
          backgroundImage: "url(https://example.com/image.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        });
      });

      it("respects objectFit contain", () => {
        const background = {
          $type: "moe.karashiiro.klink.profile#urlBackground" as const,
          type: "url" as const,
          value: "https://example.com/image.jpg",
          objectFit: "contain",
        };

        const result = getBackgroundStyle(background, pdsUrl, did);

        expect(result.backgroundSize).toBe("contain");
      });

      it("defaults objectFit to cover when not specified", () => {
        const background = {
          $type: "moe.karashiiro.klink.profile#urlBackground" as const,
          type: "url" as const,
          value: "https://example.com/image.jpg",
          objectFit: "",
        };

        const result = getBackgroundStyle(background, pdsUrl, did);

        expect(result.backgroundSize).toBe("cover");
      });
    });

    describe("blob backgrounds", () => {
      it("constructs ATProto blob URL for blob references", () => {
        const background = {
          $type: "moe.karashiiro.klink.profile#blobBackground" as const,
          type: "blob" as const,
          value: {
            ref: { $link: "bafyreicid12345" },
            mimeType: "image/png",
            size: 5000,
          },
          objectFit: "cover",
        };

        const result = getBackgroundStyle(background, pdsUrl, did);

        expect(result.backgroundImage).toContain("com.atproto.sync.getBlob");
        expect(result.backgroundImage).toContain("bafyreicid12345");
        expect(result.backgroundImage).toContain(did);
        expect(result.backgroundSize).toBe("cover");
        expect(result.backgroundPosition).toBe("center");
      });

      it("creates object URL for browser Blob instances", () => {
        const browserBlob = new Blob(["test"], { type: "image/png" });
        const background = {
          $type: "moe.karashiiro.klink.profile#blobBackground" as const,
          type: "blob" as const,
          value: browserBlob,
          objectFit: "cover",
        };

        const result = getBackgroundStyle(background, pdsUrl, did);

        expect(URL.createObjectURL).toHaveBeenCalledWith(browserBlob);
        expect(result.backgroundImage).toBe("url(blob:mock-url-123)");
      });

      it("handles legacy blob format", () => {
        const background = {
          $type: "moe.karashiiro.klink.profile#blobBackground" as const,
          type: "blob" as const,
          value: {
            cid: "bafyreilegacy",
            mimeType: "image/jpeg",
          },
          objectFit: "contain",
        };

        const result = getBackgroundStyle(background, pdsUrl, did);

        expect(result.backgroundImage).toContain("bafyreilegacy");
        expect(result.backgroundSize).toBe("contain");
      });

      it("respects various objectFit values", () => {
        const objectFitValues = [
          "cover",
          "contain",
          "fill",
          "none",
          "scale-down",
        ];

        objectFitValues.forEach((fit) => {
          const background = {
            $type: "moe.karashiiro.klink.profile#blobBackground" as const,
            type: "blob" as const,
            value: {
              ref: { $link: "bafyreicid" },
              mimeType: "image/png",
              size: 100,
            },
            objectFit: fit,
          };

          const result = getBackgroundStyle(background, pdsUrl, did);
          expect(result.backgroundSize).toBe(fit);
        });
      });
    });

    describe("edge cases", () => {
      it("always includes backgroundPosition center for image backgrounds", () => {
        const urlBg = {
          $type: "moe.karashiiro.klink.profile#urlBackground" as const,
          type: "url" as const,
          value: "https://example.com/img.jpg",
          objectFit: "cover",
        };

        const blobBg = {
          $type: "moe.karashiiro.klink.profile#blobBackground" as const,
          type: "blob" as const,
          value: { ref: { $link: "cid" }, mimeType: "image/png", size: 1 },
          objectFit: "cover",
        };

        expect(getBackgroundStyle(urlBg, pdsUrl, did).backgroundPosition).toBe(
          "center",
        );
        expect(getBackgroundStyle(blobBg, pdsUrl, did).backgroundPosition).toBe(
          "center",
        );
      });

      it("works with different PDS URLs", () => {
        const background = {
          $type: "moe.karashiiro.klink.profile#blobBackground" as const,
          type: "blob" as const,
          value: { ref: { $link: "bafyrei" }, mimeType: "image/png", size: 1 },
          objectFit: "cover",
        };

        const customPds = "https://my-pds.example.com";
        const result = getBackgroundStyle(background, customPds, did);

        expect(result.backgroundImage).toContain("my-pds.example.com");
      });
    });
  });
});
