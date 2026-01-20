import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders, mockSession } from "../../test/test-utils";
import { BackgroundRenderer } from "./BackgroundRenderer";
import type { Background } from "../../utils/backgroundUtils";

// Mock ShaderCanvas since it has WebGL dependencies
vi.mock("./shaderCanvas", () => ({
  ShaderCanvas: ({
    shaderCode,
    fillViewport,
    enableCache,
  }: {
    shaderCode: string;
    fillViewport?: boolean;
    enableCache?: boolean;
  }) => (
    <div
      data-testid="shader-canvas"
      data-shader-code={shaderCode}
      data-fill-viewport={fillViewport}
      data-enable-cache={enableCache}
    />
  ),
}));

describe("BackgroundRenderer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset fetch mock
    globalThis.fetch = vi.fn();
  });

  describe("color background", () => {
    it("does not render ShaderCanvas for color backgrounds", () => {
      const background: Background = {
        $type: "moe.karashiror.klink.profile#colorBackground",
        type: "color",
        value: "#ff0000",
      };

      renderWithProviders(<BackgroundRenderer background={background} />);

      expect(screen.queryByTestId("shader-canvas")).not.toBeInTheDocument();
    });
  });

  describe("URL background", () => {
    it("does not render ShaderCanvas for URL backgrounds", () => {
      const background: Background = {
        $type: "moe.karashiror.klink.profile#urlBackground",
        type: "url",
        value: "https://example.com/bg.jpg" as `${string}:${string}`,
      };

      renderWithProviders(<BackgroundRenderer background={background} />);

      expect(screen.queryByTestId("shader-canvas")).not.toBeInTheDocument();
    });
  });

  describe("shader background with blob reference", () => {
    it("fetches shader code from PDS when blob reference provided", async () => {
      const shaderCode = "void main() { gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0); }";

      globalThis.fetch = vi.fn().mockResolvedValue({
        text: () => Promise.resolve(shaderCode),
        ok: true,
      });

      const background: Background = {
        $type: "moe.karashiror.klink.profile#shaderBackground",
        type: "shader",
        value: {
          $type: "blob",
          ref: { $link: "bafytest123" },
          mimeType: "text/plain",
          size: 100,
        },
      };

      renderWithProviders(
        <BackgroundRenderer
          background={background}
          pdsUrl="https://bsky.social"
          did="did:plc:test123"
        />,
      );

      await waitFor(() => {
        expect(screen.getByTestId("shader-canvas")).toBeInTheDocument();
      });

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining("bsky.social"),
      );
    });

    it("uses session context when pdsUrl/did not provided as props", async () => {
      const shaderCode = "void main() {}";

      globalThis.fetch = vi.fn().mockResolvedValue({
        text: () => Promise.resolve(shaderCode),
        ok: true,
      });

      const background: Background = {
        $type: "moe.karashiror.klink.profile#shaderBackground",
        type: "shader",
        value: {
          $type: "blob",
          ref: { $link: "bafytest456" },
          mimeType: "text/plain",
          size: 50,
        },
      };

      renderWithProviders(<BackgroundRenderer background={background} />, {
        session: mockSession,
      });

      await waitFor(() => {
        expect(globalThis.fetch).toHaveBeenCalled();
      });
    });

    it("does not render ShaderCanvas when no pdsUrl/did available for blob reference", () => {
      const background: Background = {
        $type: "moe.karashiror.klink.profile#shaderBackground",
        type: "shader",
        value: {
          $type: "blob",
          ref: { $link: "bafytest789" },
          mimeType: "text/plain",
          size: 50,
        },
      };

      renderWithProviders(<BackgroundRenderer background={background} />, {
        session: null,
      });

      // Should not render ShaderCanvas without credentials
      expect(screen.queryByTestId("shader-canvas")).not.toBeInTheDocument();
    });
  });

  describe("error handling", () => {
    it("handles fetch error gracefully", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      globalThis.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

      const background: Background = {
        $type: "moe.karashiror.klink.profile#shaderBackground",
        type: "shader",
        value: {
          $type: "blob",
          ref: { $link: "bafyfail" },
          mimeType: "text/plain",
          size: 50,
        },
      };

      renderWithProviders(
        <BackgroundRenderer
          background={background}
          pdsUrl="https://bsky.social"
          did="did:plc:test"
        />,
      );

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Failed to fetch shader:",
          expect.any(Error),
        );
      });

      consoleSpy.mockRestore();
    });
  });
});
