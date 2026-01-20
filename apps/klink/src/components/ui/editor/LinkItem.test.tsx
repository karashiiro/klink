import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { createStore, atom } from "jotai";
import { renderWithProviders } from "../../../test/test-utils";
import { LinkItem } from "./LinkItem";

// Mock useImageSource hook
vi.mock("../../../hooks/useImageSource", () => ({
  useImageSource: vi.fn(() => null),
}));

describe("LinkItem", () => {
  const createLinkAtom = (initialValue = { label: "", href: "", icon: undefined }) =>
    atom(initialValue);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("basic rendering", () => {
    it("renders label and URL inputs", () => {
      const store = createStore();
      const linkAtom = createLinkAtom();

      renderWithProviders(
        <LinkItem linkAtom={linkAtom} onRemove={vi.fn()} />,
        { store },
      );

      expect(screen.getByPlaceholderText("Label")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("URL")).toBeInTheDocument();
    });

    it("displays current label value", () => {
      const store = createStore();
      const linkAtom = createLinkAtom({ label: "My Website", href: "", icon: undefined });

      renderWithProviders(
        <LinkItem linkAtom={linkAtom} onRemove={vi.fn()} />,
        { store },
      );

      expect(screen.getByDisplayValue("My Website")).toBeInTheDocument();
    });

    it("displays current href value", () => {
      const store = createStore();
      const linkAtom = createLinkAtom({ label: "", href: "https://example.com", icon: undefined });

      renderWithProviders(
        <LinkItem linkAtom={linkAtom} onRemove={vi.fn()} />,
        { store },
      );

      expect(screen.getByDisplayValue("https://example.com")).toBeInTheDocument();
    });

    it("renders remove button", () => {
      const store = createStore();
      const linkAtom = createLinkAtom();

      renderWithProviders(
        <LinkItem linkAtom={linkAtom} onRemove={vi.fn()} />,
        { store },
      );

      expect(screen.getByRole("button", { name: "✕" })).toBeInTheDocument();
    });

    it("renders icon input section", () => {
      const store = createStore();
      const linkAtom = createLinkAtom();

      renderWithProviders(
        <LinkItem linkAtom={linkAtom} onRemove={vi.fn()} />,
        { store },
      );

      expect(screen.getByText("Icon (optional):")).toBeInTheDocument();
    });
  });

  describe("label editing", () => {
    it("updates label when changed", () => {
      const store = createStore();
      const linkAtom = createLinkAtom({ label: "", href: "", icon: undefined });

      renderWithProviders(
        <LinkItem linkAtom={linkAtom} onRemove={vi.fn()} />,
        { store },
      );

      const labelInput = screen.getByPlaceholderText("Label");
      fireEvent.change(labelInput, { target: { value: "New Label" } });

      expect(labelInput).toHaveValue("New Label");
      expect(store.get(linkAtom).label).toBe("New Label");
    });
  });

  describe("href editing", () => {
    it("updates href when changed", () => {
      const store = createStore();
      const linkAtom = createLinkAtom({ label: "", href: "", icon: undefined });

      renderWithProviders(
        <LinkItem linkAtom={linkAtom} onRemove={vi.fn()} />,
        { store },
      );

      const urlInput = screen.getByPlaceholderText("URL");
      fireEvent.change(urlInput, { target: { value: "https://newsite.com" } });

      expect(urlInput).toHaveValue("https://newsite.com");
      expect(store.get(linkAtom).href).toBe("https://newsite.com");
    });
  });

  describe("remove functionality", () => {
    it("calls onRemove when remove button clicked", async () => {
      const store = createStore();
      const linkAtom = createLinkAtom();
      const onRemove = vi.fn();

      const { user } = renderWithProviders(
        <LinkItem linkAtom={linkAtom} onRemove={onRemove} />,
        { store },
      );

      await user.click(screen.getByRole("button", { name: "✕" }));

      expect(onRemove).toHaveBeenCalled();
    });
  });

  describe("icon handling", () => {
    it("shows URL mode for icon by default", () => {
      const store = createStore();
      const linkAtom = createLinkAtom();

      renderWithProviders(
        <LinkItem linkAtom={linkAtom} onRemove={vi.fn()} />,
        { store },
      );

      // Click on the URL button for icon
      const iconSection = screen.getByText("Icon (optional):");
      expect(iconSection).toBeInTheDocument();
    });

    it("updates icon to URL type when URL entered", () => {
      const store = createStore();
      const linkAtom = createLinkAtom({ label: "Test", href: "https://test.com", icon: undefined });

      renderWithProviders(
        <LinkItem linkAtom={linkAtom} onRemove={vi.fn()} />,
        { store },
      );

      const iconUrlInput = screen.getByPlaceholderText("Icon URL");
      fireEvent.change(iconUrlInput, { target: { value: "https://icon.com/image.png" } });

      const link = store.get(linkAtom);
      expect(link.icon).toEqual({
        type: "url",
        value: "https://icon.com/image.png",
        $type: "moe.karashiiro.klink.profile#urlImage",
      });
    });

    it("clears icon when URL is emptied", () => {
      const store = createStore();
      const linkAtom = createLinkAtom({
        label: "Test",
        href: "https://test.com",
        icon: {
          $type: "moe.karashiror.klink.profile#urlImage" as const,
          type: "url" as const,
          value: "https://existing-icon.com" as `${string}:${string}`,
        },
      });

      renderWithProviders(
        <LinkItem linkAtom={linkAtom} onRemove={vi.fn()} />,
        { store },
      );

      const iconUrlInput = screen.getByPlaceholderText("Icon URL");
      fireEvent.change(iconUrlInput, { target: { value: "" } });

      const link = store.get(linkAtom);
      expect(link.icon).toBeUndefined();
    });
  });

  describe("existing blob icon", () => {
    it("indicates when existing blob icon is present", () => {
      const store = createStore();
      const linkAtom = createLinkAtom();

      renderWithProviders(
        <LinkItem
          linkAtom={linkAtom}
          onRemove={vi.fn()}
          hasExistingBlobIcon
        />,
        { store },
      );

      expect(screen.getByText(/Image uploaded/)).toBeInTheDocument();
    });

    it("calls onClearIcon when clearing existing icon", async () => {
      const store = createStore();
      const linkAtom = createLinkAtom();
      const onClearIcon = vi.fn();

      const { user } = renderWithProviders(
        <LinkItem
          linkAtom={linkAtom}
          onRemove={vi.fn()}
          hasExistingBlobIcon
          onClearIcon={onClearIcon}
        />,
        { store },
      );

      await user.click(screen.getByRole("button", { name: "Remove" }));

      expect(onClearIcon).toHaveBeenCalled();
    });
  });

  describe("edge cases", () => {
    it("handles special characters in label and URL", () => {
      const store = createStore();
      const linkAtom = createLinkAtom();

      renderWithProviders(
        <LinkItem linkAtom={linkAtom} onRemove={vi.fn()} />,
        { store },
      );

      const labelInput = screen.getByPlaceholderText("Label");
      const urlInput = screen.getByPlaceholderText("URL");

      fireEvent.change(labelInput, { target: { value: "Test & <Special> 'Chars'" } });
      fireEvent.change(urlInput, { target: { value: "https://example.com/path?q=test&foo=bar" } });

      const link = store.get(linkAtom);
      expect(link.label).toBe("Test & <Special> 'Chars'");
      expect(link.href).toBe("https://example.com/path?q=test&foo=bar");
    });

    it("handles emoji in label", () => {
      const store = createStore();
      const linkAtom = createLinkAtom();

      renderWithProviders(
        <LinkItem linkAtom={linkAtom} onRemove={vi.fn()} />,
        { store },
      );

      const labelInput = screen.getByPlaceholderText("Label");
      fireEvent.change(labelInput, { target: { value: "My Site 🚀" } });

      expect(store.get(linkAtom).label).toBe("My Site 🚀");
    });
  });
});
