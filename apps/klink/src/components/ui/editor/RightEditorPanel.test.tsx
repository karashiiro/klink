import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { createStore } from "jotai";
import { renderWithProviders } from "../../../test/test-utils";
import { RightEditorPanel } from "./RightEditorPanel";
import {
  editorPanelsOpenAtom,
  mobileActivePanelAtom,
  currentProfileAtom,
} from "../../../atoms/profile";

// Mock all child components
vi.mock("./ProfileLinkEditor", () => ({
  ProfileLinkEditor: () => <div data-testid="link-editor">Links</div>,
}));

vi.mock("./CreateProfileButton", () => ({
  CreateProfileButton: ({ onSuccess }: { onSuccess: () => void }) => (
    <button data-testid="create-button" onClick={onSuccess}>
      Create Profile
    </button>
  ),
}));

vi.mock("./UpdateProfileButtons", () => ({
  UpdateProfileButtons: ({ onSuccess }: { onSuccess: () => void }) => (
    <button data-testid="update-button" onClick={onSuccess}>
      Update Profile
    </button>
  ),
}));

vi.mock("./DeleteProfileButton", () => ({
  DeleteProfileButton: ({ onSuccess }: { onSuccess: () => void }) => (
    <button data-testid="delete-button" onClick={onSuccess}>
      Delete Profile
    </button>
  ),
}));

vi.mock("./LogoutButton", () => ({
  LogoutButton: () => <button data-testid="logout-button">Logout</button>,
}));

describe("RightEditorPanel", () => {
  const onSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("basic rendering", () => {
    it("renders link editor", () => {
      const store = createStore();
      store.set(editorPanelsOpenAtom, true);
      store.set(mobileActivePanelAtom, "right");

      renderWithProviders(<RightEditorPanel onSuccess={onSuccess} />, { store });

      expect(screen.getByTestId("link-editor")).toBeInTheDocument();
    });

    it("renders logout button", () => {
      const store = createStore();
      store.set(editorPanelsOpenAtom, true);
      store.set(mobileActivePanelAtom, "right");

      renderWithProviders(<RightEditorPanel onSuccess={onSuccess} />, { store });

      expect(screen.getByTestId("logout-button")).toBeInTheDocument();
    });
  });

  describe("conditional rendering based on profile", () => {
    it("shows create button when no profile exists", () => {
      const store = createStore();
      store.set(editorPanelsOpenAtom, true);
      store.set(mobileActivePanelAtom, "right");
      store.set(currentProfileAtom, null);

      renderWithProviders(<RightEditorPanel onSuccess={onSuccess} />, { store });

      expect(screen.getByTestId("create-button")).toBeInTheDocument();
      expect(screen.queryByTestId("update-button")).not.toBeInTheDocument();
      expect(screen.queryByTestId("delete-button")).not.toBeInTheDocument();
    });

    it("shows update and delete buttons when profile exists", () => {
      const store = createStore();
      store.set(editorPanelsOpenAtom, true);
      store.set(mobileActivePanelAtom, "right");
      store.set(currentProfileAtom, {
        uri: "at://did:plc:test/moe.karashiror.klink.profile/self",
        cid: "abc123",
        value: {
          $type: "moe.karashiror.klink.profile",
          bio: "Test",
          background: { type: "color", value: "#000" },
          links: [],
        },
      });

      renderWithProviders(<RightEditorPanel onSuccess={onSuccess} />, { store });

      expect(screen.queryByTestId("create-button")).not.toBeInTheDocument();
      expect(screen.getByTestId("update-button")).toBeInTheDocument();
      expect(screen.getByTestId("delete-button")).toBeInTheDocument();
    });
  });

  describe("callback passing", () => {
    it("passes onSuccess to create button", async () => {
      const store = createStore();
      store.set(editorPanelsOpenAtom, true);
      store.set(mobileActivePanelAtom, "right");
      store.set(currentProfileAtom, null);

      const { user } = renderWithProviders(
        <RightEditorPanel onSuccess={onSuccess} />,
        { store },
      );

      await user.click(screen.getByTestId("create-button"));

      expect(onSuccess).toHaveBeenCalled();
    });

    it("passes onSuccess to update button", async () => {
      const store = createStore();
      store.set(editorPanelsOpenAtom, true);
      store.set(mobileActivePanelAtom, "right");
      store.set(currentProfileAtom, {
        uri: "at://did:plc:test/moe.karashiror.klink.profile/self",
        cid: "abc123",
        value: {
          $type: "moe.karashiror.klink.profile",
          bio: "Test",
          background: { type: "color", value: "#000" },
          links: [],
        },
      });

      const { user } = renderWithProviders(
        <RightEditorPanel onSuccess={onSuccess} />,
        { store },
      );

      await user.click(screen.getByTestId("update-button"));

      expect(onSuccess).toHaveBeenCalled();
    });
  });

  describe("panel visibility states", () => {
    it("renders when panel is closed", () => {
      const store = createStore();
      store.set(editorPanelsOpenAtom, false);

      renderWithProviders(<RightEditorPanel onSuccess={onSuccess} />, { store });

      // Component should still render (just positioned off-screen)
      expect(screen.getByTestId("link-editor")).toBeInTheDocument();
    });

    it("renders when mobile panel is left", () => {
      const store = createStore();
      store.set(editorPanelsOpenAtom, true);
      store.set(mobileActivePanelAtom, "left");

      renderWithProviders(<RightEditorPanel onSuccess={onSuccess} />, { store });

      expect(screen.getByTestId("logout-button")).toBeInTheDocument();
    });
  });
});
