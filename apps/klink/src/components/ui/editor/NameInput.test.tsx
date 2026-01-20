import { describe, it, expect } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { createStore } from "jotai";
import { renderWithProviders } from "../../../test/test-utils";
import { NameInput } from "./NameInput";
import { nameAtom, profileAtom } from "../../../atoms/profile";

describe("NameInput", () => {
  describe("basic rendering", () => {
    it("renders with correct placeholder", () => {
      const store = createStore();

      renderWithProviders(<NameInput />, { store });

      expect(screen.getByPlaceholderText("Name (optional)")).toBeInTheDocument();
    });

    it("displays current atom value", () => {
      const store = createStore();
      store.set(nameAtom, "Test Name");

      renderWithProviders(<NameInput />, { store });

      expect(screen.getByDisplayValue("Test Name")).toBeInTheDocument();
    });

    it("displays empty string when no name set", () => {
      const store = createStore();
      store.set(nameAtom, "");

      renderWithProviders(<NameInput />, { store });

      expect(screen.getByPlaceholderText("Name (optional)")).toHaveValue("");
    });
  });

  describe("local state behavior", () => {
    it("updates local value on change without committing to atom", () => {
      const store = createStore();
      store.set(nameAtom, "");

      renderWithProviders(<NameInput />, { store });

      const input = screen.getByPlaceholderText("Name (optional)");
      fireEvent.change(input, { target: { value: "New Name" } });

      // Local value should update
      expect(input).toHaveValue("New Name");
      // Atom should NOT be updated yet
      expect(store.get(nameAtom)).toBe("");
    });

    it("commits value to atom on blur", () => {
      const store = createStore();
      store.set(nameAtom, "");

      renderWithProviders(<NameInput />, { store });

      const input = screen.getByPlaceholderText("Name (optional)");
      fireEvent.change(input, { target: { value: "Committed Name" } });
      fireEvent.blur(input);

      // Atom should now be updated
      expect(store.get(nameAtom)).toBe("Committed Name");
    });
  });

  describe("external atom updates", () => {
    it("reflects external atom changes", () => {
      const store = createStore();
      store.set(nameAtom, "Initial");

      const { rerender } = renderWithProviders(<NameInput />, { store });

      expect(screen.getByDisplayValue("Initial")).toBeInTheDocument();

      // Simulate external update (e.g., profile loaded from server)
      store.set(nameAtom, "External Update");

      rerender(<NameInput />);

      expect(screen.getByDisplayValue("External Update")).toBeInTheDocument();
    });
  });

  describe("integration with profileAtom", () => {
    it("updates profileAtom.name when committed", () => {
      const store = createStore();
      const initialProfile = store.get(profileAtom);

      renderWithProviders(<NameInput />, { store });

      const input = screen.getByPlaceholderText("Name (optional)");
      fireEvent.change(input, { target: { value: "Profile Name" } });
      fireEvent.blur(input);

      const updatedProfile = store.get(profileAtom);
      expect(updatedProfile.name).toBe("Profile Name");
      // Other fields should be unchanged
      expect(updatedProfile.bio).toBe(initialProfile.bio);
    });
  });

  describe("edge cases", () => {
    it("handles empty string input", () => {
      const store = createStore();
      store.set(nameAtom, "Existing Name");

      renderWithProviders(<NameInput />, { store });

      const input = screen.getByPlaceholderText("Name (optional)");
      fireEvent.change(input, { target: { value: "" } });
      fireEvent.blur(input);

      expect(store.get(nameAtom)).toBe("");
    });

    it("handles special characters", () => {
      const store = createStore();
      store.set(nameAtom, "");

      renderWithProviders(<NameInput />, { store });

      const input = screen.getByPlaceholderText("Name (optional)");
      const specialName = "Test <User> & 'Friends' 日本語";
      fireEvent.change(input, { target: { value: specialName } });
      fireEvent.blur(input);

      expect(store.get(nameAtom)).toBe(specialName);
    });
  });
});
