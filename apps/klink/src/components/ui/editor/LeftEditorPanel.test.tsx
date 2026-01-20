import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { createStore } from "jotai";
import { renderWithProviders } from "../../../test/test-utils";
import { LeftEditorPanel } from "./LeftEditorPanel";
import { editorPanelsOpenAtom, mobileActivePanelAtom } from "../../../atoms/profile";

// Mock all child components
vi.mock("./ProfileImageInput", () => ({
  ProfileImageInput: () => <div data-testid="profile-image-input">Profile Image</div>,
}));

vi.mock("./NameInput", () => ({
  NameInput: () => <div data-testid="name-input">Name</div>,
}));

vi.mock("./LocationInput", () => ({
  LocationInput: () => <div data-testid="location-input">Location</div>,
}));

vi.mock("./BioInput", () => ({
  BioInput: () => <div data-testid="bio-input">Bio</div>,
}));

vi.mock("./ProfileBackgroundSelector", () => ({
  ProfileBackgroundSelector: () => (
    <div data-testid="background-selector">Background</div>
  ),
}));

vi.mock("./ThemeColorInput", () => ({
  ThemeColorInput: () => <div data-testid="theme-color-input">Theme</div>,
}));

vi.mock("./FontInput", () => ({
  FontInput: () => <div data-testid="font-input">Font</div>,
}));

vi.mock("./LogoModeInput", () => ({
  LogoModeInput: () => <div data-testid="logo-mode-input">Logo Mode</div>,
}));

describe("LeftEditorPanel", () => {
  describe("basic rendering", () => {
    it("renders all form inputs", () => {
      const store = createStore();
      store.set(editorPanelsOpenAtom, true);
      store.set(mobileActivePanelAtom, "left");

      renderWithProviders(<LeftEditorPanel />, { store });

      expect(screen.getByTestId("profile-image-input")).toBeInTheDocument();
      expect(screen.getByTestId("name-input")).toBeInTheDocument();
      expect(screen.getByTestId("location-input")).toBeInTheDocument();
      expect(screen.getByTestId("bio-input")).toBeInTheDocument();
      expect(screen.getByTestId("background-selector")).toBeInTheDocument();
      expect(screen.getByTestId("theme-color-input")).toBeInTheDocument();
      expect(screen.getByTestId("font-input")).toBeInTheDocument();
      expect(screen.getByTestId("logo-mode-input")).toBeInTheDocument();
    });

    it("renders when panel is closed", () => {
      const store = createStore();
      store.set(editorPanelsOpenAtom, false);

      renderWithProviders(<LeftEditorPanel />, { store });

      // Component should still render (just positioned off-screen)
      expect(screen.getByTestId("profile-image-input")).toBeInTheDocument();
    });

    it("renders when mobile panel is right", () => {
      const store = createStore();
      store.set(editorPanelsOpenAtom, true);
      store.set(mobileActivePanelAtom, "right");

      renderWithProviders(<LeftEditorPanel />, { store });

      // Component should still render
      expect(screen.getByTestId("name-input")).toBeInTheDocument();
    });
  });
});
