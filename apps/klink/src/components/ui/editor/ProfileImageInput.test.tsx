import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { createStore } from "jotai";
import { renderWithProviders } from "../../../test/test-utils";
import { ProfileImageInput } from "./ProfileImageInput";
import { profileAtom } from "../../../atoms/profile";

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

// Mock useImageSource hook
vi.mock("../../../hooks/useImageSource", () => ({
  useImageSource: vi.fn(() => null),
}));

describe("ProfileImageInput", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("basic rendering", () => {
    it("renders with correct label", () => {
      const store = createStore();

      renderWithProviders(<ProfileImageInput />, { store });

      expect(screen.getByText("Profile Image (optional):")).toBeInTheDocument();
    });

    it("renders URL and Upload mode buttons", () => {
      const store = createStore();

      renderWithProviders(<ProfileImageInput />, { store });

      expect(screen.getByRole("button", { name: "URL" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Upload" })).toBeInTheDocument();
    });
  });

  describe("URL mode", () => {
    it("displays current URL value", () => {
      const store = createStore();
      const profile = store.get(profileAtom);
      store.set(profileAtom, {
        ...profile,
        profileImage: {
          $type: "moe.karashiror.klink.profile#urlImage",
          type: "url",
          value: "https://example.com/avatar.jpg",
        },
      });

      renderWithProviders(<ProfileImageInput />, { store });

      expect(
        screen.getByDisplayValue("https://example.com/avatar.jpg"),
      ).toBeInTheDocument();
    });

    it("updates profileAtom with URL when URL is entered", () => {
      const store = createStore();

      renderWithProviders(<ProfileImageInput />, { store });

      const input = screen.getByPlaceholderText("Image URL");
      fireEvent.change(input, {
        target: { value: "https://newimage.com/pic.png" },
      });

      const profile = store.get(profileAtom);
      expect(profile.profileImage).toMatchObject({
        type: "url",
        value: "https://newimage.com/pic.png",
      });
      expect(profile.profileImageBlob).toBeNull();
    });

    it("clears profileImage when URL is emptied", () => {
      const store = createStore();
      const profile = store.get(profileAtom);
      store.set(profileAtom, {
        ...profile,
        profileImage: {
          $type: "moe.karashiror.klink.profile#urlImage",
          type: "url",
          value: "https://existing.com/image.jpg",
        },
      });

      renderWithProviders(<ProfileImageInput />, { store });

      const input = screen.getByDisplayValue("https://existing.com/image.jpg");
      fireEvent.change(input, { target: { value: "" } });

      const updatedProfile = store.get(profileAtom);
      expect(updatedProfile.profileImage).toBeUndefined();
    });
  });

  describe("Upload mode", () => {
    it("updates profileAtom with blob when file is uploaded", () => {
      const store = createStore();

      renderWithProviders(<ProfileImageInput />, { store });

      // Switch to upload mode
      fireEvent.click(screen.getByRole("button", { name: "Upload" }));

      // Find file input and simulate file selection
      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;
      const file = new File(["test"], "avatar.png", { type: "image/png" });

      fireEvent.change(fileInput, { target: { files: [file] } });

      const profile = store.get(profileAtom);
      expect(profile.profileImageBlob).toBe(file);
      expect(profile.profileImage).toBeUndefined();
    });

    it("shows blob preview when blob is set", () => {
      const store = createStore();
      const blob = new Blob(["test"], { type: "image/png" });
      Object.defineProperty(blob, "name", { value: "my-avatar.png" });

      const profile = store.get(profileAtom);
      store.set(profileAtom, {
        ...profile,
        profileImageBlob: blob,
        profileImage: undefined,
      });

      renderWithProviders(<ProfileImageInput />, { store });

      expect(screen.getByText("my-avatar.png")).toBeInTheDocument();
    });
  });

  describe("existing blob image", () => {
    it("shows uploaded indicator for existing blob", () => {
      const store = createStore();
      const profile = store.get(profileAtom);
      store.set(profileAtom, {
        ...profile,
        profileImage: {
          $type: "moe.karashiror.klink.profile#blobImage",
          type: "blob",
          ref: { $link: "bafytest123" },
          mimeType: "image/png",
          size: 1234,
        },
        profileImageBlob: null,
      });

      renderWithProviders(<ProfileImageInput />, { store });

      expect(screen.getByText(/Image uploaded/)).toBeInTheDocument();
    });
  });

  describe("clear functionality", () => {
    it("clears both profileImage and profileImageBlob when clear is clicked", async () => {
      const store = createStore();
      const blob = new Blob(["test"], { type: "image/png" });
      Object.defineProperty(blob, "name", { value: "avatar.png" });

      const profile = store.get(profileAtom);
      store.set(profileAtom, {
        ...profile,
        profileImageBlob: blob,
        profileImage: {
          $type: "moe.karashiror.klink.profile#urlImage",
          type: "url",
          value: "https://example.com/avatar.jpg",
        },
      });

      const { user } = renderWithProviders(<ProfileImageInput />, { store });

      await user.click(screen.getByRole("button", { name: "Clear" }));

      const updatedProfile = store.get(profileAtom);
      expect(updatedProfile.profileImage).toBeUndefined();
      expect(updatedProfile.profileImageBlob).toBeNull();
    });

    it("does not show clear button when no profile image", () => {
      const store = createStore();
      const profile = store.get(profileAtom);
      store.set(profileAtom, {
        ...profile,
        profileImage: undefined,
        profileImageBlob: null,
      });

      renderWithProviders(<ProfileImageInput />, { store });

      expect(
        screen.queryByRole("button", { name: "Clear" }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Remove" }),
      ).not.toBeInTheDocument();
    });
  });

  describe("state synchronization", () => {
    it("reflects changes to profileImageAtom", () => {
      const store = createStore();

      const { rerender } = renderWithProviders(<ProfileImageInput />, { store });

      // Initially empty
      expect(screen.getByPlaceholderText("Image URL")).toHaveValue("");

      // Update atom externally
      const profile = store.get(profileAtom);
      store.set(profileAtom, {
        ...profile,
        profileImage: {
          $type: "moe.karashiror.klink.profile#urlImage",
          type: "url",
          value: "https://new-external.com/image.png",
        },
      });

      rerender(<ProfileImageInput />);

      expect(
        screen.getByDisplayValue("https://new-external.com/image.png"),
      ).toBeInTheDocument();
    });
  });
});
