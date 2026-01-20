import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../test/test-utils";
import { ExampleCarousel } from "./ExampleCarousel";

// Mock ProfileDisplay
vi.mock("./ProfileDisplay", () => ({
  ProfileDisplay: ({ handle }: { handle: string }) => (
    <div data-testid="profile-display" data-handle={handle} />
  ),
}));

// Mock BackgroundRenderer
vi.mock("./BackgroundRenderer", () => ({
  BackgroundRenderer: () => <div data-testid="background-renderer" />,
}));

// Mock getBackgroundStyle
vi.mock("../../utils/backgroundUtils", () => ({
  getBackgroundStyle: vi.fn(() => ({ backgroundColor: "#000" })),
}));

describe("ExampleCarousel", () => {
  describe("basic rendering", () => {
    it("renders the carousel container", () => {
      renderWithProviders(<ExampleCarousel />);

      expect(screen.getByTestId("profile-display")).toBeInTheDocument();
    });

    it("renders navigation dots", () => {
      renderWithProviders(<ExampleCarousel />);

      const dots = screen.getAllByRole("button", { name: "View example" });
      expect(dots.length).toBeGreaterThan(0);
    });

    it("renders BackgroundRenderer", () => {
      renderWithProviders(<ExampleCarousel />);

      expect(screen.getByTestId("background-renderer")).toBeInTheDocument();
    });

    it("displays first profile with example.com handle", () => {
      renderWithProviders(<ExampleCarousel />);

      expect(screen.getByTestId("profile-display")).toHaveAttribute(
        "data-handle",
        "example.com",
      );
    });

    it("renders correct number of demo profiles", () => {
      renderWithProviders(<ExampleCarousel />);

      const dots = screen.getAllByRole("button", { name: "View example" });
      expect(dots.length).toBe(3); // 3 demo profiles
    });
  });

  describe("dot navigation", () => {
    it("dots are clickable", async () => {
      const { user } = renderWithProviders(<ExampleCarousel />);

      const dots = screen.getAllByRole("button", { name: "View example" });

      // Should not throw when clicking a dot
      await user.click(dots[1]);

      // Dots should still be present
      expect(screen.getAllByRole("button", { name: "View example" })).toHaveLength(3);
    });
  });

  describe("accepts custom interval", () => {
    it("accepts autoRotateInterval prop", () => {
      // Should not throw
      renderWithProviders(<ExampleCarousel autoRotateInterval={2000} />);

      expect(screen.getByTestId("profile-display")).toBeInTheDocument();
    });

    it("uses default interval when not provided", () => {
      renderWithProviders(<ExampleCarousel />);

      expect(screen.getByTestId("profile-display")).toBeInTheDocument();
    });
  });
});
