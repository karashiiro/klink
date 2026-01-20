import { describe, it, expect } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { createStore } from "jotai";
import { renderWithProviders } from "../../../test/test-utils";
import { LocationInput } from "./LocationInput";
import { locationAtom, profileAtom } from "../../../atoms/profile";

describe("LocationInput", () => {
  describe("basic rendering", () => {
    it("renders with correct placeholder", () => {
      const store = createStore();

      renderWithProviders(<LocationInput />, { store });

      expect(
        screen.getByPlaceholderText("Location (optional)"),
      ).toBeInTheDocument();
    });

    it("displays current atom value", () => {
      const store = createStore();
      store.set(locationAtom, "San Francisco, CA");

      renderWithProviders(<LocationInput />, { store });

      expect(screen.getByDisplayValue("San Francisco, CA")).toBeInTheDocument();
    });

    it("displays empty string when no location set", () => {
      const store = createStore();
      store.set(locationAtom, "");

      renderWithProviders(<LocationInput />, { store });

      expect(screen.getByPlaceholderText("Location (optional)")).toHaveValue("");
    });
  });

  describe("local state behavior", () => {
    it("updates local value on change without committing to atom", () => {
      const store = createStore();
      store.set(locationAtom, "");

      renderWithProviders(<LocationInput />, { store });

      const input = screen.getByPlaceholderText("Location (optional)");
      fireEvent.change(input, { target: { value: "New York, NY" } });

      // Local value should update
      expect(input).toHaveValue("New York, NY");
      // Atom should NOT be updated yet
      expect(store.get(locationAtom)).toBe("");
    });

    it("commits value to atom on blur", () => {
      const store = createStore();
      store.set(locationAtom, "");

      renderWithProviders(<LocationInput />, { store });

      const input = screen.getByPlaceholderText("Location (optional)");
      fireEvent.change(input, { target: { value: "Seattle, WA" } });
      fireEvent.blur(input);

      // Atom should now be updated
      expect(store.get(locationAtom)).toBe("Seattle, WA");
    });
  });

  describe("external atom updates", () => {
    it("reflects external atom changes", () => {
      const store = createStore();
      store.set(locationAtom, "Initial Location");

      const { rerender } = renderWithProviders(<LocationInput />, { store });

      expect(screen.getByDisplayValue("Initial Location")).toBeInTheDocument();

      // Simulate external update
      store.set(locationAtom, "Updated Location");

      rerender(<LocationInput />);

      expect(screen.getByDisplayValue("Updated Location")).toBeInTheDocument();
    });
  });

  describe("integration with profileAtom", () => {
    it("updates profileAtom.location when committed", () => {
      const store = createStore();
      const initialProfile = store.get(profileAtom);

      renderWithProviders(<LocationInput />, { store });

      const input = screen.getByPlaceholderText("Location (optional)");
      fireEvent.change(input, { target: { value: "Tokyo, Japan" } });
      fireEvent.blur(input);

      const updatedProfile = store.get(profileAtom);
      expect(updatedProfile.location).toBe("Tokyo, Japan");
      // Other fields should be unchanged
      expect(updatedProfile.bio).toBe(initialProfile.bio);
    });
  });

  describe("edge cases", () => {
    it("handles empty string input (clearing location)", () => {
      const store = createStore();
      store.set(locationAtom, "Existing Location");

      renderWithProviders(<LocationInput />, { store });

      const input = screen.getByPlaceholderText("Location (optional)");
      fireEvent.change(input, { target: { value: "" } });
      fireEvent.blur(input);

      expect(store.get(locationAtom)).toBe("");
    });

    it("handles international characters", () => {
      const store = createStore();
      store.set(locationAtom, "");

      renderWithProviders(<LocationInput />, { store });

      const input = screen.getByPlaceholderText("Location (optional)");
      const internationalLocation = "東京, 日本 / Tokyo, Japan 🗼";
      fireEvent.change(input, { target: { value: internationalLocation } });
      fireEvent.blur(input);

      expect(store.get(locationAtom)).toBe(internationalLocation);
    });

    it("handles location with special characters", () => {
      const store = createStore();
      store.set(locationAtom, "");

      renderWithProviders(<LocationInput />, { store });

      const input = screen.getByPlaceholderText("Location (optional)");
      const specialLocation = "123 Main St. #456, Suite A-B";
      fireEvent.change(input, { target: { value: specialLocation } });
      fireEvent.blur(input);

      expect(store.get(locationAtom)).toBe(specialLocation);
    });
  });
});
