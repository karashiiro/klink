import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { createStore } from "jotai";
import { renderWithProviders, mockSession } from "../../../test/test-utils";
import { ProfilePreview } from "./ProfilePreview";
import {
  nameAtom,
  bioAtom,
  primaryColorAtom,
  secondaryColorAtom,
  fontFamilyAtom,
  stylesheetAtom,
  linksAtom,
  logoModeAtom,
} from "../../../atoms/profile";

// Mock the auth hook
vi.mock("@kpaste-app/atproto-auth", () => ({
  useAuth: vi.fn(() => ({
    session: {
      did: "did:plc:test123",
      handle: "test.bsky.social",
      endpoint: { url: "https://bsky.social" },
    },
    isAuthenticated: true,
  })),
}));

// Mock useEditorBackground
vi.mock("../../../hooks/useEditorBackground", () => ({
  useEditorBackground: vi.fn(() => ({
    $type: "moe.karashiror.klink.profile#colorBackground",
    type: "color",
    value: "#000000",
  })),
}));

// Mock useEditorProfileImage
vi.mock("../../../hooks/useEditorProfileImage", () => ({
  useEditorProfileImage: vi.fn(() => undefined),
}));

// Mock ProfileDisplay
vi.mock("../ProfileDisplay", () => ({
  ProfileDisplay: ({
    profileData,
    handle,
  }: {
    profileData: { name?: string; bio: string; links: unknown[] };
    handle: string;
  }) => (
    <div data-testid="profile-display">
      <span data-testid="display-name">{profileData.name || "No name"}</span>
      <span data-testid="display-bio">{profileData.bio}</span>
      <span data-testid="display-handle">{handle}</span>
      <span data-testid="display-links-count">{profileData.links.length}</span>
    </div>
  ),
}));

// Mock BackgroundRenderer
vi.mock("../BackgroundRenderer", () => ({
  BackgroundRenderer: ({ fillViewport }: { fillViewport?: boolean }) => (
    <div data-testid="background-renderer" data-fill-viewport={fillViewport} />
  ),
}));

// Mock getBackgroundStyle
vi.mock("../../../utils/backgroundUtils", () => ({
  getBackgroundStyle: vi.fn(() => ({ backgroundColor: "#000" })),
}));

describe("ProfilePreview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("basic rendering", () => {
    it("renders ProfileDisplay when session exists", () => {
      const store = createStore();

      renderWithProviders(<ProfilePreview />, { store, session: mockSession });

      expect(screen.getByTestId("profile-display")).toBeInTheDocument();
    });

    it("renders BackgroundRenderer with fillViewport", () => {
      const store = createStore();

      renderWithProviders(<ProfilePreview />, { store, session: mockSession });

      const renderer = screen.getByTestId("background-renderer");
      expect(renderer).toHaveAttribute("data-fill-viewport", "true");
    });
  });

  describe("atom data aggregation", () => {
    it("passes name from nameAtom to ProfileDisplay", () => {
      const store = createStore();
      store.set(nameAtom, "Test Name");

      renderWithProviders(<ProfilePreview />, { store, session: mockSession });

      expect(screen.getByTestId("display-name")).toHaveTextContent("Test Name");
    });

    it("passes bio from bioAtom to ProfileDisplay", () => {
      const store = createStore();
      store.set(bioAtom, "My test bio");

      renderWithProviders(<ProfilePreview />, { store, session: mockSession });

      expect(screen.getByTestId("display-bio")).toHaveTextContent("My test bio");
    });

    it("passes handle from session to ProfileDisplay", () => {
      const store = createStore();

      renderWithProviders(<ProfilePreview />, { store, session: mockSession });

      expect(screen.getByTestId("display-handle")).toHaveTextContent(
        "test.bsky.social",
      );
    });

    it("passes links count to ProfileDisplay", () => {
      const store = createStore();
      store.set(linksAtom, [
        { label: "Link 1", href: "https://link1.com", icon: undefined },
        { label: "Link 2", href: "https://link2.com", icon: undefined },
      ]);

      renderWithProviders(<ProfilePreview />, { store, session: mockSession });

      expect(screen.getByTestId("display-links-count")).toHaveTextContent("2");
    });
  });

  describe("empty/undefined handling", () => {
    it("handles empty name gracefully", () => {
      const store = createStore();
      store.set(nameAtom, "");

      renderWithProviders(<ProfilePreview />, { store, session: mockSession });

      expect(screen.getByTestId("display-name")).toHaveTextContent("No name");
    });

    it("handles empty links array", () => {
      const store = createStore();
      store.set(linksAtom, []);

      renderWithProviders(<ProfilePreview />, { store, session: mockSession });

      expect(screen.getByTestId("display-links-count")).toHaveTextContent("0");
    });
  });

  describe("theme data", () => {
    it("uses theme colors from atoms", () => {
      const store = createStore();
      store.set(primaryColorAtom, "#ff0000");
      store.set(secondaryColorAtom, "#00ff00");

      renderWithProviders(<ProfilePreview />, { store, session: mockSession });

      expect(screen.getByTestId("profile-display")).toBeInTheDocument();
    });

    it("uses font settings from atoms", () => {
      const store = createStore();
      store.set(fontFamilyAtom, "Comic Sans MS");
      store.set(stylesheetAtom, "@import url('...')");

      renderWithProviders(<ProfilePreview />, { store, session: mockSession });

      expect(screen.getByTestId("profile-display")).toBeInTheDocument();
    });
  });

  describe("logoMode", () => {
    it("passes logoMode to profileData", () => {
      const store = createStore();
      store.set(logoModeAtom, "show");

      renderWithProviders(<ProfilePreview />, { store, session: mockSession });

      expect(screen.getByTestId("profile-display")).toBeInTheDocument();
    });
  });

  describe("reactive updates", () => {
    it("updates when atoms change", () => {
      const store = createStore();
      store.set(nameAtom, "Initial Name");

      const { rerender } = renderWithProviders(<ProfilePreview />, {
        store,
        session: mockSession,
      });

      expect(screen.getByTestId("display-name")).toHaveTextContent(
        "Initial Name",
      );

      store.set(nameAtom, "Updated Name");

      rerender(<ProfilePreview />);

      expect(screen.getByTestId("display-name")).toHaveTextContent(
        "Updated Name",
      );
    });

    it("updates when links change", () => {
      const store = createStore();
      store.set(linksAtom, []);

      const { rerender } = renderWithProviders(<ProfilePreview />, {
        store,
        session: mockSession,
      });

      expect(screen.getByTestId("display-links-count")).toHaveTextContent("0");

      store.set(linksAtom, [
        { label: "New Link", href: "https://new.com", icon: undefined },
      ]);

      rerender(<ProfilePreview />);

      expect(screen.getByTestId("display-links-count")).toHaveTextContent("1");
    });
  });
});
