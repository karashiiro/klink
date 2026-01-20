import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { Provider, createStore, atom } from "jotai";
import { useProfileTextField } from "./useProfileTextField";
import type { ReactNode } from "react";

describe("useProfileTextField", () => {
  describe("basic functionality", () => {
    it("returns initial atom value", () => {
      const store = createStore();
      const testAtom = atom("");
      store.set(testAtom, "Initial Value");

      const wrapper = ({ children }: { children: ReactNode }) => (
        <Provider store={store}>{children}</Provider>
      );

      const { result } = renderHook(() => useProfileTextField(testAtom), {
        wrapper,
      });

      expect(result.current.value).toBe("Initial Value");
    });

    it("provides setValue function to update local value", () => {
      const store = createStore();
      const testAtom = atom("");
      store.set(testAtom, "Initial");

      const wrapper = ({ children }: { children: ReactNode }) => (
        <Provider store={store}>{children}</Provider>
      );

      const { result } = renderHook(() => useProfileTextField(testAtom), {
        wrapper,
      });

      act(() => {
        result.current.setValue("Updated Local");
      });

      expect(result.current.value).toBe("Updated Local");
      // Atom should not be updated yet (local state only)
      expect(store.get(testAtom)).toBe("Initial");
    });

    it("provides commitValue function to sync to atom", () => {
      const store = createStore();
      const testAtom = atom("");
      store.set(testAtom, "Initial");

      const wrapper = ({ children }: { children: ReactNode }) => (
        <Provider store={store}>{children}</Provider>
      );

      const { result } = renderHook(() => useProfileTextField(testAtom), {
        wrapper,
      });

      act(() => {
        result.current.setValue("New Value");
      });

      // Not committed yet
      expect(store.get(testAtom)).toBe("Initial");

      act(() => {
        result.current.commitValue();
      });

      // Now committed
      expect(store.get(testAtom)).toBe("New Value");
    });

    it("does not commit if value has not changed", () => {
      const store = createStore();
      const testAtom = atom("");
      store.set(testAtom, "Same Value");

      const wrapper = ({ children }: { children: ReactNode }) => (
        <Provider store={store}>{children}</Provider>
      );

      const { result } = renderHook(() => useProfileTextField(testAtom), {
        wrapper,
      });

      // Don't change the value, just commit
      act(() => {
        result.current.commitValue();
      });

      // Should still be the same (no unnecessary updates)
      expect(store.get(testAtom)).toBe("Same Value");
    });
  });

  describe("atom sync behavior", () => {
    it("syncs local value when atom value changes externally", () => {
      const store = createStore();
      const testAtom = atom("");
      store.set(testAtom, "Initial");

      const wrapper = ({ children }: { children: ReactNode }) => (
        <Provider store={store}>{children}</Provider>
      );

      const { result, rerender } = renderHook(
        () => useProfileTextField(testAtom),
        { wrapper },
      );

      expect(result.current.value).toBe("Initial");

      // Simulate external atom update (e.g., profile loaded from server)
      act(() => {
        store.set(testAtom, "Loaded from Server");
      });

      rerender();

      expect(result.current.value).toBe("Loaded from Server");
    });

    it("overwrites local changes when atom updates", () => {
      const store = createStore();
      const testAtom = atom("");
      store.set(testAtom, "Initial");

      const wrapper = ({ children }: { children: ReactNode }) => (
        <Provider store={store}>{children}</Provider>
      );

      const { result, rerender } = renderHook(
        () => useProfileTextField(testAtom),
        { wrapper },
      );

      // Make local change
      act(() => {
        result.current.setValue("Local Change");
      });

      expect(result.current.value).toBe("Local Change");

      // External update comes in
      act(() => {
        store.set(testAtom, "Server Update");
      });

      rerender();

      // Local change should be overwritten by atom sync
      expect(result.current.value).toBe("Server Update");
    });
  });

  describe("typing workflow", () => {
    it("handles typical typing workflow", () => {
      const store = createStore();
      const testAtom = atom("");
      store.set(testAtom, "");

      const wrapper = ({ children }: { children: ReactNode }) => (
        <Provider store={store}>{children}</Provider>
      );

      const { result } = renderHook(() => useProfileTextField(testAtom), {
        wrapper,
      });

      // User types character by character
      act(() => {
        result.current.setValue("H");
      });
      expect(result.current.value).toBe("H");
      expect(store.get(testAtom)).toBe(""); // Not committed

      act(() => {
        result.current.setValue("He");
      });
      act(() => {
        result.current.setValue("Hel");
      });
      act(() => {
        result.current.setValue("Hell");
      });
      act(() => {
        result.current.setValue("Hello");
      });

      expect(result.current.value).toBe("Hello");
      expect(store.get(testAtom)).toBe(""); // Still not committed

      // User blurs the field (commits)
      act(() => {
        result.current.commitValue();
      });

      expect(store.get(testAtom)).toBe("Hello");
    });

    it("handles clearing and retyping", () => {
      const store = createStore();
      const testAtom = atom("");
      store.set(testAtom, "Existing Text");

      const wrapper = ({ children }: { children: ReactNode }) => (
        <Provider store={store}>{children}</Provider>
      );

      const { result } = renderHook(() => useProfileTextField(testAtom), {
        wrapper,
      });

      // Clear the field
      act(() => {
        result.current.setValue("");
      });

      expect(result.current.value).toBe("");

      // Type new content
      act(() => {
        result.current.setValue("New Text");
      });

      // Commit
      act(() => {
        result.current.commitValue();
      });

      expect(store.get(testAtom)).toBe("New Text");
    });
  });

  describe("edge cases", () => {
    it("handles empty string values", () => {
      const store = createStore();
      const testAtom = atom("");

      const wrapper = ({ children }: { children: ReactNode }) => (
        <Provider store={store}>{children}</Provider>
      );

      const { result } = renderHook(() => useProfileTextField(testAtom), {
        wrapper,
      });

      expect(result.current.value).toBe("");

      act(() => {
        result.current.setValue("Something");
      });
      act(() => {
        result.current.commitValue();
      });

      expect(store.get(testAtom)).toBe("Something");

      act(() => {
        result.current.setValue("");
      });
      act(() => {
        result.current.commitValue();
      });

      expect(store.get(testAtom)).toBe("");
    });

    it("handles special characters", () => {
      const store = createStore();
      const testAtom = atom("");

      const wrapper = ({ children }: { children: ReactNode }) => (
        <Provider store={store}>{children}</Provider>
      );

      const { result } = renderHook(() => useProfileTextField(testAtom), {
        wrapper,
      });

      const specialText = 'Hello! 👋 Special <chars> & "quotes" 日本語';

      act(() => {
        result.current.setValue(specialText);
      });
      act(() => {
        result.current.commitValue();
      });

      expect(store.get(testAtom)).toBe(specialText);
    });

    it("handles multiline text", () => {
      const store = createStore();
      const testAtom = atom("");

      const wrapper = ({ children }: { children: ReactNode }) => (
        <Provider store={store}>{children}</Provider>
      );

      const { result } = renderHook(() => useProfileTextField(testAtom), {
        wrapper,
      });

      const multiline = "Line 1\nLine 2\nLine 3";

      act(() => {
        result.current.setValue(multiline);
      });
      act(() => {
        result.current.commitValue();
      });

      expect(store.get(testAtom)).toBe(multiline);
    });

    it("handles very long text", () => {
      const store = createStore();
      const testAtom = atom("");

      const wrapper = ({ children }: { children: ReactNode }) => (
        <Provider store={store}>{children}</Provider>
      );

      const { result } = renderHook(() => useProfileTextField(testAtom), {
        wrapper,
      });

      const longText = "x".repeat(10000);

      act(() => {
        result.current.setValue(longText);
      });
      act(() => {
        result.current.commitValue();
      });

      expect(store.get(testAtom)).toBe(longText);
    });
  });
});
