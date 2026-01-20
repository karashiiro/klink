import { describe, it, expect } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { createStore } from "jotai";
import { renderWithProviders } from "../../../test/test-utils";
import { BioInput } from "./BioInput";
import { bioAtom, profileAtom } from "../../../atoms/profile";

describe("BioInput", () => {
  describe("basic rendering", () => {
    it("renders with correct placeholder", () => {
      const store = createStore();

      renderWithProviders(<BioInput />, { store });

      expect(screen.getByPlaceholderText("Bio (required)")).toBeInTheDocument();
    });

    it("displays current atom value", () => {
      const store = createStore();
      store.set(bioAtom, "This is my bio");

      renderWithProviders(<BioInput />, { store });

      expect(screen.getByDisplayValue("This is my bio")).toBeInTheDocument();
    });

    it("displays empty string when no bio set", () => {
      const store = createStore();
      store.set(bioAtom, "");

      renderWithProviders(<BioInput />, { store });

      expect(screen.getByPlaceholderText("Bio (required)")).toHaveValue("");
    });
  });

  describe("local state behavior", () => {
    it("updates local value on change without committing to atom", () => {
      const store = createStore();
      store.set(bioAtom, "");

      renderWithProviders(<BioInput />, { store });

      const input = screen.getByPlaceholderText("Bio (required)");
      fireEvent.change(input, { target: { value: "New Bio" } });

      // Local value should update
      expect(input).toHaveValue("New Bio");
      // Atom should NOT be updated yet
      expect(store.get(bioAtom)).toBe("");
    });

    it("commits value to atom on blur", () => {
      const store = createStore();
      store.set(bioAtom, "");

      renderWithProviders(<BioInput />, { store });

      const input = screen.getByPlaceholderText("Bio (required)");
      fireEvent.change(input, { target: { value: "Committed Bio" } });
      fireEvent.blur(input);

      // Atom should now be updated
      expect(store.get(bioAtom)).toBe("Committed Bio");
    });
  });

  describe("external atom updates", () => {
    it("reflects external atom changes", () => {
      const store = createStore();
      store.set(bioAtom, "Initial Bio");

      const { rerender } = renderWithProviders(<BioInput />, { store });

      expect(screen.getByDisplayValue("Initial Bio")).toBeInTheDocument();

      // Simulate external update
      store.set(bioAtom, "Server Bio");

      rerender(<BioInput />);

      expect(screen.getByDisplayValue("Server Bio")).toBeInTheDocument();
    });
  });

  describe("integration with profileAtom", () => {
    it("updates profileAtom.bio when committed", () => {
      const store = createStore();

      renderWithProviders(<BioInput />, { store });

      const input = screen.getByPlaceholderText("Bio (required)");
      fireEvent.change(input, { target: { value: "Updated Bio" } });
      fireEvent.blur(input);

      const updatedProfile = store.get(profileAtom);
      expect(updatedProfile.bio).toBe("Updated Bio");
    });
  });

  describe("edge cases", () => {
    it("handles emojis and unicode", () => {
      const store = createStore();
      store.set(bioAtom, "");

      renderWithProviders(<BioInput />, { store });

      const input = screen.getByPlaceholderText("Bio (required)");
      const emojiBio = "Hello! 👋 I love coding 💻 and coffee ☕";
      fireEvent.change(input, { target: { value: emojiBio } });
      fireEvent.blur(input);

      expect(store.get(bioAtom)).toBe(emojiBio);
    });

    it("handles long bio text", () => {
      const store = createStore();
      store.set(bioAtom, "");

      renderWithProviders(<BioInput />, { store });

      const input = screen.getByPlaceholderText("Bio (required)");
      const longBio = "x".repeat(500);
      fireEvent.change(input, { target: { value: longBio } });
      fireEvent.blur(input);

      expect(store.get(bioAtom)).toBe(longBio);
    });
  });
});
