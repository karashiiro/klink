import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders, mockSession } from "../../test/test-utils";
import { AtProtoImage } from "./AtProtoImage";

// Mock useImageSource hook
const mockUseImageSource = vi.fn();
vi.mock("../../hooks/useImageSource", () => ({
  useImageSource: (...args: unknown[]) => mockUseImageSource(...args),
}));

describe("AtProtoImage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseImageSource.mockReturnValue(null);
  });

  describe("when image URL is resolved", () => {
    it("renders without throwing when image source is provided", () => {
      mockUseImageSource.mockReturnValue("https://example.com/image.jpg");

      // Should render without throwing
      expect(() =>
        renderWithProviders(
          <AtProtoImage image={undefined} width={100} height={100} />,
          { session: mockSession },
        ),
      ).not.toThrow();
    });
  });

  describe("when no image URL is resolved", () => {
    it("does not render image when useImageSource returns null", () => {
      mockUseImageSource.mockReturnValue(null);

      renderWithProviders(
        <AtProtoImage image={undefined} width={100} height={100} />,
        { session: mockSession },
      );

      expect(screen.queryByRole("img")).not.toBeInTheDocument();
    });
  });

  describe("hook integration", () => {
    it("passes URL image to useImageSource", () => {
      const urlImage = {
        $type: "moe.karashiror.klink.profile#urlImage" as const,
        type: "url" as const,
        value: "https://example.com/avatar.jpg" as `${string}:${string}`,
      };

      renderWithProviders(
        <AtProtoImage image={urlImage} width={100} height={100} />,
        { session: mockSession },
      );

      expect(mockUseImageSource).toHaveBeenCalledWith(
        urlImage,
        mockSession.pdsUrl,
        mockSession.did,
      );
    });

    it("passes blob image to useImageSource", () => {
      const blobImage = {
        $type: "moe.karashiror.klink.profile#blobImage" as const,
        type: "blob" as const,
        ref: { $link: "bafytest123" },
        mimeType: "image/png",
        size: 1234,
      };

      renderWithProviders(
        <AtProtoImage image={blobImage} width={100} height={100} />,
        { session: mockSession },
      );

      expect(mockUseImageSource).toHaveBeenCalledWith(
        blobImage,
        mockSession.pdsUrl,
        mockSession.did,
      );
    });

    it("passes null image to useImageSource", () => {
      renderWithProviders(
        <AtProtoImage image={null} width={100} height={100} />,
        { session: mockSession },
      );

      expect(mockUseImageSource).toHaveBeenCalledWith(
        null,
        mockSession.pdsUrl,
        mockSession.did,
      );
    });

    it("passes undefined image to useImageSource", () => {
      renderWithProviders(
        <AtProtoImage image={undefined} width={100} height={100} />,
        { session: mockSession },
      );

      expect(mockUseImageSource).toHaveBeenCalledWith(
        undefined,
        mockSession.pdsUrl,
        mockSession.did,
      );
    });
  });

  describe("session context usage", () => {
    it("uses pdsUrl and did from session context", () => {
      const customSession = {
        pdsUrl: "https://custom.pds.com",
        did: "did:plc:custom",
        endpoint: "https://custom.pds.com",
        handle: "custom.handle",
      };

      renderWithProviders(
        <AtProtoImage image={undefined} width={100} height={100} />,
        { session: customSession },
      );

      expect(mockUseImageSource).toHaveBeenCalledWith(
        undefined,
        customSession.pdsUrl,
        customSession.did,
      );
    });

    it("handles missing session gracefully", () => {
      renderWithProviders(
        <AtProtoImage image={undefined} width={100} height={100} />,
        { session: null },
      );

      expect(mockUseImageSource).toHaveBeenCalledWith(
        undefined,
        undefined,
        undefined,
      );
    });
  });
});
